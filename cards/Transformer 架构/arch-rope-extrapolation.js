export default {
  "kind": "concept",
  "id": "arch-rope-extrapolation",
  "category": "Transformer 架构",
  "difficulty": "Hard",
  "title": "RoPE 高频/低频维度外推问题",
  "prompt": "RoPE 在长度外推时高频与低频维度分别出现什么问题，怎么缓解？",
  "quickAnswer": "高频维（小 i）对位置过敏感、易超出训练角度周期；低频维（大 i）区分度不足；可用调 base/NTK 缩放缓解。",
  "approach": "分析 θ_i=base^{−2(i−1)/d}：i 小→θ 大→高频，位置变化引起大角度旋转；外推时高频过早绕回。",
  "explanationFocus": "是什么：RoPE 各 2D 子空间基频 θ_i 随维度 i 递减，低维（小 i）对应高频、对位置变化极敏感，高维（大 i）对应低频、变化缓慢；长度外推时高频维率先『绕回』造成歧义，是外推失败主因之一。",
  "bruteForce": "直接用训练长度内的 base=10000 去推更长序列，高频维角度 m·θ_i 远超 2π，位置信息混叠。",
  "derivation": [
    "为什么需要：训练长度 L_train 内高频维角度范围有限，外推到 L>L_train 后高频维角度溢出周期，相对位置不再唯一。",
    "怎么实现：NTK-aware 缩放或增大 base，使高频维频率下降、低频维略微上升，重分配『频率预算』。",
    "有什么代价：改 base 需与已训权重兼容处理（位置插值/缩放），否则要微调；纯推理缩放可能略损短程。",
    "怎么评测：在 >L_train 的困惑度与长程检索任务上对比 base 调整前后的表现。"
  ],
  "invariant": "不变量：旋转角 = 位置 × 基频；外推失败等价于『高频维角度超出可区分周期』，增大 base 等效降低所有 θ_i。",
  "walkthrough": "d=4096,base=10000：θ_1≈1，位置 1000 时角度 1000rad 已绕多圈；把 base 调大到 100000，θ_1 变小，外推到 32k 仍不混叠。",
  "edgeCases": [
    "仅调 base 不配合位置插值，仍可能需少量微调。",
    "NTK-aware 缩放对不同维施加不同缩放率，比统一调 base 更细。",
    "训练时若已用大 base，短序列上可能轻微欠拟合。"
  ],
  "code": "def rope_freqs(dim, base, max_pos):\n    import math\n    half = dim // 2\n    inv = [base ** (-2*i/dim) for i in range(half)]\n    # 高频维(i小)角度随位置增长最快\n    ang_at_max = [max_pos * inv[i] for i in range(half)]\n    return inv, ang_at_max",
  "codeNotes": [
    "inv[0] 最大（高频），inv[half-1] 最小（低频）。",
    "外推关注 ang_at_max[0] 是否远超 2π。"
  ],
  "complexity": "频率计算 O(d)；外推缓解为超参调整，不增加推理计算。",
  "followUps": [
    {
      "question": "NTK-aware 缩放与直接调 base 区别？",
      "answer": "NTK 对不同维用不同缩放率（高频多降、低频少动），比全局调 base 更平滑，外推更稳。"
    },
    {
      "question": "为什么低频维也要动？",
      "answer": "单纯压高频会让低频维相对占比上升、近距区分度下降，需轻微上抬低频以平衡。"
    }
  ],
  "followUpAnswers": [
    "NTK 对不同维用不同缩放率（高频多降、低频少动），比全局调 base 更平滑，外推更稳。",
    "单纯压高频会让低频维相对占比上升、近距区分度下降，需轻微上抬低频以平衡。"
  ],
  "pitfalls": [
    "以为调大 base 一定无代价——会改变训练期位置分布。",
    "混淆『高频维』与『低维』——RoPE 中低维即高频，易说反。"
  ],
  "beginnerSummary": "RoPE 里低维像秒针转得快、高维像时针转得慢；推太长的序列时秒针转太多圈分不清了，于是把『时钟』整体调慢（调 base）来适配更长的时间。",
  "prerequisites": [
    "RoPE 原理",
    "频率与周期",
    "长度外推"
  ],
  "workedExample": [
    "θ_1 对应高频：位置 1000 已绕多圈。",
    "base 10000→100000：θ_1 缩小 10 倍，外推更稳。"
  ],
  "lineByLine": [
    "inv[i]：第 i 个 2D 子空间基频，i 小则大。",
    "ang_at_max：在最大位置处的累计角度。",
    "检查 ang_at_max[0] 是否超出 2π 整数倍导致混叠。"
  ],
  "diagram": "维度 i: 小 -> 大\n基频 θ:  大 -> 小\n角色:   高频(秒针) -> 低频(时针)\n外推: 高频先溢出 -> 调 base 放慢时钟"
};
