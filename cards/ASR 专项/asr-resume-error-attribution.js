import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-error-attribution', category: 'ASR 专项', title: 'ASR 负收益归因与统一 Scorecard',
  prompt: 'ChinaVoices 横评出现某模型负收益时，如何定位是语料正字法、decoder-only、外部数据、Reference Set 还是 LID 梯度干扰？',
  quickAnswer: '先冻结输入、normalizer、reference 和 decoder 模式形成受控主表，再逐项加入外部数据、提示和多任务头；用 S/D/I、正字法映射、LID 混淆和 hard-focus 切片把负收益归因到可验证机制。',
  why: 'Tech Lead 的价值不只是找到第一名，还要解释其他方案为什么输，避免把口径差异误判为模型能力。',
  implementation: '建立 model card 与 run manifest；原始输出不可覆盖；按“预处理→模型→解码→后处理→评分”逐层复算；每个收益来源必须有单变量消融。',
  tradeoffs: '受控实验数量多；完全拆分交互项困难；修正正字法可能提升分数但偏离真实产品输出。',
  evaluation: '主指标加切片 scorecard，给每项变更的 ΔCER、置信区间、代价与失败样本；结论区分模型、数据、decoder 和口径。',
  prerequisites: ['ASR 端到端评分链', '消融实验与交互项', 'LID 多任务梯度冲突'],
  workedExample: ['模型原始 CER 高 2 点，统一繁简与数字 normalizer 后差距缩到 0.5 点，说明主要是正字法口径。', '只关闭 LID loss 后 ASR 恢复，进一步用梯度余弦确认任务冲突。'],
  edgeCases: ['reference 本身含错标', '外部数据与测试集近重复', '多个改动同时上线无法单独归因'],
  pitfalls: ['只展示冠军结果，不解释失败方案', '看到 LID 与 ASR 同时变化就直接断言梯度冲突'],
  followUps: [{ question: '怎样验证梯度干扰？', answer: '记录共享层上 ASR loss 与 LID loss 的梯度余弦、范数和训练阶段变化，并做 stop-gradient/decoder-only/权重扫描对照。' }, { question: 'Hard Focus set 有什么风险？', answer: '它适合定位长尾但不代表总体分布；必须与冻结的 Reference Set 分开报告，避免针对 hard set 过拟合。' }],
  complexity: '若有 C 个候选与 A 个单变量消融，推理成本约 O((C+A)N)；归因可信度通常比单次跑分更重要。',
});
