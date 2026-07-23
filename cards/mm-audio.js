export default {
  "kind": "concept",
  "id": "mm-audio",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "音频模态接入",
  "prompt": "音频(语音/ASR)这类模态是怎么接入多模态大模型的？",
  "quickAnswer": "音频通常先经音频编码器(如 Whisper encoder / HuBERT)提取声学特征，再切帧/池化成人耳\"听觉 token\"，经连接器对齐到 LLM 词空间；也可先 ASR 转文本再当文本模态(但丢语调/情绪)。端到端做法让模型直接消费音频 token，能理解语气、音乐、非语言声。挑战是采样率高、序列长、需降采样与对齐。",
  "approach": "音频波形 → 声学编码器 → 听觉 token → 连接器对齐 → 拼入 LLM。",
  "explanationFocus": "是什么：音频模态接入是用声学编码器把声音波形变成\"听觉 token\"，对齐到 LLM 空间后与其他模态统一消费，从而让模型听懂语音乃至语气。",
  "bruteForce": "先 ASR 转文本再喂 LLM：丢失语调/情绪/非语言声。",
  "derivation": [
    "为什么需要：语音含语气、情感、音乐等文本无法表达的信息，直接转文本会丢模态特有语义。",
    "怎么实现：波形经梅尔谱/特征提取 → 声学编码器(Transformer/CNN) → 帧池化降采样成听觉 token → 连接器投影对齐 → 拼入统一序列。",
    "有什么代价：音频采样率高、原始序列极长，需大幅降采样；对齐更难；多说话人/噪声易混。",
    "怎么评测：语音 QA、情感识别、ASR 错误率兜底、跨模态检索。"
  ],
  "invariant": "相同音频经固定编码器得到确定听觉 token，且与文本空间对齐。",
  "walkthrough": "30s 音频 16kHz → 梅尔谱 → 编码器 → 每 40ms 一帧池化为约 750 听觉 token。",
  "edgeCases": [
    "背景噪声/多说话人：需前端降噪或说话人分离。",
    "超长音频：需分段或摘要。",
    "非语音声(音乐/警报)：纯 ASR 路线失效。"
  ],
  "code": "def audio_to_tokens(wave, encoder, downsample=4):\n    mel = mel_spectrogram(wave)            # 声学特征\n    feat = encoder(mel)                    # 帧级声学表征\n    tokens = feat[::downsample]            # 降采样成听觉 token\n    return connector(tokens)               # 对齐到 LLM",
  "codeNotes": [
    "降采样控制序列长度。",
    "端到端保留语气/情感。"
  ],
  "complexity": "原始帧数随时长线性，降采样后 O(L'/d) 近似。",
  "followUps": [
    {
      "question": "端到端音频和先 ASR 转文本差在哪？",
      "answer": "ASR 丢语调/情绪/非语言声；端到端听觉 token 保留这些，但训练更难、序列更长。"
    },
    {
      "question": "音频 token 为什么这么长？",
      "answer": "采样率高、每秒上百帧，必须经降采样/池化压缩才能进 LLM。"
    }
  ],
  "followUpAnswers": [
    "端到端保留语气情感。",
    "采样率高需降采样。"
  ],
  "pitfalls": [
    "以为 ASR 转文本就够了。",
    "忽略降采样导致序列爆炸。"
  ],
  "beginnerSummary": "接入音频就像给模型装耳朵：先把声音波形变成一串\"听觉词\"(听觉 token)，翻译成它能懂的口径再听它回答。简单办法是先用语音转文字软件把话写成字(但听不出语气哭笑)；高级办法让它直接听声音，连你生气还是开心都能懂。声音太快太多，得抽稀成合适的\"词\"数。",
  "prerequisites": [
    "音频需先编码成 token。",
    "需对齐到 LLM 空间。",
    "采样率高需降采样。"
  ],
  "workedExample": [
    "30s 音频 → 约 750 听觉 token。",
    "端到端保留语气情感。"
  ],
  "lineByLine": [
    "波形转梅尔谱特征。",
    "声学编码器提帧表征。",
    "降采样成听觉 token。",
    "连接器对齐入 LLM。"
  ],
  "diagram": "波形 ─▶ 梅尔谱 ─▶ 声学编码器 ─▶ 降采样 ─▶ 听觉token ─▶ LLM"
};
