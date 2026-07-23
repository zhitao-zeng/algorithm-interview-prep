export default {
  "kind": "concept",
  "id": "grpo",
  "category": "RL 后训练",
  "difficulty": "Hard",
  "title": "GRPO 分组相对优势",
  "prompt": "GRPO（Group Relative Policy Optimization）比 PPO 少了什么？它的“组内相对优势”怎么算？",
  "quickAnswer": "GRPO 去掉了 PPO 的 Critic/价值网络：对同一 prompt 采样一组(Group)回答，用组内奖励的均值和标准差做标准化得到每个回答的优势 A_i=(R_i−mean(R))/std(R)。这样优势来自“同组相对比较”而非价值网络，省显存、更稳，特别适合 LLM 后训练。",
  "approach": "GRPO 去掉 PPO 的 Critic：对同一 prompt 采样一组回答，用组内奖励的均值和标准差标准化得到优势 A_i=(R_i−mean(R))/std(R)。",
  "explanationFocus": "无 Critic；同 prompt 多采样组内归一化得优势。",
  "bruteForce": "PPO 需维护价值网络，显存与实现成本高。",
  "derivation": [
    "LLM 同一 prompt 可采多个回答，天然成组。",
    "组内相对好坏即优势，省去 Critic 估计 V。",
    "标准化让优势尺度稳定，配合 clip 更新。"
  ],
  "invariant": "组内优势均值≈0；优势完全由同组相对排名决定。",
  "walkthrough": "对 prompt 采样 G 个回答→打分 R_i→A_i=(R_i−μ)/σ→按 A_i 做带 clip 的策略梯度。",
  "edgeCases": [
    "组太小(如 G=2)标准差不稳。",
    "奖励尺度不一需组内归一。",
    "仍需 KL 或 clip 防跑偏。"
  ],
  "code": "# Python\ndef grpo_advantage(rewards, group, eps=1e-6):\n    mu = rewards[group].mean()                 # 同 prompt 组内均值\n    std = rewards[group].std() + eps\n    return (rewards[group] - mu) / std         # 组内相对优势",
  "codeNotes": [
    "组内可用奖励模型或规则/验证器打分。",
    "省掉 Critic 显著降低显存与训练不稳。"
  ],
  "complexity": "略去 Critic 前向，约省 1× 模型显存/计算；采样 G 个需 G 倍生成，但可与 PPO 同量级。",
  "followUps": [
    {
      "question": "GRPO 为什么更适合 LLM？",
      "answer": "LLM 推理对每个 prompt 可廉价采样多条回答，天然成组；去掉 Critic 既省显存又避免价值估计偏差，且组内相对比较对奖励绝对尺度不敏感。"
    },
    {
      "question": "和 PPO 的 A 有何本质不同？",
      "answer": "PPO 的 A 来自 Critic 的 V 估计(跨状态绝对基线)；GRPO 的 A 是同一 prompt 组内归一化(相对基线)，不依赖价值网络。"
    }
  ],
  "followUpAnswers": [
    "用 verifier/规则给可验证任务打分。",
    "组大小 G 取 4~16 较稳。"
  ],
  "pitfalls": [
    "组太小导致 std 噪声大。",
    "奖励未归一使优势尺度漂移。"
  ],
  "beginnerSummary": "GRPO 是 PPO 的“瘦身版”：PPO 要养一个额外的评委(Critic)来打分，GRPO 觉得没必要。它的诀窍是——同一个问题让模型一次生成好几个回答，然后比一比：这组的回答里谁分高谁分低，用“组内排名”当优势。这样不需要评委，省了显存也更稳，特别适合大模型（本来就能一次生成多个候选）。",
  "prerequisites": [
    "同一 prompt 可采样多个回答。",
    "需要组内相对比较而非绝对价值。",
    "仍用 clip 控制更新幅度。"
  ],
  "workedExample": [
    "prompt 采 4 答，奖励 [1,3,2,4] → μ=2.5 → A≈[−0.8,+0.3,−0.3,+1.0]。",
    "高 A 的回答提升概率，低 A 的下降。"
  ],
  "lineByLine": [
    "对同一 prompt 采样 G 个回答。",
    "用 RM/规则给每个回答打分 R_i。",
    "组内标准化 A_i=(R_i−μ)/σ。",
    "按 A_i 做带 clip 的策略梯度更新。"
  ],
  "diagram": "prompt ─▶ 采样 G 个回答\n   R: [1,3,2,4] → μ=2.5\n   A: [(1−2.5)/σ, (3−2.5)/σ, ...]\n   (无 Critic, 组内相对)"
};
