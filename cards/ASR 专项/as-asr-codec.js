export default {
  "id": "as-asr-codec",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "语音编解码与特征",
  "prompt": "为什么现代 ASR 多用 log-Mel 滤波器组而非原始波形或裸 MFCC，且近年又出现神经音频 codec？",
  "quickAnswer": "log-Mel 滤波器组贴近人耳临界带、降维且去相关性，比原始波形更易学习；神经 codec（如 EnCodec）把音频压成离散 token，使语音可作为“语言”被自回归模型直接生成，支撑语音合成与音频大模型。",
  "approach": "前端先用 STFT 取幅度谱，经梅尔滤波器组加权再取 log 得 80 维特征供 ASR；codec 路线则训练 encoder-decoder + 残差矢量量化，把波形编码为多层离散 token，供下游生成/识别共享表征。",
  "explanationFocus": "是什么：语音特征与编解码研究如何把波形表示为更适合模型的形式——传统用 log-Mel 滤波器组，新趋势用神经音频 codec 把语音压缩为离散 token，统一了识别、合成与生成。",
  "bruteForce": "直接用原始 16kHz 波形喂模型，序列过长、冗余高，网络难以学到音素结构；或只用裸 MFCC 缺少相位与细粒度信息。",
  "invariant": "无论特征如何变换，应能近似无损地重建可懂语音（codec 下），且同一音素的特征在同一说话人/信道下应保持聚类。",
  "walkthrough": "预加重 → 分帧加窗 → STFT 得幅度谱 → 梅尔滤波组加权 → log 压缩得特征；codec 路线：encoder 下采样 + RVQ 量化 → token，解码器由 token 重建波形。",
  "complexity": "log-Mel 计算为 O(T·n_fft·mel) 的轻量前端；神经 codec 训练需 encoder-decoder + 量化，推理为单次前向，token 率约 75Hz。",
  "beginnerSummary": "语音特征就像把声音“翻译”成图片：log-Mel 是给机器看的频谱图，神经 codec 则把声音压成一串“字”，让 AI 能像写作文一样生成语音。",
  "diagram": "waveform (16k)\n   |\nSTFT / fbank\n   |\ncodec tokens\n(e.g. EnCodec)",
  "code": "import torch\n\ndef stft(x, n_fft=400, hop=160):\n    return torch.stft(x, n_fft, hop)",
  "derivation": [
    "为什么需要：原始波形太长太冗余，直接学效率低；人耳对频率非线性感知，需要更符合听觉的特征表示。",
    "怎么实现：用 STFT+梅尔滤波组+log 压缩得到低维特征；或用神经 codec 经 encoder+残差矢量量化把波形压成离散 token。",
    "有什么代价：log-Mel 丢失相位、信息有损；codec 量化引入失真，且训练需配对音频与重建损失，token 率影响下游分辨率。",
    "怎么评测：用特征分类/识别 WER 衡量表达力，用 codec 的重建 PESQ/STOI 与下游任务表现衡量保真度。"
  ],
  "edgeCases": [
    "采样率不一致：16k 与 8k 模型特征尺度不同需重采样。",
    "高静音占比：分帧后大量近零帧，需 VAD 前置。",
    "codec 爆码：极低码率下量化失真致可懂度下降。",
    "信道失真：电话语音与麦克风特征分布偏移。"
  ],
  "pitfalls": [
    "忘记 log 压缩，线性幅度谱动态范围大、训练不稳定。",
    "把 codec token 当文本直接对齐，忽略其多层残差量化结构。"
  ],
  "prerequisites": [
    "STFT 与梅尔尺度",
    "矢量量化（VQ）与自编码器"
  ],
  "workedExample": [
    "16kHz 语音用 n_fft=400、hop=160 提 80 维 log-Mel，送入 Conformer 做识别。",
    "EnCodec 以 24kHz、7 层残差量化把音频压成 token，供语音生成模型自回归解码。"
  ],
  "lineByLine": [
    "def stft(x, n_fft=400, hop=160)：封装 STFT，默认 25ms 窗、10ms 帧移。",
    "torch.stft(x, n_fft, hop)：对波形分帧做短时傅里叶变换得复数谱。",
    "返回谱后通常再取幅度、过梅尔滤波组、取 log 得最终特征。"
  ],
  "codeNotes": [
    "实际 ASR 还会加预加重、汉明窗与归一化；codec 场景需接 RVQ 量化层。"
  ],
  "followUps": [
    {
      "question": "log-Mel 与神经 codec 能互相替代吗？",
      "answer": "不能简单替代：log-Mel 适合识别前端，codec token 适合生成/统一表征，常各自服务于识别与合成两端。"
    },
    {
      "question": "codec token 如何用于 ASR？",
      "answer": "可把 codec token 当输入序列训练识别模型，或作为中间表征桥接识别与合成，实现语音到语音的端到端建模。"
    }
  ],
  "followUpAnswers": [
    "不能简单替代：log-Mel 适合识别前端，codec token 适合生成/统一表征，常各自服务于识别与合成两端。",
    "可把 codec token 当输入序列训练识别模型，或作为中间表征桥接识别与合成，实现语音到语音的端到端建模。"
  ],
  "kind": "code"
};
