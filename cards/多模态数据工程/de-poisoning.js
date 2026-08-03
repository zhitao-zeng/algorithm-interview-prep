export default {
  "id": "de-poisoning",
  "category": "多模态数据工程",
  "difficulty": "Hard",
  "title": "数据投毒与防御",
  "prompt": "多模态训练数据可能被投毒（植入错误关联），如何在数据工程阶段检测并防御此类攻击？",
  "quickAnswer": "投毒通常在数据里植入\"触发词-错误标签\"或\"特定图像-错误文本\"的强关联。防御在数据侧：异常统计检测（来源聚集、重复模式）、 outlier 过滤、来源可信度评分、以及训练侧差分隐私/鲁棒聚合。数据工程重点是源头管控与分布异常发现。",
  "approach": "统计每来源/每模式的样本聚集度，对异常高密度或特定模板样本做人工抽检；用 embedding 离群检测找异常簇；维护来源信誉并降权可疑源。",
  "explanationFocus": "是什么：数据投毒指攻击者在训练集中植入精心构造的样本，使模型学到恶意关联（如特定图必答某错话）。数据工程防御是在入库前通过来源管控、分布异常与离群检测阻断投毒样本。",
  "bruteForce": "朴素做法：完全信任外部数据，不做任何来源与异常审查，直接训练。",
  "invariant": "核心不变式：任一来源/模板的样本占比与特征分布应处于历史基线范围内，超出阈值触发审计而非自动入库。",
  "walkthrough": "正常来源单域占比 < 2%；某新源突然贡献 5% 样本且 90% 带同一模板水印+固定错误文本。离群检测将其聚成异常簇，信誉分骤降，人工抽检确认投毒后整源下架，避免 500 万污染样本入训。",
  "code": "def anomaly_score(source_stats, baseline):\n    ratio = source_stats.share\n    if ratio > 3 * baseline.median_share:\n        return 'high'\n    if source_stats.template_rate > 0.5:\n        return 'high'\n    return 'ok'",
  "complexity": "统计为 O(样本) 一遍聚合，离群检测 O(n·d) 或借助索引近线性，整体远低于训练成本。",
  "beginnerSummary": "像食品安检：某批货突然量巨大且都带同一种可疑添加剂，先扣下化验，确认有毒整批销毁，不进生产线。",
  "diagram": "stream ─► source stats ─► share>3x? ─► template>50%? ─► quarantine\n                               │               │\n                            baseline         audit",
  "derivation": [
    "为什么需要：开放数据易被注入恶意样本，训练后模型行为被操控且难逆转。",
    "怎么实现：来源信誉+占比异常+模板/离群检测，可疑源隔离审计。",
    "有什么代价：严格过滤可能误伤正常大源，且高级投毒隐蔽难以全检。",
    "怎么评测：用已知投毒探针集测召回率，并做红蓝对抗验证鲁棒性。"
  ],
  "edgeCases": [
    "合法营销活动短期量增被误判投毒。",
    "投毒样本分散到多源规避占比检测。",
    "触发模式在语义空间而非字面，需 embedding 检测。",
    "水印极淡难以模板识别。"
  ],
  "pitfalls": [
    "只看占比忽略语义离群，漏掉分散式投毒。",
    "信誉系统一旦误杀大源会损失大量好数据。"
  ],
  "prerequisites": [
    "统计异常检测",
    "向量离群检测",
    "来源信誉与数据溯源"
  ],
  "workedExample": [
    "source_stats.share=0.05，baseline 中位数 0.02 → 2.5 倍未触发但 template_rate=0.9 触发。",
    "聚类发现 500 万样本共享同一隐藏触发模式。",
    "整源 quarantine 并下架，保护训练集。"
  ],
  "lineByLine": [
    "def anomaly_score(source_stats, baseline): 评估某源是否异常。",
    "ratio = source_stats.share 取该源占比。",
    "if ratio > 3*baseline.median_share: return \"high\" 占比超基线三倍判异常。",
    "if template_rate > 0.5: return \"high\" 模板化率过高也判异常。"
  ],
  "codeNotes": [
    "阈值 3x 与 0.5 需按业务校准，过严误伤、过松漏毒。"
  ],
  "followUps": [
    {
      "question": "分散到多源的投毒怎么防？",
      "answer": "靠 embedding 空间离群检测找语义一致的异常簇，而非仅看单源占比。"
    },
    {
      "question": "训练侧还能补什么防御？",
      "answer": "可用差分隐私、梯度裁剪/鲁棒聚合降低单样本影响，但数据侧源头管控最有效。"
    }
  ],
  "followUpAnswers": [
    "靠 embedding 空间离群检测找语义一致的异常簇，而非仅看单源占比。",
    "可用差分隐私、梯度裁剪/鲁棒聚合降低单样本影响，但数据侧源头管控最有效。"
  ],
  "kind": "concept"
};
