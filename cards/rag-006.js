export default {
  "kind": "concept",
  "id": "rag-006",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "查询改写与 HyDE 怎么提升召回？",
  "prompt": "RAG 中查询改写(query rewriting)、多路召回与 HyDE 分别怎么用？",
  "quickAnswer": "用 LLM 把原 query 改写成更利于检索的多种形式(多查询/回退/澄清)，HyDE 则先生成假设答案再以其向量检索，缓解用词错位。",
  "approach": "针对『短 query 与文档用词不一致』与『意图模糊』，在检索前做查询端增强。",
  "explanationFocus": "是什么：查询端增强是在检索前改写或扩充 query，使语义空间与文档更对齐，从而提升召回率与相关性。",
  "bruteForce": "直接用用户原句(可能很短、口语化、用词偏)去向量检索：词汇鸿沟导致召回稀疏或偏题。",
  "derivation": [
    "为什么需要：用户 query 短且术语与文档不一致，直接检索召回差；复杂问题需多角度覆盖。",
    "怎么实现：Multi-Query 让 LLM 生成多个改写并行检索后融合(RRF)；Step-back 生成更笼统问题；HyDE 让 LLM 写假设答案，用其嵌入去搜真实文档。",
    "有什么代价：每次改写都要一次 LLM 调用，增加延迟与成本；HyDE 假设答案可能带错事实但语义有用。",
    "怎么评测：对比改写前后 Context Recall 与最终答案准确率。"
  ],
  "invariant": "经验法则：query 与文档用词差越大，越该做查询改写或 HyDE；多路结果用 RRF 融合比简单合并更稳。",
  "walkthrough": "query『Python 内存泄漏咋整？』→ 改写『Python 内存泄漏排查方法/对象未释放/GC 调优』三路检索；HyDE 先生成一段假答案再搜相似文档。",
  "edgeCases": [
    "改写引入无关语义跑偏",
    "HyDE 假设答案含错误信息污染检索",
    "多路结果重复需去重",
    "过度改写增加延迟与成本"
  ],
  "code": "def hyde(query, llm, embed, index, k=5):\n    hypo = llm.generate(f'写一个可能回答该问题的段落：{query}')\n    return index.search(embed(hypo), k=k)\n\ndef multi_query(query, llm, index, embed, k=5):\n    qs = llm.generate(f'生成3个改写：{query}').split('\\n')\n    hits = [index.search(embed(q), k) for q in qs]\n    return rrf_merge(hits)",
  "codeNotes": [
    "HyDE 用假设答案的向量而非原问题向量",
    "多路用 RRF(倒数排名融合)合并去重更稳"
  ],
  "complexity": "额外 O(改写次数) 次 LLM 调用 + 多次检索；融合 O(候选数 log 候选数)。",
  "followUps": [
    {
      "question": "HyDE 会不会被错误假设带偏？",
      "answer": "假设答案可能含事实错误，但其语义指向通常有用；检索仍按向量相似取真实文档，影响有限，可配合 rerank 兜底。"
    },
    {
      "question": "RRF 是什么？",
      "answer": "Reciprocal Rank Fusion，按各路排名的倒数求和融合多路结果，对分数量纲不敏感，比直接加相似度更稳。"
    }
  ],
  "followUpAnswers": [
    "假设答案可能含事实错误，但其语义指向通常有用；检索仍按向量相似取真实文档，影响有限，可配合 rerank 兜底。",
    "Reciprocal Rank Fusion，按各路排名的倒数求和融合多路结果，对分数量纲不敏感，比直接加相似度更稳。"
  ],
  "pitfalls": [
    "改写过度跑题",
    "忽视多路结果去重",
    "为每问都改写导致延迟高",
    "误信 HyDE 假设答案内容"
  ],
  "beginnerSummary": "查询改写像『把大白话换成图书馆检索词』；HyDE 是先脑补一段答案再去搜相似的书。",
  "prerequisites": [
    "向量检索",
    "LLM 提示工程"
  ],
  "workedExample": [
    "LLM 把原问题扩写成 3 个改写",
    "分别检索后用 RRF 融合去重取 top-k"
  ],
  "lineByLine": [
    "hyde: LLM 生成假设答案段落",
    "用假设答案向量去检索",
    "multi_query: 生成多改写",
    "各路检索后 rrf_merge 融合"
  ],
  "diagram": "Query ->[LLM rewrite]-> Q1,Q2,Q3 -> retrieve x3 -> RRF -> top-k\nQuery ->[LLM HyDE]-> hypothetical doc -> embed -> retrieve"
};
