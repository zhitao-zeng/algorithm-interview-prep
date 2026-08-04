export default {
  "id": "ocr-refinement-fallback",
  "category": "OCR 文字检测与识别",
  "difficulty": "Hard",
  "title": "局部 refinement、方向分类与窄条件 fallback",
  "prompt": "如何通过局部 refinement、方向分类与窄条件 fallback 将端到端 F1 从 0.6647 提升到 0.7319，且保证其余 53/54 图输出不变？",
  "quickAnswer": "仅对少数低分/疑似错误区域做局部 refinement 与方向校正，并用窄条件 fallback 规则(仅特定形态触发)替换错误预测；因改动范围极窄，54 张图中仅 1 张指标变化(正向)，其余 53 张输出完全一致。",
  "code": "def refine_with_fallback(det_boxes, crops, rec, cls, fallback_rules):\n    \"\"\"窄条件 fallback：仅匹配规则才用 refinement 结果替换原预测\"\"\"\n    results = []\n    changed = 0\n    for box, crop in zip(det_boxes, crops):\n        pred = rec(crop)\n        ref = local_refine(crop, rec)          # 局部 refinement\n        if matches_narrow(box, pred, fallback_rules) and ref.conf > pred.conf:\n            results.append(ref.text); changed += 1\n        else:\n            results.append(pred.text)          # 默认保持原输出不变\n    return results, changed\n\ndef matches_narrow(box, pred, rules):\n    return any(rule.applies(box, pred) for rule in rules)  # 仅窄条件触发\n",
  "complexity": "时间 O(N·R)（R 为规则数），空间 O(N)",
  "beginnerSummary": "不要大改，只“给个别考砸的题单独重做并只在确定更对时才替换答案”，这样全班 54 份卷子 53 份原样不动，只有那 1 份分数变高，整体平均分上升。",
  "derivation": [
    "为什么需要：全局策略易引入回归；只修正明确错误的少数样本可在不破坏多数结果的前提下提升整体 F1。",
    "怎么实现：对低分/方向异常区域做局部 refinement 与方向校正，仅当命中窄条件 fallback 且置信度更高才替换原预测。",
    "有什么代价：规则需精细设计避免误触发；refinement 增加少量计算；极端长尾错误可能不在窄条件覆盖内。",
    "怎么评测：在固定 54 图集回归：确认 53/54 输出逐字符不变，仅目标图 F1 由 0.6647 升至 0.7319。"
  ],
  "edgeCases": [
    "窄条件误触发改坏原本正确的图",
    "refinement 置信度估计不准导致错误替换",
    "方向异常但非倒置的斜文本",
    "多个规则同时命中的优先级"
  ],
  "pitfalls": [
    "fallback 条件过宽引入新回归",
    "只看目标图提升忽略其余图回归",
    "refinement 与原始识别预处理不一致"
  ],
  "prerequisites": [
    "局部 refinement",
    "方向分类",
    "回归测试与窄条件规则"
  ],
  "workedExample": [
    "54 图回归：53 图输出哈希完全一致，仅图#27 经方向校正+refinement 后 F1 0.6647→0.7319。",
    "若将 fallback 条件放宽(去掉窄条件)，出现 6 图回归变动且其中 2 图变坏，证明窄条件必要。"
  ],
  "lineByLine": [
    "def refine_with_fallback(...): 窄条件替换入口。",
    "pred=rec(crop): 先取原预测。",
    "local_refine: 仅对候选做局部精修。",
    "if matches_narrow and ref.conf>pred.conf: 命中且更可信才替换，否则保持原样。"
  ],
  "followUps": [
    {
      "question": "如何证明改动是安全无回归的？",
      "answer": "在固定全集(54 图)做输出哈希对比，确认除目标样本外其余完全一致，并对目标样本展示前后指标差异。"
    },
    {
      "question": "窄条件 fallback 与全局后处理如何配合？",
      "answer": "全局后处理负责通用稳定规则，窄条件 fallback 仅兜底少数明确错误，二者都应先在全集回归验证再加到流水线。"
    }
  ],
  "followUpAnswers": [
    "在固定全集(54 图)做输出哈希对比，确认除目标样本外其余完全一致，并对目标样本展示前后指标差异。",
    "全局后处理负责通用稳定规则，窄条件 fallback 仅兜底少数明确错误，二者都应先在全集回归验证再加到流水线。"
  ],
  "invariant": "changed 计数等于实际替换的样本数；未被窄条件命中的样本其输出严格等于原始 pred.text。",
  "walkthrough": "遍历 54 框：53 个不匹配窄条件→保持原预测(changed=0)；图#27 命中(倒置+低分)→local_refine 置信更高→替换，changed=1；最终仅 1 图变化且 F1 提升。",
  "kind": "code"
};
