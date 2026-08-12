export default {
  "id": "rs-eval",
  "kind": "concept",
  "category": "推荐系统",
  "title": "推荐系统评估：离线指标与在线实验",
  "difficulty": "Medium",
  "prompt": "推荐系统的离线评估有哪些核心指标(HR/NDCG@K/Recall/MAP)，它们各自怎么算，在线又要看哪些指标，离线-在线指标之间为何常出现 gap？",
  "quickAnswer": "离线常用 HR@K(前 K 是否命中任一带标签相关项)、Recall@K(命中相关项占比)、NDCG@K(带位置折扣的命中质量)、MAP(多查询平均精度)。在线看 AB 实验的 CTR、留存、时长、GMV 等业务指标。离线-在线 gap 来自曝光偏置、离线用历史曝光日志而线上是模型决定曝光、以及离线只评排序不评多样性/新颖性。",
  "code": "import numpy as np\n\ndef ndcg_at_k(ranked, relevant, k=10):\n    dcg = 0.0\n    for i, item in enumerate(ranked[:k], start=1):\n        if item in relevant:\n            dcg += 1.0 / np.log2(i + 1)\n    idcg = sum(1.0 / np.log2(i + 1) for i in range(1, min(len(relevant), k) + 1))\n    return dcg / idcg if idcg > 0 else 0.0\n\ndef recall_at_k(ranked, relevant, k=10):\n    hit = len(relevant & set(ranked[:k]))\n    return hit / len(relevant) if relevant else 0.0\n\ndef hit_rate_at_k(ranked, relevant, k=10):\n    return 1.0 if relevant & set(ranked[:k]) else 0.0",
  "complexity": "各指标 O(K)，K 截断长度",
  "beginnerSummary": "离线指标像考试标准答案打分(前10名里有没有对的、排多靠前)，在线指标像开店真实营收(客人点没点、留没留)；考高分不一定真旺铺，因为考题是旧卷子。",
  "explanationFocus": "是什么：推荐系统评估分离线(用历史日志算排序质量指标)与在线(用 AB 实验算业务指标)两层；NDCG@K/Recall@K/HR/MAP 衡量离线排序质量，CTR/留存/时长衡量在线价值。",
  "approach": "离线用带标签测试集算 HR/Recall/NDCG/MAP 看排序能力；在线用随机分流 AB 实验看业务指标；用偏差分析与全链路复盘解释两者 gap。",
  "derivation": [
    "为什么需要：上线有风险且贵，需离线先粗筛，再用线上实验确证业务收益。",
    "怎么实现：离线按排名算各指标；在线做 AA/AB 与显著性检验。",
    "有什么代价：离线指标只看排序忽略多样性/时延，线上受新奇效应与季节影响。",
    "怎么评测：以线上 CTR/留存为最终判据，离线指标仅作相关性参考。"
  ],
  "edgeCases": [
    "相关集为空时 Recall/NDCG 定义为 0 或剔除，需统一避免平均失真。",
    "AB 实验流量不足时差异不显著，需算最小样本量与 p 值。",
    "新用户/新物品在日志里极少，离线指标对其不具代表性。"
  ],
  "pitfalls": [
    "只盯离线 AUC 涨点就上线，忽略线上多样性与负反馈导致留存掉。",
    "用全量日志(含自身曝光)做离线评估，产生信息泄露与乐观偏差。"
  ],
  "prerequisites": [
    "信息检索评价指标基础",
    "AB 实验与统计显著性"
  ],
  "workedExample": [
    "排序 [a,b,c,d,e,...]，相关集 {c,f}；c 在第 3 位贡献 1/log2(4)=0.5，DCG=0.5；IDCG 为两相关项在 1、2 位 1+0.5=1.5，NDCG@10=0.5/1.5≈0.333。",
    "同例 Recall@10=1/2=0.5(2 个相关项中命中 c 1 个)，HR@10=1(前10含 c)；若 k 缩到 2 则 HR=0、Recall=0。"
  ],
  "lineByLine": [
    "def ndcg_at_k：累加命中项的位置折扣增益得 DCG。",
    "idcg = 理想 DCG：相关项全排最前的增益和。",
    "return dcg/idcg：归一化到 0~1, 兼顾命中与位置。",
    "def recall_at_k：命中相关项数除以相关项总数。"
  ],
  "followUps": [
    {
      "question": "NDCG 相比 HR 好在哪？",
      "answer": "HR 只看前 K 是否命中、不区分位置；NDCG 用 log 折扣奖励更靠前的命中，更能反映用户真实注意力衰减，适合精排评估。"
    },
    {
      "question": "离线涨点但线上没涨，可能什么原因？",
      "answer": "常见有曝光偏置(离线用历史曝光日志)、位置偏差、多样性/新颖性被牺牲、新奇效应，或离线指标与最终业务目标弱相关，需做全链路归因。"
    }
  ],
  "followUpAnswers": [
    "HR 只看前 K 是否命中、不区分位置；NDCG 用 log 折扣奖励更靠前的命中，更能反映用户真实注意力衰减，适合精排评估。",
    "常见有曝光偏置(离线用历史曝光日志)、位置偏差、多样性/新颖性被牺牲、新奇效应，或离线指标与最终业务目标弱相关，需做全链路归因。"
  ],
  "order": 19
};
