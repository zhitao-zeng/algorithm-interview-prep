export default {
  "kind": "concept",
  "id": "arch-kqv-projection",
  "category": "Transformer 架构",
  "difficulty": "Easy",
  "title": "Attention 的 K/Q/V 投影与 head 维度",
  "prompt": "注意力里的 Q/K/V 投影和 head 维度 d_k 分别起什么作用？",
  "quickAnswer": "用三个可学习矩阵把同一输入投影成 Query/Key/Value；d_k 是每个头的维度，缩放 1/√d_k 防止点积过大。",
  "approach": "从单头公式 Attention=softmax(QKᵀ/√d_k)V 出发，解释投影意义与 d_k 的归一化作用。",
  "explanationFocus": "是什么：对输入 X 用 W_Q/W_K/W_V 投影得到 Q/K/V；多头时把 d_model 拆成 h 个 head，每头维度 d_k=d_model/h；点积 QKᵀ 除以 √d_k 做缩放，避免维度越大点积方差越大导致 softmax 饱和。",
  "bruteForce": "若不做投影直接拿 X 当 Q/K/V，则无法区分『查什么/匹配什么/取什么』三种角色，且缺缩放易梯度消失。",
  "derivation": [
    "为什么需要：投影让模型在不同子空间分别学习查询、键匹配、值提取；缩放保持 softmax 输入方差稳定。",
    "怎么实现：Q=XW_Q,K=XW_K,V=XW_V，分 head 后每头算 softmax(QKᵀ/√d_k)V 再拼接。",
    "有什么代价：投影带来 3 个 d_model² 矩阵；d_k 过小表达弱、过大则计算与方差问题，通常 64 左右。",
    "怎么评测：消融无缩放会 softmax 饱和、训练变慢；head 数影响表达与并行。"
  ],
  "invariant": "不变量：缩放 1/√d_k 使 QKᵀ 的方差约与 d_k 无关；多头拼接后维度仍为 d_model。",
  "walkthrough": "d_model=512,h=8→d_k=64；QKᵀ 元素方差约随 d_k 增，除以 8(=√64) 把 softmax 输入拉回合理范围。",
  "edgeCases": [
    "d_model 必须整除 h（否则需 pad 或线性映射适配）。",
    "MQA/GQA 下 K/V 头数少于 Q 头数，但 d_k 定义不变。",
    "训练初期随机初始化下 QKᵀ/√d_k 量级应接近 1。"
  ],
  "code": "import torch\n\ndef single_head_attn(q, k, v):\n    d_k = q.size(-1)\n    scores = q @ k.transpose(-2, -1) / (d_k ** 0.5)\n    weights = torch.softmax(scores, dim=-1)\n    return weights @ v",
  "codeNotes": [
    "√d_k 缩放关键，遗漏会导致 softmax 梯度极小。",
    "q,k,v 形状通常 (..., n, d_k)。"
  ],
  "complexity": "单头 O(N²·d_k)，h 头总计 O(N²·d_model)；投影 O(N·d_model²)。",
  "followUps": [
    {
      "question": "为什么除以 √d_k 而不是 d_k？",
      "answer": "QKᵀ 方差随 d_k 线性增长，标准差随 √d_k 增长，故除以 √d_k 可将 softmax 输入方差归一化。"
    },
    {
      "question": "head 数越多越好吗？",
      "answer": "不一定；head 多提升并行与子空间多样性，但每头 d_k 变小、单头表达弱，需整体权衡。"
    }
  ],
  "followUpAnswers": [
    "QKᵀ 方差随 d_k 线性增长，标准差随 √d_k 增长，故除以 √d_k 可将 softmax 输入方差归一化。",
    "不一定；head 多提升并行与子空间多样性，但每头 d_k 变小、单头表达弱，需整体权衡。"
  ],
  "pitfalls": [
    "漏掉 √d_k 缩放导致 softmax 饱和、梯度消失。",
    "误以为 d_k 是总模型维度——它只是每头维度。"
  ],
  "beginnerSummary": "Q/K/V 投影像把同一段话复印三份分别标『我想找什么』『我有什么标签』『我能提供什么』；√d_k 是把匹配分数调到一个稳定范围，防止分数过大让 softmax 『一根筋』。",
  "prerequisites": [
    "自注意力机制",
    "矩阵投影",
    "softmax 数值问题"
  ],
  "workedExample": [
    "X→W_Q/W_K/W_V 得 Q/K/V。",
    "分 8 头，每头 d_k=64，算 softmax(QKᵀ/8)V。"
  ],
  "lineByLine": [
    "d_k=q.size(-1)：取每头维度。",
    "scores/√d_k：缩放防饱和。",
    "softmax 后加权求和得输出。"
  ],
  "diagram": "X --W_Q--> Q\nX --W_K--> K\nX --W_V--> V\nScore = QK^T/√d_k -> softmax -> *V"
};
