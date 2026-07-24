export default {
  "kind": "concept",
  "id": "agent-cost",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 的成本控制（token 消耗）",
  "prompt": "怎么控制 Agent 的 token 与调用成本？",
  "quickAnswer": "成本主要来自多轮模型调用与长上下文。控制手段：限制步数与重试、压缩/裁剪历史、用小模型做简单决策大模型做难任务、缓存重复检索与中间结果、批处理工具调用。本质是在\"质量-延迟-成本\"三角中按任务价值取舍，并用预算上限硬熔断。",
  "approach": "限步数→压上下文→模型路由→缓存→预算熔断。",
  "explanationFocus": "是什么：Agent 成本控制是通过限制调用次数、压缩上下文、模型路由与缓存等手段，把 token 与工具费用压到任务价值可接受范围内的工程实践。",
  "bruteForce": "无限制循环调用：几轮就烧掉大量 token 与费用。",
  "derivation": [
    "为什么需要：Agent 天然多轮，易因冗余反思/重试/长上下文失控超预算。",
    "怎么实现：设 max_steps 与预算；历史摘要降长；简单子任务路由小模型；检索与工具结果加 TTL 缓存；对高延迟调用批处理。",
    "有什么代价：压缩可能损质量；小模型误判需回退大模型；缓存有陈旧风险。",
    "怎么评测：看单位任务平均成本、成本方差、成本-质量帕累托。"
  ],
  "invariant": "任何单任务成本不得超过预算硬上限，超限即安全终止。",
  "walkthrough": "客服 Agent：max_steps=6、历史每 8 轮摘要、 FAQ 检索缓存 60s、简单分类用小模型。单均成本降 55% 且满意度持平。",
  "edgeCases": [
    "缓存命中旧答案致过时。",
    "预算截断致任务未完成。",
    "小模型误判需回退大模型增成本。"
  ],
  "code": "def budget_guard(state, budget):\n    if state.tokens > budget:\n        raise BudgetExceeded(state.tokens)\n    if state.steps > state.max_steps:\n        return finalize(state)               # 硬截断\n\n# 配合 cache: get_cached(query) or retrieve(query)",
  "codeNotes": [
    "预算 Hard stop 防失控。",
    "缓存需带 TTL 防陈旧。"
  ],
  "complexity": "优化后成本 ≈ 步数×路由单价 + 缓存命中率×检索成本。",
  "followUps": [
    {
      "question": "小模型路由会降质量吗？",
      "answer": "简单决策影响小，复杂判断回退大模型；用分类置信度决定是否升级。"
    },
    {
      "question": "缓存最适合哪类调用？",
      "answer": "高重复、低时效的检索与只读工具结果，设 TTL 平衡新鲜与省钱。"
    }
  ],
  "followUpAnswers": [
    "置信度低则回退大模型。",
    "高重复只读调用最宜缓存。"
  ],
  "pitfalls": [
    "只砍步数不顾质量崩坏。",
    "缓存无 TTL 返回陈旧结果。"
  ],
  "beginnerSummary": "控成本像家庭 budgeting：给每次任务设花销上限(预算)，重复买的东西先看看家里有没有(缓存)，小事自己办大事才请专家(模型路由)，月底超支就停卡(熔断)。",
  "prerequisites": [
    "能统计 token/调用。",
    "有模型路由能力。",
    "可加缓存与预算钩子。"
  ],
  "workedExample": [
    "max_steps 与预算双硬限制。",
    "检索结果加 TTL 缓存。"
  ],
  "lineByLine": [
    "统计累计 token 与步数。",
    "超预算立即终止。",
    "简单决策路由小模型。",
    "重复结果走缓存省费。"
  ],
  "diagram": "Budget --guard--> stop; Cache --hit--> skip retrieve"
};
