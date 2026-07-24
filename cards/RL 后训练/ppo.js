export default {
  "kind": "concept",
  "id": "ppo",
  "category": "RL 后训练",
  "difficulty": "Hard",
  "title": "PPO 近端策略优化",
  "prompt": "PPO 的 clip 目标是什么？它如何用重要性采样做“稳健”的策略更新？",
  "quickAnswer": "PPO 用重要性比率 ρ=π_new/π_old 加权优势，并对 ρ 做裁剪(clip 到 [1−ε,1+ε])，防止单步更新偏离旧策略太远。目标 L=−min(ρ·A, clip(ρ)·A)。配合 GAE 优势与多轮小批量 epoch，实现稳定高效的后训练。",
  "approach": "PPO 用重要性比率 ρ=π_new/π_old 加权优势，并对 ρ 做裁剪，防止单步更新偏离旧策略太远。目标 L=−min(ρ·A, clip(ρ)·A)。",
  "explanationFocus": "clip 限制更新幅度；重要性采样复用旧数据；GAE 给优势。",
  "bruteForce": "朴素策略梯度一步跨太大易崩溃；TRPO 约束复杂。",
  "derivation": [
    "直接用旧数据训新策略需重要性采样校正。",
    "ρ 过大说明偏离旧策略，更新不可信，需裁剪。",
    "clip 在 A>0 时封顶、A<0 时封底，等价于保守更新。"
  ],
  "invariant": "PPO 用 clipped surrogate：ρ 超出 [1-ε,1+ε] 时目标被 clip 为保守值，但不严格保证策略 KL 被限制在 ε-邻域、也不保证超范围样本梯度恒为 0；多轮 minibatch 更新后策略仍可能明显偏离。PPO 只保留了部分 trust-region 优点，并非严格约束。",
  "walkthrough": "对一批样本跑多 epoch：算 ρ、裁剪、取 min 得目标，反向更新。",
  "edgeCases": [
    "ε 过大退化为普通 PG，过小学不动。",
    "A 符号判定方向；A 归一影响步长。",
    "需 value clip 与 KL 早停防跑飞。"
  ],
  "code": "# Python\ndef ppo_clip_loss(logp_new, logp_old, adv, eps=0.2):\n    ratio = torch.exp(logp_new - logp_old)        # 重要性比率\n    unclipped = ratio * adv\n    clipped = torch.clamp(ratio, 1 - eps, 1 + eps) * adv\n    return -torch.min(unclipped, clipped).mean()  # 截断保守更新",
  "codeNotes": [
    "优势常用 GAE(λ) 计算，平衡偏差/方差。",
    "实际还加 value loss 与 entropy 项鼓励探索。"
  ],
  "complexity": "每批 K 个 epoch × 小批量前向，约 O(K·B·|θ|)；远低于重采样的 on-policy。",
  "followUps": [
    {
      "question": "clip 到底裁了什么？",
      "answer": "当 A>0 时限制 ratio 不超 1+ε（别太贪）；A<0 时限制 ratio 不低于 1−ε（别急着丢弃坏动作），等效把更新困在旧策略附近。"
    },
    {
      "question": "为什么 PPO 比 TRPO 常用？",
      "answer": "TRPO 用 KL 约束做共轭梯度，实现重；PPO 用 clip 近似同一约束，代码简单、超参少、效果接近。"
    }
  ],
  "followUpAnswers": [
    "用 GAE 计算优势。",
    "加 KL 早停作为第二道保险。"
  ],
  "pitfalls": [
    "ε 不当导致训练不稳或停滞。",
    "未复用旧 logp 导致 ratio 失真。"
  ],
  "beginnerSummary": "PPO 是现在大模型后训练(RLHF)的主力。核心思想“小步快跑”：我们有一批旧策略收集的数据，要用它改进新策略，但不能一步迈太大。PPO 用“重要性比率”衡量新旧策略差多少，再用 clip 把这个比率锁在 1±ε 的小圈里——好动作最多奖励一点，坏动作最多惩罚一点。这样既借助旧数据高效训练，又不会因为一步走偏而崩掉。",
  "prerequisites": [
    "旧策略数据可被新策略复用(重要性采样)。",
    "更新幅度需被约束以防崩溃。",
    "优势 A 决定动作方向。"
  ],
  "workedExample": [
    "A>0 且 ratio=1.5,ε=0.2 → 裁到 1.2，只按 1.2·A 更新。",
    "A<0 且 ratio=0.7 → 裁到 0.8，限制丢弃幅度。"
  ],
  "lineByLine": [
    "计算新旧策略对数概率比 ρ=exp(logp_new−logp_old)。",
    "未裁剪目标 = ρ·A。",
    "裁剪 ρ 到 [1−ε,1+ε] 得裁剪目标。",
    "取两者最小再取负作损失，保守更新。"
  ],
  "diagram": "ρ=π_new/π_old\nL = −min( ρ·A , clip(ρ,1−ε,1+ε)·A )\nA>0: 封顶1+ε | A<0: 封底1−ε"
};
