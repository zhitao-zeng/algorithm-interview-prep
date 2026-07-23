export default {
  "kind": "concept",
  "id": "rag-003",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "向量库与 ANN 检索如何选型？",
  "prompt": "FAISS 的 HNSW 与 IVF 有什么区别，主流向量库怎么选？",
  "quickAnswer": "HNSW 图索引高召回高内存、免训练；IVF 聚类索引省内存需训练、靠 nprobe 平衡；库按规模选 Milvus/Qdrant/Weaviate/pgvector。",
  "approach": "先判规模与是否需训练，再按内存/召回/运维复杂度选索引与向量库。",
  "explanationFocus": "是什么：ANN(近似最近邻)用辅助结构避免 O(n·d) 暴力比对，在召回率与延迟间权衡；FAISS 是底层工具箱，向量库在其上封装服务。",
  "bruteForce": "对 1000 万条 768 维向量每 query 全量扫描约 7.6GB，单查询代价不可接受，必须 ANN。",
  "derivation": [
    "为什么需要：精确 kNN 随数据量线性变慢，RAG 在线检索要求毫秒级，必须近似。",
    "怎么实现：HNSW 建多层小世界图，从顶层贪心下降，参数 M/efConstruction/efSearch；IVF 用 k-means 划 Voronoi 单元，查最近 nprobe 个单元，IVFPQ 再压缩。",
    "有什么代价：HNSW 内存约 2~3 倍原向量(~35GB/千万768维)且不压缩；IVF 需训练且 PQ 有量化误差；nprobe/efSearch 越大越准越慢。",
    "怎么评测：用带标签集测 Recall@k 与 P95 延迟，按 SLA 调参；换库看吞吐与运维成本。"
  ],
  "invariant": "经验法则：HNSW 求快求准上内存足；IVF+PQ 求省内存上亿级；nlist≈sqrt(n)。",
  "walkthrough": "千万级 768 维：HNSW M=32, efSearch=128 内存~35GB；若内存紧用 IVF4096,PQ64，nprobe=64 召回换空间。nlist 经验值≈sqrt(n)。",
  "edgeCases": [
    "HNSW 内存翻倍撑爆 RAM",
    "IVF 未训练直接 add 报错",
    "nprobe 太小召回骤降",
    "PQ 压缩在细粒度检索引入误差",
    "FAISS 不存原文，需自建 id->doc 映射"
  ],
  "code": "import faiss, numpy as np\nd, nlist = 768, 4096\nquant = faiss.IndexFlatL2(d)\nindex = faiss.IndexIVFPQ(quant, d, nlist, 64, 8)\nindex.train(train_vecs)\nindex.add(vecs)\nindex.nprobe = 64\ndist, ids = index.search(q, k=10)",
  "codeNotes": [
    "IVF-PQ 需先 train 再 add",
    "nprobe 控制查几个聚类，越大越准越慢",
    "FAISS 只管向量，原文/元数据另存"
  ],
  "complexity": "训练 O(n·d·k·iter) 一次性；检索随 nprobe 与 efSearch 变化，HNSW 约 O(log n)，IVF 约 O(n·nprobe/nlist)。",
  "followUps": [
    {
      "question": "Milvus/Weaviate/Qdrant/pgvector 怎么选？",
      "answer": "亿级+分布式选 Milvus；云原生易用选 Weaviate；轻量高性能选 Qdrant；已有 Postgres 不想引新组件选 pgvector。"
    },
    {
      "question": "HNSW 和 IVF 谁召回更高？",
      "answer": "通常 HNSW 在中小 efSearch 下召回更稳定更高，但内存大；IVF 靠 nprobe 调，省内存但需训练。"
    }
  ],
  "followUpAnswers": [
    "亿级+分布式选 Milvus；云原生易用选 Weaviate；轻量高性能选 Qdrant；已有 Postgres 不想引新组件选 pgvector。",
    "通常 HNSW 在中小 efSearch 下召回更稳定更高，但内存大；IVF 靠 nprobe 调，省内存但需训练。"
  ],
  "pitfalls": [
    "IVF 忘记 train 直接 add",
    "只看准确率不看内存/延迟代价",
    "误以为 FAISS 会管理原文与元数据"
  ],
  "beginnerSummary": "向量库像图书馆索引卡：HNSW 是多层导览图(快但占地方)，IVF 是把书架分区(省地方但要先分好类)。",
  "prerequisites": [
    "向量相似度",
    "kNN 基本概念"
  ],
  "workedExample": [
    "建 IndexIVFPQ，先用代表性样本 train",
    "add 全部向量，查询时设 nprobe=64 取 top-10"
  ],
  "lineByLine": [
    "IndexFlatL2 作粗量化器",
    "IndexIVFPQ 在 IVF 上做 PQ 压缩(64子空间,8bit)",
    "train 跑 k-means",
    "nprobe=64 决定查多少单元",
    "search 返回距离与 id"
  ],
  "diagram": "Query -> coarse(k-means) -> nprobe cells -> PQ decode -> top-k\nHNSW: top layer -> greedy descend -> layer0 refine"
};
