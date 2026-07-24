export default {
  "kind": "concept",
  "id": "value-q-advantage",
  "category": "RL 后训练",
  "difficulty": "Medium",
  "title": "价值 V / 动作价值 Q / 优势 A",
  "prompt": "价值函数 V(s)、动作价值 Q(s,a) 和优势函数 A(s,a) 分别是什么？它们之间什么关系？",
  "quickAnswer": "V(s)=从 s 出发按策略的期望回报；Q(s,a)=在 s 执行 a 后再按策略的期望回报；A(s,a)=Q(s,a)−V(s)，衡量“这个动作比平均好多少”。关系：V(s)=E_a[Q(s,a)]，A=Q−V。",
  "approach": "V(s)=从 s 出发按策略的期望回报；Q(s,a)=在 s 执行 a 后再按策略的期望回报；A(s,a)=Q(s,a)−V(s)，衡量“这个动作比平均好多少”。",
  "explanationFocus": "V 状态均值, Q 含动作, A=Q−V 表示相对好坏。",
  "bruteForce": "只看即时奖励忽略基线，梯度方差大。",
  "derivation": [
    "V 评估状态本身好坏，Q 评估“某动作”好坏。",
    "同一状态下不同动作孰优，用 Q−V 即优势最直观。",
    "策略梯度用 A 作基线，正优势提升概率、负优势压低。"
  ],
  "invariant": "对所有动作取期望，A 的均值（关于策略）为 0，故 V=E[Q]。",
  "walkthrough": "画表格：状态 s 下动作 a1,a2 的 Q，平均得 V，差值得 A。",
  "edgeCases": [
    "Q 估计偏差会连带污染 A。",
    "离散动作 A 易算；连续动作需采样近似。",
    "V 与 Q 尺度不一致需归一。"
  ],
  "code": "# Python\ndef advantage(q, v, s, a, s2, r, gamma=0.99):\n    q_sa = q(s, a)                      # 动作价值\n    v_s = v(s)\n    return q_sa - v_s                   # A = Q - V",
  "codeNotes": [
    "实际常用 TD 残差 r+γV(s′)−V(s) 近似 A（单步）。",
    "GAE 用多步 TD 残差指数加权平均得到更平滑 A。"
  ],
  "complexity": "估计 V/Q 各 O(网络前向)；优势为差运算 O(1)。",
  "followUps": [
    {
      "question": "为什么策略梯度爱用优势而不是 Q？",
      "answer": "A=Q−V 减掉了状态基线 V，只保留“动作相对平均的好坏”，降低梯度方差，训练更稳。"
    },
    {
      "question": "V 和 Q 如何互相得到？",
      "answer": "V(s)=Σ_a π(a|s)Q(s,a)；Q(s,a)=E[r+γV(s′)|s,a]。二者通过 Bellman 方程耦合。"
    }
  ],
  "followUpAnswers": [
    "用 GAE 把多步 TD 残差加权。",
    "Critic 输出 V，Actor 用 A 更新。"
  ],
  "pitfalls": [
    "用错基线符号导致梯度方向反了。",
    "Q 偏差使 A 整体偏移仍可用(只差常数)但方差大。"
  ],
  "beginnerSummary": "想象你在路口(V 表示这个路口平均有多好)。选“左转”这个动作后整体能拿到多少分，就是 Q(左转)。优势 A = Q − V，意思是“左转比在这个路口的平均水平好多少”。A 为正说明这步走对了，为负说明不如平均。强化学习就靠 A 来奖惩动作：A 正就多这么走，A 负就少这么走。",
  "prerequisites": [
    "状态有“平均好坏” V。",
    "动作有“选了之后的好坏” Q。",
    "相对好坏 A=Q−V 更适合做梯度信号。"
  ],
  "workedExample": [
    "路口 V=5；左转 Q=8→A=+3(好)；右转 Q=3→A=−2(差)。",
    "策略梯度对 A>0 的动作提升概率。"
  ],
  "lineByLine": [
    "V(s)：按策略从 s 出发的期望回报。",
    "Q(s,a)：在 s 做 a 后继续期望回报。",
    "V(s)=对各动作 Q 按策略取期望。",
    "A(s,a)=Q(s,a)−V(s) 作为相对优势基线。"
  ],
  "diagram": "V(s) ── 平均\n  ├─ a1: Q=8 → A=+3 ✅\n  └─ a2: Q=3 → A=−2 ❌"
};
