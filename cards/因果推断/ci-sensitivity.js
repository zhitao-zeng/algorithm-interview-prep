export default {
  "id": "ci-sensitivity",
  "kind": "concept",
  "category": "因果推断",
  "title": "因果敏感性分析(Rosenbaum 边界与 E-value)",
  "difficulty": "Hard",
  "prompt": "当 unconfoundedness 可能不成立时，如何用 Rosenbaum 边界与 E-value 判断因果结论是否稳健？",
  "quickAnswer": "敏感性分析量化\"未观测混杂要多强才能推翻结论\"。Rosenbaum 边界给出处理组与对照组在混杂下倾向得分比的上界 Γ，Γ 越大结论越稳；E-value(VanderWeele)给出使点估计失效所需的最小混杂强度(风险比形式)，E-value 越大结论越难被未观测混杂推翻。二者都回答\"还要藏多深的混杂才能翻案\"，帮助判断结论可信度。",
  "code": "import numpy as np\n\ndef e_value(rr, ci_low=None):\n    if ci_low is None:\n        return rr + np.sqrt(rr * (rr - 1)) if rr > 1 else 1/rr + np.sqrt((1/rr) * (1/rr - 1))\n    est = ci_low + np.sqrt(ci_low * (ci_low - 1)) if ci_low > 1 else 1/ci_low + np.sqrt((1/ci_low) * (1/ci_low - 1))\n    return est\n\ndef rosenbaum_gamma(p, gamma):\n    return p * gamma",
  "complexity": "E-value 解析 O(1)；Rosenbaum 边界重排/重加权 O(N·iter)",
  "beginnerSummary": "你说这药真有效，我得问：还要藏一个多厉害的\"隐藏因素\"才能把你这结论扳倒？能扳倒需要的隐藏因素越夸张，你这结论就越稳。",
  "explanationFocus": "是什么：因果敏感性分析评估未观测混杂(unmeasured confounding)在多大程度上能改变已得因果结论，常用 Rosenbaum 边界(倾向得分比上界 Γ)与 E-value(使点估计失效的最小混杂风险比)两种度量。",
  "approach": "先估主效应，再反推\"需多强未观测混杂才能翻案\"：E-value 给单一数字阈值，Rosenbaum 边界给 Γ 随 p 值变化的稳健区间。",
  "derivation": [
    "为什么需要：unconfoundedness 不可证伪，必须量化结论对遗漏混杂的脆弱度。",
    "怎么实现：Rosenbaum 用 Γ 限定处理/对照组倾向得分比；E-value 反解使 RR 退化为 1 的最小混杂强度。",
    "有什么代价：都基于简化假设(单混杂、同质效应)，只能给边界而非真实偏倚。",
    "怎么评测：报告 E-value 并与已观测协变量强度对比；Γ 临界值远大于 1 才称稳健。"
  ],
  "edgeCases": [
    "效应接近 0 时 E-value≈1，任何微小混杂都能翻案，结论本就脆弱。",
    "存在多个相关未观测混杂，单因子 E-value 低估所需总强度。",
    "效应估计本身置信区间宽，即使 E-value 大也难言稳健。"
  ],
  "pitfalls": [
    "把 E-value 当\"已证明无混杂\"，它只是翻案难度阈值。",
    "未把已观测混杂强度作为参照，孤立看 E-value 易误判。"
  ],
  "prerequisites": [
    "可忽略性/unconfoundedness 假设",
    "风险比与因果效应度量"
  ],
  "workedExample": [
    "观察研究得 RR=2.0(处理增风险一倍)，E-value=2.0+√(2·1)=3.41：需一个使风险×3.41 的未观测混杂才能翻案。",
    "若最强已观测协变量仅 RR=1.5，因 1.5<3.41，说明已观测混杂还不够强，结论相对稳健；Rosenbaum Γ 在 p=0.05 临界约 1.8，即倾向得分比需达 1.8 倍才推翻。"
  ],
  "lineByLine": [
    "def e_value：对点估计 rr>1 用 rr+√(rr(rr-1)) 计算翻案所需最小混杂强度。",
    "对置信下限 ci_low 同样计算，保证区间端点也稳健。",
    "def rosenbaum_gamma：示意 Γ 放大对 p 值的影响，实际需按倾向得分比对配对重加权。"
  ],
  "followUps": [
    {
      "question": "E-value 和 Rosenbaum 边界哪个更常用？",
      "answer": "E-value 给出单一直观阈值、易报告，流行病与观测研究常用；Rosenbaum 边界给出随 Γ 变化的显著区间，更细但计算与解释更重。两者互补，报告中常并列。"
    },
    {
      "question": "E-value 大于 1 很多就代表无混杂吗？",
      "answer": "不。它只说明要翻案需很强的混杂；若已知存在 RR>该值的未观测混杂，结论仍可能被推翻。须结合领域知识判断是否存在如此强的混杂。"
    }
  ],
  "order": 14,
  "followUpAnswers": [
    "E-value 给出单一直观阈值、易报告，流行病与观测研究常用；Rosenbaum 边界给出随 Γ 变化的显著区间，更细但计算与解释更重。两者互补，报告中常并列。",
    "不。它只说明要翻案需很强的混杂；若已知存在 RR>该值的未观测混杂，结论仍可能被推翻。须结合领域知识判断是否存在如此强的混杂。"
  ]
};
