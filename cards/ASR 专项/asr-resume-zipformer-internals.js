import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-zipformer-internals', category: 'ASR 专项', title: 'Zipformer 内部结构与流式状态',
  prompt: '简历写了 Zipformer-Transducer：请从多尺度帧率、模块堆叠、流式缓存和计算量解释为什么它适合端侧 ASR。',
  quickAnswer: 'Zipformer 在不同 stack 使用不同时间分辨率，让高帧率层保留局部细节、低帧率层承担长上下文建模，再通过跨尺度连接融合；流式部署必须显式维护卷积与注意力左上下文状态。',
  why: '只说“Zipformer 比 Conformer 快”不足以支撑模型选型，面试官会追问速度来自哪里、流式状态如何落地。',
  implementation: '画出特征下采样、多尺度 encoder stack、跨尺度融合和 RNN-T decoder；逐层列出 chunk、left context、缓存张量形状，并用相同数据与 decoder 横评精度、RTF 和峰值内存。',
  tradeoffs: '降采样过强会损伤短音素和边界；缓存越长精度越好但内存和首包时延增加；不同实现版本的 block 细节不能混讲。',
  evaluation: '除 CER/WER 外，按短词、长句、噪声和语速切片，报告 RTF、首包、峰值内存以及 chunk 改变后的精度曲线。',
  prerequisites: ['Transformer/Conformer 注意力与卷积', 'RNN-T encoder-predictor-joiner', '流式 chunk 与状态缓存'],
  workedExample: ['把 100 Hz 输入在不同 stack 压到 50/25 Hz，比较注意力序列长度与短词召回。', '将 left context 从 32 帧改为 64 帧，验证 CER 收益是否值得额外缓存。'],
  edgeCases: ['极短唤醒词在强下采样后只剩少量帧', 'chunk 边界切在音素中间', '训练看全上下文而部署只给左上下文'],
  pitfalls: ['把 Zipformer 误讲成单一帧率 Transformer', '只报离线 CER，不测真实设备的状态内存和 RTF'],
  followUps: [{ question: '为什么低帧率层更省算力？', answer: '自注意力随序列长度近似二次增长，时间轴减半可显著降低注意力计算与激活；但卷积、投影和跨尺度融合仍有成本。' }, { question: '流式与离线模型如何公平比较？', answer: '固定训练数据、tokenizer、decoder 和 beam，只改变可见上下文与缓存策略，并分别报告精度、首包、RTF 和内存。' }],
  complexity: '自注意力部分约为 O(Σ_s L_s²d_s)，多尺度让多数 block 在较短 L_s 上运行；缓存空间约 O(Σ_s C_s d_s)。',
});
