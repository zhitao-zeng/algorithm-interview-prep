// 主观听测专项；文件名避免使用 Node 测试文件后缀。
import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-listening-test', category: '语音合成', title: 'MOS、CMOS、ABX 与 TTS 显著性',
  prompt: '如何设计能支持模型定版的 TTS 主观听测，避免说话人、句子顺序、响度和评测者偏好造成结论偏差？',
  quickAnswer: '冻结代表性文本和音频后处理，随机化并盲化模型身份，按评测者与句子平衡分配；MOS 测绝对质量，CMOS/AB 测成对偏好，ABX 可检验相似性，并用分层 bootstrap 或 mixed-effects 模型给区间。',
  why: 'TTS 最终目标是听感，但主观分数若无实验设计，比自动指标更容易受偏差影响。',
  implementation: '预注册主问题和样本量；响度归一但不修复模型伪影；随机呈现；加入 gold/trap 样本筛评测者；保留评测者和句子 ID 做分层统计。',
  tradeoffs: 'MOS 可横向理解但方差大；成对比较更敏感却只能给相对结论；专业评测者稳定但不一定代表目标用户。',
  evaluation: '报告均值、95% CI、有效评测人数、句子和说话人覆盖、评测者一致性，并与 CER、speaker similarity、RTF 联合定版。',
  prerequisites: ['MOS/CMOS/AB/ABX', '盲测与随机化', '分层 bootstrap/mixed-effects'],
  workedExample: ['A/B 每对音频随机左右位置，避免默认偏好左侧。', 'CMOS 均值 +0.12 但 95% 区间跨 0，应结论为未证实优于基线，而非“显著提升”。'],
  edgeCases: ['同一评测者重复看到同一句', '模型响度不同导致响度偏好', '方言评测者听不懂目标方言'],
  pitfalls: ['只找团队成员听 10 句就报 MOS', '对每个小切片单独挑显著结果'],
  followUps: [{ question: '为什么要保留评测者 ID？', answer: '同一人的评分相关且量尺不同，分层统计或 mixed-effects 可把评测者与句子随机效应分开。' }, { question: '响度归一会不会掩盖问题？', answer: '可统一播放响度以避免偏好混淆，但不能做降噪、去爆音等模型特有修复；原始响度稳定性应另设指标。' }],
  complexity: '听测成本约 O(M·R)，M 为样本数、R 为每样本评分人数；统计计算相对可忽略。',
});
