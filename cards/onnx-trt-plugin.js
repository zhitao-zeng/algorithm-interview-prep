export default {
  "kind": "concept",
  "id": "onnx-trt-plugin",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "plugin 自定义算子",
  "prompt": "TensorRT 的 plugin（自定义算子）是什么，什么时候需要它？",
  "quickAnswer": "plugin 是用户为 TRT 不支持或需特优化的算子提供的自定义实现(C++/CUDA kernel + 注册)，让它能融入 engine 一起优化；当模型含 ONNX 无对应 op、或标准实现太慢(如特殊注意力)时就需要写 plugin，并在 ONNX 端以自定义 node 对应。",
  "approach": "定义 plugin(含 enqueue/kernel) → 注册到 PluginRegistry → ONNX 自定义 node 映射 → build engine。",
  "explanationFocus": "是什么：plugin 是扩展 TRT 算子能力的自定义算子机制，用 CUDA 实现并注册进引擎。",
  "bruteForce": "把不支持的算子拆成多个标准算子：慢且可能改数值。",
  "derivation": [
    "为什么需要：TRT 内置 op 有限，新算子在 ONNX 解析后无实现会 build 失败。",
    "怎么实现：实现 IPluginV2 接口(含输出形状推断、enqueue 调 CUDA kernel)、注册名、写 ONNX 解析映射。",
    "有什么代价：C++/CUDA 开发门槛高、需随 TRT 版本维护、难调试。",
    "怎么评测：plugin 输出与参考实现(如 PyTorch)逐元素误差 < 阈值。"
  ],
  "invariant": "plugin 输出应与参考实现在误差容忍内一致。",
  "walkthrough": "自定义 Swish：写 CUDA kernel + IPluginV2，解析 ONNX CustomOp 映射，build 后输出误差 <1e-5。",
  "edgeCases": [
    "plugin 需声明支持的数据类型与 workspace。",
    "版本 API(IPluginV2DynamicExt)差异。",
    "多输入/动态形状 plugin 形状推断要正确。"
  ],
  "code": "# Python：在 ONNX 侧标记自定义 node（示意）\ndef mark_custom_op(onnx_graph, node_name):\n    # 实际 plugin 的 CUDA/C++ 在 C++ 端注册\n    # ONNX 中对应一个 domain 为自定义、op_type=CustomOp 的 node\n    return f\"CustomOp:{node_name} (registered in TRT PluginRegistry)\"",
  "codeNotes": [
    "plugin 主体在 C++/CUDA 实现。",
    "ONNX 端只是标记自定义 node。"
  ],
  "complexity": "开发高；运行期与普通 op 一起优化。",
  "followUps": [
    {
      "question": "plugin 和直接拆算子比？",
      "answer": "plugin 可融合进 engine 并用 CUDA 高度优化，拆标准算子往往更慢且破坏融合。"
    },
    {
      "question": "plugin 要维护哪些接口？",
      "answer": "输出形状推断、enqueue(执行)、序列化/反序列化、配置与清理，随 TRT 版本 API 变化。"
    }
  ],
  "followUpAnswers": [
    "plugin 可融合且可 CUDA 优化。",
    "需实现形状/执行/序列化接口。"
  ],
  "pitfalls": [
    "低估 plugin 维护成本——TRT 大版本常改 API。",
    "plugin 内形状推断错误导致 build/运行崩溃。"
  ],
  "beginnerSummary": "plugin 像给工厂(TRT)加装一台\"非标定制机器\"：标准机器(内置算子)做不了的活，你自己造一台并登记在册，工厂就能把它编进流水线一起提速。",
  "prerequisites": [
    "TRT 内置 op 有限。",
    "新算子需 CUDA 实现。",
    "ONNX 自定义 node 需映射。"
  ],
  "workedExample": [
    "自定义 Swish 写 CUDA kernel + IPluginV2。",
    "ONNX CustomOp 映射后 build，误差 <1e-5。"
  ],
  "lineByLine": [
    "实现 plugin 的接口与 CUDA kernel。",
    "注册到 PluginRegistry。",
    "ONNX 导出为自定义 node。",
    "parser 映射到 plugin 并 build。"
  ],
  "diagram": "ONNX CustomOp ─▶ PluginRegistry ─▶ CUDA kernel ─▶ engine"
};
