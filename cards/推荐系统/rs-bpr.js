export default {
  "id": "rs-bpr",
  "kind": "concept",
  "category": "推荐系统",
  "title": "排序学习范式与 BPR 贝叶斯个性化排序",
  "difficulty": "Medium",
  "prompt": "排序学习有 pointwise/pairwise/listwise 三种范式，BPR(贝叶斯个性化排序)是如何用\"用户对正例的偏好高于负例\"这一概率假设来构造损失并最大化后验的？",
  "quickAnswer": "Pointwise 把排序当单点回归/分类，pairwise 只关心正负例相对序(BPR 即此类)，listwise 直接优化整列排序指标。BPR 假设观测偏好由潜因子内积加高斯噪声生成，最大化\"用户更偏好正例而非负例\"的后验概率，得到 -ln σ(x_ui - x_uj) 损失。它天然契合隐式反馈(点击即正、未点击即负采样)。",
  "code": "import numpy as np\n\ndef _sigmoid(z):\n    return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))\n\ndef bpr_loss(user_emb, pos_emb, neg_emb):\n    # 三元组 (u, i正, j负): 建模 x_ui > x_uj\n    x_ui = float(user_emb @ pos_emb)\n    x_uj = float(user_emb @ neg_emb)\n    return -np.log(_sigmoid(x_ui - x_uj))     # 最大化后验的负对数\n\ndef bpr_batch(U, P, N, reg=1e-4):\n    loss = bpr_loss(U, P, N)\n    return loss + reg * (np.sum(U**2) + np.sum(P**2) + np.sum(N**2))",
  "complexity": "每三元组 O(d)，d 为 embedding 维度；整批 O(B·d)",
  "beginnerSummary": "考试排名时，pointwise 只管每题对不对，pairwise 只问\"A 该排在 B 前吗\"，listwise 看整张榜单。BPR 选 pairwise：只要你知道的喜欢的，比随机没看过的更靠前就行。",
  "explanationFocus": "是什么：BPR(贝叶斯个性化排序)是一类 pairwise 排序损失，它假设用户对正例的偏好分数高于负例，并以最大化该偏序的后验概率来学习潜因子，广泛用于隐式反馈召回/排序。",
  "approach": "从\"用户 u 更偏好 i 而非 j\"的似然 P(i>_u j)=σ(x_ui - x_uj) 出发，取负对数得 BPR 损失，配合 L2 正则最大化后验。",
  "derivation": [
    "为什么需要：隐式反馈只有正例(点击)，pointwise 难以定义负标签，需成对相对序建模。",
    "怎么实现：似然 σ(x_ui - x_uj)，负对数损失 -ln σ(x_ui - x_uj) + λ‖Θ‖²。",
    "有什么代价：依赖负采样质量，随机负例带来偏差，且只考虑成对忽略整列序。",
    "怎么评测：离线用 AUC/Recall@K/NDCG，线上看 CTR/时长，对比 pointwise 基线。"
  ],
  "edgeCases": [
    "负例若恰好是用户未来会喜欢但未曝光物品，会引入假负例噪声。",
    "用户只交互过 1 个物品时，正例少导致梯度稀缺，需加权或借物品相似。",
    "分数差 x_ui - x_uj 极大时 sigmoid 趋 0，需 clip 防 log(0)。"
  ],
  "pitfalls": [
    "把未点击当确定负例直接做 pointwise 二分类，忽略曝光偏置。",
    "负采样只用全局随机，热门物品被过度当负例，需流行度校正。"
  ],
  "prerequisites": [
    "矩阵分解与潜因子模型",
    "极大似然与贝叶斯后验基础"
  ],
  "workedExample": [
    "三元组 (u, i, j)：x_ui=1.2, x_uj=0.3，差 0.9；σ(0.9)=0.711，BPR 损失 -ln(0.711)=0.341。",
    "若把负例 j 换成更相关的 j'：x_uj'=0.9，差 0.3，σ=0.574，损失升到 0.556，说明 harder 负例给更强梯度。"
  ],
  "lineByLine": [
    "def _sigmoid：做 clip 防止 exp 溢出。",
    "def bpr_loss：算用户-正例与用户-负例的分数差。",
    "return -log(sigmoid(x_ui - x_uj))：差越大损失越小, 符合偏序。",
    "def bpr_batch：加 L2 正则项, 等价于最大化后验 MAP。"
  ],
  "followUps": [
    {
      "question": "BPR 与 pointwise 逻辑回归损失有何本质区别？",
      "answer": "逻辑回归对每样本独立建模绝对点击概率，BPR 对正负例对建模相对序；前者需显式负标签且受曝光偏置影响，后者用采样负例直接优化排序。"
    },
    {
      "question": "BPR 的负采样怎么选更合理？",
      "answer": "优先用流行度校正(如 P(j)∝pop^0.75)的随机负例，再混入少量 hard negative；也可用 in-batch 负例，但要扣除采样偏置。"
    }
  ],
  "followUpAnswers": [
    "逻辑回归对每样本独立建模绝对点击概率，BPR 对正负例对建模相对序；前者需显式负标签且受曝光偏置影响，后者用采样负例直接优化排序。",
    "优先用流行度校正(如 P(j)∝pop^0.75)的随机负例，再混入少量 hard negative；也可用 in-batch 负例，但要扣除采样偏置。"
  ],
  "order": 13
};
