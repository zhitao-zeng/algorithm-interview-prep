export default {
  "id": "ir-cuda-graph",
  "category": "推理框架",
  "difficulty": "Medium",
  "title": "CUDA Graph 加速",
  "prompt": "CUDA Graph 如何通过捕获并重放 kernel 序列来降低 LLM 小批次 decode 的 CPU 开销？",
  "quickAnswer": "把固定结构的 kernel 调用序列录制为图，重放时一次性提交给 GPU，省去每个 kernel 的 CPU 启动与 Python 调度开销。",
  "approach": "在 warmup 阶段用 cudaStreamCapture 录制 decode 一步的 kernel 图；正式推理时只更新输入张量并 graph.replay()，跳过逐 kernel 的 CPU 发射。",
  "explanationFocus": "是什么：CUDA Graph 是 NVIDIA 提供的机制，将一串 GPU kernel 及其依赖捕获成有向图，之后以单次调用重放整图，从而避免每步由 CPU 逐个启动 kernel 的开销。",
  "bruteForce": "朴素做法：每步 decode 由 CPU 逐 kernel 下发（launch），kernel 很小但 launch 开销占比高，CPU 成为瓶颈、GPU 空转。",
  "invariant": "不变式：被捕获的 kernel 序列结构与张量形状在重放时保持不变，只有输入/参数显存地址可更新。",
  "walkthrough": "执行追踪：首次录制时开启 stream capture，跑一遍 decode 前向得到图；之后每步 graph.replay()，GPU 自行按图执行，CPU 仅做地址更新。",
  "complexity": "说明：每步 CPU 开销从 O(kernel 数) 降到 O(1) 重放调用；代价是图结构必须静态、动态形状/分支难支持，需配合固定 batch 与 padded kernel。",
  "beginnerSummary": "小批次 decode 时 CPU 发指令比 GPU 算得还慢。CUDA Graph 把一连串指令录成\"录像\"，以后一遍重放，CPU 几乎不干活。",
  "diagram": "普通: CPU->launch k1->launch k2->...->launch kN  (慢)\nGraph: CPU->replay(graph) 一次提交整图       (快)",
  "code": "def capture_graph(model, example):\n    with torch.cuda.graph(static_graph):\n        out = model(example)          # 录制 kernel 序列\n    return static_graph\n\ndef replay(graph, inputs):\n    graph.set_input(inputs)\n    graph.replay()                    # 固定 kernel 序列，省 CPU 启动开销",
  "derivation": [
    "为什么需要：decode 步 batch 小、kernel 多而轻，CPU 逐个 launch 的开销超过计算本身，GPU 利用率被 CPU 拖累。",
    "怎么实现：用 stream capture 录制一次完整 decode 前向为 CUDA Graph；后续每步只更新输入显存并 graph.replay()，由 GPU 按录制顺序执行。",
    "有什么代价：图要求 kernel 序列与形状静态，不支持动态控制流；变长 batch 需 padding 到固定大小，可能浪费算力。",
    "怎么评测：对比开启前后单步 decode 延迟与最大可持续 QPS，观察 CPU 占用率下降与 GPU 利用率上升。"
  ],
  "edgeCases": [
    "batch 大小变化需多张不同形状的图或 padding 到上限。",
    "含动态分支（如早停、条件路由）的模型难以整体捕获。",
    "图内不能含 CPU 同步或异步拷贝，否则捕获失败。",
    "输入张量必须在图生命周期内保持地址稳定（用固定 buffer）。"
  ],
  "pitfalls": [
    "在图里引入动态形状导致捕获/重放形状不一致而报错。",
    "忽略输入 buffer 复用，重放时写入了错误地址的数据。"
  ],
  "prerequisites": [
    "GPU kernel 启动开销与 CUDA stream 概念",
    "LLM decode 单步前向执行流程"
  ],
  "workedExample": [
    "batch=1、seq 步的 decode 含 50+ 小 kernel：CPU launch 开销约占总步时间一半；用 CUDA Graph 后单步延迟下降数倍。",
    "变长请求 padding 到固定 8 并发后录制一张图，所有请求复用该图重放。"
  ],
  "lineByLine": [
    "torch.cuda.graph 进入捕获模式，期间 model 调用被记录为节点而非立即执行。",
    "example 提供形状模板，决定图中张量维度。",
    "graph.replay() 一次性把整图提交给 GPU，省去逐 kernel 的 CPU 发射。"
  ],
  "codeNotes": [
    "生产推理常配合固定大小 workspace 与 in-place 更新，确保重放时显存地址不变，避免重新捕获。"
  ],
  "followUps": [
    {
      "question": "CUDA Graph 与 continuous batching 冲突吗？",
      "answer": "部分冲突：连续批的 batch 形状每步变化，需用上限 padding 或多图策略；许多框架对 decode 用固定形状图、对 prefill 单独处理。"
    },
    {
      "question": "哪些算子不适合放进 CUDA Graph？",
      "answer": "含 CPU 同步、动态形状、条件分支或主机端回调的算子不适合，需用非图路径或改写为静态形状。"
    }
  ],
  "followUpAnswers": [
    "部分冲突：连续批的 batch 形状每步变化，需用上限 padding 或多图策略；许多框架对 decode 用固定形状图、对 prefill 单独处理。",
    "含 CPU 同步、动态形状、条件分支或主机端回调的算子不适合，需用非图路径或改写为静态形状。"
  ],
  "kind": "concept"
};
