export default {
  "id": "gen-diffusion-vs-flow",
  "category": "多模态生成应用",
  "difficulty": "Hard",
  "title": "Diffusion 与 Flow Matching 的原理差异与取舍",
  "prompt": "在图像/视频生成中，Diffusion 与 Flow Matching 在训练目标和推理效率上分别如何权衡？",
  "quickAnswer": "Diffusion 以逐步去噪的变分下界训练、采样步数多但稳定；Flow Matching 直接回归直线/最优传输速度场，可用少量步数（甚至 1 步）采样，训练更简洁、对噪声调度不敏感。",
  "code": "import torch\nimport torch.nn.functional as F\n\ndef flow_matching_loss(model, x1, x0, t, noise):\n    # x1: 数据, x0: 噪声, 构造直线路径 x_t = (1-t)*x0 + t*x1\n    xt = (1 - t) * x0 + t * x1\n    vt = model(xt, t)                 # 预测速度场\n    target = x1 - x0                  # 直线 OT 路径真值速度\n    return F.mse_loss(vt, target)\n",
  "complexity": "训练时间 O(N·T)、空间 O(B·C·H·W)；推理 Diffusion 约 O(T)、Flow Matching 约 O(1~T)",
  "beginnerSummary": "Diffusion 像一层层擦掉粉笔灰还原画；Flow Matching 像直接学会从噪声到画面的最短搬运路线，所以能一步到位。",
  "derivation": [
    "为什么需要：扩散模型需要很多步去噪、推理慢；团队希望用更少步数拿到可用画质，于是出现了直接拟合向量场的 Flow Matching。",
    "怎么实现：FM 构造从噪声 x0 到数据 x1 的路径 x_t=(1-t)x0+t·x1，让网络预测目标速度 v=x1−x0 并用 MSE 监督；Diffusion 则拟合各噪声水平的 score/ε。",
    "有什么代价：FM 在极少先验下对路径选择敏感，直线路径偶有模式崩塌；Diffusion 步数多带来稳定但慢，且对采样调度依赖强。",
    "怎么评测：固定步数下对比 FID/IS 与 CLIP 一致性，并测端到端延迟与显存峰值，确认取舍是否值得。"
  ],
  "edgeCases": [
    "t=0 或 t=1 边界处速度场梯度爆炸，需要 clip 或加小扰动。",
    "数据分布有多模态时直线路径会穿越低概率区，导致模糊样本。",
    "CFG 与 FM 结合时条件/无条件速度混合比例需重新标定。",
    "视频场景里跨帧一致性需要额外时序约束，单帧 FM 会闪烁。"
  ],
  "pitfalls": [
    "把 Diffusion 的 ε 预测 head 直接复用到 FM 会训飞，因为监督目标是速度不是噪声。",
    "误以为 FM 一定 1 步可用，实际小模型仍需 4~8 步保画质。"
  ],
  "prerequisites": [
    "概率生成模型与 score matching 基础",
    "最优传输与常微分方程（ODE）直觉",
    "U-Net / DiT 骨干网络"
  ],
  "workedExample": [
    "用 CIFAR-10 训练一个 FM 模型，监督目标为 x1−x0，验证 8 步采样 FID 接近 50 步 DDPM。",
    "把同一 backbone 切换为 ε 预测的 DDPM，对比相同算力下 1000 步的 FID，确认 FM 提速收益。"
  ],
  "lineByLine": [
    "import torch, F：引入张量与 MSE 损失，用于回归速度场。",
    "def flow_matching_loss(...)：定义 FM 训练损失函数，输入数据 x1、噪声 x0、时间 t 与采样噪声。",
    "xt=(1-t)*x0+t*x1：按时间 t 在噪声与数据间线性插值得到中间状态。",
    "vt=model(xt,t)：网络在时刻 t 预测速度场。",
    "target=x1-x0：直线 OT 路径的真值速度即两端之差。",
    "return F.mse_loss(vt,target)：用均方误差把预测速度拉向真值。"
  ],
  "followUps": [
    {
      "question": "Flow Matching 能否和 CFG 一起用？",
      "answer": "可以，把条件/无条件速度分别预测后按 v=ν_uncond+cfg*(ν_cond−ν_uncond) 混合，但 scale 通常比 Diffusion 小，需要重新搜索。"
    },
    {
      "question": "为什么 FM 对噪声调度不敏感？",
      "answer": "因为路径由 t 的线性插值固定，损失只依赖数据配对，不再像 Diffusion 那样依赖 β 调度与 SNR 权重。"
    },
    {
      "question": "视频生成里 FM 怎么保证时序一致？",
      "answer": "在 backbone 加入时序注意力或在速度场监督上叠加跨帧一致性损失，并对 latent 做光流对齐。"
    }
  ],
  "followUpAnswers": [
    "可以，把条件/无条件速度分别预测后按 v=ν_uncond+cfg*(ν_cond−ν_uncond) 混合，但 scale 通常比 Diffusion 小，需要重新搜索。",
    "因为路径由 t 的线性插值固定，损失只依赖数据配对，不再像 Diffusion 那样依赖 β 调度与 SNR 权重。",
    "在 backbone 加入时序注意力或在速度场监督上叠加跨帧一致性损失，并对 latent 做光流对齐。"
  ],
  "explanationFocus": "是什么：Flow Matching 是一类直接学习从噪声到数据的连续变换向量场（速度场）的生成范式，相比 Diffusion 省略了逐步加噪的马尔可夫假设。",
  "approach": "核心思路是用直线或最优传输路径构造样本轨迹，让网络回归轨迹切线方向（速度），推理时解一个 ODE 即可在极少步内生成样本。",
  "kind": "concept"
};
