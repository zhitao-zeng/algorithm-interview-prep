export default {
  "kind": "concept",
  "id": "rag-005",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "RAG 为什么要重排(rerank)？",
  "prompt": "RAG 中 cross-encoder 与 bi-encoder 重排有何区别，为什么需要 rerank？",
  "quickAnswer": "bi-encoder 各自编码快但不准，cross-encoder 把 query+doc 一起编码做全交叉注意力更准但慢；rerank 在召回 top-100 后精排到 top-10。",
  "approach": "两阶段：bi-encoder/向量库广召回保召回率，cross-encoder 精排保精确率。",
  "explanationFocus": "是什么：rerank 用更强的交互式模型对召回候选重新打分排序，纠正向量检索『相似但不相关』的排序错误，不引入新文档。",
  "bruteForce": "只靠向量 top-k 直接喂 LLM：常把高相似低相关的片段排前面，答案被无关内容稀释。",
  "derivation": [
    "为什么需要：bi-encoder 独立编码无法捕获 query-doc 细粒度交互(如否定、条件句)，需更贵模型精排。",
    "怎么实现：召回 top-50~200 候选，用 CrossEncoder(如 bge-reranker-base)对 (query,doc) 逐对打分，取 top-10；注意 512 token 截断。",
    "有什么代价：cross-encoder 每对一次前向，O(候选数)，延迟随候选数线性升；大模型显存高。",
    "怎么评测：看 NDCG@10、最终 Faithfulness；候选数做 A/B，通常 50~200 间权衡。"
  ],
  "invariant": "经验法则：召回要广(top-100+)，精排要准(top-10)；rerank 只重排不新增，上限由召回决定。",
  "walkthrough": "query『该药副作用？』召回 100 篇，bge-reranker-base 重排后把『恶心头晕』段提到第 1，把『用于治疗心血管』段降到末尾。",
  "edgeCases": [
    "512 token 上限静默截断长块致评分失真",
    "候选数过大延迟飙升",
    "reranker 与 retriever 评判标准不一致",
    "rerank 无法补救召回为空"
  ],
  "code": "from sentence_transformers import CrossEncoder\nrerank = CrossEncoder('BAAI/bge-reranker-base')\npairs = [[q, d] for d in docs]\nscores = rerank.predict(pairs, batch_size=32)\ntop = [docs[i] for i in sorted(range(len(docs)), key=lambda i:-scores[i])[:10]]",
  "codeNotes": [
    "cross-encoder 输入是(query,doc)对，输出单分数",
    "长文档需先截断到 token 预算内再送评"
  ],
  "complexity": "重排 O(候选数×序列长度)，与候选数线性；可批处理但单对仍需一次前向。",
  "followUps": [
    {
      "question": "开源 reranker 推荐？",
      "answer": "默认 bge-reranker-base(快准平衡)；多语言/长文用 bge-reranker-v2-m3(8192 token)；极速用 ms-marco-MiniLM-L-6-v2。"
    },
    {
      "question": "重排能提升召回吗？",
      "answer": "不能，它只改善排序分辨率(把对的提上来)，召回上限仍由第一阶段决定。"
    }
  ],
  "followUpAnswers": [
    "默认 bge-reranker-base(快准平衡)；多语言/长文用 bge-reranker-v2-m3(8192 token)；极速用 ms-marco-MiniLM-L-6-v2。",
    "不能，它只改善排序分辨率(把对的提上来)，召回上限仍由第一阶段决定。"
  ],
  "pitfalls": [
    "误以为 rerank 能补召回",
    "忽略 512 token 截断对长块的影响",
    "候选数设太大拖垮延迟"
  ],
  "beginnerSummary": "召回是『撒大网捞一堆』，重排是『请专家逐一比对，把最相关的摆最前』。",
  "prerequisites": [
    "bi-encoder 与向量检索",
    "交叉注意力概念"
  ],
  "workedExample": [
    "向量检索召回 top-100",
    "cross-encoder 对 100 对逐打分，取 top-10 进 LLM"
  ],
  "lineByLine": [
    "CrossEncoder 加载重排模型",
    "构造(query,doc)对",
    "predict 得相关性分数",
    "按分数降序取前 10"
  ],
  "diagram": "Retriever(top-100) -> CrossEncoder(score each) -> sort -> top-10 -> LLM"
};
