export default {
  "id": "inf-why-slow",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "模型推理为什么慢",
  "prompt": "大模型推理为什么慢？瓶颈可能在哪里？",
  "code": "# Python\ndef est_decode_latency(params_bytes, bw_bytes_s):\n    # Decode 每 token 需读一遍权重, 受显存带宽限制\n    return params_bytes / bw_bytes_s   # 单 token 下限延迟(秒)",
  "diagram": "瓶颈来源:\n 计算量 (FLOPs)\n 显存带宽 (读权重/KV)\n 并行度 (批/卡)\n 序列长度 (KV 增长)\nDecode 常卡在 \"显存带宽\"",
  "explanationFocus": "是什么：大模型推理『慢』并非单一原因，而是计算量、显存带宽、并行度、序列长度四者共同作用的结果。最典型的是 Decode 阶段逐 token 自回归——每生成一个字都要把整模型权重从显存读一遍，单步计算小但访存频繁，因此常落在 Memory Bound；再加上自回归无法并行输出、长上下文使 KV Cache 显存与计算线性膨胀，共同推高延迟。",
  "quickAnswer": "慢主要来自三处：海量参数带来的显存带宽压力（Decode 每 token 都要读一遍权重）、自回归逐 token 生成（无法并行输出）、长上下文/KV Cache 的显存与计算开销。线上瓶颈常常落在『显存带宽』而非算力；定位要靠 Arithmetic Intensity 对照硬件 Roofline。",
  "beginnerSummary": "大模型『想得慢』通常不是算不过来，而是『记性（显存）太慢』。每生成一个字都要把整个模型参数从显存读一遍；而字是一个接一个生成的，所以再强的算力也常在等数据。优化推理本质是让『读参数』和『生成字』更省更快——量化、KV 压缩、批处理、更好 kernel。",
  "walkthrough": "以 7B 模型 FP16 权重 ~14GB 为例：Decode 每个 token 都要把 14GB 从 HBM 读进计算单元，速度由带宽而非算力决定。A100 带宽 2TB/s，理论下限 ~7ms/token；但还要读 KV Cache、kernel 启动开销，实际 Decode ~20-40ms/token。若生成 200 字，仅 Decode 就 4-8s；若 prompt 长 4K，Prefill 再加约 1-2s。高并发 100 请求时 KV Cache 显存可能 14GB×100×... 触发显存瓶颈。",
  "approach": "把推理拆成 Prefill（并行算输入）与 Decode（逐 token 自回归），用 KV Cache 避免重算历史，用批处理/量化/并行压榨硬件；瓶颈由计算量、显存带宽、并行度、序列长度共同决定。定位具体瓶颈用 Roofline（AI 对比拐点），再针对性优化（带宽瓶颈→量化/压缩/大 batch；算力瓶颈→更优 kernel/FP8/并行）。",
  "bruteForce": "不加 KV Cache、不批处理、全 FP32 推理——每个新 token 都重算整段历史注意力（O(n²) 每步），且不合并请求，GPU 算力大量闲置、显存暴涨，慢且贵。这是『教科书反面』，线上绝不可为。",
  "invariant": "总延迟 ≈ Prefill 时间 + Decode 步数 × TPOT；瓶颈位置由 Arithmetic Intensity 决定（Prefill 常 compute、Decode 常 memory）。无论怎么优化，KV Cache 与自回归的结构性开销是固有的，只能缓解不能消除。",
  "complexity": "时间上 Decode 为 O(生成长度) 步自回归，每步访存 O(模型参数量)（读权重）+ O(n·d)（读 KV），n 为当前序列长；Prefill 一次性 O(n²d + nd²) 每层。空间上 KV Cache 随 n 与并发数线性膨胀，每 token 每层的 KV 约 2·layers·d·bytes 字节。量化把权重字节降 2~4×、KV 压缩同理，可直接把 Decode 带宽瓶颈缓解；批处理把权重读取摊薄但增尾延迟。",
  "derivation": [
    "为什么需要：线上服务要低延迟高吞吐，但模型有数十亿~千亿参数，单次前向就要搬大量权重；且自回归要求逐 token 生成，无法一次出整段。要优化必须先拆解各瓶颈来源，否则盲目加算力无效。",
    "怎么实现：把推理拆成 Prefill（并行算输入、建 KV）与 Decode（逐 token 自回归、复用 KV）；用 KV Cache 避免重算历史；用连续批处理（continuous batching）合并请求；用量化（INT8/FP8）、算子融合、张量/流水并行压榨硬件；长上下文用 KV 压缩/分页。",
    "有什么代价：加速各有代价——量化损精度，并行增通信开销，批处理增尾延迟（P99 升），长上下文爆显存需分页/压缩。要在延迟、吞吐、成本、质量间权衡，没有零代价方案。",
    "怎么评测：看四个指标：TTFT（首 token 延迟，反映 Prefill）、TPOT（每 token 延迟，反映 Decode）、吞吐（tokens/s，反映批处理效率）、GPU 利用率与显存占用。并监控 P95/P99 尾延迟而非仅平均，避免被平均掩盖的长尾。"
  ],
  "edgeCases": [
    "短 Prompt 长生成：Decode 阶段主导，带宽瓶颈，优化重心在量化/大 batch/投机解码。",
    "长 Prompt 短生成：Prefill 阶段主导，算力瓶颈，优化重心在更优注意力 kernel/FP8/Chunked Prefill。",
    "高并发：调度与显存（KV Cache）成为主导，需 continuous batching + PagedAttention 防止 OOM 与排队。",
    "超长上下文（>32K）：KV Cache 显存爆炸，即使计算能跑，显存先满，需 KV 量化/稀疏化/窗口注意力。"
  ],
  "pitfalls": [
    "以为加算力就能快：Decode 是带宽瓶颈，加算力无效，反而浪费钱。",
    "忽视 KV Cache 显存随上下文线性膨胀：长上下文服务常先被显存（而非算力）卡死。",
    "只盯平均延迟，忽略 P95/P99 尾延迟：批处理/调度抖动会让长尾很差，用户体验由尾延迟决定。",
    "不区分 Prefill/Decode 瓶颈用同一优化：两者 bound 相反，手段必须分开。"
  ],
  "prerequisites": [
    "模型有海量参数，存在显存里，读取受带宽限制。",
    "生成是逐个字（token）自回归进行的，无法并行输出。",
    "硬件有算力上限，也有显存带宽上限，瓶颈由 AI 决定。",
    "KV Cache、批处理、量化是推理加速的三类基础手段。"
  ],
  "workedExample": [
    "例 1（7B Decode 下限）：FP16≈14GB，A100 带宽 2TB/s → 理论每 token 下限 ~7ms（不含 KV）；实际含 KV 与 kernel 开销 ~20-40ms/token。",
    "例 2（长生成成本）：生成 200 字，Decode 按 30ms/tok → 6s；加 4K prompt Prefill ~1.5s，总 ~7.5s。",
    "例 3（并发显存）：100 并发、每请求 KV ~1.2GB（4K 上下文），KV 总 ~120GB，必须 PagedAttention/量化否则 OOM。"
  ],
  "lineByLine": [
    "延迟 = Prefill 时间 + Decode 步数 × TPOT：总延迟两段相加。",
    "Decode 每 token 读全量权重一次：带宽瓶颈根源。",
    "带宽是常见瓶颈，算力常闲置：故加算力无效。",
    "用 KV Cache / 批处理 / 量化逐一根治：对应三类加速手段。"
  ],
  "codeNotes": [
    "est_decode_latency 是带宽下限估计，真实还有 KV Cache 读取与 kernel 启动开销，通常 3~5× 于此下限。",
    "A100 带宽 2TB/s，7B FP16(~14GB) 理论下限 ~7ms/token，可作为『该模型最快能多快』的参考线。",
    "要压真实延迟，先确认落在带宽还是算力屋顶（Roofline），再选量化或 kernel 优化。"
  ],
  "followUps": [
    {
      "question": "为什么 GPU 算力常常用不满？",
      "answer": "Decode 每步只算一个很小的矩阵乘（单 token × 权重），算力严重过剩，真正卡在把权重从显存读到片上，即 Memory Bound。即使堆再多算力，每步要读的数据量不变，SM 大部分时间在等带宽，所以 GPU-Util 可能高但 SM 实际计算占比很低。"
    },
    {
      "question": "瓶颈怎么定位？",
      "answer": "算 Arithmetic Intensity（FLOPs/Byte）对照硬件 Roofline 拐点：低于拐点是访存瓶颈（量化/压缩/大 batch），高于拐点是算力瓶颈（更优 kernel/FP8/并行）。再配合 nvidia-smi 看 HBM 带宽利用率 vs SM 占用确认。Prefill 看算力、Decode 看带宽，分开定位。"
    },
    {
      "question": "量化一定能加速吗？",
      "answer": "未必。若没有对应高效低精度 kernel，仍要 dequant→算→quant，访存没省且多一步，INT4 也可能『更小但不更快』。量化要配套高性能 kernel（如 FP8 Tensor Core）才把字节减半、AI 翻倍真正兑现加速；否则只是省了显存、没提速。"
    }
  ],
  "followUpAnswers": [
    "Decode 每步只算一个很小的矩阵乘（单 token × 权重），算力严重过剩，真正卡在把权重从显存读到片上，即 Memory Bound。即使堆再多算力，每步要读的数据量不变，SM 大部分时间在等带宽，所以 GPU-Util 可能高但 SM 实际计算占比很低。",
    "算 Arithmetic Intensity（FLOPs/Byte）对照硬件 Roofline 拐点：低于拐点是访存瓶颈（量化/压缩/大 batch），高于拐点是算力瓶颈（更优 kernel/FP8/并行）。再配合 nvidia-smi 看 HBM 带宽利用率 vs SM 占用确认。Prefill 看算力、Decode 看带宽，分开定位。",
    "未必。若没有对应高效低精度 kernel，仍要 dequant→算→quant，访存没省且多一步，INT4 也可能『更小但不更快』。量化要配套高性能 kernel（如 FP8 Tensor Core）才把字节减半、AI 翻倍真正兑现加速；否则只是省了显存、没提速。"
  ]
};
