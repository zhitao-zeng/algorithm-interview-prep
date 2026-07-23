export default {
  "kind": "code",
  "id": "kmeans",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "K-Means",
  "prompt": "写出 KMeans 的 E/M 两步并说明空簇处理。",
  "quickAnswer": "E 步分配最近中心，M 步取簇均值；空簇可重置为最远样本。",
  "approach": "E 步分配最近中心，M 步取簇均值；空簇可重置为最远样本。",
  "explanationFocus": "K-Means：E 步分配最近中心，M 步取簇均值；空簇可重置为最远样本。",
  "bruteForce": "《K-Means》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "直接求全局最优是 NP-hard，故用 Lloyd 迭代求局部最优。",
    "E 步固定中心求最优分配，M 步固定分配求最优中心，两者交替使目标函数单调下降。",
    "迭代保证收敛（中心变化趋零），但结果依赖初值，可能陷局部最优。"
  ],
  "invariant": "实现始终保持 K-Means：E 步分配最近中心，M 步取簇均值；空簇可重置为最远样本。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《K-Means》，逐步核对形状和中间数值。",
  "edgeCases": [
    "k=1：所有点同属一簇，中心为全局均值。",
    "某簇为空：需处理（保留旧中心或随机重选）。",
    "迭代次数 0 或负：校验报错。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef kmeans(x, k, iterations=20, seed=0):\n    x = np.asarray(x, dtype=float)\n    if x.ndim != 2 or not 1 <= k <= len(x): raise ValueError(\"invalid x or k\")\n    if iterations <= 0: raise ValueError(\"iterations must be positive\")\n    rng = np.random.default_rng(seed); centers = x[rng.choice(len(x), size=k, replace=False)].copy()\n    for _ in range(iterations):\n        dist = ((x[:, None, :]-centers[None, :, :])**2).sum(axis=2); labels = dist.argmin(axis=1)\n        for j in range(k):\n            members = x[labels == j]\n            centers[j] = members.mean(axis=0) if len(members) else x[dist.min(axis=1).argmax()]\n    final_dist = ((x[:, None, :]-centers[None, :, :])**2).sum(axis=2)\n    return final_dist.argmin(axis=1), centers",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(n·k·d·iterations)，空间 O(n·k)。",
  "followUps": [
    {
      "question": "如何选择 K？",
      "answer": "可用 elbow 曲线、silhouette 分数或业务先验；K-Means 本身不自动决定 K。"
    },
    {
      "question": "为什么需要标准化特征？",
      "answer": "平方距离会被量纲大的维度支配，先标准化或使用合适距离能让各特征贡献可比。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "未校验 iterations>0，导致无效循环或除零（空簇均值）。",
    "初值敏感，单次运行可能陷局部最优（可多次重启取最好）。"
  ],
  "beginnerSummary": "K-Means 是无监督聚类：把 n 个点分成 k 个簇，使簇内点到簇中心的平方距离之和最小。迭代两步：E 步（Expectation）把每个点分配给最近的中心；M 步（Maximization）把每个中心更新为该簇所有点的均值。重复直到中心不再明显移动或达到最大迭代次数。",
  "prerequisites": [
    "用距离（通常欧氏距离）衡量点与中心的接近程度。",
    "中心数 k 需事先指定；初始中心常用随机选点或 k-means++ 策略。",
    "收敛判据：中心位移低于阈值或迭代次数到上限。"
  ],
  "workedExample": [
    "点群 •• 与 ••• 随机选 2 中心 c1、c2；E 步把每个点归到更近的中心；M 步把中心移到各自簇的均值。",
    "几次迭代后稳定为左侧一团、右侧一团，中心停在各自质心。"
  ],
  "lineByLine": [
    "校验 iterations>0（iterations<=0 报错），随机初始化 k 个中心。",
    "E 步：对每个点算到各中心距离，归入最近中心。",
    "M 步：中心 = 该簇点的均值（空簇可保留或重初始化）。",
    "重复至收敛或达 iterations，返回中心与标签。"
  ],
  "diagram": "点: • •    • • •\n随机选2中心: c1, c2\nE步: 每点归最近中心\nM步: 中心 = 簇均值\n迭代→\n  ••     •••\n  c1      c2\n直到中心稳定(收敛)"
};
