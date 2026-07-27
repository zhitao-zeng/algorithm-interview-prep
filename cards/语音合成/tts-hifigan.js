export default {
  "id": "tts-hifigan",
  "kind": "concept",
  "category": "语音合成",
  "title": "声码器 HiFi-GAN：神经声码器（mel→waveform）",
  "difficulty": "Medium",
  "prompt": "请说明 HiFi-GAN 神经声码器如何把 mel 频谱还原成波形，多尺度/多周期判别器如何工作，以及它为什么能实时？",
  "quickAnswer": "HiFi-GAN 是一个一维卷积生成器，通过逐级上采样的转置卷积把低帧率 mel 还原为高采样率波形，并用多感受野融合（MRF）模块增强局部细节。它用多尺度判别器（不同 STFT 分辨率）与多周期判别器（不同周期切片）联合对抗训练，迫使生成波形在频域与周期结构上逼真。纯卷积、无自回归使其可实时、低延时合成。",
  "explanationFocus": "是什么：神经声码器（neural vocoder）负责把声学模型输出的中间表征（通常是 mel 频谱）还原成时域波形。HiFi-GAN 是一种基于 GAN 的一维卷积声码器，相比 WaveNet 的自回归逐采样生成，它用全卷积生成器一次性并行产出波形，在保持高音质的同时实现远超实时的推理速度。",
  "approach": "核心思路是‘多分辨率对抗 + 局部感受野融合’：生成器用转置卷积逐级上采样 mel 到波形，并用多感受野融合模块（多个不同膨胀率的卷积残差块求和）捕捉多尺度局部结构；判别器侧同时用多尺度（不同下采样率）与多周期（按周期 reshape 成 2D 后卷积）判别器，从时频与周期两个角度施加对抗压力。",
  "code": "import torch\nimport torch.nn as nn\n\nclass HiFiGANGenerator(nn.Module):\n    def __init__(self, mel_channels=80, upsample_rates=(8,8,2,2)):\n        super().__init__()\n        self.conv_pre = nn.Conv1d(mel_channels, 512, 7, padding=3)\n        self.ups = nn.ModuleList([\n            nn.ConvTranspose1d(512//(2**i), 512//(2**(i+1)),\n                               (2,)*0 + (upsample_rates[i]*2,), stride=upsample_rates[i])\n            for i in range(len(upsample_rates))\n        ])\n        self.mrf = MultiReceptiveFieldFusion(256)   # 多感受野融合\n\n    def forward(self, mel):\n        x = self.conv_pre(mel)\n        for up in self.ups:                          # 逐级上采样到波形率\n            x = torch.tanh(up(x))\n        x = self.mrf(x)                             # 多尺度局部细节\n        return self.conv_post(x)                    # 输出波形",
  "complexity": "O(N) 一次前向，N 为采样点数；纯卷积可实时（RTF<1），无需自回归逐点生成",
  "beginnerSummary": "频谱像‘声音的乐谱’，声码器负责把它演奏成真实声音。HiFi-GAN 用一个全卷积网络一次性把乐谱‘画’成波形，再用几个‘评委’（判别器）从多个角度挑毛病，逼它越做越像真人，而且因为不用一个一个点地生成，速度非常快。",
  "derivation": [
    "为什么需要：WaveNet 等自回归声码器逐采样点生成，速度慢无法实时；需要高保真且可并行的替代。",
    "怎么实现：一维转置卷积逐级上采样 mel 至目标采样率，插入多感受野融合残差块丰富谐波/瞬态；对抗训练配合多尺度（不同 STFT 窗）与多周期判别器让波形在频域和周期结构上逼真。",
    "有什么代价：GAN 训练不稳定、需仔细调判别器权重与学习率；纯 L1/L2 重建会糊掉高频，需特征匹配等辅助损失；模型对 unseen 说话人/设备可能泛化下降。",
    "怎么评测：MOS 音质、STFT 谱距离、RTF（实时率，越小越实时）、以及主观可懂度。"
  ],
  "edgeCases": [
    "输入 mel 含噪或裁剪：生成波形可能爆音，需幅度裁剪/限幅。",
    "极低频或高基频语音：周期判别器周期选择需覆盖，否则细节丢失。",
    "跨语种/跨说话人：未训练分布外易产生金属声。",
    "极端采样率切换：上采样率组合需与训练一致。"
  ],
  "pitfalls": [
    "只用波形级 L1 重建损失，会平滑高频导致‘闷’；必须配合判别器与特征匹配损失。",
    "上采样率乘积必须等于 mel 帧率到采样率的转换比，否则相位/时长错位产生杂音。"
  ],
  "prerequisites": [
    "一维卷积与转置卷积（上采样）",
    "生成对抗网络与判别器设计",
    "STFT / mel 频谱与采样率关系"
  ],
  "workedExample": [
    "mel 帧率 80Hz、目标 16kHz：上采样率乘积需为 16000/80=200（如 8×5×5 或 8×8×2×2≈需校准），逐层转置卷积把 80 通道特征扩到波形长度。",
    "多周期判别器以周期 p=2,3,5,7,11 把波形 reshape 成 (p, N/p) 的 2D，用二维卷积判别，专门捕捉基频谐波结构。"
  ],
  "lineByLine": [
    "conv_pre：把 80 维 mel 投影到 512 维特征序列。",
    "ups：每个转置卷积按 upsample_rates 上采样，tanh 激活逐步抬升时间分辨率到波形率。",
    "mrf：多感受野融合模块对不同膨胀率卷积输出求和，补足局部细节。",
    "conv_post：1×1 卷积输出单通道波形样本。"
  ],
  "followUps": [
    {
      "question": "多周期判别器（MPD）相比普通判别器强在哪？",
      "answer": "语音是强周期信号，MPD 按不同周期把波形折叠成 2D 网格再用二维卷积判别，能显式建模谐波/基频结构，比只看时域或单一 STFT 的判别器更有效防止蜂鸣与金属声。"
    },
    {
      "question": "HiFi-GAN 能否用于非 TTS 任务？",
      "answer": "可以，它本质是通用波形生成器，也用于音乐生成、语音增强与神经音频编解码（如 SoundStream 的波形重建端），只要提供合适的条件输入或频谱表征。"
    }
  ],
  "followUpAnswers": [
    "语音是强周期信号，MPD 按不同周期把波形折叠成 2D 网格再用二维卷积判别，能显式建模谐波/基频结构，比只看时域或单一 STFT 的判别器更有效防止蜂鸣与金属声。",
    "可以，它本质是通用波形生成器，也用于音乐生成、语音增强与神经音频编解码（如 SoundStream 的波形重建端），只要提供合适的条件输入或频谱表征。"
  ]
};
