export default {
  "kind": "concept",
  "id": "agent-memory",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "记忆（memory）机制",
  "prompt": "Agent 的短期记忆与长期记忆分别指什么，怎么实现？",
  "quickAnswer": "短期记忆是单轮/近期交互的上下文（对话历史、当前轨迹），直接放 context window；长期记忆跨会话保存事实/经验，通常外挂向量库或键值存储，用时检索回灌。短期受窗口限制需压缩，长期靠写入-检索闭环沉淀知识。",
  "approach": "短期=上下文窗口；长期=外部存储+检索回灌。",
  "explanationFocus": "是什么：记忆让 Agent 跨步骤/跨会话保留信息；短期记忆是当前上下文，长期记忆是持久化的外部知识库。",
  "bruteForce": "把所有历史全塞进 prompt：很快超出窗口且噪声大、成本高。",
  "derivation": [
    "为什么需要：任务跨多轮甚至多天，模型自身无持久状态，需显式记忆。",
    "怎么实现：短期用滚动窗口/摘要压缩；长期把重要事实写入向量库(embedding)或结构化 DB，需要时语义检索 top-k 拼回 prompt。",
    "有什么代价：检索可能不相关(噪声)、写入需去重/冲突解决、存储与向量检索有延迟与成本。",
    "怎么评测：看记忆命中率、任务一致性、以及遗忘/串扰(false context)率。"
  ],
  "invariant": "写入长期记忆的内容需带时间戳与来源，检索时按相关性+新鲜度排序。",
  "walkthrough": "客服 Agent：本次对话(短期)放窗口；用户偏好\"不用短信通知\"写入长期库；下次会话检索到该偏好并遵守。共 1 次写入、1 次检索。",
  "edgeCases": [
    "冲突记忆：新旧信息矛盾需策略裁决。",
    "检索到无关记忆造成干扰。",
    "敏感信息入长期库需脱敏与权限。"
  ],
  "code": "def recall(mem_store, query, k=5):\n    vec = embed(query)\n    hits = mem_store.search(vec, k)            # 语义检索\n    return rank_by_freshness(hits)\n\ndef remember(mem_store, fact, ts):\n    mem_store.upsert(embed(fact), {\"text\": fact, \"ts\": ts})",
  "codeNotes": [
    "检索结果需去噪后再回灌。",
    "写入带时间戳便于冲突裁决。"
  ],
  "complexity": "检索 O(log n) 级；长期记忆随数据量增长，受 embedding 与存储成本约束。",
  "followUps": [
    {
      "question": "短期记忆满了怎么办？",
      "answer": "滚动截断或用 LLM 摘要压缩旧内容，保留关键事实与最近交互。"
    },
    {
      "question": "长期记忆怎么防串扰？",
      "answer": "检索结果按相关性阈值过滤，并标注来源让用户可核查，避免错误记忆污染决策。"
    }
  ],
  "followUpAnswers": [
    "摘要压缩保关键。",
    "相关性过滤+来源标注。"
  ],
  "pitfalls": [
    "把全部历史无差别塞进窗口。",
    "长期记忆不冲突裁决导致矛盾决策。"
  ],
  "beginnerSummary": "记忆像人的笔记本：短期是眼前这张便签(当前对话)，长期是归档的文件柜(跨天知识)。需要时用关键词去柜子里翻出相关那页，贴回便签上参考。",
  "prerequisites": [
    "有向量/键值存储可用。",
    "能生成与检索 embedding。",
    "需区分会话内与会话间状态。"
  ],
  "workedExample": [
    "用户偏好写入长期库供下次用。",
    "窗口溢出时用摘要压缩。"
  ],
  "lineByLine": [
    "短期记忆维护在上下文窗口。",
    "重要事实写入外部长期存储。",
    "需要时语义检索相关记忆。",
    "按新鲜度排序后回灌决策。"
  ],
  "diagram": "Context(window) <--> summarize\nLongTerm(DB) <--> embed/search"
};
