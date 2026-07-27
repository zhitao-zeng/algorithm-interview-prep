export default {
  "id": "sysd-observability",
  "kind": "concept",
  "category": "系统设计",
  "title": "系统可观测性：指标/日志/链路追踪、SLO 与告警、根因定位",
  "difficulty": "Medium",
  "prompt": "对于一个复杂的多模态大模型服务，如何构建指标、日志、链路追踪三位一体的可观测性体系，并基于 SLO 做告警与根因定位？",
  "quickAnswer": "可观测性三大支柱是 Metrics(聚合指标)、Logs(事件明细)、Traces(请求链路)。定义清晰 SLO(如推理 P99<200ms、可用率99.9%)并基于错误预算做告警；通过分布式追踪串联多模态各阶段耗时，结合指标下钻与日志关联做根因定位。核心是‘能被问出问题并回答’。",
  "code": "from dataclasses import dataclass\n\n@dataclass\nclass SLI:\n    ok: int = 0\n    total: int = 0\n    @property\n    def availability(self) -> float:\n        return self.ok / self.total if self.total else 1.0",
  "complexity": "采集 O(请求数)，存储按聚合降采样",
  "beginnerSummary": "可观测性像给系统装了仪表盘+行车记录仪+GPS 轨迹：仪表盘(Metrics)看整体健康，行车记录仪(Logs)记详细事件，GPS(Traces)看一次请求走了哪些环节。SLO 是约定‘必须多可靠’，超了就报警；出了问题顺着轨迹快速找到是哪个环节堵了。",
  "explanationFocus": "是什么：系统可观测性是通过指标、日志、链路追踪三类信号，结合 SLO 与告警，使工程师能够在不发版的情况下回答系统‘为什么慢/为什么错’的能力体系。",
  "approach": "核心思路是‘三支柱采集 + SLO 驱动 + 关联定位’：统一埋点采集 Metrics/Logs/Traces 并关联 trace_id；定义 SLO 与错误预算触发告警；通过链路下钻与指标关联做根因定位，必要时结合拓扑做自动归因。",
  "derivation": [
    "为什么需要：多模态服务链路长、依赖多，黑盒运维无法快速定位与预防故障。",
    "怎么实现：标准化埋点、集中式采集与存储、trace 串联、SLO/错误预算、告警与仪表盘。",
    "有什么代价：采集与存储成本高、埋点侵入性、海量数据需降采样与保留策略。",
    "怎么评测：告警准确率与召回、MTTR、SLO 达标率、定位耗时。"
  ],
  "edgeCases": [
    "高基数标签(如 user_id)导致指标爆炸，需限制或裁剪。",
    "trace 采样率过低漏掉异常请求，需动态调采样。",
    "跨团队链路缺埋点，追踪断链难以定位。",
    "告警风暴淹没关键信号，需去重与收敛。"
  ],
  "pitfalls": [
    "只采集指标不做链路追踪，定位长尾延迟无从下手。",
    "SLO 设得脱离用户真实体验，告警无价值或误报频繁。"
  ],
  "prerequisites": [
    "Metrics/Logs/Traces 基础与 OpenTelemetry",
    "SLO、错误预算与告警理论"
  ],
  "workedExample": [
    "一次多模态推理慢，trace 显示耗时集中在视觉编码阶段，结合该阶段指标飙升定位为某个模型副本过载。",
    "可用率 SLO 99.9%，错误预算消耗过快自动触发告警并通知值班。"
  ],
  "lineByLine": [
    "@dataclass SLI 记录成功与总请求数，作为最基础的可用性指标载体。",
    "availability 属性计算成功率，用于判断是否触及 SLO 与错误预算阈值。"
  ],
  "followUps": [
    {
      "question": "如何降低可观测性的存储成本？",
      "answer": "对指标做长期降采样保留趋势，日志按级别与采样保留，trace 用自适应采样只保异常与长尾；冷数据归档到廉价存储。"
    },
    {
      "question": "告警太多怎么收敛？",
      "answer": "按服务与症状做告警分组与去重，用错误预算策略抑制低优告警，并结合拓扑做根因聚合只通知顶层原因。"
    }
  ],
  "followUpAnswers": [
    "对指标做长期降采样保留趋势，日志按级别与采样保留，trace 用自适应采样只保异常与长尾；冷数据归档到廉价存储。",
    "按服务与症状做告警分组与去重，用错误预算策略抑制低优告警，并结合拓扑做根因聚合只通知顶层原因。"
  ]
};
