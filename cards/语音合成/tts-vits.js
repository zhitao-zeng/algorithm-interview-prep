export default {
  "id": "tts-vits",
  "kind": "concept",
  "category": "语音合成",
  "title": "VITS：端到端 TTS（变分推断 + 归一化流 + 对抗训练）",
  "difficulty": "Hard",
  "prompt": "请解释 VITS 端到端 TTS 的结构与训练原理，说明变分推断、归一化流与对抗训练各自的作用？",
  "quickAnswer": "VITS 把文本前端、声学模型与声码器统一为一个端到端网络，直接从文本生成波形。它用变分自编码器（后验编码器+先验）建模语音潜变量，用归一化流（Normalizing Flow）把简单高斯先验变换成更灵活的语音分布，并用 HiFi-GAN 式判别器做对抗训练提升音质。推理时只走先验+流+解码器，无需 mel 中间表征。",
  "explanationFocus": "是什么：VITS 是一种完全端到端的 TTS 模型，将传统‘文本→mel→波形’级联压缩为单一可微网络。它把语音建模为潜变量 z，用变分推断（后验编码器从真实波形取 z、先验从文本生成 z）学习分布，用 Normalizing Flow 提升先验表达力，用对抗损失让生成波形更自然，从而在 mel 重建之外直接优化听感。",
  "approach": "核心思路是‘用隐变量桥接文本与波形并联合对抗优化’：训练时用后验编码器从真实音频抽 z 作为监督，先验网络从文本预测 z 的分布；归一化流把各向同性高斯变换成复杂分布；波形解码器（HiFi-GAN 生成器）把 z 还原成波形，判别器做多尺度对抗判别，使合成与真实难以区分。",
  "code": "import torch\nimport torch.nn as nn\n\nclass VITS(nn.Module):\n    def __init__(self, text_dim, z_dim):\n        super().__init__()\n        self.prior = TextPrior(text_dim, z_dim)   # 文本->z 分布\n        self.posterior = PosteriorEncoder(z_dim)   # 波形->z 分布\n        self.flow = ResidualFlow(z_dim)            # 归一化流\n        self.decoder = HiFiGANGenerator(z_dim)     # 波形生成器\n        self.disc = MultiScaleDiscriminator()      # 多尺度判别器\n\n    def forward(self, text, wav):\n        z_posterior = self.posterior(wav)          # 训练时真实 z\n        z_flowed, ldj = self.flow(z_posterior)\n        mu, logvar = self.prior(text)\n        kl = kl_loss(z_flowed, mu, logvar)         # 变分下界项\n        wav_hat = self.decoder(z_flowed)\n        adv = self.disc(wav_hat, wav)              # 对抗损失\n        return kl + adv",
  "complexity": "O(T) 训练与推理，T 为波形采样点数（生成器一阶卷积为主），较自回归快且并行",
  "beginnerSummary": "过去 TTS 分两步：先出频谱再出声音，两步都会丢信息。VITS 直接让模型从文字‘脑补’出声音的隐藏表示，再一步变出波形，并用‘真假判别’逼模型学得更像真人，整体更自然、训练更简单。",
  "derivation": [
    "为什么需要：级联 TTS 的 mel 重建损失不等于听感，且 mel 到波形再训练一次会累积误差；端到端直接优化波形可统一目标、提升自然度。",
    "怎么实现：以变分自编码器框架，后验编码器从真实波形抽潜变量 z，先验网络从文本预测 z 分布并用 KL 约束；归一化流对 z 做可逆变换提升先验灵活度；HiFi-GAN 生成器把 z 解码成波形，多尺度/多周期判别器做对抗训练。",
    "有什么代价：训练需要真实波形做后验，数据与时延要求高；对抗训练不稳定、需小心平衡 KL 与对抗权重；推理虽快但模型大、显存占用高。",
    "怎么评测：MOS 自然度（常优于级联）、MCD（谱距离）、RTF、以及 ablation 验证流/KL/对抗各自贡献。"
  ],
  "edgeCases": [
    "说话人 unseen：依赖 speaker embedding 的零样本泛化，否则音色漂移。",
    "极快/极慢语速：先验时长分布外推易失真。",
    "带噪训练数据：后验编码器会学到噪声，需数据清洗或加鲁棒损失。",
    "长文本生成：潜变量序列长，显存与流式切分需处理。"
  ],
  "pitfalls": [
    "把 KL 权重设得过大导致后验被先验压垮（后验坍塌），语音变平淡；过小则对齐混乱。",
    "忽略对抗与重建损失的平衡，判别器过强会让生成器只产‘骗过判别器’但听感差的样本。"
  ],
  "prerequisites": [
    "变分自编码器（VAE）与 KL 散度",
    "Normalizing Flow 可逆变换与 Jacobian 对数行列式",
    "生成对抗网络（GAN）与多尺度判别器"
  ],
  "workedExample": [
    "训练时：输入文本‘天气真好’与对应真人波形，后验编码器抽 z，先验网络从文本预测 z；两者 KL 拉近，解码出波形与真人波形被判别器比对。",
    "推理时：只跑先验->流->解码器，从文本采样 z 直接合成波形，不依赖 mel 也不需后验编码器。"
  ],
  "lineByLine": [
    "forward：先用 posterior 从真实 wav 取 z_posterior 作为训练目标分布。",
    "flow 对 z 做可逆变换并记录 log-det-jacobian（ldj），增强先验表达力。",
    "prior 从文本输出 (mu, logvar)，与 flowed z 计算 KL 形成变分下界。",
    "decoder 生成 wav_hat，disc 返回对抗损失，最终返回 kl+adv 联合目标。"
  ],
  "followUps": [
    {
      "question": "VITS 推理时为什么不需要后验编码器？",
      "answer": "后验编码器只在训练时提供真实语音的潜变量作监督；推理时直接从文本先验采样 z 并经流与解码器生成波形，因此可丢弃后验分支，实现纯文本到波形。"
    },
    {
      "question": "归一化流在 VITS 里具体起什么作用？",
      "answer": "文本先验初始是简单高斯，难以刻画语音复杂分布；流提供可逆非线性变换，将高斯映射为富有结构的语音潜分布，使先验更贴近后验，降低 KL 同时提升音质。"
    }
  ],
  "followUpAnswers": [
    "后验编码器只在训练时提供真实语音的潜变量作监督；推理时直接从文本先验采样 z 并经流与解码器生成波形，因此可丢弃后验分支，实现纯文本到波形。",
    "文本先验初始是简单高斯，难以刻画语音复杂分布；流提供可逆非线性变换，将高斯映射为富有结构的语音潜分布，使先验更贴近后验，降低 KL 同时提升音质。"
  ],
  "order": 2
};
