export default {
  "id": "cg-hallucination",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Hard",
  "title": "幻觉防控与事实一致性",
  "prompt": "在多模态生成中，如何把‘检索支撑’与‘claim 级校验’结合来防控幻觉并保证事实一致性？",
  "quickAnswer": "先把生成文本切成原子 claim，再逐条检索证据，未检索到支撑或与上下文矛盾的 claim 标记为幻觉，触发修复或附引用。",
  "code": "def detect_hallucination(text: str, context: str, retriever) -> list:\n    # 幻觉防控：检索支撑句，未命中则标记\n    claims = split_claims(text)        # 切原子 claim\n    hallu = []\n    for c in claims:\n        ev = retriever.search(c, top_k=3)\n        if not grounded(c, ev, context):  # 无支撑或矛盾\n            hallu.append(c)\n    return hallu\n",
  "complexity": "时间 O(C*(r+s))，空间 O(C)（C claim 数，r 检索，s 判定）",
  "beginnerSummary": "像写论文：每句话都要有出处，查不到引用或和原文打架的句子，就标‘存疑’打回去改。",
  "derivation": [
    "为什么需要：多模态模型会对图像/文档‘脑补’不存在的细节，需逐句可溯源才能控幻觉。",
    "怎么实现：claim 切分后用检索器找支撑证据，再用 NLI/匹配判断是否被支撑且与上下文一致。",
    "有什么代价：切分与检索带来额外延迟，小模型判定器可能误判，需人工校准。",
    "怎么评测：用人工标注幻觉数据集测查全率，并以修复后事实一致率衡量效果。"
  ],
  "edgeCases": [
    "claim 含多模态指代（‘图中左侧’），需把图像区域作为证据。",
    "正确但检索库未覆盖的新知识被误标幻觉，需白名单放行。",
    "否定句‘未提及’需反向判定逻辑。",
    "长 claim 含多个事实，需再细分到单事实。"
  ],
  "pitfalls": [
    "只做整段相似度，漏掉句内个别幻觉事实。",
    "检索库陈旧导致把正确新事实误判为幻觉。"
  ],
  "prerequisites": [
    "claim 抽取与切分",
    "检索增强与证据对齐",
    "NLI / 蕴含判定"
  ],
  "workedExample": [
    "生成‘发布会于 5 月举行’，检索到原文‘发布会于 5 月 20 日’，grounded 通过。",
    "生成‘售价 999 元’，检索无此价格且上下文无提及，标记幻觉并触发修复。"
  ],
  "lineByLine": [
    "split_claims(text)：把长文本切成可独立验证的原子 claim。",
    "retriever.search(c, top_k=3)：为每条 claim 检索候选证据。",
    "grounded(c, ev, context)：判断是否被证据支撑且与上下文不矛盾。",
    "hallu.append(c)：未支撑的 claim 收集为幻觉列表。"
  ],
  "followUps": [
    {
      "question": "claim 切分不准会影响防控效果吗？",
      "answer": "会，切太粗漏幻觉、切太细误报；可用微调切分器并按验证集 F1 选粒度。"
    },
    {
      "question": "如何减少检索库未覆盖导致的误标？",
      "answer": "维护可信知识白名单放行已知事实，并对低置信 claim 转人工而非直接判幻觉。"
    }
  ],
  "followUpAnswers": [
    "会，切太粗漏幻觉、切太细误报；可用微调切分器并按验证集 F1 选粒度。",
    "维护可信知识白名单放行已知事实，并对低置信 claim 转人工而非直接判幻觉。"
  ],
  "explanationFocus": "是什么：幻觉防控是把生成内容切成原子 claim 并逐条检索证据、将无支撑或与上下文矛盾的 claim 标记为幻觉的事实一致性机制。",
  "approach": "先切分 claim，再逐条检索证据并用蕴含判定判断是否被支撑，未支撑即标记幻觉并触发修复或附引用。",
  "kind": "concept"
};
