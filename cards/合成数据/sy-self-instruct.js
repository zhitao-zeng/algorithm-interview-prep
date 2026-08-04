export default {
  "id": "sy-self-instruct",
  "category": "合成数据",
  "difficulty": "Easy",
  "title": "Self-Instruct 自生成",
  "prompt": "Self-Instruct 是怎么用少量人工种子让 LLM 自己生成大量多样化指令与回答的？",
  "quickAnswer": "以少量人工种子指令为引导，让 LLM 先生成新指令、再判断是否分类可学习、随后为新指令生成回答，最后用启发式过滤重复与低质项，形成自举式数据扩充。",
  "approach": "四步循环：1) 用种子引导 LLM 生成候选指令；2) 用 RoBERTa 分类器筛掉与已有指令太相似的；3) 对通过指令用 LLM 生成回答；4) 过滤无效/重复样本并合并回池子继续迭代。",
  "explanationFocus": "是什么：Self-Instruct 是一种自举(bootstrapping)框架，仅用极少量人工种子即可让 LLM 大规模生成指令-响应对，提升指令遵循能力。",
  "bruteForce": "朴素做法：完全靠人工写指令与回答，成本高且难以覆盖长尾任务。",
  "invariant": "生成的指令必须属于\"可被语言模型学习\"的任务类别，且与池中已有指令相似度低于阈值以免冗余。",
  "walkthrough": "取种子\"写一封请假邮件\"，让 LLM 生成新指令\"写一封感谢合作方的邮件\"，分类器判为可学习且不与池重复，再让 LLM 产出回答，过滤后入池。",
  "complexity": "主要开销在指令生成与回答生成的 LLM 调用，约 O(N) 条指令；分类器为轻量蒸馏模型，开销可忽略。",
  "beginnerSummary": "给模型看几条范例，让它照着范例源源不断编出新题目并自己作答，再挑掉重复和胡来的——这就是 Self-Instruct。",
  "diagram": "seed set --prompt--> LLM gen instructions\ninstructions --RoBERTa filter (sim<tau)--> keep unique\nkeep --LLM gen answer--> (instr, answer) pair\npair --dedup--> pool --loop--> more data",
  "code": "def self_instruct(seed_pool, llm, clf, tau=0.7, n=1000):\n    pool = list(seed_pool)\n    while len(pool) < n:\n        cand = llm.gen_instruction(sample(pool, k=6))\n        if clf.similar(cand, pool) < tau:\n            ans = llm.gen_answer(cand)\n            pool.append({\"instr\": cand, \"answer\": ans})\n    return pool",
  "derivation": [
    "为什么需要：高质量指令数据稀缺且标注昂贵，而大模型具备零样本生成能力，可用于自我供给训练信号。",
    "怎么实现：以少量种子提示 LLM 产出新指令，用轻量分类器去重，再让同一 LLM 为新指令写回答，过滤后回灌池子迭代。",
    "有什么代价：生成的指令可能重复、低质或不可学，需要相似度与可学习性过滤；自生成分布可能偏离真实需求。",
    "怎么评测：用生成数据微调模型后在 SUPER-NATURAL INSTRUCTIONS 等基准上对比基线，并人工评估指令多样性与可执行性。"
  ],
  "edgeCases": [
    "生成指令与已有高度相似，需相似度阈值过滤避免冗余。",
    "指令不可学习(如需要真实外部工具)，需在分类阶段剔除。",
    "回答为空或格式错误，需校验后丢弃。",
    "种子过少导致早期多样性不足，需迭代多轮积累。"
  ],
  "pitfalls": [
    "只用 top-p 采样易产生高频套路指令，应控制温度并做去重。",
    "回答由同一模型生成会带入其偏见，建议关键任务混入人工校对。"
  ],
  "prerequisites": [
    "理解指令微调与零样本/少样本提示。",
    "了解文本相似度与轻量分类器(如 RoBERTa)的基本用法。"
  ],
  "workedExample": [
    "种子\"总结这篇文章\" -> 生成\"为这段会议记录提取三点行动项\"并自答。",
    "种子\"翻译句子\" -> 生成\"把用户评论按情感分类并给出理由\"并自答。"
  ],
  "lineByLine": [
    "while len(pool) < n: 持续自举直到达到目标指令数量。",
    "cand = llm.gen_instruction(sample(pool, k=6)) 用池中少量样本作上下文示范，引导生成风格一致的新指令。",
    "if clf.similar(cand, pool) < tau: 仅保留与已有指令不相似的候选，控制冗余。",
    "ans = llm.gen_answer(cand) 对通过指令生成回答，组成训练对。"
  ],
  "codeNotes": [
    "sample(pool, k=6) 提供少量范例即可触发模型的指令生成能力，比零样本更稳定。"
  ],
  "followUps": [
    {
      "question": "Self-Instruct 与 Evol-Instruct 区别？",
      "answer": "前者从少量种子自举生成大量新指令侧重数量与多样性，后者在已有指令上迭代改写为更难版本侧重难度进化。"
    },
    {
      "question": "相似度阈值 tau 怎么定？",
      "answer": "通过人工抽检在不同 tau 下的留存质量做取舍，常用 0.7 左右，过低冗余高、过高损害多样性。"
    }
  ],
  "followUpAnswers": [
    "前者从少量种子自举生成大量新指令侧重数量与多样性，后者在已有指令上迭代改写为更难版本侧重难度进化。",
    "通过人工抽检在不同 tau 下的留存质量做取舍，常用 0.7 左右，过低冗余高、过高损害多样性。"
  ],
  "kind": "concept"
};
