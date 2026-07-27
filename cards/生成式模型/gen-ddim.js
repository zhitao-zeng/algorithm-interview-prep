export default {
  "id": "gen-ddim",
  "kind": "concept",
  "category": "生成式模型",
  "title": "DDIM 确定性加速采样",
  "difficulty": "Medium",
  "prompt": "DDIM 是如何实现确定性采样并通过更少步数加速的？它与 DDPM 的等价性与区别在哪里？",
  "quickAnswer": "DDIM 在保持与 DDPM 相同训练目标（共享 ε_θ）的前提下，把反向过程重写成非 Markov、确定性的更新式，从而支持跳步采样（如 50 步甚至 10 步）。它与 DDPM 共享训练好的权重，但采样轨迹不再是随机链，因此同种子可复现且更快。",
  "code": "def ddim_step(xt, t, t_prev, model, eta=0.0):\n    eps = model(xt, t)\n    alpha = alphas_cumprod[t]; alpha_prev = alphas_cumprod[t_prev]\n    x0_hat = (xt - torch.sqrt(1 - alpha) * eps) / torch.sqrt(alpha)\n    dir = torch.sqrt(1 - alpha_prev - eta**2 * (1-alpha/alpha_prev)) * eps\n    noise = eta * torch.sqrt(1 - alpha_prev) * torch.randn_like(xt)\n    return torch.sqrt(alpha_prev) * x0_hat + dir + noise",
  "complexity": "O(S·H·W·C)，S≪T",
  "beginnerSummary": "DDPM 像蒙着眼睛一步步试探着退噪，DDIM 则拿同一张“地图”走一条更直、可预定的路线，用更少步到达终点且每次结果一致。",
  "explanationFocus": "是什么：DDIM（去噪扩散隐式模型）是一种确定性、非 Markov 的采样框架，复用 DDPM 训练好的噪声预测器，但把采样步数大幅压缩。",
  "approach": "它把反向定义为一个隐式概率模型，引入参数 η 在随机(=DDPM)与完全确定(η=0)间插值；通过子序列 {τ_1..τ_S} 跳步，每步用闭式公式同时估计 x0 与方向项完成大跨度更新。",
  "derivation": [
    "为什么需要：DDPM 千步采样太慢难落地，需要不重训就能加速的方案。",
    "怎么实现：固定训练好的 ε_θ，构造共享边缘分布 p_θ(x_t) 的一族反向过程，取子序列跳步，η 控制随机性。",
    "有什么代价：步数过少或 η 偏离训练分布会掉质量；它不是真正的似然模型，ELBO 不再严格成立。",
    "怎么评测：在固定步数下比较 FID，并验证同种子确定性（输出方差≈0）。"
  ],
  "edgeCases": [
    "η=0 时完全确定，任何随机种子给出相同样本，便于复现与调试。",
    "子序列跨度过大（如 1000→5 步）会明显失真，需调 S。",
    "与 CFG 共用时要保持步数一致，否则引导强度感受不同。"
  ],
  "pitfalls": [
    "以为必须重训模型——DDIM 直接复用 DDPM 权重。",
    "混淆“非 Markov”与“无噪声”：η>0 仍可引入随机性，但默认加速用 η=0。"
  ],
  "prerequisites": [
    "DDPM 训练目标",
    "概率边缘分布匹配",
    "确定性 vs 随机采样"
  ],
  "workedExample": [
    "训练好 ε_θ 后，选取子序列 [1,20,40,...,1000] 共 50 步。",
    "从 x_1000=N(0,I) 起，按 DDIM 公式逐步跳到 x_1、x_0。",
    "设 η=0 运行两次，确认输出像素级一致，验证确定性。"
  ],
  "lineByLine": [
    "model(xt,t) 给出当前噪声预测 eps。",
    "x0_hat 用当前步 α 反推出“去噪到干净图”的估计。",
    "dir 项组合下一步 α_prev 与 η 控制方向幅度；noise 在 η>0 时注入随机。",
    "最终按 √(α_prev)*x0_hat + dir + noise 完成一步大跨度更新。"
  ],
  "followUps": [
    {
      "question": "DDIM 与 DDPM 为什么能共享权重？",
      "answer": "两者在前向边缘分布 p(x_t|x_0) 上完全等价，训练目标都是 L_simple，所以同一个 ε_θ 可直接用于 DDIM 的跳步反向。"
    },
    {
      "question": "η 的作用是什么？",
      "answer": "η 在 0（确定）到 1（接近 DDPM 随机）间插值；取 0 最快且可复现，取大值增加多样性但更慢。"
    },
    {
      "question": "DDIM 能进一步用蒸馏加速吗？",
      "answer": "可以，DDIM 的少步框架是一致性模型 / LCM 等蒸馏方法的基础起点。"
    }
  ],
  "followUpAnswers": [
    "两者在前向边缘分布 p(x_t|x_0) 上完全等价，训练目标都是 L_simple，所以同一个 ε_θ 可直接用于 DDIM 的跳步反向。",
    "η 在 0（确定）到 1（接近 DDPM 随机）间插值；取 0 最快且可复现，取大值增加多样性但更慢。",
    "可以，DDIM 的少步框架是一致性模型 / LCM 等蒸馏方法的基础起点。"
  ]
};
