export default {
  kind: 'concept',
  id: 'continuous-vs-discrete-speech',
  category: '语音大模型',
  difficulty: 'Medium',
  title: '连续 vs 离散语音表示',
  prompt: '连续音频表征和离散语音 token 各适合什么任务？为什么不能简单回答“理解用连续、生成用离散”？',
  quickAnswer: '连续表征保留更多细粒度信息，可以通过 adapter 作为 soft tokens 接入 LLM；离散 token 便于使用分类/自回归目标并控制码率，但量化会损失信息。常见系统确实会在理解端使用连续特征、生成端使用离散 codec token，但这只是常见选择，不是硬规则。',
  approach: '按四个问题选择表示：要保留哪些信息、序列有多长、训练目标是什么、下游需要理解还是重建。必要时使用连续输入与离散输出的混合方案。',
  explanationFocus: '连续/离散不是谁绝对更好，而是保真、长度、训练目标和部署成本的权衡。',
  bruteForce: '只凭“任务叫理解或生成”直接选表示，会忽略情感、说话人信息、token 帧率和可用解码器。',
  derivation: [
    '为什么需要：音频同时包含语言内容和大量声学细节，一种表示很难兼顾全部目标。',
    '怎么实现：连续路径用 encoder 输出加 adapter；离散路径用 VQ/RVQ 或语义 tokenizer 产生编号；混合路径让两类表示分别承担输入与输出。',
    '有什么代价：连续序列可能更长且占显存；离散表示受码本、帧率和量化误差限制。',
    '怎么评测：理解任务看 WER、问答或分类；生成任务看可懂度、音质与说话人保持；同时报告 token 率、延迟和显存。',
  ],
  invariant: '选择表示时必须同时说明信息保留、序列长度、训练目标和解码方式。',
  walkthrough: '对同一段音频分别得到 encoder 连续特征和 codec token，比较长度、下游效果和是否能重建波形。',
  edgeCases: [
    '情感识别虽然是理解任务，但细粒度连续特征可能比高度语义化 token 更重要。',
    '端到端语音生成也可能使用连续流匹配或扩散表示，并不一定全程离散。',
    '离散 token 帧率过高时，自回归成本仍然很大。',
  ],
  code: "def choose_representation(task):\n    if task.needs_waveform_reconstruction and task.can_use_codec:\n        return 'discrete_acoustic_tokens'\n    if task.needs_fine_grained_audio_understanding:\n        return 'continuous_encoder_features'\n    return 'compare_continuous_discrete_and_hybrid'",
  codeNotes: [
    '这是决策框架，不是按任务名称写死的生产逻辑。',
    '最后一个分支强调要通过实验选择。',
  ],
  complexity: '连续路径成本受帧数和隐藏维度影响；离散路径还受每秒 token 数、RVQ 层数与码本大小影响。统一比较时应换算成真实序列长度和每秒计算。',
  followUps: [
    { question: '连续表征能直接接 LLM 吗？', answer: '可以把投影后的连续向量当 soft tokens，但通常还需要压缩时间轴、对齐维度和训练分布。' },
    { question: '离散 token 为什么更方便生成？', answer: '它把输出变成有限类别序列，可以使用交叉熵和 next-token 预测；但声学 codec 往往每帧有多层码，生成仍不便宜。' },
  ],
  followUpAnswers: [
    '连续向量可以做 soft tokens，不需要强行对齐文本词表编号。',
    '离散的优势是可分类生成和码率可控，不代表没有信息损失。',
  ],
  pitfalls: [
    '说“连续向量不能进 LLM”——可以投影后作为 soft tokens。',
    '说“合成一定用连续，推理一定用离散”——方向通常写反且本身也不是硬规则。',
  ],
  beginnerSummary: '连续表示像保留较多细节的声音笔记，离散 token 像把声音压成有限编号。前者信息丰富但可能很长，后者方便像文字一样预测却会丢细节。选哪个要看你想听懂内容、识别情绪，还是要把声音重新生成出来。',
  prerequisites: [
    '音频特征：连续向量按时间描述短时声音。',
    '离散 token：用有限编号表示量化后的音频信息。',
    '序列预测：模型根据已有上下文生成下一编号或表示。',
  ],
  workedExample: [
    '示意：语音问答先用连续 encoder 特征，经 adapter 压缩后交给 LLM。',
    '示意：语音生成用 codec token 作为预测目标，再由 codec decoder 还原波形；同时保留连续韵律条件也很常见。',
  ],
  lineByLine: [
    '先看是否必须重建波形。',
    '再看任务是否依赖细粒度声学信息。',
    '不确定时比较连续、离散和混合三种方案。',
  ],
  diagram: '连续：波形 ─▶ Encoder ─▶ 连续 soft tokens ─▶ 理解 / 条件控制\n离散：波形 ─▶ Codec / Tokenizer ─▶ 离散 token ─▶ 序列生成 ─▶ 波形\n混合：连续输入 + 离散输出，或离散内容 + 连续韵律条件',
  references: [
    { title: 'Qwen2.5-Omni Technical Report', url: 'https://arxiv.org/abs/2503.20215' },
    { title: 'SpeechTokenizer: Unified Speech Tokenizer for Speech Language Models', url: 'https://arxiv.org/abs/2308.16692' },
  ],
};
