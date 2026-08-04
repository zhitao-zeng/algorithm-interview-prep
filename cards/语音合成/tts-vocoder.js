export default {
  "id": "tts-vocoder",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "神经声码器 HiFi-GAN 原理",
  "prompt": "以 HiFi-GAN 为例，神经声码器如何把梅尔谱高效还原为波形，兼顾质量与速度？",
  "quickAnswer": "HiFi-GAN 用多周期判别器(MPD)与多尺度判别器(MSD)对抗训练，生成器通过一维转置卷积逐级上采样梅尔到波形，推理极快且保真度高。",
  "code": "import torch.nn as nn\n\nclass HiFiGANGenerator(nn.Module):\n    def __init__(self, upsample_rates=(8, 8, 2, 2)):\n        self.ups = nn.ModuleList([\n            nn.ConvTranspose1d(1024, 512, k, k) for k in upsample_rates\n        ])\n    def forward(self, mel):\n        x = mel\n        for up in self.ups:\n            x = torch.tanh(up(x))\n        return x  # 波形",
  "complexity": "时间 O(t·r)，空间 O(t)（t 帧，r 上采样率）",
  "beginnerSummary": "声码器像把\"乐谱\"(梅尔谱)快速演奏成真实声音，HiFi-GAN 用多个评委(判别器)逼着它奏得更像真人。",
  "derivation": [
    "为什么需要：Griffin-Lim 等传统方法音质差、有相位问题，需神经声码器还原细节。",
    "怎么实现：生成器转置卷积上采样，MPD+MSD 多视角对抗；加特征匹配损失稳定训练。",
    "有什么代价：对抗训练易模式崩塌；上采样率乘积需等于总倍数。",
    "怎么评测：MOS、PESQ/STOI 客观指标与逐层特征匹配误差。"
  ],
  "edgeCases": [
    "静音段产生的底噪需要抑制。",
    "高采样率(48k)下高频伪影更明显。",
    "输入梅尔缺失高频能量导致发闷。",
    "训练数据分布外的音色易失真。"
  ],
  "pitfalls": [
    "上采样率乘积算错导致输出长度与音频不匹配。",
    "只用 MSD 忽略周期结构，高频容易糊。"
  ],
  "prerequisites": [
    "梅尔谱与短时傅里叶变换",
    "GAN 与判别器设计"
  ],
  "workedExample": [
    "输入 80 维梅尔(帧×80)→生成器逐级上采样到波形。",
    "判别器对真实/生成波形打分，反向更新生成器逼近真实分布。"
  ],
  "lineByLine": [
    "class HiFiGANGenerator(nn.Module)：定义生成器。",
    "self.ups = nn.ModuleList([...])：按上采样率堆叠转置卷积。",
    "x = torch.tanh(up(x))：逐级上采样并激活。",
    "return x：输出时域波形。"
  ],
  "followUps": [
    {
      "question": "MPD 与 MSD 有什么区别与作用？",
      "answer": "MPD 在不同周期上切分序列捕捉周期结构，MSD 在多分辨率上捕捉整体结构，二者互补提升音质。"
    },
    {
      "question": "如何把 HiFi-GAN 部署到端侧？",
      "answer": "转 ONNX 并做 INT8 量化，配合轻量推理后端如 sherpa-onnx 在 CPU/移动端运行。"
    }
  ],
  "followUpAnswers": [
    "MPD 在不同周期上切分序列捕捉周期结构，MSD 在多分辨率上捕捉整体结构，二者互补提升音质。",
    "转 ONNX 并做 INT8 量化，配合轻量推理后端如 sherpa-onnx 在 CPU/移动端运行。"
  ],
  "explanationFocus": "是什么：神经声码器把声学模型输出的梅尔谱还原成时域波形；HiFi-GAN 以生成器+多判别器对抗训练实现高保真、低延迟合成。",
  "approach": "用一维转置卷积生成器逐级上采样梅尔，配合多周期与多尺度判别器的对抗损失与特征匹配损失，逼近真实波形分布。",
  "kind": "concept"
};
