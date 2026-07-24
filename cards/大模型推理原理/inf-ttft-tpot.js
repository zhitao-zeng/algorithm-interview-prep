export default {
  "kind": "concept",
  "id": "inf-ttft-tpot",
  "category": "大模型推理原理",
  "difficulty": "Easy",
  "title": "TTFT 与 TPOT",
  "prompt": "TTFT 和 TPOT 分别是什么？",
  "quickAnswer": "TTFT（Time To First Token）= 从发请求到收到第一个生成 token 的延迟，反映「多久开始响应」（含排队+Prefill）。TPOT（Time Per Output Token）= 生成阶段相邻两个 token 的平均间隔，反映「生成流是否流畅」（由 Decode 带宽决定）。两者分别衡量「首响速度」和「生成速度」，共同决定对话体验——前者让人知道系统活着，后者让人觉得说话流畅。",
  "approach": "TTFT 看首响、TPOT 看生成节奏，用户体验两者都要低。压低 TTFT 通常靠 Prefill 提速与排队优化（prefix cache、扩并发）；压低 TPOT 靠减少每步访存（量化、投机解码、提升 batch 利用率）。优化二者手段不同甚至冲突（大 batch 降 TPOT 但可能抬 TTFT），需用 continuous batching 折中。",
  "explanationFocus": "是什么：TTFT（Time To First Token，首 token 延迟）是指从用户发出请求到收到第一个生成 token 的延迟，反映「系统多久开始响应」（包含排队与 Prefill 处理）；TPOT（Time Per Output Token，每输出 token 平均间隔）是指生成阶段相邻两个 token 之间的平均耗时，反映「生成流是否流畅」（主要由 Decode 的带宽决定）。二者分别刻画用户体验的「首响速度」与「生成节奏」，缺一不可。",
  "bruteForce": "只看「总耗时 / 总 token」一个平均指标：会掩盖「首响慢」或「生成卡顿」。比如一个请求总耗时 3s 看似还行，但 TTFT 高达 2s（用户以为卡死）、TPOT 仅 10ms，平均指标完全看不出首响问题。单指标无法指导优化。",
  "derivation": [
    "为什么需要：用户既恨「半天没反应」（TTFT 高，以为系统挂了），也恨「一个字憋半天」（TPOT 高，生成卡顿）。单一平均延迟无法区分这两种糟糕体验，必须拆成两个指标分别约束。",
    "怎么实现：TTFT 从请求发出记到首 token 到达；TPOT 取生成段（首 token 到末 token）的总时长除以 (生成 token 数−1)。更细可用 ITL（Inter-Token Latency，逐间隔）观察每个间隔的波动。",
    "有什么代价：压低 TTFT 常靠 Prefill 提速/缓存/扩并发；压低 TPOT 靠减少每步访存（量化、投机解码）。二者优化手段不同甚至冲突——大 batch 摊薄权重读取、降 TPOT、提吞吐，但让排在队里的请求 TTFT 升高（要等 slot）。需要在 SLA 内权衡。",
    "怎么评测：在固定负载与输入/输出长度下分别报 TTFT 与 TPOT 的 P50/P95/P99，并画「并发−TPOT/TTFT」曲线，定位在哪个并发点体验开始劣化。"
  ],
  "invariant": "核心不变式：端到端延迟 ≈ TTFT + (N−1)·TPOT，其中 N 为生成 token 数。只要这个分解成立，就能用 TTFT 与 TPOT 两个自由度精确刻画延迟结构，二者分别由 Prefill（含排队）与 Decode 主导。",
  "walkthrough": "记 t0=发请求时刻，t1=首 token 到达时刻，tN=末 token 到达时刻：TTFT = t1−t0（含排队与 Prefill）；TPOT = (tN−t1)/(N−1)（仅生成段平均间隔）。例：t0=0、t1=0.3s、tN=3.3s、N=100，则 TTFT=300ms，TPOT=(3300−300)/99≈30ms。若 N 很小（如 3 个 token），TPOT 样本太少统计不稳，需用 ITL（逐间隔）而非均值。",
  "edgeCases": [
    "流式输出：TTFT 决定用户是否觉得「卡死」（迟迟不出第一个字最致命），TPOT 决定「是否流畅」，二者体验权重不同。",
    "排队严重：TTFT 被调度/并发主导而非模型计算本身，此时优化模型内核对 TTFT 帮助有限。",
    "生成极短（如只有 2~3 个 token）：TPOT 样本极少、统计不稳，应改用 ITL 或直接看端到端而非均值。",
    "中断/重试：首末 token 时间戳需排除异常样本，否则污染统计。"
  ],
  "code": "# Python\ndef ttft(t_first, t_req):\n    return t_first - t_req\n\ndef tpot(t_last, t_first, n_tokens):\n    return (t_last - t_first) / max(n_tokens - 1, 1)",
  "codeNotes": [
    "Inter-Token Latency（ITL）是逐 token 间隔，TPOT 是其均值；看波动要用 ITL，看整体节奏用 TPOT。",
    "SLA 常同时约束 TTFT 与 P95 TPOT：例如 TTFT<800ms 且 P95 TPOT<50ms，二者缺一不可。",
    "TPOT 分母用 (n_tokens−1)：因为 N 个 token 之间只有 N−1 个间隔。"
  ],
  "complexity": "测量本身是 O(1)（记录几个时间戳），但需在压测中按「并发度」分组统计分位数（p50/p95/p99）。难点在于流式输出下要埋点每个 token 的时间戳以算 ITL 与 TPOT，并且在高并发下区分「排队导致的 TTFT」与「模型计算导致的 TTFT」。统计分位数需维护样本池或直方图。",
  "followUps": [
    {
      "question": "为什么不能只看平均延迟？",
      "answer": "平均延迟会被少量极快请求拉低，掩盖长尾卡顿。用户真实感知的是分位数（P95/P99）与首响：即使平均只有 500ms，只要有 5% 的请求 P99 到 3s，那 5% 的用户就会觉得系统很烂。而且平均把 TTFT 与 TPOT 混在一起，看不出是「首响慢」还是「生成卡」，无法指导优化。必须分别报 P50/P95/P99 的 TTFT 与 TPOT。"
    },
    {
      "question": "大 batch 对两者影响一样吗？",
      "answer": "不一样，甚至相反。大 batch 摊薄了每次读权重的固定开销，提升吞吐、降低 TPOT（生成更顺），但排在队列里的请求要等前面 batch 的 slot，TTFT 反而升高。所以二者需要权衡：用 continuous batching 在「不无限堆 batch」的前提下尽量复用，兼顾低 TPOT 与可控 TTFT；或按 SLA 设最大 batch 上限。"
    },
    {
      "question": "TPOT 和 ITL 有什么区别，该看哪个？",
      "answer": "TPOT 是生成阶段相邻 token 间隔的「平均值」，反映整体节奏；ITL（Inter-Token Latency）是「每一个」间隔的明细，能暴露偶发卡顿（如某一步因调度或显存抖动突然变慢）。日常监控看 TPOT（配合 P95/P99），定位问题或评估流式流畅度时看 ITL 的分布。极短输出样本不足时，ITL 比 TPOT 更有意义。"
    }
  ],
  "followUpAnswers": [
    "平均延迟会被少量极快请求拉低，掩盖长尾卡顿。用户真实感知的是分位数（P95/P99）与首响：即使平均只有 500ms，只要有 5% 的请求 P99 到 3s，那 5% 的用户就会觉得系统很烂。而且平均把 TTFT 与 TPOT 混在一起，看不出是「首响慢」还是「生成卡」，无法指导优化。必须分别报 P50/P95/P99 的 TTFT 与 TPOT。",
    "不一样，甚至相反。大 batch 摊薄了每次读权重的固定开销，提升吞吐、降低 TPOT（生成更顺），但排在队列里的请求要等前面 batch 的 slot，TTFT 反而升高。所以二者需要权衡：用 continuous batching 在「不无限堆 batch」的前提下尽量复用，兼顾低 TPOT 与可控 TTFT；或按 SLA 设最大 batch 上限。",
    "TPOT 是生成阶段相邻 token 间隔的「平均值」，反映整体节奏；ITL（Inter-Token Latency）是「每一个」间隔的明细，能暴露偶发卡顿（如某一步因调度或显存抖动突然变慢）。日常监控看 TPOT（配合 P95/P99），定位问题或评估流式流畅度时看 ITL 的分布。极短输出样本不足时，ITL 比 TPOT 更有意义。"
  ],
  "pitfalls": [
    "把平均 token 延迟当唯一指标：均值被少量快请求拉低，掩盖长尾；用户感知的是 P95/P99 与首响，必须用分位数。",
    "忽略排队对 TTFT 的贡献：把高 TTFT 全归咎于 Prefill，实际可能是并发满排队，优化方向错。",
    "在极短输出上强算 TPOT：样本不足导致数字抖动，误判性能。"
  ],
  "beginnerSummary": "TTFT 是「你问我、我多久才开口」；TPOT 是「我开口后，每个字之间隔多久」。前者让人知道系统活着，后者让人觉得说话流畅。两个都低，体验才好；只优化一个，另一头就会露馅——比如开口快但写字卡顿，仍像在便秘。",
  "prerequisites": [
    "响应分「首响」和「生成节奏」：理解用户感知的两个独立维度。",
    "Prefill 决定首响、Decode 决定节奏：理解 TTFT 与 TPOT 各自由哪段主导。",
    "用户讨厌又慢又卡的回复：理解为何两个指标都要低。",
    "分位数思维：理解 P95/P99 比均值更能反映真实体验。"
  ],
  "workedExample": [
    "TTFT=300ms，生成 100 token 用 3s → TPOT=(3000)/(99)≈30ms；端到端≈300+99×30≈3270ms。",
    "并发从 1 升到 32：TPOT 可能 30ms→45ms（batch 增大带宽更满），TTFT 可能 300ms→1.2s（排队加剧）。",
    "开启 prefix cache：TTFT 从 800ms 降到 400ms（省掉重复 Prefill），TPOT 不变（Decode 不受影响）。"
  ],
  "lineByLine": [
    "TTFT = 首 token 延迟（含排队 + Prefill）：衡量「系统多久开口」，是用户对「是否活着」的第一判断。",
    "TPOT = 生成阶段相邻 token 平均间隔：衡量「说话流不流畅」，由 Decode 每步访存决定。",
    "端到端 ≈ TTFT + (N−1)·TPOT：两个自由度精确刻画延迟结构，N 为生成 token 数。",
    "用 P95/P99 评估而非均值：长尾才是用户真实痛点，均值会掩盖偶发卡顿。"
  ],
  "diagram": "请求 ──TTFT──▶ █ 第1 token ──TPOT──▶ █ ──TPOT──▶ █ ...\n         (首响)              (生成节奏)"
};
