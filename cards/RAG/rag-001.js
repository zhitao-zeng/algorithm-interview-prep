export default {
  "kind": "concept",
  "id": "rag-001",
  "category": "RAG",
  "difficulty": "Easy",
  "title": "RAG 的三段范式是什么？",
  "prompt": "RAG（检索增强生成）的核心流程分为哪三段，各自做什么？",
  "quickAnswer": "检索(Retrieve)→增强(Augment)→生成(Generate)：先从知识库召回相关片段，拼进提示词，再交由 LLM 生成有依据的答案。",
  "approach": "按数据流向把 RAG 拆成离线建库与在线检索生成两条链路理解。",
  "explanationFocus": "是什么：RAG=检索增强生成，用外部知识弥补 LLM 参数记忆的不足，降低幻觉、支持私域/实时数据。",
  "bruteForce": "每次都把整库文档全文塞进 prompt：token 爆炸、噪声淹没答案、无法规模化。",
  "derivation": [
    "为什么需要：LLM 训练数据有截止日期且不含企业私域知识，直接问答易幻觉或答非所问。",
    "怎么实现：离线把文档切块、向量化建索引；在线把用户 query 向量化，ANN 召回 top-k 拼入 prompt 再生成。",
    "有什么代价：多了检索链路，引入召回质量、延迟、索引维护成本；检索不准会直接污染生成。",
    "怎么评测：看 Context Recall（该召回的召回没）、Faithfulness（答案是否忠于上下文）、Answer Relevancy（是否答其所问）。"
  ],
  "invariant": "经验法则：检索质量决定答案上限，生成质量决定上限是否达到。",
  "walkthrough": "用户问『公司年假规定？』，库里有 1 万篇制度文档；检索召回『休假管理办法』相关 5 段，拼进 prompt，LLM 据此作答而非凭空编。",
  "edgeCases": [
    "库里根本没有答案时模型仍可能编造，需加『无依据则拒答』约束",
    "query 与文档用词差异大导致召回为空",
    "召回片段过长撑爆上下文窗口",
    "多片段互相矛盾时生成会摇摆"
  ],
  "code": "def rag_pipeline(query, index, llm, k=5):\n    q_emb = embed(query)\n    hits = index.search(q_emb, k=k)\n    context = '\\n'.join(h.text for h in hits)\n    prompt = f'依据以下资料回答：\\n{context}\\n\\n问题：{query}'\n    return llm.generate(prompt)",
  "codeNotes": [
    "检索与生成解耦，可分别换 embedding 模型与 LLM",
    "命中结果建议携带元数据(id/来源)便于溯源与拒答"
  ],
  "complexity": "检索 O(log n) 近似或 O(n) 暴力；生成 O(输出长度)，整体受 top-k 与上下文长度影响。",
  "followUps": [
    {
      "question": "Naive RAG 与 Advanced RAG 的主要区别？",
      "answer": "Naive 固定检索→生成无校验；Advanced 加入重排、查询改写、自省/纠错循环等提升召回与忠实度。"
    },
    {
      "question": "RAG 一定能消除幻觉吗？",
      "answer": "不能。检索为空或检索到错误上下文时，模型仍可能编造；需配合拒答策略与忠实度评测。"
    }
  ],
  "followUpAnswers": [
    "Naive 固定检索→生成无校验；Advanced 加入重排、查询改写、自省/纠错循环等提升召回与忠实度。",
    "不能。检索为空或检索到错误上下文时，模型仍可能编造；需配合拒答策略与忠实度评测。"
  ],
  "pitfalls": [
    "以为加了检索就万无一失，忽视召回质量",
    "把整库当上下文，未做切块与截断",
    "未保留片段来源，出问题无法溯源"
  ],
  "beginnerSummary": "RAG 就是先去资料库翻出相关几页，再让 AI 看着这几页回答，而不是让 AI 凭记忆硬编。",
  "prerequisites": [
    "大语言模型(LLM)基本概念",
    "向量与相似度检索基础"
  ],
  "workedExample": [
    "用户提问，系统把问题转成向量去库里找最像的 5 段资料",
    "把这 5 段和原问题一起交给 LLM，让它基于资料作答"
  ],
  "lineByLine": [
    "embed(query) 把问题变成向量",
    "index.search 用 ANN 找回最相近的片段",
    "拼接 context 与 query 成 prompt 后调用 LLM 生成"
  ],
  "diagram": "Query -> [Embed] -> VectorDB -> top-k chunks -> [Augment] -> LLM -> Answer"
};
