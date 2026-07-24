export default {
  "kind": "concept",
  "id": "perf-ttft-tpot-tps",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "TTFT / TPOT / TPS 指标",
  "prompt": "评测大模型服务时 TTFT、TPOT、TPS 分别指什么？",
  "quickAnswer": "TTFT（Time To First Token）= 从请求发出到首个 token 返回的延迟，反映 Prefill 速度；TPOT（Time Per Output Token）= 相邻输出 token 的平均间隔，反映 Decode 速度；TPS（Tokens Per Second）= 总 token / 总耗时，综合吞吐。三者分别刻画首响、流畅度与吞吐，是服务评测的「三件套」：TTFT 看用户等待、TPOT 看生成节奏、TPS 看系统产出效率。",
  "approach": "分相位测延迟：首响看 Prefill（TTFT）、间隔看 Decode（TPOT）、总量看吞吐（TPS）。在固定并发与固定输入/输出长度下统一压测，分别统计三者的 p50/p95/p99，并从「并发−指标」曲线观察拐点。TPS 还需区分「单请求 TPS」与「系统总 TPS」。",
  "explanationFocus": "是什么：在大模型服务评测中，TTFT（Time To First Token）是请求发出到首个 token 返回的延迟，反映 Prefill 速度；TPOT（Time Per Output Token）是相邻输出 token 的平均间隔，反映 Decode 速度；TPS（Tokens Per Second）是单位时间内系统产出的 token 总数，反映综合吞吐。三者分别刻画「首响、流畅度、吞吐」三个不同维度，合起来才完整描述服务性能。",
  "bruteForce": "只看平均端到端延迟：掩盖 Prefill 与 Decode 的不同瓶颈，也掩盖吞吐随并发的变化。单看一个数字既无法定位是「输入长」还是「输出慢」，也无法判断系统在高并发下是否还能保住单用户体验，优化无的放矢。",
  "derivation": [
    "为什么需要：用户感知由「等多久出第一个字」（TTFT）和「出字流不流畅」（TPOT）共同决定，而平台方还关心「单位时间产多少 token」（TPS）以核算成本。单一延迟指标无法同时描述这三者，必须分开度量。",
    "怎么实现：在客户端记录首 token 到达时间戳算 TTFT；用相邻 token 时间戳均值算 TPOT（更细可看 ITL）；总生成 token 数除以从首请求到末 token 的总时长算 TPS。生产常配合追踪系统自动采集。",
    "有什么代价：流式输出下要埋点每个 token 时间戳，开销小但实现需侵入推理服务；不同 batch/并发下指标会显著变化，需固定负载条件（并发、输入/输出长度）才能横向对比。TPS 分母口径（含不含 prefill）也需统一，否则不可比。",
    "怎么评测：在固定并发与输入/输出长度下统计 p50/p95/p99 的 TTFT、TPOT、TPS；画「并发→三指标」曲线，找到体验与吞吐同时劣化的拐点，作为容量规划依据。"
  ],
  "invariant": "核心不变式：端到端延迟 ≈ TTFT + (输出 token 数 − 1) × TPOT；TPS ≈ 输出 token 数 / 总耗时。单请求下 TPS ≈ 1/TPOT；多并发下系统总 TPS 会因并行而高于单请求 TPOT 倒数，但单用户 TPOT 可能随并发升高。",
  "walkthrough": "例：输出 100 token，TTFT=200ms，TPOT=20ms → 端到端≈200+99×20=2180ms，TPS≈100/2.18≈46 tok/s（单请求）。若并发升到 32，单请求 TTFT 可能因排队升到 1.2s、TPOT 升到 45ms，但系统总 TPS 可能因 batch 复用升到数百 tok/s——说明吞吐与单用户体验是不同维度，要分别看。",
  "edgeCases": [
    "极短输出（2~3 个 token）：TPOT 样本极小、统计不稳，应改用 ITL 或直接看端到端，不宜强算均值。",
    "流式中断/重试：时间戳需排除异常样本（如连接重置），否则污染 TTFT/TPOT 统计。",
    "并发升高：TTFT 受排队影响而上升，但系统总 TPS 可能反而更高，二者需分别解读。",
    "输入极长：TTFT 被 Prefill 主导，可能远超预期，需在 SLA 中单独约束。"
  ],
  "code": "# Python\ndef tps(tokens, start, end):\n    return (tokens - 1) / (end - start)        # tok/s (不含首token等待)\ndef ttft(first_ts, req_ts):\n    return first_ts - req_ts                     # 首token延迟",
  "codeNotes": [
    "TPS 常用 (n−1)/decode 时长，避免把 prefill 等待算进 decode 吞吐；若用总时长则要明确标注口径。",
    "流式埋点每个 token 时间戳：既是算 TPOT 也是算 ITL 的数据来源，是实现关键。",
    "TPS 要区分单请求与系统总：报价按系统总 TPS，但单用户体验看 TPOT，二者不可混用。"
  ],
  "complexity": "测量为 O(样本数)：在客户端记录每个 token 的时间戳后做聚合统计分位数即可。难点在于流式输出下要埋点每个 token 时间戳以算 TPOT/ITL，并在不同 batch/并发下对比（指标会随负载变化，需固定条件）。大并发压测还需控流与采样，避免客户端成为瓶颈。",
  "followUps": [
    {
      "question": "TTFT 高说明什么？",
      "answer": "TTFT 高通常意味着 Prefill 阶段出问题：可能是输入太长（Prefill∝输入长度）、batch 太大导致排队、KV 缓存/算力不足，或与 Decode 阶段在 continuous batching 下争抢资源。它与 Decode 阶段基本无关——也就是说，提高 TPOT 的优化（如量化）不会降低 TTFT。定位 TTFT 高要看「排队时间」与「Prefill 计算时间」各占多少。"
    },
    {
      "question": "TPS 和 TPOT 什么关系？",
      "answer": "单请求下，TPS ≈ 1/TPOT（因为 TPS 是每 token 耗时的倒数）。但多并发下，系统总 TPS 指「所有请求合计产出的 token 数 / 总时间」，由于 batch 复用权重读取，系统总 TPS 会显著高于单请求 1/TPOT（可能数倍）。所以谈 TPS 必须分清是「单请求 TPS」还是「系统总 TPS」，否则容量规划与报价会算错。"
    },
    {
      "question": "三个指标该怎么设 SLA？",
      "answer": "通常同时约束：TTFT 上限（如 P95<800ms，保证不觉得卡死）、TPOT 上限（如 P95<50ms，保证生成流畅）、以及系统总 TPS 下限（保证吞吐与成本）。三者对应不同优化杠杆：TTFT→Prefill/排队、TPOT→Decode 带宽、TPS→并发与 batch 利用率。只设一个会让另外两维劣化而不被发现。"
    }
  ],
  "followUpAnswers": [
    "TTFT 高通常意味着 Prefill 阶段出问题：可能是输入太长（Prefill∝输入长度）、batch 太大导致排队、KV 缓存/算力不足，或与 Decode 阶段在 continuous batching 下争抢资源。它与 Decode 阶段基本无关——也就是说，提高 TPOT 的优化（如量化）不会降低 TTFT。定位 TTFT 高要看「排队时间」与「Prefill 计算时间」各占多少。",
    "单请求下，TPS ≈ 1/TPOT（因为 TPS 是每 token 耗时的倒数）。但多并发下，系统总 TPS 指「所有请求合计产出的 token 数 / 总时间」，由于 batch 复用权重读取，系统总 TPS 会显著高于单请求 1/TPOT（可能数倍）。所以谈 TPS 必须分清是「单请求 TPS」还是「系统总 TPS」，否则容量规划与报价会算错。",
    "通常同时约束：TTFT 上限（如 P95<800ms，保证不觉得卡死）、TPOT 上限（如 P95<50ms，保证生成流畅）、以及系统总 TPS 下限（保证吞吐与成本）。三者对应不同优化杠杆：TTFT→Prefill/排队、TPOT→Decode 带宽、TPS→并发与 batch 利用率。只设一个会让另外两维劣化而不被发现。"
  ],
  "pitfalls": [
    "把 TTFT 算进 TPS 分母导致偏高：正确做法 TPS 用 (n−1)/decode 时长或总 token/总时长，但口径要统一，避免把 prefill 等待混入 decode 吞吐。",
    "只看均值忽略长尾 p99：均值掩盖偶发长尾，而用户感知的正是 P99 卡顿。",
    "混淆单请求 TPS 与系统总 TPS：高并发下系统总 TPS 远高于单请求 1/TPOT，报价与容量规划必须用对口径。"
  ],
  "beginnerSummary": "点外卖：TTFT 是「下单到出餐第一口」等多久，TPOT 是「每口之间的间隔」顺不顺畅，TPS 是「单位时间内总共吃到多少口」。三个数字合起来才说清这顿饭吃得爽不爽——光看总时间会误以为很快，其实可能等了半天才上第一口。",
  "prerequisites": [
    "推理分 Prefill 与 Decode 两阶段：理解 TTFT/TPOT 各自由哪段主导。",
    "流式输出逐 token 返回：理解如何埋点每个 token 时间戳来算 TPOT/ITL。",
    "延迟与吞吐需分场景度量：理解单用户体验（TTFT/TPOT）与系统效率（TPS）是不同维度。",
    "分位数思维：理解用 P95/P99 而非均值刻画长尾。"
  ],
  "workedExample": [
    "输出 100 token，TTFT=200ms，TPOT=20ms → 端到端≈2.18s，TPS≈100/2.18≈46 tok/s（单请求）。",
    "并发 32 时 TTFT 因排队升到 1.2s、TPOT 升到 45ms，但系统总 TPS 升到约 300+ tok/s，说明吞吐与单用户体验需分别看。",
    "输入 4k token 时 TTFT 可能从 200ms 涨到 900ms（Prefill 主导），TPOT 几乎不变，定位瓶颈在输入处理。"
  ],
  "lineByLine": [
    "记录请求发出时间：作为 TTFT 与总耗时的起点（含排队）。",
    "记录首 token 到达 → TTFT：反映 Prefill（含排队），是用户「是否活着」的第一信号。",
    "记录每 token 间隔均值 → TPOT：反映 Decode 节奏，决定生成是否流畅。",
    "总 token / 总时长 → TPS：反映系统综合吞吐，需统一口径（常不含或含 prefill 须标注）。"
  ],
  "diagram": "TTFT: 请求 ──▶ 首token (prefill主导)\nTPOT: token_i ─▶ token_{i+1} (decode主导)\nTPS : 总token / 总耗时 (系统吞吐)"
};
