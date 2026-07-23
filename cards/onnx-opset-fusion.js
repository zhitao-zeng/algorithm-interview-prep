export default {
  "kind": "concept",
  "id": "onnx-opset-fusion",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "ONNX 算子集与算子融合",
  "prompt": "ONNX 的算子集(opset)是什么，算子融合为什么能加速推理？",
  "quickAnswer": "ONNX 算子集(opset)定义了图中可用算子及其语义版本；算子融合(fusion)把多个细粒度算子(如 Conv+BN+ReLU)合并成一个大算子，减少 kernel 启动次数与中间张量读写，是推理图优化的核心手段。",
  "approach": "解析 ONNX 图 → 模式匹配可融合子图 → 替换为融合算子 → 交由引擎执行。",
  "explanationFocus": "是什么：opset 是 ONNX 算子的版本化集合；算子融合是把相邻算子合并以减少开销的图优化。",
  "bruteForce": "逐算子调用各自 kernel：每个算子都读写显存、调度一次，开销大。",
  "derivation": [
    "为什么需要：框架导出图常是细粒度算子堆叠，逐算子执行有大量内存往返与启动开销。",
    "怎么实现：图优化器按预定义 pattern(如 Conv-BN-ReLU)识别子图，重写为单一融合节点。",
    "有什么代价：融合规则需随算子语义维护；某些结构(带残差分支)无法简单融合。",
    "怎么评测：同输入对比融合前后数值一致，并测端到端延迟/吞吐提升。"
  ],
  "invariant": "融合后算子输出与逐算子执行在数学上等价（浮点误差内）。",
  "walkthrough": "ResNet 中 Conv+BN+ReLU 三算子融合后，原 3 次显存读写降为 1 次；实测同 batch 延迟下降约 30%。",
  "edgeCases": [
    "BN 在推理期参数为常量，可折叠进 Conv 权重。",
    "带 add 残差的结构需特定融合规则。",
    "动态 shape 下融合算子仍需支持变长。"
  ],
  "code": "# Python (概念)：示意融合模式识别\ndef fuse_conv_bn_relu(graph):\n    for node in graph.nodes:\n        if is_pattern(node, ['Conv','BatchNorm','Relu']):\n            fused = graph.make_fused('ConvBnRelu', node.inputs)\n            graph.replace(node, fused)\n    return graph",
  "codeNotes": [
    "融合发生在图优化阶段，不改权重语义。",
    "TensorRT 内置大量融合规则。"
  ],
  "complexity": "模式匹配 O(节点数)；融合后执行更快。",
  "followUps": [
    {
      "question": "融合会损失精度吗？",
      "answer": "正常不会，融合只是计算重排；但若结合低精度(INT8)才引入量化误差。"
    },
    {
      "question": "哪些算子最常融合？",
      "answer": "Conv+BN+激活、MatMul+Add+Bias、Transpose+MatMul 等相邻逐元素/线性算子。"
    }
  ],
  "followUpAnswers": [
    "融合不改变数值，仅重排计算。",
    "Conv/MatMul 类线性算子最易融合。"
  ],
  "pitfalls": [
    "认为融合一定加快——极端小算子融合可能因复用数据量变化反而不利。",
    "忽略 opset 版本差异导致融合规则不命中。"
  ],
  "beginnerSummary": "模型像一串小工序，每道工序都要把半成品搬来搬去很费时；算子融合就像把相邻几道工序合并成一道大工序，少搬几次东西，整体就快了。opset 则像\"工序目录\"，规定能用哪些标准工序。",
  "prerequisites": [
    "模型是算子组成的计算图。",
    "每次 kernel 执行都有显存读写与调度开销。",
    "ONNX 用 opset 管理算子版本。"
  ],
  "workedExample": [
    "Conv+BN+ReLU → 融合为 ConvBnRelu 单节点。",
    "融合后显存往返 3 次变 1 次，延迟降约 30%。"
  ],
  "lineByLine": [
    "遍历图中节点序列。",
    "用模式匹配找 Conv-BN-ReLU 相邻结构。",
    "生成融合大算子并接上原输入。",
    "替换原三个节点并验证数值一致。"
  ],
  "diagram": "Conv ─ BN ─ Relu   ==>   [ConvBnRelu]   (融合: 少 2 次显存往返)"
};
