export default {
  "kind": "concept",
  "id": "agent-context-mgmt",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "上下文管理（压缩 / 摘要）",
  "prompt": "Agent 的长对话与上下文管理（压缩/摘要）怎么做？",
  "quickAnswer": "上下文管理在有限窗口内保留最有用的信息：用滚动窗口丢弃旧轮、用 LLM 把历史压缩成摘要、用检索把相关片段按需拉回。目标是\"信息密度最大化\"——既不让关键事实溢出，也不让噪声挤占决策空间。",
  "approach": "窗口管理→摘要压缩→检索回填→关键点常驻。",
  "explanationFocus": "是什么：上下文管理是对 Agent 的 prompt 内容做裁剪、压缩与检索回填，使其在不超窗口的前提下保留决策所需信息。",
  "bruteForce": "全量历史进窗口：迅速超长、成本高、信噪比崩。",
  "derivation": [
    "为什么需要：上下文窗口有限，长任务历史会溢出且稀释注意力。",
    "怎么实现：维护最近 k 轮原文+对更早内容做周期性摘要；用向量检索把相关旧片段在需要时插回；固定 system 常驻约束。",
    "有什么代价：摘要可能丢细节或引入偏差；检索有延迟；需平衡密度与完整。",
    "怎么评测：看任务一致性、关键信息保留率、窗口利用率。"
  ],
  "invariant": "被摘要丢弃的原文需可经检索恢复，避免不可逆信息损失。",
  "walkthrough": "长客服：保留最近 6 轮+每 10 轮生成一次摘要；用户问\"刚才说的优惠\"时检索旧片段回填。共 1 次摘要、1 次检索。",
  "edgeCases": [
    "摘要丢失关键数字：需结构化抽取保重要字段。",
    "检索回填引入无关内容。",
    "常驻 system 过长挤占。"
  ],
  "code": "def compact(history, llm, max_keep=6):\n    recent, old = history[-max_keep:], history[:-max_keep]\n    if old:\n        summary = llm(f\"summarize key facts:\\n{old}\")\n        return [summary] + recent           # 压缩旧内容\n    return recent",
  "codeNotes": [
    "只摘要旧内容，保最近原文。",
    "关键字段用结构化抽取更稳。"
  ],
  "complexity": "摘要每次 O(history) 一次模型调用；检索 O(log n)。",
  "followUps": [
    {
      "question": "摘要和检索怎么选？",
      "answer": "摘要降冗余保概览，检索保精确旧细节；常组合：摘要常驻+检索补细节。"
    },
    {
      "question": "为什么不能只截断？",
      "answer": "硬截断会丢关键早期事实，导致前后矛盾；摘要/检索能保留语义。"
    }
  ],
  "followUpAnswers": [
    "摘要概览+检索补细节。",
    "硬截断丢早期事实。"
  ],
  "pitfalls": [
    "摘要引入偏差污染决策。",
    "丢弃内容不可恢复造成信息黑洞。"
  ],
  "beginnerSummary": "上下文管理像整理书桌：最近用的文件摊桌上(近期原文)，更早的收进文件夹并写张便利贴(摘要)，真要用某旧资料再去翻文件夹(检索)。桌面不至于被淹没。",
  "prerequisites": [
    "有窗口长度约束。",
    "能调用 LLM 做摘要。",
    "有检索通道恢复旧内容。"
  ],
  "workedExample": [
    "每 10 轮生成一次摘要。",
    "按需检索回填旧片段。"
  ],
  "lineByLine": [
    "切分最近与更早历史。",
    "对更早内容做摘要。",
    "保留最近原文保细节。",
    "需要时检索旧片段回填。"
  ],
  "diagram": "[recent] + [summary(old)] + retrieved"
};
