export default {
  "id": "de-dedup-minhash",
  "category": "多模态数据工程",
  "difficulty": "Hard",
  "title": "MinHash/语义去重",
  "prompt": "在大规模多模态语料中，如何用 MinHash 做近似去重，并进一步用语义向量做语义去重？",
  "quickAnswer": "MinHash 用一组哈希函数把文档映射为最小哈希签名，使两文档签名相似度近似等于 Jaccard 相似度，再用 LSH 分桶快速找近邻。语义去重则在 embedding 空间用向量近邻（如 Faiss）找语义重复，能覆盖改写/翻译复述。两者常结合：先 MinHash 去字面重复，再语义去重补漏。",
  "approach": "对文本用 k-shingle 集合算 MinHash 签名，LSH 分桶召回候选对，精确算 Jaccard 判定；语义层用句向量建索引做 ANN 检索，按余弦阈值去重。",
  "explanationFocus": "是什么：MinHash 是一种用随机哈希近似估计集合相似度（Jaccard）的概率方法；语义去重是在向量空间用近邻检索剔除含义相同但字面不同的样本，二者解决\"字面重复\"与\"语义重复\"两类冗余。",
  "bruteForce": "朴素做法：两两计算文档相似度 O(n^2)，在十亿级语料上完全不可行。",
  "invariant": "核心不变式：MinHash 签名第 i 位等于\"所有含该词的哈希中第 i 个哈希函数的最小值\"，其相等概率恰为两集合 Jaccard。",
  "walkthrough": "设 100M 文档，k=5 的 5-gram 集合。用 128 个哈希函数得 128 维签名，LSH 分 32 桶（每桶 4 行）。平均每个文档只需和同桶约 200 个候选比 Jaccard，把 O(n^2) 降到可处理规模，召回约 0.9 的重复对。",
  "code": "def minhash_signature(doc_shingles, hash_fns):\n    sig = []\n    for h in hash_fns:\n        sig.append(min(h(s) for s in doc_shingles))\n    return tuple(sig)",
  "complexity": "单文档签名 O(|shingles|×H)，H 为哈希函数数；LSH 使候选对比降为近线性，整体约 O(n·| shingles|·H)。",
  "beginnerSummary": "像给每篇文章发一张\"指纹卡\"，只记最关键几个特征点；相似文章指纹很接近，先按指纹粗略分组再细比，避免每篇都和全部文章比一遍。",
  "diagram": "doc ─► shingles ─► [h1..h128] ─► signature\n                              │\n                        LSH bands\n                              │\n                        bucket ─► candidate pairs ─► Jaccard",
  "derivation": [
    "为什么需要：网络爬取存在大量镜像、转载、模板页，重复样本会放大偏差并浪费算力。",
    "怎么实现：shingle 集合 + MinHash 签名 + LSH 分桶召回 + 精确 Jaccard；语义层加 embedding ANN。",
    "有什么代价：哈希函数数与分桶参数影响精度/召回，语义去重需 embedding 推理与向量索引内存。",
    "怎么评测：用已知重复数据集测去重召回/误删率，并看下游训练是否因去重而指标提升。"
  ],
  "edgeCases": [
    "极短文档 shingle 过少，签名不稳定。",
    "模板页只有少量 boilerplate 不同但主体重复，需加权 shingle。",
    "跨语言重复 MinHash 失效，必须靠语义层。",
    "LSH 分桶参数不当导致漏桶（假阴性）。"
  ],
  "pitfalls": [
    "误把合法不同主题但共享固定模板的页面全删。",
    "语义阈值过松把同义改写正常样本也删掉，造成数据匮乏。"
  ],
  "prerequisites": [
    "Jaccard 相似度与集合论",
    "哈希函数与随机性",
    "近似最近邻(ANN)与向量索引"
  ],
  "workedExample": [
    "文档 A、B 各取 5-gram 集合，Jaccard=0.85。",
    "128 个哈希下两签名期望约 109 位相同，LSH 高概率同桶。",
    "精确 Jaccard 0.85 > 0.8 阈值 → 判定重复，保留较新一篇。"
  ],
  "lineByLine": [
    "def minhash_signature(doc_shingles, hash_fns): 接收 shingle 集合与哈希函数列表。",
    "for h in hash_fns: 遍历每个哈希函数。",
    "min(h(s) for s in doc_shingles) 取该哈希下所有 shingle 的最小值作为签名一位。",
    "return tuple(sig) 返回整条签名供 LSH 使用。"
  ],
  "codeNotes": [
    "签名位数越多越近似精确 Jaccard，但存储与对比成本线性上升。"
  ],
  "followUps": [
    {
      "question": "MinHash 和直接存全集求 Jaccard 比有什么优势？",
      "answer": "把 O(|set|) 比较压缩成定长签名 O(H) 比较，且可上 LSH 做分桶近邻。"
    },
    {
      "question": "语义去重能完全替代 MinHash 吗？",
      "answer": "不能，语义层更贵且可能误并；MinHash 便宜精准处理字面重复，二者互补。"
    }
  ],
  "followUpAnswers": [
    "把 O(|set|) 比较压缩成定长签名 O(H) 比较，且可上 LSH 做分桶近邻。",
    "不能，语义层更贵且可能误并；MinHash 便宜精准处理字面重复，二者互补。"
  ],
  "kind": "concept"
};
