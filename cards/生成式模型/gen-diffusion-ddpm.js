export default {
  "id": "gen-diffusion-ddpm",
  "kind": "concept",
  "category": "生成式模型",
  "title": "DDPM 去噪扩散概率模型",
  "difficulty": "Hard",
  "prompt": "请讲讲 DDPM（去噪扩散概率模型）的前向加噪调度、反向去噪过程、训练目标（噪声预测 / ELBO）以及时间步的作用？",
  "quickAnswer": "DDPM 由前向（固定 Markov 加噪）与反向（学习去噪）两段构成。前向按方差调度 β_t 逐步把数据 x0 变成纯高斯噪声；反向用 U-Net ε_θ 预测每步加入的噪声，训练目标是简化 ELBO 得到的 L_simple = E[||ε - ε_θ(x_t,t)||²]。时间步 t 让网络知道当前噪声水平，从而输出对应尺度的残差。",
  "code": "import torch\ndef q_sample(x0, t, noise):\n    # 前向：根据 alpha_bar 直接采样任意 t 的加噪结果\n    sqrt_ab = torch.sqrt(alphas_cumprod[t])[:, None, None, None]\n    sqrt_1m = torch.sqrt(1 - alphas_cumprod[t])[:, None, None, None]\n    return sqrt_ab * x0 + sqrt_1m * noise\n\ndef training_loss(model, x0, t):\n    noise = torch.randn_like(x0)\n    xt = q_sample(x0, t, noise)\n    pred = model(xt, t)            # 预测噪声\n    return ((pred - noise) ** 2).mean()",
  "complexity": "O(T·H·W·C) 每步 U-Net 前向",
  "beginnerSummary": "想象不断往一张清晰照片上撒沙子，直到它变成一片均匀的灰噪点；DDPM 训练一个网络学会“把沙子一层层扫掉”，从而能从纯噪声重新开始还原出一张新照片。",
  "explanationFocus": "是什么：DDPM 是一类通过“逐步加噪—逐步去噪”来建模数据分布的生成模型，前向过程固定为高斯 Markov 链，反向过程用神经网络参数化。",
  "approach": "核心思路是用变分下界（ELBO）把生成建模成学习反向条件分布 q(x_{t-1}|x_t)；进一步用重参数化把目标简化为预测前向过程加入的噪声 ε，从而用最基础的回归损失训练 U-Net。",
  "derivation": [
    "为什么需要：直接建模高维图像密度 p(x) 极难，扩散把问题拆成大量易处理的单步高斯转移，从而稳定训练并支持高质量采样。",
    "怎么实现：前向固定 q(x_t|x_{t-1})=N(x_t;√(1-β_t)x_{t-1},β_t I)，可闭式跳步采样；反向训练 ε_θ 预测噪声，用 L_simple 回归。",
    "有什么代价：反向需迭代 T（常 1000）步去噪，采样慢、显存与算力开销大；且训练需配对噪声-图像对。",
    "怎么评测：用 FID / IS 衡量生成质量与多样性，用采样步数与时延衡量效率，并做人工主观打分。"
  ],
  "edgeCases": [
    "t=0 时退化成原始数据，t=T 时近似标准高斯，边界处调度需平滑避免突变。",
    "β_t 调度过大会使信噪比骤降，导致反向难以学习；过小则去噪步数不足。",
    "条件生成时若条件缺失，应回退到无条件分支（CFG 用空 prompt）。",
    "低资源下 T 取太大训练慢、取太小质量掉，需要折中或改用加速采样。"
  ],
  "pitfalls": [
    "误以为反向也要按前向同样的 β_t；其实反向方差常取固定或学到的常数。",
    "把 L_simple 当成完整 ELBO 而忽略权重，训练时仍需注意高 t 项主导。"
  ],
  "prerequisites": [
    "概率图模型与 Markov 链",
    "变分推断 / ELBO",
    "高斯分布重参数化"
  ],
  "workedExample": [
    "给定 x0 与随机噪声 ε，选 t=500，用 ᾱ_500 计算 x_500 的闭式加噪样本。",
    "把 x_500、t 送入 U-Net 得到预测噪声 ε_hat，与真实 ε 算 MSE 作为一步损失。",
    "采样时从 x_T~N(0,I) 出发，重复 T 次用 ε_θ 做一步去噪直到 x_0。"
  ],
  "lineByLine": [
    "q_sample 中用 ᾱ_t 的平方根缩放原图，用 √(1-ᾱ_t) 缩放噪声，实现任意步闭式加噪。",
    "training_loss 先采样真实噪声并对 x0 加噪得到 xt，再让模型预测噪声。",
    "最后的 MSE 直接对齐 L_simple，使网络学会在给定时间步去噪。"
  ],
  "followUps": [
    {
      "question": "为什么 DDPM 用预测噪声而不是预测 x0？",
      "answer": "预测噪声对应简化 ELBO 的最简形式，梯度稳定且与加噪闭式解天然对齐；预测 x0 也可但需额外映射且早期步噪声大时不稳定。"
    },
    {
      "question": "反向过程的方差怎么取？",
      "answer": "原始 DDPM 用固定 β_t 或其后验方差；后续工作让它可学习（如 γ 参数化），能改善尾部步质量。"
    },
    {
      "question": "时间步 t 怎么编码进网络？",
      "answer": "通常用正弦位置编码或学习的 embedding，再经 FiLM / 注意力注入 U-Net 各层，告诉网络当前噪声水平。"
    }
  ],
  "followUpAnswers": [
    "预测噪声对应简化 ELBO 的最简形式，梯度稳定且与加噪闭式解天然对齐；预测 x0 也可但需额外映射且早期步噪声大时不稳定。",
    "原始 DDPM 用固定 β_t 或其后验方差；后续工作让它可学习（如 γ 参数化），能改善尾部步质量。",
    "通常用正弦位置编码或学习的 embedding，再经 FiLM / 注意力注入 U-Net 各层，告诉网络当前噪声水平。"
  ],
  "order": 1
};
