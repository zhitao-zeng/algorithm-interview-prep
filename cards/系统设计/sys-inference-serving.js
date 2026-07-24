export default {
  "id": "sys-inference-serving",
  "kind": "concept",
  "category": "系统设计",
  "title": "在线推理服务架构",
  "difficulty": "Hard",
  "prompt": "如何设计高吞吐低延迟的在线模型推理服务架构？",
  "quickAnswer": "在线推理服务通过 dynamic batching 把并发请求聚合成批提升 GPU 利用率，配合多副本与智能路由、超时降级与队列管理来平衡吞吐与延迟。核心是让重模型在严格 SLA 内稳定服务。",
  "explanationFocus": "是什么：在线推理服务架构是把训练好的模型以低延迟、高吞吐方式对外提供预测能力的一整套系统，包含批处理、路由、扩缩容与降级机制。",
  "approach": "前置 dynamic batching 聚合请求；模型多副本部署并接负载均衡/一致性哈希路由；设超时与降级(返回兜底或缓存结果)；用队列背压防止雪崩，GPU 侧做算子融合与量化提升利用率。监控 P99 与 GPU 利用率闭环调优。",
  "code": "def dynamic_batch(req_queue, max_wait=10):\n    # 聚合请求成批，提升 GPU 利用率\n    batch = [req_queue.pop() for _ in range(max_wait) if req_queue]\n    return model.infer(batch)\n\ndef route(req, replicas):\n    # 一致性哈希路由到副本\n    return replicas[hash(req.user) % len(replicas)]",
  "complexity": "O(batch) 吞吐 / 单次 O(model)",
  "beginnerSummary": "模型上线后要同时服务很多用户。把一个一个请求单独算很浪费，于是把短时间内的请求攒成一批一起算(批处理)，再分配到多台机器上，卡时间超了就降级返回，保证又快又稳。",
  "derivation": [
    "为什么需要：单请求独立推理 GPU 利用率低且延迟高，需批处理与水平扩展才能扛住线上流量。",
    "怎么实现：dynamic batching 聚批、多副本+路由、超时降级、队列背压与算子优化。",
    "有什么代价：批处理增加尾延迟，副本增多抬升成本，降级会牺牲精度换可用性。",
    "怎么评测：P99 延迟、吞吐(QPS)、GPU 利用率、降级率与 SLA 达标率。"
  ],
  "edgeCases": [
    "长尾大 batch 撑爆显存，需上限保护与动态拆分。",
    "某副本故障，路由需快速摘除并切流。",
    "突发流量导致队列积压，需背压与限流防止雪崩。"
  ],
  "pitfalls": [
    "为提吞吐无限制攒批，反而把 P99 尾延迟拖爆。",
    "忽略预处理(解码/resize)耗时，瓶颈不在 GPU 而在 CPU 侧。"
  ],
  "prerequisites": [
    "GPU 推理与批处理基本原理",
    "负载均衡与一致性哈希",
    "服务降级与限流策略"
  ],
  "workedExample": [
    "场景：排序模型服务，目标 P99<30ms，峰值 2 万 QPS。",
    "dynamic batching 设 max_wait=5ms、batch≤64，GPU 利用率从 25% 提到 70%。",
    "副本扩到 8 个，超 30ms 的请求走缓存兜底，SLA 达标 99.9%。"
  ],
  "lineByLine": [
    "def dynamic_batch(...)：在 max_wait 时间窗口内从请求队列聚合成批，一次推理提升 GPU 利用率。",
    "def route(...)：按 user 一致性哈希把请求稳定路由到固定副本，兼顾负载均衡与缓存局部性。"
  ],
  "followUps": [
    {
      "question": "dynamic batching 会不会损害延迟？如何权衡？",
      "answer": "会，攒批增加等待时间。需设最大等待时间与最大 batch 上限，在吞吐与 P99 间做 Pareto 调优，通常取尾延迟可接受的最小窗口。"
    },
    {
      "question": "GPU 利用率低常见原因有哪些？",
      "answer": "请求未聚批、batch 太小、预处理在 CPU 成瓶颈、显存碎片或算子未融合；先定位瓶颈再针对性优化而非盲目加卡。"
    }
  ],
  "followUpAnswers": [
    "会，攒批增加等待时间。需设最大等待时间与最大 batch 上限，在吞吐与 P99 间做 Pareto 调优，通常取尾延迟可接受的最小窗口。",
    "请求未聚批、batch 太小、预处理在 CPU 成瓶颈、显存碎片或算子未融合；先定位瓶颈再针对性优化而非盲目加卡。"
  ]
};
