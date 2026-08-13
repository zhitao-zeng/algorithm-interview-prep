import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-paired-bootstrap', category: 'ASR 专项', title: 'CER/WER 差值的配对显著性检验',
  prompt: '模型 A 比 B 的 CER 低 0.2%，如何判断不是测试集抽样波动？为什么应按 utterance 做 paired bootstrap？',
  quickAnswer: 'A/B 在同一批 utterance 上产生相关误差，必须成对重采样句子并每次重新聚合编辑距离；观察 ΔCER 分布、置信区间与胜率，不能把 token 当独立样本。',
  why: '简历包含多组小数点后三位的提升，如果没有不确定性分析，很容易被质疑为偶然或口径差。',
  implementation: '保存每句 A/B 的 S/D/I/N；以句为单位有放回抽样 B 次，每次分别求 corpus CER 后取差；同时对业务关键切片做预注册检验。',
  tradeoffs: 'bootstrap 计算便宜但依赖测试集代表性；切片过多会产生多重比较问题；统计显著不等于业务显著。',
  evaluation: '报告 ΔCER 点估计、95% 区间、P(Δ<0)、多 seed 稳定性和最小业务可感知差异。',
  prerequisites: ['编辑距离 S/D/I/N', '配对抽样', '置信区间与多重比较'],
  workedExample: ['重采样 10,000 次，Δ=A-B 的 95% 区间为 [-0.35,-0.08]，支持 A 更优。', '若区间跨 0，即使点估计 -0.2%，也应表述为“方向有利但证据不足”。'],
  edgeCases: ['少数超长句支配 corpus CER', '测试集含重复或同说话人强相关样本', '事后挑出唯一显著切片'],
  pitfalls: ['把每个字符当独立 Bernoulli 样本做普通比例检验', '只报 p 值，不报效应大小与区间'],
  followUps: [{ question: '为什么不能平均每句 CER？', answer: '平均句 CER 会让短句与长句权重相同，可能与标准 corpus CER 不一致；bootstrap 内应按总编辑数/总参考长度聚合。' }, { question: '多语种同时检验怎么办？', answer: '预先指定主指标，并对次级语种使用 FDR/Bonferroni 或分层模型，避免从大量切片中挑显著结果。' }],
  complexity: '若预存每句计数，B 次 bootstrap 约 O(BN)，空间 O(N)；可向量化并行。',
});
