export default {
  id: 'live-stream-batch-data', category: '直播变现与增长', kind: 'concept', difficulty: 'Hard', order: 11,
  title: 'Flink、Spark 与 Hive 在直播链路中怎么分工',
  prompt: '直播行为数据如何用 Flink/Kafka 做实时特征，用 Spark/Hive 做离线样本、回刷和分析，并保证口径一致？',
  quickAnswer: 'Kafka 承接事件流；Flink 按 event time、watermark 和状态窗口计算近实时特征并写在线存储；Hive 作为离线表/数仓抽象承载分区数据与 SQL 分析；Spark 适合大规模离线 ETL、样本构建、回刷和训练前处理。核心不是背组件，而是统一事件 schema、特征定义和时间语义，处理去重、乱序、迟到、状态 TTL、幂等写与 backfill。Storm/Hadoop 可视为同类历史/替代栈，具体以公司架构为准。',
  beginnerSummary: 'Flink 像实时流水线，处理刚发生的进入、停留和付费；Spark/Hive 像离线仓库与加工厂，用于算历史、构训练样本和补数。两边必须用同一指标定义，否则线上特征和训练数据会“说不同语言”。',
  explanationFocus: '大数据工程的面试重点是时间、一致性、容错和回放，不是罗列五个框架名称。',
  approach: '事件带 event_id、user_id、room_id、event_time 和 schema_version；Kafka 分区保证局部顺序；Flink 设 watermark/TTL/checkpoint；sink 使用幂等键或事务；离线表按日期/区域分区；同一特征定义支持实时计算与历史 backfill。',
  derivation: ['event time 表示业务发生时间，processing time 表示系统处理时间；乱序场景优先按前者计算窗口。', 'watermark 在完整性和等待时延间取舍，过早会漏迟到事件，过晚会增加状态。', 'checkpoint 恢复计算状态；端到端 exactly-once 还要求 source、sink 与外部副作用共同配合。', 'batch backfill 必须写入独立版本并校验后切换，避免覆盖正在服务的在线特征。'],
  prerequisites: ['Kafka 分区、消费位点和至少一次交付', '窗口、watermark、checkpoint、幂等与流批一致性'],
  workedExample: ['用户在 12:00:05 送礼，事件因网络到 12:00:20 才到；10 秒 watermark 可能把它判为迟到，需要补偿侧输出或修正聚合。', '修复特征逻辑后用 Spark 回刷过去 30 天样本，写 feature_version=v2；对账通过后训练和服务再共同切到 v2。'],
  diagram: '客户端事件 ─▶ Kafka ─▶ Flink(event time / window) ─▶ 在线特征库\n                   └▶ 数据湖 / Hive ─▶ Spark ETL / 回刷 ─▶ 样本 / 训练\n统一 schema + 特征定义 + 版本 ─────────────────────▶ 一致性',
  complexity: '吞吐随事件量增长；窗口状态约与 key 数、窗口长度和 TTL 相关。系统容量需同时考虑峰值 QPS、反压、checkpoint 大小和迟到比例。',
  edgeCases: ['客户端重试产生重复付费事件。', '热点直播间造成单个 key/分区倾斜。', 'schema 变更后新旧消费者对字段含义理解不一致。'],
  pitfalls: ['宣称用了 checkpoint 就自动获得端到端 exactly-once。', '在线和离线各写一套特征 SQL，长期产生训练—服务偏差。'],
  followUps: [{ question: 'Flink 和 Spark Streaming 怎么选？', answer: '看现有生态、延迟目标、状态规模、批流统一方式和运维能力；不能只凭“谁更实时”一句话决定。' }, { question: '热点 key 怎么处理？', answer: '可做局部预聚合、key 加盐后再合并、独立热点通道或自适应分片，并监控分区 lag 和状态大小。' }]
};
