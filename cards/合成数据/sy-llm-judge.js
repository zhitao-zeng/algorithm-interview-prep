export default {
  "id": "sy-llm-judge",
  "category": "合成数据",
  "difficulty": "Medium",
  "title": "LLM 作为裁判筛选数据",
  "prompt": "如何用\"LLM 作为裁判\"(LLM-as-a-Judge)对合成数据进行质量打分与筛选？",
  "quickAnswer": "设计结构化评分维度(如正确性、相关性、复杂性、可读性)，用裁判 LLM 对每条合成样本按维度打分离散或连续分，再按阈值或排序截断保留高分段，必要时用多人裁判一致性校准。",
  "approach": "先定义评分量表与少量人工标注的黄金集做裁判校准；再批量调用裁判 LLM 输出维度分数与理由；最后聚合分数、剔除低分与自相矛盾项，对边界样本做二次复核。",
  "explanationFocus": "是什么：LLM-as-a-Judge 指用较强的 LLM 替代或辅助人工，对文本样本按预设维度给出可解释评分，从而低成本大规模筛选与排序合成数据。",
  "bruteForce": "朴素做法：全量人工标注质量，成本高、慢且标准难统一。",
  "invariant": "同一对样本在固定提示下的裁判评分必须可复现(低随机性)，且评分维度口径与黄金集一致。",
  "walkthrough": "对一条合成问答，裁判按\"正确性/相关性/难度\"各打 1-5 分并给理由，聚合得 4.2 分，高于阈值 3.5 保留，低于则丢弃。",
  "complexity": "开销为 O(N) 次裁判调用；若做多裁判一致性与复核则乘以常数倍，可用小模型做初筛降本。",
  "beginnerSummary": "让一个\"评分员\"大模型按几条标准给每条合成数据打分，留下高分、丢掉低分，省去大量人工审。",
  "diagram": "samples --scoring prompt(w/ rubric)--> judge LLM\njudge LLM --per-dimension scores--> aggregate\naggregate --threshold/rank--> keep / drop\nborderline --re-judge/Human--> final set",
  "code": "def llm_judge(sample, judge, rubric):\n    out = judge.score(prompt=build_prompt(sample, rubric))\n    scores = parse_json(out)\n    total = sum(scores.values()) / len(scores)\n    return total, scores",
  "derivation": [
    "为什么需要：合成数据规模巨大，人工逐条审不现实，需要可扩展且带理由的自动质量评估。",
    "怎么实现：定义评分维度与量表，用裁判 LLM 输出结构化分数与依据，聚合后按阈值或排序筛选并复核边界。",
    "有什么代价：裁判本身有偏差与位置效应，强裁判贵；需黄金集校准，否则分数不可信。",
    "怎么评测：在人工标注子集上算裁判与人工的相关系数(如 Kendall/ICC)，并跟踪筛选后数据训练模型的收益。"
  ],
  "edgeCases": [
    "样本极长超出裁判上下文，需分段评分再聚合。",
    "裁判给出非结构化或越界分数，需解析校验与截断。",
    "维度间相互矛盾(如正确却不可读)，需定义聚合与仲裁规则。",
    "裁判自身知识盲区导致误判，对专业题引入领域裁判或人工。"
  ],
  "pitfalls": [
    "默认零温度仍可能受选项顺序影响，应随机化选项位置并多次取平均。",
    "直接用裁判分数做绝对阈值易随批次漂移，建议改为同批相对排序截断。"
  ],
  "prerequisites": [
    "了解提示工程与结构化输出(如 JSON)解析。",
    "理解评估指标与人工标注一致性(ICC/Kendall)。"
  ],
  "workedExample": [
    "对合成代码题：裁判按\"可运行/正确/清晰\"打分，单测可运行且正确得高分保留。",
    "对合成问答：裁判判事实错误则直接判 0 分丢弃，不论文采。"
  ],
  "lineByLine": [
    "out = judge.score(prompt=build_prompt(sample, rubric)) 把样本与评分量表拼成提示交给裁判。",
    "scores = parse_json(out) 解析出各维度分数，需容错处理格式异常。",
    "total = sum(scores.values()) / len(scores) 计算综合均分用于排序。",
    "return total, scores 返回总分与分项便于复核与阈值筛选。"
  ],
  "codeNotes": [
    "build_prompt 应固定维度顺序的随机种子并约束输出 JSON，降低裁判方差。"
  ],
  "followUps": [
    {
      "question": "如何缓解裁判的位置偏差？",
      "answer": "对多选项评分随机化顺序、做多次采样取平均，并用人工黄金集定期校准偏差方向。"
    },
    {
      "question": "裁判模型该怎么选？",
      "answer": "选比生成模型更强且更中立的模型，弱裁判会系统性低估，必要时用多裁判投票。"
    }
  ],
  "followUpAnswers": [
    "对多选项评分随机化顺序、做多次采样取平均，并用人工黄金集定期校准偏差方向。",
    "选比生成模型更强且更中立的模型，弱裁判会系统性低估，必要时用多裁判投票。"
  ],
  "kind": "concept"
};
