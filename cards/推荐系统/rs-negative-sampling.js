export default {
  "id": "rs-negative-sampling",
  "kind": "concept",
  "category": "推荐系统",
  "title": "负采样策略：随机、in-batch 与 hard negative",
  "difficulty": "Medium",
  "prompt": "推荐系统的负采样有哪些常见方式(随机/in-batch/hard negative mining)，采样偏差会带来什么问题，又该如何用重要性采样或流行度纠偏来校正？",
  "quickAnswer": "随机负例从全库均匀(或流行度偏置)抽，简单但有偏差；in-batch 负例把同批其它用户的正例当本用户负例，极大增负例数但热门易被过度当负；hard negative 选模型当前分高的难负例提升区分度。偏差来自\"未曝光≠真负、热门过采样\"，可用 importance sampling(对抽样概率倒数加权)或 logQ 流行度纠偏。",
  "code": "import numpy as np\n\ndef _sigmoid(z):\n    return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))\n\ndef in_batch_softmax_loss(scores, logQ=None):\n    # scores: (B, B) 用户-物品打分, 对角线为 (u,u) 正例\n    # logQ: 长度 B, 物品被抽作负例的 log 概率, 用于纠偏\n    B = scores.shape[0]\n    loss = 0.0\n    for i in range(B):\n        pos = scores[i, i]\n        denom = 0.0\n        for j in range(B):\n            if j == i:\n                continue\n            w = 0.0 if logQ is None else logQ[j]\n            denom += np.exp(scores[i, j] - w)   # 减去流行度偏置\n        loss += -(pos - np.log(denom))\n    return loss / B\n\ndef sample_hard_neg(user_emb, item_emb, k=5):\n    # 取打分最高的 k 个未交互物品作 hard negative\n    scores = item_emb @ user_emb\n    return np.argsort(-scores)[:k]",
  "complexity": "in-batch softmax: O(B²)；hard neg 检索: O(N·d)",
  "beginnerSummary": "教分类器认猫，不能只拿狗当反例(太容易)，偶尔也该拿\"薮猫\"这种难区分的当反例；但别老拿网红猫当反例，否则模型以为所有猫都该被排除。",
  "explanationFocus": "是什么：负采样是为隐式反馈构造训练负例的策略集合，含随机采样、in-batch 负例与 hard negative mining，目标是高效且无偏地学习\"用户偏好正例甚于负例\"。",
  "approach": "随机/in-batch 提供充足负例，hard negative 提升难度；用重要性采样权重 1/P(采样) 或减去 logQ 流行度偏置来校正\"曝光未点击≠真负、热门过采样\"带来的选择偏差。",
  "derivation": [
    "为什么需要：隐式反馈只有正例，必须造负例，否则模型全预测为正。",
    "怎么实现：随机抽/同批借负/in-batch softmax；hard neg 取高分未交互项。",
    "有什么代价：in-batch 热门被过度当负，hard neg 难例若太难会训练不稳。",
    "怎么评测：看纠偏后离线 NDCG 与线上 CTR，对比未纠偏基线。"
  ],
  "edgeCases": [
    "曝光未点击(轻轻一点划走)不是真负例，直接当负会引入噪声标签。",
    "in-batch 中其它用户的正例被借作负例，但该物品用户本也可能喜欢。",
    "hard negative 比例过高(>20%)易训崩，需控制如 5%~10%。"
  ],
  "pitfalls": [
    "用全局均匀随机负例，忽略热门物品过采样，模型偏向冷门。",
    "把 logQ 纠偏项符号写反(应减去而非加上流行度偏置)。"
  ],
  "prerequisites": [
    "BPR 与 pairwise 损失",
    "重要性采样与偏差校正基础"
  ],
  "workedExample": [
    "batch B=4096 的 in-batch 设置下，每用户获得约 4095 个负例，相比随机采 k=5 提供约 819 倍负例/步，显存换样本效率。",
    "logQ 纠偏：某热门物品被抽作负例概率 P=0.05，logQ=-3.0；减去该项使热门负例贡献降权，纠偏前 NDCG@10=0.38、纠偏后 0.41。"
  ],
  "lineByLine": [
    "def in_batch_softmax_loss：对每个用户用批内其它物品作负例做 softmax。",
    "w = logQ[j]：取出该负例的流行度偏置对数。",
    "denom += exp(scores[i,j] - w)：减去偏置等于给热门负例降权。",
    "def sample_hard_neg：取模型当前打分最高的 k 个未交互物品为 hard neg。"
  ],
  "followUps": [
    {
      "question": "曝光未点击为什么不能直接当真负例？",
      "answer": "未点击可能是位置靠后、重复曝光或用户当时无意愿，并不代表真不喜欢；直接当负会引入 selection bias，应考虑用曝光未点击单独建模或降权。"
    },
    {
      "question": "in-batch 负例和随机负例怎么选？",
      "answer": "in-batch 省采样且负例随模型变难(自对抗)，但要 logQ 纠偏；随机负例无批内泄露但需额外采样。大模型常混合两者。"
    }
  ],
  "followUpAnswers": [
    "未点击可能是位置靠后、重复曝光或用户当时无意愿，并不代表真不喜欢；直接当负会引入 selection bias，应考虑用曝光未点击单独建模或降权。",
    "in-batch 省采样且负例随模型变难(自对抗)，但要 logQ 纠偏；随机负例无批内泄露但需额外采样。大模型常混合两者。"
  ],
  "order": 14
};
