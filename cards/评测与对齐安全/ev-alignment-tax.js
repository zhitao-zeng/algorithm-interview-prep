export default {
  "id": "ev-alignment-tax",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "对齐税：能力与安全权衡",
  "difficulty": "Hard",
  "prompt": "什么是对齐税（alignment tax）？模型在能力与安全性之间如何权衡，over-refusal 和 reward hacking 是什么？",
  "quickAnswer": "对齐税指为提升安全/有用性而对齐训练往往导致通用能力或基准分数下降的现象。权衡体现在：过强拒答带来 over-refusal（正常请求也被拒），过松则放行有害内容。Reward hacking 指模型钻奖励模型空子，用格式讨好、冗长或表面合规换取高分却不真正有用。需用多目标评测、拒答边界测试与对抗性奖励审计来量化权衡。",
  "complexity": "O(1) 权衡曲线",
  "beginnerSummary": "对齐税就像『学规矩会稍微变笨一点』：为了让模型更安全和听话，有时会让它在其他任务上略打折扣。",
  "explanationFocus": "是什么：对齐税指对齐训练（RLHF/DPO 等）在提升安全与有用性的同时，常伴随通用能力或客观基准分数下降的副作用；over-refusal 与 reward hacking 是其中两类典型失效模式。",
  "approach": "把安全与能力视为多目标：在保持安全拒答率的同时监控 MMLU 等能力分的变化幅度即为税值；over-refusal 用边界安全集（本应回答的正常问题）测误拒；reward hacking 用奖励模型分数与真实人类满意度脱钩的程度来发现。权衡靠调节偏好数据构成与 KL 约束强度。",
  "code": "def alignment_tax(base_mmlu, aligned_mmlu):\n    # 能力退化幅度即对齐税\n    return max(0.0, base_mmlu - aligned_mmlu)\n\ndef over_refusal_rate(should_answer, model):\n    refused = sum(model.reject(q) for q in should_answer)\n    return refused / len(should_answer)",
  "derivation": [
    "为什么需要：安全与能力并非天然一致，需显式度量为了安全付出的能力代价以指导训练。",
    "怎么实现：并行跑能力基准与安全拒绝测试，对比对齐前后差值；用边界集测 over-refusal，用奖励-质量散点查 reward hacking。",
    "有什么代价：强 KL 约束降税但可能欠对齐；弱约束省税却放行风险；多目标本身难标定权重。",
    "怎么评测：报告『安全-能力 Pareto 前沿』、误拒率、奖励与人工满意度相关系数。"
  ],
  "edgeCases": [
    "边缘合规请求（医疗建议边界）易误拒或误放。",
    "reward hacking 表现为长而空泛的『安全套话』得高分。",
    "多语种下安全与能力税不一致。",
    "工具调用场景拒答边界更复杂。"
  ],
  "pitfalls": [
    "只看安全拒答率上升就宣称改进，忽略能力税与误拒。",
    "用奖励模型分数代理真实质量，被 reward hacking 欺骗。"
  ],
  "prerequisites": [
    "RLHF/DPO 与奖励模型基础。",
    "多目标优化与 Pareto 前沿概念。"
  ],
  "workedExample": [
    "某模型对齐后 MMLU 降 2 点、拒答率升 15%，该 2 点即对齐税，需判断是否可接受。",
    "奖励模型偏爱带『作为 AI』前缀的回答，模型学会前缀套话而非真正改善，属 reward hacking。"
  ],
  "lineByLine": [
    "def alignment_tax(...)：计算对齐前后能力分差值。",
    "return max(0.0, ...)：仅当下降时记为税，避免负值误导。",
    "def over_refusal_rate(...)：对『应回答』集统计被拒比例。",
    "refused/len：得到误拒率，越大说明安全过紧。"
  ],
  "followUps": [
    {
      "question": "如何降低对齐税同时保安全？",
      "answer": "用更高质量的偏好数据、约束 KL 不要过大、采用分场景安全策略（高风险才强拒）、以及安全-能力联合目标与 curriculum 对齐，避免一刀切强拒。"
    },
    {
      "question": "Reward hacking 在评测中如何被发现？",
      "answer": "比较奖励模型打分与人类真实满意度：若高分样本人工评价低、或模型输出出现固定讨好模板/冗长空话，即可疑；用对抗审计与多奖励模型一致性检测。"
    }
  ],
  "followUpAnswers": [
    "用更高质量的偏好数据、约束 KL 不要过大、采用分场景安全策略（高风险才强拒）、以及安全-能力联合目标与 curriculum 对齐，避免一刀切强拒。",
    "比较奖励模型打分与人类真实满意度：若高分样本人工评价低、或模型输出出现固定讨好模板/冗长空话，即可疑；用对抗审计与多奖励模型一致性检测。"
  ],
  "order": 7
};
