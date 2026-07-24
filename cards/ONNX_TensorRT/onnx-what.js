export default {
  "kind": "concept",
  "id": "onnx-what",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "ONNX 是什么",
  "prompt": "ONNX 是什么，为什么推理部署要用它？",
  "quickAnswer": "ONNX(Open Neural Network Exchange)是一种开放的神经网络中间表示：把各框架(PyTorch/TF)训练好的模型导出成统一的计算图格式，从而与训练框架解耦，方便后续用 TensorRT 等高性能推理引擎加速，也便于跨平台/跨硬件部署。",
  "approach": "训练框架 → 导出 ONNX 图 → 推理引擎优化执行。",
  "explanationFocus": "是什么：ONNX 是开放的统一模型中间表示，解耦训练框架与推理引擎。",
  "bruteForce": "直接用 PyTorch eager 推理：无图优化、速度慢、依赖 Python 运行时。",
  "derivation": [
    "为什么需要：不同训练框架/部署硬件各搞一套，模型难移植；需要中立中间格式。",
    "怎么实现：框架提供导出器把计算图+权重写成 ONNX proto；推理端用 parser 读图并交给优化器/引擎。",
    "有什么代价：导出可能不支持动态控制流或自定义算子，需改写或写自定义 op；版本兼容性要小心。",
    "怎么评测：对比导出前后数值一致性（余弦相似度/最大误差），确保图等价。"
  ],
  "invariant": "ONNX 图在等价转换下数值结果应与原模型一致（误差在容忍内）。",
  "walkthrough": "PyTorch resnet 导出 onnx：torch.onnx.export(model, dummy, 'm.onnx')；用 onnxruntime 跑同输入对比原模型输出差 <1e-4。",
  "edgeCases": [
    "含 if/loop 动态控制流：需 scripting 或 opset 支持。",
    "自定义算子：导出为自定义 node，推理端需注册实现。",
    "opset 版本差异：老引擎不支持新 op。"
  ],
  "code": "# Python (概念)\ndef export_onnx(model, dummy_input, path):\n    import torch\n    torch.onnx.export(model, dummy_input, path,\n                      input_names=['x'], output_names=['y'],\n                      opset_version=17)",
  "codeNotes": [
    "opset 决定可用算子集合。",
    "动态维度用 dynamic_axes 指定。"
  ],
  "complexity": "导出 O(图规模)；推理加速另算。",
  "followUps": [
    {
      "question": "ONNX 和直接部署 PyTorch 比好在哪？",
      "answer": "解耦框架、可用 ONNX Runtime/TensorRT 做图优化与低精度加速，且不依赖 Python 运行时，延迟更低。"
    },
    {
      "question": "导出失败常见原因？",
      "answer": "动态控制流、未注册自定义算子、opset 不匹配、张量形状在导出期未知。"
    }
  ],
  "followUpAnswers": [
    "同输入对比数值一致性。",
    "opset 与自定义 op 是坑点。"
  ],
  "pitfalls": [
    "以为导出即优化——ONNX 只是中间表示，优化在后端引擎。",
    "忽略 opset/版本的兼容。"
  ],
  "beginnerSummary": "不同厂家的文档格式不互通，ONNX 像一种\"通用文档格式(PDF)\"，把 PyTorch 写的模型转成谁都能读的标准图，之后用专门的\"高速阅读器\"(TensorRT)打开就能跑得飞快，还不挑设备。",
  "prerequisites": [
    "模型本质是计算图+权重。",
    "训练框架与部署引擎常不同。",
    "需要中立中间表示做桥接。"
  ],
  "workedExample": [
    "PyTorch resnet → torch.onnx.export → m.onnx。",
    "onnxruntime 同输入对比误差 <1e-4。"
  ],
  "lineByLine": [
    "准备 dummy 输入定形状。",
    "调用导出器写出计算图。",
    "指定 input/output 名与 opset。",
    "用推理引擎加载验证一致性。"
  ],
  "diagram": "PyTorch/TF ─▶ ONNX(中间图) ─▶ ONNX Runtime / TensorRT\n            (解耦训练与部署)"
};
