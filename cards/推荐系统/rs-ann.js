export default {
  "id": "rs-ann",
  "kind": "concept",
  "category": "推荐系统",
  "title": "向量召回与近似最近邻(ANN)：IVF、HNSW、PQ",
  "difficulty": "Hard",
  "prompt": "向量召回中 IVF、HNSW 与 PQ 分别是什么？它们如何在召回率与查询延迟之间做权衡，并如何与双塔模型配合？",
  "quickAnswer": "ANN 在亿级向量中快速找近邻。IVF 用聚类把搜索限定到少数桶；HNSW 用分层图做对数级跳转；PQ 把向量压缩降低距离计算成本。三者常与双塔(item 向量)配合做毫秒级召回。",
  "code": "import numpy as np\n\ndef ivf_search(q, cluster_centers, inv_lists, nprobe=16, k=100):\n    # 只在最近的 nprobe 个簇内做精确搜索\n    dists = [float(np.linalg.norm(q - c)) for c in cluster_centers]\n    _, idx = np.argsort(dists)[:nprobe]\n    pool = [p for c in idx for p in inv_lists[c]]\n    return sorted(pool, key=lambda p: -np.dot(q, p))[:k]\n\ndef pq_distance(q, code, codebooks):\n    # 乘积量化：分段查码本距离表求和\n    m = len(codebooks); d = q.shape[0] // m\n    return sum(float(np.linalg.norm(codebooks[j][code[j]] - q[j*d:(j+1)*d]))\n               for j in range(m))",
  "complexity": "IVF O(nprobe·簇)；HNSW O(log N)；PQ 距离 O(d/m)",
  "beginnerSummary": "亿张图片里找最像的一张，挨个比太慢；ANN 像先按\"大致区域\"分堆(IVF)、再画地图跳着找(HNSW)、还把图片压成缩略图比(PQ)。",
  "explanationFocus": "是什么：近似最近邻(ANN)是一类在海量高维向量中快速找到与查询最相似 top-k 个向量的检索方法，工业召回常把双塔 item 向量建 ANN 索引，用户向量实时查近邻。",
  "approach": "IVF 先聚类、查时只搜最近 nprobe 个簇；HNSW 建多层可导航小世界图做贪心近邻跳转；PQ 把向量分段用码本压缩，距离在压缩空间算；三者可组合(IVF+PQ)。",
  "derivation": [
    "为什么需要：精确近邻 O(N) 在亿级不可行，需近似提速。",
    "怎么实现：IVF 聚类中搜局部；HNSW 图跳转；PQ 量化压缩。",
    "有什么代价：近似牺牲召回率，nprobe/层参数需调；PQ 有量化误差。",
    "怎么评测：召回率@k 与 QPS/延迟权衡，做 Pareto 曲线。"
  ],
  "edgeCases": [
    "nprobe 过小召回率骤降，过大延迟升；需按候选量级调。",
    "PQ 码本训练需足够样本否则量化误差大。",
    "新 item 向量入索引需增量更新，否则召回不到。"
  ],
  "pitfalls": [
    "只用 IVF 不配 PQ，内存与距离计算仍重。",
    "HNSW 参数(efSearch)过小致召回不足，盲目调大伤延迟。"
  ],
  "prerequisites": [
    "向量相似度与索引",
    "聚类与量化基础"
  ],
  "workedExample": [
    "1000 万向量 d=64：IVF4096 聚类中 nprobe=16，仅搜约 4 万向量即得 Recall@100≈0.92，延迟 3ms；HNSW efSearch=64 达 0.95 延迟 2ms。",
    "PQ 把 64 维 float(256B) 压成 8 段 8bit(8B)，存储降 32 倍，距离计算转查表，Recall 仅降 2%。"
  ],
  "lineByLine": [
    "def ivf_search：只在最近的 nprobe 个簇内做精确搜索。",
    "dists = norm(q - c)：对簇心算距离，排序取最近 nprobe 个。",
    "pool = [p for c in idx for p in inv_lists[c]]：收集这些簇内所有候选。",
    "def pq_distance：在量化码本上查表算距离，省去原始向量比较。"
  ],
  "followUps": [
    {
      "question": "IVF、HNSW、PQ 一般怎么组合？",
      "answer": "常组合为 IVF+PQ：IVF 缩小搜索范围、PQ 压缩向量降内存与计算；HNSW 则单独以图结构提供更高召回率与低延迟，三者可按候选规模和精度需求搭配(如 IVF_PQ 用于超大规模，HNSW 用于中规模高精度)。"
    },
    {
      "question": "双塔和 ANN 怎么配合？",
      "answer": "离线用 item 塔把全库物品编码为向量建 ANN 索引；线上用户塔实时编码出 query 向量，一次 ANN 查询即得 TopK 相似物品作为召回结果，整个流程毫秒级。"
    }
  ],
  "followUpAnswers": [
    "常组合为 IVF+PQ：IVF 缩小搜索范围、PQ 压缩向量降内存与计算；HNSW 则单独以图结构提供更高召回率与低延迟，三者可按候选规模和精度需求搭配(如 IVF_PQ 用于超大规模，HNSW 用于中规模高精度)。",
    "离线用 item 塔把全库物品编码为向量建 ANN 索引；线上用户塔实时编码出 query 向量，一次 ANN 查询即得 TopK 相似物品作为召回结果，整个流程毫秒级。"
  ],
  "order": 10
};
