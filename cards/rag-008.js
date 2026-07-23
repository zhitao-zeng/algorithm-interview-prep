export default {
  "kind": "concept",
  "id": "rag-008",
  "category": "RAG",
  "difficulty": "Easy",
  "title": "何时用 RAG，何时用微调？",
  "prompt": "RAG 与微调(fine-tuning)该怎么取舍，分别适合什么场景？",
  "quickAnswer": "要接入私有/实时外部知识、要可溯源用 RAG；要固化风格/格式/特定能力、数据稳定用微调；二者常组合。",
  "approach": "按『知识是否频繁变化、是否需要溯源、是否改模型行为』三问决策。",
  "explanationFocus": "是什么：RAG 在推理时外挂知识(不改权重、易更新、可引用)，微调是把知识/能力烧进模型参数(改行为、低延迟但更新贵)。",
  "bruteForce": "把全部私域文档直接微调进模型：知识更新需重训、易遗忘、不可溯源、成本高。",
  "derivation": [
    "为什么需要：知识型问答与能力型定制诉求不同，单靠一种会顾此失彼。",
    "怎么实现：动态/海量知识→RAG(向量库+检索)；固定风格、特定任务格式、小样本能力→SFT/LoRA；生产常见『微调定风格+RAG 供知识』。",
    "有什么代价：RAG 增加检索延迟与链路复杂度、依赖检索质量；微调训练成本高、更新慢、可能过拟合或灾难性遗忘。",
    "怎么评测：RAG 看前述四项指标；微调看下游任务准确率与泛化，做保留集评估。"
  ],
  "invariant": "经验法则：知识常变且要溯源→RAG；要改模型『怎么说话/怎么做』且数据稳→微调。",
  "walkthrough": "客服机器人：产品手册每周更新→用 RAG 实时检索；要求固定礼貌话术与工单格式→用 LoRA 微调风格。二者结合效果最佳。",
  "edgeCases": [
    "知识频繁变却选微调导致过期",
    "要强溯源却只靠微调无法引用",
    "RAG 检索质量差时不如微调稳",
    "组合方案增加系统复杂度"
  ],
  "code": "def decide(knowledge_drift, need_citation, change_behavior):\n    if knowledge_drift or need_citation: return 'RAG'\n    if change_behavior: return 'FineTune'\n    return 'RAG+FineTune'",
  "codeNotes": [
    "决策可用简单规则表落地",
    "组合方案注意两阶段解耦与版本管理"
  ],
  "complexity": "RAG 推理多一次检索；微调为一次性训练 O(样本×轮次)，推理不变。",
  "followUps": [
    {
      "question": "两者能一起用吗？",
      "answer": "能且常见：微调定风格/格式，RAG 供最新知识，互不冲突。"
    },
    {
      "question": "小团队资源有限优先哪个？",
      "answer": "优先 RAG，无需训练、改知识只更新索引，性价比最高；确需改行为再上轻量 LoRA。"
    }
  ],
  "followUpAnswers": [
    "能且常见：微调定风格/格式，RAG 供最新知识，互不冲突。",
    "优先 RAG，无需训练、改知识只更新索引，性价比最高；确需改行为再上轻量 LoRA。"
  ],
  "pitfalls": [
    "用微调解决本应 RAG 的动态知识",
    "忽视 RAG 的溯源优势",
    "组合方案过度工程"
  ],
  "beginnerSummary": "RAG 像『开卷考试随时翻资料』，微调像『把知识背进脑子』；常变且要标出处就开卷，要改说话方式就背下来。",
  "prerequisites": [
    "RAG 基础",
    "微调(SFT/LoRA)概念"
  ],
  "workedExample": [
    "判断知识是否常变且需引用→选 RAG",
    "判断是否需要改输出风格→选微调，必要时二者结合"
  ],
  "lineByLine": [
    "knowledge_drift/need_citation 触发 RAG",
    "change_behavior 触发微调",
    "都不满足则组合"
  ],
  "diagram": "RAG: 外部知识(实时,可溯源)\nFT : 内部参数(风格,能力)\nCombo: FT定风格 + RAG供知识"
};
