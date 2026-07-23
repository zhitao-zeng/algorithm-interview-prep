export default {
  "kind": "code",
  "id": "batchnorm",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "BatchNorm",
  "prompt": "训练和推理阶段 BN 有何不同。",
  "quickAnswer": "训练用当前 batch 均值方差并更新滑动统计；推理用 running mean/var。",
  "approach": "训练用当前 batch 均值方差并更新滑动统计；推理用 running mean/var。",
  "explanationFocus": "BatchNorm：训练用当前 batch 均值方差并更新滑动统计；推理用 running mean/var。",
  "bruteForce": "《BatchNorm》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "深层网络每层输入分布随参数更新而漂移，使训练变慢、需更小学习率。",
    "标准化固定分布，但会破坏已学到的表达；故再用 γ、β 恢复容量。",
    "推理无 batch，必须用训练中累计的统计量，否则行为不一致。"
  ],
  "invariant": "实现始终保持 BatchNorm：训练用当前 batch 均值方差并更新滑动统计；推理用 running mean/var。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《BatchNorm》，逐步核对形状和中间数值。",
  "edgeCases": [
    "batch 大小为 1：σ²=0，靠 ε 维持数值稳定（但统计不可靠）。",
    "推理阶段：忽略当前 batch，用 running 统计量。",
    "ε 过小：方差接近 0 时除零风险。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef batch_norm(x, gamma, beta, running_mean, running_var, training=True, momentum=0.1, eps=1e-5):\n    x = np.asarray(x, dtype=float); gamma, beta = np.asarray(gamma), np.asarray(beta)\n    running_mean, running_var = np.asarray(running_mean), np.asarray(running_var)\n    if x.ndim != 2 or gamma.shape != (x.shape[1],) or beta.shape != (x.shape[1],): raise ValueError(\"BN shapes must be (B,C) and (C,)\")\n    if running_mean.shape != gamma.shape or running_var.shape != gamma.shape: raise ValueError(\"running stats shape mismatch\")\n    if not 0 <= momentum <= 1: raise ValueError(\"momentum must be in [0,1]\")\n    if training:\n        mean, var = x.mean(axis=0), x.var(axis=0)\n        running_mean[...] = (1-momentum)*running_mean + momentum*mean\n        running_var[...] = (1-momentum)*running_var + momentum*var\n    else: mean, var = running_mean, running_var\n    return gamma*(x-mean)/np.sqrt(var+eps) + beta",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(N·D)（N 样本、D 特征），空间 O(D)（统计量）。",
  "followUps": [
    {
      "question": "momentum 会写反吗？",
      "answer": "本实现新值=(1-momentum)*旧+momentum*当前；不同框架命名可能相反，需核对文档。"
    },
    {
      "question": "BN 与 LayerNorm 差异？",
      "answer": "BN 跨 batch，受 batch 大小影响；LayerNorm 对每个样本的 hidden 维统计，更适合小 batch 序列。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "训练/推理用了不同的统计量来源，导致部署后行为漂移。",
    "忘记加 ε，方差恰为 0 时除零。"
  ],
  "beginnerSummary": "BatchNorm 让每层的输入分布保持稳定（缓解内部协变量偏移）。对一个特征在一批样本上计算均值 μ 和方差 σ²，做 (x-μ)/√(σ²+ε) 标准化，再用可学习参数 γ、β 缩放平移回合适的尺度。训练时用当前批统计，推理时改用训练阶段累计的滑动均值/方差。",
  "prerequisites": [
    "同一特征跨 batch 维度求 μ、σ²，使该特征在 batch 内零均值、单位方差。",
    "γ、β 是逐特征的可学习参数，恢复模型需要的表达力（否则所有特征被迫同分布）。",
    "推理（eval）用 running_mean/running_var（训练时指数滑动平均得到），保证单样本也能用。"
  ],
  "workedExample": [
    "某特征一批 [1,2,3,4,5]：μ=3，σ²=2；x=4 → (4-3)/√(2+ε)≈0.707；再 y=γ·0.707+β。",
    "训练时每个 batch 更新 running_mean ← (1-momentum)·running_mean + momentum·μ（PyTorch 约定；Keras 常用相反写法 momentum·old + (1-momentum)·μ，面试需主动说明框架差异）。"
  ],
  "lineByLine": [
    "训练：计算 batch 内 μ、σ²（含 eps 防除零）。",
    "x̂ = (x - μ) / √(σ²+ε)。",
    "更新 running_mean/var（滑动平均）。",
    "y = γ·x̂ + β，返回 y（及推理用统计量）。"
  ],
  "diagram": "某特征一批: [1,2,3,4,5]\nμ=3,  σ²=2\nx̂ = (x - μ) / √(σ² + ε)\ny = γ·x̂ + β   (可学缩放平移)\n训练用批统计; 推理用滑动均值/方差"
};
