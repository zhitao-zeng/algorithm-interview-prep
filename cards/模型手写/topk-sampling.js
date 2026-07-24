export default {
  "kind": "code",
  "id": "topk-sampling",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "Top-K Sampling",
  "prompt": "实现只在概率最高 k 个 token 中采样。",
  "quickAnswer": "取 top-k logits，把其余置为 -inf，重新 softmax 后按分布采样。",
  "approach": "取 top-k logits，把其余置为 -inf，重新 softmax 后按分布采样。",
  "explanationFocus": "Top-K Sampling：取 top-k logits，把其余置为 -inf，重新 softmax 后按分布采样。",
  "bruteForce": "《Top-K Sampling》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "纯贪心退化、纯随机又太乱；Top-K 只保留「可信的区间」再随机。",
    "屏蔽用 -inf 配合 isfinite 校验，确保归一化分母有限、不产生 nan。",
    "K 越小越保守、越大越发散，是可调超参。"
  ],
  "invariant": "实现始终保持 Top-K Sampling：取 top-k logits，把其余置为 -inf，重新 softmax 后按分布采样。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《Top-K Sampling》，逐步核对形状和中间数值。",
  "edgeCases": [
    "K≥词表大小：退化为普通采样。",
    "K=1：退化为贪心。",
    "含 -inf 的 logit：isfinite 校验保证不进入分母。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef top_k_sample(logits, k, rng=None):\n    logits = np.asarray(logits, dtype=float)\n    if logits.ndim != 1 or not 1 <= k <= logits.size: raise ValueError(\"invalid logits or k\")\n    if not np.all(np.isfinite(logits)): raise ValueError(\"top-k logits must be finite\")\n    idx = np.argpartition(logits, -k)[-k:]; values = logits[idx]\n    probs = np.exp(values-values.max()); probs /= probs.sum()\n    generator = np.random.default_rng() if rng is None else rng\n    return int(generator.choice(idx, p=probs))",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(V log K)（V 词表，取 top-K），空间 O(K)。",
  "followUps": [
    {
      "question": "Top-k 与 Top-p 如何组合？",
      "answer": "先按概率排序取累计和不超过 p 的最小集合，再可叠加 k 上限；两者都要在截断后重新归一化。"
    },
    {
      "question": "为什么采样前还要除温度？",
      "answer": "logits/temperature 会控制分布尖锐程度；温度越低越接近贪心，越高越随机，再执行 top-k。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "不屏蔽 K 之外位置，Top-K 没起到「截断长尾」作用。",
    "归一化前未检查有限性，出现 nan 概率。"
  ],
  "beginnerSummary": "文本生成时，贪心（总取最高概率）容易重复、乏味。Top-K 采样先取概率最高的 K 个 token，把其余低概率 token 屏蔽掉，再对这 K 个重新做 softmax 归一化，最后从新分布采样。这样在「质量可控」与「多样性」之间取得平衡。",
  "prerequisites": [
    "先对 logits 取 top-K 个最大值的下标与分数。",
    "把 K 之外位置的分数设为 -∞，使 softmax 后概率为 0。",
    "对保留的 K 个分数做 softmax 再按概率采样。"
  ],
  "workedExample": [
    "logits=[5,1,3,2]，softmax≈[.84,.02,.12,.02]；K=2 → 保留 {5:.84, 3:.12}，屏蔽 1、2。",
    "重新归一化后从 {5:.84,3:.12} 采样（或直接按概率抽一个 token）。"
  ],
  "lineByLine": [
    "取 topk(logits, k) 得到分数与索引。",
    "构造全 -inf 掩码，仅 top-K 位置保留原分数。",
    "校验 isfinite，避免 -inf 参与导致 nan。",
    "softmax 后按概率采样一个 token。"
  ],
  "diagram": "logits=[5,1,3,2]\nsoftmax → p=[.84,.02,.12,.02]\n取前 K=2: {5:.84, 3:.12}\n重归一化 → 按新分布采样\n(过滤低概率长尾, 提升多样性)"
};
