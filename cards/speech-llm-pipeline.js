export default {
  kind: 'concept',
  id: 'speech-llm-pipeline',
  category: '语音大模型',
  difficulty: 'Medium',
  title: '语音大模型整体架构',
  prompt: '画出一种常见的语音大模型数据流，并说明哪些模块是常见组件、哪些并非所有架构都必须有。',
  quickAnswer: '常见理解路径是“波形 → 音频 encoder → adapter/压缩 → LLM”，常见生成路径是“LLM 文本或隐藏表示 → Talker/语音生成头 → codec/声学解码 → 波形”。输入既可以是连续特征，也可以是离散语音 token；输出也可能是文本、语音或二者同时生成，因此不存在所有模型都完全相同的四段流水线。',
  approach: '先分理解端和生成端，再为每个接口写清表示类型、帧率/长度和是否流式。用具体模型举例时，再说明它选择了连续输入还是离散输入。',
  explanationFocus: '先掌握接口与数据类型，不把一张架构图误说成行业唯一标准。',
  bruteForce: '把原始高帧率音频直接塞进文本 LLM，既没有维度对齐，也会造成很长的序列；反过来，强行把所有输入都量化又可能损失理解需要的细节。',
  derivation: [
    '为什么需要：文本 LLM 不能直接消费波形，语音输出也不能由文本词表直接播放。',
    '怎么实现：理解端用 encoder 提取表征并经 adapter 压缩；生成端用文本、隐藏表示或语音 token 驱动专门的语音解码器。',
    '有什么代价：连续输入保留细节但序列较长；离散输入便于自回归但有量化损失；流式输出还要处理缓冲和不可回滚。',
    '怎么评测：分别看理解正确率、语音可懂度/自然度，以及首包延迟、实时率和长对话稳定性。',
  ],
  invariant: '每个模块都必须有明确的输入/输出表示与时间尺度；模块名字可以变，接口问题不会消失。',
  walkthrough: '在白板上先画两条输出：LLM 可以直接给文本，也可以把隐藏表示交给 Talker 生成语音。然后标注音频输入是否连续、语音输出是否离散。',
  edgeCases: [
    '只做语音理解的模型可能没有 Talker。',
    '端到端 speech-to-speech 模型可能没有显式 ASR 文本中间结果。',
    '流式模型要求 encoder、LLM 调度和声学解码都支持增量处理。',
  ],
  code: "def speech_model(waveform, encoder, adapter, llm, talker=None):\n    audio_repr = adapter(encoder(waveform))\n    text, hidden = llm.generate(audio_repr, return_hidden=True)\n    if talker is None:\n        return text\n    return text, talker.generate_stream(hidden, text)",
  codeNotes: [
    '这是常见接口草图，不代表每个模型都先量化输入。',
    'Talker 可以读取文本、隐藏表示或两者，具体以模型论文为准。',
  ],
  complexity: '主要成本来自输入音频序列长度、压缩后的上下文长度、LLM 生成长度和语音 token 帧率。比较架构时应报告真实长度与延迟，而不是套一个统一大 O。',
  followUps: [
    { question: '音频输入一定要先离散化吗？', answer: '不一定。Qwen2.5-Omni 等模型用音频 encoder 的连续表示接入 Thinker；Moshi 一类系统则大量使用音频 codec token。' },
    { question: 'Talker 等于普通 TTS 吗？', answer: '不一定。普通 TTS 主要以文本为条件；Talker 还可能持续读取 LLM 隐状态、对话上下文和流式文本。' },
  ],
  followUpAnswers: [
    '先分连续输入与离散输入两大家族。',
    '再分文本输出、语音输出和同步双输出。',
  ],
  pitfalls: [
    '说“语音大模型都把输入量化成 token”——并不成立。',
    '把 Talker、codec 和声码器混成一个模块，无法解释各自接口。',
  ],
  beginnerSummary: '可以把语音大模型分成“听”和“说”两边：听的一边把声音变成大模型能理解的表示；说的一边把大模型想表达的内容变回声音。不同模型走的桥不一样，有的保留连续声音特征，有的把声音变成编号，所以要先看数据怎么流，而不是死背模块名。',
  prerequisites: [
    '音频特征：波形通常先变成按时间排列的声学向量。',
    'Adapter：负责维度对齐与时间轴压缩，使音频表示适合 LLM。',
    '离散语音 token：可由 codec 解码回声学表示或波形。',
  ],
  workedExample: [
    '示意路径一：音频 encoder 输出连续帧，adapter 压缩后送入 LLM，LLM 直接回答文本。',
    '示意路径二：LLM 一边生成文本，一边把隐藏表示交给 Talker，Talker 生成语音 token 并流式解码。',
  ],
  lineByLine: [
    'encoder 提取音频表示。',
    'adapter 对齐维度并压缩时间轴。',
    'LLM 产生文本与高层表示。',
    '只有需要语音输出时才调用 Talker。',
  ],
  diagram: '理解：波形 ─▶ Audio Encoder ─▶ Adapter ─▶ LLM ─▶ 文本\n生成：                                 └─▶ Talker ─▶ 语音 token / 声学表示 ─▶ 波形',
  references: [
    { title: 'Qwen2.5-Omni Technical Report', url: 'https://arxiv.org/abs/2503.20215' },
    { title: 'Moshi: a speech-text foundation model for real-time dialogue', url: 'https://arxiv.org/abs/2410.00037' },
  ],
};
