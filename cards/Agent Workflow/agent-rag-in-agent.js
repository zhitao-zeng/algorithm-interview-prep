export default {
  "kind": "concept",
  "id": "agent-rag-in-agent",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "RAG 在 Agent 中的应用",
  "prompt": "RAG 在 Agent 里是怎么被使用的？",
  "quickAnswer": "在 Agent 中，RAG 通常被封装成一个\"检索工具\"：模型在规划/行动阶段自主决定何时检索、检索什么，再把召回片段作为 Observation 用于推理或作答。相比把检索写死在链路前端，Agent 式 RAG 能按需在多步中多次、差异化检索，显著提升对长尾与最新知识的覆盖。",
  "approach": "检索封装为工具→模型按需调用→召回回填→多轮可重复。",
  "explanationFocus": "是什么：在 Agent 中 RAG 作为可调用的检索工具，由模型自主决定检索时机与查询，结果回灌参与决策。",
  "bruteForce": "固定前置检索：一次性查完再答，查非所需或漏查都难补救。",
  "derivation": [
    "为什么需要：模型知识有截止且易幻觉，需外部语料按需补充；且问题常需多源、多轮检索。",
    "怎么实现：把 vector/keyword retriever 注册为 tool；模型在需要时输出 retrieve(query)；召回 top-k 切片回 prompt。",
    "有什么代价：检索延迟与成本；召回质量直接决定上限；需去噪与引用。",
    "怎么评测：看检索命中率、答案有据率(grounding)、端到端准确率。"
  ],
  "invariant": "Agent 的作答必须能追溯到检索片段，避免\"检索了却仍幻觉\"。",
  "walkthrough": "答产品问题：模型先 retrieve(\"退货政策\")→得 3 段→再 retrieve(\"运费\")→综合作答并标注来源。共 2 次检索。",
  "edgeCases": [
    "无相关文档：需诚实\"未知\"而非编造。",
    "召回片段过时：需带时间元数据。",
    "多源冲突：需比对与声明。"
  ],
  "code": "def retrieve_tool(corpus, query, k=4):\n    hits = corpus.search(embed(query), k)\n    return [format_chunk(h, with_citation=True) for h in hits]\n\n# 模型在 Agent 循环中自主调用 retrieve_tool",
  "codeNotes": [
    "召回带引用便于溯源。",
    "无结果应触发\"未知\"分支。"
  ],
  "complexity": "每次检索 O(log n) 向量查找 + 回填 token；多轮检索线性叠加。",
  "followUps": [
    {
      "question": "Agentic RAG 和 Naive RAG 区别？",
      "answer": "Naive 固定前置一次检索；Agentic 由模型在循环中按需、多次、差异化检索。"
    },
    {
      "question": "检索结果怎么防幻觉？",
      "answer": "要求答案标注引用片段，并用 groundedness 检查比对作答与召回内容。"
    }
  ],
  "followUpAnswers": [
    "Naive 前置一次，Agentic 按需多次。",
    "引用+一致性检查。"
  ],
  "pitfalls": [
    "检索了却不在作答中引用，仍幻觉。",
    "召回质量差直接封顶效果。"
  ],
  "beginnerSummary": "RAG 在 Agent 里像随用随查的资料员：模型做到哪步需要哪份资料，就喊\"去查一下X\"，资料员递来带出处的小抄，模型照着写答案并注明来源。",
  "prerequisites": [
    "有可检索的语料库。",
    "检索能返回带出处片段。",
    "模型能决定是否检索。"
  ],
  "workedExample": [
    "模型按需调用 retrieve 两次。",
    "无相关文档时答\"未知\"。"
  ],
  "lineByLine": [
    "把检索器注册为工具。",
    "模型判断需要外部知识。",
    "调用检索得 top-k 片段。",
    "带引用回填并作答。"
  ],
  "diagram": "Agent <-> retrieve_tool <-> Corpus"
};
