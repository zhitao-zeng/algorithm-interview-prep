export default {
  "id": "cg-failure-feedback",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Hard",
  "title": "失败原因回注与迭代闭环",
  "prompt": "失败原因回注（failure feedback）如何把一轮生成的失败模式归纳后注入下一轮，形成可收敛的迭代闭环？",
  "quickAnswer": "对失败样本用 judge 归纳共性原因，生成精炼的‘避坑摘要’，再 patch 进后续 prompt/约束，使同类错误在下一轮显著下降，形成收敛闭环。",
  "code": "def failure_feedback(rollout, judge) -> str:\n    # 失败原因回注：归纳失败模式，注入下一轮\n    reasons = [judge.explain(r) for r in rollout if not r.ok]\n    summary = summarize(reasons)        # 伪调用：聚合成避坑要点\n    return patch_prompt(rollout[0].prompt, summary)\n",
  "complexity": "时间 O(F*a)，空间 O(F)（F 失败数，a 归纳耗时）",
  "beginnerSummary": "像复盘会：把这次翻的车归成几条教训，写进下次的操作手册，同样的坑就不再踩。",
  "derivation": [
    "为什么需要：单次修复只救当前样本，不提炼规律会导致同类错误反复出现，需把经验沉淀回提示。",
    "怎么实现：用 judge 解释每处失败，聚类/摘要成共性要点，再 patch 进后续生成的 prompt 或约束。",
    "有什么代价：归纳可能出错引入误导规则，需校验摘要不矛盾且可验证。",
    "怎么评测：对比有无回注的同类错误率，看是否逐轮下降并收敛。"
  ],
  "edgeCases": [
    "失败原因互相矛盾，摘要需去重与冲突消解。",
    "少数长尾失败被误归纳为普遍规则，需设支持度阈值。",
    "回注规则与原有约束冲突，需优先级裁决。",
    "归纳产生‘禁止一切’的过严规则，需约束表述粒度。"
  ],
  "pitfalls": [
    "把个别偶发错当成普遍规律，回注后误伤正常样本。",
    "只回注不验证，错误规则累积使提示膨胀失效。"
  ],
  "prerequisites": [
    "失败归因与解释",
    "文本摘要与聚类",
    "提示迭代与回归测试"
  ],
  "workedExample": [
    "一轮 10 个失败中 6 个‘日期格式错’，归纳为‘日期统一 ISO’，回注后二轮降到 1 个。",
    "2 个‘超长输出’被误归纳并限制长度，导致正常长文被截，经支持度阈值过滤后保留。"
  ],
  "lineByLine": [
    "judge.explain(r)：对每条失败样本生成原因解释。",
    "reasons = [...if not r.ok]：只收集失败样本的原因。",
    "summarize(reasons)：把多条原因聚合成精炼避坑要点。",
    "patch_prompt(...)：把摘要回注到下一轮提示形成闭环。"
  ],
  "followUps": [
    {
      "question": "如何避免错误规则累积膨胀提示？",
      "answer": "对回注规则设支持度与有效期，定期用回归集删掉不再触发或误伤的规则。"
    },
    {
      "question": "归纳错误怎么办？",
      "answer": "回注前用小规模验证集检验规则收益，负收益规则丢弃，并对长尾失败要求更高支持度才回注。"
    }
  ],
  "followUpAnswers": [
    "对回注规则设支持度与有效期，定期用回归集删掉不再触发或误伤的规则。",
    "回注前用小规模验证集检验规则收益，负收益规则丢弃，并对长尾失败要求更高支持度才回注。"
  ],
  "explanationFocus": "是什么：失败原因回注是把一轮生成的失败样本用 judge 归纳共性原因、再提炼成规则注入下一轮提示，从而形成可收敛迭代闭环的机制。",
  "approach": "收集失败样本的解释，聚类摘要为避坑要点，patch 进后续 prompt/约束，并以回归集验证规则收益，使同类错误逐轮下降。",
  "kind": "concept"
};
