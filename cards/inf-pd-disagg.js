export default {
  "kind": "concept",
  "id": "inf-pd-disagg",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "什么是 Prefill-Decode Disaggregation（PD 分离）？为什么不一定提升吞吐？",
  "prompt": "什么是 Prefill-Decode Disaggregation（PD 分离）？为什么它不一定提升吞吐？",
  "quickAnswer": "PD 分离把 Prefill 阶段和 Decode 阶段部署到不同的 GPU 池/节点：Prefill 节点（算力密集）算完首 token 并把 KV Cache 传给 Decode 节点（带宽密集）继续自回归。它主要用来分别优化 TTFT 和 ITL、减少 Prefill 对 Decode 尾延迟的干扰；但“提升吞吐”不是必然——KV 跨节点传输有开销，且若两阶段负载不均，一方空闲一方排队，整体吞吐可能不增甚至下降。",
  "approach": "按阶段算力特征（Prefill=compute-bound, Decode=memory-bound）拆分硬件资源，KV Cache 通过网络在阶段间传递。",
  "explanationFocus": "是什么：PD 分离是部署拓扑选择，目标是解耦 TTFT 与 ITL 的优化；它不等于“吞吐必然提升”。",
  "bruteForce": "Prefill 与 Decode 混在同一 GPU，长 Prefill 阻塞 Decode（即不分离）。",
  "derivation": [
    "为什么需要：Prefill 算力密集、Decode 带宽密集，混布时二者互相抢资源，长 Prefill 抬高 Decode 尾延迟。",
    "怎么实现：Prefill 实例算完并生成 KV Cache，通过网络（如 NVLink/IB/RDMA）把 KV 传给 Decode 实例；Decode 实例从已有 KV 继续生成。",
    "为什么不一定提吞吐：KV 传输本身耗时，若传输比本地重算还慢或带宽受限，反而亏；且两池负载需匹配，否则一方空转。",
    "怎么评测：分别看 TTFT、TPOT/ITL 的 P99，再综合吞吐与成本；某些配置下吞吐持平甚至下降。"
  ],
  "invariant": "PD 分离改的是“阶段到硬件的映射与 KV 流动路径”，吞吐是否提升取决于传输开销与两阶段负载匹配，而非架构本身保证。",
  "walkthrough": "一个请求：Prefill 节点读题产出 KV（算力密集），KV 经网络送到 Decode 节点；Decode 节点逐 token 生成（带宽密集）。若 KV 传输耗时 t_kv 且 Decode 节点空闲，则 TTFT 主要由 Prefill+传输决定。",
  "edgeCases": [
    "短 Prompt 场景：Prefill 本就很短，分离带来的 KV 传输开销可能抵消收益。",
    "KV 传输带宽不足：传输比本地继续算还慢，整体变慢。",
    "两阶段负载不均：Prefill 池空转而 Decode 池排队（或反之），资源利用率下降。"
  ],
  "code": "# Python\ndef pd_disagg(prompt_len, gen_len, prefill_tput, decode_tput, kv_transfer_t):\n    # 简化估算: 分离后 TTFT 与 Decode 解耦, 但多一笔 KV 传输\n    ttft = prompt_len / prefill_tput + kv_transfer_t\n    tpot = 1.0 / decode_tput\n    return {'ttft': ttft, 'tpot': tpot}\n    # 吞吐是否提升取决于 kv_transfer_t 与两池负载是否匹配",
  "codeNotes": [
    "这是延迟估算示意, 真实吞吐还受 batch、显存、网络拓扑影响。",
    "vLLM 文档明确提示其 PD 分离实现不保证提高吞吐。"
  ],
  "complexity": "Prefill 阶段 O(n²·d)，Decode 阶段每步 O(模型参数/带宽)；额外引入 O(KV 体积) 的跨节点传输成本。",
  "followUps": [
    {
      "question": "Prefill 为什么偏 Compute Bound？",
      "answer": "Prefill 对 prompt 所有位置做全注意力，矩阵乘规模随序列长度平方增长，算力吃满。"
    },
    {
      "question": "Decode 为什么偏 Memory Bound？",
      "answer": "Decode 每步只算 1 个 token，但要把全部权重与 KV 读进计算单元，受显存带宽限制。"
    },
    {
      "question": "为什么用不同 GPU 池？",
      "answer": "两类阶段瓶颈不同，分开部署可针对性配卡（Prefill 重算力、Decode 重带宽/显存），并避免互相干扰尾延迟。"
    },
    {
      "question": "KV Cache 如何从 Prefill 节点传给 Decode 节点？",
      "answer": "Prefill 算完各层 K/V 后，通过网络（NVLink/InfiniBand/RDMA）按层或按块传到 Decode 节点并写入其 KV 缓冲。"
    },
    {
      "question": "KV 传输会不会比计算还慢？",
      "answer": "可能。若网络带宽不足或 KV 很大，传输耗时超过本地继续算的代价，分离反而拖累；这也是它不一定提吞吐的原因。"
    },
    {
      "question": "什么场景不适合 PD 分离？",
      "answer": "短 Prompt、对延迟极敏感且 KV 传输开销占比高、或两阶段负载难以匹配的场景，分离收益有限甚至为负。"
    }
  ],
  "followUpAnswers": [
    "Prefill 算力密集(全注意力)。",
    "Decode 带宽密集(读权重)。",
    "按瓶颈分别配卡、解耦尾延迟。",
    "KV 经网络分层传到 Decode 节点。",
    "传输可能比本地算还慢。",
    "短 Prompt/难匹配负载时不适合。"
  ],
  "pitfalls": [
    "把 PD 分离等同于“吞吐必然提升”（错：取决于传输与负载匹配）。",
    "忽视 KV 跨节点传输成本。",
    "以为分离后两阶段资源可随意独立扩缩（需匹配负载）。"
  ],
  "beginnerSummary": "大模型干活分两步：先“读题”（Prefill，很费算力），再“写答案”（Decode，很费显存带宽）。把它们塞在同一张卡上，读题时会卡住写答案。PD 分离的思路是把这两步放到不同的卡组：读题组专心读题，写答案组专心写字，读完后把“笔记”（KV Cache）通过网络传给写答案组。好处是两边互不干扰、尾延迟更稳；但“笔记”搬家也要时间，如果网络慢或两边忙闲不均，整体速度不一定更快——它主要优化的是延迟体验，不是必然提吞吐。",
  "prerequisites": [
    "Prefill 算力密集、Decode 带宽密集。",
    "KV Cache 是注意力中间结果, 可在阶段间传递。",
    "网络传输有带宽与延迟成本。"
  ],
  "workedExample": [
    "长 Prompt: Prefill 节点算 KV(算力密集) → 网络传 KV → Decode 节点续写(带宽密集)。",
    "短 Prompt + 慢网络: KV 传输开销占比高, 分离收益为负。"
  ],
  "lineByLine": [
    "Prefill 节点算完并产出 KV。",
    "KV 经网络传到 Decode 节点。",
    "Decode 节点从已有 KV 续生成。",
    "两阶段瓶颈不同, 分开优化。",
    "吞吐是否提升看传输与负载匹配。"
  ],
  "diagram": "PD Disaggregation:\n[Prefill GPU池](算力密集)\n    | 算 KV\n    | 网络传输 KV\n    v\n[Decode GPU池](带宽密集)\n    | 续自回归\n    v\n输出\n目标: 解耦 TTFT 与 ITL; 吞吐非必然提升"
};
