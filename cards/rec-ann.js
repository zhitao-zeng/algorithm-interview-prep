export default {
  "kind": "concept",
  "id": "rec-ann",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "向量检索 ANN / Faiss",
  "prompt": "向量检索（ANN / Faiss）的原理是什么？",
  "quickAnswer": "ANN（近似最近邻）在向量空间中快速找回与查询最相似的 k 个向量，牺牲少量精度换百倍速度。Faiss 用 IVF（倒排聚类，先找最近簇再局部搜）与 PQ（乘积量化压缩向量）等把百万级向量的检索压到毫秒。它是双塔召回的底层引擎。",
  "approach": "向量量化建索引(IVF+PQ) → 查询先定位簇再局部精确比较 → 返回 top-K。",
  "explanationFocus": "是什么：ANN 用聚类+量化近似地找最近邻，Faiss 是工业级实现，让双塔召回能在百万向量里毫秒级检索。",
  "bruteForce": "暴力遍历全部向量算距离取 top-K：O(N·d)，N 大时不可行。",
  "derivation": [
    "为什么需要：双塔产出海量物品向量，线上必须毫秒级近邻检索，暴力搜太慢。",
    "怎么实现：IVF 把空间聚成若干簇建倒排，查询只搜最近几簇；PQ 把向量分段用码本压缩，距离用查表近似。",
    "有什么代价：近似带来召回损失；PQ 有量化误差；需调 nprobe/聚类数平衡精度与速度。",
    "怎么评测：看召回率@K、QPS、内存占用、与暴力结果的重合度。"
  ],
  "invariant": "索引一旦建好，查询复杂度与全库规模 N 弱相关，只与命中簇/码本大小相关。",
  "walkthrough": "100万×128维建 IVF4096+PQ 索引占数 GB；查询 u 只搜 16 个近簇得 top500，耗时<5ms。",
  "edgeCases": [
    "分布漂移：新向量落入空簇，需重建/增量。",
    "nprobe 太小漏召，太大变慢。",
    "高维灾难：距离区分度下降。"
  ],
  "code": "# Python (Faiss 思路)\ndef ann_search(index, u, k=500, nprobe=16):\n    index.nprobe = nprobe                  # 搜最近几个簇\n    D, I = index.search(u.reshape(1,-1), k) # 簇内 PQ 近似距离\n    return I[0]                            # top-K 物品 id",
  "codeNotes": [
    "IVF 控检索范围，PQ 控内存。",
    "nprobe 调精度/速度权衡。"
  ],
  "complexity": "建索引 O(N·迭代)；查询 O(nprobe·簇大小·d/PQ查表)，与 N 弱相关。",
  "followUps": [
    {
      "question": "IVF 和 PQ 各自解决什么问题？",
      "answer": "IVF 用聚类减少需比较的向量数(减计算)，PQ 用分段量化压缩向量(减内存与带宽)，二者常组合使用。"
    },
    {
      "question": "为什么 ANN 是近似的？",
      "answer": "只搜最近几个簇、并用压缩向量算距离，可能错过全局最近点，但召回率通常>95%而速度快百倍，工程上划算。"
    }
  ],
  "followUpAnswers": [
    "IVF减计算, PQ减内存。",
    "ANN以精度换速度。"
  ],
  "pitfalls": [
    "以为 ANN 结果与暴力完全一致。",
    "nprobe 设错导致漏召或超时。"
  ],
  "beginnerSummary": "在百万本书里找\"最像\"你描述的那本：笨办法是逐本比对(太慢)。Faiss 先把书按主题分到几百个书架上(IVF)，你只去最相关的几个书架翻；每本书还被压缩成\"内容摘要卡\"(PQ)，比对更快。稍微可能漏一两本，但几毫秒就给你最像的几百本。",
  "prerequisites": [
    "物品已编码成向量。",
    "近邻检索需远快于暴力。",
    "可接受近似误差换速度。"
  ],
  "workedExample": [
    "100万向量建 IVF+PQ 索引。",
    "查询只扫近簇得 top500 <5ms。"
  ],
  "lineByLine": [
    "聚类建倒排索引。",
    "向量量化压缩存储。",
    "查询定位最近簇。",
    "簇内近似距离取 top-K。"
  ],
  "diagram": "向量空间\n  ┌─簇1─┐ ┌─簇2─┐ ...\n  │ ••  │ │ ••  │\n查询 u ─▶ 找最近簇 ─▶ 簇内 PQ 比距离 ─▶ top-K"
};
