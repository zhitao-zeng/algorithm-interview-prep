export default {
  "kind": "concept",
  "id": "rag-011",
  "category": "RAG",
  "difficulty": "Hard",
  "title": "RAG 有哪些典型失败模式与缓解？",
  "prompt": "RAG 生产中的典型失败模式有哪些，如何缓解？",
  "quickAnswer": "检索不准、上下文污染/噪声、lost-in-the-middle、知识库缺失仍编造、时效性错乱；缓解靠查询改写、重排、压缩、自省拒答与元数据过滤。",
  "approach": "按『检索侧—上下文侧—生成侧』三段梳理失败点并对应加防护。",
  "explanationFocus": "是什么：RAG 失败分布在检索(找错/找不全)、上下文(噪声/错位)、生成(不忠/编造)三层，需分段对症治理。",
  "bruteForce": "naive 检索→生成一条龙无校验：任一层出错都直接污染答案且难定位。",
  "derivation": [
    "为什么需要：各环节都有独立失败概率，单点优化不够，要系统性列清单并设护栏。",
    "怎么实现：检索层用混合检索+查询改写+重排；上下文层用压缩与策略性排序(相关放首尾)；生成层加忠实度校验、无依据拒答、引用强制。",
    "有什么代价：每加一层都增延迟与复杂度，需按幻觉风险等级选择性启用。",
    "怎么评测：用 RAGAS 四项 + 红队测试(故意缺失/矛盾)验证护栏有效。"
  ],
  "invariant": "经验法则：检索质量是第一杠杆，自省/拒答是最后防线；先治检索再治生成。",
  "walkthrough": "query 知识库无答案：naive RAG 仍编造；加『上下文无相关片段则输出未知』+ Faithfulness 校验后，改为拒答或提示补充。",
  "edgeCases": [
    "检索到相似但不相关(高相似低相关)",
    "多片段互相矛盾",
    "答案在中间被忽略(lost-in-middle)",
    "旧片段被当最新",
    "库无答案仍编造"
  ],
  "code": "def guarded_generate(query, ctxs, llm):\n    if not any(c.relevant for c in ctxs):\n        return '依据现有资料无法回答该问题。'\n    ans = llm.generate(build_prompt(query, ctxs))\n    return ans if faithfulness_ok(ans, ctxs) else '答案未获资料支撑，请核实。'",
  "codeNotes": [
    "先判上下文是否相关再生成",
    "faithfulness 校验作为生成后护栏"
  ],
  "complexity": "额外 O(校验次数) 次 LLM 调用；整体仍受检索与生成主导。",
  "followUps": [
    {
      "question": "lost-in-the-middle 怎么缓解？",
      "answer": "把最相关片段放首尾、次相关放中间，或先压缩再喂，必要时重排保证相关段靠前。"
    },
    {
      "question": "知识库缺失为何还会编造？",
      "answer": "LLM 有参数化先验与『必须作答』倾向，需显式拒答约束与忠实度护栏拦截。"
    }
  ],
  "followUpAnswers": [
    "把最相关片段放首尾、次相关放中间，或先压缩再喂，必要时重排保证相关段靠前。",
    "LLM 有参数化先验与『必须作答』倾向，需显式拒答约束与忠实度护栏拦截。"
  ],
  "pitfalls": [
    "忽视检索质量只调生成",
    "不加拒答导致无依据硬编",
    "上下文顺序不当致关键信息被忽略",
    "过度堆叠护栏拖慢系统"
  ],
  "beginnerSummary": "RAG 像接力赛，任何一棒掉链子答案就翻车：找错资料、资料太杂、AI 没看进去、资料没有还硬编，都要分别设防。",
  "prerequisites": [
    "RAG pipeline",
    "重排/压缩/评测指标"
  ],
  "workedExample": [
    "列出检索/上下文/生成三层失败点",
    "分别加混合检索、压缩、拒答护栏并评测"
  ],
  "lineByLine": [
    "检查上下文相关性，全不相关则拒答",
    "相关则构建 prompt 生成",
    "faithfulness_ok 校验答案是否忠于上下文",
    "不忠则返回警示"
  ],
  "diagram": "Retrieve(错/漏) -> Context(噪/错位) -> Generate(不忠/编造)\n  改写+重排      压缩+排序        拒答+校验"
};
