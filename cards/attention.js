export default {
  "kind": "code",
  "id": "attention",
  "category": "模型手写",
  "difficulty": "Hard",
  "title": "缩放点积 Attention",
  "prompt": "实现 Attention(Q,K,V)=softmax(QKᵀ/√d + mask)V。",
  "quickAnswer": "先算 score 并除以 √d 控制方差；mask 在 softmax 前置为负无穷，再与 V 相乘。",
  "approach": "先算 score 并除以 √d 控制方差；mask 在 softmax 前置为负无穷，再与 V 相乘。",
  "explanationFocus": "缩放点积 Attention：先算 score 并除以 √d 控制方差；mask 在 softmax 前置为负无穷，再与 V 相乘。",
  "bruteForce": "《缩放点积 Attention》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "点积天然衡量向量相似度，但直接在大 d 下数值过大、softmax 趋尖。",
    "除以 √d_k 使方差回到合理范围，softmax 不至于饱和。",
    "多头注意力并行多组 Q/K/V 再拼接，捕捉不同子空间关系。"
  ],
  "invariant": "每个未被 mask 的 query 行权重和为 1，且被 mask 的位置概率为 0。",
  "walkthrough": "用两个 query、三个 key 的小矩阵，先算一行分数，再 softmax 并加权 value。",
  "edgeCases": [
    "序列长度为 0：应返回空或报错。",
    "d_k 很大：必须缩放，否则 softmax 饱和。",
    "掩码（如因果掩码）：在 softmax 前把非法位置置 -inf。"
  ],
  "code": "# Python\nimport math\nimport torch\n\ndef scaled_attention(q, k, v, mask=None):\n    # q:(B,H,Lq,D), k:(B,H,Lk,D), v:(B,H,Lk,Dv)\n    scores = q @ k.transpose(-1, -2) / math.sqrt(q.shape[-1])\n    if mask is not None:\n        scores = scores.masked_fill(~mask, torch.finfo(scores.dtype).min)\n    weights = torch.softmax(scores, dim=-1)\n    return weights @ v, weights",
  "codeNotes": [
    "mask 必须在 softmax 之前应用。",
    "实际框架中应使用稳定的 fused softmax。"
  ],
  "complexity": "时间 O(n²·d)（n 序列长、d 维度），空间 O(n²)（注意力矩阵）。",
  "followUps": [
    {
      "question": "为什么除以 √D？",
      "answer": "若 Q、K 各维独立单位方差，点积方差约为 D；除以 √D 将标准差缩回约 1，避免 softmax 饱和。"
    },
    {
      "question": "Self 与 Cross Attention 差异？",
      "answer": "Self 的 Q/K/V 来自同一序列；Cross 的 Q 来自解码器，K/V 来自编码器，长度可不同。"
    }
  ],
  "followUpAnswers": [
    "点积方差随 d 增大，除以 √d 可将量级稳定在常数。",
    "Self 的 Q/K/V 来自同一序列；Cross 的 Q 来自解码器，K/V 来自编码器。"
  ],
  "pitfalls": [
    "忘记除以 √d_k，高维下点积爆炸、softmax 梯度消失。",
    "在错误维度上做 softmax（应在 Key 维而非 Query 维）。"
  ],
  "beginnerSummary": "缩放点积注意力是 Transformer 的核心：用 Query 与 Key 的点积衡量「相关性」，除以 √d_k 防止点积过大导致 softmax 梯度消失，再经 softmax 得到权重，最后用权重对 Value 加权求和。自注意力中 Q=K=V=同一输入，故每个位置都能「关注」序列中所有位置。",
  "prerequisites": [
    "Q、K、V 分别由输入线性映射得到；注意力分数 = Q·Kᵀ。",
    "除以 √d_k 缩放，抵消高维下点积方差随维度增大的问题。",
    "softmax 沿 Key 维度归一化，使权重和为 1；输出 = 权重 · V。"
  ],
  "workedExample": [
    "单头：Q·Kᵀ 得 [n,n] 分数矩阵，/√d 后 softmax（按列）→ 权重；权重·V → 输出。",
    "自注意力：第 i 行权重表示「第 i 个 token 对全体 token 的关注分布」。"
  ],
  "lineByLine": [
    "计算 scores = Q·Kᵀ。",
    "scores = scores / sqrt(d_k) 缩放。",
    "weights = softmax(scores, dim=-1)（按 Key 维）。",
    "output = weights · V，返回输出（及可选注意力权重）。"
  ],
  "diagram": "Q·Kᵀ / √d\n  [q1·k1  q1·k2 ...]\n  [q2·k1  q2·k2 ...]   /√d\nsoftmax(列) → 权重\n权重 · V = 输出\n(自注意力: Q=K=V=输入)"
};
