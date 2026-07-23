export default {
  "kind": "concept",
  "id": "inf-why-slow",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "模型推理为什么慢",
  "prompt": "大模型推理为什么慢？瓶颈可能在哪里？",
  "quickAnswer": "慢主要来自三处：海量参数带来的显存带宽压力（Decode 每 token 都要读一遍权重）、自回归逐 token 生成（无法并行输出）、以及长上下文/KV Cache 的显存与计算开销。线上瓶颈常常落在“显存带宽”而非算力。",
  "approach": "瓶颈由计算量、显存带宽、并行度、序列长度共同决定；Decode 阶段逐 token 自回归，单步计算小但访存频繁，常是带宽瓶颈。",
  "explanationFocus": "是什么：大模型推理延迟由“计算量、显存带宽、并行度、序列长度”共同决定；Decode 是逐 token 自回归，单步计算小但访存频繁。",
  "bruteForce": "不加 KV Cache、不批处理、全 FP32 推理 → 慢且贵，GPU 算力大量闲置。",
  "derivation": [
    "为什么需要：线上服务要低延迟高吞吐，但模型有数十亿~千亿参数，单次前向就要搬大量权重。",
    "怎么实现：把推理拆成 Prefill（并行算输入）与 Decode（逐 token 自回归）；用 KV Cache 避免重算历史；用批处理/量化/并行压榨硬件。",
    "有什么代价：加速各有代价——量化损精度，并行增通信，批处理增尾延迟，长上下文爆显存。",
    "怎么评测：看 TTFT（首 token 延迟）、TPOT（每 token 延迟）、吞吐(tokens/s)、GPU 利用率与显存占用。"
  ],
  "invariant": "总延迟 ≈ Prefill 时间 + Decode 步数 × TPOT；瓶颈位置由 Arithmetic Intensity 决定。",
  "walkthrough": "以 7B 模型 FP16 权重 ~14GB 为例：Decode 每个 token 都要把 14GB 从显存读进计算单元，速度由带宽而非算力决定。",
  "edgeCases": [
    "短 Prompt 长生成：Decode 阶段主导，带宽瓶颈。",
    "长 Prompt 短生成：Prefill 阶段主导，算力瓶颈。",
    "高并发：调度与显存（KV Cache）成为主导。"
  ],
  "code": "# Python\ndef est_decode_latency(params_bytes, bw_bytes_s):\n    # Decode 每 token 需读一遍权重, 受显存带宽限制\n    return params_bytes / bw_bytes_s   # 单 token 下限延迟(秒)",
  "codeNotes": [
    "真实还有 KV Cache 读取与 kernel 启动开销；这是带宽下限估计。",
    "A100 带宽 2TB/s，7B FP16(~14GB) 理论下限 ~7ms/token。"
  ],
  "complexity": "时间上 Decode 为 O(生成长度) 步自回归；每步访存 O(模型参数量)。",
  "followUps": [
    {
      "question": "为什么 GPU 算力常常用不满？",
      "answer": "Decode 每步只算一个很小的矩阵乘（单 token × 权重），算力过剩，真正卡在把权重从显存读到片上，即 Memory Bound。"
    },
    {
      "question": "瓶颈怎么定位？",
      "answer": "算 Arithmetic Intensity（FLOPs/Byte）对照硬件 roofline；低于拐点就是访存瓶颈，高于拐点是算力瓶颈。"
    }
  ],
  "followUpAnswers": [
    "nvidia-smi 看 GPU 利用率与显存。",
    "用 roofline 模型判断 compute vs memory bound。"
  ],
  "pitfalls": [
    "以为加算力就能快（Decode 是带宽瓶颈，加算力无效）。",
    "忽视 KV Cache 显存随上下文线性膨胀。",
    "只盯平均延迟，忽略 P95/P99 尾延迟。"
  ],
  "beginnerSummary": "大模型“想得慢”通常不是算不过来，而是“记性（显存）太慢”。每生成一个字，都要把整个模型的参数从显存读一遍；而字是一个接一个生成的，所以再强的算力也常在等数据。优化推理，本质是让“读参数”和“生成字”更省更快。",
  "prerequisites": [
    "模型有海量参数，存在显存里。",
    "生成是逐个字（token）自回归进行的。",
    "硬件有算力上限，也有显存带宽上限。"
  ],
  "workedExample": [
    "7B 模型 FP16≈14GB，A100 带宽 2TB/s → 理论每 token 下限 ~7ms（不含 KV）。",
    "实际 Decode ~20-40ms/token，差额来自 KV 读取与 kernel 开销。"
  ],
  "lineByLine": [
    "延迟 = Prefill 时间 + Decode 步数 × TPOT。",
    "Decode 每 token 读全量权重一次。",
    "带宽是常见瓶颈，算力常闲置。",
    "用 KV Cache / 批处理 / 量化逐一根治。"
  ],
  "diagram": "瓶颈来源:\n 计算量 (FLOPs)\n 显存带宽 (读权重/KV)\n 并行度 (批/卡)\n 序列长度 (KV 增长)\nDecode 常卡在 \"显存带宽\""
};
