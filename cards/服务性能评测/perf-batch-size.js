export default {
  "kind": "concept",
  "id": "perf-batch-size",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "批大小对延迟与吞吐的影响曲线",
  "prompt": "增大推理 batch size 会怎样影响延迟和吞吐，曲线长什么样？",
  "quickAnswer": "小 batch 时增大 batch 能摊薄固定开销（kernel 启动、队列等待），吞吐近似线性上升而单请求延迟略升；到某点后算力/KV cache 饱和，吞吐持平甚至下降、延迟陡增。最优 batch 在\"吞吐接近平台且延迟仍可接受\"的拐点附近，需结合 SLA 选。",
  "approach": "扫描 batch 候选值（1,2,4,8,...）→ 固定输入输出长度压测 → 画延迟-吞吐双轴曲线 → 结合 SLA 延迟上限选拐点附近最大可行 batch。",
  "explanationFocus": "是什么：batch size 曲线描述增大批处理时\"吞吐先近似线性上升、后持平甚至下降\"与\"延迟先缓升、后陡增\"的权衡关系，用于为服务选最优 batch 配置（拐点）。它是连接延迟 SLA 与成本的核心旋钮。",
  "bruteForce": "固定 batch=1 上线：每个请求独占一份固定开销，GPU 利用率低、吞吐极差，单位 token 成本不划算，且无法利用并行算力。",
  "derivation": [
    "为什么需要：batch 是连接延迟与吞吐的核心旋钮，选错要么 GPU 空转浪费钱、要么延迟爆表违反 SLA；必须用曲线而非拍脑袋定。",
    "怎么实现：在固定输入/输出长度下，依次测 batch=1,2,4,8,16,32,... 的 p50/p99 延迟与 tokens/s(TPS)；用 continuous batching 时则调 max_batch/max_num_seqs 上限测\"最大并发\"。记录每点显存占用，确认显存先满还是算力先满。",
    "有什么代价：大 batch 占更多 KV cache 与激活显存，常是显存先于算力成为上限；越大越容易受最长序列拖累（padding 或木桶效应）；压测需覆盖真实 seq 分布，否则拐点偏移。",
    "怎么评测：绘制延迟-吞吐双轴曲线，结合业务 SLA（如 p99<200ms）选\"延迟仍达标的最大吞吐点\"即拐点；并监控线上实际 batch 分布验证选型。"
  ],
  "invariant": "吞吐随 batch 先近似∝上升后饱和；延迟随 batch 单调上升；拐点出现在显存/算力饱和处（KV cache 占满或 tensor core 形状不再更优）。",
  "walkthrough": "以输入 512/输出 128、seq=4096 的服务为例：batch=1 时 TPS=20、p50 延迟 40ms；batch=8 时 TPS=180、延迟 110ms；batch=16 时 TPS=300、延迟 160ms；batch=32 时 TPS=310、延迟 300ms——吞吐在 16 之后基本平台，延迟却陡增。若 SLA 要求 p99<200ms，拐点就选 batch=16：吞吐接近峰值 300TPS 且延迟达标；再往上每多一单位延迟只换不到 3% 吞吐，不划算。在并发 100 请求下，batch=16 把 GPU 利用率从 batch=1 的 12% 提到 85%。",
  "edgeCases": [
    "continuous batching 让有效 batch 动态变化：静态 batch 概念失效，应调 max_num_seqs，曲线变为\"最大并发\"而非固定 batch。",
    "不同 seq 长度下最优 batch 不同：长序列 KV 占显存多，最优 batch 更小；混合长度需按 p99 序列定。",
    "显存先满限制最大 batch：算力未饱和但 KV cache 爆了，需更大显存或 PagedAttention 类优化。",
    "padding/木桶效应：一批里最长序列决定整批步长，短请求被拖慢。"
  ],
  "code": "# Python\ndef sweep_batch(sizes, run):\n    return {b: run(b) for b in sizes}          # {batch: (tps, p50_latency)}\ndef pick_knee(curve, lat_limit):\n    return max(b for b,(t,l) in curve.items() if l <= lat_limit)",
  "codeNotes": [
    "continuous batching 改写静态 batch 含义：更多是设 max_batch/max_num_seqs 上限，系统动态凑批。",
    "拐点是\"延迟仍达标的最大吞吐点\"，不是 TPS 最高点——TPS 最高点往往延迟已爆。",
    "压测必须固定 seq 长度才有可比曲线，且要覆盖真实长度分布校验拐点稳健性。"
  ],
  "complexity": "扫描开销 O(批取值数 × 单次压测)；单次压测需固定 seq 长度以可控。以输入 512 / 输出 128、seq=4096 为例，batch1→TPS20/延迟40ms，batch16→TPS300/延迟160ms，batch32→TPS310/延迟300ms——拐点在 16，再大只增延迟不增吞吐。continuous batching 下\"静态 batch\"概念被 max_num_seqs 取代。",
  "followUps": [
    {
      "question": "continuous batching 下还谈静态 batch 吗？",
      "answer": "更多是设上限而非固定值：现代推理引擎（vLLM/TensorRT-LLM）用 continuous batching，请求随时进出、动态凑批，没有\"这一批固定 N 个\"的概念。实务上是设 max_batch / max_num_seqs 上限（如 16 或 32），系统在该上限内动态把并发请求拼批。此时曲线应理解为\"最大并发数 vs 吞吐/延迟\"，而非静态 batch；调优目标是找到 max_num_seqs 的拐点，既填满 GPU 又不让最长序列拖垮整批延迟。"
    },
    {
      "question": "为什么大 batch 吞吐会下降？",
      "answer": "两个主因：① 显存压力——大 batch 的 KV cache 与激活占满显存，触发频繁换页或被迫减小并发，边际收益转负；② 形状/MFU 效应——超过 GPU 最优 tensor core 形状后，额外序列带来的并行收益被调度与内存带宽开销抵消，甚至因木桶效应（整批步长由最长序列决定）而变慢。所以吞吐曲线到拐点后走平甚至回落，延迟却因排队与最长序列拖累继续升，拐点之外纯亏。"
    }
  ],
  "followUpAnswers": [
    "更多是设上限而非固定值：现代推理引擎（vLLM/TensorRT-LLM）用 continuous batching，请求随时进出、动态凑批，没有\"这一批固定 N 个\"的概念。实务上是设 max_batch / max_num_seqs 上限（如 16 或 32），系统在该上限内动态把并发请求拼批。此时曲线应理解为\"最大并发数 vs 吞吐/延迟\"，而非静态 batch；调优目标是找到 max_num_seqs 的拐点，既填满 GPU 又不让最长序列拖垮整批延迟。",
    "两个主因：① 显存压力——大 batch 的 KV cache 与激活占满显存，触发频繁换页或被迫减小并发，边际收益转负；② 形状/MFU 效应——超过 GPU 最优 tensor core 形状后，额外序列带来的并行收益被调度与内存带宽开销抵消，甚至因木桶效应（整批步长由最长序列决定）而变慢。所以吞吐曲线到拐点后走平甚至回落，延迟却因排队与最长序列拖累继续升，拐点之外纯亏。"
  ],
  "pitfalls": [
    "只看吞吐忽略延迟上限：选了 TPS 最高但 p99 超 SLA 的 batch，用户体验崩。",
    "忽略显存对最大 batch 的限制：理论 batch32 最优，实际 KV 爆满 OOM，需下调。",
    "压测用单一短序列：真实长尾序列下拐点大幅左移，线上翻车。"
  ],
  "beginnerSummary": "增大 batch size 像拼车：一辆车上坐 1 人很空(慢且浪费，GPU 利用率低)，坐 4 人摊薄了油费和司机时间(吞吐高、每人稍慢)，但塞到 8 人后车跑不动、每个人反而更慢(延迟陡增)，而且可能超重上限(显存爆)。所以有个\"甜点\"——坐满但不超载的拐点。评测就是扫描不同 batch(1,2,4,8,16,32)，画一张\"吞吐量随 batch 上升后平台、延迟随 batch 单调上升\"的曲线，然后按业务能接受的最大延迟，挑那个吞吐接近峰值、延迟还达标的点。光追最高吞吐往往延迟已经爆表，用户早跑了。",
  "prerequisites": [
    "理解批处理并行能摊薄固定开销（kernel 启动、队列等待），这是小 batch 提吞吐的来源。",
    "掌握吞吐-延迟权衡：二者通常反向，需按 SLA 平衡而非单追吞吐。",
    "清楚显存是 batch 的硬上限（KV cache/激活），压测要同时看显存占用。"
  ],
  "workedExample": [
    "batch16 拐点：TPS300/延迟160ms，再大到 32 仅 TPS310/延迟300ms，延迟超 SLA 不划算。",
    "continuous batching 下看 max 并发：设 max_num_seqs=16，系统动态凑批，等效\"动态 batch\"。",
    "并发 100 压测：batch=16 把 GPU 利用率从 12%(batch1) 提到 85%，单位 token 成本降约 7×。"
  ],
  "lineByLine": [
    "选 batch 候选值（几何递增：1,2,4,8,16,32），覆盖从单请求到显存上限。",
    "逐值固定 seq 长度压测，记录 TPS 与 p50/p99 延迟，排除长度干扰。",
    "画延迟-吞吐双轴曲线，定位\"延迟陡升、吞吐平台\"的拐点。",
    "按 SLA 延迟上限选拐点附近最大可行 batch，并监控线上实际分布验证。"
  ],
  "diagram": "TPS ↑_______ (平台)\n        ╱\n延迟 ────────╲___ (陡升)\n        batch 拐点"
};
