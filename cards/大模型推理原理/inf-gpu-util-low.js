export default {
  "kind": "concept",
  "id": "inf-gpu-util-low",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Decode 阶段 GPU 利用率不高",
  "prompt": "为什么大模型 Decode 阶段 GPU 利用率可能不高？",
  "quickAnswer": "Decode 每步只对 1 个新 token 做矩阵乘，计算量极小，却要把整个模型权重和 KV Cache 从显存搬进计算单元。因为“算得少、搬得多”，GPU 算力大部分时间在等数据，SM 占用率低、利用率上不去——这是 Memory Bound 的典型表现，不是算力不够。",
  "approach": "Decode 利用率低 = 带宽瓶颈：计算量少，等权重/KV 搬运。",
  "explanationFocus": "是什么：Decode 每步计算量远低于可提供的算力，瓶颈在显存带宽，故 GPU 利用率低。",
  "bruteForce": "盲目换更大算力 GPU → 利用率依旧低，钱白花。",
  "derivation": [
    "为什么需要：要理解“利用率低”的根因才能对症优化，否则乱加卡。",
    "怎么实现：每 Decode 步算 (1,d)×(d,d) 的小矩阵，FLOPs≈d²，但要先把 d² 权重从 HBM 搬上来。",
    "有什么代价：直接加算力无用；要做的是减搬运（量化、KV 压缩）或增有效计算（更大 batch、投机解码）。",
    "怎么评测：看 nvidia-smi 的 GPU-Util 与 SM 占用、HBM 带宽利用率、kernel 时间占比。"
  ],
  "invariant": "Decode 步的计算/搬运比（Arithmetic Intensity）固定远低于硬件拐点。",
  "walkthrough": "d=4096 的线性层：算出 33.6M FLOPs（2·d²），但要搬 16M 参数×2 字节=32MB；A100 带宽 2TB/s 搬 32MB 要 16μs，而算力算 16M FLOPs 只要 ~0.01μs——绝大多数时间在搬。",
  "edgeCases": [
    "极小模型：可能被算力或 launch 开销主导，未必纯带宽。",
    "投机解码：每步验证多 token，AI 抬高，利用率上升。",
    "极大 batch：矩阵变胖，利用率可显著改善。"
  ],
  "code": "# Python\ndef decode_busy_ratio(flops, compute_tflops, bytes_moved, bw_tbs):\n    compute_time = flops / (compute_tflops * 1e12)\n    mem_time = bytes_moved / (bw_tbs * 1e12)\n    return compute_time / (compute_time + mem_time)  # 越接近0越 memory-bound",
  "codeNotes": [
    "GPU-Util 高不等于高效：也可能是算无用功。",
    "HBM 带宽利用率比 SM 占用更能说明 Decode 瓶颈。"
  ],
  "complexity": "单步 O(d²) 计算 vs O(d²) 字节搬运；比值恒定，与序列无关。",
  "followUps": [
    {
      "question": "利用率低要不要换更大算力卡？",
      "answer": "通常没用。Decode 卡在带宽，换算力更高的卡带宽未必同比例提升；应优先减搬运（量化/KV 压缩）或增 batch/投机解码。"
    },
    {
      "question": "怎么确认是 Memory Bound？",
      "answer": "算 Arithmetic Intensity 对比硬件拐点（算力 TFLOPS/带宽 TB/s）；低于拐点即 memory-bound，nvidia-smi 看到高带宽利用率+低 SM 占用也佐证。"
    }
  ],
  "followUpAnswers": [
    "用 roofline 拐点判断。",
    "优先量化权重与压缩 KV。"
  ],
  "pitfalls": [
    "看到利用率低就加算力（方向错）。",
    "把 GPU-Util 高误判为健康。"
  ],
  "beginnerSummary": "GPU 像超级工人，但每次只让你写一字，却要他把整座图书馆（模型权重）从仓库（显存）搬到工作台。工人大部分时间在等书送来，而不是在写字——所以“工人很闲”（利用率低）不是因为笨，是因为被取书卡住了。治法是少搬书（量化/压缩）或一次多派几个人一起写（大 batch）。",
  "prerequisites": [
    "Decode 每次只算 1 个 token。",
    "算得少，但要搬全部权重。",
    "显存带宽比算力更易成为瓶颈。"
  ],
  "workedExample": [
    "d=4096 层：算 ~33.6M FLOPs 用 ~0.108μs（312 TFLOPS 下），搬 32MB 用 ~16μs → 仍主要被带宽限制（计算占比很小）。",
    "量化到 INT8 权重减半 → 搬运减半 → 利用率近似翻倍。"
  ],
  "lineByLine": [
    "Decode 每步计算量极小。",
    "但每步要读全量权重+KV。",
    "算得少、搬得多 → Memory Bound。",
    "利用率低因在等显存，非算力不足。"
  ],
  "diagram": "GPU SM (算力)  ←── 等数据 ──  HBM(显存)\n  计算 0.01μs  vs  搬运 16μs\n  → 99.9% 时间在等带宽"
};
