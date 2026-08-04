export default {
  "id": "ev-reward-model-eval",
  "category": "评测与对齐安全",
  "difficulty": "Hard",
  "title": "奖励模型评测",
  "prompt": "在 RLHF 流程里，奖励模型本身该怎么评测，才能保证它真的反映了人类偏好？",
  "quickAnswer": "奖励模型（RM）评测核心是看它对\"人类偏好配对\"的判别准确率，以及在不同分布上的校准与泛化；常用测试集上成对准确率、与人类一致性、跨领域相关性和 Reward 黑客鲁棒性四个角度综合判断。",
  "approach": "从\"配对准确率、人类一致性、分布外泛化、Reward Hacking 敏感度\"四方面设计评测，把 RM 当作排序/二分类器来检验其偏好建模质量。",
  "explanationFocus": "是什么：奖励模型是在人类偏好数据上训练的打分器，为 RLHF 提供优化信号；它的评测就是检验这个打分是否稳定、准确地对应真实人类偏好。",
  "bruteForce": "最朴素的做法只在训练集上报告损失下降就上线，但 RM 极易过拟合到训练分布，上线后梯度被带偏，典型表现就是 Reward 升高而真实质量下降。",
  "invariant": "RM 的 pairwise 准确率必须在独立的、与训练集不重叠的人类偏好测试集上评估，否则数字会高估真实一致性。",
  "walkthrough": "先划分与训练集无重叠的偏好测试集；对每对 (chosen, rejected) 比较 RM 分数；统计 chosen 得分更高的比例得准确率；再算与人类标注者的 Kendall/一致率；最后做 OOD 子集与对抗样本测试。",
  "complexity": "评测成本以配对推理为主：测试集规模常数万对，每对两次前向；若要测 Reward Hacking 还需额外生成对抗样本，成本随策略数增长。",
  "beginnerSummary": "奖励模型就是给回答打分的\"评委\"，评它就是看这位评委和人类评委打分像不像，以及会不会被花言巧语骗高分。",
  "diagram": "pair (chosen, rejected)\n        |\n   +----+----+\n   v         v\n RM(chosen) RM(rejected)\n   |         |\n   +-- cmp --+ --> accuracy",
  "code": "def rm_accuracy(rm, pairs):\n    correct = 0\n    for c, r in pairs:\n        if rm.score(c) > rm.score(r):\n            correct += 1\n    return correct / len(pairs)",
  "derivation": [
    "为什么需要：RM 是 RLHF 的优化目标，若它偏离人类偏好，策略会朝着错误方向被强化，必须单独评测。",
    "怎么实现：在独立偏好测试集上算 pairwise 准确率，并额外计算与人类标注者的相关系数及 OOD 子集表现。",
    "有什么代价：高质量偏好测试集稀缺且贵；Reward Hacking 评测需要对抗生成，工程复杂。",
    "怎么评测：报告配对准确率、Kendall tau、跨领域相关性与对抗鲁棒性，结合在线人类抽检。"
  ],
  "edgeCases": [
    "训练集与测试集若存在同提示不同标注者，会造成数据泄漏虚高准确率。",
    "长回答普遍得分高带来的长度偏差，会让 RM 偏爱啰嗦而非正确。",
    "OOD 领域（如代码）上 RM 可能完全失效却仍在主集表现好。",
    "平局或极接近分数时阈值选取会影响准确率口径。"
  ],
  "pitfalls": [
    "只看训练损失下降就认为 RM 可用，忽略分布偏移与 Reward Hacking。",
    "用主集准确率代表全能力，漏掉 OOD 与对抗脆弱性。"
  ],
  "prerequisites": [
    "理解 RLHF 中奖励模型为策略提供梯度的角色。",
    "了解 pairwise 比较与排序指标（准确率、Kendall tau）。"
  ],
  "workedExample": [
    "场景一：RM 在主测试集准确率 78%，但在代码 OOD 子集仅 52%，说明泛化不足需补数据。",
    "场景二：策略优化后 RM 分数涨 15% 但人工评下降，暴露 Reward Hacking，RM 需重训。"
  ],
  "lineByLine": [
    "def rm_accuracy(rm, pairs): 定义 RM 配对准确率计算。",
    "for c, r in pairs: 遍历每条人类偏好对。",
    "if rm.score(c) > rm.score(r): 比较被选与拒绝回答的分数。",
    "correct += 1 当选者分数更高则判 RM 正确。",
    "return correct / len(pairs) 返回配对准确率。"
  ],
  "codeNotes": [
    "rm.score() 返回标量奖励，比较方向\"chosen 应大于 rejected\"是偏好建模的基本约定。"
  ],
  "followUps": [
    {
      "question": "RM 准确率高但上线后人类评下降，可能是什么原因？",
      "answer": "典型是 Reward Hacking：策略学会了抬高 RM 分数而非提升真实质量，说明 RM 在分布外被利用，需要对抗训练与在线人类反馈兜底。"
    },
    {
      "question": "除了配对准确率，还该看什么指标？",
      "answer": "应看与人类标注者的 Kendall tau、跨领域相关性以及对抗样本鲁棒性，单一准确率会掩盖分布偏移。"
    }
  ],
  "followUpAnswers": [
    "典型是 Reward Hacking：策略学会了抬高 RM 分数而非提升真实质量，说明 RM 在分布外被利用，需要对抗训练与在线人类反馈兜底。",
    "应看与人类标注者的 Kendall tau、跨领域相关性以及对抗样本鲁棒性，单一准确率会掩盖分布偏移。"
  ],
  "kind": "concept"
};
