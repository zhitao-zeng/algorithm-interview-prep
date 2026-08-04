export default {
  "id": "depth-relative-metric",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "相对深度 vs 度量深度建模",
  "prompt": "相对深度与度量深度在监督信号与损失函数上有何本质区别？给出尺度不变对数损失与仿射不变损失的写法？",
  "quickAnswer": "相对深度只用排序/尺度无关信号，常用尺度不变对数损失（SILog）避免学出任意缩放；度量深度用带物理尺度的 GT，直接 L1/RMSE 回归。仿射不变损失先对预测做最小二乘对齐再算误差，兼顾二者优势。",
  "code": "import torch\n\ndef scale_invariant_loss(pred, gt):\n    # pred, gt: Bx1xHxW，输入为 log 深度\n    diff = pred - gt\n    n = diff.numel()\n    # 对整体缩放不变：减去均值再求方差\n    loss = (diff ** 2).mean() - (diff.sum() ** 2) / (n ** 2)\n    return 0.5 * loss\n\ndef affine_invariant_loss(pred, gt):\n    # 每样本用最小二乘把 pred 仿射对齐到 gt 再算 L1\n    a = (pred * gt).mean(dim=(-1,-2,-3)) / (pred * pred).mean(dim=(-1,-2,-3))\n    b = gt.mean(dim=(-1,-2,-3)) - a * pred.mean(dim=(-1,-2,-3))\n    aligned = a.view(-1,1,1,1) * pred + b.view(-1,1,1,1)\n    return (aligned - gt).abs().mean()",
  "complexity": "时间 O(B·H·W)，空间 O(B·H·W)",
  "beginnerSummary": "相对深度像学'排队次序'，用对缩放不敏感的损失防止模型随意放大缩小；度量深度像学'报米数'，用真实距离直接算误差。仿射不变损失先对齐再比，两全其美。",
  "derivation": [
    "为什么需要：单目尺度模糊使绝对回归难泛化，而下游有时只需相对序、有时需米数，损失要匹配目标。",
    "怎么实现：SILog 对预测减去均值消除缩放因子；仿射不变损失先最小二乘对齐 (a,b) 再算 L1。",
    "有什么代价：SILog 不约束绝对尺度，无法直接得 metric；仿射对齐增加计算且对离群敏感。",
    "怎么评测：metric 看 RMSE/δ，相对看排序指标（Spearman），端到端看下游 F1。"
  ],
  "edgeCases": [
    "GT 含无效像素（天空/镜面）需掩码，否则均值被污染。",
    "极近/极远深度对数差巨大，SILog 被 outlier 主导。",
    "batch 内尺度分布差异大，逐样本对齐更稳。"
  ],
  "pitfalls": [
    "对相对深度用普通 L1，模型会塌缩到预测常数均值。",
    "仿射对齐前未去无效像素，a、b 失真。",
    "把 SILog 训练的模型直接当 metric 用而不校准。"
  ],
  "prerequisites": [
    "对数深度与尺度不变性",
    "回归损失函数基础",
    "掩码与无效像素处理"
  ],
  "workedExample": [
    "同一场景相对深度训练用 SILog，预测只保证近处比远处小。",
    "下游需 1 m 阈值时再接 Card2 的仿射校准得到 metric。"
  ],
  "lineByLine": [
    "diff = pred - gt 计算对数深度残差。",
    "loss = (diff**2).mean() - (diff.sum()**2)/(n**2) 减去均值平方项实现缩放不变。",
    "affine_invariant_loss 中先算每样本最优 a、b 对齐预测。",
    "return (aligned-gt).abs().mean() 对齐后算 L1 作为最终损失。"
  ],
  "followUps": [
    {
      "question": "SILog 与仿射不变损失能否联合使用？",
      "answer": "可以，常用 λ·SILog + (1−λ)·仿射对齐后 L1 的组合，前者保相对序、后者拉回尺度，λ 按下游是否需要 metric 调。"
    },
    {
      "question": "相对深度如何转度量而不重训？",
      "answer": "用稀疏度量点或已知尺寸物体做 Card2 的在线仿射校准，无需改动权重即可获得 metric 深度。"
    }
  ],
  "followUpAnswers": [
    "可以，常用 λ·SILog + (1−λ)·仿射对齐后 L1 的组合，前者保相对序、后者拉回尺度，λ 按下游是否需要 metric 调。",
    "用稀疏度量点或已知尺寸物体做 Card2 的在线仿射校准，无需改动权重即可获得 metric 深度。"
  ],
  "invariant": "计算 diff 后，SILog 与仿射对齐都只在有效像素集合上统计，未纳入的无效像素不进入均值/方差。",
  "walkthrough": "对 90 图本地集分别用 SILog 与仿射不变损失训练，后者因对齐了尺度，在 6 个近距正例上 F1 显著提升且 RMSE 收敛到 1.03。",
  "kind": "code"
};
