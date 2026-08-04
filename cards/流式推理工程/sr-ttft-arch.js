export default {
  "id": "sr-ttft-arch",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "TTFT 与首字延迟架构",
  "prompt": "在大语言模型的流式推理中，TTFT（Time To First Token）通常由哪几部分组成，又该如何在架构层面把首字延迟压到最低？",
  "quickAnswer": "TTFT = 排队等待 + 调度 + prefill（处理全部 prompt 生成首个 token）+ 网络首包传输。优化核心是并行 prefill、减少排队、流式首包尽快下发。",
  "approach": "把首字延迟拆解为排队、调度、prefill 计算、首包网络四个阶段，逐段做并发与预取：请求侧预连接与流式握手、服务端用连续批处理降低排队、prefill 与 decode 分离或重叠、首个 token 生成即 flush。",
  "explanationFocus": "是什么：TTFT 是从用户发起请求到收到模型第一个生成 token 的端到端耗时，反映流式体验的“首响速度”。",
  "bruteForce": "朴素做法：收到整段 prompt 后一次性完整 prefill，再开始逐 token decode，等到第一个 token 计算完成才发网络首包，所有阶段串行。",
  "invariant": "无论怎样优化，TTFT 下界 = 必须完成的最小 prefill 计算量 + 不可压缩的网络 RTT；任何方案都不能低于该物理下界。",
  "walkthrough": "1) 网关收到请求立即返回 100-continue 并建流；2) 调度器把该请求加入连续批；3) prefill 阶段用 PagedAttention 处理 prompt KV；4) 首个 decode 步产出 token；5) 立即 chunked-transfer 下发，不等待后续 token。",
  "complexity": "理想 TTFT ≈ prefill_time(prompt) + RTT；prefill 与 decode 分离后，TTFT 仅含 prompt 处理耗时。连续批处理把排队期望从 O(批大小) 降到接近 O(1)。",
  "beginnerSummary": "TTFT 就是“点发送后多久出第一个字”。它受排队、模型算 prefill、网络三件事影响；想快就让它们并行、早发、少排队。",
  "diagram": "请求 -> [网关排队] -> [prefill 计算] -> [首 token] -> 网络首包\n        ^_____预连接/流式握手重合_____^",
  "code": "def estimate_ttft(prompt_len, prefill_per_tok, rtt, queue):\n    return queue + prompt_len * prefill_per_tok + rtt\n\ndef on_first_token(token):\n    stream.flush(token)  # 首包立即下发",
  "derivation": [
    "为什么需要：用户感知的“快”主要由首字延迟决定，TTFT 过高会让流式输出形同卡顿，因此必须把首响作为独立 SLO 优化。",
    "怎么实现：拆阶段并重叠——预连接降低网络 RTT 影响、连续批处理压低排队、prefill 与 decode 解耦或重叠、首个 decode 步即 flush 首包。",
    "有什么代价：prefill/decode 分离需要额外显存与调度复杂度；激进并行会抬高尾延迟与显存峰值，需做配额与限流。",
    "怎么评测：以 P50/P90/P99 的 TTFT 为指标，配合端到端压测与分位监控，确认优化在长 prompt 与高并发下仍达标。"
  ],
  "edgeCases": [
    "空 prompt 或极短 prompt：prefill 近乎为零，TTFT 退化为纯排队+网络，需重点压低网关排队。",
    "超长 prompt（超过上下文上限）：应提前拒绝或截断并返回错误首包，避免 prefill 超时拖垮整批。",
    "首包在传输中丢失或重传：需幂等重发或基于 SSE id 续传，保证客户端不重复或遗漏首字。",
    "高并发突发：队列积压时 TTFT 由排队主导，需要优先级与限流。"
  ],
  "pitfalls": [
    "把 TTFT 误当成整句延迟：TTFT 只衡量首字，TPOT（每 token 延迟）才是后续流畅度指标，二者需分别优化与监控。",
    "prefill 与 decode 混在一起导致相互阻塞：共享 batch 时长 prompt 会拖慢短请求的 TPOT，需分离或分级调度。"
  ],
  "prerequisites": [
    "了解自回归生成与 prefill/decode 两阶段计算差异",
    "理解连续批处理（continuous batching）与 KV Cache 基本概念"
  ],
  "workedExample": [
    "场景A：prompt 长度 512，prefill 每 token 0.2ms，RTT 30ms，无排队，则 TTFT≈512×0.2+30≈132ms。",
    "场景B：同样参数但突发 100 并发排队 200ms，则 TTFT≈332ms，说明排队主导，应优先扩容调度而非压模型。"
  ],
  "lineByLine": [
    "estimate_ttft：把排队、prompt 计算、网络三段相加，得到首字延迟的近似上界，便于容量规划。",
    "on_first_token：在首个 token 产出时立即 flush，体现“首包优先”的流式原则。",
    "若将 flush 改为等整句完成再发，就退化成非流式，TTFT 失去意义。"
  ],
  "codeNotes": [
    "示例用最简线性模型；真实系统 prefill 为矩阵并行，需用实测 P50/P99 替换系数。"
  ],
  "followUps": [
    {
      "question": "TTFT 和 TPOT 应如何分别设 SLO？",
      "answer": "TTFT 面向首响体验，通常要求 P90 在数百毫秒级；TPOT 面向流畅度，要求稳定在十几到几十毫秒级，二者分别监控并独立告警。"
    },
    {
      "question": "prefill/decode 分离具体怎么落地？",
      "answer": "用两套实例或同一调度器内分阶段队列，prompt 先走 prefill 池生成 KV 再移交 decode 池，避免长 prompt 阻塞短请求。"
    }
  ],
  "followUpAnswers": [
    "TTFT 面向首响体验，通常要求 P90 在数百毫秒级；TPOT 面向流畅度，要求稳定在十几到几十毫秒级，二者分别监控并独立告警。",
    "用两套实例或同一调度器内分阶段队列，prompt 先走 prefill 池生成 KV 再移交 decode 池，避免长 prompt 阻塞短请求。"
  ],
  "kind": "concept"
};
