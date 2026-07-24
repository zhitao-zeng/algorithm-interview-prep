export default {
  "kind": "concept",
  "id": "rec-rerank",
  "category": "搜索推荐",
  "difficulty": "Medium",
  "title": "重排（Re-ranking / 多样性 / 打散）",
  "prompt": "推荐系统的重排（re-ranking / 多样性 / 打散）是什么？",
  "quickAnswer": "重排是精排之后、展示之前的一层，对精排给的候选做\"再加工\"：插入多样性/品类打散、去重、已读过滤、流量调控(保新/保特定业务)、上下文感知的重排( Listwise 模型如 PRM)。它修正精排的局部贪婪，提升整体列表体验与生态健康。",
  "approach": "精排列表 → 打散/多样性/去重/业务规则 → 上下文重排(Listwise) → 最终列表。",
  "explanationFocus": "是什么：重排在精排结果上做全局调整，加入多样性、打散、去重与业务规则，让整页而不是单条最优。",
  "bruteForce": "直接展示精排序：同类目扎堆、重复作者刷屏、体验单调。",
  "derivation": [
    "为什么需要：精排逐条打分易同质化，整页多样性/生态需额外约束。",
    "怎么实现：先按类目/作者打散(MMR/DPP 提多样性)，再去重与已读过滤，最后用 Listwise 模型按全列表上下文重排。",
    "有什么代价：规则过多伤相关性与收入；Listwise 模型增加延迟。",
    "怎么评测：看多样性指标(ILS/品类覆盖)、打散达标率、线上时长/留存。"
  ],
  "invariant": "重排后的列表在保持相关性的前提下，降低同构项相邻度。",
  "walkthrough": "精排给 50 → DPP 提多样性选 20 → 同作者间隔≥3 → 已读过滤 → 最终 20 展示。",
  "edgeCases": [
    "强打散伤相关性：需相关度下限。",
    "已读去重后候选不足：需补召回。",
    "业务强插：挤占自然结果。"
  ],
  "code": "# Python\ndef rerank(scored, topk=20):\n    picked = mmr_pick(scored, lambda_diversity=0.3, k=topk)  # 多样性选择\n    picked = dedup_authors(picked, min_gap=3)               # 作者打散\n    return filter_read(picked)                              # 去已读",
  "codeNotes": [
    "MMR/DPP 控多样性。",
    "打散避免同质刷屏。"
  ],
  "complexity": "MMR O(k·N)、DPP O(k·N²) 近似；规则 O(N)，N 为精排候选数(几十)。",
  "followUps": [
    {
      "question": "MMR 和 DPP 做多样性有何区别？",
      "answer": "MMR 贪心逐条选\"又相关又不同于已选\"的，简单快；DPP 用行列式刻画子集整体多样性，质量更优但更贵，常近似。"
    },
    {
      "question": "重排和精排目标冲突时听谁的？",
      "answer": "精排保相关与收入，重排保体验与生态，通常重排只在约束内微调序；强业务规则(如保新)可优先但设上限。"
    }
  ],
  "followUpAnswers": [
    "DPP 整体更优但更贵。",
    "重排在约束内微调。"
  ],
  "pitfalls": [
    "过度打散牺牲相关性。",
    "把重排当精排堆复杂模型致延迟。"
  ],
  "beginnerSummary": "精排像挑出 50 个最想推给你的视频，但可能 30 个都是同类搞笑。重排像编辑排版：把同类分开(打散)、去掉重复的、保证一屏里有搞笑也有知识还有新作者(多样性)，让整页好看又不腻。它管的是\"整页体验\"，不是单条多准。",
  "prerequisites": [
    "精排结果易同质化。",
    "整页体验需多样性。",
    "存在业务/生态约束。"
  ],
  "workedExample": [
    "DPP 从 50 精排候选提 20 多样项。",
    "作者间隔≥3、去已读后展示。"
  ],
  "lineByLine": [
    "多样性选择候选。",
    "同作者/类目打散。",
    "过滤已读与重复。",
    "套业务规则出最终序。"
  ],
  "diagram": "精排50 ─▶ 多样性(DPP) ─▶ 打散/去重 ─▶ 业务规则 ─▶ 20"
};
