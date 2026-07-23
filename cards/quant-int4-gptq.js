export default {
  "kind": "concept",
  "id": "quant-int4-gptq",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "INT4 与 GPTQ 原理",
  "prompt": "GPTQ 是怎么在 INT4 下做权重量化的，核心思想是什么？",
  "quickAnswer": "GPTQ 是逐层、逐列的二阶(海森)感知量化：每次量化一个权重列，并用近似逆海森把该行量化造成的误差补偿到同组未量化权重上(OBQ 思路)，从而在 INT4 下保持高精度。它只需一小批校准数据，无需重训。",
  "approach": "按列顺序量化，用海森逆补偿残差到剩余列。",
  "explanationFocus": "是什么：GPTQ 是用二阶信息做\"量化+误差补偿\"的一次性权重量化算法，主打 INT4 近无损。",
  "bruteForce": "RTN(四舍五入)逐元素量化，INT4 下误差无补偿，易崩。",
  "derivation": [
    "为什么需要：INT4 只有 16 个码点，RTN 直接量化误差大、掉点严重，需要利用权重间相关性补偿。",
    "怎么实现：对每层按列量化；量化某列后用 (H^{-1}·err) 把误差按逆海森投影到其余列权重上，迭代直至全列量化。",
    "有什么代价：需计算/近似每层海森(用校准数据的一阶梯度外积)，计算量比 RTN 大很多，但仍是一次性离线。",
    "怎么评测：同校准/测试集比较 GPTQ INT4 与 FP16 的困惑度差，看是否近无损。"
  ],
  "invariant": "补偿量正比于 err·(H^{-1}列)，使量化后输出尽量不变。",
  "walkthrough": "65B 模型 GPTQ INT4 困惑度相比 FP16 仅升约 0.1，而 RTN INT4 可能升数点。",
  "edgeCases": [
    "校准数据太少，海森估计不准。",
    "激活 outlier 仍存在，GPTQ 只管权重。",
    "分组(group)大小影响海森块与精度。"
  ],
  "code": "# Python (GPTQ 核心伪代码, 单列)\ndef gptq_column(W_col, H_inv, bits=4):\n    qmin, qmax = -(2**(bits-1)), 2**(bits-1)-1\n    scale = W_col.abs().max() / qmax\n    w_q = (W_col / scale).round().clamp(qmin, qmax)\n    err = (w_q - W_col) * scale               # 本列量化误差\n    comp = H_inv @ err                         # 逆海森投影\n    return w_q, comp                           # comp 补偿到同组其余权重",
  "codeNotes": [
    "真实 GPTQ 按块(block)处理并用 Cholesky 分解稳定 H_inv。",
    "补偿让剩余列\"吸收\"当前列误差, 保持层输出。"
  ],
  "complexity": "每层 O(d^3) 海森求逆主导(可近似/分块)，整体一次性离线。",
  "followUps": [
    {
      "question": "GPTQ 和 RTN 差在哪？",
      "answer": "RTN 只四舍五入不补偿；GPTQ 用逆海森把误差补偿到同组其他权重，因此 INT4 更稳。"
    },
    {
      "question": "GPTQ 量化后还要配什么？",
      "answer": "仍需高效 INT4 dequant/GEMM kernel(如 EXL2/marlin)才能拿到真实加速，否则只是省显存。"
    }
  ],
  "followUpAnswers": [
    "误差补偿是 GPTQ 的灵魂。",
    "需配套低位 kernel 才有速度。"
  ],
  "pitfalls": [
    "以为 GPTQ 解决了激活 outlier(它只管权重)。",
    "校准集与推理分布差导致海森失真。"
  ],
  "beginnerSummary": "RTN 像给每格单独四舍五入，错就错了。GPTQ 更聪明：量化某一列时，它看整张表(二阶信息)，把这一列\"四舍五入\"产生的误差顺手抹平到旁边还没量化的列上，于是整层输出几乎不变。",
  "prerequisites": [
    "INT4 只有 16 个码点。",
    "RTN 直接量化误差大。",
    "知道海森(二阶导)反映参数敏感度。"
  ],
  "workedExample": [
    "INT4 码点 [-8..7]，scale=max/7。",
    "量化列误差 err 经 H^{-1} 补偿到其余列。"
  ],
  "lineByLine": [
    "取一层权重与近似海森。",
    "按列顺序量化。",
    "算该列量化误差。",
    "逆海森把误差补偿到剩余列。"
  ],
  "diagram": "W 列: [w1 w2 w3 ...]\n量化 w1→ 误差 err\n  └─ H^{-1}·err ─▶ 补偿 w2,w3...  (整层输出≈不变)"
};
