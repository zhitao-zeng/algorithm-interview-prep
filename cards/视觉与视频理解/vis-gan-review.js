export default {
  "id": "vis-gan-review",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "GAN / VAE 基础回顾：对抗训练与模式崩溃",
  "difficulty": "Medium",
  "prompt": "GAN 与 VAE 的生成建模思路有何不同？GAN 的模式崩溃是什么，为什么它又为扩散模型铺垫？",
  "quickAnswer": "VAE 用变分下界最大化似然、靠编码器-解码器与 KL 正则生成，样本偏模糊；GAN 用生成器与判别器零和博弈，判别器逼生成器产出逼真样本，但易模式崩溃（只覆盖部分数据分布）。GAN 证明对抗训练能产出高保真图像，其对抗框架与稳定化技巧（如谱归一化）直接启发了扩散等后续生成模型。",
  "code": "import torch\n\ndef gan_loss(d_real, d_fake):\n    bce = torch.nn.functional.binary_cross_entropy\n    return bce(d_real, torch.ones_like(d_real)) + bce(d_fake, torch.zeros_like(d_fake))",
  "complexity": "O(iter·batch) 对抗迭代",
  "beginnerSummary": "让机器\"画画\"的两类老方法：VAE 像照着记忆描摹（稳但糊），GAN 像造假币者与警察互搏（真但难训），它为后来的扩散模型铺了路。",
  "explanationFocus": "是什么：GAN 是对抗式生成模型，VAE 是似然式生成模型；模式崩溃指生成器只学会部分数据模式，多样性丧失。",
  "approach": "GAN 最小化判别器区分真假的能力（minimax）；VAE 优化 ELBO 重建+KL；训练 GAN 需平衡二者，否则判别器过强导致梯度消失。",
  "derivation": [
    "为什么需要：传统似然模型生成锐度不足，对抗提供新优化目标。",
    "怎么实现：minimax 博弈 + 交替梯度更新，或 VAE 的 encoder-decoder。",
    "有什么代价：GAN 训练不稳定、模式崩溃、无显式似然；VAE 后验坍塌致模糊。",
    "怎么评测：IS/FID 衡量真实感与多样性，ELBO 衡量 VAE。"
  ],
  "edgeCases": [
    "判别器过强使生成器梯度接近零。",
    "数据多峰分布时生成器塌缩到单峰。",
    "小数据集 GAN 易过拟合判别器。"
  ],
  "pitfalls": [
    "混淆模式崩溃与训练不稳定，二者成因不同。",
    "以为 FID 低就代表样本多样，其实可能崩在少数模式。"
  ],
  "prerequisites": [
    "概率分布与最大似然",
    "卷积网络与梯度更新"
  ],
  "workedExample": [
    "DCGAN 用转置卷积生成 64x64 人脸，判别器卷积分类真假。",
    "VAE 把人脸编码到高斯潜空间，解码器按采样重建。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def gan_loss(d_real, d_fake)：判别器损失。",
    "bce(...)：二元交叉熵。",
    "返回真实判 1、伪造判 0 的损失和，使判别器变强以推动生成器。"
  ],
  "followUps": [
    {
      "question": "为什么 GAN 为扩散模型铺垫？",
      "answer": "它建立了\"对抗/迭代细化\"的高保真生成范式与诸多稳定化技术（谱归一化、hinge loss），扩散继承了逐步去噪与对抗判别的思想。"
    },
    {
      "question": "VAE 的 KL 项有什么作用？",
      "answer": "它把潜变量拉向标准正态，防止后验坍塌到单点，提供连续可插值的潜空间，代价是引入重构-正则权衡。"
    }
  ],
  "followUpAnswers": [
    "它建立了\"对抗/迭代细化\"的高保真生成范式与诸多稳定化技术（谱归一化、hinge loss），扩散继承了逐步去噪与对抗判别的思想。",
    "它把潜变量拉向标准正态，防止后验坍塌到单点，提供连续可插值的潜空间，代价是引入重构-正则权衡。"
  ]
};
