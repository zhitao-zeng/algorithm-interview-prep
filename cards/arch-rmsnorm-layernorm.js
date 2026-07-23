export default {
  "kind": "concept",
  "id": "arch-rmsnorm-layernorm",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "RMSNorm 与 LayerNorm 对比",
  "prompt": "RMSNorm 相比 LayerNorm 计算式有何不同，为什么 LLM 偏好它？",
  "quickAnswer": "RMSNorm 去掉均值中心化与 β，仅 x/RMS·γ；少一次规约、快约 10–15% 且质量持平。",
  "approach": "从计算公式逐项对比：LayerNorm 减均值除标准差加 β；RMSNorm 只除均方根乘 γ。",
  "explanationFocus": "是什么：LayerNorm(x)=γ·(x−μ)/σ+β，先减均值再除标准差；RMSNorm(x)=γ·x/√(mean(x²)+ε)，跳过均值中心化与偏置 β，仅用均方根缩放。",
  "bruteForce": "标准 LayerNorm 需两次规约（求均值、求方差）与两个可学习参数 γ,β，每个 token 多一次跨线程同步。",
  "derivation": [
    "为什么需要：Zhang & Sennrich(2019)发现 LayerNorm 的收益几乎全来自「重缩放」而非「重居中」。",
    "怎么实现：RMS=√(mean(x²))，输出 γ·x/RMS；省去 μ、σ 与 β。",
    "有什么代价：少一次规约与减半归一化参数，单操作快约 10–15%；每 token 每层都省，百层模型累计可观。",
    "怎么评测：WMT 翻译上质量与 LayerNorm 持平；LLaMA/Qwen/Mistral/DeepSeek 均验证可用。"
  ],
  "invariant": "不变量：RMSNorm 对输入「缩放」不变、对「平移」不再不变（因去掉均值）；质量上近似等于输入已居中的 LayerNorm。",
  "walkthrough": "向量 [3,−1,2,0]：RMS=√((9+1+4+0)/4)=√3.5≈1.87，输出≈[1.60,−0.53,1.07,0]×γ；LayerNorm 会先减均值 1 再除标准差。",
  "edgeCases": [
    "LLaMA 变量名仍叫 input_layernorm 但实为 RMSNorm（命名陷阱）。",
    "RMSNorm 与 LayerNorm 不能直接替换已训练权重，需微调。",
    "eps 通常放在根号内（1e-5/1e-6），与部分 LayerNorm 实现不同。"
  ],
  "code": "import torch\n\ndef rmsnorm(x, weight, eps=1e-6):\n    # x: (..., d)\n    rms = torch.sqrt(x.pow(2).mean(-1, keepdim=True) + eps)\n    return weight * (x / rms)",
  "codeNotes": [
    "weight 即 γ，初始化为全 1，无 β。",
    "eps 加在 mean(x²) 内，区别于某些 LayerNorm 把 eps 加在方差外。"
  ],
  "complexity": "RMSNorm 每层 O(N·d)，比 LayerNorm 少一次规约；在 N·层数 上累计省约 10–15% 归一化耗时。",
  "followUps": [
    {
      "question": "去掉均值会不会损失信息？",
      "answer": "经验上几乎无损；深层训练中激活近似已居中，重居中贡献小，且 γ 仍提供每维缩放。"
    },
    {
      "question": "RMSNorm 对输入平移不变吗？",
      "answer": "不变，它只对尺度不变；平移会改变输出，而 LayerNorm 对平移也不变（减均值后）。"
    }
  ],
  "followUpAnswers": [
    "经验上几乎无损；深层训练中激活近似已居中，重居中贡献小，且 γ 仍提供每维缩放。",
    "RMSNorm 对平移不变，只对尺度不变；LayerNorm 因减均值对平移也不变。"
  ],
  "pitfalls": [
    "误把 LLaMA 的 *layernorm 变量名当成真 LayerNorm。",
    "以为 RMSNorm 是『除以 L2 范数』——实际除以 √mean(x²)，尺度为 √d 而非 1。"
  ],
  "beginnerSummary": "LayerNorm 先「平移到原点再缩放」，RMSNorm 嫌平移没用，直接「按向量长度缩放」，步骤更少、更快，效果差不多。",
  "prerequisites": [
    "层归一化 LayerNorm",
    "均值与方差",
    "Transformer 训练稳定性"
  ],
  "workedExample": [
    "x=[3,−1,2,0]，RMS=√3.5≈1.87。",
    "输出=x/1.87·γ≈[1.60,−0.53,1.07,0]·γ。"
  ],
  "lineByLine": [
    "x.pow(2).mean(-1)：求各 token 特征的均方。",
    "sqrt(+eps)：开根得 RMS，eps 防除零。",
    "weight*(x/rms)：缩放并乘可学习 γ。"
  ],
  "diagram": "LayerNorm: (x-μ)/σ·γ + β\nRMSNorm:  x/rms · γ      (无 μ, 无 β)"
};
