export default {
  "kind": "concept",
  "id": "perf-e2e-decomp",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "端到端延迟分解（prefill / decode）",
  "prompt": "如何把大模型服务的端到端延迟拆成 prefill 与 decode 两部分来定位瓶颈？",
  "quickAnswer": "端到端延迟 = 排队 + Prefill（一次性处理全部输入）+ Decode（逐 token 自回归生成）。Prefill 是并行矩阵乘、随输入长度增长；Decode 受内存带宽限制、随输出长度增长。分别埋点两段耗时即可定位是「输入长」还是「输出慢」拖慢整体，进而针对性优化（Prefill 慢→算力/attention 优化；Decode 慢→带宽/量化/投机解码）。",
  "approach": "在调度层对请求生命周期打点：记录「请求入队时刻 → Prefill 开始/结束（首 token 出现）→ 逐 token 生成（末 token 出现）→ 结束」。比较各段（排队、Prefill、Decode）的耗时占比，结合输入/输出长度就能定位瓶颈。配合 p50/p95/p99 分位数观察长尾。",
  "explanationFocus": "是什么：端到端延迟分解（end-to-end latency decomposition）是把一次大模型推理请求的总耗时拆成「排队时间 + Prefill 阶段 + Decode 阶段」三段，分别定量以定位瓶颈归属的方法。Prefill 是一次性处理全部输入 token 的矩阵乘（前馈式、可并行），Decode 是自回归逐 token 生成（受内存带宽限制、串行）。把两者分开埋点，才能判断是「输入太长」还是「输出太慢」拖慢整体，从而对症下药。",
  "bruteForce": "只报一个「总延迟」指标：看起来有个数，但完全不知道是输入长、输出慢、还是排队久。优化方向会完全错——可能你花力气优化 decode 内核，实际瓶颈是高峰排队；或反过来。没有分解就没有对症下药的依据。",
  "derivation": [
    "为什么需要：Prefill 受算力（FLOPs）限制、随输入长度线性增长；Decode 受内存带宽限制、随输出长度线性增长。二者瓶颈物理来源不同，优化手段完全不同，不分清就会瞎优化。",
    "怎么实现：在框架调度层记录每个请求的 prefill 起止（首 token 时刻）与 decode 起止（末 token 时刻），分别计时；排队时间 = 入队到 prefill 开始。把三段按请求聚合后统计 p50/p95。",
    "有什么代价：需要推理框架支持阶段级埋点（如 vLLM 的追踪）；在 continuous batching 下各请求阶段交错，必须按请求 ID 关联时间戳，否则会算错。埋点本身有微小开销。",
    "怎么评测：在固定输入/输出长度与固定并发下，分别统计 Prefill 段与 Decode 段的 p50/p95 占比；做「输入长度 vs 延迟」「输出长度 vs 延迟」两条曲线，斜率分别反映两段敏感度。"
  ],
  "invariant": "核心不变式：端到端 ≈ 排队 + Prefill + (输出 token 数)×TPOT。其中 Prefill ∝ 输入长度×算力单步成本，Decode ∝ 输出长度×每 token 访存时间。只要这两段被正确分离，瓶颈归属就唯一确定。",
  "walkthrough": "例：输入 2k token、输出 500 token。Prefill 一次性处理 2k token 约 0.8s；Decode 生成 500 个 token，每个 TPOT=4ms，共 2.0s；若排队 0s，则端到端 ≈ 2.8s。瓶颈明显在 Decode（占 71%）。若进一步开启 prefix cache 命中相同 2k 前缀，Prefill 可降到 0.3s，端到端降到 2.3s。",
  "edgeCases": [
    "continuous batching 使阶段重叠难拆分：多个请求 prefill/decode 交错，必须按请求 ID 聚合各自阶段，不能简单切全局时间线。",
    "排队时间在高峰期占大头：看似模型慢，其实是调度/并发满导致排队，优化方向应是扩并发或限流而非改模型。",
    "prefix cache 命中省掉部分 prefill：相同前缀可复用 KV 缓存，prefill 时间骤降，分解时要识别命中与否。",
    "流式输出中断/重试：末 token 时间戳需排除异常样本，否则污染 Decode 统计。"
  ],
  "code": "# Python\ndef e2e(queue, prefill, decode_t, n_out, tpot):\n    return queue + prefill + decode_t + n_out * tpot\ndef prefill_cost(in_len, flops_per_tok):\n    return in_len * flops_per_tok            # 与输入长度成正比",
  "codeNotes": [
    "decode 段受带宽限制而非算力：每生成一个 token 都要读一遍全部权重，瓶颈在 HBM 带宽而非 FLOPs。",
    "prefix cache 命中可减去重复 prefill：相同前缀的 KV 缓存复用，省掉冗余输入处理。",
    "分段埋点需用请求 ID 关联，尤其在 continuous batching 下，避免把别请求的耗时算到自己头上。"
  ],
  "complexity": "分解本身是 O(请求数) 的分段统计（记录每请求的几个时间戳后聚合）。难点在工程：continuous batching 下多个请求的 Prefill 与 Decode 在 GPU 上交错执行，需要按请求 ID 聚合各自的阶段耗时，而不是看全局时间线。分布式追踪（trace）与请求级日志是落地的关键。",
  "followUps": [
    {
      "question": "prefill 慢怎么优化？",
      "answer": "Prefill 是算力（FLOPs）密集型，优化方向包括：用更高效的 attention 实现（如 FlashAttention 减少 HBM 读写）、增大 prefill 的 micro-batch 提升矩阵乘利用率、开启 prefix cache 复用相同前缀 KV、以及对超长输入做分块/稀疏注意力。若输入普遍很长，还可考虑把长上下文压缩或截断到必要范围。"
    },
    {
      "question": "decode 慢怎么优化？",
      "answer": "Decode 是内存带宽密集型（每 token 都要读全量权重），优化方向包括：权重量化（INT8/INT4/FP8 减少访存）、提升 batch 利用率摊薄读权重成本、投机解码（speculative decoding）用草稿模型一次猜多个 token、以及减少输出长度。若卡在带宽，单纯加算力帮助不大，要减访存量。"
    },
    {
      "question": "为什么有的请求 prefill 占比高、有的 decode 占比高？",
      "answer": "因为 Prefill∝输入长度、Decode∝输出长度。输入长输出短（如长文档摘要）的请求 prefill 占比高；输入短输出长（如代码生成、长故事）的请求 decode 占比高。所以分解必须结合每条请求的输入/输出长度来解释，不能只报全局平均。"
    }
  ],
  "followUpAnswers": [
    "Prefill 是算力（FLOPs）密集型，优化方向包括：用更高效的 attention 实现（如 FlashAttention 减少 HBM 读写）、增大 prefill 的 micro-batch 提升矩阵乘利用率、开启 prefix cache 复用相同前缀 KV、以及对超长输入做分块/稀疏注意力。若输入普遍很长，还可考虑把长上下文压缩或截断到必要范围。",
    "Decode 是内存带宽密集型（每 token 都要读全量权重），优化方向包括：权重量化（INT8/INT4/FP8 减少访存）、提升 batch 利用率摊薄读权重成本、投机解码（speculative decoding）用草稿模型一次猜多个 token、以及减少输出长度。若卡在带宽，单纯加算力帮助不大，要减访存量。",
    "因为 Prefill∝输入长度、Decode∝输出长度。输入长输出短（如长文档摘要）的请求 prefill 占比高；输入短输出长（如代码生成、长故事）的请求 decode 占比高。所以分解必须结合每条请求的输入/输出长度来解释，不能只报全局平均。"
  ],
  "pitfalls": [
    "把排队时间与计算时间混为一谈：高峰排队被算进「模型慢」，导致优化方向错误。",
    "忽略 continuous batching 造成的阶段重叠：用全局时间线近似分段，得到完全失真的瓶颈比例。",
    "只看均值忽略长尾：p99 的 Prefill 可能因某个超长输入被严重拉高，均值看不出来。"
  ],
  "beginnerSummary": "做饭：prefill 像「备菜切所有食材」，一次用力但跟食材总量（输入）成正比；decode 像「一道道炒出来」，炒几道（输出）就花几倍时间。要提速得先知道是备菜慢还是炒菜慢——端到端分解就是给你一张「哪段最耗时」的账单。",
  "prerequisites": [
    "Prefill 与 Decode 两阶段：理解大模型推理为何分输入处理与自回归生成两段。",
    "自回归逐 token 生成：理解 Decode 为何串行、受带宽限制。",
    "continuous batching 概念：理解多请求在 GPU 上交错执行带来的埋点复杂性。",
    "分位数（p50/p95/p99）：理解用分位数而非均值刻画长尾延迟。"
  ],
  "workedExample": [
    "输入 2k、输出 500：prefill=0.8s，decode=500×4ms=2.0s，端到端≈2.8s，瓶颈在 decode（占 71%）。",
    "prefix cache 命中相同 2k 前缀：prefill 由 0.8s 降到 0.3s，端到端降到 2.3s，证明省 prefill 有效。",
    "并发 64、队列满：排队 1.5s、prefill 0.5s、decode 2.0s，端到端 4.0s，此时瓶颈在排队而非模型。"
  ],
  "lineByLine": [
    "记录「入队 → Prefill 开始」为排队时间：反映调度与并发压力，常被误算进模型耗时。",
    "记录「Prefill 起 → 首 token」为 Prefill 段：一次处理全部输入，∝ 输入长度。",
    "记录「首 token → 末 token」为 Decode 段：逐 token 自回归，∝ 输出长度×TPOT。",
    "按请求聚合三段看占比：定位瓶颈是排队/Prefill/Decode 哪一段，决定优化投入方向。"
  ],
  "diagram": "请求 →[排队]→[Prefill 输入]→[Decode tok1..tokN]→结束\n           输入长↑           输出长↑"
};
