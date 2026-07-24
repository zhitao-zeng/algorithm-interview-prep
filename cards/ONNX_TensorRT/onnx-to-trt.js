export default {
  "kind": "concept",
  "id": "onnx-to-trt",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "ONNX → TensorRT 转换链路",
  "prompt": "从 ONNX 转换到 TensorRT 的完整链路是什么，各环节做什么？",
  "quickAnswer": "链路为：ONNX 模型 → ONNX Parser 解析为 TRT NetworkDefinition(图与权重) → 图优化(融合/常量折叠) → 精度配置(FP16/INT8+校准) → Builder 在该网络与配置上 build 出 engine → 序列化；每一环都可能因不支持 op/形状问题失败，需逐一排查。",
  "approach": "导出合规 ONNX → Parser 读图 → 优化+量化 → build engine → 部署。",
  "explanationFocus": "是什么：ONNX→TRT 是把开放中间图编译进 NVIDIA 专属优化引擎的端到端链路。",
  "bruteForce": "跳过 ONNX 直接用框架推理：无 TRT 优化。",
  "derivation": [
    "为什么需要：统一用 ONNX 做桥梁，避免每个框架写专门导入器。",
    "怎么实现：OnnxParser 调 ONNX 库解析 proto 填充 NetworkDefinition；其后走标准 TRT 优化。",
    "有什么代价：解析失败常因 op 不支持/版本错；需 plugin 或改图兜底。",
    "怎么评测：对比 TRT 与 ONNX Runtime 同输入输出误差与延迟。"
  ],
  "invariant": "链路末端 engine 输出应与原 ONNX 在误差内一致。",
  "walkthrough": "yolov8 onnx → OnnxParser → FP16 build → 与 ORT 输出 IoU>0.999，延迟降 3×。",
  "edgeCases": [
    "解析报 Unsupported operator：需 plugin 或简化图。",
    "opset 过高 TRT 不支持：降级导出。",
    "权重常量未嵌入：确保 export 包含权重。"
  ],
  "code": "# Python：ONNX → TRT 解析骨架\ndef onnx_to_trt(onnx_path):\n    import tensorrt as trt\n    logger = trt.Logger()\n    builder = trt.Builder(logger)\n    net = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))\n    parser = trt.OnnxParser(net, logger)\n    with open(onnx_path, 'rb') as f:\n        parser.parse(f.read())          # 填充 NetworkDefinition\n    for i in range(parser.num_errors):\n        print(parser.get_error(i))\n    return builder, net",
  "codeNotes": [
    "parse 后务必检查 num_errors。",
    "权重随 proto 一起读入。"
  ],
  "complexity": "解析 O(图规模)；优化另计。",
  "followUps": [
    {
      "question": "解析报错 Unsupported operator 怎么办？",
      "answer": "要么把该算子改写为标准 op 组合，要么为它写 TRT plugin 注册。"
    },
    {
      "question": "能直接从 PyTorch 到 TRT 吗？",
      "answer": "通常经 ONNX 中转最稳；也有 torch2trt 类直接路径但覆盖有限。"
    }
  ],
  "followUpAnswers": [
    "不支持 op 靠改写或 plugin。",
    "ONNX 中转最通用。"
  ],
  "pitfalls": [
    "解析后不看 errors 直接 build——掩盖了失败。",
    "ONNX opset 与 TRT 支持不匹配。"
  ],
  "beginnerSummary": "ONNX→TRT 像把\"通用图纸(ONNX)\"交给专厂(TRT)：专厂读图、重排工序、挑最快手法做出专属流水线(engine)。中间若发现图纸上有专厂不认识的零件，就得要么改图纸要么另做配件。",
  "prerequisites": [
    "ONNX 是中间桥梁。",
    "TRT 用 NetworkDefinition 表示图。",
    "解析可能因 op 失败。"
  ],
  "workedExample": [
    "yolov8 onnx 经 OnnxParser 解析。",
    "FP16 build 后 IoU>0.999，延迟降 3×。"
  ],
  "lineByLine": [
    "读 ONNX 文件字节流。",
    "OnnxParser 填充 NetworkDefinition。",
    "检查并打印解析错误。",
    "交 Builder 优化生成 engine。"
  ],
  "diagram": "ONNX ─▶ OnnxParser ─▶ NetworkDef ─▶ Optimizer ─▶ Engine"
};
