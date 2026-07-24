export default {
  "kind": "concept",
  "id": "onnx-graph-optimization",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "图优化与常量折叠",
  "prompt": "推理部署中的图优化（如 constant folding）是什么，有什么用？",
  "quickAnswer": "图优化在编译期对计算图做等价变换以提升效率；常量折叠(constant folding)把仅依赖常量输入的计算(如 BN 的 running stats、固定 affine)在离线阶段算好并替换为常量/直接并入权重，从而减少运行时计算与节点数，是融合的前置步骤。",
  "approach": "遍历图 → 识别常量子图 → 离线求值替换为常量 → 再做融合等优化 → 交给引擎。",
  "explanationFocus": "是什么：图优化是对计算图做等价化简的编译期变换，常量折叠把常量计算提前算掉。",
  "bruteForce": "运行时每个节点都算一遍：含大量可预计算的冗余。",
  "derivation": [
    "为什么需要：导出图保留了许多静态可确定结果的计算，运行时算纯属浪费。",
    "怎么实现：符号执行识别输入全为常量的节点，离线求值并把结果固化为常量节点。",
    "有什么代价：需保证常量传播不改变数值语义；动态形状下部分无法折叠。",
    "怎么评测：折叠前后同输入输出一致，节点数下降、延迟降低。"
  ],
  "invariant": "图优化(含折叠)后输出应与原图一致。",
  "walkthrough": "折叠 BN 的 mean/var 常量：Conv 权重 pre-compute 后节点数 -2，推理该段延迟降约 20%。",
  "edgeCases": [
    "含数据依赖的输入不能折叠。",
    "动态 shape 子图折叠受限。",
    "大常量张量折叠会增加存储。"
  ],
  "code": "# Python (概念)：常量折叠示意\ndef constant_fold(graph):\n    changed = True\n    while changed:\n        changed = False\n        for node in graph.nodes:\n            if all(is_constant(i) for i in node.inputs):\n                val = eval_node(node)          # 离线求值\n                graph.replace(node, const(val))  # 替换为常量\n                changed = True\n    return graph",
  "codeNotes": [
    "折叠是融合的前置。",
    "只折全常量输入的节点。"
  ],
  "complexity": "O(迭代×节点)；一次离线。",
  "followUps": [
    {
      "question": "常量折叠和算子融合区别？",
      "answer": "折叠是消掉可预计算节点，融合是把多个运行时节点合并；两者常先后发生。"
    },
    {
      "question": "什么情况下折叠会变大存储？",
      "answer": "被折叠出的常量张量较大时会占用更多序列化空间，需权衡。"
    }
  ],
  "followUpAnswers": [
    "折叠消节点、融合并节点。",
    "大常量会增加存储。"
  ],
  "pitfalls": [
    "误以为折叠改变数值——它只是提前算。",
    "动态输入被错误当常量折叠。"
  ],
  "beginnerSummary": "常量折叠像做菜前先把\"固定配比的调料包\"按配方混好贴上标签(常量)，用时直接拿，不用每次现称；图优化则是把菜谱里能提前定好的步骤都先办妥，正式做时更顺。",
  "prerequisites": [
    "图含可静态确定的计算。",
    "离线计算不占运行时。",
    "等价变换不改变结果。"
  ],
  "workedExample": [
    "BN 的 mean/var 常量被折叠进 Conv 权重。",
    "节点 -2，该段延迟降约 20%。"
  ],
  "lineByLine": [
    "遍历图中每个节点。",
    "判断输入是否全为常量。",
    "离线求值并替换为常量节点。",
    "迭代至无可折叠并验证一致。"
  ],
  "diagram": "Conv ─[BN权重(常量)]─▶ 折叠为 ─▶ Conv'(权重已含BN) "
};
