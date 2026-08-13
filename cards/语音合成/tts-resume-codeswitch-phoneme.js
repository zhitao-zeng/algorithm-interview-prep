import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-codeswitch-phoneme', category: '语音合成', title: '中英混读的语言切分与共享音素空间',
  prompt: '中文、英文和中英混读三路交付时，split_by_lang、G2P、音素表与韵律上下文怎样协同，避免语言边界处突变？',
  quickAnswer: '先做保留实体的语言/脚本分段，各段进入对应 G2P，再映射到共享或带 language ID 的音素空间；声学模型必须看到跨段上下文，边界处单独约束时长、F0 和能量连续。',
  why: '逐段独立合成再拼接会出现音色、语速、响度和停顿跳变，技术词与缩写还可能被错误切分。',
  implementation: 'language segmenter 输出 span 与置信度；中文/英文 G2P 生成音素并注入 language embedding；保留整句 prosody encoder 或跨段上下文窗口。',
  tradeoffs: '共享音素便于迁移但可能混淆语言特有发音；独立音素清晰但参数和数据更分散；过强语言切换标签会产生生硬边界。',
  evaluation: '除整体 MOS 外，专测边界前后音素错误、停顿时长、音高跳变、技术词准确率和语言身份一致性。',
  prerequisites: ['语言识别与脚本切分', 'IPA/拼音/ARPAbet 音素', 'language embedding 与韵律连续性'],
  workedExample: ['“用 GPU 跑模型”中 GPU 应作为英文缩写整体处理，不能拆成三个中文未知字。', '中文段结束与英文段开始共享前后词上下文，避免默认插入句号级停顿。'],
  edgeCases: ['品牌名脚本为英文但按中文读', '数字与单位横跨两种语言', '同一音素在不同语言中实现不同'],
  pitfalls: ['仅按 Unicode 字符逐字切语言', '分别合成每段后直接拼波形'],
  followUps: [{ question: '共享还是独立音素表？', answer: '低资源迁移可共享相近音素并加语言 embedding；差异大或易串音时保留语言特有符号，最终由混读集实验决定。' }, { question: '怎么量化边界自然度？', answer: '测边界停顿、F0/能量突变、音素时长异常，再结合只播放边界窗口的成对听测。' }],
  complexity: '分段与 G2P 近似 O(n)，整句声学模型复杂度由主干决定。',
});
