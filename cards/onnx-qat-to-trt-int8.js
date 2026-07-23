export default {
  "kind": "concept",
  "id": "onnx-qat-to-trt-int8",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "量化感知部署",
  "prompt": "量化感知训练（QAT）后再部署到 TensorRT INT8 的流程是什么？",
  "quickAnswer": "QAT 在训练时模拟量化误差让网络适应低精度；流程为：用伪量化(fake quant)节点训练 → 导出含 Q/DQ(Quantize/Dequantize)节点的 ONNX → TRT 识别 Q/DQ 直接采用训练得到的 scale 做 INT8，免去 PTQ 校准、精度更稳，尤其适合敏感模型。",
  "approach": "QAT 训练(插 fake quant) → 导出带 Q/DQ 的 ONNX → TRT 解析并走 INT8 路径(用已有 scale) → build engine。",
  "explanationFocus": "是什么：QAT→TRT INT8 是用训练期确定的量化参数部署 INT8，避免 PTQ 校准误差。",
  "bruteForce": "PTQ 直接校准：对量化敏感模型精度掉点多。",
  "derivation": [
    "为什么需要：部分模型 PTQ 掉点严重，QAT 通过训练补偿。",
    "怎么实现：训练插伪量化节点学 scale；导出 ONNX 表现为 Q/DQ 对；TRT 据 Q/DQ 决定量化点。",
    "有什么代价：需重训/微调、流程更长；Q/DQ 放置影响结果。",
    "怎么评测：对比 QAT-INT8 与 FP32 精度，应明显优于 PTQ-INT8。"
  ],
  "invariant": "QAT-INT8 精度应接近 FP32 且优于 PTQ-INT8。",
  "walkthrough": "检测模型 QAT 后导出 Q/DQ ONNX：TRT INT8 mAP 较 PTQ 高 1.2%，几乎无损 FP32。",
  "edgeCases": [
    "Q/DQ 节点放置位置决定量化粒度。",
    "导出需保留 Q/DQ 不被优化掉。",
    "训练与部署的量化公式须一致。"
  ],
  "code": "# Python (概念)：QAT 导出后 TRT 识别 Q/DQ\ndef build_qat_int8(onnx_path):\n    import tensorrt as trt\n    builder = trt.Builder(trt.Logger())\n    net = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))\n    parser = trt.OnnxParser(net, trt.Logger())\n    parser.parse_from_file(onnx_path)   # 含 Q/DQ 节点\n    cfg = builder.create_builder_config()\n    cfg.set_flag(trt.BuilderFlag.INT8)  # 直接用 Q/DQ 中的 scale\n    return builder.build_serialized_network(net, cfg)",
  "codeNotes": [
    "Q/DQ 自带 scale，无需校准器。",
    "导出别让框架把 Q/DQ 折叠掉。"
  ],
  "complexity": "训练成本最高；部署与 PTQ 类似。",
  "followUps": [
    {
      "question": "QAT 和 PTQ 怎么选？",
      "answer": "对量化敏感或精度要求高的模型用 QAT；否则 PTQ 更快更省事。"
    },
    {
      "question": "为什么 Q/DQ 节点重要？",
      "answer": "它显式标出量化/反量化点及 scale，TRT 据此精确安排 INT8 计算而不必猜测范围。"
    }
  ],
  "followUpAnswers": [
    "敏感模型选 QAT。",
    "Q/DQ 提供现成 scale。"
  ],
  "pitfalls": [
    "导出时 Q/DQ 被优化器误删——scale 丢失。",
    "训练与部署量化公式不一致导致误差。"
  ],
  "beginnerSummary": "PTQ 是事后拿样品估刻度，QAT 是做菜时 preted 戴上\"粗刻度眼镜\"练习，让菜本身适应粗刻度；端上桌(部署)时直接按那副眼镜的刻度做，味道比事后估的更准。",
  "prerequisites": [
    "量化会引入误差。",
    "QAT 用伪量化模拟。",
    "ONNX 用 Q/DQ 表达量化。"
  ],
  "workedExample": [
    "检测模型 QAT 训练插 fake quant。",
    "导出 Q/DQ ONNX → TRT INT8，mAP 比 PTQ 高 1.2%。"
  ],
  "lineByLine": [
    "训练中插入伪量化节点。",
    "导出含 Q/DQ 的 ONNX。",
    "TRT 解析并用其中 scale。",
    "build INT8 engine 部署。"
  ],
  "diagram": "QAT训练(伪量化) ─▶ Q/DQ ONNX ─▶ TRT INT8(用训练scale)"
};
