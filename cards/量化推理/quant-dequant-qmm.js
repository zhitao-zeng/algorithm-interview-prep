export default {
  "kind": "concept",
  "id": "quant-dequant-qmm",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "反量化与量化矩阵乘 QMM",
  "prompt": "量化矩阵乘(QMM)是怎么在不反量化回 FP 的情况下算低精度乘法的？",
  "quickAnswer": "QMM 先把 A、B 量化成整数，在整数域做矩阵乘（INT8/INT4 乘积用 INT32 累加），最后用 scale 的乘法一次还原：C ≈ (Q_A·Q_B)·(s_a⊗s_b) + 零点项。关键点是对齐零点偏移、用高位累加防溢出，从而既省显存又拿到 Tensor Core 吞吐，而不必先反量化成 FP 再乘。非对称量化别忘了零点修正项，否则结果整体偏移。",
  "approach": "整数域相乘 + INT32 累加，末端用 scale 还原；非对称量化补零点项。核心公式：C = s_a·s_b·(A_q·B_q) + 零点修正，误差仅来自量化舍入。",
  "explanationFocus": "是什么：QMM（量化矩阵乘）是在量化（整数）域内完成矩阵乘、仅最后用缩放因子 scale 一次性还原结果的低精度算子。它不把权重/激活反量化回 FP 再算，而是直接用整数做乘加、用高位（INT32）累加防溢出，从而既省显存带宽又拿到 Tensor Core 的整数算力。",
  "bruteForce": "先把权重反量化回 FP16 再普通 GEMM：享受不到低精度算力，还多了反量化开销，等于白量化。常见于\"量化了模型却没用 QMM kernel\"的部署错误。",
  "derivation": [
    "为什么需要：反量化回 FP 既占带宽（要搬回 FP 权重）又丢算力优势（走 FP kernel），必须在整数域直接算才能两全。",
    "怎么实现：A_q=(A/s_a)、B_q=(B/s_b−z_b)；C_q=A_q·B_q 在整数域累加 INT32；C = C_q·s_a·s_b + 零点项（与 A_q·z_b 相关）。",
    "有什么代价：需处理非对称量化的零点偏移项、scale 的广播形状对齐、INT32 累加仍可能溢出需分块；kernel 实现比普通 GEMM 复杂不少。",
    "怎么评测：对比 QMM 与 FP GEMM 的数值误差（相对差，应 < 1%）与吞吐，验证加速是否合理且精度可接受。"
  ],
  "invariant": "C = s_a·s_b·(A_q·B_q) + 零点修正；误差仅来自量化舍入，不来自计算路径。非对称量化必须满足零点项，否则结果系统性偏移。",
  "walkthrough": "INT8 GEMM 在 Tensor Core 上比 FP16 快约 2×。具体：A_q(INT8 128×4096) 与 B_q(INT8 4096×4096) 做整数乘加，中间用 INT32 累加（防 INT8×INT8 溢出），得到 acc 后乘 s_a⊗s_b 还原。一次乘 scale 而非每个元素乘，开销极小；全程不出现 FP16 反量化，带宽省一半。",
  "edgeCases": [
    "非对称量化的零点项不可漏：漏掉会让结果整体偏移一个常数，隐蔽且易误判为\"精度下降\"。",
    "INT32 累加仍可能溢出需分块：超大 k 维下 INT32 中间和可能爆，需按块累加。",
    "scale 形状需与维对齐广播：per-channel 与 per-tensor 的 s_a/s_b 形状不同，广播错则结果错。",
    "混合精度（INT4 权重 × INT8 激活）：kernel 需支持不同位宽相乘。"
  ],
  "code": "# Python (QMM 等价)\ndef qmm(A_q, s_a, B_q, s_b, z_b=None):\n    acc = A_q.float() @ B_q.float()              # 整数(转float)累加\n    C = acc * (s_a.unsqueeze(-1) * s_b.unsqueeze(-2))\n    if z_b is not None:                           # 非对称零点修正\n        C = C + s_a.unsqueeze(-1) * (A_q.float() @ z_b.float())\n    return C",
  "codeNotes": [
    "真实 kernel 用 INT8 乘 + INT32 累加，不转 float：示例转 float 只为示意，生产要走硬件指令。",
    "scale 只在外面乘一次，不在内层：这是 QMM 省算力的关键——内层全是整数。",
    "非对称量化务必处理 z_b，否则结果整体偏移。"
  ],
  "complexity": "乘加 O(m·n·k)；整数算力远高于 FP16，末端还原仅 O(m·n) 一次 scale 乘法。瓶颈在能否吃满 Tensor Core 的 mma 形状与是否有配套低精度 kernel，而非还原开销。",
  "followUps": [
    {
      "question": "为什么用 INT32 累加？",
      "answer": "INT8 乘积每个元素最大约 127×127=16129，但矩阵乘要沿 k 维累加成千上万个这样的乘积，中间和极易超过 INT8/INT16 的表示范围而溢出。用 INT32 累加能在不损失中间精度的情况下承住大和，最后再统一乘 scale 缩放还原。若强行用 INT8 累加，溢出会直接毁掉结果；用 INT16 在较大 k 维下仍不够。"
    },
    {
      "question": "非对称量化 QMM 多什么？",
      "answer": "多一个零点项（zero-point）修正。非对称量化里 B_q = round(B/s_b) + z_b，展开矩阵乘会多出 A_q·z_b 这一项（以及常数），漏掉会让结果整体偏移一个与 A_q、z_b 相关的常数，看起来像\"精度变差\"实则公式不全。对称量化（z=0）则没有这一项，计算更简单。因此写 QMM kernel 时必须先判断对称/非对称。"
    }
  ],
  "followUpAnswers": [
    "INT8 乘积每个元素最大约 127×127=16129，但矩阵乘要沿 k 维累加成千上万个这样的乘积，中间和极易超过 INT8/INT16 的表示范围而溢出。用 INT32 累加能在不损失中间精度的情况下承住大和，最后再统一乘 scale 缩放还原。若强行用 INT8 累加，溢出会直接毁掉结果；用 INT16 在较大 k 维下仍不够。",
    "多一个零点项（zero-point）修正。非对称量化里 B_q = round(B/s_b) + z_b，展开矩阵乘会多出 A_q·z_b 这一项（以及常数），漏掉会让结果整体偏移一个与 A_q、z_b 相关的常数，看起来像\"精度变差\"实则公式不全。对称量化（z=0）则没有这一项，计算更简单。因此写 QMM kernel 时必须先判断对称/非对称。"
  ],
  "pitfalls": [
    "先反量化再乘，丢掉加速：权重回 FP 后走 FP kernel，带宽与算力收益归零。",
    "漏算非对称零点项：非对称量化（如权重 INT8 asymmetric）忘了 −z_b 项，结果系统性偏。",
    "scale 广播形状弄错，导致维度不匹配或数值错误。"
  ],
  "beginnerSummary": "两个数都先改成\"整数代号 + 一把尺（scale）\"。乘法时直接用整数代号相乘（快、有硬件加速），最后只乘一次两把尺得到真实结果——不必把每个数先变回小数再算，省了一大笔\"翻译\"功夫。就像批发：货物标成整数代号在仓库里快速搬运（整数乘），出库时按尺子换算成真实重量（乘 scale），而不是每件都先拆包称重再搬。",
  "prerequisites": [
    "量化 = 整数 × scale（+ 零点）：理解 Q = round(X/s) + z 及其还原公式。",
    "矩阵乘可分解 scale：理解 (A/s_a)·(B/s_b) = (A·B)/(s_a s_b)，scale 可提到外层。",
    "整数乘有硬件加速：Tensor Core 的 IMMA 指令做 INT8/INT4 乘加，算力高于 FP。"
  ],
  "workedExample": [
    "A_q·B_q 整数乘，INT32 累加：128×4096 × 4096×4096，全程整数域，比 FP16 快约 2×。",
    "C = acc·s_a·s_b 还原：末端一次乘 scale，开销 O(mn)，误差 < 1%。",
    "非对称情形：补 A_q·z_b 项后结果偏移消失，与 FP 参考对齐。"
  ],
  "lineByLine": [
    "权重/激活量化成整数：A_q、B_q 为 INT8/INT4，s_a、s_b、z_b 为对应 scale 与零点。",
    "整数域矩阵乘累加：A_q.float()@B_q.float() 在示例里转 float 仅为可读性，真实 kernel 用 INT8×INT8→INT32。",
    "INT32 防溢出：乘积最大约 127²，累加 k 次需 INT32 承住中间和。",
    "末端乘 scale 还原：乘 s_a⊗s_b（含广播）得真实 C；非对称再补零点项。"
  ],
  "diagram": "A_q ─┐\n      ├─▶ INT积(INT32) ─▶ ×s_a×s_b ─▶ C\nB_q ─┘"
};
