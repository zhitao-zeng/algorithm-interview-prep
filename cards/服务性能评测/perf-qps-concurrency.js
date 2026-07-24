export default {
  "kind": "concept",
  "id": "perf-qps-concurrency",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "QPS 与并发用户数",
  "prompt": "QPS 和并发用户数(Concurrent Users)有什么区别，怎么换算？",
  "quickAnswer": "QPS(每秒查询数)是吞吐视角的请求速率；并发用户数是某一时刻\"在途\"未完成请求的数量。简化关系：并发 ≈ QPS × 平均响应时长。评测需同时给出二者，否则容量规划会失真。",
  "approach": "用 Little 定律 并发≈QPS×RT 把速率与时长连起来，再据 SLA 反推能扛多少并发。",
  "explanationFocus": "是什么：QPS 是单位时间到达/完成的请求数(速率)，并发是同时\"挂起\"的请求数(状态)，二者由平均响应时长连接。",
  "bruteForce": "只报 QPS：不知道系统同时扛多少连接，容易把\"能处理\"误当\"能并发\"。",
  "derivation": [
    "为什么需要：网关按 QPS 限流，资源按并发占显存/连接，两个视角都要。",
    "怎么实现：QPS=完成请求数/时间窗；并发=在途请求计数(或用 Little 定律估算)。",
    "有什么代价：并发高会占更多 KV cache 与连接，可能先撞显存而非算力。",
    "怎么评测：阶梯加压，记录各 QPS 下稳定并发与 p99 延迟是否达标。"
  ],
  "invariant": "并发 ≈ QPS × 平均响应时长(Little 定律)；给定 RT，QPS 与并发线性相关。",
  "walkthrough": "RT=2s，目标 QPS=50 → 平均并发≈50×2=100 个在途请求，需预留对应 KV cache。",
  "edgeCases": [
    "长连接/流式让\"并发\"定义模糊。",
    "突发尖峰使瞬时并发远超均值。",
    "QPS 不均(二八分布)拉高尾延迟。"
  ],
  "code": "# Python\ndef concurrency(qps, avg_rt):\n    return qps * avg_rt                       # Little 定律近似\ndef qps(done, window):\n    return done / window                      # 窗口内请求速率",
  "codeNotes": [
    "并发受 KV cache 与连接数限制。",
    "流式响应下 RT 含整个生成过程。"
  ],
  "complexity": "O(时间窗样本)。",
  "followUps": [
    {
      "question": "并发上不去通常是哪受限？",
      "answer": "多为 KV cache 占满显存或连接/worker 数限制，而非纯算力不足。"
    },
    {
      "question": "QPS 能无限堆吗？",
      "answer": "不能，超过容量后排队使延迟恶化、错误率上升，存在饱和点。"
    }
  ],
  "followUpAnswers": [
    "并发常受 KV cache/连接数限制。",
    "QPS 有饱和点。"
  ],
  "pitfalls": [
    "把峰值 QPS 当可持续并发。",
    "忽略流式下 RT 很长导致并发虚高。"
  ],
  "beginnerSummary": "收费站：QPS 是一分钟过了多少辆车；并发是此刻收费亭前排着几辆车。车过站要 2 秒，每分钟想放 50 辆，那平均就约有 100 辆在排队等待——这就是并发。",
  "prerequisites": [
    "吞吐与延迟概念。",
    "流式请求会长时间占用连接。",
    "KV cache 占用与并发正相关。"
  ],
  "workedExample": [
    "RT=2s, QPS=50 → 并发≈100。",
    "KV cache 只够 80 并发 → 需降 QPS 或加显存。"
  ],
  "lineByLine": [
    "统计窗口内完成请求得 QPS。",
    "统计在途请求得住并发。",
    "用并发≈QPS×RT 互验。",
    "按 SLA 设并发上限。"
  ],
  "diagram": "QPS ──×── RT ──▶ 并发\n 速率      时长     在途数\n(车/分)   (秒/车)  (排队车)"
};
