export default {
  "id": "rs-graph",
  "kind": "concept",
  "category": "推荐系统",
  "title": "图神经网络推荐：二部图上的消息传播",
  "difficulty": "Hard",
  "prompt": "如何把\"用户-物品\"交互建模成二部图并用 GCN/GraphSAGE/NGCF/LightGCN 做消息传播，为什么 LightGCN 去掉非线性与权重反而更好，又该如何缓解过平滑？",
  "quickAnswer": "用户-物品交互构成二部图，GCN 通过归一化邻接矩阵做邻居聚合传播信号。NGCF 在传播中保留非线性与交互项以建模高阶协同；LightGCN 去掉权重矩阵与非线性，仅做线性聚合再各层平均，反而更简洁有效。层数过深会使所有节点表示趋同(过平滑)，一般用 2~3 层并加残差/早停缓解。",
  "code": "import numpy as np\n\ndef lightgcn_propagate(adj_norm, emb, layers=3):\n    # adj_norm: 含自环并度归一化的 (N, N) 邻接矩阵\n    # emb: 初始 (N, d) 节点表示\n    all_emb = [emb]\n    h = emb\n    for _ in range(layers):\n        h = adj_norm @ h           # 仅线性传播, 无权重无非线性\n        all_emb.append(h)\n    return np.mean(all_emb, axis=0) # 各层表示平均融合\n\ndef ngcf_message(emb_u, emb_i, W1, W2):\n    # NGCF: 保留交互项与线性变换的消息\n    return (W1 @ emb_i) + (W2 @ (emb_u * emb_i))",
  "complexity": "单层 O(|E|·d)，|E| 边数；L 层 O(L·|E|·d)",
  "beginnerSummary": "把用户和商品画成两张圆点、看过的就连线；信息像水一样沿连线流，朋友(相似用户/商品)会把口味传给你，多流几轮你就\"尝\"到间接喜欢的物品。",
  "explanationFocus": "是什么：图神经网络推荐把用户-物品交互视为二部图，用消息传播在邻居间聚合特征，从而得到融合高阶协同信号的节点表示；LightGCN 是去掉冗余非线性与权重的轻量变体。",
  "approach": "用度归一化邻接矩阵做邻居聚合；NGCF 在传播里保留非线性与交互项，LightGCN 只做线性聚合再各层平均，靠层数捕获高阶协同。",
  "derivation": [
    "为什么需要：协同过滤只看一阶共现，图传播可自然捕获多跳高阶相似。",
    "怎么实现：h^{(l+1)}=normalize(A) h^{(l)}；LightGCN 取各层均值。",
    "有什么代价：层数深会过平滑，且大图全图传播显存高需采样邻居。",
    "怎么评测：Recall@20/NDCG@20 对比 MF 与 NGCF，看层数敏感度。"
  ],
  "edgeCases": [
    "度数极高的超级用户/爆款商品会在聚合中主导邻居表示，需对称归一化。",
    "新节点无边，无法从邻居获信息，需属性特征或冷启动注入。",
    "二部图单边聚合会导致表示震荡，需各层平均或残差连接。"
  ],
  "pitfalls": [
    "照搬带 ReLU 与权重的 GCN，在推荐图上反而过拟合并损害协同信号。",
    "层数设到 4 以上不加以太差，节点表示趋同、指标掉点(过平滑)。"
  ],
  "prerequisites": [
    "协同过滤与矩阵分解",
    "图卷积与消息传递基础"
  ],
  "workedExample": [
    "2 层 LightGCN：用户 u 经 1 跳拿到交互物品表示，2 跳拿到\"相似用户交互的物品\"，感受野约 d² 量级；实验 L=3 时 Amazon 上 Recall@20 最高。",
    "过平滑测试：L 从 1 增到 4，节点表示余弦相似度均值从 0.21 升到 0.87，NDCG@20 在 L=3 后回落，说明 3 层为拐点。"
  ],
  "lineByLine": [
    "def lightgcn_propagate：线性聚合邻居、不引入权重与非线性。",
    "h = adj_norm @ h：按度归一化邻接矩阵把邻居信息传过来。",
    "all_emb.append(h)：保存每一层输出。",
    "return mean(all_emb)：各层平均融合, 兼顾不同阶邻域。"
  ],
  "followUps": [
    {
      "question": "为什么 LightGCN 比 NGCF 更简单却更好？",
      "answer": "推荐图的特征主要就是 ID embedding，非线性与特征变换收益小，反而引入过拟合与训练难度；LightGCN 去掉它们只保留结构传播，更稳更轻。"
    },
    {
      "question": "如何缓解过平滑？",
      "answer": "控制层数(通常 2~3)、各层表示加权/平均而非只用末层、加残差连接，或对边做丢弃(edge dropout)打破同质化。"
    }
  ],
  "followUpAnswers": [
    "推荐图的特征主要就是 ID embedding，非线性与特征变换收益小，反而引入过拟合与训练难度；LightGCN 去掉它们只保留结构传播，更稳更轻。",
    "控制层数(通常 2~3)、各层表示加权/平均而非只用末层、加残差连接，或对边做丢弃(edge dropout)打破同质化。"
  ],
  "order": 15
};
