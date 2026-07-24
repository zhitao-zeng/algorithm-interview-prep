export default {
  "kind": "concept",
  "id": "rag-012",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "元数据过滤如何与向量检索结合？",
  "prompt": "RAG 中元数据过滤(metadata filter)如何与向量检索结合使用？",
  "quickAnswer": "先按结构化元数据(时间/部门/权限)过滤候选集，再在其中做向量 ANN 检索，或向量召回后用元数据二次过滤，缩小且约束搜索空间。",
  "approach": "用元数据做『硬约束』缩小范围，向量做『软语义』排序，二者组合即 hybrid filter。",
  "explanationFocus": "是什么：元数据过滤用文档的结构化属性(日期、来源、标签、权限)做精确筛选，与向量语义检索互补，提升相关性与安全性。",
  "bruteForce": "只做向量检索不限定部门/时间：召回跨域无关片段，甚至返回无权限文档，既不准又不安全。",
  "derivation": [
    "为什么需要：很多查询隐含结构化约束(『本月』『某部门』)，纯语义检索无法表达，且需做权限隔离。",
    "怎么实现：pre-filter(先 SQL/标签过滤再向量搜)或 post-filter(向量召回后按元数据筛)；向量库多支持 filter 表达式与向量联合查询。",
    "有什么代价：pre-filter 可能使候选过少致召回下降；post-filter 可能截掉 top-k；需保证过滤后仍够 k 个。",
    "怎么评测：看过滤正确性(无越权/无越期)与 Context Recall 是否达标。"
  ],
  "invariant": "经验法则：权限/时间等硬约束优先用元数据过滤，语义相关用向量；pre-filter 注意候选数兜底。",
  "walkthrough": "query『本月销售部财报』：先过滤 department=sales 且 date∈本月，再在结果内向量检索『财报』，返回既相关又合规的片段。",
  "edgeCases": [
    "pre-filter 过严导致召回为空",
    "post-filter 把 top-k 砍到不足",
    "权限元数据缺失致越权",
    "时间字段时区/格式不一致"
  ],
  "code": "def search(q_emb, meta_filter, index, k=5):\n    cand = index.filter(meta_filter)          # 元数据硬过滤\n    hits = index.search(cand, q_emb, k=k)    # 在候选内向量检索\n    return hits",
  "codeNotes": [
    "优先用库自带 filter+vector 联合查询",
    "pre-filter 后需检查候选数是否 >= k"
  ],
  "complexity": "过滤 O(候选集) 或索引加速；向量检索在缩小后的集合上进行，整体更快更准。",
  "followUps": [
    {
      "question": "pre-filter 与 post-filter 怎么选？",
      "answer": "约束严格且候选充足用 pre-filter 保合规；担心过滤掉相关项用 post-filter，但需保证剩余够 k。"
    },
    {
      "question": "元数据过滤能替代向量检索吗？",
      "answer": "不能，元数据只做精确筛选，语义匹配仍靠向量；二者是『与』关系互补。"
    }
  ],
  "followUpAnswers": [
    "约束严格且候选充足用 pre-filter 保合规；担心过滤掉相关项用 post-filter，但需保证剩余够 k。",
    "不能，元数据只做精确筛选，语义匹配仍靠向量；二者是『与』关系互补。"
  ],
  "pitfalls": [
    "只用向量忽略权限过滤致越权",
    "pre-filter 过严召回为空",
    "post-filter 截掉相关 top-k",
    "元数据质量差使过滤失效"
  ],
  "beginnerSummary": "元数据过滤像『先按部门/日期筛出合格文件，再在其中按意思找』，既准又不会翻到无权看的资料。",
  "prerequisites": [
    "向量检索",
    "结构化过滤/索引"
  ],
  "workedExample": [
    "先用 meta_filter 筛出合规候选",
    "在候选集内做向量 ANN 取 top-k"
  ],
  "lineByLine": [
    "index.filter 按元数据硬筛",
    "缩小后的集合做向量检索",
    "返回既相关又合规的结果"
  ],
  "diagram": "Query+Filter -> [Meta Filter] -> subset -> [Vector ANN] -> top-k"
};
