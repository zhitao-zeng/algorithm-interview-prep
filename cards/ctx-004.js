export default {
  "kind": "concept",
  "id": "ctx-004",
  "category": "长上下文与位置编码",
  "difficulty": "Medium",
  "title": "ALiBi：用线性距离偏置替代位置编码",
  "prompt": "ALiBi 如何在不加任何位置嵌入的情况下实现长度外推？",
  "quickAnswer": "ALiBi 完全不往词向量加位置嵌入，而是给每个注意力分数减去 m·|i−j|（m 为每头固定斜率），用距离线性惩罚表达位置；因偏置对任意距离都有定义，天然支持训练长度外的外推（Press et al., 2021, arXiv:2108.12409）。",
  "approach": "位置信息只进注意力分数：score = q·k/√d − m·|i−j|，距离越远罚得越重。",
  "explanationFocus": "是什么：ALiBi（Attention with Linear Biases，Press et al., ICLR 2022）是一种无位置嵌入的位置表示方法：它不给输入加任何位置向量，而是给注意力 logits 加一个与 query-key 距离成正比的负偏置，使模型偏向近邻、且对任意长度距离都有定义。",
  "bruteForce": "正弦/可学习绝对位置嵌入在超出训练长度时（表外或 OOD 角度）失效；RoPE 也需插值才能扩窗。ALiBi 的偏置矩阵只依赖距离，天然可外推。",
  "derivation": [
    "为什么需要：传统位置编码把位置加在输入层，经多层后被稀释且超界即崩；位置信息真正被『消费』的地方是注意力分数。",
    "怎么实现：每头一个固定斜率 m_h（非学习），causal 下 bias = −m_h·(i−j)（j≤i）。多头斜率按几何序列 2^(−8h/H) 分配，使各头覆盖不同距离范围；偏置矩阵可预计算复用。",
    "有什么代价：表达力弱于 RoPE（仅单调距离衰减，无法学复杂位置-内容耦合）；外推能力强但短上下文上通常略逊于精心调的 RoPE；不兼容需显式位置的一些机制。",
    "怎么评测：训 1024 直接测 2048/4096 的 PPL（应只温和退化）；看 BLOOM/MPT 等长上下文模型表现；对比 RoPE+插值的扩窗成本。"
  ],
  "invariant": "ALiBi 的不变式：偏置只取决于相对距离 i−j，与绝对位置无关，因此对任意长度都定义良好——这是免训练外推的根本。",
  "walkthrough": "例：8 头斜率 [1/2,1/4,…,1/256]；头1（m=0.5）强烈惩罚远处只盯近邻，头8（m≈0.004）几乎不罚可看全局；训练 1024 推理 4096 距离仍按同一公式算。",
  "edgeCases": [
    "斜率表对 2 的幂头数用 2^(−8h/H)；非 2 的幂需插值（论文给出最近 2 的幂 + 插值法）。",
    "ALiBi 无显式位置嵌入，某些依赖绝对位置的任务（如精确定位）表达力受限。",
    "外推虽稳但非免费午餐，极长下 PPL 仍会缓慢上升。"
  ],
  "code": "def get_alibi_slopes(num_heads):\n    import math\n    def pow2(n):\n        start = 2 ** (-(2 ** -(math.log2(n) - 3)))\n        ratio = start\n        return [start * (ratio ** i) for i in range(n)]\n    if math.log2(num_heads).is_integer():\n        return pow2(num_heads)\n    n = 2 ** math.floor(math.log2(num_heads))\n    return pow2(n) + pow2(2 * n)[0::2][:num_heads - n]\n\ndef alibi_bias(seq_len, num_heads):\n    m = torch.tensor(get_alibi_slopes(num_heads))\n    pos = torch.arange(seq_len)\n    dist = torch.clamp(pos.unsqueeze(0) - pos.unsqueeze(1), min=0)\n    return -m.view(-1,1,1) * dist.unsqueeze(0)",
  "codeNotes": [
    "斜率固定非学习，m_h=2^(−8h/H) 经验值。",
    "bias 直接加在 softmax 前的注意力分数上，任意长度距离都有定义。"
  ],
  "complexity": "偏置矩阵 O(H·L²) 可预计算并缓存，推理零额外参数；外推无需微调。",
  "followUps": [
    {
      "question": "为什么 ALiBi 能免训练外推而 RoPE 不能直接外推？",
      "answer": "ALiBi 偏置是距离的函数，对任意距离都定义良好且平滑；RoPE 角度超出训练范围即 OOD，必须插值。"
    },
    {
      "question": "ALiBi 的缺点是什么？",
      "answer": "只有单调距离衰减的归纳偏置，位置-内容耦合表达力弱于 RoPE，短上下文通常略逊，且不支持需要显式位置的操作。"
    }
  ],
  "followUpAnswers": [
    "ALiBi 偏置是距离的函数，对任意距离都定义良好且平滑；RoPE 角度超出训练范围即 OOD，必须插值。",
    "只有单调距离衰减的归纳偏置，位置-内容耦合表达力弱于 RoPE，短上下文通常略逊，且不支持需要显式位置的操作。"
  ],
  "pitfalls": [
    "以为 ALiBi 加了位置嵌入（其实完全没有，只加注意力偏置）。",
    "非 2 的幂头数斜率表算错，需按论文插值法。"
  ],
  "beginnerSummary": "普通方法把『第几个词』写进词向量；ALiBi 不写，而是在算注意力时直接说『离得越远扣分越多』。因为『距离』这个东西不管多长都能算，所以文章再长它也不慌。",
  "prerequisites": [
    "自注意力分数计算",
    "位置编码的两种思路（绝对/相对）"
  ],
  "workedExample": [
    "8 头，斜率 [0.5,0.25,…,0.004]。",
    "训练长度 1024，推理 4096；距离 3000 的偏置 = −m·3000，公式照常成立，无需微调。"
  ],
  "lineByLine": [
    "get_alibi_slopes：按几何序列生成每头固定斜率。",
    "dist = clamp(i−j,min=0)：因果下只算过去距离。",
    "return −m*dist：把距离惩罚作为偏置加回注意力分数。"
  ],
  "diagram": "Q@K^T/√d  ── + (−m·|i−j|) ──> softmax\n近邻扣分少 | 远距扣分多\n任意长度距离都可算 → 免训练外推"
};
