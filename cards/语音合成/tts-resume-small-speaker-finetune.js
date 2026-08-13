import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-small-speaker-finetune', category: '语音合成', title: '小数据方言声线微调与崩坏回归',
  prompt: '北京话、河南话、天津话专属声色微调时，如何归因噪声、混响、采样率和 code-switch 偏移，并避免音色提高但可懂度崩坏？',
  quickAnswer: '先统一采样率、响度、切分和标注，按说话人/信道/文本覆盖做数据审计；从条件 embedding 和少量层开始微调，保留通用 replay，并以音色、可懂度、韵律和稳定性四类指标共同选型。',
  why: '小数据最容易记住信道和文本，而不是方言音色；单看 speaker similarity 会选出漏读、爆音或韵律僵硬的模型。',
  implementation: '建立 clean/noisy、方言现象、code-switch 和长句切片；逐步解冻；扫描学习率与 replay 比例；每个 checkpoint 做 ASR back-transcription 和声纹评测。',
  tradeoffs: '冻结多则音色适配不足，解冻多则遗忘；强去噪可能损伤说话人细节；通用 replay 会稀释方言特征。',
  evaluation: '联合报告 speaker similarity、MOS/CMOS、回识 CER、F0/时长、长句崩坏率和旧声线回归。',
  prerequisites: ['说话人 embedding', '小样本微调与灾难性遗忘', '音频数据清洗与信道偏差'],
  workedExample: ['模型相似度从 0.72 升到 0.82，但回识 CER 从 5% 升到 14%，不能上线。', '加入 20% 通用 replay 后相似度略降 0.01，CER 恢复且长句稳定，应优先选该工作点。'],
  edgeCases: ['训练集只有单一麦克风', '方言文本覆盖窄导致 OOD 词崩坏', '参考音频本身含混响和背景声'],
  pitfalls: ['把信道相似误认为音色相似', '只听少数主观最好样本挑 checkpoint'],
  followUps: [{ question: '如何判断模型学到信道而非音色？', answer: '跨设备测试并用同说话人不同信道、不同说话人同信道做对照；若相似度随设备大幅变化，说明信道泄漏。' }, { question: '为什么用 ASR 回识？', answer: '它提供可懂度和漏读重读的自动代理指标，不能替代听测，但能高效淘汰明显崩坏 checkpoint。' }],
  complexity: '总训练成本约为 checkpoint 候选数乘以微调步数；多指标离线评测可并行。',
});
