export default {
  "id": "inf-gpu-util-low",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Decode 阶段 GPU 利用率不高",
  "prompt": "为什么大模型 Decode 阶段 GPU 利用率可能不高？",
  "code": "# Python\ndef decode_busy_ratio(flops, compute_tflops, bytes_moved, bw_tbs):\n    compute_time = flops / (compute_tflops * 1e12)\n    mem_time = bytes_moved / (bw_tbs * 1e12)\n    return compute_time / (compute_time + mem_time)  # 越接近0越 memory-bound",
  "diagram": "GPU SM (算力)  ←── 等数据 ──  HBM(显存)\n  计算 0.01μs  vs  搬运 16μs\n  → 99.9% 时间在等带宽",
  "explanationFocus": "是什么：大模型 Decode 阶段 GPU 利用率（SM 占用率 / GPU-Util）常常不高，根因是 Decode 每步只对 1 个新 token 做矩阵乘，计算量极小，却要把整个模型权重和 KV Cache 从显存（HBM）搬进计算单元。因为『算得少、搬得多』，GPU 算力大部分时间在等数据，SM 占用率低——这是典型的 Memory Bound，不是算力不够。",
  "quickAnswer": "Decode 每步仅对 1 个新 token 做矩阵乘，计算量（FLOPs）远小于可提供的算力，却要把全部权重与 KV Cache 从 HBM 搬进片上，于是 Arithmetic Intensity 远低于硬件拐点，GPU 大部分时间在等带宽，SM 占用率低——这是 Memory Bound 的典型表现。治法不是加算力，而是减搬运（量化、KV 压缩）或增有效计算（更大 batch、投机解码）。",
  "beginnerSummary": "GPU 像超级工人，但每次只让你写一字，却要他把整座图书馆（模型权重）从仓库（显存）搬到工作台。工人大部分时间在等书送来，而不是在写字——所以『工人很闲』（利用率低）不是因为笨，是因为被取书卡住了。治法是少搬书（量化/压缩）或一次多派几个人一起写（大 batch）。",
  "walkthrough": "以 d=4096 的线性层为例：每 Decode 步算 (1,d)×(d,d) 的小矩阵，FLOPs≈2·d²=33.6M；但要把 d²=16.7M 参数（FP16 下 33.6MB）从 HBM 搬上来。A100 带宽 2TB/s 搬 33.6MB 需 ~16.8μs，而 312 TFLOPS 算 33.6M FLOPs 只要 ~0.108μs——99.7% 时间在搬数据。GPU-Util 可能显示 95% 但 SM 占用（实际算 FLOPs 的时间）仅 5%，典型 Memory Bound。",
  "approach": "Decode 利用率低 = 带宽瓶颈：计算量少、等权重/KV 搬运。诊断用 Arithmetic Intensity 对比硬件拐点（算力 TFLOPS / 带宽 TB/s），低于拐点即 memory-bound；再从 nvidia-smi 看 HBM 带宽利用率（高）与 SM 占用（低）佐证。优化方向：减搬运（量化、KV 压缩）或增有效计算（更大 batch、投机解码、更长可并行序列）。",
  "bruteForce": "盲目换更大算力的 GPU（如从 A100 换 H100 只为更多 TFLOPS）——但 H100 的带宽提升比例远小于算力提升，Decode 仍被带宽卡住，利用率依旧低，钱白花。不先确认是 Memory Bound 就加算力，方向错误。",
  "invariant": "Decode 步的 Arithmetic Intensity（FLOPs/Byte）固定且远低于硬件拐点，无论怎么调超参都不会变——它由『每步 1 token × 全量权重』的结构决定。要提升利用率只能改变结构：减字节（量化）、增复用（大 batch）、或增每步有效计算（投机解码一次验证多 token）。",
  "complexity": "单步计算 O(d²) FLOPs 与 O(d²) 字节搬运（权重），比值为常数，与序列长度无关；KV Cache 读取另加 O(n·d) 字节但 n 通常远小于 d。关键比率是 计算时间/搬运时间 ≈ (2·d² / 算力) / (2·d²·2byte / 带宽)，对 A100 约 0.108μs / 16.8μs ≈ 0.6%，即 99.4% 时间在等带宽。增大 batch 把权重读取摊到 B 个请求，利用率近似随 B 线性提升到饱和。",
  "derivation": [
    "为什么需要：要理解『利用率低』的根因才能对症优化。若误以为是算力不够去加卡，无效；真正瓶颈在显存带宽，须用减搬运/增复用类手段。先定性是 Memory Bound 才不浪费工程资源。",
    "怎么实现：每 Decode 步算 (1,d)×(d,d) 的小矩阵，FLOPs≈2d²，但要先把 d² 权重从 HBM 搬上来（FP16 下 2·d² 字节）。计算 Arithmetic Intensity = FLOPs/字节，对比硬件拐点（峰值算力/峰值带宽）即可判定 memory-bound。再用 nvidia-smi 看 HBM 带宽利用率与 SM 占用确认。",
    "有什么代价：直接加算力无用（带宽没提）；真正有效的量化、KV 压缩会轻微损精度，大 batch 会增尾延迟（P99 升），投机解码有一次验证多 token 的额外接受率权衡。这些代价都比『盲目加卡』便宜得多。",
    "怎么评测：看 nvidia-smi 的 GPU-Util、SM 占用（Active Cycles）、HBM 带宽利用率、kernel 时间占比；用 Roofline 看 Decode kernel 落在带宽屋顶。优化后复测：量化应使 SM 占用近似翻倍、吞吐提升；大 batch 应使单请求 TPOT 略升但总吞吐升。"
  ],
  "edgeCases": [
    "极小模型（如 d=768）：可能被算力或 kernel launch 开销主导，未必纯带宽，需实测而非套公式。",
    "投机解码：每步验证多个草稿 token，有效计算量抬升、AI 上升，利用率改善，但受接受率影响。",
    "极大 batch：矩阵变『胖』（batch 维大），权重读取被更多请求摊薄，利用率可显著改善直到算力饱和。",
    "MoE：每 token 只激活部分专家，有效计算更小，memory-bound 更显著，需激活专家量化。"
  ],
  "pitfalls": [
    "看到利用率低就加算力（方向错）：Decode 卡在带宽，换更高算力卡带宽未必同比例提升，利用率照旧低。",
    "把 GPU-Util 高误判为健康：GPU-Util 高可能只是 SM 有活干但大量时间在等内存，要看 SM 占用（实际计算占比）与 HBM 带宽利用率才准。",
    "忽略 KV Cache 读取也算进 bytes_moved，只算权重会低估 memory-bound 程度。"
  ],
  "prerequisites": [
    "Decode 每次只算 1 个 token，矩阵极『瘦』。",
    "算得少，但要搬全部权重与历史 KV。",
    "显存带宽（HBM）比算力更易成为瓶颈；AI 与拐点可定量判断。",
    "GPU-Util、SM 占用、HBM 带宽利用率的区别。"
  ],
  "workedExample": [
    "例 1（d=4096 层）：算 ~33.6M FLOPs 用 ~0.108μs（312 TFLOPS 下），搬 33.6MB 用 ~16.8μs → 计算占比 ~0.6%，典型 memory-bound。",
    "例 2（量化到 INT8）：权重字节减半→搬运减半→利用率近似翻倍，TPOT 从 40ms 降到 ~22ms。",
    "例 3（batch 32→256）：权重读取摊薄 8 倍，SM 占用从 5% 升到 ~35%，总吞吐升约 6 倍，单请求 TPOT 略升因排队。"
  ],
  "lineByLine": [
    "Decode 每步计算量极小（只 1 个新 token 的矩阵乘）。",
    "但每步要读全量权重 + KV 从 HBM 到片上。",
    "算得少、搬得多 → Arithmetic Intensity 远低于拐点 → Memory Bound。",
    "利用率低因在等显存带宽，而非算力不足；治法为量化/压缩/大 batch。"
  ],
  "codeNotes": [
    "GPU-Util 高 ≠ 高效：它可能反映 SM 在被调度但大量 stall 在内存，要同时看 SM 占用（计算活跃比）与 HBM 带宽利用率。",
    "HBM 带宽利用率比 SM 占用更能说明 Decode 瓶颈：Decode 时带宽利用率常 90%+ 而 SM 占用个位数。",
    "decode_busy_ratio 越接近 0 越 memory-bound；可用来快速定量。"
  ],
  "followUps": [
    {
      "question": "利用率低要不要换更大算力卡？",
      "answer": "通常没用。Decode 卡在显存带宽，而高端卡（H100 vs A100）的带宽提升比例（约 2×）远小于算力提升比例（约 2.5~3×），换卡后 AI 仍远低于新拐点，利用率照旧低。应优先减搬运（INT8/FP8 量化权重、KV Cache 压缩）或增有效计算（更大 batch、投机解码、更长可并行 Prefill）。"
    },
    {
      "question": "怎么确认是 Memory Bound？",
      "answer": "两步：① 算 Arithmetic Intensity = FLOPs/Byte，对比硬件拐点（峰值算力 TFLOPS ÷ 峰值带宽 TB/s），低于拐点即 memory-bound；② 实测 nvidia-smi：HBM 带宽利用率高（>80%）而 SM 占用低（个位数%~十几%）即佐证。两者一致即可确诊。"
    },
    {
      "question": "提升利用率会不会牺牲延迟？",
      "answer": "增 batch 会抬升单请求 TPOT 与 P99（因排队与更大矩阵），但总吞吐显著提升，是典型『吞吐换延迟』权衡；量化/投机解码则能在不增 batch 的情况下同时改善利用率与单请求延迟。需按 SLA 选手段。"
    }
  ],
  "followUpAnswers": [
    "通常没用。Decode 卡在显存带宽，而高端卡（H100 vs A100）的带宽提升比例（约 2×）远小于算力提升比例（约 2.5~3×），换卡后 AI 仍远低于新拐点，利用率照旧低。应优先减搬运（INT8/FP8 量化权重、KV Cache 压缩）或增有效计算（更大 batch、投机解码、更长可并行 Prefill）。",
    "两步：① 算 Arithmetic Intensity = FLOPs/Byte，对比硬件拐点（峰值算力 TFLOPS ÷ 峰值带宽 TB/s），低于拐点即 memory-bound；② 实测 nvidia-smi：HBM 带宽利用率高（>80%）而 SM 占用低（个位数%~十几%）即佐证。两者一致即可确诊。",
    "增 batch 会抬升单请求 TPOT 与 P99（因排队与更大矩阵），但总吞吐显著提升，是典型『吞吐换延迟』权衡；量化/投机解码则能在不增 batch 的情况下同时改善利用率与单请求延迟。需按 SLA 选手段。"
  ]
};
