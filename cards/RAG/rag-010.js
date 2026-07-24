export default {
  "kind": "concept",
  "id": "rag-010",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "混合检索(BM25+向量)如何做？",
  "prompt": "RAG 中混合检索(稀疏 BM25 + 稠密向量)怎么融合，为什么有效？",
  "quickAnswer": "并行跑 BM25 关键词检索与向量语义检索，用 RRF 或加权求和融合结果，兼顾精确关键词匹配与语义泛化。",
  "approach": "两路召回互补：BM25 抓字面命中，向量抓语义近义，融合去重取 top-k。",
  "explanationFocus": "是什么：混合检索同时用稀疏(词频/倒排，如 BM25)与稠密(embedding)两种信号召回，再用融合策略合并，提升鲁棒性。",
  "bruteForce": "只用向量检索：对专名、编号、精确术语等字面强信号易漏；只用 BM25：对同义改写无能为力。",
  "derivation": [
    "为什么需要：纯向量对罕见词/专有名词召回弱，纯关键词对语义改写弱，二者互补。",
    "怎么实现：BM25 建倒排索引做词面召回；向量做语义召回；融合用 Reciprocal Rank Fusion(RRF)或线性加权(score 归一后加权和)。",
    "有什么代价：多维护一套索引与召回链路，融合参数需调；存储与延迟略增。",
    "怎么评测：对比混合 vs 单路的 Context Recall/NDCG@10，看是否全面占优。"
  ],
  "invariant": "经验法则：关键词强信号(编号/术语)靠 BM25，语义泛化靠向量，RRF 融合最稳。",
  "walkthrough": "query『错误码 ERR-409 怎么办』：BM25 精准命中含 ERR-409 的文档，向量补召回『冲突/409 处理』语义相近段，RRF 融合后相关段居前。",
  "edgeCases": [
    "BM25 对中文需先分词",
    "两路分数量纲不同不能直接加，须归一或 RRF",
    "融合权重需按场景调",
    "索引双写增加维护成本"
  ],
  "code": "def rrf_merge(rankings, k=60):\n    score = {}\n    for ranks in rankings:\n        for i, doc_id in enumerate(ranks):\n            score[doc_id] = score.get(doc_id, 0) + 1/(k + i + 1)\n    return sorted(score, key=score.get, reverse=True)",
  "codeNotes": [
    "RRF 只用排名不依赖原始分数",
    "k=60 为经验常数，可调"
  ],
  "complexity": "两路检索并行 O(log n)；融合 O(总候选数 log 候选数)。",
  "followUps": [
    {
      "question": "为什么常用 RRF 而非加权求和？",
      "answer": "RRF 只依赖排名、对两路分数量纲不敏感，免去归一化，融合更稳健。"
    },
    {
      "question": "稀疏检索只有 BM25 吗？",
      "answer": "还有 SPLADE、BGE-M3 的稀疏向量等神经稀疏表示，兼顾词面与语义。"
    }
  ],
  "followUpAnswers": [
    "RRF 只依赖排名、对两路分数量纲不敏感，免去归一化，融合更稳健。",
    "还有 SPLADE、BGE-M3 的稀疏向量等神经稀疏表示，兼顾词面与语义。"
  ],
  "pitfalls": [
    "两路分数直接相加(量纲不同)",
    "忽略中文分词预处理",
    "融合权重拍脑袋不验证",
    "只维护单索引放弃互补"
  ],
  "beginnerSummary": "混合检索像『既按书名关键词找，又按内容意思找』，两路结果合并，漏网之鱼更少。",
  "prerequisites": [
    "BM25/倒排索引",
    "向量检索",
    "RRF 融合"
  ],
  "workedExample": [
    "并行 BM25 与向量检索各取排名",
    "RRF 按排名倒数求和融合去重取 top-k"
  ],
  "lineByLine": [
    "rankings 为多路排名列表",
    "对每路每文档按 1/(k+排名) 累加",
    "按总分降序返回融合结果"
  ],
  "diagram": "Query -> BM25(top) --\\n                > RRF -> top-k\nQuery -> Vector(top) --/"
};
