export default {
  "kind": "concept",
  "id": "continuous-vs-discrete-speech",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "连续 vs 离散语音表示",
  "prompt": "语音表示有“连续向量”和“离散 token”两种，各有什么优缺点？语音大模型怎么选？",
  "quickAnswer": "连续表示（Encoder 隐状态）信息完整、保真高但序列长、难与 LLM 词表对齐；离散 token（RVQ/VQ 单元）可像文本一样被 LLM 自回归生成、易训练，但有量化损失。主流做法：理解端用连续特征接 Adapter，生成端用离散 unit 自回归。",
  "approach": "连续表示信息完整、保真高但序列长、难与 LLM 词表对齐；离散 token 可像文本一样被 LLM 自回归生成、易训练，但有量化损失。主流做法：理解端用连续特征接 Adapter，生成端用离散 unit 自回归。",
  "explanationFocus": "连续=高保真难对齐；离散=易生成有损。按“理解/生成”分工。",
  "bruteForce": "全程连续喂 LLM 自回归，序列过长且梯度难训；全程离散则保真下降。",
  "derivation": [
    "连续特征保真但和文本 token 不在同一离散空间，直接自回归不一致。",
    "离散 unit 可与文本共用自回归框架，训练目标统一（CE）。",
    "折中：输入用连续(经 Adapter)，输出用离散 unit 自回归合成。"
  ],
  "invariant": "无论连续/离散，都要保持时间对齐与内容一致性。",
  "walkthrough": "对比两条路：Continuous-to-Continuous vs Discrete-token（如 SpeechGPT）。",
  "edgeCases": [
    "连续路径显存大、训练慢。",
    "离散路径有量化噪声，合成略糊。",
    "混合路径需处理两种模态的对齐损失。"
  ],
  "code": "# Python\ndef speech_repr(wav, encoder, quantizer=None):\n    cont = encoder(wav)                 # 连续向量 (T, D)\n    if quantizer is None:\n        return cont                     # 连续表示(高保真)\n    return quantizer.encode(cont)       # 离散 token 序列",
  "codeNotes": [
    "连续常用于 ASR 编码器输出、作为 LLM 前缀。",
    "离散常用于“语音版 next-token prediction”。"
  ],
  "complexity": "连续 O(T·D²)；离散额外 O(T·L·K) 量化，但生成时可复用 LLM 的 O(L·N²) 自回归。",
  "followUps": [
    {
      "question": "为什么很多 Speech LLM 用离散 unit 做生成？",
      "answer": "离散 unit 让“语音生成”退化成和文本一样的 next-token 预测，可直接套用 LLM 训练范式与采样策略，工程简单、可规模化。"
    },
    {
      "question": "连续表示就完全没用吗？",
      "answer": "不是。理解端常保留连续特征以保信息；仅生成端为适配自回归而离散化，或用语义+声学两层分别处理。"
    }
  ],
  "followUpAnswers": [
    "用连续特征做 LLM 前缀，离散 unit 做输出。",
    "量化损失可用多码本 RVQ 缓解。"
  ],
  "pitfalls": [
    "把连续特征直接当 token 自回归，训练目标不一致。",
    "过度离散导致合成音质下降。"
  ],
  "beginnerSummary": "语音可以有两种“写法”：连续写法像一张高清照片（信息完整但占地方、不好逐字生成）；离散写法像用一套编号把声音“拼写”出来（方便像打字一样一个接一个生成，但会丢失一点细节）。语音大模型通常两头占：让模型“听懂”时用连续特征保留细节，让模型“说话”时用离散编号方便自回归生成。",
  "prerequisites": [
    "声音可表示为一串向量（连续）。",
    "离散化=用有限编号替代向量。",
    "自回归生成更适合离散 token。"
  ],
  "workedExample": [
    "连续：Encoder 输出 (T,1024) 浮点向量，保真但长。",
    "离散：RVQ 编成 (T, L) 整数序列，可直接 CE 训练生成。"
  ],
  "lineByLine": [
    "Encoder 得连续声学特征。",
    "若需保真/理解，直接用作 LLM 前缀（连续）。",
    "若需生成，经量化器离散成 token 序列。",
    "离散 token 用交叉熵做 next-token 训练。"
  ],
  "diagram": "连续: 波形 ─▶ Encoder ─▶ (T,D) 浮点  ─▶ LLM前缀(理解)\n离散: 波形 ─▶ Encoder ─▶ RVQ ─▶ (T,L) 整数 ─▶ 自回归生成"
};
