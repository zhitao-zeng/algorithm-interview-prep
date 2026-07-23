export default {
  "kind": "concept",
  "id": "arch-causal-mask",
  "category": "Transformer 架构",
  "difficulty": "Easy",
  "title": "因果掩码 causal mask 实现与含义",
  "prompt": "自回归 Transformer 的因果掩码是怎么实现、含义是什么？",
  "quickAnswer": "在分数矩阵上把未来位置（j>i）置 −∞，使 softmax 后权重为 0，token 只能看自己和过去。",
  "approach": "构造上三角为 −∞、对角线及下三角为 0 的掩码，加到 QKᵀ/√d_k 后再 softmax。",
  "explanationFocus": "是什么：因果掩码（causal mask）是一个下三角可见、上三角屏蔽的掩码，保证第 i 个位置在注意力中只能 attend 到位置 ≤i 的 token，防止信息从未来泄漏，是自回归训练/推理的基础。",
  "bruteForce": "不用掩码则双向可见，模型在预测第 i 个词时『偷看』了答案，无法用于自回归生成。",
  "derivation": [
    "为什么需要：语言模型按序生成，训练时若看未来词等于泄露标签，需屏蔽上三角。",
    "怎么实现：mask[i][j]=0 if j≤i else −∞，加到分数后 softmax 使未来权重为 0。",
    "有什么代价：仅屏蔽约一半注意力（损失一半并行上限），但保证正确性；FlashAttention 可跳过上三角块。",
    "怎么评测：检查掩码后未来位置输出权重严格为 0；生成不自 leakage。"
  ],
  "invariant": "不变量：对任意 i，sum_j weight[i][j]=1 且 j>i 时 weight=0；位置 i 的表征只依赖 1..i。",
  "walkthrough": "长度 4：掩码矩阵对角线及左下为 0、右上为 −∞；位置 2 只能看 0,1,2，softmax 后 weight[2][3]=0。",
  "edgeCases": [
    "padding 位置需额外 mask 避免 attend 到 pad。",
    "双向编码器（BERT）不用因果掩码，而用双向注意力。",
    "−∞ 用大负数（如 -1e9）近似，注意数值溢出。"
  ],
  "code": "import torch\n\ndef causal_mask(n):\n    # 返回 (n, n) 掩码：下三角 0，上三角 -inf\n    m = torch.triu(torch.full((n, n), float('-inf')), diagonal=1)\n    return m",
  "codeNotes": [
    "triu(diagonal=1) 保留对角线为 0、上三角 -inf。",
    "推理时也可逐 token 增量计算，不必每次全矩阵。"
  ],
  "complexity": "掩码构造 O(N²)，加法 O(N²)；不增加渐近复杂度，但屏蔽约一半有效注意力。",
  "followUps": [
    {
      "question": "因果掩码和 padding mask 能叠加吗？",
      "answer": "可以，两者都是加到分数上的加性掩码，分别屏蔽未来与填充位，常合并成一个 mask。"
    },
    {
      "question": "推理时也要全量掩码吗？",
      "answer": "不必；推理可维护 KV 缓存并只用当前 query 对历史做注意力，等价于因果掩码效果。"
    }
  ],
  "followUpAnswers": [
    "可以，两者都是加到分数上的加性掩码，分别屏蔽未来与填充位，常合并成一个 mask。",
    "不必；推理可维护 KV 缓存并只用当前 query 对历史做注意力，等价于因果掩码效果。"
  ],
  "pitfalls": [
    "把 diagonal=1 写成 0 会屏蔽对角线自身（含自己都看不到）。",
    "用 0 而非 −∞ 屏蔽未来，softmax 仍会分配非零权重。"
  ],
  "beginnerSummary": "因果掩码像给一句话盖上一块『只能看左边』的挡板：每个词生成时只能参考它自己和前面的词，不能偷看后面的答案。",
  "prerequisites": [
    "自回归生成",
    "softmax 与掩码",
    "注意力分数"
  ],
  "workedExample": [
    "位置 i=2，可被看的是 0,1,2。",
    "mask[2][3]=−∞ → softmax 后权重为 0。"
  ],
  "lineByLine": [
    "torch.full((n,n),-inf)：先全 −inf。",
    "triu(diagonal=1)：保留对角线及以下为 0。",
    "加到分数后再 softmax 实现单向可见。"
  ],
  "diagram": "i\\j 0 1 2 3\n0   0 -∞ -∞ -∞\n1   0  0 -∞ -∞\n2   0  0  0 -∞\n3   0  0  0  0"
};
