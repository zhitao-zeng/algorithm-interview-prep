export default {
  "kind": "concept",
  "id": "onnx-evaluate-trt-speedup",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "评测 TRT 加速收益",
  "prompt": "如何科学地评测 TensorRT 的加速收益，避免被假象误导？",
  "quickAnswer": "科学评测须控制变量：同硬件、同输入分布、同精度语义；报告预热后平均与 p99 延迟、吞吐(QPS)、以及精度指标(与原模型对齐)；并区分\"能跑\"与\"生产可用\"(稳定性、显存、长尾)。常见误导是未预热、混精度、单次计时或只测小 batch。",
  "approach": "固定环境 → 预热 → 多轮计时取 p50/p99 与吞吐 → 精度回归 → 与 baseline 同条件对比。",
  "explanationFocus": "是什么：评测 TRT 加速收益是用可控基准量化延迟/吞吐提升并确认精度不退化。",
  "bruteForce": "跑一次看时间差：受噪声与精度混淆误导。",
  "derivation": [
    "为什么需要：加速数字若不严谨会被夸大或误判，影响上线决策。",
    "怎么实现：用统一 bench 脚本，固定 batch/数据/精度，记录分布与显存。",
    "有什么代价：需多轮与多形状，耗时但必要。",
    "怎么评测：给出加速比、p99、吞吐与精度掉点，并说明测试条件。"
  ],
  "invariant": "在相同条件下，TRT 相对 baseline 的加速应可复现。",
  "walkthrough": "resnet50 batch8 T4：eager 18ms vs TRT FP16 3.1ms(p99)，吞吐 6×，top-1 误差 <0.1%。",
  "edgeCases": [
    "GPU 功耗/频率波动影响计时。",
    "只测 p50 忽略长尾 p99。",
    "精度对齐要用验证集而非单样本。"
  ],
  "code": "# Python：严谨基准(含 p99)\ndef benchmark(fn, inp, warmup=20, iters=200):\n    import time, numpy as np\n    for _ in range(warmup): fn(inp)\n    ts = []\n    for _ in range(iters):\n        t0 = time.perf_counter(); fn(inp); ts.append(time.perf_counter()-t0)\n    a = np.array(ts)*1000\n    return a.mean(), np.percentile(a, 99)",
  "codeNotes": [
    "报告 p99 比均值更贴近 SLA。",
    "warmup 消除首帧偏差。"
  ],
  "complexity": "基准 O(iters×单次)；一次性。",
  "followUps": [
    {
      "question": "为什么只看平均延迟不够？",
      "answer": "平均掩盖长尾，线上 SLA 常看 p99，偶发慢帧更影响体验。"
    },
    {
      "question": "加速比怎么算才公平？",
      "answer": "同硬件同精度同输入分布下，baseline 与 TRT 各取稳定 p50/p99 比对，并附精度对齐。"
    }
  ],
  "followUpAnswers": [
    "p99 关乎 SLA 长尾。",
    "同条件比对才算公平。"
  ],
  "pitfalls": [
    "未预热/单次计时得出夸张加速。",
    "混用精度(如 FP32 vs INT8)比延迟。"
  ],
  "beginnerSummary": "评测加速像比赛跑步：得在同一条跑道(硬件)、同样的负重(精度)、多跑几趟取稳定成绩，还得看最慢那趟(p99)而不是只取平均；否则容易把\"顺风那一趟\"当成真实水平。",
  "prerequisites": [
    "加速需可复现。",
    "变量须受控。",
    "精度不可牺牲。"
  ],
  "workedExample": [
    "resnet50 batch8 T4 严谨基准。",
    "TRT FP16 p99 3.1ms，吞吐 6×，精度掉 <0.1%。"
  ],
  "lineByLine": [
    "固定硬件与精度。",
    "充分预热。",
    "多轮计时取 p50/p99 与吞吐。",
    "验证集确认精度对齐。"
  ],
  "diagram": "baseline ─▶ 同条件 bench ─▶ TRT\n报告: p50/p99 / 吞吐 / 精度"
};
