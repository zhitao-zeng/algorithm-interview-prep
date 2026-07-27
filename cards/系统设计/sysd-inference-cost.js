export default {
  "id": "sysd-inference-cost",
  "kind": "concept",
  "category": "系统设计",
  "title": "推理成本优化系统：算力预算、混部与 spot/抢占式调度",
  "difficulty": "Hard",
  "prompt": "在算力预算受限下，如何设计一套推理成本优化系统，结合混部、spot/抢占式资源调度来压降多模态模型的服务成本？",
  "quickAnswer": "成本优化系统在总算力预算约束下做组合优化：用混部把在线推理与离线训练批作业共享集群提升利用率；用 spot/抢占式实例承载可中断的离线或弹性推理以换低价；通过优先级队列、检查点与快速重调度保证 SLA。核心是把‘必须保 SLA 的流量’与‘可被抢占的负载’分层调度。",
  "code": "from typing import List\n\ndef schedule(jobs: List[dict], budget: float) -> List[str]:\n    # 保 SLA 任务优先，剩余预算给可被抢占的 spot 任务\n    guaranteed = [j['id'] for j in jobs if j['sla'] == 'must']\n    remaining = budget - sum(j['cost'] for j in jobs if j['id'] in guaranteed)\n    spot = [j['id'] for j in jobs if j['sla'] != 'must' and j['cost'] <= remaining]\n    return guaranteed + spot",
  "complexity": "O(n) 扫描作业",
  "beginnerSummary": "推理成本优化像安排用车：重要客人(保 SLA 的流量)必须预留专车；空车的拼车业务(可中断的离线任务)只在有空位、便宜的顺风车(spot)上跑，随时可能被赶下车但省钱。混部则是让上下班通勤和货运共用同一车队提高利用率。",
  "explanationFocus": "是什么：推理成本优化系统是在给定算力预算下，通过混部、spot/抢占式调度与优先级分层，把多模态推理与可中断负载合理编排以最小化单位服务成本的控制系统。",
  "approach": "核心思路是‘预算约束 + 分层调度 + 弹性容错’：区分保 SLA 与可抢占负载；混部共享集群提升利用率；spot 承载可中断任务换低价；用检查点与快速重调度在无预算时优雅降级。",
  "derivation": [
    "为什么需要：多模态模型推理算力开销大，预算刚性，需在不破 SLA 前提下压降成本。",
    "怎么实现：定义预算与优先级；混部在线/离线；spot 跑可中断负载；检查点+快速重调度容错。",
    "有什么代价：抢占导致作业重算开销、混部带来资源争抢与隔离复杂度、spot 不可控回收风险。",
    "怎么评测：单位请求成本、集群利用率、spot 抢占率与重算率、SLA 达标率。"
  ],
  "edgeCases": [
    "spot 实例被云厂商回收，正在推理的请求需快速迁移或重试。",
    "混部时离线作业 CPU 抖动拖垮在线推理延迟。",
    "预算突降需立即驱逐低优任务，避免挤占保 SLA 资源。",
    "保 SLA 流量突发超出预留容量，需弹性扩容或降级。"
  ],
  "pitfalls": [
    "把保 SLA 的在线推理也放到可被抢占的 spot 上，导致服务中断。",
    "混部未做资源隔离(CPU/显存)，互相干扰引发长尾延迟。"
  ],
  "prerequisites": [
    "云资源调度与 spot 实例机制",
    "混部隔离技术(cgroup/MIG)与优先级队列"
  ],
  "workedExample": [
    "白天高峰保 SLA 推理独占预留 GPU，夜间低谷把闲置 GPU 用于 spot 训练与批量embedding。",
    "可中断的特征回填任务跑在 spot 上，被回收时从上次检查点续跑。"
  ],
  "lineByLine": [
    "def schedule 先筛选保 SLA 的必须任务并计入预算占用。",
    "剩余预算内挑选可被抢占的 spot 任务，返回保 SLA 优先、spot 次之的调度结果。"
  ],
  "followUps": [
    {
      "question": "spot 被回收时如何保证不丢进度？",
      "answer": "对可中断作业周期性做检查点，回收前云厂商通常有短暂终止信号，捕获后持久化状态并从检查点续跑；在线推理则提前冗余副本热迁移。"
    },
    {
      "question": "混部如何防止离线拖垮在线？",
      "answer": "用 cgroup/MIG 做硬隔离，在线优先级最高并保留带宽；离线在空闲时调度，监控在线 P99 超阈即压制离线。"
    }
  ],
  "followUpAnswers": [
    "对可中断作业周期性做检查点，回收前云厂商通常有短暂终止信号，捕获后持久化状态并从检查点续跑；在线推理则提前冗余副本热迁移。",
    "用 cgroup/MIG 做硬隔离，在线优先级最高并保留带宽；离线在空闲时调度，监控在线 P99 超阈即压制离线。"
  ]
};
