export default {
  "kind": "concept",
  "id": "policy-gradient",
  "category": "RL 后训练",
  "difficulty": "Hard",
  "title": "策略梯度与 REINFORCE",
  "prompt": "策略梯度定理说了什么？REINFORCE 算法怎么用回报更新策略？",
  "quickAnswer": "策略梯度定理给出 ∇J(θ)=E[∇log π(a|s)·G]，即沿着“能带来高回报的动作的对数概率”方向提升参数。REINFORCE 用整条轨迹的折扣回报 G 作权重做蒙特卡洛更新：对高 G 的动作提高 π，低 G 的降低。",
  "approach": "策略梯度定理给出 ∇J(θ)=E[∇log π(a|s)·G]。REINFORCE 用整条轨迹的折扣回报 G 作权重做蒙特卡洛更新。",
  "explanationFocus": "直接对策略参数求导；用回报作为动作概率的权重。",
  "bruteForce": "枚举策略空间不可行；需要可微参数化策略。",
  "derivation": [
    "想要最大化期望回报 J，直接对 π_θ 求梯度。",
    "对数技巧把期望梯度转成对 log π 的期望。",
    "用采样轨迹的回报 G 无偏估计权重。"
  ],
  "invariant": "更新方向为 E[∇logπ·G]；基线减法不改变期望但降方差。",
  "walkthrough": "采样一条轨迹，倒推折扣回报，对每个 (s,a) 加 ∇logπ·G 更新。",
  "edgeCases": [
    "高方差：需减基线 b(s)（常取 V(s)）。",
    "整条轨迹才更新，样本效率低。",
    "奖励尺度敏感，需归一。"
  ],
  "code": "# Python\ndef reinforce(policy, traj, optimizer, gamma=0.99):\n    returns, G = [], 0.0\n    for (s, a, r) in reversed(traj):\n        G = r + gamma * G; returns.insert(0, G)     # 折扣回报\n    loss = 0\n    for (s, a, r), Gt in zip(traj, returns):\n        loss += -policy.log_prob(s, a) * Gt         # 高回报→提升概率\n    loss.backward(); optimizer.step()",
  "codeNotes": [
    "实际会除以轨迹长度或用基线 V 减偏。",
    "REINFORCE 是无偏但高方差的蒙特卡洛方法。"
  ],
  "complexity": "每轨迹一次前向+反向 O(T·|θ|)；方差大需多轨迹平均。",
  "followUps": [
    {
      "question": "为什么用 log π 而不是 π？",
      "answer": "对数梯度技巧 ∇π/π=∇logπ，使权重与 π 成比例且数值稳定，且对乘性常数不敏感。"
    },
    {
      "question": "怎么降方差？",
      "answer": "减去状态基线 b(s)≈V(s) 得到优势 A，REINFORCE 变成带基线的策略梯度；或引入 Critic(Actor-Critic)。"
    }
  ],
  "followUpAnswers": [
    "用滑动平均 V 作基线。",
    "多个并行环境采轨迹平均梯度。"
  ],
  "pitfalls": [
    "未减基线导致方差爆炸。",
    "回报未归一使学习率难调。"
  ],
  "beginnerSummary": "策略梯度思路很直接：我们不去算“每个动作多好”(Q)，而是直接调“策略”这个旋钮。定理告诉我们，某个动作带来的回报越高，就越该提高它出现的概率——数学上就是把“对数概率 × 回报”作为梯度方向。REINFORCE 是最朴素的实现：跑完一整条轨迹，用总回报给每一步的动作为正/负样本，回报高的就多学、低的就少学。缺点是很“抖”（方差大），所以常减一个基线。",
  "prerequisites": [
    "策略可用参数 θ 表示并求梯度。",
    "回报越高动作越该被鼓励。",
    "对数梯度技巧使更新数值稳定。"
  ],
  "workedExample": [
    "轨迹动作 a 拿到 G=+10 → 提高 π(a|s)；G=−2 → 降低。",
    "减基线 b=5：A=G−b，正例更突出。"
  ],
  "lineByLine": [
    "采样整条轨迹得到 (s,a,r) 序列。",
    "倒推计算各步折扣回报 G_t。",
    "构造损失 −Σ logπ(a|s)·G_t。",
    "反向传播更新策略参数 θ。"
  ],
  "diagram": "θ ─▶ π_θ ─▶ 动作 a\n        ▲           │\n        └─ 梯度 ∇logπ·G ── (G高: 提升)"
};
