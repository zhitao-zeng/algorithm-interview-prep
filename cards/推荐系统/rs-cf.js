export default {
  "id": "rs-cf",
  "kind": "concept",
  "category": "推荐系统",
  "title": "协同过滤：User/Item CF 与矩阵分解",
  "difficulty": "Medium",
  "prompt": "协同过滤如何用用户-物品交互矩阵做推荐？User CF 与 Item CF 有何区别，矩阵分解(SVD/ALS)又是如何解决稀疏与冷启动问题的？",
  "quickAnswer": "协同过滤基于\"相似用户喜欢相似物品\"的假设。User CF 用用户间相似度推荐邻居喜欢的物品，Item CF 用物品间相似度推相似物品；矩阵分解把交互矩阵拆成用户/物品隐向量，缓解稀疏并支持打分预测。",
  "code": "import numpy as np\n\ndef cosine_sim(a, b):\n    # 余弦相似度：a·b / (|a||b|)\n    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))\n\ndef predict_mf(user_vec, item_vec):\n    # 矩阵分解：用户/物品隐向量内积即预测评分\n    return float(np.dot(user_vec, item_vec))\n\n# SGD 更新隐向量（最小化 (r - u·v)^2）\nfor (u, i, r) in sampled_obs:\n    err = r - np.dot(U[u], V[i])\n    U[u] += lr * (err * V[i] - reg * U[u])\n    V[i] += lr * (err * U[u] - reg * V[i])",
  "complexity": "User/Item CF 相似度 O(N²·M) 预处理；MF 训练 O(iters·nnz·k)",
  "beginnerSummary": "如果你和朋友口味很像，系统就推荐你朋友喜欢而你没看过的电影——这就是协同过滤，靠\"群众口碑\"而非内容本身。",
  "explanationFocus": "是什么：协同过滤(CF)是一类仅利用用户-物品交互历史(无内容特征)做推荐的算法，核心假设是相似用户/相似物品有相似偏好，分为基于邻域的 User/Item CF 与基于模型的矩阵分解两类。",
  "approach": "User CF 计算用户相似度取 top-k 邻居做加权打分；Item CF 计算物品相似度推相似物品(更稳，因物品数相对稳定)；矩阵分解用隐向量内积拟合观测打分，未观测处也能预测，缓解稀疏。",
  "derivation": [
    "为什么需要：只有行为日志、无内容特征时，需要一种\"纯数据驱动\"的推荐方式。",
    "怎么实现：User CF 以余弦/皮尔逊算用户相似度再加权聚合邻居评分；Item CF 算物品共现相似度；MF 用 SGD/ALS 最小化 (r - u·v)² 学隐向量。",
    "有什么代价：交互矩阵极稀疏导致相似度不准、长尾物品曝光少；新用户/新物品无交互即冷启动；MF 训练有计算成本。",
    "怎么评测：离线用 RMSE/MAE(打分)、Recall@K/NDCG@K(TopK)；线上看 CTR/时长，并用留一法防泄露。"
  ],
  "edgeCases": [
    "新用户/新物品无任何交互→相似度无法计算，需冷启动策略兜底。",
    "热门物品与所有物品共现高导致相似度虚高，需做扣分/归一化。",
    "用户只给正向隐式反馈(点击无打分)时相似度需改用置信权重。"
  ],
  "pitfalls": [
    "直接用原始打分算余弦未去中心化，被用户打分尺度差异干扰(应皮尔逊)。",
    "相似度矩阵全量 O(N²) 存储爆炸，线上用 TopK 近邻+ANN 近似。"
  ],
  "prerequisites": [
    "向量相似度(余弦/皮尔逊)",
    "矩阵分解与梯度下降基础"
  ],
  "workedExample": [
    "用户 A=[5,?,4,1,?]，B=[4,?,5,?,2]，对共同评分物品(第1,3,4项)去中心化后算皮尔逊得 sim≈0.82。",
    "物品隐向量维度 k=32，ALS 迭代 10 次，RMSE 从 1.12 降到 0.74；对未评分(用户A,物品2)预测 u·v≈4.1。"
  ],
  "lineByLine": [
    "def cosine_sim：计算两向量的余弦相似度，衡量用户/物品相似程度。",
    "def predict_mf：用用户隐向量与物品隐向量的内积预测评分。",
    "for (u,i,r) in sampled_obs：对采样观测做 SGD 更新隐向量，缩小预测与真实差距。",
    "return np.dot(user_vec, item_vec)：未观测物品也能给出预测分，缓解稀疏。"
  ],
  "followUps": [
    {
      "question": "User CF 和 Item CF 哪个更常用？",
      "answer": "工业界更常用 Item CF：物品数相对稳定、相似度更稳，且用户兴趣漂移时物品相似度变化慢；User CF 在社交推荐、用户量少时更合适。"
    },
    {
      "question": "矩阵分解相对邻域 CF 最大好处是什么？",
      "answer": "MF 把稀疏矩阵补全为稠密隐向量，能对未观测项直接预测打分，并天然缓解稀疏与可扩展性问题；邻域法只能量化已共现的相似关系。"
    }
  ],
  "followUpAnswers": [
    "工业界更常用 Item CF：物品数相对稳定、相似度更稳，且用户兴趣漂移时物品相似度变化慢；User CF 在社交推荐、用户量少时更合适。",
    "MF 把稀疏矩阵补全为稠密隐向量，能对未观测项直接预测打分，并天然缓解稀疏与可扩展性问题；邻域法只能量化已共现的相似关系。"
  ],
  "order": 1
};
