import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-star-defense', category: 'Tech Lead 与项目答辩', order: 7, title: '把简历 Bullet 讲成可追问的 STAR-L',
  prompt: '如何把“CER 下降、F1 提升、端侧加速”等简历 bullet 讲成 3 分钟主线，并承受 15 分钟技术追问？',
  quickAnswer: '用 Situation/Task 交代约束，Action 只讲本人关键决策和机制，Result 给口径完整的数字，最后 Learning 说明失败、取舍和下一步；每个数字准备数据、消融、统计、部署四层证据。',
  why: '堆技术名词会让贡献边界不清，只有结果数字又无法证明技术深度和领导力。',
  implementation: '每个项目准备 30 秒摘要、3 分钟主线和深挖附录；标出“我决定/我实现/团队完成”；为失败方案和反事实各准备一个例子。',
  tradeoffs: '讲太细超时，讲太抽象像背稿；需要按面试官追问动态展开而不是一次倾倒全部细节。',
  evaluation: '模拟面试中让听者复述问题、你的独立贡献、核心机制、结果口径和最大风险；任何一项不清楚就重写。',
  prerequisites: ['STAR-L 叙事', '个人贡献边界', '指标证据与反事实'],
  workedExample: ['30 秒：信道退化导致 WER 28.66%，我构建真实链路增强与回归门禁，降到 20.32%，业务集 3.62%。', '深挖时再展开 RIR FFT、数据配比、消融、显著性和线上监控。'],
  edgeCases: ['结果由多人共同完成', '最好数字来自尚未上线实验', '失败方案比成功方案更能展示判断'],
  pitfalls: ['把团队所有工作都说成自己做', '只背最终故事，追问一个分母就答不上来'],
  followUps: [{ question: '团队贡献如何表述？', answer: '明确整体结果属于团队，同时具体说明自己的决策、实现、协调和验收责任，不夸大也不隐去领导作用。' }, { question: '失败项目要不要讲？', answer: '要。能说明假设、证据、停止条件和学习的失败案例，往往比没有边界的成功故事更能证明 seniority。' }],
  complexity: '准备成本与项目数线性；使用统一七问模板可复用数据、消融、部署和复盘证据。',
});
