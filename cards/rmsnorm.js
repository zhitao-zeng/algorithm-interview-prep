export default {
  "kind": "code",
  "id": "rmsnorm",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "RMSNorm",
  "prompt": "手写 RMSNorm，并与 LayerNorm 比较。",
  "quickAnswer": "沿 hidden 维计算均方根，不减均值；归一化后只乘可学习 scale。",
  "approach": "沿 hidden 维计算均方根，不减均值；归一化后只乘可学习 scale。",
  "explanationFocus": "RMSNorm：沿 hidden 维计算均方根，不减均值；归一化后只乘可学习 scale。",
  "bruteForce": "《RMSNorm》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "LayerNorm 的「减均值」在 Transformer 残差流里收益有限，RMSNorm 省略它减少计算。",
    "只重缩放尺度即可稳定训练，且对混合精度更友好。",
    "用 weight.ndim / weight.shape[0] 校验增益维度匹配，保证逐特征缩放正确。"
  ],
  "invariant": "归一化维度固定为最后一维 hidden size，eps 位于开方前。",
  "walkthrough": "对向量 [3,4]，rms=√((9+16)/2)，逐维相除后再乘 weight。",
  "edgeCases": [
    "输入含 0：RMS 仍为正（靠 eps），不致除零。",
    "增益 weight 维度不匹配：校验报错。",
    "eps 过小：方差近 0 时风险。"
  ],
  "code": "# Python\nimport torch\n\ndef rms_norm(x,weight,eps=1e-6):\n    x=torch.as_tensor(x,dtype=torch.float32); weight=torch.as_tensor(weight,dtype=x.dtype)\n    if weight.ndim!=1 or weight.shape[0]!=x.shape[-1]: raise ValueError(\"weight must be shape (D,)\")\n    return x/torch.sqrt(x.square().mean(dim=-1,keepdim=True)+eps)*weight",
  "codeNotes": [
    "RMSNorm 不需要减均值，也通常没有 bias。",
    "keepdim 保证能与原输入广播。"
  ],
  "complexity": "时间 O(N·d)（N 元素、d 维），空间 O(d)。",
  "followUps": [
    {
      "question": "与 LayerNorm 的关键差异？",
      "answer": "LayerNorm 先减均值再除标准差并常带 bias；RMSNorm 只除均方根，保留均值方向。"
    },
    {
      "question": "为什么大模型常用 RMSNorm？",
      "answer": "它省去均值计算和 bias，计算略少，同时实践中能保持稳定的尺度控制。"
    }
  ],
  "followUpAnswers": [
    "LayerNorm 还会中心化并除标准差；RMSNorm 只控制尺度。",
    "计算略少且在实践中训练稳定，常作为 Transformer 的归一化层。"
  ],
  "pitfalls": [
    "忘记加 eps，RMS=0 时除零。",
    "增益维度与特征维不一致却不校验，导致广播错误。"
  ],
  "beginnerSummary": "RMSNorm 是 LayerNorm 的简化变体，被 LLaMA 等现代大模型广泛采用。它只对输入做「均方根归一化」：x̂ = x / RMS(x)，其中 RMS(x)=√(mean(x²))，再用可学习增益 γ 缩放。相比 LayerNorm，它去掉了「减均值」这一步，计算更轻、数值更稳。",
  "prerequisites": [
    "RMS(x) = √( mean(x_i²) )，衡量激活的尺度而非中心位置。",
    "归一化后乘 γ（逐特征增益）恢复表达力，偏置通常已在前层吸收。",
    "常带一个极小 eps 防止除零。"
  ],
  "workedExample": [
    "x=[1,2,3]：mean(x²)=(1+4+9)/3=14/3≈4.667，RMS=√4.667≈2.160；x̂=[0.463,0.926,1.389]；y=x̂·γ+β。",
    "与 LayerNorm 不同，不先减去均值（保留符号/偏移信息）。"
  ],
  "lineByLine": [
    "校验 weight 维度（weight.ndim / weight.shape[0]）与输入特征维一致。",
    "计算 rms = sqrt(mean(x², dim=-1, keepdim=True) + eps)。",
    "x̂ = x / rms。",
    "y = x̂ * weight（+ bias 若提供）。"
  ],
  "diagram": "x=[1,2,3]\nrms = √( mean(x²) ) = √(14/3) ≈ 2.16\nx̂ = x / rms\ny = x̂ · γ + β\n(先归一化再缩放, 比 LayerNorm 少一步减均值)"
};
