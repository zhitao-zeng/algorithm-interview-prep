export default {
  "kind": "concept",
  "id": "onnx-trt-latency-compare",
  "category": "ONNX/TensorRT",
  "difficulty": "Easy",
  "title": "推理延迟对比",
  "prompt": "PyTorch eager 推理和 TensorRT 推理在延迟上通常差多少，为什么？",
  "quickAnswer": "TensorRT 通常比 PyTorch eager 快数倍：eager 逐算子 Python 调度+无融合+FP32，而 TRT 做层融合、FP16/INT8 与 GPU kernel 调优，并去掉 Python 开销；典型 CNN 可达 3–10×，具体取决于模型与硬件。",
  "approach": "同一输入分别用 eager 与 TRT engine 计时(预热后取中位数) → 对比延迟与吞吐。",
  "explanationFocus": "是什么：推理延迟对比是衡量 TRT 相对原生框架加速收益的基本手段。",
  "bruteForce": "只看单次随意计时：受预热/噪声影响不可靠。",
  "derivation": [
    "为什么需要：部署要量化加速收益与是否值得引入 TRT。",
    "怎么实现：固定输入、预热若干次、取稳定后多次耗时中位数与 p99。",
    "有什么代价：需同硬件、同 batch、同精度才有可比性。",
    "怎么评测：报告平均/p99 延迟与吞吐(QPS)，并确认精度一致。"
  ],
  "invariant": "对比须在同一输入分布与精度语义下才公平。",
  "walkthrough": "resnet50 batch=8：eager 18ms vs TRT FP16 3ms ≈ 6×；吞吐 55→330 img/s。",
  "edgeCases": [
    "小 batch 时 Python 开销占比高，TRT 收益更明显。",
    "CPU 绑定算子会拖慢整体。",
    "未预热导致首帧异常慢。"
  ],
  "code": "# Python：等价的延迟基准测试\ndef bench(fn, inp, warmup=10, iters=100):\n    import time\n    for _ in range(warmup): fn(inp)\n    t0 = time.perf_counter()\n    for _ in range(iters): fn(inp)\n    return (time.perf_counter() - t0) / iters * 1000  # ms",
  "codeNotes": [
    "必须预热消除首帧开销。",
    "取中位数比均值更稳。"
  ],
  "complexity": "基准 O(iters×单次)；一次性。",
  "followUps": [
    {
      "question": "为什么小 batch 加速比更大？",
      "answer": "小 batch 时固定 Python/调度开销占比高，TRT 消除这些开销收益更显著。"
    },
    {
      "question": "吞吐和延迟哪个更该看？",
      "answer": "在线服务看延迟(p99)，离线批处理看吞吐(QPS)，两者都报更稳。"
    }
  ],
  "followUpAnswers": [
    "小 batch 固定开销占比高。",
    "在线看延迟、离线看吞吐。"
  ],
  "pitfalls": [
    "不预热直接计时——首帧误导。",
    "不同精度/bench 下直接比——不公平。"
  ],
  "beginnerSummary": "eager 像手工一步步做还边做边翻说明书(Python 调度)，TRT 像把流程排练成流水线一气呵成；同样的菜，后者快好几倍。但要比就得同条件比，不能一个用大火一个用小火。",
  "prerequisites": [
    "延迟受调度与融合影响。",
    "低精度可提速。",
    "计时需排除噪声。"
  ],
  "workedExample": [
    "resnet50 batch8：eager 18ms vs TRT 3ms。",
    "吞吐 55→330 img/s，约 6×。"
  ],
  "lineByLine": [
    "固定输入与硬件。",
    "预热若干次。",
    "多次计时取中位数/p99。",
    "同精度下对比 eager 与 TRT。"
  ],
  "diagram": "eager: 逐算子+Python  ─▶ 慢\nTRT:   融合+低精度+调优 ─▶ 快 (3~10x)"
};
