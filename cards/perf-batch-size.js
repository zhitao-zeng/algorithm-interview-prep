export default {
  "kind": "concept",
  "id": "perf-batch-size",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "批大小对延迟与吞吐的影响曲线",
  "prompt": "增大推理 batch size 会怎样影响延迟和吞吐，曲线长什么样？",
  "quickAnswer": "小 batch 时增大 batch 能摊薄固定开销、吞吐近似线性上升而单请求延迟略升；到某点后算力/KV 饱和，吞吐持平甚至下降、延迟陡增。最优 batch 在\"吞吐接近平台且延迟仍可接受\"的拐点附近。",
  "approach": "扫描 batch 取值，画延迟-吞吐双轴曲线，选拐点附近作为 serving 配置。",
  "explanationFocus": "是什么：batch size 曲线描述增大批处理时吞吐先升后平、延迟先缓后陡的关系，用于选最优服务配置。",
  "bruteForce": "固定 batch=1 上线：吞吐极低、GPU 利用率低，成本不划算。",
  "derivation": [
    "为什么需要：batch 是连接延迟与吞吐的核心旋钮，选错既慢又贵。",
    "怎么实现：在固定输入/输出长度下，依次测 batch=1,2,4,8,... 的 p50 延迟与 TPS。",
    "有什么代价：大 batch 占更多 KV cache 与显存，受显存先于算力限制。",
    "怎么评测：绘制双轴曲线，结合 SLA 延迟上限选最大可行 batch。"
  ],
  "invariant": "吞吐随 batch 先∝上升后饱和；延迟随 batch 单调上升；拐点在显存/算力饱和处。",
  "walkthrough": "batch1→TPS20/延迟40ms；batch16→TPS300/延迟160ms；batch32→TPS310/延迟300ms，拐点在 16。",
  "edgeCases": [
    "continuous batching 让有效 batch 动态变化。",
    "不同 seq 长度下最优 batch 不同。",
    "显存先满限制最大 batch。"
  ],
  "code": "# Python\ndef sweep_batch(sizes, run):\n    return {b: run(b) for b in sizes}          # {batch: (tps, p50_latency)}\ndef pick_knee(curve, lat_limit):\n    return max(b for b,(t,l) in curve.items() if l <= lat_limit)",
  "codeNotes": [
    "continuous batching 改写静态 batch 含义。",
    "拐点是延迟仍达标的最大吞吐点。"
  ],
  "complexity": "O(批取值数×压测) 扫描。",
  "followUps": [
    {
      "question": "continuous batching 下还谈静态 batch 吗？",
      "answer": "更多是设 max_batch / max_num_seqs 上限，系统动态凑批，曲线变为\"最大并发\"而非固定 batch。"
    },
    {
      "question": "为什么大 batch 吞吐会下降？",
      "answer": "KV/激活显存压力与调度开销上升，或超出高效 tensor core 形状，边际收益转负。"
    }
  ],
  "followUpAnswers": [
    "动态凑批，看 max 并发。",
    "大 batch 受显存/形状限制收益转负。"
  ],
  "pitfalls": [
    "只看吞吐忽略延迟上限。",
    "忽略显存对最大 batch 的限制。"
  ],
  "beginnerSummary": "拼车：一辆车上 1 人很空(慢且浪费)，坐 4 人摊薄油费(吞吐高、每人稍慢)，塞到 8 人后车跑不动反而更慢(延迟陡增)。最佳是\"坐满但不超载\"的拐点。",
  "prerequisites": [
    "批处理并行。",
    "吞吐-延迟权衡。",
    "显存约束。"
  ],
  "workedExample": [
    "batch16 拐点：TPS300/延迟160ms。",
    "continuous batching 下看 max 并发。"
  ],
  "lineByLine": [
    "选 batch 候选值。",
    "逐值测 TPS 与延迟。",
    "画双轴曲线。",
    "按 SLA 选拐点 batch。"
  ],
  "diagram": "TPS ↑_______ (平台)\n        ╱\n延迟 ────────╲___ (陡升)\n        batch 拐点"
};
