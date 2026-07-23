export default {
  "kind": "concept",
  "id": "inf-ttft-tpot",
  "category": "大模型推理原理",
  "difficulty": "Easy",
  "title": "TTFT 与 TPOT",
  "prompt": "TTFT 和 TPOT 分别是什么？",
  "quickAnswer": "TTFT(Time To First Token)=从发请求到收到第一个生成 token 的延迟，反映“多久开始响应”（含排队+Prefill）。TPOT(Time Per Output Token)=生成阶段相邻两个 token 的平均间隔，反映“生成流是否流畅”。两者分别衡量“首响速度”和“生成速度”。",
  "approach": "TTFT 看首响，TPOT 看生成节奏；用户体验两者都要低。",
  "explanationFocus": "是什么：TTFT=首 token 延迟；TPOT=每输出 token 的平均间隔。",
  "bruteForce": "只看“总耗时/总 token”一个平均指标 → 掩盖首响慢或生成卡顿。",
  "derivation": [
    "为什么需要：用户既恨“半天没反应”（TTFT 高），也恨“一个字憋半天”（TPOT 高）。",
    "怎么实现：TTFT 从请求发出记到首 token 到达；TPOT = (末 token 时间 − 首 token 时间)/(生成 token 数 − 1)。",
    "有什么代价：压低 TTFT 常靠 Prefill 提速/缓存；压低 TPOT 靠减少每步访存，二者优化手段不同甚至冲突（大 batch 降 TPOT 但可能抬 TTFT）。",
    "怎么评测：在固定负载下分别报 P50/P95，并画“并发-TPOT/TTFT”曲线。"
  ],
  "invariant": "端到端延迟 ≈ TTFT + (N−1)·TPOT（N 为生成 token 数）。",
  "walkthrough": "记 t0=发请求, t1=首 token, tN=末 token：TTFT=t1−t0；TPOT=(tN−t1)/(N−1)。",
  "edgeCases": [
    "流式输出：TTFT 决定“是否像卡死”，TPOT 决定“是否流畅”。",
    "排队严重：TTFT 被调度主导而非模型。",
    "生成极短：TPOT 样本少，统计不稳。"
  ],
  "code": "# Python\ndef ttft(t_first, t_req):\n    return t_first - t_req\n\ndef tpot(t_last, t_first, n_tokens):\n    return (t_last - t_first) / max(n_tokens - 1, 1)",
  "codeNotes": [
    "Inter-token Latency(ITL) 是逐间隔，TPOT 是其均值。",
    "SLA 常同时约束 TTFT 与 P95 TPOT。"
  ],
  "complexity": "测量 O(1)；需在压测中按并发分组统计分位数。",
  "followUps": [
    {
      "question": "为什么不能只看平均延迟？",
      "answer": "平均会被少量快请求拉低，掩盖长尾；用户感知的是 P95/P99 与首响，必须用分位数评估。"
    },
    {
      "question": "大 batch 对两者影响一样吗？",
      "answer": "大 batch 摊薄权重读取、降 TPOT、提吞吐，但让排在队里的请求 TTFT 升高（要等 slot）。需权衡。"
    }
  ],
  "followUpAnswers": [
    "用 P95/P99 取代均值。",
    "用 Continuous Batching 兼顾二者。"
  ],
  "pitfalls": [
    "把平均 token 延迟当唯一指标。",
    "忽略排队对 TTFT 的贡献。"
  ],
  "beginnerSummary": "TTFT 是“你问我、我多久才开口”；TPOT 是“我开口后，每个字之间隔多久”。前者让人知道系统活着，后者让人觉得说话流畅。两个都低，体验才好；只优化一个，另一头就会露馅。",
  "prerequisites": [
    "响应分“首响”和“生成节奏”。",
    "Prefill 决定首响，Decode 决定节奏。",
    "用户讨厌又慢又卡的回复。"
  ],
  "workedExample": [
    "TTFT=300ms, 生成 100 token 用 3s → TPOT=(3000)/(99)≈30ms。",
    "并发从 1 升到 32，TPOT 可能 30→45ms，TTFT 可能 300ms→1.2s。"
  ],
  "lineByLine": [
    "TTFT = 首 token 延迟（含排队+Prefill）。",
    "TPOT = 生成阶段相邻 token 平均间隔。",
    "端到端 ≈ TTFT + (N−1)·TPOT。",
    "用 P95/P99 评估，而非均值。"
  ],
  "diagram": "请求 ──TTFT──▶ █ 第1 token ──TPOT──▶ █ ──TPOT──▶ █ ...\n         (首响)              (生成节奏)"
};
