export default {
  "id": "tts-tacotron",
  "kind": "concept",
  "category": "语音合成",
  "title": "声学模型 Tacotron 与 FastSpeech：自回归 vs 非自回归",
  "difficulty": "Medium",
  "prompt": "请对比 Tacotron 系列（自回归）与 FastSpeech（非自回归）声学模型的差异，并说明时长建模与端到端 TTS 的演进脉络？",
  "quickAnswer": "Tacotron 2 用编码器-注意力-解码器的自回归结构逐帧生成 mel 频谱，质量高但速度慢、易出错（重复/漏读）。FastSpeech 用 Transformer 非自回归结构，配合时长预测器把音素对齐到帧数后一次性并行生成，推理快且鲁棒。端到端 TTS 演进主线是：从级联（文本→音素→声学→声码器）到端到端（文本→频谱），再到非自回归与完全端到端（如 VITS）。",
  "explanationFocus": "是什么：声学模型（acoustic model）是端到端 TTS 的核心组件，负责把输入文本（字符/音素）映射为中间声学表征（通常是 mel 频谱）。Tacotron 2 采用编码器-注意力-解码器的自回归结构逐帧生成频谱；FastSpeech 采用基于 Transformer 的非自回归结构，配合时长预测器一次性并行生成全部帧，从而解决自回归的速度与鲁棒性问题。",
  "approach": "核心思路是‘先对齐、再生成’：自回归 Tacotron 用注意力在解码时隐式学习文本-频谱对齐，逐帧条件生成；非自回归 FastSpeech 先用时长预测器显式给出每个音素对应的帧数，再用长度规整（length regulation）把隐状态扩展到目标长度，从而彻底消除帧间依赖、实现并行合成。",
  "code": "import torch\nimport torch.nn as nn\n\ndef autoregressive_decode(encoder_out, mel_decoder, max_len=1000):\n    # 自回归 Tacotron：用上一帧 mel 预测下一帧，直到 <eos>\n    mel_prev = torch.zeros(1, 1, 80)        # 起始帧 (1, T=1, n_mels)\n    hidden = None\n    mels = []\n    for t in range(max_len):\n        mel_t, hidden = mel_decoder(mel_prev, encoder_out, hidden)\n        mels.append(mel_t)\n        if is_eos(mel_t):\n            break\n        mel_prev = mel_t                    # 帧间自回归依赖\n    return torch.cat(mels, dim=1)\n\ndef length_regulate(hidden, durations, mel_len):\n    # 非自回归 FastSpeech：按预测帧时长扩展隐状态\n    out = []\n    for h, d in zip(hidden, durations):\n        out.append(h.repeat(int(d), 1))     # 每帧重复 d 次\n    return torch.cat(out, dim=0)[:mel_len]",
  "complexity": "O(T) 每句合成，T 为输出帧数；并行度上 FastSpeech 为 O(1) 步自回归，Tacotron 需 T 步",
  "beginnerSummary": "语音合成（TTS）先把文字变成频谱图，再把频谱变成声音。‘声学模型’就是第一步的模型。老办法是一帧一帧地生成（自回归），慢但自然；新办法是先把每个字该发多长算好，再一口气全部生成（非自回归），又快又稳。",
  "derivation": [
    "为什么需要：传统级联 TTS 需要文本分析、时长模型、声学模型、声码器多步级联，错误会逐级累积且难以联合优化；端到端声学模型直接从文本生成频谱，简化了流程并提升自然度。",
    "怎么实现：Tacotron 用 CNN/RNN 编码器提取文本表征，结合位置敏感注意力让解码器逐帧对齐并生成 mel；FastSpeech 用时长预测器（在teacher-forcing下用真实对齐或自蒸馏获得）预测帧长，经长度规整后由非自回归 Transformer 并行解码。",
    "有什么代价：Tacotron 自回归推理慢、难以并行，且注意力失败会导致重复/漏读；FastSpeech 依赖准确的时长预测，对时长建模误差敏感，且单向并行损失了一定韵律连贯性，需要用 teacher（如 Transformer-TTS）蒸馏对齐。",
    "怎么评测：主观用 MOS 评自然度，客观用 mel 重建损失、对齐错误率（attention error）、推理 RTF（实时率）与 Word Error Rate（把合成音频再 ASR 看可懂度）。"
  ],
  "edgeCases": [
    "未见过的稀有词/专有名词：子词或字符级建模更易泛化，否则易念错。",
    "极长句或极短句：长句注意力易失焦，短句时长预测易抖动。",
    "数字、缩写、同形异音字（如‘重’chong/zhong）：需前端读音消歧或单独归一化。",
    "多音字与韵律边界：错误对齐会导致断句怪异。"
  ],
  "pitfalls": [
    "把 FastSpeech 时长预测器的监督信号当成‘真实’，实际常来自自回归 teacher 的注意力对齐，teacher 出错会被继承。",
    "误以为非自回归一定更好：并行带来速度，但单向长度规整会削弱跨帧依赖，低资源下质量可能不如自回归。"
  ],
  "prerequisites": [
    "序列到序列模型与注意力机制（encoder-decoder、attention）",
    "mel 频谱等声学表征与 STFT 基础",
    "Transformer 自注意力与位置编码"
  ],
  "workedExample": [
    "输入‘你好世界’：Tacotron 在注意力图上应沿对角线逐字对齐，逐帧吐出 4 个汉字对应的 mel 段。",
    "FastSpeech 中‘你/好/世/界’时长预测为 [8,8,10,10] 帧，经长度规整把 4 个音素隐状态扩展到 36 帧后再并行解码。"
  ],
  "lineByLine": [
    "autoregressive_decode：初始化起始静音帧 mel_prev，循环调用解码器，把上一帧作为条件输入，实现帧间自回归依赖。",
    "当 is_eos 命中或达 max_len 停止，拼接所有帧得到完整 mel 序列。",
    "length_regulate：对每对 (隐状态, 预测帧数) 用 repeat 平铺，再把序列截断到目标帧数，完成非自回归扩展。"
  ],
  "followUps": [
    {
      "question": "FastSpeech 的时长预测器标签从哪来？为什么需要蒸馏？",
      "answer": "通常用自回归 teacher（如 Transformer-TTS）的注意力/对齐作为软标签，因真实帧级对齐难获取；蒸馏让非自回归学生学到与自回归一致的对齐分布，否则时长预测无监督极易崩溃。"
    },
    {
      "question": "FastSpeech 2 相比 FastSpeech 1 主要改了什么？",
      "answer": "FastSpeech 2 直接用真实语音提取的时长（forced alignment）和音高/能量方差信息作监督，并引入 variance adaptor（pitch/energy predictor），减少对 teacher 的依赖、提升韵律与训练效率。"
    }
  ],
  "followUpAnswers": [
    "通常用自回归 teacher（如 Transformer-TTS）的注意力/对齐作为软标签，因真实帧级对齐难获取；蒸馏让非自回归学生学到与自回归一致的对齐分布，否则时长预测无监督极易崩溃。",
    "FastSpeech 2 直接用真实语音提取的时长（forced alignment）和音高/能量方差信息作监督，并引入 variance adaptor（pitch/energy predictor），减少对 teacher 的依赖、提升韵律与训练效率。"
  ],
  "order": 1
};
