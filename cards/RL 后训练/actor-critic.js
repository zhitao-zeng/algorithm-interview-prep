export default {
  "kind": "concept",
  "id": "actor-critic",
  "category": "RL 后训练",
  "difficulty": "Hard",
  "title": "Actor-Critic",
  "prompt": "Actor-Critic 怎么结合策略梯度与价值学习？它为什么比纯 REINFORCE 稳？",
  "quickAnswer": "Actor(策略)负责输出动作并更新；Critic(价值)负责估计 V(s) 提供基线/优势。用 TD 残差 r+γV(s′)−V(s) 近似优势 A，代替 REINFORCE 的高方差整轨回报。这样就成单步、低方差、在线更新。",
  "approach": "Actor(策略)负责输出动作并更新；Critic(价值)负责估计 V(s) 提供基线/优势。用 TD 残差近似优势 A，代替 REINFORCE 的高方差整轨回报。",
  "explanationFocus": "Actor 学策略，Critic 学价值；TD 残差作优势降方差。",
  "bruteForce": "纯策略梯度高方差；纯价值法需显式策略派生。",
  "derivation": [
    "REINFORCE 用整轨 G 方差大。",
    "引入 Critic 估计 V，用一步 TD 残差当 A。",
    "Actor 用 A 更新，Critic 用回归 V 到 TD 目标。"
  ],
  "invariant": "Critic 误差=TD 目标与 V 之差；Actor 梯度权重=该 TD 残差(优势)。",
  "walkthrough": "一步：env 给 (s,a,r,s′)；算 A=r+γV(s′)−V(s)；Actor 减 logπ·A，Critic 回归 V→r+γV(s′)。",
  "edgeCases": [
    "Critic 偏差会偏置 Actor（虽方差低但有偏）。",
    "需平衡两者学习率。",
    "A 未归一仍可能不稳，常做归一。"
  ],
  "code": "# Python\ndef actor_critic_step(batch, actor, critic, opt, gamma=0.99):\n    v = critic(batch.s)\n    v_next = critic(batch.s2)\n    adv = batch.r + gamma * v_next - v           # TD 残差≈优势\n    pi_loss = -(actor.log_prob(batch.s, batch.a) * adv.detach()).mean()\n    v_loss = ((v - (batch.r + gamma * v_next).detach()) ** 2).mean()\n    (pi_loss + v_loss).backward(); opt.step()",
  "codeNotes": [
    "Actor 用 adv.detach() 避免梯度回传到 Critic 造成耦合。",
    "A2C 多步并行环境估计 A，A3C 异步。"
  ],
  "complexity": "每步一次 Critic 双前向 + Actor 前向，O(网络规模)；比 REINFORCE 省整轨回放。",
  "followUps": [
    {
      "question": "Actor-Critic 为什么比 REINFORCE 方差低？",
      "answer": "用单步 TD 残差近似 A 代替整条轨迹折扣回报 G，估计来自 Critic 的 bootstrapping，样本内方差大幅降低（代价是 Critic 偏差）。"
    },
    {
      "question": "A2C/A3C 是什么？",
      "answer": "A2C 同步多个环境并行采样本地估计优势；A3C 异步多 worker 更新同一参数，都是 Actor-Critic 的并行实现。"
    }
  ],
  "followUpAnswers": [
    "用 GAE 代替单步 TD 得到更平滑优势。",
    "Critic 学习率宜小于 Actor。"
  ],
  "pitfalls": [
    "Critic 太差导致 Actor 被带偏。",
    "A 未 detach 让两条梯度互相污染。"
  ],
  "beginnerSummary": "Actor-Critic 是“演员+评委”组合：Actor(演员)负责表演(选动作)并改进演技；Critic(评委)负责打分(估计每个状态值 V)。演员每走一步，评委说“这步比预期好/差多少”(TD 残差当优势 A)，演员就据此微调。因为评委给的是“一步评价”而非“整场总结”，所以比 REINFORCE 那种看完整个轨迹才点评要稳得多。",
  "prerequisites": [
    "策略梯度要低方差基线。",
    "价值函数可作基线/优势。",
    "演员与评委可分别参数化。"
  ],
  "workedExample": [
    "走一步得 r=1，V(s′)=5,V(s)=4 → A=1+0.9·5−4=1.5>0 提升该动作。",
    "Critic 把 V(s) 朝 1+0.9·5=5.5 回归。"
  ],
  "lineByLine": [
    "Critic 估计 V(s)、V(s′)。",
    "用 TD 残差 r+γV(s′)−V(s) 作优势 A。",
    "Actor 损失 −logπ·A 更新策略。",
    "Critic 回归 V 到 TD 目标 r+γV(s′)。"
  ],
  "diagram": "Actor(π) ──动作──▶ 环境 ──(s,a,r,s′)──┐\n   ▲                                 │\n   │ 梯度 ∝ A                        ▼\n Critic(V) ── A=r+γV(s′)−V(s) ──────┘"
};
