export default {
  "kind": "concept",
  "id": "mdp-basics",
  "category": "RL 后训练",
  "difficulty": "Easy",
  "title": "MDP 基本要素",
  "prompt": "强化学习的 MDP 由哪些要素组成？折扣因子 γ 起什么作用？",
  "quickAnswer": "MDP = (S 状态, A 动作, P 转移, R 奖励, γ 折扣)。智能体在状态 s 按策略 π 选动作 a，环境按 P 转移到 s′ 并给奖励 r。γ∈[0,1) 把未来奖励折算到现在，越小越短视。",
  "approach": "MDP = (S 状态, A 动作, P 转移, R 奖励, γ 折扣)。γ∈[0,1) 把未来奖励折算到现在，越小越短视。",
  "explanationFocus": "五元组(S,A,P,R,γ)；γ 控制远视/短视。",
  "bruteForce": "无状态建模的贪心只盯即时奖励，忽略长期。",
  "derivation": [
    "决策有状态依赖，不能只看一步奖励。",
    "未来奖励不如即时可靠，需折扣。",
    "策略是状态到动作（或动作分布）的映射。"
  ],
  "invariant": "给定策略和 MDP，回报 G 是各步折扣奖励之和，期望值即价值。",
  "walkthrough": "用迷宫举例：状态=格子，动作=上下左右，奖励=到终点+1、撞墙−1。",
  "edgeCases": [
    "γ=0：完全短视；γ→1：近乎远视但可能发散。",
    "回合制(episodic) vs 连续任务(γ<1 必需)。",
    "状态不可完全观测→POMDP。"
  ],
  "code": "# Python\ndef rollout(policy, env, gamma=0.99, max_t=100):\n    s, G, traj = env.reset(), 0.0, []\n    for t in range(max_t):\n        a = policy(s)\n        s2, r = env.step(a)\n        G += (gamma ** t) * r          # 折扣累积回报\n        traj.append((s, a, r)); s = s2\n    return traj, G",
  "codeNotes": [
    "实际常用 GAE 而非朴素折扣回报以降低方差。",
    "γ 需与任务 horizon 匹配。"
  ],
  "complexity": "单次 rollout O(T·(推理+环境))；价值估计随样本数线性。",
  "followUps": [
    {
      "question": "为什么需要折扣因子？",
      "answer": "未来不确定且可能无限长，折扣保证回报有限、突出近期，并体现“早得奖励优于晚得”。"
    },
    {
      "question": "策略和转移概率谁未知？",
      "answer": "训练时环境转移 P 常未知（模型无关 RL 不去建模它），策略 π 是我们要学习的；部分方法会学动力学模型。"
    }
  ],
  "followUpAnswers": [
    "γ 取 0.99 是常见默认。",
    "POMDP 用观测而非真实状态。"
  ],
  "pitfalls": [
    "γ 太大导致回报发散、训练不稳。",
    "混淆状态与观测。"
  ],
  "beginnerSummary": "强化学习把问题抽象成“马尔可夫决策过程(MDP)”：你身处某个状态(比如迷宫的格子)，可以选择动作(上下左右)，环境据此把你送到新状态并给奖励(到终点加分)。策略就是“看到什么状态就做什么动作”的规则。折扣因子 γ 像“耐心程度”：γ 小你就只顾眼前，γ 大你愿意为长远收益等待。",
  "prerequisites": [
    "问题可分解为状态、动作、奖励。",
    "动作会改变状态并带来奖励。",
    "未来奖励需要打折以体现不确定性。"
  ],
  "workedExample": [
    "迷宫：状态=格子，动作=移动，到终点 r=+1，撞墙 r=−1。",
    "γ=0.9 时，第3步的+1 折算为 0.9³≈0.73 计入当前。"
  ],
  "lineByLine": [
    "定义状态空间 S 与动作空间 A。",
    "策略 π 决定每个状态下选什么动作。",
    "环境按转移 P 给出下一状态与奖励 r。",
    "折扣因子 γ 把未来 r 折算进回报 G。"
  ],
  "diagram": "s ─a─▶ P(s,a) ─▶ s′ , r\n策略π: s ─▶ a\n回报 G = r₀ + γ r₁ + γ² r₂ + ..."
};
