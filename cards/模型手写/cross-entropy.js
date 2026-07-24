export default {
  "kind": "code",
  "id": "cross-entropy",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "多分类 Cross Entropy",
  "prompt": "手写稳定的 softmax 交叉熵。",
  "quickAnswer": "先减每行最大 logit，再 logsumexp；损失是正确类负对数概率。",
  "approach": "先减每行最大 logit，再 logsumexp；损失是正确类负对数概率。",
  "explanationFocus": "多分类 Cross Entropy：先减每行最大 logit，再 logsumexp；损失是正确类负对数概率。",
  "bruteForce": "《多分类 Cross Entropy》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "从「最大似然」出发：希望真实类别概率最大 → 最小化 -log p_true。",
    "直接 exp(z) 在大 z 时溢出，故用 log(Σexp(z)) = max(z) + log(Σ exp(z-max(z))) 稳定化。",
    "合并得 CE = -[ z_true - logsumexp(z) ]，梯度干净、实现稳健。"
  ],
  "invariant": "平移所有 logits 不改变 softmax 概率。",
  "walkthrough": "用一个极小张量演练《多分类 Cross Entropy》，逐步核对形状和中间数值。",
  "edgeCases": [
    "某 logit 极大：log-sum-exp 减最大值后不会溢出。",
    "单类（C=1）：softmax 恒为 1、交叉熵恒为 0，无有效分类意义；二分类应使用两类 softmax 或单 logit + BCE，并非单类 softmax。",
    "批次维度为空：应报错或返回空。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef cross_entropy(logits, labels):\n    logits = np.asarray(logits, dtype=float)  # (B,C)\n    labels = np.asarray(labels)\n    if not np.issubdtype(labels.dtype, np.integer): raise ValueError(\"labels must be integers\")\n    labels = labels.astype(int)\n    if logits.ndim != 2 or logits.shape[0] == 0 or logits.shape[1] == 0 or labels.shape != (logits.shape[0],):\n        raise ValueError(\"logits must be non-empty (B,C), labels must be (B,)\")\n    if np.any(labels < 0) or np.any(labels >= logits.shape[1]):\n        raise ValueError(\"labels out of range\")\n    shifted = logits - logits.max(axis=1, keepdims=True)\n    logsumexp = np.log(np.exp(shifted).sum(axis=1))\n    log_prob = shifted - logsumexp[:, None]\n    return float(-log_prob[np.arange(logits.shape[0]), labels].mean())",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(N·C)（N 样本、C 类），空间 O(N·C)（softmax 中间量）。",
  "followUps": [
    {
      "question": "为什么不用先 softmax 再 log？",
      "answer": "先 softmax 可能溢出或下溢为 0，随后 log 得到 inf；log-sum-exp 直接在对数域更稳定。"
    },
    {
      "question": "标签能用 one-hot 吗？",
      "answer": "可以用 -(target*log_prob).sum(axis=1).mean()，整数标签版本更省内存。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "直接 exp(logits) 不做稳定化，大值溢出成 inf/nan。",
    "标签未做整数/越界校验，索引 logits[range, labels] 会越界。"
  ],
  "beginnerSummary": "多分类交叉熵衡量「预测概率分布」与「真实 one-hot 标签」的差距。先把 logits 过 softmax 变成概率，再对真实类别取负对数：CE = -log(p_true)。预测越准（p_true→1）损失越小；预测越错损失越大。数值上常用「log-sum-exp 技巧」稳定计算：-[ z_true - log(Σ exp(z_j)) ]，避免 exp 溢出。",
  "prerequisites": [
    "logits 是模型最后一层未归一化的分数；softmax 把它压成和为 1 的概率分布。",
    "one-hot 标签只在正确类别处为 1，故 CE 只关心正确类别对应的预测概率。",
    "直接用 exp 易溢出，log-sum-exp 用「减最大值」技巧保证数值稳定。"
  ],
  "workedExample": [
    "logits=[2,1,0.1]，softmax≈[0.659,0.242,0.099]；真实类=0 → CE=-log(0.659)≈0.417。",
    "若预测正确类概率接近 1，CE≈0；若把概率压到 0.01，CE≈4.6（惩罚很大）。"
  ],
  "lineByLine": [
    "校验 labels 在 [0, C) 且为整数（labels out of range / must be integers 断言）。",
    "校验 logits 非空（logits.shape[1]==0 报错）。",
    "z_true = logits[range(n), labels] 取正确类分数。",
    "lse = max(z) + log(sum(exp(z - max(z)))) 计算 log-sum-exp。",
    "返回 mean(z_true - lse) 的负值。"
  ],
  "diagram": "logits=[2,1,0.1]\nsoftmax: p_i = e^{z_i} / Σe^{z_j}\nlabel = 类0\nCE = -log( p_类0 )\n   = -[ z_0 - log(Σe^{z_j}) ]\np 越大 → CE 越小 (预测越准)"
};
