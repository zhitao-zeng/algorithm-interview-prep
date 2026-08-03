export default {
  "id": "hw-benchmark",
  "category": "推理芯片适配",
  "difficulty": "Medium",
  "title": "算力 benchmark 与利用率",
  "prompt": "如何在一块国产推理芯片上正确测量模型利用率并定位瓶颈？",
  "quickAnswer": "先测峰值算力与实测吞吐，用 实测 TFLOPS / 峰值 TFLOPS 得到计算利用率；同时用 profiler 看 MTE 访存带宽占用判断是计算-bound 还是访存-bound。若利用率低，通常源于 kernel 未打满、形状未对齐或频繁 host 同步。",
  "approach": "用标准 benchmark 跑固定 shape 与 batch，记录延时与吞吐；结合硬件计数器(算力、带宽、占用率)。把实测与理论(算术强度×带宽)对比，用 Roofline 模型判断瓶颈类型，再针对性优化。",
  "explanationFocus": "是什么：算力 benchmark 与利用率评估是通过实测吞吐对比芯片峰值，量化模型在硬件上的效率，并定位计算或访存瓶颈。",
  "bruteForce": "只报告端到端 QPS，不拆解算力与带宽占用，无法判断优化方向，易被 launch 开销误导。",
  "invariant": "在相同输入 shape、精度与软件栈版本下，重复测量的吞吐应保持稳定(方差可控)，否则数据不可比。",
  "walkthrough": "某卡峰值 256 TFLOPS(FP16)，带宽 1TB/s。实测 ResNet50 batch=64 吞吐 9800 img/s，单次 2.2 GFLOP，实测 9800*2.2e9≈21.6 TFLOPS，利用率仅 8.4%。Roofline 显示算术强度低，属访存-bound，优化数据流水线后利用率升到 19%。",
  "code": "def compute_utilization(peak_tflops, imgs_per_s, gflop_per_img):\n    measured = imgs_per_s * gflop_per_img * 1e3  # TFLOPS\n    return measured / peak_tflops\n\nutil = compute_utilization(256, 9800, 2.2)  # -> 0.084",
  "complexity": "测量本身 O(样本数)，分析 O(1)；为得到稳定值需多轮预热与统计，时间随重复次数线性增长。",
  "beginnerSummary": "像测一台机器实际产出 vs 满负荷产能，算出开工率；再查是机器转得慢还是上料跟不上。",
  "diagram": "峰值 256 TFLOPS\n实测  21.6 TFLOPS (8.4%)\nRoofline: 低算术强度 -> 访存墙\n 优化数据通路 -> 48 TFLOPS (19%)",
  "derivation": [
    "为什么需要：只看 QPS 看不出硬件是否被用满，利用率揭示优化空间与瓶颈类型。",
    "怎么实现：固定 shape 跑 benchmark，读硬件计数器算实测算力/带宽，与峰值比得利用率，用 Roofline 定位。",
    "有什么代价：需可靠 profiler 与受控环境，测量本身有开销且受系统噪声干扰。",
    "怎么评测：以利用率、带宽占用、延时分布作为评估指标，对比优化前后。"
  ],
  "edgeCases": [
    "第一次运行含编译/预热，需丢弃否则低估吞吐。",
    "batch 过小 launch 开销占比高，利用率虚低。",
    "后台进程争抢带宽，导致测量结果抖动。"
  ],
  "pitfalls": [
    "用峰值厂商标称值直接除，忽略实际频率与功耗墙后的可用算力。",
    "把访存-bound 误当计算-bound，去做无意义的计算优化。"
  ],
  "prerequisites": [
    "FLOPS 与访存带宽概念",
    "Roofline 模型与算术强度",
    "硬件性能计数器使用"
  ],
  "workedExample": [
    "BERT-base batch=1 实测利用率 5%，属典型小 batch 访存-bound，增大 batch 到 32 升至 22%。",
    "某卷积因未对齐 32 字节，DMA 效率差，带宽利用率仅 40%，重排后到 85%。"
  ],
  "lineByLine": [
    "imgs_per_s * gflop_per_img 得到每秒实际浮点运算次数(转为 TFLOPS 需 ×1e3)。",
    "除以峰值得到计算利用率，反映硬件被用满的程度。",
    "若利用率低且算术强度低，结合 Roofline 判定为访存瓶颈而非算力不足。"
  ],
  "codeNotes": [
    "gflop_per_img 应来自模型真实 MAC 数，而非估算，否则利用率失真。"
  ],
  "followUps": [
    {
      "question": "利用率低一定是计算没打满吗？",
      "answer": "不一定，常见是访存-bound 或 kernel launch/同步开销大；需同时看带宽占用与 occupancy 才能下结论。"
    },
    {
      "question": "为什么厂商标称峰值很难达到？",
      "answer": "峰值假设 100% 单元占用且数据已在片上，真实算子形状、填充与流水线气泡使其通常只能到 30%-60%。"
    }
  ],
  "followUpAnswers": [
    "不一定，常见是访存-bound 或 kernel launch/同步开销大；需同时看带宽占用与 occupancy 才能下结论。",
    "峰值假设 100% 单元占用且数据已在片上，真实算子形状、填充与流水线气泡使其通常只能到 30%-60%。"
  ],
  "kind": "concept"
};
