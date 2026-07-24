export default {
  "kind": "concept",
  "id": "onnx-export-issues",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "ONNX 导出常见问题",
  "prompt": "ONNX 导出时常见的坑（动态控制流/自定义层）有哪些，怎么解决？",
  "quickAnswer": "常见坑包括：动态控制流(if/loop)无法直接 trace、自定义层无对应 ONNX op、导出期形状未知、opset 不匹配。解法分别是用 TorchScript/tracing 配合控制流导出、为自定义层写自定义 op 或在导出前改写为标准算子、用 dynamic_axes 声明动态维、对齐目标引擎支持的 opset。",
  "approach": "先静态化模型 → 用 trace/script 导出 → 检查不支持算子 → 改写或注册自定义 op → 验证一致性。",
  "explanationFocus": "是什么：ONNX 导出是把框架图翻译成标准图的过程，易在动态结构与自定义层处失败。",
  "bruteForce": "直接 torch.onnx.export 不带任何处理：遇到动态分支直接报错。",
  "derivation": [
    "为什么需要：训练图常含数据相关的控制流与私有算子，标准 ONNX 不认识。",
    "怎么实现：用 tracing 记录实际路径，或用 scripting 保留控制流；自定义层导出为自定义 node 并后端注册。",
    "有什么代价：scripting 要求代码可静态分析；自定义 op 需两端实现且难维护。",
    "怎么评测：用代表性输入跑导出图，对比原模型输出最大误差 <阈值。"
  ],
  "invariant": "导出图对任意合法输入的输出应与原模型一致。",
  "walkthrough": "含 for 循环模型：用 torch.jit.script 再 export；对比 10 组输入输出误差均 <1e-5。",
  "edgeCases": [
    "数据相关的 if：tracing 只记录一条分支，需 scripting。",
    "自定义 Attention 层：导出为 CustomOp，TRT 端写 plugin。",
    "导出期张量形状为 None：需给定 dummy 或 dynamic_axes。"
  ],
  "code": "# Python：用 scripting 处理动态控制流\ndef export_with_script(model, path):\n    import torch\n    scripted = torch.jit.script(model)   # 保留控制流\n    dummy = model.example_input()\n    torch.onnx.export(scripted, dummy, path, opset_version=17)",
  "codeNotes": [
    "tracing 只看一次执行路径，会丢分支。",
    "scripting 要求无 Python 仅数据相关逻辑。"
  ],
  "complexity": "导出 O(图规模)；调试自定义 op 成本较高。",
  "followUps": [
    {
      "question": "tracing 和 scripting 选哪个？",
      "answer": "无动态控制流用 tracing 简单；有 if/loop 用 scripting 才能保留结构。"
    },
    {
      "question": "自定义层导出后推理端怎么办？",
      "answer": "在 ONNX 中为自定义 node，并在 TensorRT 侧实现对应 plugin 注册。"
    }
  ],
  "followUpAnswers": [
    "动态控制流优先 scripting。",
    "自定义层靠 plugin 兜底。"
  ],
  "pitfalls": [
    "以为 tracing 能自动捕获所有分支——它只记录实际跑的那条。",
    "导出成功就以为等价——必须用多组输入验证。"
  ],
  "beginnerSummary": "导出模型像把菜谱翻译成通用语言：有些\"看火候再决定\"的步骤(动态控制流)机器翻译不了一开始会翻错；有些独家秘方(自定义层)通用词典里没有，得自己补一张对照表(自定义 op)。",
  "prerequisites": [
    "导出是把框架图转标准图。",
    "控制流分数据相关与静态。",
    "ONNX 算子集合有限。"
  ],
  "workedExample": [
    "for 循环模型改用 torch.jit.script 再导出。",
    "10 组输入对比误差 <1e-5 才算通过。"
  ],
  "lineByLine": [
    "先用 scripting 固化控制流。",
    "准备示例输入定形状。",
    "调用 onnx.export 写出。",
    "多组输入验证数值一致。"
  ],
  "diagram": "PyTorch 模型 ─(script/trace)─▶ ONNX\n   动态分支 ─▶ scripting    自定义层 ─▶ CustomOp+plugin"
};
