export default {
  "kind": "concept",
  "id": "rlhf",
  "category": "RL 后训练",
  "difficulty": "Hard",
  "title": "RLHF 流程",
  "prompt": "RLHF（基于人类反馈的强化学习）整体流程是怎样的？奖励模型怎么训、怎么用？",
  "quickAnswer": "三步：(1) SFT 监督微调得到初始策略；(2) 收集人类偏好数据(chosen/rejected)训奖励模型 RM；(3) 以 RM 为环境奖励，用 PPO 优化策略，并以 KL 项约束不要偏离 SFT 策略太远。RM 用偏好对做二分类/ Bradley-Terry 建模。",
  "approach": "三步：(1) SFT 监督微调；(2) 训奖励模型 RM；(3) 以 RM 为奖励用 PPO 优化，并以 KL 约束。",
  "explanationFocus": "SFT→RM(偏好)→PPO+KL；RM 把“人喜欢”变成可微分数。",
  "bruteForce": "纯 SFT 难捕捉“好”的主观偏好；无 RM 则缺奖励信号。",
  "derivation": [
    "任务“好”难用规则奖励定义，需人类偏好。",
    "用偏好对训 RM 近似人类判断。",
    "PPO 用 RM 作奖励，KL 约束防跑飞/退化。"
  ],
  "invariant": "PPO 总奖励= RM(s,a) − β·KL(π‖π_ref)；β 控约束强度。",
  "walkthrough": "画流程：提示→SFT 模型→采样回答→人标偏好→训 RM→PPO 优化。",
  "edgeCases": [
    "RM 过优化(reward hacking)：策略钻 RM 空子。",
    "偏好数据偏差→RM 偏。",
    "KL 过大限制能力、过小退化。"
  ],
  "code": "# Python\ndef rlhf_step(policy, ref, reward_model, batch, beta=0.1):\n    logp = policy.log_prob(batch)\n    logp_ref = ref.log_prob(batch)\n    kl = logp - logp_ref                       # 与参考策略 KL\n    reward = reward_model(batch) - beta * kl   # 奖励 - KL 惩罚\n    return ppo_clip_loss(logp, batch.logp_old, reward)",
  "codeNotes": [
    "参考策略 π_ref 通常是 SFT 模型，冻结。",
    "常加 reward/clip 与 KL 早停稳定训练。"
  ],
  "complexity": "每步需 RM 前向 + 参考策略前向 + PPO 多 epoch，约 3× 推理成本于 SFT。",
  "followUps": [
    {
      "question": "为什么需要 KL 约束？",
      "answer": "没有约束时策略会钻 RM 漏洞(reward hacking)生成 RM 高分但人类不喜欢的文本；KL 把它拉回 SFT 分布附近。"
    },
    {
      "question": "奖励模型怎么训？",
      "answer": "用人类标注的偏好对 (chosen, rejected)，按 Bradley-Terry 最大化 P(chosen>rejected)=σ(R(chosen)−R(rejected)) 训练打分模型。"
    }
  ],
  "followUpAnswers": [
    "用 DPO 可跳过显式 RM。",
    "多奖融合(有用+无害)缓解偏置。"
  ],
  "pitfalls": [
    "过度优化 RM 导致胡言乱语拿高分。",
    "偏好数据量少且偏→RM 失真。"
  ],
  "beginnerSummary": "RLHF 让模型“讨人喜欢”，分三步：先 SFT 打基础（会答题）；再让人比较模型的多个回答，标注“这个比那个好”，训一个“奖励模型”学会打分发；最后用强化学习(PPO)让模型多生成高分回答，同时用 KL 项勒住它“别跑太远忘了本来面目”。奖励模型把模糊的“人喜欢”变成可优化的分数，是整个流程的关键。",
  "prerequisites": [
    "SFT 给出可用初始策略。",
    "人类偏好可标注为优劣对。",
    "需奖励信号驱动 RL 优化。"
  ],
  "workedExample": [
    "同一问两答：A 更礼貌→标 chosen=A；训 RM 使 R(A)>R(B)。",
    "PPO 中生成被 RM 打高分的回答，KL 防止退化。"
  ],
  "lineByLine": [
    "SFT 得到初始/参考策略。",
    "采偏好对训奖励模型 RM。",
    "PPO 用 RM 作奖励优化策略。",
    "KL(π‖π_ref) 约束保持分布稳定。"
  ],
  "diagram": "SFT ─▶ 策略 ─┐\n               │ PPO + 奖励=RM − β·KL\n人类偏好 ─▶ RM ─┘\n(参考策略π_ref 冻结作 KL 基准)"
};
