export default {
  "kind": "concept",
  "id": "quant-w4a16-equivalence",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "W4A16 的等价性",
  "prompt": "W4A16 为什么常说\"等价\"于某种计算，权重 4 位激活 16 位意味着什么？",
  "quickAnswer": "W4A16 指权重存为 INT4、激活保持 BF16/FP16。其\"等价性\"指：计算时权重可反量化回 16 位再与激活做普通 GEMM，数学结果等价于 FP16 权重(仅差量化舍入)；也可在整数域算后乘 scale 还原。它只压权重显存、激活不压，故最省显存且对精度最友好，是 LLM 部署性价比首选。",
  "approach": "权重离线 INT4，激活留 16 位，按需 dequant 再乘。",
  "explanationFocus": "是什么：W4A16 是权重 4 位、激活 16 位的混合配置，强调\"权重可等价反量化参与 FP16 计算\"。",
  "bruteForce": "权重激活都 INT4，精度损失大。",
  "derivation": [
    "为什么需要：权重占显存大头且较耐量化，激活敏感；只压权重即得大部分收益且保精度。",
    "怎么实现：权重 per-group INT4 存储；推理时 dequant 到 16 位与激活乘，或用 QMM 整数算后还原。",
    "有什么代价：dequant 有开销；需高效 INT4 存储/反量化 kernel 才能既省显存又快。",
    "怎么评测：对比 W4A16 与 FP16 显存与精度，看是否近无损且可服务更大模型。"
  ],
  "invariant": "W4A16 显存≈FP16 的 1/4(仅权重)；激活精度无损。",
  "walkthrough": "70B FP16 需 140GB；W4A16 权重约 35GB，单卡 80GB 可装下并近无损推理。",
  "edgeCases": [
    "dequant 开销侵蚀速度需好 kernel。",
    "极敏感层可在 W4A16 上再混合留高精度。",
    "group 大小影响等价精度。"
  ],
  "code": "# Python (W4A16 推理)\ndef w4a16_forward(x_bf16, w_q_int4, scales):\n    w = dequant_int4(w_q_int4, scales).bfloat16()  # 权重反量化回16位\n    return x_bf16 @ w                               # 普通 BF16 GEMM",
  "codeNotes": [
    "W4A16 也可整数域算再乘 scale, 等价。",
    "group 缩放保证反量化后近无损。"
  ],
  "complexity": "存储省 4×；计算退化为 BF16 GEMM + 反量化 O(参数)。",
  "followUps": [
    {
      "question": "W4A16 和 W8A8 怎么选？",
      "answer": "要最大省显存选 W4A16；要算力加速(整数 GEMM)选 W8A8；常先 W4A16 保精度再按需 W8A8。"
    },
    {
      "question": "反量化会不会很慢？",
      "answer": "好的 kernel 把 dequant 融合进 GEMM，开销很小；否则确实成为瓶颈。"
    }
  ],
  "followUpAnswers": [
    "W4A16 省显存首选。",
    "dequant 需融合 kernel。"
  ],
  "pitfalls": [
    "以为 W4A16 也加速计算(主要省显存)。",
    "dequant 未融合导致慢。"
  ],
  "beginnerSummary": "W4A16 像把厚厚的词典(权重)缩印成小册子(INT4)省地方，用的时候摊开还原成原样(反量化)再查——内容基本不变，只是携带轻便了；而\"查询笔记\"(激活)仍用原版不缩印，保证查得准。",
  "prerequisites": [
    "权重占显存大头。",
    "激活较敏感。",
    "反量化可还原权重。"
  ],
  "workedExample": [
    "70B: FP16 140GB → W4A16 35GB。",
    "权重 INT4 + 激活 BF16。"
  ],
  "lineByLine": [
    "权重 per-group INT4 存储。",
    "推理时反量化回 16 位。",
    "与 16 位激活做 GEMM。",
    "或整数域算后乘 scale。"
  ],
  "diagram": "权重 INT4 ─▶ dequant ─┐\n激活 BF16 ───────────┴─▶ GEMM (近无损)"
};
