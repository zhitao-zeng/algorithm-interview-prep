export default {
  "id": "vis-augmentation",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "数据与增强：mixup/cutmix/autoaugment 与域泛化",
  "difficulty": "Easy",
  "prompt": "mixup、cutmix、autoaugment 等数据增强如何提升视觉模型泛化与域适应能力？",
  "quickAnswer": "mixup 线性混合两图与标签做邻域平滑，cutmix 用另一图块替换并相应混合标签，二者都鼓励模型在样本间线性插值处也正确，提升鲁棒与校准。AutoAugment 用搜索/强化找最优增强策略组合，降低人工。它们通过增大有效数据多样性缓解过拟合并改善域泛化。",
  "code": "import torch\n\ndef cutmix(x, y, x2, y2, alpha=1.0):\n    lam = torch.distributions.Beta(alpha, alpha).sample()\n    b = x.clone(); h, w = x.shape[-2:]\n    r = torch.randint(0, h, (1,)); c = torch.randint(0, w, (1,))\n    bh, bw = int(h*lam**0.5), int(w*lam**0.5)\n    b[:, r:r+bh, c:c+bw] = x2[:, r:r+bh, c:c+bw]\n    return b, lam * y + (1 - lam) * y2",
  "complexity": "O(N·H·W) 像素级",
  "beginnerSummary": "给图片做点\"小手术\"（裁剪、混合、调色）能让模型见多识广、更不容易死记硬背。",
  "explanationFocus": "是什么：数据增强通过对训练样本做变换扩充多样性；mixup/cutmix 在样本层面混合，autoaugment 自动搜策略，目的都是提升泛化与域鲁棒。",
  "approach": "mixup 在输入与标签上凸组合；cutmix 粘贴块并混合标签；autoaugment 把策略搜索建模为 RL/贪心问题，在验证集上选最优子策略。",
  "derivation": [
    "为什么需要：数据有限时模型过拟合，增强等价于隐式正则。",
    "怎么实现：像素/标签混合或组合几何色彩变换。",
    "有什么代价：强增强可能破坏语义、需重调超参；cutmix 边界不自然。",
    "怎么评测：验证/测试精度、跨域泛化与校准误差。"
  ],
  "edgeCases": [
    "混合比例极端（lam≈0/1）退化为单样本。",
    "强几何增强使小目标消失。",
    "域差距过大时增强仍无法覆盖。"
  ],
  "pitfalls": [
    "在测试时也做随机增强导致评估不一致。",
    "误以为增强越多越好，过度破坏语义。"
  ],
  "prerequisites": [
    "过拟合与正则化",
    "图像基本变换"
  ],
  "workedExample": [
    "mixup 把猫与狗图按 0.7/0.3 混合，标签也取对应权重。",
    "AutoAugment 在 CIFAR 上搜出\"反色+平移\"高效策略。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def cutmix(x, y, x2, y2, alpha)：实现 cutmix 增强（x2/y2 为另一张图及其标签）。",
    "Beta(alpha,alpha).sample()：采样混合比例 lam。",
    "随机取块区域 r,c 与大小 bh,bw。",
    "b[...] = x2[...]：把【另一张图】x2 的块贴到 x 上（cutmix 必须跨样本混合，贴同图是 no-op），返回混合图与 lam*y+(1-lam)*y2（标签按块面积比例混合）。"
  ],
  "followUps": [
    {
      "question": "mixup 的标签为什么也要混合？",
      "answer": "它把样本视为流形上邻点，监督目标从 one-hot 变为软标签，使决策边界更平滑、提升校准与鲁棒。"
    },
    {
      "question": "autoaugment 的搜索代价如何降低？",
      "answer": "后续方法如 RandAugment 用固定操作集+单一幅度参数，去掉策略搜索，大幅降低算力。"
    }
  ],
  "followUpAnswers": [
    "它把样本视为流形上邻点，监督目标从 one-hot 变为软标签，使决策边界更平滑、提升校准与鲁棒。",
    "后续方法如 RandAugment 用固定操作集+单一幅度参数，去掉策略搜索，大幅降低算力。"
  ],
  "order": 12
};
