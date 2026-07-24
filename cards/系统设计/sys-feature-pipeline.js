export default {
  "id": "sys-feature-pipeline",
  "kind": "concept",
  "category": "系统设计",
  "title": "特征工程 Pipeline 与特征一致性",
  "difficulty": "Hard",
  "prompt": "如何设计实时与离线特征 pipeline，并保证训练与线上服务特征一致？",
  "quickAnswer": "特征 pipeline 区分离线特征(批计算入仓)与实时特征(流计算低延迟产出)，统一经 Feature Store 管理。训练-服务一致性的关键是同一份特征定义代码(Same-Code)与统一存储，避免线上线下双套逻辑导致特征穿越。",
  "explanationFocus": "是什么：特征工程 pipeline 是把原始数据加工成模型可用特征的生产链路，涵盖离线批处理、实时流计算与统一特征存储，并要解决训练与服务的一致性难题。",
  "approach": "离线条用 Spark/Flink 批算历史特征入仓，实时条用 Flink 消费日志算近线特征；统一 Feature Store 提供点查与批量读取；强制训练与推理调用同一特征 SDK(Same-Code)与同版本数据，定期做特征一致性对账。",
  "code": "def get_feature(entity_id, cfg):\n    # 线上线下同一份逻辑，避免穿越\n    if cfg.online:\n        return feature_store.point_read(entity_id)\n    return feature_store.batch_read([entity_id])\n\ndef realtime_feature(stream):\n    # 实时特征：窗口统计\n    return stream.window('5m').agg('count')",
  "complexity": "O(实体数) 离线 / O(1) 在线",
  "beginnerSummary": "模型吃饭靠“特征”这盘菜。有些菜可以提前做好放冰箱(离线特征)，有些要现炒(实时特征)。最重要的是：训练和上线时用同一套菜谱，否则模型线上会“水土不服”。",
  "derivation": [
    "为什么需要：模型效果依赖高质量特征，且实时信号能显著提升效果，但线上线下若各写一套会出偏差。",
    "怎么实现：离线批算+实时流算双链路，统一 Feature Store，Same-Code 抽取与版本管理。",
    "有什么代价：双链路维护成本高，实时特征有延迟与乱序问题，一致性对账增加复杂度。",
    "怎么评测：特征一致性对账差异率、特征新鲜度与下游模型离线/在线增益 gap。"
  ],
  "edgeCases": [
    "实时特征因乱序/延迟到达导致窗口统计偏差。",
    "离线重算与在线口径因代码分支不同出现不一致。",
    "特征缺失时模型需有默认值或兜底策略。"
  ],
  "pitfalls": [
    "训练用未来信息(标签泄漏/特征穿越)导致离线虚高线上崩。",
    "线上线下两套实现，长期漂移却无人对账。"
  ],
  "prerequisites": [
    "批处理(Spark)与流处理(Flink)基础",
    "Feature Store 与特征版本管理",
    "训练-服务一致性(特征穿越)概念"
  ],
  "workedExample": [
    "场景：用户近 5 分钟点击数作为实时特征。",
    "Flink 消费点击流做 5 分钟窗口聚合写入 Feature Store，线上低延迟点查。",
    "训练时复用同一聚合逻辑回填历史，对账差异 < 0.1%。"
  ],
  "lineByLine": [
    "def get_feature(...)：训练与推理共用同一函数，仅在线/离线读取方式不同，保证特征口径一致。",
    "def realtime_feature(...)：对实时流做 5 分钟滑动窗口聚合，产出低延迟实时特征。"
  ],
  "followUps": [
    {
      "question": "训练-服务特征不一致最典型的后果是什么？",
      "answer": "即特征穿越，离线指标漂亮但线上失效，因为训练时偷偷用到了服务时拿不到或不同的信息，是推荐效果不达预期的首要嫌疑。"
    },
    {
      "question": "离线特征和实时特征如何取舍？",
      "answer": "离线特征稳定低成本覆盖全量历史，实时特征捕捉近期信号但成本高易出错；通常关键近期行为用实时，长周期统计用离线，二者在 Feature Store 统一。"
    }
  ],
  "followUpAnswers": [
    "即特征穿越，离线指标漂亮但线上失效，因为训练时偷偷用到了服务时拿不到或不同的信息，是推荐效果不达预期的首要嫌疑。",
    "离线特征稳定低成本覆盖全量历史，实时特征捕捉近期信号但成本高易出错；通常关键近期行为用实时，长周期统计用离线，二者在 Feature Store 统一。"
  ]
};
