export default {
  "id": "tts-llm-tts",
  "kind": "concept",
  "category": "语音合成",
  "title": "LLM-TTS / 语音大模型合成（VALL-E、AudioPaLM、SoundStream）",
  "difficulty": "Hard",
  "prompt": "请说明语音大模型（如 VALL-E / AudioPaLM / SoundStream）的合成范式，如何从文本或说话人提示生成语音，与传统 TTS 有何不同？",
  "quickAnswer": "语音大模型把语音 token 化（如 EnCodec/SoundStream 神经编解码器把波形压成离散 token），再用类 LLM 的自回归/非自回归 Transformer 在‘文本 token + 说话人提示 token’条件下生成语音 token，最后由解码器还原波形。它支持零样本声音克隆（给 3 秒参考即可模仿音色）、多语种与风格控制，把 TTS 从专用流水线升级为统一生成范式。",
  "explanationFocus": "是什么：LLM-TTS（语音大模型合成）指用大规模语言模型式架构做语音合成，先由神经音频编解码器（SoundStream/EnCodec）把波形离散化成 token 序列，再用 Transformer 在文本与说话人提示条件下自回归（VALL-E）或并行（AudioPaLM）地生成语音 token，最后由编解码器解码回波形。",
  "approach": "核心思路是‘把语音当语言来生成’：用残差向量量化（RVQ）把波形编码成多层 token；训练时用大规模无标注/弱标注语音做 next-token 预测；推理时以文本 token 和声纹提示（参考音频的 token）为条件，模型‘续写’出目标语音 token 再解码。零样本克隆天然来自‘提示条件生成’而非显式说话人建模。",
  "code": "import torch\n\ndef vall_e_generate(text_tokens, prompt_tokens, model, codec):\n    # 用参考音频 token 作提示，条件生成语音 token\n    cond = torch.cat([prompt_tokens, text_tokens], dim=-1)\n    speech_tokens = model.autoregressive(cond)       # 自回归续写语音 token\n    wav = codec.decode(speech_tokens)                # 编解码器还原波形\n    return wav\n\ndef zero_shot_clone(text, ref_wav, model, codec):\n    prompt_tokens = codec.encode(ref_wav)            # 3s 参考提取声纹 token\n    return vall_e_generate(tokenize(text), prompt_tokens, model, codec)",
  "complexity": "O(L) 语音 token 长度自回归生成；可借 KV-cache/并行解码加速，仍高于卷积声码器",
  "beginnerSummary": "传统 TTS 是‘专用工厂’一步步加工；语音大模型则把声音先变成一串‘语音文字’（token），再用大模型像写作文一样根据提示（要说什么+参考音色）把这段‘语音文字’写出来，再翻译回声音。好处是给几秒样本就能模仿任何人声。",
  "derivation": [
    "为什么需要：传统 TTS 对说话人/语种/风格需单独建模与微调，难以大规模统一；零样本克隆与海量数据利用需求推动范式升级。",
    "怎么实现：SoundStream/EnCodec 用 RVQ 把波形压成离散 token；VALL-E 用两层自回归 Transformer 先生成语义 token 再生成声学 token；AudioPaLM 把文本与语音 token 同处一个词表做多模态生成。",
    "有什么代价：自回归 token 生成慢、易暴露量化噪声；RVQ 层数决定音质上限；需海量多说话人数据，推理显存与延迟高。",
    "怎么评测：说话人相似度（ speaker embedding cosine）、MOS、可懂度（ASR-WER）、零样本克隆成功率。"
  ],
  "edgeCases": [
    "参考音频过短或含噪：声纹提示不稳，克隆失真。",
    "目标文本含未见语言混合：跨语种 token 分布外易跑调。",
    "长音频 token 序列：KV-cache 显存爆炸，需分块。",
    "量化伪影：低码率 RVQ 产生金属/水泡声。"
  ],
  "pitfalls": [
    "把编解码器重建损失当成听感代理，忽视高层语义与韵律，导致‘清晰但机械’。",
    "零样本克隆过度依赖参考音质量，误以为任意参考都能高保真，实际对录音条件敏感。"
  ],
  "prerequisites": [
    "Transformer 自回归生成与 token 化",
    "神经音频编解码器与残差向量量化（RVQ）",
    "说话人嵌入与零样本学习概念"
  ],
  "workedExample": [
    "VALL-E：给 3 秒‘参考说话人’音频 + 文本‘你好’，模型先编码参考得到声纹 token 作 prompt，再自回归生成匹配音色的语音 token 并解码。",
    "AudioPaLM：同一词表混合文本与语音 token，可输入‘语音提问’输出‘语音回答’，实现跨模态续写。"
  ],
  "lineByLine": [
    "vall_e_generate：把参考提示 token 与文本 token 拼接成条件序列。",
    "model.autoregressive：以该条件自回归续写目标语音 token（语义层再到声学层）。",
    "codec.decode：神经编解码器把离散 token 还原为时域波形。",
    "zero_shot_clone：仅用参考音频 encode 出提示，无需任何微调即可模仿音色。"
  ],
  "followUps": [
    {
      "question": "VALL-E 为什么能零样本克隆而传统 TTS 不行？",
      "answer": "传统 TTS 需为说话人训练或微调显式声纹模型；VALL-E 把合成建模为‘条件续写’，推理时把参考音频的 token 作为 prompt 注入，模型从海量多说话人数据中学到‘按提示模仿’的泛化能力，故无需微调即可克隆。"
    },
    {
      "question": "SoundStream/EnCodec 的 RVQ 层数如何影响质量与延迟？",
      "answer": "RVQ 层数越多可还原的细节越丰富、音质越高，但 token 序列更长、码率更高、推理与存储成本上升；层数少则延迟低但量化伪影明显，需在音质与效率间权衡。"
    }
  ],
  "followUpAnswers": [
    "传统 TTS 需为说话人训练或微调显式声纹模型；VALL-E 把合成建模为‘条件续写’，推理时把参考音频的 token 作为 prompt 注入，模型从海量多说话人数据中学到‘按提示模仿’的泛化能力，故无需微调即可克隆。",
    "RVQ 层数越多可还原的细节越丰富、音质越高，但 token 序列更长、码率更高、推理与存储成本上升；层数少则延迟低但量化伪影明显，需在音质与效率间权衡。"
  ],
  "order": 5
};
