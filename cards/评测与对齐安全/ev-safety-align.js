export default {
  "id": "ev-safety-align",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "安全对齐方法：RLHF/DPO/Constitutional AI",
  "difficulty": "Hard",
  "prompt": "主流的安全对齐方法有哪些？RLHF、DPO、Constitutional AI 各自怎么做，拒绝策略如何设计？",
  "quickAnswer": "RLHF 用人类偏好训奖励模型再以 PPO 优化策略；DPO 把偏好直接转成损失免奖励模型更稳更简；Constitutional AI 用一套原则让模型自我批判生成无害回复，减少人工标注。拒绝策略通过系统提示+分类器+安全微调让模型对高风险请求安全拒答，同时用边界集控制 over-refusal。评测靠攻击成功率与误拒率双指标。",
  "complexity": "O(β) DPO 闭式",
  "beginnerSummary": "安全对齐就是教模型『什么该答、什么不该答、怎么好好拒绝』。RLHF 靠人类打分，DPO 更省事，Constitutional AI 让模型按原则自我纠错。",
  "explanationFocus": "是什么：安全对齐是一组让模型行为符合人类价值与安全边界的训练方法，包括基于人类偏好的 RLHF/DPO，以及用自定原则自我约束的 Constitutional AI，目标是在有用与无害间取得平衡。",
  "approach": "RLHF：收集偏好对→训奖励模型→PPO 最大化带 KL 约束的奖励。DPO：直接在偏好数据上用对比损失优化策略，省去显式奖励模型。Constitutional AI：给模型一套宪法原则，先自我批判再修订回复，合成无害数据做监督/偏好训练。拒绝策略叠加系统提示与拒答分类器，并用边界集抑制 over-refusal。",
  "code": "def dpo_loss(pi, ref, y_w, y_l, beta=0.1):\n    # y_w 偏好回答, y_l 非偏好; 拉大两者对数概率差\n    s = beta * (logp(pi, y_w) - logp(ref, y_w)\n                - (logp(pi, y_l) - logp(ref, y_l)))\n    return -softlog(s)\n\ndef refuse_if_unsafe(req, classifier):\n    return '抱歉，我无法协助该请求' if classifier.unsafe(req) else None",
  "derivation": [
    "为什么需要：预训练模型无价值观，可能输出有害内容，需对齐到安全有用行为。",
    "怎么实现：偏好数据驱动（RLHF/DPO）或原则自驱动（Constitutional AI），配合拒答分类与系统约束。",
    "有什么代价：RLHF 训练不稳、奖励模型易 hack；DPO 对数据质量敏感；Constitutional 可能自洽但偏离人类真实偏好。",
    "怎么评测：攻击成功率（ASR）越低越好，误拒率（误拦正常请求）越低越好，二者联合看 Pareto。"
  ],
  "edgeCases": [
    "高风险但合法的请求（如安全研究）需区分意图。",
    "多语种下拒答策略覆盖不一致。",
    "工具/Agent 场景需对动作级而非仅文本拒答。",
    "原则冲突时（有用 vs 无害）的优先级设定。"
  ],
  "pitfalls": [
    "只压 ASR 不管误拒率，造成 over-refusal 损害体验。",
    "奖励模型被 hack 后表面安全实则套话。"
  ],
  "prerequisites": [
    "偏好学习与人类反馈基础。",
    "PPO/KL 约束与对比损失概念。"
  ],
  "workedExample": [
    "RLHF 经典流程：InstructGPT 用标注偏好训 RM，再 PPO 微调策略提升有用且无害。",
    "DPO 直接对『好/差』回答对优化，避免 RM 训练不稳定，已被 LLaMA-2 等采用。"
  ],
  "lineByLine": [
    "def dpo_loss(...)：定义 DPO 对比损失。",
    "s = beta*(...)：偏好与参考策略的对数概率差乘以温度 β。",
    "logp(pi,y_w)-logp(ref,y_w)：相对参考模型的偏好优势。",
    "def refuse_if_unsafe(...)：用分类器判风险并返回安全拒答模板。"
  ],
  "followUps": [
    {
      "question": "DPO 相比 RLHF 的核心优势？",
      "answer": "省去独立奖励模型与不稳定 PPO 优化，直接在主模型上用偏好对做对比损失，训练更简单稳定、显存更低，且不易被奖励模型 hack；代价是对偏好数据质量与覆盖更敏感。"
    },
    {
      "question": "Constitutional AI 如何减少人工标注？",
      "answer": "用一套明确原则（宪法）让模型对初始有害输出自我批判并修订，自动合成无害偏好数据，再用 SFT/RL 训练，大幅降低人工红队与标注成本，但需谨慎设计原则以免偏离人类价值。"
    }
  ],
  "followUpAnswers": [
    "省去独立奖励模型与不稳定 PPO 优化，直接在主模型上用偏好对做对比损失，训练更简单稳定、显存更低，且不易被奖励模型 hack；代价是对偏好数据质量与覆盖更敏感。",
    "用一套明确原则（宪法）让模型对初始有害输出自我批判并修订，自动合成无害偏好数据，再用 SFT/RL 训练，大幅降低人工红队与标注成本，但需谨慎设计原则以免偏离人类价值。"
  ]
};
