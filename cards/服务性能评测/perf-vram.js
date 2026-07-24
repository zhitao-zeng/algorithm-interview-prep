export default {
  "kind": "concept",
  "id": "perf-vram",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "显存占用评测",
  "prompt": "如何评测大模型推理服务的显存占用，主要被什么吃掉？",
  "quickAnswer": "显存主要由模型权重、KV Cache、激活与临时缓冲占用。评测需分项测算：权重≈参数量×精度字节(如 fp16 为 2B)；KV Cache≈2×层数×batch×seq×hidden×dtype 字节(因 K、V 各一套)；并在不同 batch/seq 组合下实测峰值，作为并发与上下文上限依据。长上下文+高并发时 KV 往往主导显存，需要用 PagedAttention 或量化等技术缓解，否则极易 OOM。",
  "approach": "分项估算 + 实测峰值：先按公式分别估算权重与 KV 显存，再用 torch 的 reserved/allocated 或 nvidia-smi 配合压测观察真实峰值，定位是权重先撞墙还是 KV 先撞墙，据此决定量化权重还是限制 batch/seq。必要时引入 PagedAttention 消除碎片、或量化 KV/权重来腾空间。",
  "explanationFocus": "是什么：显存占用评测是量化大模型推理服务中\"显存被什么吃掉\"并测量峰值的过程，主要分项包括模型权重、KV Cache、激活与临时缓冲。通过分项估算加实测峰值，判断在给定显存下能开多大 batch 与多长上下文，是容量规划与成本估算的基础，也是决定能否上线的硬指标。",
  "bruteForce": "最朴素只报模型权重大小(如\"7B 模型占 14GB\")，完全忽略 KV Cache 随 batch×seq 线性膨胀。实际部署中，哪怕权重只占 14GB，16 并发、4k 上下文的 KV 就可能吃掉 64GB，导致能扛的并发远小于预期、上线即 OOM。只算权重是典型的容量规划踩坑。",
  "derivation": [
    "为什么需要：显存是推理服务的首要硬约束，直接决定最大并发数与最大上下文长度，进而决定吞吐与成本。若不量化各部分显存，就无法做容量规划，要么资源浪费要么上线 OOM。",
    "怎么实现：分项公式：权重=参数量×dtype 字节；KV=2×n_layers×batch×seq_len×hidden×dtype_bytes(2 来自 K 与 V)。再用 nvidia-smi / CUDA 分配接口 / torch 的 allocated 在压测中测峰值，覆盖最大 batch 与最大 seq 配置。",
    "有什么代价：长上下文与高并发让 KV 主导显存，估算必须覆盖最极端配置才有意义；激活随 micro-batch 波动，难以精确预估，需留余量。碎片会导致\"总够但分配失败\"，需分页管理。",
    "怎么评测：在 max batch 与 max seq 下压测，记录分配峰值与安全余量(如 10%~15%)；对比不同 batch/seq 的峰值曲线，找到显存拐点；验证量化(权重 int4/int8、KV int8)带来的下降幅度是否达标。"
  ],
  "invariant": "总显存 ≈ 权重 + KV_Cache(batch,seq) + 激活；KV 随 batch×seq 线性增长，是可变主项，也是长上下文/高并发下的瓶颈来源。权重部分只随参数量与精度变化，与序列长度无关——这个划分是显存规划的核心。",
  "walkthrough": "以 7B fp16 为例：权重≈7e9×2B≈14GB。若 batch=16、seq=4096、32 层、hidden=4096，KV≈2×32×16×4096×4096×2B≈64GB，远超权重的 14GB，此时必须上 PagedAttention 或降 batch/seq。量化到 int4 后权重降到约 3.5GB，但 KV 仍随 batch×seq 增长。实测时应在最大 batch 与最大 seq 下压测，记录分配峰值与安全余量(如留 10%~15%)，否则遇碎片或激活峰值即翻车。",
  "edgeCases": [
    "显存碎片：总量够但连续块不足，分配失败；需 PagedAttention 按块管理消除碎片。",
    "精度差异：fp16 与量化(int8/int4)权重显存差数倍，估算时必须按实际部署精度。",
    "激活随 micro-batch/序列波动，峰值可能在特定输入组合下突增。",
    "多卡切分时每卡权重/KV 分摊方式不同(TP/PP)，需按并行策略重算。"
  ],
  "code": "# Python\ndef kv_bytes(n_layers, batch, seq, hidden, dtype_b=2):\n    return 2 * n_layers * batch * seq * hidden * dtype_b   # KV 总字节\ndef weight_bytes(params, dtype_b=2):\n    return params * dtype_b                                # 权重字节",
  "codeNotes": [
    "KV 的因子 2 来自 K 与 V 两套缓存，每套都要存。",
    "量化(权重 int4、KV int8)能大幅降显存，但需配套低位 kernel 才有真实收益。",
    "dtype_b 用 2 表示 fp16/bf16，4 表示 fp32，1 表示 int8，0.5 表示 int4(按字节折算)。"
  ],
  "complexity": "分项估算是 O(1) 的闭式计算；实测峰值需跑压测、耗时 O(压测时长)。真正瓶颈在 KV 的 O(batch×seq) 增长，工程上常用 PagedAttention 把 KV 按块管理来消除碎片、提升有效容量，从而在不加显存的前提下撑起更大并发。",
  "followUps": [
    {
      "question": "PagedAttention 解决什么？",
      "answer": "它把 KV Cache 按固定大小的块(page)管理，像操作系统虚拟内存一样按需分配、消除外部碎片，并允许不同序列共享相同前缀块(如相同 system prompt)。这样有效 batch 容量大幅提升，原本因碎片或峰值估算保守而浪费的显存被充分利用，是 vLLM 等高性能推理引擎的核心，能显著抬高可服务并发。"
    },
    {
      "question": "为什么长上下文更怕显存？",
      "answer": "因为 KV Cache 大小与序列长度成正比(每多一个 token 就多一份 K/V)，而权重显存与序列无关。短上下文时权重是主因，长上下文(如 32k/128k)时 KV 会线性膨胀成显存杀手，远超权重。所以长上下文部署的瓶颈在 KV，而不是权重——这也解释了为何要优先量化 KV 或用 PagedAttention 来扛长上下文。"
    }
  ],
  "followUpAnswers": [
    "它把 KV Cache 按固定大小的块(page)管理，像操作系统虚拟内存一样按需分配、消除外部碎片，并允许不同序列共享相同前缀块(如相同 system prompt)。这样有效 batch 容量大幅提升，原本因碎片或峰值估算保守而浪费的显存被充分利用，是 vLLM 等高性能推理引擎的核心，能显著抬高可服务并发。",
    "因为 KV Cache 大小与序列长度成正比(每多一个 token 就多一份 K/V)，而权重显存与序列无关。短上下文时权重是主因，长上下文(如 32k/128k)时 KV 会线性膨胀成显存杀手，远超权重。所以长上下文部署的瓶颈在 KV，而不是权重——这也解释了为何要优先量化 KV 或用 PagedAttention 来扛长上下文。"
  ],
  "pitfalls": [
    "只算权重忽略 KV Cache，导致对可扛并发/上下文严重高估，上线 OOM。",
    "直接用理论估算值不留安全余量，遇碎片或激活峰值即翻车。",
    "忽略精度选择(fp16 vs int4)对权重显存的几倍差异。"
  ],
  "beginnerSummary": "把显存想成冰箱：模型权重像一台固定大小的冰箱本体(买来多大就占多少)；KV Cache 像里面越放越满的食材——来的人(batch)越多、点的菜(seq)越长，食材就越占地方，甚至可能溢出；激活像临时翻动的空间波动。算容量得把\"本身体积\"和\"会膨胀的存货\"都算上，并留点余量(如 10%~15%)，否则塞爆就 OOM。",
  "prerequisites": [
    "KV Cache 概念：理解注意力缓存随序列与 batch 增长。",
    "fp16/int8/int4 精度字节数：2/1/0.5 字节，是显存估算的基本单位。",
    "batch 与 seq 对显存的影响：KV 随二者乘积线性增长。",
    "基本压测与监控(nvidia-smi / torch 分配接口)手段。"
  ],
  "workedExample": [
    "7B fp16 权重≈14GB；在 batch=16、seq=4096、32 层、hidden=4096 下 KV≈64GB，远超权重。",
    "量化权重到 int4 后约 3.5GB，但 KV 仍随 batch×seq 增长，长上下文仍是瓶颈。",
    "int8 KV 在 32k 上下文下可把 16GB 降到 8GB，直接延长可服务上下文长度。"
  ],
  "lineByLine": [
    "kv_bytes：按 2×n_layers×batch×seq×hidden×dtype_b 计算 KV 总字节，2 来自 K/V 两套。",
    "weight_bytes：参数量 × dtype 字节，得到权重固定显存。",
    "两者相加并补激活/余量，得到总显存预算。",
    "实测时用 torch 的 allocated/reserved 或 nvidia-smi 在压测峰值校验估算值，确认留有安全余量。"
  ],
  "diagram": "显存 = 权重(固定)\n        + KV Cache(batch×seq, 膨胀)\n        + 激活(波动)\n        ───────────▶ 峰值"
};
