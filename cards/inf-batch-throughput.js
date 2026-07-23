export default {
  "kind": "concept",
  "id": "inf-batch-throughput",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Batch Size 与吞吐/延迟",
  "prompt": "为什么 Batch Size 增大会提高吞吐，但可能增加延迟？",
  "quickAnswer": "增大 batch 让一次矩阵乘里塞进更多请求，摊薄“每 token 读权重”的带宽成本，从而提升 tokens/s 吞吐；但同一 batch 内请求要等 slot、互相补齐长度（或一起解码），排在后面的请求首响与单步延迟上升，且显存（KV Cache）占用增大可能触发排队/拒绝。",
  "approach": "大 batch 提吞吐（摊薄权重读取），但抬延迟（排队+更胖的 step）。",
  "explanationFocus": "是什么：吞吐随 batch 上升（到带宽饱和），延迟随 batch 上升（排队+共步）。",
  "bruteForce": "无 batch 串行处理 → 权重反复读、吞吐极低；超大 batch → 显存爆/OOM。",
  "derivation": [
    "为什么需要：线上并发高，单请求串行太浪费带宽。",
    "怎么实现：把多请求拼成 batch 同时过模型；用 padding 或 Continuous Batching 处理变长。",
    "有什么代价：batch 大 → 单步矩阵更胖（好），但每步耗时与显存更大、请求互相等（差）。",
    "怎么评测：扫不同 batch/并发，画“吞吐-延迟”Pareto 曲线，找 SLA 内最优点。"
  ],
  "invariant": "在显存与算力未饱和前，吞吐随 batch 近似线性上升，单请求延迟近似线性上升。",
  "walkthrough": "batch=1 时每步读一遍权重供 1 请求用；batch=32 时读一遍权重供 32 请求用，权重读取被摊薄 32 倍。",
  "edgeCases": [
    "超过显存：KV Cache 放不下 → OOM 或拒绝。",
    "长短混合：短请求被长请求拖住（HoL）。",
    "达到算力饱和：再增 batch 吞吐不涨，延迟续升。"
  ],
  "code": "# Python\ndef throughput_per_sec(tokens_total, seconds):\n    return tokens_total / seconds\n\ndef weight_amortization(batch, weight_bytes):\n    # 每请求摊到的权重读取量\n    return weight_bytes / batch   # batch 越大摊得越少",
  "codeNotes": [
    "吞吐看 tokens/s 或 requests/s；延迟看 TTFT/TPOT。",
    "最优 batch 在“带宽饱和且未超 SLA 延迟”处。"
  ],
  "complexity": "吞吐随 batch 上升到带宽/算力饱和；延迟随 batch 近似线性（排队+共步）。",
  "followUps": [
    {
      "question": "最大 batch 怎么定？",
      "answer": "由显存（KV Cache 上限）、SLA 延迟上限、以及到达流量共同决定；通常用 Continuous Batching 动态填满可用 slot 直到显存或延迟阈值。"
    },
    {
      "question": "吞吐高但用户觉得慢，可能为什么？",
      "answer": "吞吐是 aggregate 指标，掩盖了长尾；可能是少数长请求抬了 P95 TPOT，或排队使 TTFT 升高。"
    }
  ],
  "followUpAnswers": [
    "用显存预算反推最大并发。",
    "用分位数而非均值看体验。"
  ],
  "pitfalls": [
    "只看吞吐忽略延迟/长尾。",
    "把 batch 当成越大越好（显存与延迟有上限）。"
  ],
  "beginnerSummary": "一次把很多人的作业一起批改，摊薄了“翻教案”的时间，整体更快（吞吐高）。但排在后面的人要等前面的人一起批完才能拿到结果，个人等待变长（延迟高）。所以批量要适中：太小吃不饱带宽，太大人人等得久还可能桌子放不下（显存爆）。",
  "prerequisites": [
    "一次矩阵乘可服务多个请求。",
    "读权重是主要成本，可摊薄。",
    "显存有限，batch 受 KV Cache 限制。"
  ],
  "workedExample": [
    "batch 1→32：权重读取摊薄 32×，吞吐可升数倍。",
    "但某长请求 2k token 在 batch 中，其余短请求要等它一起解码，TPOT 上升。"
  ],
  "lineByLine": [
    "大 batch 把多请求拼成更胖矩阵。",
    "权重读取被多请求摊薄 → 吞吐升。",
    "但请求共步/排队 → 单请求延迟升。",
    "显存(KV)限制最大 batch。"
  ],
  "diagram": "batch=1: [req] 读权重 → 慢\nbatch=32:[req×32] 读一次权重 → 摊薄 → 快(吞吐↑)\n但: 所有 req 共一步, 互相等 → 延迟↑"
};
