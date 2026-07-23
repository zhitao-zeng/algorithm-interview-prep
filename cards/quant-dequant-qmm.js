export default {
  "kind": "concept",
  "id": "quant-dequant-qmm",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "反量化与量化矩阵乘 QMM",
  "prompt": "量化矩阵乘(QMM)是怎么在不反量化回 FP 的情况下算低精度乘法的？",
  "quickAnswer": "QMM 把 A、B 量化为整数后在整数域做矩阵乘(INT8/INT4 累加用 INT32)，最后用 scale 的乘法一次还原：C≈(Q_A·Q_B)·(s_a⊗s_b)。关键点是对齐零点、用高位累加防溢出，从而既省显存又拿到 Tensor Core 的吞吐，而不必先反量化成 FP。",
  "approach": "整数域相乘+INT32 累加，末端用 scale 还原。",
  "explanationFocus": "是什么：QMM 是在量化(整数)域内完成矩阵乘、仅最后用缩放因子还原结果的低精度算子。",
  "bruteForce": "先把权重反量化回 FP16 再普通 GEMM，享受不到低精度算力。",
  "derivation": [
    "为什么需要：反量化回 FP 既占带宽又丢算力优势，必须在整数域直接算。",
    "怎么实现：A_q=(A/s_a), B_q=(B/s_b-z_b)；C_q=A_q·B_q 累加 INT32；C=C_q·s_a·s_b + 零点项。",
    "有什么代价：需处理零点偏移项、scale 广播与 INT32 累加溢出；kernel 实现复杂。",
    "怎么评测：对比 QMM 与 FP GEMM 的数值误差(相对差)与吞吐，看加速是否合理。"
  ],
  "invariant": "C = s_a·s_b·(A_q·B_q) + 零点修正；误差仅来自量化舍入。",
  "walkthrough": "INT8 GEMM 在 Tensor Core 上比 FP16 快约 2×，C 用 INT32 累加后乘 scale 还原。",
  "edgeCases": [
    "非对称量化的零点项不可漏。",
    "INT32 累加仍可能溢出需分块。",
    "scale 形状需与维对齐广播。"
  ],
  "code": "# Python (QMM 等价)\ndef qmm(A_q, s_a, B_q, s_b, z_b=None):\n    acc = A_q.float() @ B_q.float()              # 整数(转float)累加\n    C = acc * (s_a.unsqueeze(-1) * s_b.unsqueeze(-2))\n    if z_b is not None:                           # 非对称零点修正\n        C = C + s_a.unsqueeze(-1) * (A_q.float() @ z_b.float())\n    return C",
  "codeNotes": [
    "真实 kernel 用 INT8 乘+INT32 累加, 不转 float。",
    "scale 只在外面乘一次, 不在内层。"
  ],
  "complexity": "乘加 O(m·n·k)；整数算力远高于 FP16，末端 O(m·n) 还原。",
  "followUps": [
    {
      "question": "为什么用 INT32 累加？",
      "answer": "INT8 乘积最大约 32768² 量级，累加易溢出，用 INT32 累加保中间精度、末端再缩放。"
    },
    {
      "question": "非对称量化 QMM 多什么？",
      "answer": "多一个零点项修正(与 A_q·z_b 相关)，漏掉会让结果整体偏移。"
    }
  ],
  "followUpAnswers": [
    "INT32 累加防溢出。",
    "零点项是常见坑。"
  ],
  "pitfalls": [
    "先反量化再乘，丢掉加速。",
    "漏算非对称零点项。"
  ],
  "beginnerSummary": "两个数都先改成\"整数代号+一把尺(scale)\"。乘法时直接用整数代号相乘(快)，最后只乘一次两把尺得到真实结果——不必把每个数先变回小数再算，省了一大笔\"翻译\"功夫。",
  "prerequisites": [
    "量化=整数×scale。",
    "矩阵乘可分解 scale。",
    "整数乘有硬件加速。"
  ],
  "workedExample": [
    "A_q·B_q 整数乘, 累加 INT32。",
    "C=acc·s_a·s_b 还原。"
  ],
  "lineByLine": [
    "权重/激活量化成整数。",
    "整数域矩阵乘累加。",
    "INT32 防溢出。",
    "末端乘 scale 还原。"
  ],
  "diagram": "A_q ─┐\n      ├─▶ INT积(INT32) ─▶ ×s_a×s_b ─▶ C\nB_q ─┘"
};
