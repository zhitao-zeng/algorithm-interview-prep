export default {
  "id": "ir-disagg",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "Prefill/Decode 分离",
  "prompt": "Prefill 与 Decode 阶段分离的推理架构（disaggregated serving）解决了什么瓶颈，如何部署？",
  "quickAnswer": "自回归推理分两阶段：Prefill 处理整段提示（算力密集、可并行、大 batch）与 Decode 逐 token 生成（带宽密集、串行、小 batch）。二者资源画像不同，混布会互相拖累。分离架构把两阶段放到不同 GPU 池：Prefill 池吃满算力快速产出首 token 与 KV，再把 KV 通过高速互联搬给 Decode 池逐字生成。可分别扩缩容、用不同并行策略，整体吞吐与延迟更优，代价是 KV 传输与调度复杂度。",
  "approach": "拆成 Prefill 实例与 Decode 实例两池；Prefill 完成后把 KV Cache 经 NVLink/RDMA 传给 Decode 池；用全局调度器做请求路由与 KV 交接，避免两阶段抢资源。",
  "explanationFocus": "是什么：Prefill/Decode 分离是把 LLM 推理的\"提示预处理（prefill，算力密集可并行）\"与\"逐 token 生成（decode，带宽密集串行）\"部署在独立 GPU 资源池的架构，使各阶段按自身画像独立优化与扩缩。",
  "bruteForce": "朴素混布让同一批 GPU 既做 prefill 又做 decode，prefill 的大 batch 矩阵乘与 decode 的小 batch 高带宽访问争抢，导致 decode 被拖慢、prefill 显存碎片化，整体利用率低。",
  "invariant": "核心不变量：同一请求在 Prefill 与 Decode 间交接时，KV Cache 必须逐层、逐位置精确一致地迁移，且位置偏移正确衔接，保证生成结果等价于单机串行推理。",
  "walkthrough": "设提示 2k token、生成 500 token；混布时 prefill 占住 GPU 使 decode 排队，P99 延迟高。分离后 Prefill 池 2 卡于 ~120ms 算完 KV 并传至 Decode 池 8 卡，decode 专注生成；整体 GPU 利用率从 55% 升到 85%，首 token 与尾 token 延迟双降。",
  "code": "def schedule(req, prefill_pool, decode_pool, transport):\n    kv = prefill_pool.run_prefill(req.prompt)   # 算力密集并行\n    transport.send(kv, decode_pool)             # 高速传 KV\n    for _ in range(req.max_tokens):\n        tok = decode_pool.step(kv)              # 带宽密集串行\n        kv.append(tok)\n        yield tok",
  "complexity": "Prefill 为 O(提示长²) 一次，Decode 为 O(已生成长) 逐步；额外成本来自 KV 跨池传输 O(层数×提示长×隐藏维)，需 NVLink/RDMA 摊薄。",
  "beginnerSummary": "像工厂把\"写初稿\"（prefill，多人并行赶工）和\"逐字朗读校对\"（decode，一人串读）分给两条生产线，互不挡道，整体更快。",
  "diagram": "[提示]──► Prefill池(算力密)──KV──► Decode池(带宽密)\n                              │           │\n                           NVLink/RDMA   逐token输出",
  "derivation": [
    "为什么需要：prefill 与 decode 资源画像相反，混布互相争抢导致双低。",
    "怎么实现：拆两池，prefill 产出 KV 后经高速互联传给 decode，调度器管路由与交接。",
    "有什么代价：KV 跨池传输有带宽/延迟开销；需保证 KV 一致与位置衔接；系统复杂度与故障域增大。",
    "怎么评测：对比分离前后 GPU 利用率、TTFT 与 TPOT（每 token 延迟），及跨池传输占比。"
  ],
  "edgeCases": [
    "超长提示使 KV 传输成为瓶颈，需 RDMA/NVLink 或分层流水。",
    "decode 池负载不均导致部分卡空闲，需细粒度调度。",
    "请求被截断/早停，KV 交接需支持部分迁移与回收。"
  ],
  "pitfalls": [
    "忽视 KV 传输带宽，分离后反而被搬运拖慢。",
    "两池并行策略相同，没针对各自画像优化（如 prefill 用 TP、decode 用 PP）。"
  ],
  "prerequisites": [
    "Transformer 的 prefill 与 decode 阶段差异",
    "KV Cache 与 GPU 互联（NVLink/RDMA）带宽概念"
  ],
  "workedExample": [
    "Prefill 池 4 卡用张量并行快速算 2k 提示 KV，约 120ms 完成，经 NVLink 传给 Decode 池 8 卡。",
    "Decode 池专注逐 token，无 prefill 干扰，TPOT 从 18ms 降到 11ms，整池利用率 85%。"
  ],
  "lineByLine": [
    "prefill_pool.run_prefill(req.prompt) 在算力池并行处理整段提示得 KV。",
    "transport.send(kv, decode_pool) 通过高速互联把 KV 搬到 decode 池。",
    "decode_pool.step(kv) 在带宽池逐 token 自回归生成。",
    "kv.append(tok) 把新 token 的 KV 续接，保证位置连续。"
  ],
  "codeNotes": [
    "传输需保证层序与 dtype 一致，且 decode 端按全局位置偏移拼接。"
  ],
  "followUps": [
    {
      "question": "分离架构最大的工程难点？",
      "answer": "是 KV Cache 在池间的高效、一致传输与调度，既要低延迟搬运又要精确衔接位置，否则既慢又错；其次是两池独立扩缩容的负载均衡。"
    },
    {
      "question": "什么情况不适合分离？",
      "answer": "短提示短生成、单卡即可跑满时，分离带来的传输与调度开销反而抵消收益，混布更简更优。"
    }
  ],
  "followUpAnswers": [
    "是 KV Cache 在池间的高效、一致传输与调度，既要低延迟搬运又要精确衔接位置，否则既慢又错；其次是两池独立扩缩容的负载均衡。",
    "短提示短生成、单卡即可跑满时，分离带来的传输与调度开销反而抵消收益，混布更简更优。"
  ],
  "kind": "concept"
};
