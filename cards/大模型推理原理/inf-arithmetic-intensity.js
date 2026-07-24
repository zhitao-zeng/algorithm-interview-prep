export default {
  "kind": "concept",
  "id": "inf-arithmetic-intensity",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Arithmetic Intensity",
  "prompt": "Arithmetic Intensity 是什么？",
  "quickAnswer": "Arithmetic Intensity(AI)=每次内存访问所对应的浮点运算数，即 FLOPs / Bytes（常用单位 FLOPs/Byte）。它衡量“算得多还是搬得多”。AI 高于硬件拐点（算力/带宽）为 Compute Bound，低于则为 Memory Bound。是判断推理瓶颈的核心指标。",
  "approach": "AI = FLOPs / Bytes；对照硬件拐点判断 compute vs memory bound。",
  "explanationFocus": "是什么：Arithmetic Intensity 是“每搬 1 字节数据能做多少运算”，反映计算与访存之比。",
  "bruteForce": "只盯 FLOPs 总量 → 无法区分是算力瓶颈还是带宽瓶颈。",
  "derivation": [
    "为什么需要：同样 FLOPs 的任务，搬数据多少不同，瓶颈完全不同，必须有个统一判据。",
    "怎么实现：AI = 总 FLOPs / 总访存字节；硬件拐点为 peak_FLOPS / peak_BW。",
    "有什么代价：AI 只给静态判据，动态调度/kernel 效率仍会影响实测；长短序列 AI 不同。",
    "怎么评测：画 Roofline 图（x=AI, y= attainable FLOPS），看任务落在算力屋顶还是带宽屋顶。"
  ],
  "invariant": "硬件拐点 = peak_FLOPS / peak_BW；AI 高于它 compute-bound，低于它 memory-bound。",
  "walkthrough": "A100：312 TFLOPS(FP16) / 2 TB/s → 拐点≈156 FLOPs/Byte。Decode 的 AI≈1，远低于拐点 → memory-bound。",
  "edgeCases": [
    "FP8/INT8 提高有效算力也提拐点 → 同等 AI 更易 compute-bound。",
    "长序列注意力 AI 随 n 升（更多复用）。",
    "算子融合可降访存、抬 AI。"
  ],
  "code": "# Python\ndef arithmetic_intensity(flops, bytes_moved):\n    return flops / bytes_moved\n\ndef roofline_verdict(ai, peak_flops, peak_bw):\n    knee = peak_flops / peak_bw          # 硬件拐点\n    return \"compute-bound\" if ai >= knee else \"memory-bound\"",
  "codeNotes": [
    "低精度(INT8/FP8)抬高峰值算力，拐点右移。",
    "Decode AI≈1，几乎必落带宽屋顶。"
  ],
  "complexity": "计算 O(1) 指标；Roofline 分析为可视化手段。",
  "followUps": [
    {
      "question": "怎么提高 Arithmetic Intensity？",
      "answer": "减少重复访存：算子融合、权重/激活量化减字节、KV 压缩；或增加每步有效计算：更大 batch、投机解码、更长可并行序列(Prefill)。"
    },
    {
      "question": "低精度为什么有时不加速？",
      "answer": "若没有对应高效低精度 kernel，仍要 dequant→算→quant，访存没省且多一步，AI 没实质提升，INT4 也可能“更小但不更快”。"
    }
  ],
  "followUpAnswers": [
    "算子融合是最直接的 AI 提升手段。",
    "量化要配套高性能 kernel 才有效。"
  ],
  "pitfalls": [
    "只看 FLOPs 忽略访存。",
    "以为低精度自动加速（缺 kernel 则不然）。"
  ],
  "beginnerSummary": "Arithmetic Intensity 像“性价比”：每从仓库搬 1 单位资料，你能完成多少计算？搬很多却算很少（性价比低）→ 你卡在取资料（Memory Bound）；算很多只搬一点（性价比高）→ 你卡在自己算得慢（Compute Bound）。硬件有个“拐点”，超过它才算得赢搬。",
  "prerequisites": [
    "任务既要计算也要搬数据。",
    "硬件有算力上限和带宽上限。",
    "瓶颈取决于“算/搬”比。"
  ],
  "workedExample": [
    "A100 拐点≈156 FLOPs/Byte；Decode AI≈1 → memory-bound。",
    "Prefill(n=512) AI≈512 → 远超拐点 → compute-bound。"
  ],
  "lineByLine": [
    "AI = FLOPs / Bytes。",
    "硬件拐点 = 峰值算力 / 峰值带宽。",
    "AI 高于拐点 → Compute Bound。",
    "AI 低于拐点 → Memory Bound。"
  ],
  "diagram": "Roofline:\n 算力屋顶 ────────────╲\n                        ╲ 拐点(=算力/带宽)\n 带宽屋顶 ╲─────────────╲\n x=AI(FLOPs/Byte) →\n Decode 在左(带宽屋顶), Prefill 在右(算力屋顶)"
};
