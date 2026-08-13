import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-g2pw-calibration', category: '语音合成', title: 'G2PW 置信度、词典与三级回退校准',
  prompt: '双层词典→G2PW→pypinyin 的三级回退如何定阈值？怎样避免低置信回退反而把正确上下文读音改错？',
  quickAnswer: '词典只覆盖高精度固定词组；G2PW 输出需在多音字金标集上校准；pypinyin 是保证可读的最后兜底而非准确率上限。阈值应按词频、实体类型和错误代价分组选择。',
  why: '统一阈值会让高频词过度回退、长尾实体置信虚高，无法解释线上多音字错读。',
  implementation: '记录每个字的候选、上下文、模型分数与词典来源；对温度或 isotonic 做校准；高风险实体要求词典或人工白名单，普通词按 coverage-risk 阈值回退。',
  tradeoffs: '词典越大冲突与维护越多；回退率高提高稳定性却损失上下文消歧；按类型设阈值使系统更复杂。',
  evaluation: '报告多音字准确率、错误代价加权分、回退覆盖率、校准误差，并按人名地名、方言和 code-switch 切片。',
  prerequisites: ['中文多音字与词级上下文', '置信度校准', '词典优先级与回退'],
  workedExample: ['“银行/行走”中“行”的上下文不同，词典短语优先于单字默认音。', '模型对罕见人名给 0.72，若人名阈值为 0.9，则进入白名单或人工词典而非普通回退。'],
  edgeCases: ['词典条目重叠且读音冲突', '模型对 OOD 实体置信虚高', 'pypinyin 默认音在方言目标声线中不适用'],
  pitfalls: ['把 0.6 当所有场景永久阈值', '只统计回退率，不统计回退前后谁更正确'],
  followUps: [{ question: '为什么 pypinyin 只能兜底？', answer: '它能保证覆盖但缺少充分上下文语义，面对多音字、人名和专名通常不如上下文化模型。' }, { question: '词典命中一定优先吗？', answer: '仅高精度、边界明确、版本可追踪的词典应强制优先；低质量自动词典也需要置信和冲突仲裁。' }],
  complexity: 'Trie 词典匹配约 O(n)，G2PW 取决于 encoder 前向，校准映射线上近似 O(1)。',
});
