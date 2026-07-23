export default {
  "kind": "concept",
  "id": "cb-preemption",
  "category": "Continuous Batching",
  "difficulty": "Hard",
  "title": "请求优先级与抢占",
  "prompt": "Continuous Batching 里如何处理请求优先级与抢占(preemption)？",
  "quickAnswer": "当显存/并发到达上限且高优先级请求到来、或 KV 池枯竭时，需抢占低优先级请求：要么把它已生成的 KV 换出到 CPU(offload)待恢复，要么直接丢弃重算(swap vs recompute)。调度器按优先级与占用排序选 victim，保证重要请求低延迟，同时尽量不饿死低优先级。",
  "approach": "定义优先级 + 准入控制，KV 不足时按策略换出/重算被抢占者。",
  "explanationFocus": "是什么：抢占是在资源紧张时，暂停或驱逐低优先级请求以腾出 slot/KV 给更高优先级请求的机制，分为 swap-to-CPU 与 recompute 两类。",
  "bruteForce": "无抢占：严格 FIFO，高优先级也得排队，长请求占着 KV 不走。",
  "derivation": [
    "为什么需要：纯 FIFO 下重要请求可能被一堆长尾拖死；且 KV 池在峰值会枯竭，必须有取舍策略而非直接拒绝。",
    "怎么实现：给请求打优先级；准入时若资源不足，选出优先级最低且 KV 占用高的 victim；swap 将其 KV 移到 CPU 内存，recompute 则丢弃待重算。",
    "有什么代价：swap 增加 CPU-GPU 传输与恢复延迟；recompute 浪费已算算力；都要额外状态管理。",
    "怎么评测：看高优先级 P99 是否达标、低优先级是否被饿死、抢占带来的额外开销占比。"
  ],
  "invariant": "高优先级请求不应因低优先级长尾而显著劣化；被抢占者最终仍会完成。",
  "walkthrough": "池满，新到 P0 请求；当前有 P2 长请求占 20 页 → 选它 victim，swap 到 CPU；P0 运行；P2 后续重新调回继续生成。",
  "edgeCases": [
    "全部同优先级：按占用/等待时间选 victim，避免饿死。",
    "频繁抢占抖动：需退避，防止同一请求反复换入换出。",
    "CPU 内存也满：只能 recompute 或拒绝。"
  ],
  "code": "# Python\ndef pick_victim(running, incoming):\n    if incoming.prio <= min(r.prio for r in running):\n        return None  # 不抢占\n    victims = [r for r in running if r.prio > incoming.prio]\n    return max(victims, key=lambda r: r.kv_used)  # 占最多 KV 的低优者",
  "codeNotes": [
    "victim 选\"低优先级且占 KV 多\"者。",
    "swap 保结果, recompute 保显存。"
  ],
  "complexity": "抢占决策 O(并发)；代价是 swap/recompute 的额外延迟与带宽。",
  "followUps": [
    {
      "question": "swap 和 recompute 怎么选？",
      "answer": "KV 小且 CPU 带宽足选 swap；KV 大或 CPU 内存紧选 recompute，按恢复成本估算。"
    },
    {
      "question": "如何避免低优先级饿死？",
      "answer": "给等待时间加权优先级，或设老化(aging)机制，等待越久优先级越高。"
    }
  ],
  "followUpAnswers": [
    "按恢复成本在 swap/recompute 间选。",
    "aging 机制防饿死。"
  ],
  "pitfalls": [
    "抢占只考虑优先级忽略 KV 占用，换出不划算。",
    "频繁抢占导致同一请求反复换入换出抖动。"
  ],
  "beginnerSummary": "急诊室：普通病患正在占床，危急病人 arriving，医生让占用多床位且病情轻的先临时挪到走廊(换出)，救完再挪回。抢占就是\"让重要的人先用资源\"，但别把同一个人反复踢来踢去。",
  "prerequisites": [
    "KV 池会枯竭。",
    "请求有优先级语义。",
    "CPU 内存可作缓冲。"
  ],
  "workedExample": [
    "池满，P0 请求到达。",
    "选占 20 页的 P2 victim，swap 到 CPU。"
  ],
  "lineByLine": [
    "比较到来请求与运行中优先级。",
    "筛选可被抢占的低优者。",
    "按 KV 占用选 victim。",
    "swap 或 recompute 腾出资源。"
  ],
  "diagram": "运行中[P0?] 池满 → 选低优高KV victim\n→ swap 到 CPU → 高优运行 → 恢复 victim"
};
