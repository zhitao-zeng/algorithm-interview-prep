export default {
  "kind": "concept",
  "id": "onnx-trt-what",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "TensorRT 是什么",
  "prompt": "TensorRT 是什么，为什么 NVIDIA GPU 推理要用它？",
  "quickAnswer": "TensorRT 是 NVIDIA 的高性能推理优化 SDK/运行时：它把训练好的网络(如 ONNX)解析成图，做层融合、精度校准(FP16/INT8)、内核自动调优与显存优化，生成高度优化的推理引擎(engine)，从而在 NVIDIA GPU 上显著降低延迟、提升吞吐。",
  "approach": "ONNX → TensorRT 解析 → 图优化+量化 → build engine → 运行时执行。",
  "explanationFocus": "是什么：TensorRT 是面向 NVIDIA GPU 的推理优化引擎与运行时，把通用图编译成 GPU 高效的执行计划。",
  "bruteForce": "在 GPU 上逐算子调原生 kernel：无融合、全 FP32、未选最优 kernel。",
  "derivation": [
    "为什么需要：训练框架推理路径重、难榨干 GPU 算力，且 FP32 显存/带宽浪费。",
    "怎么实现：读入网络定义，做图优化、精度转换、kernel 调优，再序列化 engine。",
    "有什么代价：build 耗时、绑定特定 GPU 架构、INT8 需校准集。",
    "怎么评测：同输入对比精度，测端到端延迟与吞吐相对原框架提升。"
  ],
  "invariant": "优化后(同精度)输出应与原模型在误差容忍内一致。",
  "walkthrough": "resnet50 ONNX 经 TRT FP16 build：延迟从 eager 的 12ms 降到 3ms，吞吐约 4 倍。",
  "edgeCases": [
    "engine 与 GPU 架构(sm 版本)绑定，换卡需重建。",
    "不支持的算子需 plugin。",
    "动态 shape 需设优化剖面(profile)。"
  ],
  "code": "# Python (概念)：构建 TRT engine\ndef build_engine(onnx_path, engine_path, fp16=True):\n    import tensorrt as trt\n    logger = trt.Logger(trt.Logger.WARNING)\n    builder = trt.Builder(logger)\n    net = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))\n    parser = trt.OnnxParser(net, logger)\n    parser.parse_from_file(onnx_path)\n    config = builder.create_builder_config()\n    if fp16: config.set_flag(trt.BuilderFlag.FP16)\n    engine = builder.build_serialized_network(net, config)\n    open(engine_path, 'wb').write(engine)",
  "codeNotes": [
    "build 是离线一次性的重操作。",
    "engine 序列化后按卡架构加载。"
  ],
  "complexity": "build O(图规模×调优)；推理 O(原图)。",
  "followUps": [
    {
      "question": "TRT 比 ONNX Runtime 快在哪？",
      "answer": "TRT 做更深入的层融合、GPU 专属 kernel 调优与低精度量化，而 ORT 更通用跨平台。"
    },
    {
      "question": "engine 能跨 GPU 用吗？",
      "answer": "不能，engine 针对特定 compute capability 构建，换架构需重新 build。"
    }
  ],
  "followUpAnswers": [
    "TRT 深入 GPU 专属优化。",
    "engine 绑定 sm 版本。"
  ],
  "pitfalls": [
    "以为 engine 可跨显卡通用——它绑定 GPU 架构。",
    "把 build 放线上——应在离线/构建期完成。"
  ],
  "beginnerSummary": "TensorRT 像一个\"GPU 专用编译器\"：你把通用菜谱(ONNX)交给它，它把几道工序并成一道、换用更小巧的计量单位(低精度)、挑出最快的火候方案，最后给你一份专门在这台灶台上最快的执行计划(engine)。",
  "prerequisites": [
    "推理追求低延迟高吞吐。",
    "GPU kernel 有不同实现可选。",
    "精度可降低以换速度。"
  ],
  "workedExample": [
    "resnet50 onnx → TRT FP16 build。",
    "延迟 12ms→3ms，吞吐约 4 倍。"
  ],
  "lineByLine": [
    "创建 builder 与网络定义。",
    "用 OnnxParser 读入图。",
    "开 FP16 flag 并 build 序列化。",
    "写入 engine 文件供运行时加载。"
  ],
  "diagram": "ONNX ─▶ Parser ─▶ Optimizer(融合/量化) ─▶ Engine ─▶ GPU 执行"
};
