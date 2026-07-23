export default {
  "kind": "concept",
  "id": "onnx-trt-optimizations",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "TensorRT 的主要优化",
  "prompt": "TensorRT 主要做了哪些优化（层融合/内核自动调优/显存优化）？",
  "quickAnswer": "TensorRT 核心优化有四类：层融合(把相邻算子合并减少 kernel 数与显存往返)、精度优化(FP16/INT8 量化)、内核自动调优(为每层选 GPU 上最快的 kernel 实现)、显存优化(复用/规划 tensor 生命周期降低占用与带宽)。",
  "approach": "解析图 → 应用 fusion 规则 → 选择精度 → 对每层调优 kernel → 规划显存 → 生成 engine。",
  "explanationFocus": "是什么：TRT 优化是把通用网络编译为 GPU 高效执行计划的一组图级与 kernel 级手段。",
  "bruteForce": "每层独立 kernel、全 FP32、各自分配显存：带宽与启动开销大。",
  "derivation": [
    "为什么需要：通用执行未利用 GPU 特性，存在大量冗余访存与未选优 kernel。",
    "怎么实现：融合规则改写图；精度转换改数据类型；调优在 build 期枚举 kernel 选最优；显存规划做 tensor 复用。",
    "有什么代价：调优耗时、精度下降需校准、融合规则维护成本。",
    "怎么评测：对比优化前后延迟/吞吐/显存与精度。"
  ],
  "invariant": "同精度优化后输出应在误差容忍内一致。",
  "walkthrough": "resnet 经融合后 kernel 数由 ~60 降到 ~20；FP16 使带宽减半；自动调优再省 15% 延迟。",
  "edgeCases": [
    "INT8 需校准集否则精度崩。",
    "动态 shape 下 kernel 选择更复杂。",
    "某些 op 无法融合需保持原样。"
  ],
  "code": "# Python (概念)：开启主要优化 flag\ndef configure_optimizations(builder):\n    config = builder.create_builder_config()\n    config.set_flag(trt.BuilderFlag.FP16)      # 精度优化\n    config.set_flag(trt.BuilderFlag.INT8)      # 需配合校准\n    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 1 << 30)  # 调优空间\n    return config",
  "codeNotes": [
    "workspace 越大可调优空间越多。",
    "INT8 必须提供校准器。"
  ],
  "complexity": "调优 O(build 期枚举)；推理显著变快。",
  "followUps": [
    {
      "question": "内核自动调优是什么？",
      "answer": "TRT 在 build 期为每个层枚举多种 kernel 实现并实测，选延迟最低的那个固化进 engine。"
    },
    {
      "question": "显存优化怎么做到？",
      "answer": "通过分析 tensor 生命周期做内存复用与统一规划，减少分配次数与峰值占用。"
    }
  ],
  "followUpAnswers": [
    "build 期实测选最快 kernel。",
    "tensor 生命周期复用降占用。"
  ],
  "pitfalls": [
    "以为开 FP16 一定更快——小模型可能被 launch 开销主导。",
    "忽略 workspace 限制导致调优不充分。"
  ],
  "beginnerSummary": "TRT 优化就像把零散工序合并、改用更小单位计量、为每个动作挑最快手法、并合理安排台面空间：合工序省搬运(融合)、小单位省材料(低精度)、挑手法提速(调优)、理台面省地方(显存)。",
  "prerequisites": [
    "GPU kernel 有多样实现。",
    "访存是推理瓶颈之一。",
    "精度可适度降低。"
  ],
  "workedExample": [
    "融合使 kernel 数 60→20。",
    "FP16 带宽减半；调优再省 15% 延迟。"
  ],
  "lineByLine": [
    "解析并匹配融合规则。",
    "按配置做精度转换。",
    "枚举 kernel 实测选最优。",
    "规划显存并序列化 engine。"
  ],
  "diagram": "通用图 ─▶[融合][量化][调优][显存规划]─▶ 高效 engine"
};
