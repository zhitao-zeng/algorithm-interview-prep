export default {
  kind: 'concept',
  id: 'semantic-vs-acoustic-token',
  category: '语音大模型',
  difficulty: 'Medium',
  title: '语义 Token 与声学 Token',
  prompt: '语义 token 和声学 token 分别保留什么信息？它们一定对应 RVQ 的第一层和后续层吗？',
  quickAnswer: '语义 token 主要服务“说了什么”，声学 token 主要服务“怎么说的”。二者是按用途区分，不是普通 RVQ 天然形成的固定层级。像 SpeechTokenizer 这样的模型会专门用 HuBERT 语义蒸馏约束第一层，才让第一层更偏内容、后续层补充音色与韵律。',
  approach: '先按信息目标区分内容与副语言信息，再看 tokenizer 的训练目标：只有第一层接受了语义教师或等价约束时，才可以把它解释为语义层；普通 codec 的 RVQ-1 只能先称为较粗的声学码。',
  explanationFocus: '核心不是背“第几层”，而是判断每层被什么损失训练、实际保留了哪些信息。',
  bruteForce: '仅凭 RVQ 层号给 token 贴“语义/声学”标签，会把专门设计的 SpeechTokenizer 结论误套到普通 EnCodec 一类重建 codec 上。',
  derivation: [
    '为什么需要：语言推理希望表示紧凑并突出内容，声音重建则必须保留说话人、音高、节奏和环境等细节。',
    '怎么实现：语义单元可来自自监督语音模型的聚类；声学单元常来自以波形重建为目标的 codec。若想在同一 RVQ 中分层，需要给第一层额外的语义蒸馏目标。',
    '有什么代价：越强调语义不变性，越可能丢失音色和情绪；越强调重建保真，token 序列和码本通常越重。',
    '怎么评测：内容侧看音素相关性、ASR 可懂度或语义任务；声学侧看重建质量、说话人相似度、F0/韵律保持，不能只听一个样例。',
  ],
  invariant: '“语义层”必须由训练目标和评测证据支持，不能由层号直接推出。',
  walkthrough: '先问 token 从哪里来，再看训练损失，最后用内容保持与音色保持两组指标验证分工。',
  edgeCases: [
    '同一句话由不同人说时，语义 token 应更稳定，但不保证逐 token 完全相同。',
    '普通重建 codec 的第一层可能仍携带大量说话人和信道信息。',
    '低资源语言上，语义教师本身可能没有学好该语言，第一层也会失真。',
  ],
  code: "def inspect_tokenizer(wav, semantic_encoder, acoustic_codec):\n    semantic = semantic_encoder.encode_units(wav)\n    acoustic_layers = acoustic_codec.encode_rvq(wav)\n    # 下面的标签来自两个模型的训练目标，不来自层号猜测\n    return {'content_units': semantic, 'reconstruction_codes': acoustic_layers}",
  codeNotes: [
    '这段代码只说明两类 token 的来源，不是可直接运行的统一 API。',
    '若使用 SpeechTokenizer，应额外说明第一层接受了语义蒸馏。',
  ],
  complexity: 'token 数量由帧率、码本层数和每层码率共同决定；多一层 RVQ 会增加码率与生成头的计算，不能只说“层数越多越好”。',
  followUps: [
    { question: '为什么 SpeechTokenizer 的第一层可以叫语义层？', answer: '因为它不是只做波形重建，而是用 HuBERT 表征或伪标签对第一量化层做语义蒸馏；论文还用音素相关指标验证了这一点。' },
    { question: '普通 RVQ 第一层能不能直接送进 LLM？', answer: '可以实验，但应先验证内容密度和跨说话人稳定性。它可能只是粗声学码，不一定是好的语言建模单元。' },
  ],
  followUpAnswers: [
    '先核对训练目标，再用内容与声学两组指标验证。',
    '不要把 SpeechTokenizer 的专门设计泛化成 RVQ 的天然性质。',
  ],
  pitfalls: [
    '说“RVQ 第一层天然就是语义”——错误，语义分层需要专门训练。',
    '说“同一句话的语义 token 必须完全一样”——实际还受发音、语言和 tokenizer 影响。',
  ],
  beginnerSummary: '把语音想成“台词”和“表演”。语义 token 更关心台词内容，声学 token 更关心谁在说、怎么说。要特别注意：普通音频 codec 只是从粗到细重建声音，并不会自动把第一层变成“台词层”；只有额外教过它内容信息，才可以这样解释。',
  prerequisites: [
    '离散 token：把连续声音映射成有限编号，方便序列模型处理。',
    'RVQ：多层码本依次量化剩余误差，以更多码率换取更好重建。',
    '语义蒸馏：用内容表征教师约束某层更关注音素和语言信息。',
  ],
  workedExample: [
    '示意：同一句“你好”由两个人说，先比较内容 token 的稳定性，再比较声学 token 能否保留两种音色。',
    '对普通 codec 和带语义蒸馏的 tokenizer 分别做实验；若后者第一层的音素相关性更高，才能说分层设计生效。',
  ],
  lineByLine: [
    '先得到专门的内容单元和重建码。',
    '不要把 acoustic_layers[0] 自动重命名为 semantic。',
    '通过评测结果决定每组 token 的用途。',
  ],
  diagram: '波形 ─▶ 语义模型 ─▶ 内容 token（说什么）\n  └──▶ 声学 codec ─▶ RVQ 多层码（怎么说）\n只有额外语义蒸馏时，RVQ 第 1 层才可被训练成偏内容的层',
  references: [
    { title: 'SpeechTokenizer: Unified Speech Tokenizer for Speech Language Models', url: 'https://arxiv.org/abs/2308.16692' },
  ],
};
