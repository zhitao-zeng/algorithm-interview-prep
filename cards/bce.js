export default {
  "kind": "code",
  "id": "bce",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "二分类 BCEWithLogits",
  "prompt": "解释为何 BCE 应直接吃 logits。",
  "quickAnswer": "稳定公式 max(x,0)-x*y+log1p(exp(-abs(x)))，避免先 sigmoid 溢出。",
  "approach": "稳定公式 max(x,0)-x*y+log1p(exp(-abs(x)))，避免先 sigmoid 溢出。",
  "explanationFocus": "二分类 BCEWithLogits：稳定公式 max(x,0)-x*y+log1p(exp(-abs(x)))，避免先 sigmoid 溢出。",
  "bruteForce": "《二分类 BCEWithLogits》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "分开算 sigmoid 再取 log 在 z 很负时 1-σ(z)→1 但 σ(z)→0，log(0) 溢出。",
    "融合公式利用 softplus 稳定表达，且能与 reduction（mean/sum）配合。",
    "同时做数值/范围校验，保证标签在 [0,1]、reduction 合法。"
  ],
  "invariant": "实现始终保持 二分类 BCEWithLogits：稳定公式 max(x,0)-x*y+log1p(exp(-abs(x)))，避免先 sigmoid 溢出。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《二分类 BCEWithLogits》，逐步核对形状和中间数值。",
  "edgeCases": [
    "y=0 或 1 极端标签：公式仍能给有限损失。",
    "z 极大/极小：softplus 稳定不溢出。",
    "单样本：返回标量。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef bce_with_logits(logits, targets, reduction=\"mean\"):\n    x = np.asarray(logits, dtype=float); y = np.asarray(targets, dtype=float)\n    if x.shape != y.shape: raise ValueError(\"logits and targets must have the same shape\")\n    if np.any((y < 0) | (y > 1)): raise ValueError(\"targets must be in [0,1]\")\n    if reduction not in (\"none\", \"sum\", \"mean\"): raise ValueError(\"invalid reduction\")\n    loss = np.maximum(x, 0.0) - x*y + np.log1p(np.exp(-np.abs(x)))\n    if reduction == \"none\": return loss\n    if reduction == \"sum\": return float(loss.sum())\n    return float(loss.mean())",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(N)（逐元素 softplus），空间 O(N)。",
  "followUps": [
    {
      "question": "logit 的梯度是什么？",
      "answer": "梯度为 sigmoid(x)-y；正样本 logit 太小时梯度为负，会推动它增大。"
    },
    {
      "question": "类别不平衡怎么办？",
      "answer": "可给正负样本加 class weight 或 focal loss，但仍使用稳定 logits 公式。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "标签不在 [0,1]（如 -1 或 2）却不校验，得到无意义损失。",
    "先手动 sigmoid 再算 -log，在极端 z 下数值下溢成 inf。"
  ],
  "beginnerSummary": "二分类交叉熵配合 sigmoid，衡量单值预测与 0/1 标签的差距。工程上用「BCEWithLogits」把 sigmoid 与 CE 融合，直接吃 logit（未过 sigmoid 的值），用 log-sum-exp 技巧稳定计算，避免先算 sigmoid 再取 log 的数值问题。公式为 -[ y·log σ(z) + (1-y)·log(1-σ(z)) ]。",
  "prerequisites": [
    "σ(z)=1/(1+e^-z) 把 logit 映射到 (0,1) 概率。",
    "y∈{0,1} 是真实标签；当 y=1 时损失只惩罚「预测概率离 1 远」，y=0 时只惩罚「离 0 远」。",
    "融合实现用 max(0,z) + log(1+e^-|z|)（softplus）稳定算 -log σ(z) 与 -log(1-σ(z))。"
  ],
  "workedExample": [
    "logit=1.5 → σ≈0.82；y=1 → BCE=-log(0.82)≈0.198。",
    "logit=-2 → σ≈0.12；y=0 → BCE=-log(1-0.12)=-log(0.88)≈0.128。"
  ],
  "lineByLine": [
    "校验 targets 在 [0,1]（targets must be in [0,1]），否则报错。",
    "校验 reduction 合法（invalid reduction 报错）。",
    "用稳定式：term = max(0,z) + log(1+exp(-|z|))；loss = term - z*y + (1-y)*...（融合表达）。",
    "按 reduction 聚合（mean/sum/none）。"
  ],
  "diagram": "logit=1.5 → σ=1/(1+e^-1.5)=0.82\nlabel y=1\nBCE = -[ y·log(p) + (1-y)·log(1-p) ]\n负样本 logit=-2 → p=0.12\ny=0 时只留 -(1-y)·log(1-p)"
};
