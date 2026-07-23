export default {
  "kind": "concept",
  "id": "onnx-dynamic-batch-shape",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "动态 batch 与动态 shape 实战",
  "prompt": "动态 batch / 动态 shape 在实战中要注意哪些要点？",
  "quickAnswer": "实战要点：①用 OptimizationProfile 设 batch 与分辨率的 min/opt/max；②opt 取典型负载形状以拿到最佳 kernel；③运行时必须 set_input_shape 且与分配 buffer 大小匹配；④超出 max 的请求要拒绝或回退；⑤若多档负载差异大，可建多个 profile 或分桶(bucketing)以平衡性能。",
  "approach": "定负载分布 → 设 profile(min/opt/max) → build → 运行时按请求形状 set_input_shape → 校验边界。",
  "explanationFocus": "是什么：动态 batch/shape 实战指在生产中安全使用可变输入维度并维持性能的落地要点。",
  "bruteForce": "为每档 batch 各建 engine：内存与维护爆炸。",
  "derivation": [
    "为什么需要：线上请求 batch 与尺寸随机，固定 shape 浪费或受限。",
    "怎么实现：profile 覆盖常用范围；分桶对离散档各自优化；运行时动态设形状。",
    "有什么代价：范围/opt 选错性能劣化；分桶增加 build 数。",
    "怎么评测：在典型与边界形状上测延迟/p99，验证不超 max。"
  ],
  "invariant": "任意在范围内请求输出应正确且延迟可接受。",
  "walkthrough": "服务 batch 1–16、分辨率 224/384：设两档 profile，opt 取 batch8/384，p99 延迟稳定且不超过 SLA。",
  "edgeCases": [
    "opt 偏离真实分布→长尾慢。",
    "请求超 max 需快速拒绝。",
    "buffer 大小须按 max 预分配。"
  ],
  "code": "# Python：运行时按请求设动态形状\ndef infer(context, engine, x, stream):\n    import numpy as np\n    shape = (x.shape[0], 3, x.shape[2], x.shape[3])\n    context.set_input_shape('input', shape)          # 实际 batch/尺寸\n    buf = np.empty(engine.get_binding_shape(0) if False else shape, dtype=np.float32)\n    # 实际按 max 预分配并拷贝 x\n    context.execute_async_v3(stream_handle=stream)",
  "codeNotes": [
    "shape 必须≤profile max。",
    "buffer 建议按 max 预分配。"
  ],
  "complexity": "build 随 profile 数增加；推理灵活。",
  "followUps": [
    {
      "question": "分桶(bucketing)是什么？",
      "answer": "对离散的几档形状各设 profile/build，运行时按最近档路由，兼顾灵活与性能。"
    },
    {
      "question": "opt 怎么选最稳？",
      "answer": "取线上真实流量中最常见的形状作为 opt，使多数请求命中最优 kernel。"
    }
  ],
  "followUpAnswers": [
    "分桶按离散档各自优化。",
    "opt 取典型流量形状。"
  ],
  "pitfalls": [
    "opt 拍脑袋设错导致整体偏慢。",
    "运行时形状超 max 未校验直接崩。"
  ],
  "beginnerSummary": "动态 batch 像电梯：你先告诉厂家最常见的载客量(opt)和最多能载多少(max)；用的时候按实际人数调度。要是常载的人和\"最舒服人数\"差太多，电梯跑得就没那么顺；人超了上限就得拦下。",
  "prerequisites": [
    "线上输入维度多变。",
    "profile 决定调优基准。",
    "buffer 需匹配形状。"
  ],
  "workedExample": [
    "batch 1–16、分辨率两档设 profile。",
    "opt=batch8，p99 稳定不超 SLA。"
  ],
  "lineByLine": [
    "分析负载分布定范围。",
    "设 min/opt/max profile。",
    "运行时 set_input_shape。",
    "校验不超 max 并预分配 buffer。"
  ],
  "diagram": "负载分布 ─▶ profile(min/opt/max) ─▶ 运行时 set_input_shape"
};
