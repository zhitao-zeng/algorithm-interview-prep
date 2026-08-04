export default {
  "id": "tts-matcha-melo",
  "category": "语音合成",
  "difficulty": "Hard",
  "title": "Matcha-TTS 与 Melo-TTS 原理",
  "prompt": "Matcha-TTS 的非自回归流式合成与 Melo-TTS 的多语言/方言设计分别如何解决延迟与跨语言问题？",
  "quickAnswer": "Matcha-TTS 用基于流的时长模型一次前向产出梅尔，天然支持帧级流式输出、降低首包延迟；Melo-TTS 以共享底层+语言相关适配器实现多语言/方言零样本克隆，控制混读分布。",
  "code": "import torch\n\ndef matcha_inference(text, spk_emb):\n    # 非自回归：一次前向得到梅尔谱，支持流式分块\n    dur = duration_predictor(text)\n    mel = decoder(text, spk_emb)\n    return mel  # 可逐帧流式输出\n\ndef melo_inference(text, lang=\"en\"):\n    # 多语言/方言共享底层，顶层语言相关适配器\n    return adapter[lang](text)",
  "complexity": "时间 O(n)，空间 O(n)（n 为文本长度）",
  "beginnerSummary": "Matcha 像一次性把整段乐谱写好再逐页演奏（流式）；Melo 像同一个人会多国口音，换语言只换\"口音模块\"。",
  "derivation": [
    "为什么需要：自回归 TTS 延迟高、难流式；多语言需避免为每语种各训一个模型。",
    "怎么实现：Matcha 用非自回归 flow 预测梅尔并分块流式；Melo 共享编码器+每语言适配器，配合说话人嵌入做零样本。",
    "有什么代价：非自回归需良好时长预测；多语言共享易互相干扰，需控制 code-switch 分布。",
    "怎么评测：首包延迟、流式稳定性、各语言 MOS 与跨语言相似度。"
  ],
  "edgeCases": [
    "流式截断导致句末拖音或截断。",
    "方言内 code-switch 到普通话的比例失衡。",
    "罕见口音数据不足导致适配器欠拟合。",
    "长句流式缓冲溢出需分段边界处理。"
  ],
  "pitfalls": [
    "把 Matcha 当纯离线用会浪费其流式低延迟优势。",
    "Melo 多语言共享过强导致方言特色被\"普通话化\"。"
  ],
  "prerequisites": [
    "非自回归生成(如 Flow/Glow)",
    "说话人嵌入与零样本克隆"
  ],
  "workedExample": [
    "Matcha 输入文本→duration 预测→一次解码梅尔→逐帧推流到声码器。",
    "Melo 选 lang=\"en\" 适配器，同一说话人嵌入生成英文口音语音。"
  ],
  "lineByLine": [
    "def matcha_inference(text, spk_emb)：非自回归合成的入口。",
    "dur = duration_predictor(text)：预测各音素时长用于分块。",
    "mel = decoder(text, spk_emb)：一次前向得到全句梅尔谱。",
    "return adapter[lang](text)：Melo 按语言选择适配器生成对应口音。"
  ],
  "followUps": [
    {
      "question": "Matcha 如何实现流式而非等整句？",
      "answer": "解码器按预测时长分块产出梅尔帧，前端在固定 chunk 内边生成边送声码器，降低首包延迟。"
    },
    {
      "question": "Melo 如何防止方言被普通话同化？",
      "answer": "在微调时控制混读分布、统一数据条件，并对各语言适配器做独立的韵律约束，保留方言特色。"
    }
  ],
  "followUpAnswers": [
    "解码器按预测时长分块产出梅尔帧，前端在固定 chunk 内边生成边送声码器，降低首包延迟。",
    "在微调时控制混读分布、统一数据条件，并对各语言适配器做独立的韵律约束，保留方言特色。"
  ],
  "explanationFocus": "是什么：Matcha-TTS 是基于梯度流的非自回归流式 TTS；Melo-TTS 是多语言/多方言 TTS，支持零样本声音克隆。二者分别面向低延迟与跨语言能力。",
  "approach": "Matcha 用流模型一次产出梅尔并分块流式；Melo 以共享底层+语言相关适配器实现多语言/方言统一建模，并控制混读分布。",
  "kind": "concept"
};
