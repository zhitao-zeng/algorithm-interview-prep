export default {
  "kind": "concept",
  "id": "onnx-trt-dynamic-shape",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "动态 shape 支持",
  "prompt": "TensorRT 的动态 shape（dynamic shape）怎么支持，为什么重要？",
  "quickAnswer": "动态 shape 允许输入维度(如 batch、分辨率)在运行时变化；做法是在 BuilderConfig 中用 OptimizationProfile 声明各动态维的最小/最优/最大范围，TRT 为此范围生成可应对的 engine；推理时用 set_input_shape 指定实际形状。它重要是因为真实服务常面对变长输入(变 batch、变分辨率)。",
  "approach": "Config 加 profile(min/opt/max) → build → context.set_input_shape 设实际形状 → 执行。",
  "explanationFocus": "是什么：动态 shape 让 TRT engine 在声明范围内接受变长输入，而非固定形状。",
  "bruteForce": "为每种形状各建一个 engine：冗余且内存爆炸。",
  "derivation": [
    "为什么需要：线上输入尺寸/批量不固定，固定 shape 不灵活。",
    "怎么实现：profile 描述动态维范围，TRT 在该范围做 kernels 调优与显存规划。",
    "有什么代价：opt 形状选错会拖累性能；范围过大增加 build 与显存。",
    "怎么评测：在 min/opt/max 及中间形状上验证精度与延迟。"
  ],
  "invariant": "范围内任意合法形状输出应与原模型一致。",
  "walkthrough": "batch 范围 [1,8,32]：opt=8 调优；实际 batch=5 时 set_input_shape([5,3,224,224]) 正常推理。",
  "edgeCases": [
    "opt 形状应贴近典型负载以免性能差。",
    "超出 max 的输入会被拒绝。",
    "多动态维需分别设 profile。"
  ],
  "code": "# Python：配置动态 shape profile\ndef add_dynamic_profile(config, input_name):\n    profile = config.add_optimization_profile()\n    profile.set_shape(input_name,\n                      min=(1,3,224,224),\n                      opt=(8,3,224,224),\n                      max=(32,3,224,224))\n    return profile",
  "codeNotes": [
    "opt 是调优基准形状。",
    "min/opt/max 必须都能放下。"
  ],
  "complexity": "build 随范围增大而变慢；推理灵活。",
  "followUps": [
    {
      "question": "opt 形状选错了会怎样？",
      "answer": "TRT 围绕 opt 调优，实际形状偏离 opt 远时 kernel 非最优，性能下降。"
    },
    {
      "question": "能同时多个 profile 吗？",
      "answer": "可以，add_optimization_profile 可加多个，运行时按需要选。"
    }
  ],
  "followUpAnswers": [
    "opt 决定调优基准。",
    "多 profile 可并存。"
  ],
  "pitfalls": [
    "把 max 设得过大——build 慢且显存浪费。",
    "运行时形状超出 max 却未校验。"
  ],
  "beginnerSummary": "动态 shape 像一张\"可调大小的模具\"：你先告诉工厂最小、最舒服、最大三种尺寸(范围)，工厂据此做一副能伸缩的模具；用的时候按实际大小调一下就行，不用为每种尺寸另开一副。",
  "prerequisites": [
    "线上输入形状常变化。",
    "固定 shape 缺乏灵活性。",
    "TRT 需范围做调优。"
  ],
  "workedExample": [
    "profile 设 batch min1/opt8/max32。",
    "实际 batch=5 用 set_input_shape 推理。"
  ],
  "lineByLine": [
    "创建 optimization profile。",
    "设动态维 min/opt/max。",
    "build 时纳入该 profile。",
    "推理时 set_input_shape 设实际值。"
  ],
  "diagram": "输入维: min ── opt(调优) ── max   ==> 可伸缩 engine"
};
