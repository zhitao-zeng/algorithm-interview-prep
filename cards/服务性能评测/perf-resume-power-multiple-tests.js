import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'perf-resume-power-multiple-tests', category: '服务性能评测', title: '样本量、检验功效与多重比较',
  prompt: '横评 5 个模型、11 个语种和多个切片时，怎样避免“总能找到一个显著提升”？测试集需要多大？',
  quickAnswer: '先指定主假设与最小业务效应，按历史方差估功效和样本量；次级切片使用 FDR/Bonferroni 或分层模型控制多重比较，并同时报告效应大小和区间。',
  why: '模型和切片越多，偶然显著结果越常见；小样本“不显著”也可能只是功效不足。',
  implementation: '预注册 primary metric/model comparison；用 pilot 数据或 bootstrap 模拟不同 N 下检出率；主结论只依赖预注册检验，探索结果明确标注。',
  tradeoffs: 'Bonferroni 保守、需要更大样本；FDR 允许少量假发现；分层模型更高效但解释和假设更复杂。',
  evaluation: '报告目标效应、N、power、校正方法、原始/校正后区间与探索性分析边界。',
  prerequisites: ['I/II 类错误与 power', '最小可检测效应 MDE', 'FDR/Bonferroni'],
  workedExample: ['5×11=55 个检验若每个 α=0.05，至少一个假阳性的概率会显著上升。', '目标检测 CER 绝对下降 0.3%，用 pilot 的 paired 差值分布模拟 N，直到 power≥80%。'],
  edgeCases: ['切片样本高度相关', '先看结果再改主指标', '统计显著但业务收益极小'],
  pitfalls: ['把 p>0.05 说成两模型完全相同', '只校正 p 值，不报告效应大小'],
  followUps: [{ question: '为什么 paired 设计更有功效？', answer: '同一句在 A/B 下共享难度，分析差值可消除大量样本间方差，通常比独立样本比较更敏感。' }, { question: '探索性切片还能看吗？', answer: '可以，但应明确标注为生成假设，并在新的冻结数据上确认，不能直接写成已证实结论。' }],
  complexity: '功效模拟约 O(BN)，多重校正 O(M log M)，M 为假设数。',
});
