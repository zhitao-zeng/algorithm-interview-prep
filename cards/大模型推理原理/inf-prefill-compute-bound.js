export default {
  "kind": "concept",
  "id": "inf-prefill-compute-bound",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Prefill 计算密集 / Decode 访存密集",
  "prompt": "为什么 Prefill 通常是计算密集型，Decode 通常是访存密集型？",
  "quickAnswer": "Prefill 同时处理 n 个 token，矩阵乘的 batch 维大、计算量远大于搬运量，Arithmetic Intensity 高 → Compute Bound；Decode 每步只算 1 个 token 却要读遍全部模型权重和越来越长的 KV Cache，搬运量远大于计算量，Arithmetic Intensity 低 → Memory Bound。",
  "approach": "阶段差异本质是 Arithmetic Intensity 差异：Prefill 高 AI（算得多），Decode 低 AI（搬得多）。",
  "explanationFocus": "是什么：Prefill 矩阵“胖”→ 计算主导；Decode 矩阵“瘦”→ 带宽主导。",
  "bruteForce": "用同一套 kernel 跑两阶段 → 任一方都达不到最优利用率。",
  "derivation": [
    "为什么需要：不同阶段硬件瓶颈不同，必须分别优化才能打满硬件。",
    "怎么实现：Prefill 用大 batch 矩阵乘（高 AI）；Decode 用权重/算子曾驻留优化与 KV 复用，减少重复读取。",
    "有什么代价：为 Decode 优化（如更高压缩、更小 KV）可能影响质量；为 Prefill 优化（大 batch）增显存峰值。",
    "怎么评测：算阶段 AI 对照硬件拐点；测 Prefill 算力利用率 vs Decode 带宽利用率。"
  ],
  "invariant": "Prefill 的 FLOPs/Byte 随 prompt 长度上升；Decode 的 FLOPs/Byte 固定偏低（≈ d²/HBM带宽）。",
  "walkthrough": "n 个 token 的 QKV 投影是 (n,d)×(d,d) 大矩阵乘，算力摊到大量数据上；Decode 是 (1,d)×(d,d)，算出 d² 却要先把 d² 权重从 HBM 搬上来。",
  "edgeCases": [
    "极短 prompt：Prefill 也偏访存。",
    "极大模型：Decode 读权重代价剧增，带宽更吃紧。",
    "投机解码：Decode 一次验证多 token，抬高 AI。"
  ],
  "code": "# Python\ndef arithmetic_intensity(flops, bytes_moved):\n    return flops / bytes_moved   # 越高越 compute-bound\n\ndef prefill_ai(n, d):\n    flops = 2 * n * d * d\n    moved = 2 * d * d            # 权重只读一次, 摊到 n 个 token\n    return flops / moved         # ≈ n, 随 n 增大\n\ndef decode_ai(d):\n    flops = 2 * 1 * d * d\n    moved = 2 * d * d            # 每步仍要读全权重\n    return flops / moved         # = 1, 很低",
  "codeNotes": [
    "硬件有“拐点”AI（算力/带宽比），高于它才算得赢搬。",
    "Decode 的 AI≈1，远低于拐点 → 一直在等显存。"
  ],
  "complexity": "Prefill AI ∝ n；Decode AI 为常数（≈1），与 n 无关。",
  "followUps": [
    {
      "question": "算力利用率低就一定不好吗？",
      "answer": "对 Decode 是结构性的——单 token 计算天生少。优化方向不是提高算力利用率，而是减少每次要搬的数据（量化权重、压缩 KV、更大 batch）。"
    },
    {
      "question": "有没有让 Decode 也 compute-bound 的办法？",
      "answer": "投机解码/并行验证、Medusa 多头、更大微批都能在每步塞入更多有效计算，抬高 AI，但收益有限且引入额外复杂度。"
    }
  ],
  "followUpAnswers": [
    "Decode 优化主抓带宽而非算力。",
    "用 micro-batch 把多请求拼成“胖”矩阵。"
  ],
  "pitfalls": [
    "用算力利用率低就判定“没优化好”。",
    "把 Prefill 的最优 kernel 直接套 Decode。"
  ],
  "beginnerSummary": "读题时你同时看 32 个字，计算量大划算；答题时你每次只写一个字，却要把整本书（模型权重）从书架（显存）搬到桌上（算力），搬的比算的多得多。前者是“算得猛”，后者是“搬得慢”——所以答题阶段卡在搬书上，不在算题上。",
  "prerequisites": [
    "Prefill 一次处理很多 token。",
    "Decode 一次只出 1 个 token。",
    "显存有带宽上限，搬数据要时间。"
  ],
  "workedExample": [
    "Prefill(n=32,d=4096)：AI≈32，远高于拐点 → 算力吃满。",
    "Decode(d=4096)：AI≈1，远低于拐点 → 卡在带宽。"
  ],
  "lineByLine": [
    "Prefill 矩阵 batch 维=n，AI 高。",
    "Decode 矩阵 batch 维=1，AI 低。",
    "AI 高于硬件拐点 → Compute Bound。",
    "AI 低于拐点 → Memory Bound。"
  ],
  "diagram": "Prefill: (n,d)x(d,d) 大矩阵 → 算力吃满 (Compute Bound)\nDecode : (1,d)x(d,d) 小矩阵 → 等权重搬运 (Memory Bound)"
};
