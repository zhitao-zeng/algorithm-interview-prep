export default {
  "id": "sy-quality-filter-loop",
  "category": "合成数据",
  "difficulty": "Medium",
  "title": "合成数据质量过滤循环",
  "prompt": "怎样设计一个可迭代的\"质量过滤循环\"来持续净化合成训练数据？",
  "quickAnswer": "串联多层过滤器(去重、格式/可执行校验、 perplexity 与毒害检测、LLM 裁判打分)，对合成数据逐级筛除低质项，再用保留数据的训练收益反向调参过滤器，形成可迭代净化循环。",
  "approach": "流水线式：先规则去重与格式校验，再做困惑度/毒害等统计过滤，最后 LLM 裁判按维度打分截断；每轮用下游评测反馈调整各层阈值与权重，迭代收紧或放松。",
  "explanationFocus": "是什么：质量过滤循环是一套多级、可回灌的过滤器管线，对合成数据做由粗到细的筛选，并依据训练收益持续调优过滤策略。",
  "bruteForce": "朴素做法：只做关键词黑名单，漏掉语义低质与事实错误，噪声大量入池。",
  "invariant": "任一样本只要在某层被判定不达标即丢弃，且每层阈值须由上一轮下游收益反推、不可凭空拍定。",
  "walkthrough": "一批合成问答先去重去掉 15%，再 perplexity 滤除异常流利/生硬项，最后裁判对剩余按质量截断 top 80%，用该集训练看基准涨点后收紧阈值。",
  "complexity": "每轮为 O(N) 乘过滤器层数；LLM 裁判层最贵，可用小模型初筛分流降本。",
  "beginnerSummary": "给合成数据设几道过滤网(去重、查毒、打分)，一层层筛掉差的，再根据训练效果调紧或调松网眼。",
  "diagram": "raw synth --> dedup --> format/exec check\n--> perplexity/toxicity --> LLM judge score\n--> threshold keep/drop\nkeep --train gain--> tune thresholds (loop)",
  "code": "def filter_loop(raw, filters, judge, eval_gain):\n    data = raw\n    for f in filters:\n        data = f(data)\n    scored = judge.score_batch(data)\n    kept = [d for d, s in scored if s >= judge.threshold]\n    judge.threshold = tune(kept, eval_gain)\n    return kept",
  "derivation": [
    "为什么需要：合成数据天然含重复、格式坏、事实错与毒害内容，直接训练会损害模型，需系统化净化。",
    "怎么实现：用由粗到细的多级过滤器(去重、格式/执行、统计、裁判)逐级筛除，并以训练收益反调各层阈值。",
    "有什么代价：多层流水增加延迟与算力，过严会丢有用长尾样本、过松留噪声，需平衡。",
    "怎么评测：对比过滤前后训练模型在基准与毒害率上的差异，用增益曲线定位各层最优阈值。"
  ],
  "edgeCases": [
    "近义重复未被精确去重命中，需语义向量去重而非仅精确匹配。",
    "格式看似合法但逻辑错误，需执行/裁判而非仅正则。",
    "毒害表述隐晦，关键词过滤漏检，需分类器辅助。",
    "阈值过严把稀有正确样本误杀，需保留长尾兜底。"
  ],
  "pitfalls": [
    "各层独立调参易顾此失彼，应联合用下游增益做全局调阈。",
    "只信裁判单模型会带入其偏见，关键层应多裁判或抽人工。"
  ],
  "prerequisites": [
    "了解去重、困惑度与文本分类等基础过滤手段。",
    "理解用下游训练收益反推超参的思路。"
  ],
  "workedExample": [
    "代码样本：先跑 AST/单测过滤掉不可运行项，再裁判打分留 top 85%。",
    "问答样本：去重后过毒害分类器，再按事实正确性与可读性截断。"
  ],
  "lineByLine": [
    "for f in filters: data = f(data) 顺序执行去重、格式等粗过滤器逐级瘦身。",
    "scored = judge.score_batch(data) 对剩余样本用裁判批量打分。",
    "kept = [d for d, s in scored if s >= judge.threshold] 按当前阈值截断保留高质项。",
    "judge.threshold = tune(kept, eval_gain) 用训练增益回灌调整阈值，完成一轮迭代。"
  ],
  "codeNotes": [
    "filters 顺序应从廉价到昂贵，先去重再上 LLM 裁判可显著降低总成本。"
  ],
  "followUps": [
    {
      "question": "去重用精确还是语义？",
      "answer": "先用精确去重廉价去重，再用语义向量去近义重复，二者配合兼顾成本与覆盖率。"
    },
    {
      "question": "阈值如何防止震荡？",
      "answer": "用滑动窗口的历史增益做平滑更新，并对阈值设上下界，避免相邻轮大幅跳动。"
    }
  ],
  "followUpAnswers": [
    "先用精确去重廉价去重，再用语义向量去近义重复，二者配合兼顾成本与覆盖率。",
    "用滑动窗口的历史增益做平滑更新，并对阈值设上下界，避免相邻轮大幅跳动。"
  ],
  "kind": "concept"
};
