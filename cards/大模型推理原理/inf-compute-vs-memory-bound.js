export default {
  "kind": "concept",
  "id": "inf-compute-vs-memory-bound",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Compute Bound 与 Memory Bound 判断",
  "prompt": "怎么判断模型是 Compute Bound 还是 Memory Bound？",
  "quickAnswer": "算 Arithmetic Intensity = FLOPs/Bytes，和硬件拐点（峰值算力÷峰值带宽）比较：AI 高于拐点 → Compute Bound（受算力限制，应加算力/用更快 kernel）；AI 低于拐点 → Memory Bound（受显存带宽限制，应减搬运/量化/压缩/增 batch）。结合 nvidia-smi 看是 SM 占用高还是 HBM 带宽占用高。",
  "approach": "用 AI 对比拐点定性；用实测带宽/SM 占用佐证。",
  "explanationFocus": "是什么：判断瓶颈在“算得慢”还是“搬得慢”，决定优化方向完全相反。",
  "bruteForce": "凭感觉乱优化（memory-bound 时加算力）→ 无效投入。",
  "derivation": [
    "为什么需要：两类瓶颈的优化手段相反，判错方向会白费力。",
    "怎么实现：算任务 AI，对比硬件拐点；现场看 HBM 带宽利用率 vs SM 占用。",
    "有什么代价：判断本身廉价；但误判会导致选错优化（如加卡 vs 量化）。",
    "怎么评测：Roofline 图 + profiling（Nsight/nvidia-smi）定位热点 kernel。"
  ],
  "invariant": "同一模型不同阶段可处不同 bound：Prefill 常 compute-bound，Decode 常 memory-bound。",
  "walkthrough": "量一个 Decode 步：算出 FLOPs 与搬的字节 → AI≈1；A100 拐点≈156 → memory-bound；再看 nvidia-smi 带宽占用高、SM 低 → 佐证。",
  "edgeCases": [
    "小模型/短序列：可能被 launch 开销或算力主导，判据要结合实际 profile。",
    "量化后：字节减半，AI 翻倍，可能从 memory 转 compute bound。",
    "MoE：专家路由使有效计算随激活专家变化，AI 动态。"
  ],
  "code": "# Python\ndef diagnose(flops, bytes_moved, peak_flops, peak_bw):\n    ai = flops / bytes_moved\n    knee = peak_flops / peak_bw\n    return (\"compute-bound\" if ai >= knee else \"memory-bound\", ai, knee)",
  "codeNotes": [
    "拐点随精度变：FP8/INT8 抬高峰值算力 → 拐点右移。",
    "profile 比纯公式更可靠（kernel 效率、碎片也会影响）。"
  ],
  "complexity": "O(1) 计算；profiling 为一次性分析。",
  "followUps": [
    {
      "question": "判成 Memory Bound 后第一步做什么？",
      "answer": "减搬运：权重量化(INT8/FP8)、KV Cache 量化/压缩、算子融合；同时用更大 batch 把权重读取摊薄到多请求。"
    },
    {
      "question": "判成 Compute Bound 后呢？",
      "answer": "提有效算力：用更快/更优 kernel、更高算力精度(FP8)、张量并行摊算、或更大矩阵(更长可并行序列/Prefill)提高 AI。"
    }
  ],
  "followUpAnswers": [
    "Memory Bound → 量化+压缩 KV+大 batch。",
    "Compute Bound → 更优 kernel+张量并行。"
  ],
  "pitfalls": [
    "只信公式不 profile，忽视 kernel 开销。",
    "两个阶段用同一优化，方向可能错。"
  ],
  "beginnerSummary": "先问“到底卡在算还是搬”。搬得多算得少（像反复跑仓库取书）→ 治法是少搬（压缩/量化/批量取）；算得多搬得少（像埋头苦算）→ 治法是换更快的笔（更强算力/更好算法）。判错方向，努力全白费。",
  "prerequisites": [
    "瓶颈分“算力”和“带宽”两类。",
    "两者优化手段相反。",
    "AI 与硬件拐点可定量判断。"
  ],
  "workedExample": [
    "Decode AI≈1 < 拐点156 → memory-bound → 量化权重。",
    "Prefill AI≈512 > 拐点 → compute-bound → 更优大 kernel。"
  ],
  "lineByLine": [
    "算 AI = FLOPs / Bytes。",
    "算硬件拐点 = 峰值算力 / 带宽。",
    "AI≥拐点 → Compute Bound。",
    "AI<拐点 → Memory Bound（量化/压缩/大 batch）。"
  ],
  "diagram": "AI vs 拐点:\n  AI >= 拐点 ─▶ Compute Bound ─▶ 加算力/优kernel\n  AI <  拐点 ─▶ Memory Bound ─▶ 量化/压缩/大batch\n佐证: SM占用高 vs HBM带宽占用高"
};
