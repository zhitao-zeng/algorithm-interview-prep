export default {
  "kind": "concept",
  "id": "train-kd-vs-rlhf",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "KD 与 RLHF 的区别",
  "prompt": "知识蒸馏（KD）与 RLHF 在训练目标和方法上有何本质区别？",
  "quickAnswer": "KD 是学生模仿教师输出分布（监督式、静态目标）；RLHF 用奖励模型做强化学习让模型符合人类偏好（探索式、动态反馈）。",
  "approach": "KD 属监督学习（教师提供软标签），优化 KL/CE；RLHF 属强化学习（PPO/DPO），优化期望奖励，目标来自人类偏好而非某模型。",
  "explanationFocus": "是什么：KD 是『向固定教师模仿』的监督压缩方法，目标是匹配教师分布；RLHF 是用人类偏好训练的奖励模型指导策略优化（RL），目标是最大化奖励、对齐人类价值，二者范式不同。",
  "bruteForce": "把 RLHF 当 KD 用（直接模仿某参考答案）会失去对『开放式偏好』的建模，无法处理无唯一标准答案的对齐问题。",
  "derivation": [
    "为什么需要：KD 解决『大模型→小模型』压缩；RLHF 解决『模型行为符合人类偏好』对齐，目标不同。",
    "怎么实现：KD 用教师前向产软标签+KL；RLHF 训奖励模型 RM，再用 PPO 最大化 RM（或 DPO 直接偏好对优化）。",
    "有什么代价：KD 受限于教师质量与容量差距；RLHF 训练不稳、需奖励模型且易奖励黑客、成本高。",
    "怎么评测：KD 看学生逼近教师程度；RLHF 看人类评估/胜率与安全性，而非单纯精度。"
  ],
  "invariant": "KD 是监督式静态模仿，RLHF 是偏好驱动的强化式对齐（建议二次核对 DPO 已弱化 RL 流程）。",
  "walkthrough": "KD：用 GPT-4 生成软标签训小模型；RLHF：收集人类偏好对→训 RM→PPO 让模型输出更被偏好，二者目标与信号来源都不同。",
  "edgeCases": [
    "KD 教师可能本身不对齐，蒸馏不解决价值观",
    "RLHF 奖励黑客使模型钻空子",
    "DPO 将 RLHF 简化为偏好对比损失"
  ],
  "code": "def rlhf_objective(logp_policy, logp_ref, reward, beta=0.1):\n    # PPO 风格：奖励 - KL 到参考模型\n    return reward - beta * (logp_policy - logp_ref)",
  "codeNotes": [
    "reward 来自奖励模型或偏好",
    "KL 项防止偏离基座过远"
  ],
  "complexity": "RLHF 需 RM 训练+RL 优化，远高于 KD 的单次前向。",
  "followUps": [
    {
      "question": "能否用 KD 替代 RLHF？",
      "answer": "不能全覆盖；KD 只能传教师已有分布，无法凭空获得人类偏好对齐，除非教师本身已 RLHF。"
    },
    {
      "question": "DPO 属于哪类？",
      "answer": "DPO 用偏好对比数据直接优化策略，形式上像分类损失，绕开显式 RL 但仍属对齐范式。"
    }
  ],
  "followUpAnswers": [
    "不能全覆盖；KD 只能传教师已有分布，无法凭空获得人类偏好对齐，除非教师本身已 RLHF。",
    "DPO 用偏好对比数据直接优化策略，形式上像分类损失，绕开显式 RL 但仍属对齐范式。"
  ],
  "pitfalls": [
    "混淆两者目标，用 KD 解决对齐问题",
    "忽视 RLHF 奖励黑客与训练不稳定"
  ],
  "beginnerSummary": "KD 是『抄学霸答案』（监督），RLHF 是『按老师喜好评改』（强化）；一个学能力，一个学讨喜。",
  "prerequisites": [
    "知识蒸馏",
    "强化学习基础",
    "偏好对齐与奖励模型"
  ],
  "workedExample": [
    "KD：学生模仿教师 100K 条软标签",
    "RLHF：1K 偏好对训 RM，PPO 优化"
  ],
  "lineByLine": [
    "def rlhf_objective(...): 定义 RLHF 目标",
    "reward 为奖励模型打分",
    "减 beta*KL 约束不偏离基座"
  ],
  "diagram": "KD: 教师→(软标签)→学生\nRLHF: 偏好→RM→(奖励)→PPO→模型"
};
