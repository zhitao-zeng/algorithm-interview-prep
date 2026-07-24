export default {
  "kind": "concept",
  "id": "inf-prefill-compute-bound",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Prefill 计算密集 / Decode 访存密集",
  "prompt": "为什么 Prefill 通常是计算密集型，Decode 通常是访存密集型？",
  "quickAnswer": "Prefill 同时处理 n 个 token，矩阵乘的 batch 维大、计算量远大于搬运量，算术强度高 → Compute Bound，典型如 n=4096、d=4096 时 AI≈n=4096，远高于硬件拐点（A100 fp16 约 150 量级）。Decode 每步只算 1 个 token 却要读遍全部模型权重（如 7B/FP16≈14GB）和不断增长的 KV Cache，搬运量远大于计算量，算术强度低（AI≈1）→ Memory Bound。因此在 Decode 上继续堆算力利用率意义不大，优化重心应放在降低每次搬运的数据量（量化、KV 压缩、更大微批）。两阶段 kernel 设计与并行策略都应分别优化，套用同一套实现任一方都打不满硬件。",
  "approach": "阶段差异本质是算术强度（Arithmetic Intensity = FLOPs/Byte）差异：Prefill 高 AI（算得多、权重被 n 次复用），Decode 低 AI（搬得多、权重每步重读）。优化策略应沿 AI 分叉：Prefill 继续提升 batch 与张量/流水并行打满算力；Decode 引入权重量化、KV Cache 压缩、算子融合以降搬运，并用连续批处理（continuous batching）把多个请求拼成更大微批抬高 AI。评测时分别看 Prefill 的算力利用率（MFU）与 Decode 的带宽利用率（HBM 利用率），而不是用单一吞吐指标掩盖某一方空闲。",
  "explanationFocus": "是什么：Prefill 阶段一次性把整段 prompt 的 n 个 token 同时送进注意力与矩阵乘，有效矩阵在 batch 维（n 行）上“变胖”，每个权重元素被复用 n 次，算术强度（FLOPs/Byte）随 n 上升，属于计算密集型（Compute Bound）。Decode 阶段每次只生成 1 个新 token，参与矩阵乘的有效 batch 维恒为 1，却仍要把全部模型权重（数十 GB）和不断增长的 KV Cache 从显存搬到计算单元，算术强度被压到接近常数 1，属于访存密集型（Memory Bound）。一句话：Prefill 是“算得多”，Decode 是“搬得多”，瓶颈维度完全不同，优化抓手也完全不同。",
  "bruteForce": "用同一套 kernel（如一个通用 GEMM）跑两阶段：Prefill 因 AI 高会被固定分块策略拖累、显存峰值高；Decode 因 batch=1 的“瘦”矩阵完全喂不饱 GPU，kernel occupancy 低、大量 SM 闲置。结果是任一方都达不到最优利用率——实测同一 kernel 下 prefill 算力利用率可能从 70% 掉到 30%，decode 带宽利用率更低。更糟的是若用 prefill 的大 batch 配置直接套 decode，会因 KV 激增而 OOM。",
  "derivation": [
    "为什么需要：GPU 等加速器是两个独立瓶颈的机器——算力上限（TFLOPS）与显存带宽上限（TB/s）。Prefill 与 Decode 把 token 喂给矩阵乘的方式截然不同，导致同一硬件上卡住的瓶颈维度不同；若不分别优化，至少一方利用率极低、整体吞吐上不去，必须在系统设计上把两阶段当两种负载对待。",
    "怎么实现：Prefill 用大 batch 矩阵乘（高 AI）并配合张量/流水并行打满算力；Decode 用权重/算子常驻优化、KV Cache 复用（PagedAttention）、权重量化与更小精度搬运来减少重复读取，并用连续批处理把多个请求拼成“胖”微批抬高 AI。实现上还可分离两阶段调度队列（如 vLLM 的 chunked prefill、Orca 的连续批）。",
    "有什么代价：为 Decode 优化（如更高压缩、更小 KV、量化）可能牺牲一点精度或增加实现复杂度；为 Prefill 优化（大 batch、长序列分块）会抬高显存峰值与调度延迟。两套 kernel/调度也增加工程维护成本，需要在“利用率提升”与“工程质量”间权衡。",
    "怎么评测：算各阶段算术强度并对照硬件拐点（峰值算力/峰值带宽）；分别测 Prefill 算力利用率（MFU）与 Decode 带宽利用率（HBM 利用率），再结合端到端 TTFT 与 TPS。理想状态是两阶段各自接近其瓶颈上限，而非用统一指标掩盖一方空闲。"
  ],
  "invariant": "Prefill 的 FLOPs/Byte 随 prompt 长度上升（AI∝n）；Decode 的 FLOPs/Byte 固定偏低（≈ d²/ HBM带宽，典型≈1）。只要隐藏维 d 与权重精度不变，Decode 的 AI 是常量，不随输出长度变化——这是 Decode 结构性受带宽约束的根本原因，也是“decode 优化主抓带宽而非算力”的依据。",
  "walkthrough": "以 seq=4096、d=4096、batch=32 为例：Prefill 的有效矩阵是 (batch×seq, d)×(d,d) = (131072,4096)×(4096,4096)，算力摊到海量数据上，AI≈seq≈4096，远超 A100 拐点（~150），GPU 算力几乎吃满（A100 实测 prefill 算力利用率可达 60%+）。Decode 每步矩阵是 (batch, d)×(d,d)=(32,4096)×(4096,4096)，算出 32×4096²≈5.4e11 FLOPs，却要为这 32 个请求各搬一遍约 14GB 权重+KV，总搬运≈32×(14GB+KV)，AI≈1。在并发 100 请求、输出长度 512 的场景，Decode 阶段 p99 延迟主要由“等权重从 HBM 搬到 SRAM”决定，而非计算；这也解释了为何小 batch decode 优化常选权重量化、PagedAttention 减 KV 碎片。",
  "edgeCases": [
    "极短 prompt（n=1~2）：Prefill 也偏访存，AI 低，此时两阶段瓶颈接近，统一 kernel 损失不大。",
    "超大模型（如 70B/FP16≈140GB）：Decode 每步要读 140GB 权重，即便 batch 大，HBM 带宽仍是硬墙，必须使用张量并行把权重切开到多卡。",
    "投机解码/并行验证：Decode 一次验证 k 个 token，等效把 batch 维从 1 抬到 k，AI 上升，Decode 偏向更 compute-bound，但验证树与拒绝采样带来额外开销。",
    "长上下文（seq=128k）：Prefill 虽 AI 高，但 KV Cache 巨大导致显存峰值爆炸，需 chunked prefill 分块以避免 OOM。"
  ],
  "code": "# Python\ndef arithmetic_intensity(flops, bytes_moved):\n    return flops / bytes_moved   # 越高越 compute-bound\n\ndef prefill_ai(n, d):\n    flops = 2 * n * d * d\n    moved = 2 * d * d            # 权重只读一次, 摊到 n 个 token\n    return flops / moved         # ≈ n, 随 n 增大\n\ndef decode_ai(d):\n    flops = 2 * 1 * d * d\n    moved = 2 * d * d            # 每步仍要读全权重\n    return flops / moved         # = 1, 很低",
  "codeNotes": [
    "硬件有“拐点”AI（峰值算力/峰值带宽）：高于它才算得赢搬（Compute Bound），低于它就在等显存（Memory Bound），A100 fp16 约 150 量级、H100 约 300 量级。",
    "Decode 的 AI≈1，远低于拐点 → 一直在等显存；这也是为何 decode 优化主抓“少搬”（量化、KV 压缩）而非“多算”。",
    "代码里的 moved 只算权重一次，是 Prefill 摊薄效应的理想化；真实还要算 KV Cache 与激活的搬运，长输出时 KV 搬运占比会上升。"
  ],
  "complexity": "Prefill AI ∝ n（prompt 长度），随序列增长算力越来越划算；Decode AI 为常数（≈1），与 n/输出长度无关。整段生成的端到端成本：Prefill 部分 ∝ n·d²，Decode 部分 ∝ L·d²（L 为输出长度）且每次还需搬权重，当 L 较大时 Decode 的搬运总量（L×权重）可能超过 Prefill 计算量，成为总耗时主导；这也解释了长输出场景为何 decode 阶段常占大头。",
  "followUps": [
    {
      "question": "算力利用率低就一定不好吗？",
      "answer": "对 Decode 是结构性的——单 token 计算天生少（batch 维=1），再大的模型每步也只产出有限 FLOPs，硬挤算力利用率无意义。优化方向不是提高算力利用率，而是减少每次要搬的数据（权重量化如 INT8/FP8、KV Cache 压缩、页式管理减碎片、用更大微批把多请求拼成“胖”矩阵抬高 AI）。换句话说，Decode 的 KPI 是“每字节带宽产出的 token 数”，而非 MFU。"
    },
    {
      "question": "有没有让 Decode 也 compute-bound 的办法？",
      "answer": "有，但收益有限且带复杂度：① 投机解码/Medusa 多头并行验证多个 token，把等效 batch 维从 1 抬到 k；② 连续批处理把并发请求拼成大微批，让一次矩阵乘服务数十请求；③ 长输出时用张量并行分摊权重读取。它们本质都是“抬高每步的有效 AI”，但引入验证树、调度与内存开销，且当 KV 极长时仍被带宽卡住，不能从根本上消除 Memory Bound。"
    }
  ],
  "followUpAnswers": [
    "对 Decode 是结构性的——单 token 计算天生少（batch 维=1），再大的模型每步也只产出有限 FLOPs，硬挤算力利用率无意义。优化方向不是提高算力利用率，而是减少每次要搬的数据（权重量化如 INT8/FP8、KV Cache 压缩、页式管理减碎片、用更大微批把多请求拼成“胖”矩阵抬高 AI）。换句话说，Decode 的 KPI 是“每字节带宽产出的 token 数”，而非 MFU。",
    "有，但收益有限且带复杂度：① 投机解码/Medusa 多头并行验证多个 token，把等效 batch 维从 1 抬到 k；② 连续批处理把并发请求拼成大微批，让一次矩阵乘服务数十请求；③ 长输出时用张量并行分摊权重读取。它们本质都是“抬高每步的有效 AI”，但引入验证树、调度与内存开销，且当 KV 极长时仍被带宽卡住，不能从根本上消除 Memory Bound。"
  ],
  "pitfalls": [
    "用“算力利用率低”一票否决 Decode 性能：这是 Memory Bound 的固有属性，不是没优化好。",
    "把 Prefill 的大 batch/长序列 kernel 直接套 Decode：batch=1 的瘦矩阵喂不饱 SM，且 KV 激增易 OOM。",
    "只看平均延迟忽略 Decode 带宽墙：decode 受 HBM 带宽硬约束，加 batch 到一定程度延迟陡升而吞吐不再涨。"
  ],
  "beginnerSummary": "想象答题：读题阶段你一次性把 32 道题（prompt）铺在桌上同时算，笔（算力）动得飞快、算得多，划算——这是 Prefill，算得猛。答题阶段你每次只写一个字，却要把整本书（模型权重，几十 GB）从书架（显存 HBM）搬到桌上（算力 SRAM），搬的比算的多得多，于是卡在“搬书”上——这是 Decode，搬得慢。所以答题阶段瓶颈在带宽不在算力；你给它再快的笔也没用，得想办法把书变薄（量化权重）、别重复搬（KV 复用）、或者一次多答几份卷子（微批）才省时间。前者是“算得猛”，后者是“搬得慢”。",
  "prerequisites": [
    "Prefill 一次处理整段 prompt 的 n 个 token，Decode 一次只出 1 个新 token。",
    "GPU 有算力上限（TFLOPS）与显存带宽上限（TB/s）两个独立瓶颈，二者之比决定“硬件拐点”。",
    "算术强度（Arithmetic Intensity = FLOPs/Byte）概念：高于拐点则 Compute Bound，低于则 Memory Bound。",
    "KV Cache 在 Decode 阶段随输出增长持续变大，是 Decode 搬运量的重要组成。"
  ],
  "workedExample": [
    "Prefill(seq=4096, d=4096)：有效矩阵 (4096,4096)×(4096,4096)，AI≈4096，远超 A100 拐点~150 → 算力吃满（Compute Bound）。",
    "Decode(d=4096)：每步矩阵 (1,4096)×(4096,4096)，AI≈1，远低于拐点 → 卡在 HBM 带宽（Memory Bound）；batch=32 微批把 14GB 权重的读取摊到 32 请求上，等效 AI≈32 仍偏低。"
  ],
  "lineByLine": [
    "Prefill 矩阵 batch 维=n（如 4096），每个权重被 n 个 token 复用，AI 高。",
    "Decode 矩阵 batch 维=1，权重每步重新从 HBM 搬到 SRAM，AI 低。",
    "AI = FLOPs/Byte：高于硬件拐点（峰值算力/峰值带宽）→ Compute Bound。",
    "AI 低于拐点 → Memory Bound，延迟由“等权重搬运”而非“计算”决定。",
    "代码 prefill_ai 返回 2*n*d*d/(2*d*d)=n，decode_ai 返回 2*1*d*d/(2*d*d)=1，直接量化两者差距。"
  ],
  "diagram": "Prefill: (n,d)x(d,d) 大矩阵 → 算力吃满 (Compute Bound)\nDecode : (1,d)x(d,d) 小矩阵 → 等权重搬运 (Memory Bound)"
};
