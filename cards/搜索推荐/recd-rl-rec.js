export default {
  "id": "recd-rl-rec",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "强化学习在推荐：长期收益与 Reward 设计",
  "difficulty": "Hard",
  "prompt": "为什么推荐系统会引入强化学习？如何设计 reward 来优化用户长期收益，并解决 off-policy 与线上线下一致性问题？",
  "quickAnswer": "RL 把推荐看成序列决策，能优化点击之外的长期指标（留存、时长）。Reward 常由即时互动+长期价值(LTV)折扣构成；off-policy 用 IPS 纠偏，线上线下一致性靠仿真器与一致性正则缓解分布漂移。",
  "code": "def discounted_return(rewards, gamma=0.9):\n    # 把会话内逐步 reward 折算成长期收益\n    G = 0.0\n    for r in reversed(rewards):\n        G = r + gamma * G\n    return G\n\ndef ips_weight(propensity, behavior=0.5):\n    # 用倾向分纠正 off-policy 样本分布偏差\n    return min(propensity / behavior, 5.0)  # 截断防极端",
  "complexity": "O(T) 回报计算 (T 会话步数)",
  "beginnerSummary": "推荐不是推一次就完事，而是连续翻页的过程。RL 考虑\"现在推这个，将来用户会不会更愿意留下来\"，而不是只盯眼前点击。",
  "explanationFocus": "是什么：强化学习在推荐中把系统建模为智能体，在\"状态(用户上下文)-动作(推荐列表)-奖励(用户反馈)\"的循环中学习最大化长期累积收益的策略。",
  "approach": "定义 reward = 即时互动 + γ·长期价值（次日留存/时长）；用 off-policy 算法(如 DQN/RLSVP)在日志上训练并用 IPS 纠偏；用用户仿真器做离线评估，加一致性正则缩小线上策略与训练分布差距。",
  "derivation": [
    "为什么需要：监督式 CTR 只优化单步点击，易诱导短视内容、损害长期留存。",
    "怎么实现：MDP 建模会话；reward 融合即时+长期；off-policy 训练 + IPS/DR 纠偏。",
    "有什么代价：奖励稀疏、方差大、训练不稳定，线上探索有业务风险。",
    "怎么评测：离线仿真 ROI、线上长期留存 A/B，而非单步 AUC。"
  ],
  "edgeCases": [
    "奖励极度稀疏（很少产生关注/留存信号）。",
    "短期 reward 与长期 reward 冲突需调 γ。",
    "线上策略漂移导致 IPS 权重极端需截断。"
  ],
  "pitfalls": [
    "reward 只设点击，RL 退化为监督学习。",
    "忽视 off-policy 偏差直接上线导致效果崩。"
  ],
  "prerequisites": [
    "MDP 与策略梯度基础",
    "因果推断(倾向分 IPS)"
  ],
  "workedExample": [
    "用户连续刷搞笑视频，单步点击高但 10 分钟后流失。",
    "RL 策略因长期 reward 低，主动插入一个知识视频降低即时点击却提升 7 日留存，体现长期优化。"
  ],
  "lineByLine": [
    "def discounted_return：把逐步 reward 折算为长期回报。",
    "for r in reversed：从后往前累加并乘折扣 γ。",
    "def ips_weight：计算倾向分纠正权重。",
    "min(...,5.0)：截断防止极端权重放大方差。"
  ],
  "followUps": [
    {
      "question": "RL 推荐的 reward 怎么避免被刷量？",
      "answer": "应混合行为质量信号（完播、真实互动、停留）与长期留存，并对异常高频互动做反作弊过滤，避免把刷量当正 reward。"
    },
    {
      "question": "离线怎么评估 RL 推荐？",
      "answer": "常用用户仿真器(learned simulator)批量回放策略，或用重加权(IPS/DR)在日志上估计策略价值，再小流量 A/B 验证。"
    }
  ],
  "followUpAnswers": [
    "应混合行为质量信号（完播、真实互动、停留）与长期留存，并对异常高频互动做反作弊过滤，避免把刷量当正 reward。",
    "常用用户仿真器(learned simulator)批量回放策略，或用重加权(IPS/DR)在日志上估计策略价值，再小流量 A/B 验证。"
  ],
  "order": 23
};
