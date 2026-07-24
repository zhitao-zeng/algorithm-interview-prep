export default {
  "id": "sys-streaming-etl",
  "kind": "concept",
  "category": "系统设计",
  "title": "实时流处理与 ETL 设计",
  "difficulty": "Medium",
  "prompt": "如何基于 Kafka/Flink 设计一套 exactly-once 的实时流处理 ETL？",
  "quickAnswer": "实时 ETL 用 Kafka 做高吞吐消息总线、Flink 做有状态计算，通过 checkpoint+两阶段提交实现 exactly-once，并用 watermark 与窗口处理乱序数据。核心是在不丢不重的前提下产出准确实时特征与指标。",
  "explanationFocus": "是什么：实时流处理 ETL 是持续消费消息流、做清洗/聚合/落库的一整套管道，强调低延迟、不丢不重(exactly-once)与对乱序数据的正确处理。",
  "approach": "Kafka 分区分流保证有序与并行；Flink 用 checkpoint 周期快照状态，配合支持事务的 sink 做两阶段提交达成端到端 exactly-once；watermark 推进事件时间并触发窗口，允许有限乱序；迟到数据走侧输出或更新。",
  "code": "def aggregate(stream):\n    # Flink 风格：事件时间窗口聚合\n    w = stream.assign_watermark('10m') \\\n              .window(tumbling='5m')\n    return w.agg(count=count(), sum='amount')\n\ndef sink_exactly_once(result, txn_sink):\n    # 两阶段提交落库\n    txn_sink.commit(result)",
  "complexity": "O(事件速率) 流式 / O(窗口状态)",
  "beginnerSummary": "数据像水流一样不停产生，我们需要边流边算(比如实时统计点击)。难点是数据可能迟到或重复，系统要保证“既不漏算也不重复算”，并正确处理先后顺序。",
  "derivation": [
    "为什么需要：业务要秒级实时特征与指标，批处理太慢，且流数据天然乱序重复。",
    "怎么实现：Kafka 传输、Flink 状态计算、checkpoint+事务 sink 实现 exactly-once、watermark 处理乱序。",
    "有什么代价：exactly-once 增加延迟与协调开销，状态后端存储成本高，watermark 设错丢数据。",
    "怎么评测：端到端延迟、数据准确率(与离线对齐)、吞吐与状态恢复时间。"
  ],
  "edgeCases": [
    "数据严重乱序超过 watermark 宽容度，被判定迟到丢弃。",
    "checkpoint 间隔过大导致故障恢复重算多。",
    "sink 不支持事务则无法严格 exactly-once。"
  ],
  "pitfalls": [
    "watermark 设太松拖慢产出、太紧丢乱序数据。",
    "把处理时间当事件时间，导致窗口划分错误。"
  ],
  "prerequisites": [
    "Kafka 分区与消费语义",
    "Flink 状态管理与 checkpoint",
    "事件时间、watermark 与窗口"
  ],
  "workedExample": [
    "场景：实时统计每 5 分钟用户消费金额。",
    "Kafka 按 user 分区，Flink 事件时间滚动窗口，watermark 容忍 10 分钟乱序。",
    "sink 用支持事务的 OLAP，checkpoint 30s，端到端 exactly-once，延迟 < 1 分钟。"
  ],
  "lineByLine": [
    "def aggregate(...)：给流打 watermark 容忍乱序，再做 5 分钟滚动窗口聚合计数与求和。",
    "def sink_exactly_once(...)：通过事务化 sink 的提交，保证结果只落库一次。"
  ],
  "followUps": [
    {
      "question": "exactly-once 是怎么实现的？",
      "answer": "Flink 周期性 checkpoint 快照状态与位点，sink 支持两阶段提交(预写+在 checkpoint 完成时真正提交)，故障从 checkpoint 恢复，做到端到端不丢不重。"
    },
    {
      "question": "watermark 是什么，为什么重要？",
      "answer": "watermark 是事件时间的进度钟，用来判断窗口何时可触发并容忍一定乱序；设错会导致数据丢失或产出延迟，是流处理正确性的核心。"
    }
  ],
  "followUpAnswers": [
    "Flink 周期性 checkpoint 快照状态与位点，sink 支持两阶段提交(预写+在 checkpoint 完成时真正提交)，故障从 checkpoint 恢复，做到端到端不丢不重。",
    "watermark 是事件时间的进度钟，用来判断窗口何时可触发并容忍一定乱序；设错会导致数据丢失或产出延迟，是流处理正确性的核心。"
  ]
};
