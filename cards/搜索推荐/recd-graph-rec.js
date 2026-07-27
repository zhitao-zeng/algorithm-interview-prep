export default {
  "id": "recd-graph-rec",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "图推荐：U-I 二部图与 GraphSAGE/PinSage",
  "difficulty": "Hard",
  "prompt": "如何用语图结构（用户-物品二部图）做推荐？GraphSAGE 与 PinSage 的邻域采样与聚合思路是什么？",
  "quickAnswer": "图推荐把用户与物品建成二部图，用节点间连边传播协同信号。GraphSAGE 通过采样固定大小邻域并聚合邻居表示来学节点 embedding；PinSAGE 用随机游走重要性采样+生产者-消费者聚合，适合工业级海量图。",
  "code": "import torch\n\ndef sage_aggregate(node, neighbors, mlp):\n    # GraphSAGE：采样邻居并聚合得到节点表示\n    neigh_vecs = [n.embed for n in neighbors]\n    agg = torch.mean(torch.stack(neigh_vecs), dim=0)   # 均值聚合\n    combined = torch.cat([node.embed, agg], dim=-1)\n    return mlp(combined)                                # 更新节点 embedding",
  "complexity": "O(S·D) per node (S 采样邻居数)",
  "beginnerSummary": "\"和你看过相似视频的人，也看了这个\"——图推荐就是把用户和视频连成一张大网，让喜好沿着连线传播扩散。",
  "explanationFocus": "是什么：图推荐将用户与物品视为二部图中的两类节点，通过连边传播协同信号来学习节点表示并做推荐，能显式利用高阶邻居信息。",
  "approach": "构建 U-I 二部图；用 GraphSAGE 采样固定邻域并均值/池化聚合更新节点 embedding；PinSAGE 进一步用随机游走计算邻居重要性、做工业级采样与生产者-消费者并行聚合，得到 embedding 后接相似度检索。",
  "derivation": [
    "为什么需要：协同过滤只用到一阶共现，图可捕捉高阶连通与长尾传播。",
    "怎么实现：建二部图→采样邻域→聚合(均值/pool)→多层堆叠得表示→检索。",
    "有什么代价：全图传播算力大，采样引入方差，冷节点邻域稀疏。",
    "怎么评测：Recall@K、NDCG，以及长尾 item 的覆盖提升。"
  ],
  "edgeCases": [
    "超级热门节点连接过多需限采样防主导。",
    "孤立冷物品无邻域需内容特征兜底。",
    "动态图边频繁变化需增量更新。"
  ],
  "pitfalls": [
    "邻域采样过大导致训练爆炸。",
    "忽略边类型(点击/购买)把弱关系当强关系。"
  ],
  "prerequisites": [
    "图神经网络(GNN)基础",
    "协同过滤与 embedding 检索"
  ],
  "workedExample": [
    "用户 U 看过视频 I1；I1 被用户 U2 看，U2 又看 I2。",
    "二部图 2 跳：U 的表示经 I1→U2→I2 聚合到 I2 信号，故向 U 推荐 I2，实现高阶协同。"
  ],
  "lineByLine": [
    "def sage_aggregate：对单节点做一层聚合。",
    "neigh_vecs：收集采样邻居的当前 embedding。",
    "agg = mean：均值池化邻居信息。",
    "combined→mlp：拼接自身与邻居表示后映射更新。"
  ],
  "followUps": [
    {
      "question": "PinSage 相对 GraphSAGE 的工业改进？",
      "answer": "PinSAGE 用随机游走重要性采样替代均匀采样，并用生产者-消费者模式做高效 mini-batch 聚合，配合局部图裁剪，能扩展到十亿级节点。"
    },
    {
      "question": "图推荐和双塔召回怎么结合？",
      "answer": "可用图模型产出更丰富的 user/item embedding 作为双塔的初始化或特征，再接 ANN 检索，兼顾图的高阶信号与召回路的线上效率。"
    }
  ],
  "followUpAnswers": [
    "PinSAGE 用随机游走重要性采样替代均匀采样，并用生产者-消费者模式做高效 mini-batch 聚合，配合局部图裁剪，能扩展到十亿级节点。",
    "可用图模型产出更丰富的 user/item embedding 作为双塔的初始化或特征，再接 ANN 检索，兼顾图的高阶信号与召回路的线上效率。"
  ]
};
