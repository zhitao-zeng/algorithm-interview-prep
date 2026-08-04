export default {
  "id": "cg-eval-design",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "LLM 评测指标与评测集设计",
  "prompt": "设计 LLM 评测集时，如何按维度分层抽样并保证指标既能反映能力又不掩盖 bad case？",
  "quickAnswer": "先按任务维度（格式/事实/安全/延迟）分层，每层均衡抽样覆盖边界与长尾，指标上同时报告聚合分与分项 bad case 分布，避免被平均掩盖。",
  "code": "def build_eval_set(samples: list, dims: list, per_dim: int = 20) -> list:\n    # 评测集设计：按维度分层均衡抽样\n    buckets = {d: [s for s in samples if s['dim'] == d] for d in dims}\n    chosen = []\n    for d, items in buckets.items():\n        chosen += items[:per_dim]   # 每层取代表样本\n    return chosen\n",
  "complexity": "时间 O(S)，空间 O(E)（S 总样本，E 评测集规模）",
  "beginnerSummary": "像体检套餐：不只要总分，还要分项查（心/肝/肺各抽样本），哪科差一眼看得出。",
  "derivation": [
    "为什么需要：单一总分易掩盖某维度崩塌，分层设计能定位短板并跟踪细分能力提升。",
    "怎么实现：定义维度标签，对每维均衡抽样，指标分别报告各维准确率与 bad case 分布。",
    "有什么代价：标注与分层成本高，维度定义不当会错位覆盖。",
    "怎么评测：用人工复核评测集代表性，确认各维难度与线上分布一致。"
  ],
  "edgeCases": [
    "某维度样本极少，强行均分会欠代表，需针对性补充采集。",
    "维度间重叠（既事实又安全），需主维度+标签。",
    "分布漂移后评测集过期，需定期刷新。",
    "长尾难例占比过低，需上采样难例。"
  ],
  "pitfalls": [
    "只看总分不看分项，某维度 0 分被平均掩盖。",
    "评测集与线上分布不一致，指标虚高。"
  ],
  "prerequisites": [
    "评测维度建模",
    "分层抽样与统计",
    "指标设计与偏差分析"
  ],
  "workedExample": [
    "维度=['format','fact','safety']，各抽 20 条，总 60 条评测集。",
    "跑分发现 fact 维仅 0.6，其余 0.9，定位到事实一致性是短板。"
  ],
  "lineByLine": [
    "def build_eval_set：接收全量样本、维度与每层数量。",
    "buckets = {...}：按维度把样本分桶。",
    "items[:per_dim]：每层取前 per_dim 条代表样本。",
    "return chosen：返回均衡的多维评测集。"
  ],
  "followUps": [
    {
      "question": "如何防止评测集被‘刷分’过拟合？",
      "answer": "评测集与训练/调参集隔离，定期用新采样本替换，并报告在未见维度上的泛化分。"
    },
    {
      "question": "指标除准确率外还应报什么？",
      "answer": "报分项准确率、bad case 类型分布、延迟分位与人工一致性，避免单一聚合掩盖问题。"
    }
  ],
  "followUpAnswers": [
    "评测集与训练/调参集隔离，定期用新采样本替换，并报告在未见维度上的泛化分。",
    "报分项准确率、bad case 类型分布、延迟分位与人工一致性，避免单一聚合掩盖问题。"
  ],
  "explanationFocus": "是什么：LLM 评测集设计是按任务维度分层均衡抽样、并配套分项指标的方法，用结构化评测集暴露各能力短板而非只看总分。",
  "approach": "先定义评测维度并分层抽样保证覆盖边界与长尾，指标上同时报告聚合分与分项 bad case 分布，避免被平均掩盖。",
  "kind": "concept"
};
