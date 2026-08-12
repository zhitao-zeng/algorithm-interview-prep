export default {
  "id": "rs-bandit",
  "kind": "concept",
  "category": "推荐系统",
  "title": "探索利用 Bandit：冷启动流量分配",
  "difficulty": "Medium",
  "prompt": "在新用户或新物料冷启动时，ε-greedy、UCB、Thompson Sampling 这几种 bandit 策略如何分配探索流量，上下文 bandit(LinUCB)又是怎样引入特征来个性化探索的？",
  "quickAnswer": "ε-greedy 以固定概率随机探索、否则贪心；UCB 用\"均值+置信半径\"偏好不确定物品；Thompson Sampling 从后验采样再贪心，理论 regret 更优。上下文 bandit 如 LinUCB 用特征估计每臂期望与置信区间，把探索做成个性化。冷启动靠这些策略给新用户/新物料保底曝光以快速累积反馈。",
  "code": "import numpy as np\nimport random\n\ndef eps_greedy(estimates, eps=0.1):\n    if random.random() < eps:\n        return random.randrange(len(estimates))   # 探索\n    return int(np.argmax(estimates))              # 利用\n\ndef ucb_score(avg, n_arm, n_total, c=1.0):\n    if n_arm == 0:\n        return float('inf')\n    return avg + c * np.sqrt(np.log(n_total + 1) / n_arm)\n\ndef linucb_score(x, A_inv, b, alpha=1.0):\n    # 上下文 x 下 UCB: theta_hat^T x + alpha * sqrt(x^T A^-1 x)\n    theta = A_inv @ b\n    bonus = alpha * np.sqrt(x @ (A_inv @ x))\n    return float(theta @ x + bonus)\n\ndef thompson_sample(alpha, beta):\n    return random.betavariate(alpha, beta)         # Beta 后验采样",
  "complexity": "ε-greedy/UCB: O(K)；LinUCB: O(d²) 每决策",
  "beginnerSummary": "餐厅新菜上架，老板不能只推招牌菜，也得随机给新菜一点出餐机会看客人反应；bandit 就是决定\"每桌多大概率试新菜\"的规则。",
  "explanationFocus": "是什么：探索利用 Bandit 是一类在\"推已知好内容(利用)\"与\"试探未知内容(探索)\"间权衡的在线决策框架；上下文 bandit 进一步用特征估计每臂回报与不确定性，实现个性化探索，常用于冷启动流量分配。",
  "approach": "无上下文用 ε-greedy/UCB/TS 按不确定性给新臂保底曝光；有特征用 LinUCB 以 theta^T x ± α√(x^T A⁻¹x) 做个性化 UCB，边服务边更新。",
  "derivation": [
    "为什么需要：新用户/新物料无历史反馈，纯利用会把它们饿死，需保底探索。",
    "怎么实现：维护每臂均值/计数或上下文线性参数，按 UCB/TS 选臂。",
    "有什么代价：探索浪费部分流量，短期指标受损，需控探索比例。",
    "怎么评测：累积 regret、冷启动物料后续转化率与长期留存。"
  ],
  "edgeCases": [
    "全新物料 n_arm=0，UCB 应返回 ∞ 优先探索或给先验均值。",
    "上下文高维时 LinUCB 的 A⁻¹ 维 d² 开销大，需低秩或在线近似。",
    "奖励非平稳(热点过期)需衰减计数或用滑动窗口更新。"
  ],
  "pitfalls": [
    "探索率 ε 固定拍脑袋，未随不确定性自适应衰减。",
    "把点击当唯一奖励，忽略负反馈，探索到低质内容。"
  ],
  "prerequisites": [
    "多臂老虎机(MAB)基础",
    "线性回归与置信区间"
  ],
  "workedExample": [
    "新物料设定 ε=0.1，则每 10 次曝光约 1 次强制探索；累积 50 次Trial 后均值 0.6、UCB 收敛，探索率可降到 0.02。",
    "LinUCB：某上下文 x 下 theta^T x=0.7，√(x^T A⁻¹x)=0.3，α=1，UCB=1.0>另一臂 0.85，选此臂；随 A 更新置信收缩、bonus 变小。"
  ],
  "lineByLine": [
    "def eps_greedy：以概率 eps 随机探索, 否则取当前最优。",
    "def ucb_score：均值加置信半径, 曝光越少半径越大。",
    "def linucb_score：用上下文线性参数算点估计与置信 bonus。",
    "def thompson_sample：从 Beta 后验采样一次用于贪心比较。"
  ],
  "followUps": [
    {
      "question": "UCB 和 Thompson Sampling 该选哪个？",
      "answer": "TS 理论 regret 更优且只需采样、实现简单，配合 Beta-Bernoulli 在推荐 EE 常见；UCB 更直观易调，二者在冷启动都可用，TS 更适合个性化后验。"
    },
    {
      "question": "上下文 bandit 和强化学习怎么区分？",
      "answer": "上下文 bandit 每步独立、状态即上下文、无跨步长期转移；RL 有状态转移与长期折扣回报。冷启动流量分配通常用 bandit 足够，无需完整 MDP。"
    }
  ],
  "followUpAnswers": [
    "TS 理论 regret 更优且只需采样、实现简单，配合 Beta-Bernoulli 在推荐 EE 常见；UCB 更直观易调，二者在冷启动都可用，TS 更适合个性化后验。",
    "上下文 bandit 每步独立、状态即上下文、无跨步长期转移；RL 有状态转移与长期折扣回报。冷启动流量分配通常用 bandit 足够，无需完整 MDP。"
  ],
  "order": 18
};
