export default {
  "kind": "concept",
  "id": "bellman-qlearning",
  "category": "RL 后训练",
  "difficulty": "Medium",
  "title": "Bellman 方程与 Q-Learning",
  "prompt": "Bellman 方程是什么？Q-Learning 如何利用它做离策略 TD 更新？",
  "quickAnswer": "Bellman 方程给出价值的最优自洽关系：Q*(s,a)=E[r+γ·max_a′ Q*(s′,a′)]。Q-Learning 用样本 (s,a,r,s′) 做一步 TD 更新：Q←Q+α[r+γ·max_a′ Q(s′,a′)−Q(s,a)]，目标是逼近 Q*；它离线策略（行为策略可不同于目标贪心策略）。",
  "approach": "Bellman 方程给出价值的最优自洽关系；Q-Learning 用样本做一步 TD 更新逼近 Q*，且是离策略。",
  "explanationFocus": "Bellman=自洽递归；Q-Learning=用 max 的 TD 误差逼近最优 Q。",
  "bruteForce": "直接枚举策略难；表格法状态大时存不下 Q。",
  "derivation": [
    "最优价值可递归定义：当前决策值=即时+未来最优。",
    "用采样估计右侧期望，得到 TD 目标。",
    "max 操作使目标趋向最优，故为离策略。"
  ],
  "invariant": "收敛时 Q 满足 Bellman 最优方程；TD 误差=目标−当前。",
  "walkthrough": "单步更新：看到 (s,a,r,s′)，用 r+γ max Q(s′,·) 作目标修正 Q(s,a)。",
  "edgeCases": [
    "学习率 α 过大震荡、过小慢。",
    "探索不足陷入次优（需 ε-贪婪）。",
    "函数逼近下 Q-Learning 可能不收敛（需目标网络）。"
  ],
  "code": "# Python\ndef q_learning_update(q, s, a, r, s2, alpha=0.1, gamma=0.99):\n    target = r + gamma * max(q(s2, a2) for a2 in ACTIONS)  # 离线最优\n    td_error = target - q(s, a)\n    q[s, a] += alpha * td_error           # 朝 Bellman 目标逼近\n    return td_error",
  "codeNotes": [
    "深度版用目标网络冻结提供稳定 target。",
    "max 带来过估计，Double DQN 用两套网络缓解。"
  ],
  "complexity": "表格法 O(|A|) 取 max；深度 Q 网络 O(网络前向×2)。",
  "followUps": [
    {
      "question": "为什么 Q-Learning 是离策略？",
      "answer": "更新目标是贪心 max Q(s′,·)，不依赖实际采样的动作 a′，所以收集数据的行为策略(如 ε-贪婪)可与目标策略不同。"
    },
    {
      "question": "TD 误差代表什么？",
      "answer": "TD 误差=“一步实际+未来估计”与“当前估计”的差距，驱动 Q 向 Bellman 目标收缩。"
    }
  ],
  "followUpAnswers": [
    "用 ε-贪婪保证探索。",
    "Double DQN 解耦选动作与算值。"
  ],
  "pitfalls": [
    "忽略探索导致次优。",
    "函数逼近无目标网络时发散。"
  ],
  "beginnerSummary": "Bellman 方程是个“自我一致”的真理：一个状态动作的价值，等于“立刻拿到的奖励”加上“之后按最优玩法能拿到的折扣价值”。Q-Learning 把这个关系变成学习方法：每走一步，就用“实际奖励+下一步最大 Q”去修正当前 Q 的估计，误差叫 TD 误差。它像“边走边校准地图”，而且不要求你当时真走了最优步（离策略）。",
  "prerequisites": [
    "价值可递归定义（当前=即时+未来）。",
    "max 对应最优动作选择。",
    "TD 误差驱动估计逼近真值。"
  ],
  "workedExample": [
    "(s,a,r=1,s′)，max Q(s′)=0.8，γ=0.9 → 目标=1+0.72=1.72，Q 向它靠拢。",
    "ε-贪婪探索保证见过足够 (s,a)。"
  ],
  "lineByLine": [
    "采样得到转移 (s,a,r,s′)。",
    "用 max_a′ Q(s′,a′) 估算未来最优。",
    "构造 TD 目标 r+γ·max。",
    "用 α·(目标−Q) 更新 Q(s,a)。"
  ],
  "diagram": "Q(s,a) ──▶ r + γ·max Q(s′,a′)\n   ▲                │\n   └──── α·TD误差 ◀─┘   (TD 目标)"
};
