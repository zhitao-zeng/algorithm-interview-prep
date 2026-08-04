export default {
  "id": "cg-llm-as-judge",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "LLM-as-judge 与人工校准",
  "prompt": "LLM-as-judge 在自动评测中如何给出稳定评分，又为什么必须用人工标注做校准与偏差修正？",
  "quickAnswer": "让 judge 模型按结构化 rubric 输出分数与理由，并用人工标注集计算与人工的一致性、位置/风格偏差，据此重标定或加校准提示。",
  "code": "def llm_as_judge(candidate: str, ref: str, judge_llm) -> dict:\n    # LLM-as-judge：结构化评分 + 人工校准阈值\n    out = judge_llm.score(f'评分1-5并给理由:\\n候选:{candidate}\\n参考:{ref}')\n    return {'score': int(out['score']), 'reason': out['reason']}\n",
  "complexity": "时间 O(1*t_j)，空间 O(1)（t_j judge 单次耗时）",
  "beginnerSummary": "像让资深编辑打分：先给评分标准，他打分时还要写理由；再定期拿真人评分校正他的口味偏差。",
  "derivation": [
    "为什么需要：人工评测贵且慢，LLM-judge 可规模化，但存在位置/长度/风格偏差需校正。",
    "怎么实现：定义 rubric 让 judge 输出分数+理由，用人工标注集算一致性并识别偏差类型。",
    "有什么代价：强 judge 模型本身有成本，且对自家人（同系列）可能偏爱，需盲评。",
    "怎么评测：在人工金标上算 judge 的准确率/κ 系数，目标达到可接受一致性再上线。"
  ],
  "edgeCases": [
    "候选顺序影响评分（位置偏差），需双向打分取均。",
    "长答案被偏好，需长度归一或配对比较。",
    "风格不同但内容等价，需 rubric 弱化文风权重。",
    "judge 与待评模型同源导致自偏爱，需异构 judge。"
  ],
  "pitfalls": [
    "直接用原始分数当真理，忽略与人工的一致性。",
    "单轮无理由评分不可解释、难校准。"
  ],
  "prerequisites": [
    "评分 rubric 设计",
    "一致性指标（准确率/κ）",
    "偏差分析与校准"
  ],
  "workedExample": [
    "judge 对两答案双向打分取均，消除位置偏差后分差 0.3。",
    "人工标 200 条算得 κ=0.72，发现偏爱长答案，加长度归一提示后升至 0.81。"
  ],
  "lineByLine": [
    "def llm_as_judge：接收候选、参考与 judge 模型。",
    "judge_llm.score(...)：按 rubric 提示输出分数与理由。",
    "int(out['score'])：取整数评分便于聚合。",
    "return {...}：返回结构化评分与理由供人工校准。"
  ],
  "followUps": [
    {
      "question": "如何降低 LLM-judge 的位置偏差？",
      "answer": "对同一对候选做正反向两次打分取平均，或在 rubric 中明确要求‘忽略顺序’，并定期用人工对拍验证。"
    },
    {
      "question": "judge 与待评模型同源会有什么问题？",
      "answer": "可能产生自偏爱导致分数虚高，应使用异构更强模型作 judge 并盲去来源信息。"
    }
  ],
  "followUpAnswers": [
    "对同一对候选做正反向两次打分取平均，或在 rubric 中明确要求‘忽略顺序’，并定期用人工对拍验证。",
    "可能产生自偏爱导致分数虚高，应使用异构更强模型作 judge 并盲去来源信息。"
  ],
  "explanationFocus": "是什么：LLM-as-judge 是用一个较强的 judge 模型按结构化 rubric 对候选答案打分与给理由，并用人标校准偏差的自动评测方法。",
  "approach": "定义 rubric 让 judge 输出分数+理由，用人工标注集计算一致性与位置/长度偏差，据此重标定或加校准提示后上线。",
  "kind": "concept"
};
