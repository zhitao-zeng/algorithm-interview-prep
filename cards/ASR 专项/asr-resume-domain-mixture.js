import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-domain-mixture', category: 'ASR 专项', title: '新域适配、Replay 与回归门禁',
  prompt: '如何解释新域 CER 19.27%→12.24%，同时旧域 9.31%→9.03%？数据配比、采样和门禁应怎样设计？',
  quickAnswer: '训练中按目标比例混合新域、通用 replay 和难例，必要时冻结底层或使用较小学习率；发布条件同时约束新域增益、旧域不退化和关键切片稳定，不能只优化新域平均 CER。',
  why: '域适配最常见失败是新域大涨、通用域悄悄退化，简历数字必须能对应可复现的数据和门禁策略。',
  implementation: '建立 domain-aware sampler；扫描新域:通用域比例与学习率；保存 old/new/hard 三套验证集；用多 seed 实验选 Pareto 工作点。',
  tradeoffs: 'replay 比例高会稀释新域学习，低则遗忘；冻结层提高稳定性但限制上限；多域门禁增加实验周期。',
  evaluation: '报告各域 CER、插删替、置信区间与最差切片；发布要求新域达到目标且旧域回归低于预设阈值。',
  prerequisites: ['灾难性遗忘', '多域采样与 loss weighting', 'Pareto 选型与回归门禁'],
  workedExample: ['扫描新域:通用域为 1:0、1:1、1:3，观察新域收益和旧域回归曲线。', '某方案新域降 8 点但旧域升 1 点，另一方案新域降 7 点且旧域不退，业务可能应选后者。'],
  edgeCases: ['旧域测试集与 replay 数据重复', '新域样本量小但被重复采样导致过拟合', '总体不退化但某关键语种严重回归'],
  pitfalls: ['把旧域 9.31→9.03 的随机波动直接当提升', '只设平均 CER 门禁，不设关键切片上限'],
  followUps: [{ question: '如何判断旧域变化是否真实？', answer: '在同一 utterance 上做 paired bootstrap 或多 seed 重训，报告差值分布与置信区间，而不是只看两个小数。' }, { question: '何时冻结 encoder？', answer: '新域主要是词汇/语言模型差异且底层声学已稳时可优先冻结；若信道或口音差异大，则需逐层解冻并严控学习率。' }],
  complexity: '单次训练复杂度不变，但比例与超参扫描使总成本约乘以候选配置数 H 和随机种子数 S。',
});
