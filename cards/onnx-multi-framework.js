export default {
  "kind": "concept",
  "id": "onnx-multi-framework",
  "category": "ONNX/TensorRT",
  "difficulty": "Easy",
  "title": "多框架统一到 ONNX",
  "prompt": "为什么要把 TensorFlow / PyTorch 等模型统一导出到 ONNX 再部署？",
  "quickAnswer": "统一到 ONNX 可让下游部署链路(解析、优化、引擎)只写一套：训练侧无论 PyTorch/TF/JAX，只要能导出 ONNX，就能走同一条 ONNX→TensorRT/ORT 的部署流水线，降低维护成本、避免为每个框架单独适配推理后端。",
  "approach": "各框架导出 ONNX → 统一校验与优化 → 共享推理后端部署。",
  "explanationFocus": "是什么：多框架统一指把不同训练框架的模型都转成 ONNX，以复用同一套部署工具链。",
  "bruteForce": "为每个框架各写一套推理适配：重复劳动、易不一致。",
  "derivation": [
    "为什么需要：团队/历史模型可能跨框架，后端适配成本高。",
    "怎么实现：PyTorch 用 torch.onnx.export，TF 用 tf2onnx，均产出 ONNX。",
    "有什么代价：各导出器对算子/版本支持不同，可能有坑需对齐。",
    "怎么评测：各框架导出的 ONNX 与各自原模型精度对齐，且能顺利进 TRT。"
  ],
  "invariant": "任一框架导出的 ONNX 都应与原模型数值等价。",
  "walkthrough": "同一 resnet：PyTorch 与 TF 各导出 ONNX，二者输出余弦相似度 >0.9999，共用同一 TRT engine 流程。",
  "edgeCases": [
    "TF 的 NHWC 与 ONNX 的 NCHW 需转置处理。",
    "tf2onnx 对 control flow 支持有限。",
    "不同 opset 默认行为差异。"
  ],
  "code": "# Python：两个框架都导出 ONNX\ndef export_both(pt_model, tf_model, dummy):\n    import torch, tf2onnx, tensorflow as tf\n    torch.onnx.export(pt_model, dummy, 'm_pt.onnx', opset_version=17)\n    model_proto, _ = tf2onnx.convert.from_keras(tf_model, output_path='m_tf.onnx')\n    return 'm_pt.onnx', 'm_tf.onnx'",
  "codeNotes": [
    "TF 常用 tf2onnx 转换。",
    "注意通道格式差异。"
  ],
  "complexity": "导出各自 O(图规模)；下游统一。",
  "followUps": [
    {
      "question": "TF 转 ONNX 常用什么工具？",
      "answer": "tf2onnx(支持 Keras/GraphDef)或官方 onnx 导出器，注意 NHWC↔NCHW。"
    },
    {
      "question": "统一后还有什么不一致？",
      "answer": "opset、动态轴定义、自定义层仍可能各框架不同，需逐个对齐。"
    }
  ],
  "followUpAnswers": [
    "tf2onnx 是常用转换。",
    "opset/自定义层仍需对齐。"
  ],
  "pitfalls": [
    "以为导出 ONNX 就完全一致——通道/算子语义仍可能差。",
    "忽略两框架数值微小差异累积。"
  ],
  "beginnerSummary": "不同训练框架像不同牌子的文档软件，统一导出成 ONNX 这种\"通用格式\"后，下游只需准备一台通用阅读器(推理引擎)，不用为每种软件各配一台，省事又不容易出错。",
  "prerequisites": [
    "训练框架可能多个。",
    "推理后端最好统一。",
    "ONNX 是中立桥梁。"
  ],
  "workedExample": [
    "PyTorch 与 TF 各自导出 ONNX。",
    "两者输出相似度 >0.9999，共用 TRT 流程。"
  ],
  "lineByLine": [
    "PyTorch 用 torch.onnx.export。",
    "TF 用 tf2onnx 转换。",
    "统一校验数值一致性。",
    "进同一条 TRT 部署链路。"
  ],
  "diagram": "PyTorch ─┐\nTF ───────▶ ONNX ─▶ 统一 TRT/ORT 部署\nJAX ──────┘"
};
