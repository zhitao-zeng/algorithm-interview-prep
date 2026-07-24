export default {
  "kind": "concept",
  "id": "cb-load-balance",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "请求长短不一的负载均衡",
  "prompt": "请求长短不一时，Continuous Batching 怎么做负载均衡？",
  "quickAnswer": "连续批通过\"完成即释放、空位即补\"天然做了时间维的负载均衡：短请求快速让出 slot 给新请求，长请求独占少量 slot 不被拖累整体。再辅以 chunked prefill、优先级与 KV 感知调度，可进一步平滑长短混合带来的波动，使 GPU 在稳态接近满载且不饿死长请求。",
  "approach": "靠逐步换入换出做自适应均衡，必要时加 chunked prefill 削峰。",
  "explanationFocus": "是什么：负载均衡在这里指让长短请求混合时 GPU slot 始终被高效利用、且各类请求都不被无限拖尾的调度目标。",
  "bruteForce": "静态批把长短随机凑一组，短请求陪跑、组间负载忽高忽低。",
  "derivation": [
    "为什么需要：长短混合若调度不当，长请求占满 slot 阻塞短请求，或短请求洪流淹没长请求，都偏离高效公平。",
    "怎么实现：连续批每步释放短请求腾 slot；对长 prefill 用 chunked prefill 拆小避免阻塞 decode；结合优先级/老化保证公平。",
    "有什么代价：chunked prefill 增加 prefill 步数；公平策略需权衡吞吐与尾延迟。",
    "怎么评测：看各长度分位的延迟是否都合理、GPU 利用率是否平稳、有无长请求饿死。"
  ],
  "invariant": "任意长度请求都不会因其他请求而无限延迟；slot 利用率在稳态贴近上限。",
  "walkthrough": "长请求 L 占 1 slot 跑 1000 步，期间短请求洪流 S1..S200 各占 slot 跑 10 步即释放，GPU 始终满载且 S 系列低延迟。",
  "edgeCases": [
    "长请求独占导致短请求排队：需 chunked prefill + 并发 prefill。",
    "短请求风暴：瞬时占满，长请求饥饿 → 用老化。",
    "全部超长：退化为低并发，需提显存上限。"
  ],
  "code": "# Python\ndef admit(running, waiting, capacity, aging):\n    # 老化: 等待越久优先级越高\n    waiting.sort(key=lambda r: r.wait_time * aging - r.prio)\n    return fill(running, waiting, capacity)",
  "codeNotes": [
    "老化防长请求被短风暴饿死。",
    "chunked prefill 削 prefill 尖峰。"
  ],
  "complexity": "均衡策略轻量；核心收益来自逐步换入换出本身。",
  "followUps": [
    {
      "question": "chunked prefill 是什么？",
      "answer": "把长 prompt 的 prefill 拆成多个 chunk 穿插在 decode 步中，避免一次长 prefill 阻塞整个 batch 的 decode。"
    },
    {
      "question": "长请求会不会拖垮整体？",
      "answer": "不会，它只占自己那一个 slot 持续 decode，其他 slot 仍服务短请求，整体不被单点拖死。"
    }
  ],
  "followUpAnswers": [
    "prefill 拆块穿插, 不阻塞 decode。",
    "长请求仅占1 slot, 不拖整体。"
  ],
  "pitfalls": [
    "以为长请求会\"霸占\"整批——其实只占一个 slot。",
    "忽略短风暴导致长请求饿死。"
  ],
  "beginnerSummary": "长短顾客混排餐厅：大桌(长请求)慢慢吃只占一张桌，小桌(短请求)吃完立刻翻台接新客。调度员还会给等太久的大桌优先，避免它一直排不上。这样既满座又公平。",
  "prerequisites": [
    "长请求只占单 slot。",
    "短请求释放快。",
    "公平需防饿死。"
  ],
  "workedExample": [
    "L 占1 slot 跑1000步。",
    "期间 S1..S200 各跑10步即释放, GPU 满载。"
  ],
  "lineByLine": [
    "长请求只占其单 slot 持续 decode。",
    "短请求完成立即释放腾位。",
    "新请求补入保持满载。",
    "老化/优先级防饿死。"
  ],
  "diagram": "slot: [L][S1][S2][S3] → S完成 → [L][S4][S5][S6]"
};
