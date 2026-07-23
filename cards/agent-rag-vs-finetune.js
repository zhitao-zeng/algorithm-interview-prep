export default {
  "kind": "concept",
  "id": "agent-rag-vs-finetune",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 与 RAG / 微调的取舍",
  "prompt": "在构建 Agent 能力时，RAG、微调与 Agent 框架各自怎么取舍？",
  "quickAnswer": "三者解决不同问题：微调改变模型\"固有知识与风格\"(成本高、慢迭代、难更新)；RAG 给模型\"外接实时/私有知识\"(快、可溯源、但受检索上限)；Agent 解决\"多步自主行动与工具使用\"(能力编排)。实务常组合：微调定人设/格式、RAG 供知识、Agent 串行动；先用 RAG/Agent 不上微调，除非确需固化行为或降延迟。",
  "approach": "先 Agent 编排→RAG 补知识→最后才微调固化。",
  "explanationFocus": "是什么：在 Agent 构建中，RAG 负责外接知识、微调负责固化模型能力与风格、Agent 负责行动编排；按\"改动成本与更新频率\"做分层取舍。",
  "bruteForce": "一上来就微调：贵、慢、知识过期快，且本可用 RAG 零成本解决。",
  "derivation": [
    "为什么需要：不同需求对应不同杠杆，混用会浪费资源或限制灵活性。",
    "怎么实现：知识类用 RAG(检索)；行为/格式类先 prompt/Agent 控制，不足再微调；高频低变内容可考虑微调降延迟。",
    "有什么代价：微调训练与维护成本、RAG 检索上限、Agent 多轮开销；组合增加系统复杂度。",
    "怎么评测：看准确率、知识新鲜度、延迟、总成本与迭代速度。"
  ],
  "invariant": "优先用\"不改权重\"的方式(RAG/Agent/prompt)解决问题，微调只作为最后手段。",
  "walkthrough": "企业客服：Agent 编排流程+RAG 接最新政策库(天天变)，仅把\"礼貌话术风格\"微调固化。知识更新零重训，风格稳定。",
  "edgeCases": [
    "RAG 检索上限致长文档丢信息。",
    "微调后新知识难注入需重训。",
    "三者组合调试复杂度高。"
  ],
  "code": "def build(need):\n    if need.knowledge_fresh:  return Agent + RAG      # 优先外接知识\n    if need.style_fixed:      return Agent + RAG + finetune_style\n    return Agent                                    # 纯编排",
  "codeNotes": [
    "RAG 解决\"知不知道\"。",
    "微调解决\"像不像/稳不稳\"。"
  ],
  "complexity": "微调成本最高且最不灵活；RAG/Agent 边际成本低、易更新。",
  "followUps": [
    {
      "question": "什么时候才值得微调？",
      "answer": "当 prompt/Agent 无法稳定固化风格、或需降延迟去检索、或私有行为数据极多时，才上微调。"
    },
    {
      "question": "RAG 能替代 Agent 吗？",
      "answer": "不能，RAG 只补知识，Agent 补行动与编排；多步工具任务仍需 Agent。"
    }
  ],
  "followUpAnswers": [
    "稳定性/降延迟/大数据才微调。",
    "RAG 补知，Agent 补行。"
  ],
  "pitfalls": [
    "过早微调忽视更廉价的 RAG/Agent。",
    "用微调承载易变知识致过期。"
  ],
  "beginnerSummary": "三者像补齐员工能力：RAG 是给他配随时查的资料库(知不知道)，微调是送他去培训固化职业习惯(像不像)，Agent 是给他排班和工具让他办事(做不做)。先给资料和组织，别急着送培训班。",
  "prerequisites": [
    "厘清需求是知识/行为/行动。",
    "有可检索语料(若用 RAG)。",
    "有训练数据(若微调)。"
  ],
  "workedExample": [
    "客服用 Agent+RAG 接新政策。",
    "仅风格类做微调固化。"
  ],
  "lineByLine": [
    "判断需求属于哪类。",
    "知识类优先上 RAG。",
    "行动类用 Agent 编排。",
    "仅必要时才微调。"
  ],
  "diagram": "RAG(knowledge) + Finetune(style) + Agent(action)"
};
