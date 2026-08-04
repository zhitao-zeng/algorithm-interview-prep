export default {
  "id": "ma-toolformer",
  "category": "多模态Agent",
  "difficulty": "Medium",
  "title": "Toolformer 工具调用",
  "prompt": "Toolformer 是怎样让语言模型以自监督方式学会何时、如何调用外部工具的？",
  "quickAnswer": "Toolformer 用少量人工标注的\"工具调用示范\"让模型自举生成大量带调用的训练样本，再按工具返回结果是否提升语言建模似然来筛选，最后用筛选后的数据微调，使模型自主决定调用 API 而不需人类逐步标注。",
  "approach": "核心是把\"要不要调用工具\"变成可学习的似然信号：用采样生成候选调用、用真实工具执行拿回结果、只保留让后续文本更可预测的样本。",
  "explanationFocus": "是什么：Toolformer 是一种让语言模型自监督学会调用外部工具（如计算器、搜索引擎、日历、问答接口）的方法，它不需要人工逐步标注工具使用，而是让模型自己采样可能的调用、执行后根据\"带上工具结果是否让句子更通顺\"来筛选样本，再用这些样本微调，最终模型能按需自动插入 API 调用。",
  "bruteForce": "传统做法是人工写大量\"在某某处调用某工具\"的标注，成本高且难覆盖所有情形；或者做成检索增强固定流程，模型无法自主取舍。",
  "invariant": "对于任意输入，模型只在工具结果能降低后续 token 困惑度时才保留该调用，筛选准则在训练数据构造上保持一致。",
  "walkthrough": "①人工写少量调用示范；②模型对语料采样插入候选调用；③执行工具拿回结果；④计算带/不带结果时的似然差；⑤只保留正向样本微调。",
  "complexity": "主要开销在自举阶段的工具执行与似然评估，约 O(样本数×候选数)，微调本身与常规语言建模同量级。",
  "beginnerSummary": "就像教小孩：先给几个\"遇到算术就按计算器\"的例子，让他自己练很多次，只保留\"按了计算器算对的\"那些练习，最后他自然知道啥时候该用工具。",
  "diagram": "demo -> sample calls -> execute tool\n                             |\n                  keep if P(text|result) up\n                             |\n                         fine-tune",
  "code": "def toolformer_sample(text, model, tool):\n    cand = model.sample_calls(text)        # insert API placeholders\n    kept = []\n    for c in cand:\n        r = tool.run(c.args)\n        gain = likelihood(text, with_=r) - likelihood(text)\n        if gain > 0:\n            kept.append(apply_call(text, c, r))\n    return kept\n\ndef likelihood(text, with_=None):\n    return model.logp(text, tool_result=with_)",
  "derivation": [
    "为什么需要：人工逐步标注工具调用昂贵且不全，模型应学会自主决定何时求助外部能力。",
    "怎么实现：用少量示范自举采样候选调用，真实执行工具，按结果是否提升语言模型似然来筛选样本并微调。",
    "有什么代价：自举阶段需反复调用外部工具并算似然，算力与接口成本不低；工具不可控时延会拖慢构造。",
    "怎么评测：在算术、问答、日历等下游任务对比有无工具调用的准确率，看模型是否在该用时才用。"
  ],
  "edgeCases": [
    "工具偶发超时或返回错误，样本构造需容错否则污染训练。",
    "似然提升但结果事实错误（如搜索到错的网页），模型学到错误调用。",
    "低频工具采样不足，模型几乎不调用，需示范覆盖。"
  ],
  "pitfalls": [
    "只用似然筛选会偏好\"让句子顺\"而非\"答案对\"，需辅以正确性校验。",
    "候选采样温度不当导致调用格式不合规，微调后也难修正。"
  ],
  "prerequisites": [
    "语言模型的似然与自监督微调",
    "外部工具/API 的封装与可执行性"
  ],
  "workedExample": [
    "算术：模型对\"123*456=?\"插入计算器调用，结果正确则保留该样本。",
    "问答：遇到事实问题插入搜索调用，返回片段使续写更准确则入选。"
  ],
  "lineByLine": [
    "sample_calls 让模型在文本中尝试插入 API 占位，是探索的起点。",
    "gain>0 用似然差作自监督信号，替代人工标注是否该调用。",
    "apply_call 把真实结果回填文本，形成最终训练样本。"
  ],
  "codeNotes": [
    "likelihood 同时支持有无工具结果，差值即\"调用价值\"的代理指标。"
  ],
  "followUps": [
    {
      "question": "和 ReAct 这类提示式调用比？",
      "answer": "Toolformer 把调用能力烧进权重、推理零额外提示；ReAct 靠提示引导、可控但每步多轮生成更慢。"
    },
    {
      "question": "多模态下怎么扩展？",
      "answer": "把工具换成图像生成/视觉检索/OCR 等，筛选准则仍是\"带结果是否提升后续预测\"。"
    }
  ],
  "followUpAnswers": [
    "Toolformer 把调用能力烧进权重、推理零额外提示；ReAct 靠提示引导、可控但每步多轮生成更慢。",
    "把工具换成图像生成/视觉检索/OCR 等，筛选准则仍是\"带结果是否提升后续预测\"。"
  ],
  "kind": "concept"
};
