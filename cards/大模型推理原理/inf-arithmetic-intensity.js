export default {
  "id": "inf-arithmetic-intensity",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Arithmetic Intensity",
  "prompt": "Arithmetic Intensity 是什么？",
  "code": "# Python\ndef arithmetic_intensity(flops, bytes_moved):\n    return flops / bytes_moved\n\ndef roofline_verdict(ai, peak_flops, peak_bw):\n    knee = peak_flops / peak_bw          # 硬件拐点\n    return \"compute-bound\" if ai >= knee else \"memory-bound\"",
  "diagram": "Roofline:\n 算力屋顶 ────────────╲\n                        ╲ 拐点(=算力/带宽)\n 带宽屋顶 ╲─────────────╲\n x=AI(FLOPs/Byte) →\n Decode 在左(带宽屋顶), Prefill 在右(算力屋顶)",
  "explanationFocus": "是什么：Arithmetic Intensity（AI，算术强度）= 每次内存访问所对应的浮点运算数 = FLOPs / Bytes（单位 FLOPs/Byte）。它衡量一个任务是『算得多还是搬得多』。AI 高于硬件拐点（峰值算力 ÷ 峰值带宽）即 Compute Bound，低于即 Memory Bound。它是判断 GPU 推理/计算瓶颈的核心、统一指标。",
  "quickAnswer": "Arithmetic Intensity = FLOPs / Bytes（每搬 1 字节能做多少运算）。对照硬件拐点 = 峰值算力 / 峰值带宽：AI 高于拐点 → Compute Bound（受算力限制，加算力/更优 kernel）；低于 → Memory Bound（受带宽限制，量化/压缩/大 batch）。是判断推理瓶颈的核心指标，配合 Roofline 图使用。",
  "beginnerSummary": "Arithmetic Intensity 像『性价比』：每从仓库搬 1 单位资料，你能完成多少计算？搬很多却算很少（性价比低）→ 卡在取资料（Memory Bound）；算很多只搬一点（性价比高）→ 卡在自己算得慢（Compute Bound）。硬件有个『拐点』，超过它才算得赢搬。Decode 的性价比极低（≈1），几乎必在带宽屋顶。",
  "walkthrough": "A100：FP16 峰值 312 TFLOPS、HBM 带宽 2 TB/s → 拐点 ≈ 312/2 = 156 FLOPs/Byte。Decode 一个 d=4096 线性层：FLOPs=33.6M，搬 33.6MB → AI≈1，远低于 156 → memory-bound。Prefill 一次算 n=512 token 的矩阵：FLOPs≈1.7T，有效 AI≈512，远超拐点 → compute-bound。同模型两阶段因 AI 不同而处不同屋顶。",
  "approach": "AI = FLOPs / Bytes；对照硬件拐点判断 compute vs memory bound。先估算 kernel 的 FLOPs 与访存字节（含权重+激活+KV），算 AI，查硬件规格得拐点，下结论；再用 Roofline 图（x=AI, y=可达 FLOPs）直观确认落在带宽屋顶还是算力屋顶。",
  "bruteForce": "只盯 FLOPs 总量——比如看到『这个任务有 1 TFLOPs』就以为算力瓶颈，却忽略了它要搬 2GB 数据（AI=0.5，实是 memory-bound）。只看 FLOPs 无法区分算/搬，必然误判优化方向。",
  "invariant": "硬件拐点 = peak_FLOPS / peak_BW，是硬件固有属性；AI 高于它 compute-bound，低于它 memory-bound。拐点和 AI 都随精度变化（FP8/INT8 抬升算力也抬拐点）。同一任务在不同精度下可能跨越拐点切换 bound。",
  "complexity": "计算 AI 本身是 O(1)（一次除法），Roofline 是可视化手段、一次性分析。但真实 AI 是理想值：kernel 的访存合并、占用率、寄存器溢出、碎片化都会让实测可达 FLOPs 低于理论，故 AI 只给静态判据，最终要以 Nsight profile 实测为准。长短序列 AI 不同（注意力随 n 升），应分 kernel 估算。",
  "derivation": [
    "为什么需要：同样 FLOPs 的任务，搬数据多少可能天差地别，瓶颈完全不同——光看 FLOPs 总量会误判。需要统一指标把『算』和『搬』放在同一量纲比较，这就是 AI 的动机。",
    "怎么实现：AI = 总 FLOPs / 总访存字节（含权重、激活、KV Cache 实际搬运量）；硬件拐点 = peak_FLOPS / peak_BW（查规格表）。把任务 AI 与拐点比较：≥拐点落在算力屋顶，<拐点落在带宽屋顶。",
    "有什么代价：AI 是静态、理想判据，忽略 kernel 效率（访存合并、占用率、碎片），实测可能偏离；长短序列 AI 不同，要分 kernel 估算。此外低精度抬升拐点，沿用旧精度拐点会误判。代价仅是分析需结合 profile，不算高。",
    "怎么评测：画 Roofline 图：x 轴 AI（log），y 轴可达 FLOPs；画两条屋顶线——水平算力屋顶（peak FLOPS）与斜线带宽屋顶（peak_BW × AI），交点即拐点。把任务点标上，落在左下方带宽屋顶即 memory-bound，右上方算力屋顶即 compute-bound。再用 Nsight 实测 SM/HBM 占用确认。"
  ],
  "edgeCases": [
    "FP8/INT8 提高有效算力也抬拐点（peak_FLOPS 升），同等 AI 更易落 compute-bound，量化未必加速（需配套 kernel）。",
    "长序列注意力 AI 随 n 升（更多复用、O(n²) 计算摊到权重搬运上），长 prompt 时反而可能从 memory 转 compute。",
    "算子融合可降访存、抬 AI（减少中间激活的读写），是把 memory-bound kernel 往右推的常用手段。",
    "MoE 每 token 激活专家数变化，有效 FLOPs/Byte 动态，AI 非定值。"
  ],
  "pitfalls": [
    "只看 FLOPs 忽略访存：以为算得多就是算力瓶颈，实则 AI 低、被带宽卡住。",
    "以为低精度自动加速：若无对应高效低精度 kernel，仍 dequant→算→quant，访存没省且多一步，AI 没实质提升，INT4 也可能『更小但不更快』。",
    "用错精度下的拐点：FP8 拐点比 FP16 高，沿用 FP16 拐点会误判为 compute-bound。"
  ],
  "prerequisites": [
    "任务既要计算也要搬数据（权重/激活/KV 从 HBM 到片上）。",
    "硬件同时有算力上限（TFLOPS）与带宽上限（TB/s），比值即拐点。",
    "瓶颈取决于『算/搬』比，AI 是统一量纲。",
    "Roofline 模型能把 compute/memory bound 可视化。"
  ],
  "workedExample": [
    "例 1（A100 拐点）：312 TFLOPS / 2 TB/s ≈ 156 FLOPs/Byte；Decode AI≈1 → memory-bound，Prefill(n=512) AI≈512 → compute-bound。",
    "例 2（H100 FP8）：算力 ~1979 TFLOPS、带宽 3.35 TB/s → 拐点≈590；同样 Decode AI≈1 仍 memory-bound，但 Prefill 在 FP8 下更易 compute-bound。",
    "例 3（算子融合抬 AI）：把 LayerNorm+矩阵乘融合，省一次激活读写，AI 从 2 升到约 3，更远离带宽屋顶。"
  ],
  "lineByLine": [
    "AI = FLOPs / Bytes：核心定义，算每字节对应的运算量。",
    "knee = peak_flops / peak_bw：硬件拐点，由规格表查得。",
    "return 'compute-bound' if ai >= knee ...：高于拐点落在算力屋顶。",
    "else 'memory-bound'：低于拐点落在带宽屋顶，需量化/压缩/大 batch。"
  ],
  "codeNotes": [
    "低精度(INT8/FP8)抬高峰值算力，拐点右移，同任务在新精度下可能跨拐点切换 bound，注意精度上下文。",
    "Decode AI≈1，几乎必落带宽屋顶——这是 Decode 慢的根因定量表达。",
    "bytes_moved 要算真实搬运（权重+激活+KV），漏算 KV 会高估 AI、误判。"
  ],
  "followUps": [
    {
      "question": "怎么提高 Arithmetic Intensity？",
      "answer": "减少重复访存或增加每步有效计算两类：① 减字节——算子融合（省中间激活读写）、权重/激活量化（INT8/FP8 减半字节）、KV 压缩；② 增计算——更大 batch（把权重读取摊到多请求）、投机解码（一次验证多 token）、更长可并行序列（Prefill 大矩阵）。算子融合是最直接、无精度损失的 AI 提升手段。"
    },
    {
      "question": "低精度为什么有时不加速？",
      "answer": "若没有对应高效低精度 kernel（如 FP8 Tensor Core），仍要 dequant→用 fp16 算→quant，访存没省且多一步，AI 没实质提升，INT4 也可能『更小但不更快』。量化要配套高性能 kernel 才能把字节减半、AI 翻倍真正兑现；否则只是省显存、没提速，甚至更慢。"
    },
    {
      "question": "Roofline 图怎么看？",
      "answer": "x 轴是 AI（FLOPs/Byte，常取对数），y 轴是可达 FLOPs。画水平线=峰值算力屋顶，斜线 y=带宽×AI=带宽屋顶，两线交点即拐点。把任务按其实测 AI 标上点：在斜线下方（左）即 memory-bound，在水平线下方（右）即 compute-bound。点在哪条屋顶下就被哪条限制。"
    }
  ],
  "followUpAnswers": [
    "减少重复访存或增加每步有效计算两类：① 减字节——算子融合（省中间激活读写）、权重/激活量化（INT8/FP8 减半字节）、KV 压缩；② 增计算——更大 batch（把权重读取摊到多请求）、投机解码（一次验证多 token）、更长可并行序列（Prefill 大矩阵）。算子融合是最直接、无精度损失的 AI 提升手段。",
    "若没有对应高效低精度 kernel（如 FP8 Tensor Core），仍要 dequant→用 fp16 算→quant，访存没省且多一步，AI 没实质提升，INT4 也可能『更小但不更快』。量化要配套高性能 kernel 才能把字节减半、AI 翻倍真正兑现；否则只是省显存、没提速，甚至更慢。",
    "x 轴是 AI（FLOPs/Byte，常取对数），y 轴是可达 FLOPs。画水平线=峰值算力屋顶，斜线 y=带宽×AI=带宽屋顶，两线交点即拐点。把任务按其实测 AI 标上点：在斜线下方（左）即 memory-bound，在水平线下方（右）即 compute-bound。点在哪条屋顶下就被哪条限制。"
  ]
};
