export default {
  "kind": "concept",
  "id": "semantic-vs-acoustic-token",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "语义 Token 与声学 Token",
  "prompt": "语音里的“语义 token”和“声学 token”分别指什么？为什么大模型常先用语义 token？",
  "quickAnswer": "语义 token 编码“说了什么”（内容/语言信息，如 HuBERT 离散单元），声学 token 编码“怎么说的”（音色/韵律/细节）。大模型先用语义 token 做理解与生成，再用声学 token 还原音色与副语言。",
  "approach": "语义 token 编码“说了什么”（内容/语言信息），声学 token 编码“怎么说的”（音色/韵律/细节）。大模型先用语义 token 做理解与生成，再用声学 token 还原音色与副语言。",
  "explanationFocus": "语义=内容，声学=音色/细节；二者目标不同、互补。",
  "bruteForce": "直接用原始波形或纯声学 token 做 LLM，内容建模弱、序列极长。",
  "derivation": [
    "LLM 擅长语言/语义推理，先把语音压成语义单元最自然。",
    "但语义单元丢失说话人音色、情感、呼吸等细节，无法高保真合成。",
    "因此推理用语义 token，生成时用声学 token/RVQ 还原细节。"
  ],
  "invariant": "语义 token 保持“内容可懂度”，声学 token 保持“说话人/风格一致性”。",
  "walkthrough": "以 SpeechTokenizer 为例：第 1 层码本≈语义，第 2..N 层≈声学残差。",
  "edgeCases": [
    "同音词：语义 token 相同但声学 token 不同（语气差异）。",
    "多说话人：语义相同，声学 token 区分说话人。",
    "低资源语言：语义码本稀疏，需大语料训练。"
  ],
  "code": "# Python\ndef split_tokens(hubert_units, quantizer):\n    semantic = hubert_units                      # 第1层: 语义/内容\n    acoustic = quantizer.residual(hubert_units)  # 2..N层: 声学细节\n    return semantic, acoustic",
  "codeNotes": [
    "语义 token 通常来自 HuBERT/Kmeans 离散化。",
    "RVQ 第 1 层近似语义，后续层补足声学。"
  ],
  "complexity": "量化 O(T·K)（K 为码本大小），推理时语义路径仅用第 1 层，省算力。",
  "followUps": [
    {
      "question": "为什么不直接用声学 token 做 LLM 输入？",
      "answer": "声学 token 序列长且高度冗余（音色逐帧变化），语义密度低，LLM 难学语言结构且成本高；语义 token 更紧凑、更贴近文本。"
    },
    {
      "question": "SoundStream/SpeechTokenizer 怎么分层？",
      "answer": "用 RVQ 多层码本：第1层承载主要语义，余下各层编码声学残差，解码时多层拼接恢复高保真波形。"
    }
  ],
  "followUpAnswers": [
    "用 HuBERT 表征做 Kmeans 得到语义单元。",
    "生成端用声学 RVQ 还原说话人音色。"
  ],
  "pitfalls": [
    "把声学 token 当语义用，导致内容理解差。",
    "忽略说话人信息丢失，合成千人一声。"
  ],
  "beginnerSummary": "同一句话“你好”可以用不同声音、不同情绪说出来。语音里有两种信息：语义 token 记录“说了什么”（内容），声学 token 记录“怎么说的”（谁在说、什么情绪、什么音调）。大模型先处理语义 token 来理解与生成文字内容，再用声学 token 把具体的声音细节补回来，这样既能听懂，又能合成有辨识度的声音。",
  "prerequisites": [
    "同一句话可以有不同音色/情绪。",
    "离散 token 是“把连续声音映射到有限编号”。",
    "大模型更擅长处理“内容/语义”而非原始声学细节。"
  ],
  "workedExample": [
    "“你好”由 A 说和由 B 说，语义 token 相同，声学 token 不同。",
    "SpeechTokenizer 第1层码本≈语义，第2~N层≈声学残差。"
  ],
  "lineByLine": [
    "Hubert/Kmeans 得到离散语义单元（内容）。",
    "RVQ 第1层≈语义，后续层≈声学残差。",
    "LLM 以语义 token 为输入/输出做推理。",
    "合成时再叠加声学 token 还原音色与韵律。"
  ],
  "diagram": "语音波形 ─▶ Encoder ─▶ RVQ 多层码本\n                ├─ 层1: 语义 token (说什么)\n                └─ 层2..N: 声学 token (怎么说的/音色)\nLLM 用 层1 推理, 合成用 全部层"
};
