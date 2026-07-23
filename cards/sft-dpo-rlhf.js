export default {
  "kind": "concept",
  "id": "sft-dpo-rlhf",
  "category": "RL 后训练",
  "difficulty": "Medium",
  "title": "SFT / DPO / RLHF 对比",
  "prompt": "SFT、DPO、RLHF 三者是什么关系？各自适合什么场景？",
  "quickAnswer": "SFT 是监督微调（直接模仿示范，无偏好）；RLHF 用显式奖励模型+PPO 做偏好优化（能力强但重）；DPO 把“偏好”直接写成一个分类损失，无需 RM 和 RL 采样，训练更简单稳定。三者常串联：SFT→(DPO 或 RLHF) 后训练。",
  "approach": "SFT 是监督微调；RLHF 用显式奖励模型+PPO 做偏好优化；DPO 把偏好直接写成分类损失，无需 RM 和 RL 采样。三者常串联。",
  "explanationFocus": "SFT 模仿；RLHF 重但强(需RM+PPO)；DPO 轻量直接偏好。",
  "bruteForce": "只用 SFT 难对齐主观偏好；RLHF 太重不适合小团队。",
  "derivation": [
    "SFT 教“怎么做”，但不知“哪种更好”。",
    "RLHF 把偏好变奖励并用 RL 优化，效果好但工程重。",
    "DPO 证明偏好最优解可写成闭式损失，跳过 RM/RL。"
  ],
  "invariant": "在‘特定奖励模型 + KL 正则的 RLHF’设定下，DPO 通过重参数化把最优策略写成闭式、从而得到直接偏好分类损失，与该类 RLHF 目标等效；但 DPO 并非无条件‘与所有 RLHF 优化同一目标’，其对偏好模型形式与 KL 项有前提。",
  "walkthrough": "对比表：是否需要 RM / 是否在线采样 / 显存 / 稳定性。",
  "edgeCases": [
    "DPO 对偏好数据质量极敏感(需明确优劣)。",
    "RLHF 易 reward hacking。",
    "SFT 数据分布偏移会传棒给后训练。"
  ],
  "code": "# Python\ndef dpo_loss(pi_logp_chosen, ref_logp_chosen,\n             pi_logp_rejected, ref_logp_rejected, beta=0.1):\n    diff = (pi_logp_chosen - ref_logp_chosen) - \\\n           (pi_logp_rejected - ref_logp_rejected)\n    return -torch.log(torch.sigmoid(beta * diff)).mean()  # 直接偏好",
  "codeNotes": [
    "DPO 仍需参考策略 π_ref 冻结作锚。",
    "RLHF 用 PPO+RM；DPO 用单分类损失更省。"
  ],
  "complexity": "SFT O(数据×前向)；DPO O(偏好对×2前向) 无 RL 循环；RLHF O(PPO 多 epoch×3前向) 最重。",
  "followUps": [
    {
      "question": "DPO 为什么不用奖励模型？",
      "answer": "在 Bradley-Terry 下，偏好最优策略有闭式形式；DPO 直接把这个最优条件变成“chosen 比 rejected 概率更高”的分类损失，省去训 RM 与 RL 采样。"
    },
    {
      "question": "什么时候选 RLHF 而不是 DPO？",
      "answer": "当奖励可由可验证器/环境实时给出(如代码执行、数学验证)或需要复杂多目标在线优化时，RLHF/PPO 更灵活；纯离线偏好对则 DPO 更省更稳。"
    }
  ],
  "followUpAnswers": [
    "SFT→DPO 是轻量对齐组合。",
    "可验证任务用 RLHF+verifier 更优。"
  ],
  "pitfalls": [
    "DPO 数据优劣不清晰导致学偏。",
    "三者混用阶段错乱(先 RL 后 SFT 退化)。"
  ],
  "beginnerSummary": "三者是“让模型变好”的三级阶梯：SFT 像“照着标准答案抄”（监督学习，学会基本能力）；RLHF 像“请评委打分再用强化学习改进”（效果强但要养奖励模型和 RL 引擎，很重）；DPO 是聪明捷径——数学家证明“偏好”可以直接变成一个分类题来训练，不必请评委也不必做 RL，更轻便稳定。实践中常 SFT 打底，再用 DPO 或 RLHF 做对齐。",
  "prerequisites": [
    "SFT 是监督模仿。",
    "偏好数据含优劣对。",
    "RLHF 需 RM+RL，DPO 免 RM/RL。"
  ],
  "workedExample": [
    "SFT：用示范回答训。",
    "DPO：chosen 对数概率高于 rejected 即可，无 RM。",
    "RLHF：RM 打分→PPO 优化。"
  ],
  "lineByLine": [
    "SFT：直接最大化示范回答似然。",
    "RLHF：训 RM + PPO 优化奖励−KL。",
    "DPO：把偏好写成分类损失直接训。",
    "常见链路 SFT → DPO/RLHF 后训练。"
  ],
  "diagram": "SFT ──▶ DPO (轻, 无RM/RL)\n  └──▶ RLHF (重, RM+PPO)\n共同目标: 对齐人类偏好"
};
