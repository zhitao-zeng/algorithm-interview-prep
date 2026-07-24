export default {
  "kind": "concept",
  "id": "rag-013",
  "category": "RAG",
  "difficulty": "Hard",
  "title": "Self-RAG 与 CRAG 怎么实现自省纠错？",
  "prompt": "Self-RAG 与 CRAG 如何通过反思/纠错循环提升 RAG 可靠性？",
  "quickAnswer": "CRAG 加检索评价器把结果分 Correct/Ambiguous/Incorrect，错误时触发网络搜索兜底；Self-RAG 用反思令牌决定何时检索、片段是否相关、答案是否被支撑。",
  "approach": "在检索与生成间/外引入『评判+循环』：质量不达标则重写、补搜或拒答。",
  "explanationFocus": "是什么：Self-RAG 与 CRAG 是纠正式(agentic)RAG，通过轻量评价器或反思令牌对检索/生成做自检，质量差时触发重写查询、外部补搜或拒答。",
  "bruteForce": "naive RAG 盲信 top-k：检索偏题也照生成，产生『引用了但答非/答错』的幻觉。",
  "derivation": [
    "为什么需要：检索可能相似但不相关、或库根本没答案，固定管道无纠错会直接幻觉。",
    "怎么实现：CRAG 用 T5 类评价器给每文档打 Correct/Ambiguous/Incorrect，Incorrect 触发 Web 搜索兜底、Ambiguous 混合；Self-RAG 微调模型输出 [Retrieve]/[ISREL]/[ISSUP]/[ISUSE] 反思令牌驱动检索与自检。",
    "有什么代价：多轮 LLM/检索调用，延迟与成本上升；Self-RAG 需微调，CRAG 需训练评价器；有循环失控风险需设最大步数。",
    "怎么评测：对比 naive RAG，看事实性(Faithfulness)提升与幻觉率下降，监控额外延迟。"
  ],
  "invariant": "经验法则：自省是第二道防线而非第一道，先保检索质量再上纠错循环，并设最大重试上限。",
  "walkthrough": "query『Stripe 创始人？』：Self-RAG 输出 [Retrieve] 检索，[ISREL=relevant][ISSUP=fully]，生成答案；若 ISREL=irrelevant 则重写查询再检索。",
  "edgeCases": [
    "评价器误判导致无效补搜",
    "循环无上限拖垮延迟",
    "Self-RAG 需微调数据成本高",
    "Web 兜底返回不可靠来源",
    "Ambiguous 混合策略权重难定"
  ],
  "code": "class CorrectiveRAG:\n    def process(self, query, retriever, evaluator, generator, web):\n        docs = retriever.retrieve(query, k=10)\n        grades = [evaluator.grade(query, d) for d in docs]\n        if all(g == 'incorrect' for g in grades):\n            return generator.generate(web.search(query))\n        correct = [d for d, g in zip(docs, grades) if g != 'incorrect']\n        return generator.generate(correct)",
  "codeNotes": [
    "CRAG 核心是评价器三分类",
    "全 incorrect 才整体兜底到 Web 搜索",
    "需设最大循环步数防失控"
  ],
  "complexity": "最坏 O(最大循环步数) 次检索+生成；单轮与 naive RAG 相当，纠错时成倍。",
  "followUps": [
    {
      "question": "Self-RAG 与 CRAG 主要区别？",
      "answer": "CRAG 用独立轻量评价器做三分类并触发 Web 兜底；Self-RAG 微调模型用反思令牌自决检索与自评，更内聚但需训练。"
    },
    {
      "question": "纠错循环会不会无限循环？",
      "answer": "会，必须设最大重试/检索步数与超时，超界则降级为拒答或返回当前最佳。"
    }
  ],
  "followUpAnswers": [
    "CRAG 用独立轻量评价器做三分类并触发 Web 兜底；Self-RAG 微调模型用反思令牌自决检索与自评，更内聚但需训练。",
    "会，必须设最大重试/检索步数与超时，超界则降级为拒答或返回当前最佳。"
  ],
  "pitfalls": [
    "无循环上限导致延迟爆炸",
    "评价器误判引发无效补搜",
    "忽视检索质量只靠纠错兜底",
    "Self-RAG 微调成本高估错收益"
  ],
  "beginnerSummary": "纠正式 RAG 像『写完答案自己复查』：发现参考资料不对就重查或去网上补找，不对劲就坦白说不知道。",
  "prerequisites": [
    "RAG pipeline",
    "重排/评测",
    "反思与 agent 循环概念"
  ],
  "workedExample": [
    "检索后评价器判 Correct/Ambiguous/Incorrect",
    "Incorrect 触发 Web 兜底，Ambiguous 混合，Self-RAG 用反思令牌自决"
  ],
  "lineByLine": [
    "retriever 取候选",
    "evaluator 逐文档三分类",
    "全 incorrect 则 web 兜底",
    "否则用非 incorrect 文档生成"
  ],
  "diagram": "Query -> Retrieve -> [Evaluator: C/A/I]\n I -> Web Search -> Generate\n C/A -> Refine -> Generate\nSelf-RAG: [Retrieve][ISREL][ISSUP][ISUSE] tokens drive loop"
};
