import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-tone-prosody', category: '语音合成', title: '变调、轻声、儿化与韵律边界',
  prompt: '中文 TTS 前端怎样区分词典音、表层变调和声学韵律？读音标签从 8 类扩到 18 类时应如何验证确有收益？',
  quickAnswer: '先输出词典层音素，再根据分词、词性和句法应用三声变调、“一/不”变调、轻声与儿化；韵律边界单独建模停顿、重音和时长。标签扩展必须有清晰语义、可靠标注和逐类收益。',
  why: '把所有现象塞进一个音素标签会造成数据稀疏和不可控，扩类也可能只是提高训练复杂度。',
  implementation: '建立 lexical phoneme→surface phoneme→prosody 三层表示；规则处理确定性变调，模型预测歧义边界；18 类逐一定义触发条件并做旧类到新类映射。',
  tradeoffs: '细标签控制力强但标注一致性下降；规则稳定却可能与方言或特定声线不匹配；边界预测错误会造成断句。',
  evaluation: '逐类 precision/recall、音素错误率、停顿 F1、时长/基频相关性，再做 MOS/AB 偏好与长句崩坏率。',
  prerequisites: ['普通话变调与轻声儿化', '韵律词/短语/语调短语', '音素、时长、F0 与能量'],
  workedExample: ['“很好”底层两个三声，表层通常发生三声变调；词典音与实际合成音需分层保存。', '“花儿”儿化不仅改音素，还可能影响前一韵母和时长，不能只追加一个 er token。'],
  edgeCases: ['引号和括号破坏句法边界', '方言声线不遵循普通话全部变调', '训练标注者对轻声类别不一致'],
  pitfalls: ['把韵律边界等同标点', '扩到 18 类后只报总准确率，不看稀有类'],
  followUps: [{ question: '为什么规则和模型要分工？', answer: '确定性语言规则用规则更可控，依赖语义和句法的歧义用模型更合适；分工还能独立定位错误。' }, { question: '如何判断扩类有效？', answer: '新类需要足够样本和标注一致性，并在对应现象切片提升客观指标和听感，且不能增加整体崩坏率。' }],
  complexity: '规则扫描近似 O(n)，韵律模型通常 O(n²d) 或按所用 encoder 计算。',
});
