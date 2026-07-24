export default {
  "id": "sys-vector-retrieval",
  "kind": "concept",
  "category": "系统设计",
  "title": "向量检索系统设计",
  "difficulty": "Hard",
  "prompt": "如何设计一个支持亿级向量的高性能向量检索系统？",
  "quickAnswer": "向量检索系统用 ANN 索引(如 HNSW、FAISS-IVF)在近似精度下把检索从暴力 O(N) 降到亚线性，通过召回率与延迟的权衡、量化压缩与分片来满足亿级规模与低延迟要求。冷启动靠内容向量兜底。",
  "explanationFocus": "是什么：向量检索系统是把高维 embedding 建索引并支持按相似度(如内积/余弦)快速找出最近邻的一套系统，是语义召回的底层引擎。",
  "approach": "选 ANN 算法：HNSW 图检索高召回低延迟但内存大，IVF+PQ 用倒排与量化省内存；做分片与副本水平扩展；以 recall@k 与 QPS/P99 权衡参数；新物料用内容向量即时入索引解决冷启动。",
  "code": "def build_index(vectors, type='hnsw'):\n    # 构建 ANN 索引\n    if type == 'hnsw':\n        return HNSW(vectors, m=32)\n    return IVF(vectors, nlist=4096)\n\ndef search(index, q, top_k=100):\n    # 近似最近邻查询\n    return index.query(q, top_k)",
  "complexity": "暴力 O(N) / ANN O(log N)~O(sqrt N)",
  "beginnerSummary": "把所有物料变成坐标点，用户兴趣也是一个点，我们要找离它最近的一批点。一个个量距离太慢，于是建一张“快捷地图”(索引)近似找最近邻，牺牲一点点准确度换极快速度。",
  "derivation": [
    "为什么需要：亿级向量暴力比对不可行，需近似检索在精度与速度间取舍。",
    "怎么实现：HNSW 构图检索、IVF 聚类倒排+PQ 量化压缩，分片部署与参数调优。",
    "有什么代价：近似带来召回损失，HNSW 内存占用高，索引构建与更新有开销。",
    "怎么评测：recall@k、QPS、P99 延迟与内存占用联合评估。"
  ],
  "edgeCases": [
    "新物料未入索引无法被召回，需实时插入或内容向量兜底(冷启动)。",
    "高维灾难与分布漂移使索引退化，需定期重建。",
    "批量大查询与单查询延迟差异大，需隔离。"
  ],
  "pitfalls": [
    "盲目追求高召回把参数调到接近暴力，延迟与内存失控。",
    "忽略向量归一化，内积与余弦语义不一致。"
  ],
  "prerequisites": [
    "向量相似度(内积/余弦)基础",
    "ANN 索引 HNSW/IVF/PQ 原理",
    "召回率与延迟权衡概念"
  ],
  "workedExample": [
    "场景：1 亿短视频向量，要求 recall@100>0.95，P99<20ms。",
    "用 HNSW(m=32) 内存建索引，单分片 2000 万，10 分片+副本。",
    "新视频实时插入图索引，冷启动即可召回，离线 recall 实测 0.96。"
  ],
  "lineByLine": [
    "def build_index(...)：按类型构建 ANN 索引，HNSW 适合低延迟高召回，IVF 适合省内存大规模。",
    "def search(...)：对查询向量在索引上做近似最近邻查询返回 top_k 候选。"
  ],
  "followUps": [
    {
      "question": "HNSW 和 IVF 怎么选？",
      "answer": "HNSW 召回高、延迟低但内存占用大，适合内存充足的在线召回；IVF+PQ 用量化大幅省内存适合超大规模，但召回与精度略低，按资源与精度要求取舍。"
    },
    {
      "question": "向量检索的冷启动如何解决？",
      "answer": "新物料用内容多模态模型实时产出 embedding 并插入索引或用内容召回兜底，避免无行为数据导致的无法召回。"
    }
  ],
  "followUpAnswers": [
    "HNSW 召回高、延迟低但内存占用大，适合内存充足的在线召回；IVF+PQ 用量化大幅省内存适合超大规模，但召回与精度略低，按资源与精度要求取舍。",
    "新物料用内容多模态模型实时产出 embedding 并插入索引或用内容召回兜底，避免无行为数据导致的无法召回。"
  ]
};
