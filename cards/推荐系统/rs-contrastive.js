export default {
  "id": "rs-contrastive",
  "kind": "concept",
  "category": "推荐系统",
  "title": "对比学习推荐：自监督数据增强与 InfoNCE",
  "difficulty": "Hard",
  "prompt": "对比学习(SGL/CL4SRec)如何用结点丢弃、边扰动、特征掩码等数据增强构造正例视图，并用 InfoNCE 自监督信号来缓解推荐中的数据稀疏？",
  "quickAnswer": "SGL 对同一用户-物品子图做不同增强(随机丢结点/丢边/特征掩码)得到两个视图，互为正例、批内其它节点为负例，用 InfoNCE 拉紧正例、推远负例。CL4SRec 在序列上做裁剪/掩码/重排增强。自监督补全了监督信号稀缺时的结构/序列一致性约束，缓解稀疏与冷启动。",
  "code": "import numpy as np\n\ndef _cosine(a, b):\n    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))\n\ndef info_nce(z_i, z_j, z_all, tau=0.1):\n    # z_i, z_j: 同一节点两视图; z_all: 批内所有视图(含 z_j)\n    pos = np.exp(_cosine(z_i, z_j) / tau)\n    neg = sum(np.exp(_cosine(z_i, z) / tau) for z in z_all if not np.array_equal(z, z_j))\n    return -np.log(pos / (pos + neg))          # 单正多负的 InfoNCE\n\ndef sg_node_drop(adj, drop_rate=0.1):\n    # SGL: 随机丢弃结点构造另一增强视图\n    keep = np.random.rand(adj.shape[0]) > drop_rate\n    return adj[np.ix_(keep, keep)]",
  "complexity": "InfoNCE: O(B·d)；图增强: O(|E|)",
  "beginnerSummary": "同一张照片做左右翻转、调亮度，你仍认得是同一人；对比学习让模型也这样：同一用户图的两种\"变形\"必须是相似表示，顺便把不像的别人推远。",
  "explanationFocus": "是什么：对比学习推荐用数据增强从同一节点/序列构造多个视图，以 InfoNCE 自监督损失拉近同节点视图、推远异节点视图，从而在标注稀疏时学到鲁棒表示。",
  "approach": "对图做结点丢弃/边扰动/特征掩码(SGL)，或对序列做裁剪/掩码/重排(CL4SRec)生成正例对，用温度系数 τ 的 InfoNCE 对比批内负例训练。",
  "derivation": [
    "为什么需要：显式反馈极稀疏，监督召回信号不足，需自监督补约束。",
    "怎么实现：同节点两增强视图为正例，批内其余为负，InfoNCE 训练。",
    "有什么代价：增强太弱视图同质化学不到东西，太强破坏语义；需调 drop 率。",
    "怎么评测：Recall@20/NDCG@20，对比无增强基线及在冷启动子集上的提升。"
  ],
  "edgeCases": [
    "丢弃率过高(>0.5)会破坏图连通性，两视图语义不一致变成假正例。",
    "批内负例若含与正例高度相似节点，InfoNCE 易训错，需大 batch。",
    "特征掩码若遮掉关键 ID 特征，视图退化为随机，对比失效。"
  ],
  "pitfalls": [
    "把不同用户的视图当正例，违背\"同节点才正例\"的假设。",
    "温度 τ 设太小使负例贡献过锐、训练不稳，设太大则区分度不足。"
  ],
  "prerequisites": [
    "图神经网络与消息传播",
    "InfoNCE 与对比学习基础"
  ],
  "workedExample": [
    "SGL 结点丢弃率 0.1，两视图正例余弦相似度 0.85，批内 1024 负例均值 0.05；τ=0.1 时 InfoNCE 单样本损耗约 2.3。",
    "Yelp 上 SGL 相对 LightGCN 在稀疏用户(交互<10)子集 Recall@20 提升约 8%，说明自监督补了稀缺信号。"
  ],
  "lineByLine": [
    "def _cosine：计算两向量余弦相似度, 对比任务常用。",
    "def info_nce：分子为正例相似度指数, 分母为含所有负例之和。",
    "return -log(pos/(pos+neg))：拉近正例推远负例的标准 InfoNCE。",
    "def sg_node_drop：按丢弃率随机保留结点, 生成增强视图邻接矩阵。"
  ],
  "followUps": [
    {
      "question": "SGL 三种增强(结点丢弃/边扰动/特征掩码)怎么选？",
      "answer": "常取三者并集或多视图混合效果最好；边扰动保结构较稳，结点丢弃最强但易破连通，特征掩码只动特征。可用网格搜索或自适应组合。"
    },
    {
      "question": "对比学习与 BPR 损失能一起用吗？",
      "answer": "可以，主流做法是用 BPR/交叉熵做主监督损失，对比损失作正则项加权(如 λ=0.1)，既保排序信号又补结构一致性。"
    }
  ],
  "followUpAnswers": [
    "常取三者并集或多视图混合效果最好；边扰动保结构较稳，结点丢弃最强但易破连通，特征掩码只动特征。可用网格搜索或自适应组合。",
    "可以，主流做法是用 BPR/交叉熵做主监督损失，对比损失作正则项加权(如 λ=0.1)，既保排序信号又补结构一致性。"
  ],
  "order": 16
};
