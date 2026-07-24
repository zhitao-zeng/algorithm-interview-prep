export default {
  "kind": "concept",
  "id": "pa-continuous-batching",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "与 Continuous Batching 协同",
  "prompt": "PagedAttention 如何与 Continuous Batching 协同工作？",
  "quickAnswer": "Continuous Batching 在 token 粒度动态把就绪请求塞进同一个 batch，不再等整批等长。这要求各请求的 KV 长度、占用各不相同且可随时增长——传统连续分配很难高效支持。PagedAttention 的分块、非连续、按需分配 KV 恰好匹配：每个请求独立占自己的 block，新请求/新 token 即时插入，GPU 利用率大幅提升。",
  "approach": "分块 KV 天然支持变长、动态增长，是 Continuous Batching 的底座。",
  "explanationFocus": "是什么：PagedAttention 的变长非连续 KV 让 Continuous Batching 能在 token 级动态组批，提升 GPU 利用率。",
  "bruteForce": "静态 batching：等整批最慢请求结束才换新请求，GPU 常空转。",
  "derivation": [
    "为什么需要：请求长短不一，静态组批浪费算力；需要 token 级调度。",
    "怎么实现：调度器每步把有空闲 slot 的请求加入 batch；PagedAttention 各自分页 KV，互不干扰。",
    "有什么代价：调度更复杂，需配合分页分配器实时 append 块。",
    "怎么评测：对比静态/连续 batching 的 GPU 利用率、吞吐与排队延迟。"
  ],
  "invariant": "同一 batch 内各请求的 KV 长度可不同；每个请求按需 append 自己的 block，互不影响。",
  "walkthrough": "batch 中 A 已生成 100 token、B 刚来 1 token：A 占 7 个 block、B 占 1 个，二者分页 KV 各管各的，一步同时算 A 的第101 token 与 B 的第2 token。",
  "edgeCases": [
    "某请求先结束：其 block 立即释放供他人，无需等整批。",
    "新请求随时加入：分配自己的 block，不动他人。",
    "长度差异极大：分页让短请求不拖累长请求的对齐浪费。"
  ],
  "code": "# Python\ndef continuous_batching(scheduler, waiting, running, gpu_slots):\n    while gpu_slots.free() > 0 and waiting:\n        r = waiting.pop()                 # 新请求随时加入\n        running.add(r)                    # 各自分页KV, 独立block\n    return step_all(running)              # 一步算所有就绪token",
  "codeNotes": [
    "token 级调度而非序列级。",
    "分页 KV 让变长共存无对齐浪费。"
  ],
  "complexity": "调度 O(每步进出请求数)；算力利用更饱满，等效吞吐提升。",
  "followUps": [
    {
      "question": "没有 PagedAttention 能做 Continuous Batching 吗？",
      "answer": "能但低效：连续分配下变长请求要么对齐到最长（浪费），要么频繁重分配（开销大）；分页让变长共存几乎零额外成本，所以二者常配套出现。"
    },
    {
      "question": "Continuous Batching 提升的是哪类指标？",
      "answer": "主要提升 GPU 利用率与吞吐（tokens/s），并降低平均排队延迟，因为它消除了\"等最慢请求\"的空转。"
    }
  ],
  "followUpAnswers": [
    "分页是连续批处理的显存底座。",
    "收益在利用率与吞吐。"
  ],
  "pitfalls": [
    "以为 Continuous Batching 只靠调度、与 KV 布局无关。",
    "混淆\"连续批处理\"与\"连续显存分配\"。"
  ],
  "beginnerSummary": "餐厅翻台：传统做法是整桌人吃完才换下一桌，哪怕有人早吃完了也得干等——桌子空着。Continuous Batching 像\"谁点好菜谁就上灶\"，而 PagedAttention 让每桌的餐具（KV）独立摆放、随时加减，新客人一来就有自己的位置，灶台（GPU）几乎不闲着。",
  "prerequisites": [
    "请求长度差异大、到达时间不一。",
    "静态组批会空转等待。",
    "KV 需支持变长动态增长。"
  ],
  "workedExample": [
    "A 100 token、B 刚来：同 batch 各占 7/1 个 block 同算。",
    "A 结束立即释放 block 给新请求。"
  ],
  "lineByLine": [
    "调度器按需加入/移出请求。",
    "每请求独立分页 KV。",
    "同一步算所有就绪 token。",
    "结束即释放 block 复用。"
  ],
  "diagram": "static: [A A A A | 等最慢 | 空转]\nconti.: [A101][B2][C7][新D] 同一步并行\n       各占各自block, GPU不空转"
};
