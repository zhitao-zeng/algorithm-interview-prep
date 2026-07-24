export default {
  "kind": "code",
  "id": "dropout",
  "category": "模型手写",
  "difficulty": "Easy",
  "title": "Dropout",
  "prompt": "实现 inverted dropout 并说明推理行为。",
  "quickAnswer": "训练时以 keep_prob 采样掩码并除以 keep_prob；推理直接恒等映射。",
  "approach": "训练时以 keep_prob 采样掩码并除以 keep_prob；推理直接恒等映射。",
  "explanationFocus": "Dropout：训练时以 keep_prob 采样掩码并除以 keep_prob；推理直接恒等映射。",
  "bruteForce": "《Dropout》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "过拟合来自神经元间的共适应；随机丢弃打破这种依赖。",
    "训练乘 1/(1-p) 抵消「平均只保留 1-p 比例」带来的期望下降，保证推理一致。",
    "可理解为对 2^N 个子网络做近似集成。"
  ],
  "invariant": "实现始终保持 Dropout：训练时以 keep_prob 采样掩码并除以 keep_prob；推理直接恒等映射。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《Dropout》，逐步核对形状和中间数值。",
  "edgeCases": [
    "p=0：不丢弃任何神经元（等价于恒等）。",
    "p=1：全部丢弃（极端，通常无意义）。",
    "推理模式：忽略 p，原样输出。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef dropout(x, keep_prob=0.5, training=True, rng=None):\n    x = np.asarray(x, dtype=float)\n    if not 0 < keep_prob <= 1: raise ValueError(\"keep_prob must be in (0,1]\")\n    if not training: return x.copy()\n    generator = np.random.default_rng() if rng is None else rng\n    mask = generator.random(x.shape) < keep_prob\n    return x*mask/keep_prob",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(N)（逐元素），空间 O(N)（mask）。",
  "followUps": [
    {
      "question": "为什么 eval 不乘 keep_prob？",
      "answer": "训练阶段已除以 keep_prob，使训练输出期望等于原输入，eval 直接使用原输入即可。"
    },
    {
      "question": "Dropout 与 BN 如何排序？",
      "answer": "常把 dropout 放在线性层或激活后，避免在 BN 前破坏统计；最终仍需实验验证。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "训练时忘了除以 (1-p)，导致激活尺度整体变小、期望偏移。",
    "推理阶段仍应用 dropout mask，使预测随机且退化。"
  ],
  "beginnerSummary": "Dropout 是防止过拟合的正则化技巧：训练时以概率 p 随机「丢弃」（置 0）一部分神经元，迫使网络不依赖特定节点，学到更鲁棒的特征。为保持期望不变，被保留的激活要除以 (1-p) 做尺度缩放（inverted dropout）。推理时不丢弃，也不缩放（因为训练已缩放过）。",
  "prerequisites": [
    "mask 是随机伯努利向量，每个元素以 p 概率为 0、以 1-p 概率为 1。",
    "inverted dropout：训练时保留值除以 (1-p)，使期望 ≈ 原值，推理无需再缩放。",
    "推理阶段关闭 dropout，用全部神经元（相当于集成了多个子网络的平均）。"
  ],
  "workedExample": [
    "输出 [0.3,0.8,0.5,0.2]，p=0.5；mask=[1,0,1,0] → 保留 [0.3,0.5]，缩放 /0.5 → [0.6,1.0]。",
    "推理时原样输出 [0.3,0.8,0.5,0.2]，不做任何丢弃。"
  ],
  "lineByLine": [
    "生成与输入同形的随机 mask（伯努利，概率 p）。",
    "训练：out = (x * mask) / (1 - p)。",
    "推理（training=False）：out = x。",
    "注意 mask 每次前向都重新随机。"
  ],
  "diagram": "全连接输出: [0.3,0.8,0.5,0.2]  p=0.5\n掩码 mask:   [1, 0, 1, 0]  (随机置0)\n训练: 保留/0.5 → [0.6, 0, 1.0, 0]\n推理: 无 dropout, 用期望(尺度不变)"
};
