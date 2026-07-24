export default {
  "id": "inf-compute-vs-memory-bound",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Compute Bound 与 Memory Bound 判断",
  "prompt": "怎么判断模型是 Compute Bound 还是 Memory Bound？",
  "code": "# Python\ndef diagnose(flops, bytes_moved, peak_flops, peak_bw):\n    ai = flops / bytes_moved\n    knee = peak_flops / peak_bw\n    return (\"compute-bound\" if ai >= knee else \"memory-bound\", ai, knee)",
  "diagram": "AI vs 拐点:\n  AI >= 拐点 ─▶ Compute Bound ─▶ 加算力/优kernel\n  AI <  拐点 ─▶ Memory Bound ─▶ 量化/压缩/大batch\n佐证: SM占用高 vs HBM带宽占用高",
  "explanationFocus": "是什么：Compute Bound 与 Memory Bound 是刻画程序（尤其 GPU 上的矩阵/注意力计算）性能瓶颈的两类状态——前者受算力（FLOPs/s）限制，后者受显存带宽（Bytes/s）限制。判断方法核心是计算『算术强度 Arithmetic Intensity (AI) = FLOPs / Bytes』，并与硬件拐点 = 峰值算力 / 峰值带宽比较：AI 高于拐点即 Compute Bound（应加算力/更优 kernel），低于拐点即 Memory Bound（应减搬运/量化/压缩/增 batch）。两者优化方向完全相反，判错方向会白费力气。",
  "quickAnswer": "判断靠算术强度 AI = FLOPs / Bytes 对比硬件拐点（峰值算力 ÷ 峰值带宽）：AI 高于拐点 → Compute Bound，受算力限制，治法是加算力、用更快/更优 kernel、更高算力精度（FP8）、张量并行、或更大可并行矩阵（Prefill）；AI 低于拐点 → Memory Bound，受显存带宽限制，治法是减搬运（权重量化 INT8/FP8、KV Cache 量化/压缩、算子融合）与增 batch（把权重读取摊薄到多请求）。工程上再结合 nvidia-smi / Nsight 看是 SM 占用高还是 HBM 带宽占用高来佐证。",
  "beginnerSummary": "先问『到底卡在算还是搬』。搬得多算得少（像反复跑仓库取书）就是 Memory Bound，治法是少搬——压缩、量化、批量取；算得多搬得少（像埋头苦算）就是 Compute Bound，治法是换更快的笔——更强算力、更好算法。判错方向等于努力全白费：给一个被取书卡住的人换更贵的笔，他照样慢。",
  "walkthrough": "量一个 Decode 步：d=4096 的线性层，算出 FLOPs ≈ 2·d² ≈ 33.6M，需把 d²=16.7M 个参数从 HBM 搬上来（FP16 下 33.6MB）。A100 带宽 2TB/s，搬 33.6MB 要约 16.8μs；而 312 TFLOPS 算力算 33.6M FLOPs 只要 ~0.108μs——99.7% 时间在等数据，AI≈1，远低于 A100 拐点≈156 → memory-bound。再看 nvidia-smi：HBM 带宽利用率 90%+，SM 占用仅 5%，佐证。若换成 Prefill（一次算 n=512 个 token 的矩阵），AI≈512 > 拐点 → compute-bound，此时 SM 占用高、带宽空闲。",
  "approach": "用 AI 对比拐点做定性判断，再用实测 profile 佐证。具体：① 估算该 kernel 的 FLOPs 与访存字节；② 算 AI；③ 查硬件拐点（如 A100 FP16 拐点≈156 FLOPs/Byte）；④ 结论；⑤ 用 Nsight Compute / nvidia-smi 看 SM 占用 vs HBM 带宽利用率，确认判断。注意同一模型不同阶段可处不同 bound：Prefill 常 compute-bound，Decode 常 memory-bound。",
  "bruteForce": "凭感觉乱优化——比如发现慢就直接堆更多 GPU、换更高算力卡。若实际是 Memory Bound，加算力几乎无收益（带宽没提升），钱白花；反之若 Compute Bound 却去量化权重（减字节、降 AI），反而可能让本就算力受限的任务更糟。不先判断 bound 就动手，优化方向极易选反。",
  "invariant": "同一模型不同阶段可处不同 bound：Prefill（大矩阵并行）常 compute-bound，Decode（每步 1 token、反复读权重）常 memory-bound。拐点是硬件固有属性 = peak_FLOPS / peak_BW，随精度变化（FP8/INT8 抬高峰值算力使拐点右移）。无论怎么优化，优化手段都必须与 bound 类型匹配：compute→提算力，memory→减搬运/增复用。",
  "complexity": "判断本身 O(1)：只需统计一个 kernel 的 FLOPs 与访存字节做一次除法，以及查硬件规格，几乎零成本。但 Roofline 分析与 Nsight profiling 是一次性工程投入，可能花费数分钟到数小时。运行期不引入额外开销。需要注意的是，理论 AI 是静态估计，真实 kernel 因访存合并、占用率、碎片等会偏离，因此最终要以 profile 实测为准。",
  "derivation": [
    "为什么需要：两类瓶颈的优化手段相反：compute-bound 要加算力/更优 kernel，memory-bound 要减搬运/量化。若判错方向，投入的算力或量化都无效，等于白费工程资源。所以必须先有一个统一、可量化的判据再动手。",
    "怎么实现：定义 AI = 总 FLOPs / 总访存字节；硬件拐点 = 峰值算力 / 峰值带宽。AI ≥ 拐点 → 任务在算力屋顶（compute-bound），否则在带宽屋顶（memory-bound）。现场再结合 profiler：看 HBM 带宽利用率与 SM 占用率谁高，谁高即谁是被占满的瓶颈。",
    "有什么代价：判断本身廉价（一次算术），代价在误判：误判会导致选错优化路线（如 memory-bound 时加卡、compute-bound 时量化），不仅无效还可能劣化。此外纯公式 AI 是理想值，真实 kernel 受访存合并/占用率影响，需 profile 佐证，增加了少量工程成本。",
    "怎么评测：画 Roofline 图（x=AI, y=可达 FLOPs），看任务落在算力屋顶还是带宽屋顶；用 Nsight Compute 或 nvidia-smi dmon 实时读 SM 占用%（compute 高）与 drmem 带宽%（memory 高），两者中先触顶者即瓶颈。再针对性优化后复测 AI 是否越过拐点。"
  ],
  "edgeCases": [
    "小模型或超短序列：计算量极小，可能被 kernel launch 开销、调度延迟主导，AI 判据要结合实测 profile，单看公式会误导。",
    "量化后权重字节减半，AI 翻倍，模型可能从 memory-bound 转为 compute-bound，优化手段需随之切换（原本量化有效，转后该换更优 kernel）。",
    "MoE 模型：专家路由使每 token 激活专家数变化，有效计算与访存随路由动态变化，AI 不是定值，需按激活情况估算。",
    "混合精度/FP8：峰值算力抬升、拐点右移，原本 compute-bound 的任务在新硬件上可能重新落到 bandwidth 屋顶。"
  ],
  "pitfalls": [
    "只信公式不 profile：静态 AI 忽略了 kernel 效率、访存碎片、占用率，真实瓶颈可能与公式结论相反，务必用 nvidia-smi/Nsight 复核。",
    "把两个阶段用同一优化：Prefill 与 Decode 的 bound 相反，对 Decode 用『加算力』（compute 手段）无效，对 Prefill 用『量化减字节』可能反而降 AI。",
    "忽略精度对拐点的影响：FP8 下拐点右移，沿用 FP16 的拐点会误判。"
  ],
  "prerequisites": [
    "瓶颈分『算力』与『带宽』两类，优化方向互斥。",
    "硬件同时有算力上限（TFLOPS）与带宽上限（TB/s），两者比值即拐点。",
    "Arithmetic Intensity 是可定量判断 bound 的统一指标。",
    "profiling 工具（nvidia-smi / Nsight）能实测 SM 与 HBM 占用。"
  ],
  "workedExample": [
    "例 1（Decode memory-bound）：d=4096 线性层，FLOPs=33.6M，搬 33.6MB，AI≈1 < A100 拐点 156 → memory-bound → 量化权重到 INT8 让字节减半、AI 翻倍，利用率近似翻倍。",
    "例 2（Prefill compute-bound）：一次算 n=512 token 的 [n,d]×[d,d] 矩阵，FLOPs≈2·512·4096²≈1.7T，访存约 2·512·4096·2≈8.4MB 权重 + 复用，AI≈512 > 拐点 → compute-bound → 用更优大 kernel/FP8 提算力。",
    "例 3（误判代价）：对某 memory-bound 的 Decode 服务直接加 4 张卡，实测吞吐仅 +8%，因为瓶颈在单卡带宽，加卡不解决取权重问题。"
  ],
  "lineByLine": [
    "ai = flops / bytes_moved：算该任务的算术强度。",
    "knee = peak_flops / peak_bw：硬件拐点，由规格表查得。",
    "return 'compute-bound' if ai >= knee ...：高于拐点落在算力屋顶。",
    "else 'memory-bound'：低于拐点落在带宽屋顶，需量化/压缩/大 batch。"
  ],
  "codeNotes": [
    "拐点随精度变：FP8/INT8 抬高峰值算力，拐点右移，同一任务在 FP8 下可能从 compute 变 memory bound，注意精度上下文。",
    "profile 比纯公式更可靠：kernel 效率、访存合并、占用率都会让真实 AI 偏离理想值，诊断须以实测为准。",
    "bytes_moved 要算『实际搬的』包括权重与 KV Cache，不要只算权重。"
  ],
  "followUps": [
    {
      "question": "判成 Memory Bound 后第一步做什么？",
      "answer": "优先减搬运：权重量化（INT8/FP8）让每次读取字节减半；KV Cache 量化/压缩（如 INT4 KV、MQA/GQA 减 KV 头数）；算子融合减少中间激活的读写；同时用更大 batch 把一次权重读取摊薄到更多并发请求，提升有效 AI。顺序通常是先量化权重与 KV，再做算子融合，最后调大 batch。"
    },
    {
      "question": "判成 Compute Bound 后呢？",
      "answer": "提有效算力：用更快/更优的 kernel（如 FlashAttention 替代朴素注意力）、更高算力精度（FP8）、张量并行把大矩阵切到多卡并行、或制造更大可并行矩阵（更长 Prefill 序列、更大 batch 的 Prefill）以抬高 AI。也可算法层面减少冗余计算（如稀疏化、剪枝）让算力用在刀刃上。"
    },
    {
      "question": "为什么 Prefill 和 Decode 的 bound 通常相反？",
      "answer": "Prefill 一次处理 n 个输入 token，矩阵 batch 维=n，『算得多、相对搬得少』，AI 高 → compute-bound；Decode 每步只算 1 个新 token 却要读全部权重与历史 KV，『算得极少、搬得极多』，AI≈1 → memory-bound。这就是同一模型两阶段瓶颈相反的根因。"
    }
  ],
  "followUpAnswers": [
    "优先减搬运：权重量化（INT8/FP8）让每次读取字节减半；KV Cache 量化/压缩（如 INT4 KV、MQA/GQA 减 KV 头数）；算子融合减少中间激活的读写；同时用更大 batch 把一次权重读取摊薄到更多并发请求，提升有效 AI。顺序通常是先量化权重与 KV，再做算子融合，最后调大 batch。",
    "提有效算力：用更快/更优的 kernel（如 FlashAttention 替代朴素注意力）、更高算力精度（FP8）、张量并行把大矩阵切到多卡并行、或制造更大可并行矩阵（更长 Prefill 序列、更大 batch 的 Prefill）以抬高 AI。也可算法层面减少冗余计算（如稀疏化、剪枝）让算力用在刀刃上。",
    "Prefill 一次处理 n 个输入 token，矩阵 batch 维=n，『算得多、相对搬得少』，AI 高 → compute-bound；Decode 每步只算 1 个新 token 却要读全部权重与历史 KV，『算得极少、搬得极多』，AI≈1 → memory-bound。这就是同一模型两阶段瓶颈相反的根因。"
  ]
};
