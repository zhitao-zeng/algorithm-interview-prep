export default {
  "kind": "concept",
  "id": "inf-batch-throughput",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Batch Size 与吞吐/延迟",
  "prompt": "为什么 Batch Size 增大会提高吞吐，但可能增加延迟？",
  "quickAnswer": "增大 batch 让一次矩阵乘里塞进更多请求，摊薄\"每 token 读权重\"的带宽成本，从而提升 tokens/s 吞吐；但同一 batch 内请求要等 slot、互相补齐长度（或用 Continuous Batching 动态调度），排在后面的请求首响（TTFT）与单步延迟（TPOT）上升，且 KV Cache 显存占用增大可能触发排队或拒绝。最优 batch 在\"带宽饱和且未超 SLA 延迟\"处。",
  "approach": "核心权衡是\"大 batch 提吞吐（摊薄权重读取）但抬延迟（排队+更胖的 step）\"。工程上用 Continuous Batching（连续批处理）动态把结束的请求移出、新请求填入空 slot，比静态 padding 更省；再结合 KV Cache 显存预算与 SLA 延迟上限，动态决定实时 batch 大小，在吞吐与延迟间求 Pareto 最优。",
  "explanationFocus": "是什么：在大模型自回归推理中，增大 batch size（一次并发处理的请求数）会提高\"吞吐\"（单位时间生成的 token 数），但有上限——当显存或算力未饱和前吞吐近似随 batch 线性上升；同时它也会增加\"延迟\"（单个请求的等待与完成时间），因为同一 batch 内请求要等 slot、被补齐长度或一起解码，排在后面的请求首响与单步延迟上升。二者是一对需要权衡的跷跷板。",
  "bruteForce": "无 batch 串行处理（batch=1 逐条来）最简单，但每次矩阵乘只为 1 个请求服务，权重反复读、算力大量空闲，吞吐极低；另一端是无脑超大 batch，KV Cache 瞬间塞满显存导致 OOM，或所有请求互相等待使延迟爆表、SLA 违约。两种极端都不可取。",
  "derivation": [
    "为什么需要：线上并发高，单请求串行太浪费 GPU 带宽与算力，必须把多请求合并进一次大矩阵乘才划算。",
    "怎么实现：把多个请求拼成 batch 同时过模型；变长请求用 padding 对齐或（更好）用 Continuous Batching 按 slot 动态调度，避免短请求被长请求拖死。",
    "有什么代价：batch 大 → 单步矩阵更\"胖\"（好，算力吃满），但每步耗时与显存更大、请求互相排队等待（差，延迟升）；KV Cache 随 batch 与 seq 线性增长，是显存天花板。",
    "怎么评测：扫不同 batch/并发，画\"吞吐-延迟\"Pareto 曲线，结合 SLA 的 TTFT/TPOT 上限，找在约束内吞吐最大的 batch 配置。"
  ],
  "invariant": "在显存与算力尚未饱和前，吞吐随 batch 近似线性上升，单请求延迟近似线性上升；一旦到达带宽/算力饱和点，再增 batch 吞吐不再涨而延迟继续升——此时已越过最优点。KV Cache 显存是硬上限，决定 batch 能涨到哪。",
  "walkthrough": "具体算一笔账：假设模型权重约 14 GB，读一遍权重供 1 个请求用需约 14 GB 带宽；batch=1 时每步只为 1 个请求摊这笔开销。batch=32 时，同样读一遍 14 GB 权重，却同时供 32 个请求使用，权重读取被摊薄 32 倍，吞吐可成倍提升。但代价是：这 32 个请求在每一步 decode 要\"共步\"——短请求也得等最长那个请求解码完这一步，于是排在后面的请求 TPOT 上升；且 32 份 KV Cache 占满显存，若再加请求就 OOM。",
  "edgeCases": [
    "超过显存：KV Cache 放不下 → OOM 或拒绝新请求，需限流或减 batch。",
    "长短混合：短请求被长请求拖住（Head-of-Line 阻塞），TBT/TPOT 被拉高，Continuous Batching 可缓解但难根除。",
    "达到算力饱和：再增 batch 吞吐不涨，延迟续升，已越过最优点。",
    "突发流量：瞬时高并发若超过最大 batch，排队使 TTFT 飙升，需弹性扩容或降级。"
  ],
  "code": "# Python\ndef throughput_per_sec(tokens_total, seconds):\n    return tokens_total / seconds\n\ndef weight_amortization(batch, weight_bytes):\n    # 每请求摊到的权重读取量\n    return weight_bytes / batch   # batch 越大摊得越少",
  "codeNotes": [
    "吞吐看 tokens/s 或 requests/s；延迟看 TTFT（首 token 时延）与 TPOT（每输出 token 时延）。",
    "最优 batch 在\"带宽饱和且未超 SLA 延迟\"处，需用实测曲线（而非拍脑袋）确定。",
    "草图中 weight_amortization 只刻画\"摊薄\"这一面，真实决策还要把延迟与显存约束一起考虑。"
  ],
  "complexity": "吞吐随 batch 上升到带宽/算力饱和为止（之后持平）；延迟随 batch 近似线性上升（由排队 + 共步解码共同决定）。二者关系通常用\"吞吐-延迟\"曲线描述，最优运营点在曲线拐点附近、且满足 P99 延迟 SLA 处。",
  "followUps": [
    {
      "question": "最大 batch 怎么定？",
      "answer": "由显存（KV Cache 上限）、SLA 延迟上限、以及到达流量共同决定；通常用 Continuous Batching 动态填满可用 slot，直到显存或延迟阈值触发。具体可反推：每请求峰值 KV 显存 × 并发数 ≤ 显存预算，再校对这个并发下的 P99 延迟是否满足 SLA。"
    },
    {
      "question": "吞吐高但用户觉得慢，可能为什么？",
      "answer": "吞吐是 aggregate 指标，掩盖了长尾：可能是少数长请求抬高了 P95/P99 的 TPOT，或排队使 TTFT 升高，或 batch 过大导致共步延迟。要用分位数（P50/P95/P99）而非均值看体验。"
    },
    {
      "question": "Continuous Batching 和普通 padding batch 区别？",
      "answer": "静态 padding 把所有请求补齐到最长长度、一起进出，短请求被长请求拖死；Continuous Batching 按 step 动态把完成的请求移出、新请求填入空 slot，KV 利用更紧凑、排队更短，是 vLLM/TGI 等推理引擎的标配。"
    }
  ],
  "followUpAnswers": [
    "由显存（KV Cache 上限）、SLA 延迟上限、以及到达流量共同决定；通常用 Continuous Batching 动态填满可用 slot，直到显存或延迟阈值触发。具体可反推：每请求峰值 KV 显存 × 并发数 ≤ 显存预算，再校对这个并发下的 P99 延迟是否满足 SLA。",
    "吞吐是 aggregate 指标，掩盖了长尾：可能是少数长请求抬高了 P95/P99 的 TPOT，或排队使 TTFT 升高，或 batch 过大导致共步延迟。要用分位数（P50/P95/P99）而非均值看体验。",
    "静态 padding 把所有请求补齐到最长长度、一起进出，短请求被长请求拖死；Continuous Batching 按 step 动态把完成的请求移出、新请求填入空 slot，KV 利用更紧凑、排队更短，是 vLLM/TGI 等推理引擎的标配。"
  ],
  "pitfalls": [
    "只看吞吐忽略延迟/长尾：吞吐是聚合指标，掩盖了少数长请求抬高的 P95/P99 体验。",
    "把 batch 当成越大越好：显存与延迟都有上限，越过饱和点纯增延迟不增吞吐。",
    "忽略 KV Cache 显存预算：按算力定 batch 却忘了 KV 也吃显存，上线即 OOM。"
  ],
  "beginnerSummary": "一次把很多人的作业一起批改，摊薄了\"翻教案\"的时间，整体更快（吞吐高）。但排在后面的人要等前面的人一起批完才能拿到结果，个人等待变长（延迟高）。所以批量要适中：太小吃不饱带宽，太大人人等得久，还可能桌子放不下（显存爆）。线上服务要找那个\"整体快、个人也还能接受\"的甜点。",
  "prerequisites": [
    "一次大矩阵乘可同时服务多个请求：batch 维把多请求拼成一个更胖的张量。",
    "读权重是主要成本，可被多请求摊薄：权重只读一次、被 batch 内所有请求共享。",
    "显存有限，batch 受 KV Cache 限制：每请求每 token 每层都占 KV 显存，是硬约束。"
  ],
  "workedExample": [
    "batch 1→32：权重读取摊薄 32×，吞吐可升数倍；但同时 32 份 KV Cache 占满显存，需先确认显存预算。",
    "长上下文场景：某长请求 2k token 在 batch 中，其余短请求要等它一起解码，TPOT 上升，P99 恶化——这就是延迟代价的具体体现。",
    "Continuous Batching：短请求解码完立即移出、新请求填入，slot 利用率高，比静态 padding 的吞吐更高、排队更短。"
  ],
  "lineByLine": [
    "大 batch 把多请求拼成更胖矩阵：一次前向同时服务 N 个请求，算力与带宽被吃满。",
    "权重读取被多请求摊薄 → 吞吐升：读一遍权重的成本被 N 个请求平分。",
    "但请求共步/排队 → 单请求延迟升：短请求也要等本步所有请求解码完。",
    "KV Cache 限制最大 batch：显存预算反推能并发多少个请求，超过即 OOM/拒绝。"
  ],
  "diagram": "batch=1: [req] 读权重 → 慢\nbatch=32:[req×32] 读一次权重 → 摊薄 → 快(吞吐↑)\n但: 所有 req 共一步, 互相等 → 延迟↑"
};
