export default {
  "kind": "concept",
  "id": "speech-llm-pipeline",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "语音大模型整体架构",
  "prompt": "画出自带语音理解与生成的大模型（Speech LLM）的数据流：音频经过哪些模块最终输出文本与语音？",
  "quickAnswer": "Audio Encoder 提取声学特征 → Adapter 下采样/投影到 LLM 词空间 → LLM 做语义理解与文本生成 → Talker 把 LLM 隐状态解码成语音 token/波形。",
  "approach": "Audio Encoder 提取声学特征 → Adapter 下采样/投影到 LLM 词空间 → LLM 做语义理解与文本生成 → Talker 把 LLM 隐状态解码成语音 token/波形。",
  "explanationFocus": "四段式流水线：编码器、适配器、语言模型、说话器。",
  "bruteForce": "逐帧把音频直接当作文本训练，无法处理变长对齐与生成，且缺少高层语义。",
  "derivation": [
    "纯文本 LLM 听不到声音，必须把波形变成 LLM 能消费的表示。",
    "Audio Encoder 输出帧率太高、维度不对齐，需要 Adapter 压缩并投影。",
    "LLM 负责“理解+决策”，Talker 负责“发声”，二者解耦便于分别优化。"
  ],
  "invariant": "无论是否流式，四段式（编码→适配→LLM→说话）的接口与信息流向保持不变。",
  "walkthrough": "在白板上画出波形→Encoder→Adapter→LLM→Talker，并标出每段的输入/输出形状变化。",
  "edgeCases": [
    "长静音/噪声：Encoder 仍会输出帧，Adapter 需压缩冗余。",
    "流式场景：Adapter 与 LLM 必须支持增量/分块推理。",
    "多轮对话：Talker 生成要与下一轮收听对齐，避免互相打断混乱。"
  ],
  "code": "# Python\ndef speech_llm_forward(waveform, audio_encoder, adapter, llm, talker):\n    feats = audio_encoder(waveform)        # (T, D_a) 声学特征\n    tokens = adapter(feats)                 # (L, D_llm), L < T 下采样投影\n    text_ids = llm.generate(tokens)         # 自回归文本\n    wav = talker.decode(text_ids, tokens)   # 流式合成语音\n    return text_ids, wav",
  "codeNotes": [
    "Encoder 与 LLM 常冻结预训练权重，只训 Adapter/Talker。",
    "Talker 可用 VITS/流匹配或自回归 unit 解码。"
  ],
  "complexity": "前向时间 ≈ Encoder O(T·D²) + Adapter O(T·D·D′) + LLM 自回归 O(L·N²·d)（L 为生成长度，N 为上下文）。",
  "followUps": [
    {
      "question": "为什么需要 Adapter 而不是直接把 Encoder 输出喂给 LLM？",
      "answer": "Encoder 帧率(如 50Hz)远高于 LLM 词率(如 12.5Hz 或 token-level)，且维度/语义空间不同，Adapter 做下采样与时序对齐，降低 LLM 计算量并桥接表征。"
    },
    {
      "question": "Talker 和 TTS 有什么区别？",
      "answer": "TTS 以文本为条件独立合成；Talker 常以 LLM 隐状态/规划为条件，可与语义对齐、支持实时 duplex 与副语言（情感/节奏）。"
    }
  ],
  "followUpAnswers": [
    "用 CTC 合并冗余帧或 Q-Former 做跨模态下采样。",
    "冻结 LLM，只训 Adapter+Talking head，可大幅降低显存。"
  ],
  "pitfalls": [
    "把 Encoder 帧率直接当 token 率，导致 LLM 上下文爆炸。",
    "忽略流式增量，导致不可上线。"
  ],
  "beginnerSummary": "语音大模型让一个模型既能“听懂”语音又能“说出”语音。它通常分四段：先用 Audio Encoder 把声音变成一串特征；再用 Adapter 把这串特征压缩并翻译成大模型能看懂的“词向量”；然后 LLM 像平常一样理解并生成文本；最后 Talker 把模型想说的内容变成声音。理解这条流水线，就理解了所有语音大模型的骨架。",
  "prerequisites": [
    "声音被切成很多帧，每帧有特征向量。",
    "大语言模型(LLM)按“词/token”一步步生成文本。",
    "把声音接到 LLM 上，需要把“帧特征”变成“token 表示”。"
  ],
  "workedExample": [
    "你说“今天天气”→ Encoder 出 30 帧特征 → Adapter 压成 4 个向量 → LLM 理解并续写“不错” → Talker 合成语音。",
    "若直接把 30 帧喂 LLM，上下文会爆；Adapter 先压到 4 个，省算力。"
  ],
  "lineByLine": [
    "Audio Encoder：波形→声学特征序列（高帧率）。",
    "Adapter：下采样+线性投影到 LLM 维度。",
    "LLM：以适配后的特征为前缀，自回归生成文本 token。",
    "Talker：把 LLM 隐状态/规划解码为语音 unit 或波形。"
  ],
  "diagram": "波形 ─▶ Audio Encoder ─▶ Adapter ─▶ LLM ─▶ Talker ─▶ 语音\n (高帧率特征)    (下采样投影)   (理解/生成)   (合成)\n                              │\n                              └▶ 文本输出"
};
