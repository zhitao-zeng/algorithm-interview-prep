export default {
  "kind": "concept",
  "id": "inf-pd-disagg",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "什么是 Prefill-Decode Disaggregation（PD 分离）？为什么不一定提升吞吐？",
  "prompt": "什么是 Prefill-Decode Disaggregation（PD 分离）？为什么它不一定提升吞吐？",
  "quickAnswer": "PD 分离把 Prefill 阶段和 Decode 阶段部署到不同的 GPU 池/节点：Prefill 节点（算力密集）算完首 token 并把 KV Cache 经网络（NVLink/IB/RDMA）传给 Decode 节点（带宽密集）继续自回归。它主要用来分别优化 TTFT 和 ITL、减少长 Prefill 对 Decode 尾延迟的干扰。但\"提升吞吐\"不是必然——KV 跨节点传输有开销（体积正比于层数×序列长×隐藏维），若传输比本地重算还慢或带宽受限，反而亏；且若两阶段负载不均（一方空闲一方排队），整体吞吐可能不增甚至下降。因此 PD 分离首要优化的是延迟体验与尾延迟稳定性，而非无条件吞吐。",
  "approach": "按阶段算力特征拆分硬件：Prefill 池算力密集（重算力卡）、Decode 池带宽/显存密集（重带宽卡）；KV Cache 通过网络在阶段间传递（传输层 NVLink/InfiniBand/RDMA），实现 TTFT 与 ITL 的独立优化。",
  "explanationFocus": "是什么：Prefill-Decode Disaggregation（PD 分离）是一种部署拓扑选择，把 Prefill 阶段与 Decode 阶段分别部署到不同的 GPU 池/节点：Prefill 节点（算力密集）算完首 token 并把 KV Cache 传给 Decode 节点（带宽密集）继续自回归生成。它的目标是分别优化 TTFT 与 ITL、减少 Prefill 对 Decode 尾延迟的干扰；但它\"不等于吞吐必然提升\"——KV 跨节点传输有开销，且两阶段负载需匹配，否则一方空转、整体吞吐可能不增甚至下降。",
  "bruteForce": "Prefill 与 Decode 混在同一 GPU，长 Prefill 在一个 step 占满算力、阻塞同批 Decode（即不分离）；优点是零 KV 传输开销，缺点是长 Prompt 直接抬高 Decode 尾延迟、TTFT 与 ITL 互相耦合无法独立优化，长尾请求会拖累整池。",
  "derivation": [
    "为什么需要：Prefill 算力密集（对 prompt 全序列做注意力，O(n²·d)），Decode 带宽密集（每步只算 1 token 但要搬全部权重/KV）；二者混布时互相抢资源，长 Prefill 在一个 step 占满 GPU，直接抬高同批 Decode 的 ITL 尾延迟，且 TTFT 与 ITL 被耦合无法分别优化。",
    "怎么实现：Prefill 实例算完各层注意力并生成 KV Cache，通过网络（NVLink 同机 / InfiniBand·RDMA 跨机）把 KV 按层或按块传到 Decode 实例；Decode 实例从已有 KV 继续自回归生成，无需重算 Prefill。两池可针对性配卡（Prefill 重算力、Decode 重带宽/显存）。",
    "为什么不一定提吞吐：KV 传输本身耗时 t_kv，且体积 = 层数×序列长×隐藏维×2(K/V)，若网络带宽受限使 t_kv 超过\"本地直接继续算\"的代价，分离反而亏；更关键的是两池负载需匹配——若 Prefill 池空转而 Decode 池排队（或反之），资源利用率下降，整体吞吐不增甚至下降。",
    "怎么评测：分别看 TTFT（首 token 延迟）、TPOT/ITL 的 P99（尾延迟稳定性），再综合吞吐（token/s）与成本（GPU·小时）；某些配置下吞吐持平甚至下降，但尾延迟明显更稳——要按业务目标（重延迟还是重吞吐）取舍，不要默认分离更优。"
  ],
  "invariant": "PD 分离改的是\"阶段到硬件的映射与 KV 的流动路径\"，吞吐是否提升取决于传输开销（KV 体积/网络带宽）与两阶段负载匹配度，而非架构本身保证——因此\"分离\"不等于\"更快\"，评估必须实测。",
  "walkthrough": "一个请求：Prefill 节点读题产出 KV（算力密集，O(n²·d) 注意力），KV 经网络送到 Decode 节点；Decode 节点逐 token 生成（每步 O(模型参数/带宽)，带宽密集）。设 prompt_len=2000、gen_len=500、prefill_tput=1e6 token/s、decode_tput=50 token/s、kv_transfer_t=80ms：TTFT≈2000/1e6+0.08=0.082s；若 Decode 节点在传输期间空闲等待，则 TTFT 主要由 Prefill+传输决定，ITL 由 Decode 池独立保障、不被长 Prefill 尖峰干扰。若网络带宽不足使 kv_transfer_t 升到 300ms，则 TTFT 明显变长——体现\"传输可能反成瓶颈\"。",
  "edgeCases": [
    "短 Prompt 场景：Prefill 本就很短（如 128 token），分离带来的 KV 传输开销（固定延迟 + 体积虽小但有 RTT）可能抵消收益，甚至 TTFT 更差。",
    "KV 传输带宽不足：当序列很长或隐藏维很大，KV 体积可观，若网络带宽受限使传输比本地继续算还慢，整体变慢——这是它\"不一定提吞吐\"的核心原因。",
    "两阶段负载不均：Prefill 池空转而 Decode 池排队（或反之），资源利用率下降，分离后吞吐可能低于混布。",
    "多轮对话复用 KV：若同一 session 的 KV 已在 Decode 端，新一轮 Prefill 仍可分离，但要处理好 KV 的拼接与版本，避免错位。"
  ],
  "code": "# Python\ndef pd_disagg(prompt_len, gen_len, prefill_tput, decode_tput, kv_transfer_t):\n    # 简化估算: 分离后 TTFT 与 Decode 解耦, 但多一笔 KV 传输\n    ttft = prompt_len / prefill_tput + kv_transfer_t\n    tpot = 1.0 / decode_tput\n    return {'ttft': ttft, 'tpot': tpot}\n    # 吞吐是否提升取决于 kv_transfer_t 与两池负载是否匹配",
  "codeNotes": [
    "这是延迟估算示意，真实吞吐还受 batch 大小、显存容量、网络拓扑（NVLink vs IB）、KV 分块策略影响。",
    "vLLM 文档明确提示其 PD 分离实现不保证提高吞吐——务必按自己负载实测 TTFT/ITL/吞吐三角权衡，再决定是否分离。",
    "kv_transfer_t 与网络拓扑强相关：同机 NVLink 可忽略，跨机 RDMA 需计入，跨数据中心更甚。"
  ],
  "complexity": "Prefill 阶段 O(n²·d)（n=prompt 长、d=隐藏维），Decode 阶段每步 O(模型参数/带宽)；额外引入 O(KV 体积) 的跨节点传输成本，KV 体积 = 层数×n×d×2（K/V）×精度字节数。当 n 大、层数多时传输开销显著；若网络带宽 B，则 t_kv≈KV体积/B。吞吐是否提升取决于 t_kv 是否小于\"混布时 Decode 被阻塞的等待\"，以及两池负载是否匹配——这是一个实测题而非架构必然。",
  "followUps": [
    {
      "question": "Prefill 为什么偏 Compute Bound？",
      "answer": "Prefill 对 prompt 所有位置做全注意力，QK^T 与 PV 的矩阵乘规模随序列长度 n 平方增长（O(n²·d)），算力很快吃满，受限于 GPU 算力而非带宽，所以 compute-bound。"
    },
    {
      "question": "Decode 为什么偏 Memory Bound？",
      "answer": "Decode 每步只算 1 个 token，但要把全部模型权重与已累积的 KV Cache 从显存读进计算单元，受显存带宽限制；计算量小、搬运量大，所以 memory-bound。"
    },
    {
      "question": "为什么用不同 GPU 池？",
      "answer": "两类阶段瓶颈不同（算力 vs 带宽），分开部署可针对性配卡（Prefill 用高算力卡、Decode 用高带宽/大显存卡），并避免互相干扰尾延迟，从而分别优化 TTFT 与 ITL。"
    },
    {
      "question": "KV Cache 如何从 Prefill 节点传给 Decode 节点？",
      "answer": "Prefill 算完各层 K/V 后，通过网络（NVLink 同机 / InfiniBand·RDMA 跨机）按层或按块传到 Decode 节点，并写入其 KV 缓冲；传输单位通常是\"层块\"或\"token 块\"以减少延迟。"
    },
    {
      "question": "KV 传输会不会比计算还慢？",
      "answer": "可能。若网络带宽不足或 KV 体积很大（长序列、深模型），传输耗时 t_kv 超过本地继续算的代价，分离反而拖累——这也是 PD 分离不一定提吞吐的原因。"
    },
    {
      "question": "什么场景不适合 PD 分离？",
      "answer": "短 Prompt（Prefill 本就短、传输开销占比高）、对延迟极敏感且 KV 传输开销难掩盖、或两阶段负载难以匹配（一方长期空转）的场景，分离收益有限甚至为负，应优先混布或只做 Chunked Prefill。"
    }
  ],
  "followUpAnswers": [
    "Prefill 对 prompt 所有位置做全注意力，QK^T 与 PV 的矩阵乘规模随序列长度 n 平方增长（O(n²·d)），算力很快吃满，受限于 GPU 算力而非带宽，所以 compute-bound。",
    "Decode 每步只算 1 个 token，但要把全部模型权重与已累积的 KV Cache 从显存读进计算单元，受显存带宽限制；计算量小、搬运量大，所以 memory-bound。",
    "两类阶段瓶颈不同（算力 vs 带宽），分开部署可针对性配卡（Prefill 用高算力卡、Decode 用高带宽/大显存卡），并避免互相干扰尾延迟，从而分别优化 TTFT 与 ITL。",
    "Prefill 算完各层 K/V 后，通过网络（NVLink 同机 / InfiniBand·RDMA 跨机）按层或按块传到 Decode 节点，并写入其 KV 缓冲；传输单位通常是\"层块\"或\"token 块\"以减少延迟。",
    "可能。若网络带宽不足或 KV 体积很大（长序列、深模型），传输耗时 t_kv 超过本地继续算的代价，分离反而拖累——这也是 PD 分离不一定提吞吐的原因。",
    "短 Prompt（Prefill 本就短、传输开销占比高）、对延迟极敏感且 KV 传输开销难掩盖、或两阶段负载难以匹配（一方长期空转）的场景，分离收益有限甚至为负，应优先混布或只做 Chunked Prefill。"
  ],
  "pitfalls": [
    "把 PD 分离等同于\"吞吐必然提升\"（错：取决于 KV 传输开销与两阶段负载匹配，vLLM 文档明确提示其 PD 分离实现不保证提高吞吐）。",
    "忽视 KV 跨节点传输成本（体积随序列长与层数线性增长），在慢网络/长序列下传输反成瓶颈。",
    "以为分离后两阶段资源可随意独立扩缩——必须匹配负载，否则一方空转，整体利用率下降。"
  ],
  "beginnerSummary": "大模型干活分两步：先\"读题\"（Prefill，很费算力），再\"写答案\"（Decode，很费显存带宽）。把它们塞在同一张卡上，读题时会卡住写答案。PD 分离的思路是把这两步放到不同的卡组：读题组专心读题，写答案组专心写字，读完后把\"笔记\"（KV Cache）通过网络传给写答案组。好处是两边互不干扰、尾延迟更稳；但\"笔记\"搬家也要时间，如果网络慢、或两边忙闲不均（一边闲着一边排队），整体速度不一定更快——它主要优化的是延迟体验，不是必然提吞吐。",
  "prerequisites": [
    "Prefill 算力密集（全序列注意力）、Decode 带宽密集（每步读全部权重/KV），瓶颈不同。",
    "KV Cache 是注意力的中间结果（每层 K/V），可在阶段/节点间传输与复用。",
    "网络传输有带宽与延迟成本（NVLink 快但同机、IB/RDMA 跨机但有开销），需据此评估分离收益。"
  ],
  "workedExample": [
    "长 Prompt（prompt_len=8000, gen_len=512）：Prefill 节点算 KV（算力密集，约 0.2s），KV 经 RDMA 传 Decode 节点（t_kv≈50ms，网络带宽充足），Decode 节点续写（带宽密集）；TTFT≈0.25s，ITL 由 Decode 池独立保障、不被长 Prefill 尖峰干扰。",
    "短 Prompt + 慢网络（prompt_len=128, kv_transfer_t=120ms 但本机续算只需 5ms）：KV 传输开销占比高，分离后 TTFT 反而比混布高约 100ms，收益为负。",
    "负载不均：Prefill 池 8 卡仅用 30%，Decode 池 8 卡排队满载——整体吞吐低于把 16 卡混布，说明匹配负载比\"是否分离\"更关键。"
  ],
  "lineByLine": [
    "Prefill 节点读题：对 prompt 全序列做注意力，产出各层 K/V（KV Cache），算力密集。",
    "KV 经网络传输：按层或按块把 KV 从 Prefill 节点发到 Decode 节点，耗时 t_kv 正比于 KV 体积/网络带宽。",
    "Decode 节点从已有 KV 续生成：每步只算 1 token、读权重与 KV，带宽密集，ITL 不再被长 Prefill 尖峰干扰。",
    "两阶段瓶颈不同（算力 vs 带宽），分开部署可针对性配卡并解耦 TTFT 与 ITL 的优化。",
    "吞吐是否提升取决于 t_kv 与两池负载匹配——分离首要优化延迟体验，而非无条件吞吐。"
  ],
  "diagram": "PD Disaggregation:\n[Prefill GPU池](算力密集)\n    | 算 KV\n    | 网络传输 KV\n    v\n[Decode GPU池](带宽密集)\n    | 续自回归\n    v\n输出\n目标: 解耦 TTFT 与 ITL; 吞吐非必然提升"
};
