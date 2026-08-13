import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'perf-resume-slice-gate', category: '服务性能评测', title: '平均指标、关键切片与回归门禁',
  prompt: '为什么平均 CER/F1 提升仍可能不能上线？如何定义语种、噪声、设备、长句和高代价实体的 regression gate？',
  quickAnswer: '平均值会被大切片支配，应预注册关键切片和业务代价，分别设置不退化上限、最小样本量和区间；发布需要主指标提升且所有硬门禁通过。',
  why: '语音和端侧系统的长尾通常对应真实投诉，不能让总体提升掩盖某语种、设备或实体类别崩坏。',
  implementation: '从流量、风险和模型机制定义切片；冻结 slice query；为每项设置 warn/block 阈值；小样本用区间或贝叶斯收缩，不用单点。',
  tradeoffs: '门禁太多使任何方案都难上线，多重检验增加误报；门禁太松又失去保护，需要区分 hard gate 与观察项。',
  evaluation: '输出主指标、关键切片、最差切片、样本量与区间；灰度阶段继续监控对应线上代理指标。',
  prerequisites: ['分层评测', '业务代价与 guardrail', '小样本不确定性'],
  workedExample: ['总体 CER 降 1%，但电话数字实体错误升 5%，若该切片高风险则必须阻断。', '某小语种仅 30 句，单次升 2% 不直接阻断，先扩大样本并看区间。'],
  edgeCases: ['切片重叠导致重复统计', '关键切片样本随版本变化', '事后新建只对候选有利的切片'],
  pitfalls: ['用总体 micro 平均掩盖小语种', '每个切片都设同一绝对阈值'],
  followUps: [{ question: 'hard gate 和 warning 怎么分？', answer: '合规、安全、高代价事实错误和明确 SLA 用 hard gate；低样本或探索性切片先 warning 并要求人工复核。' }, { question: '最差切片一直波动怎么办？', answer: '检查样本量和数据漂移，用固定核心集加滚动线上集，并报告区间而非追逐每次最差点。' }],
  complexity: '预定义 M 个切片聚合约 O(NM)，使用倒排标签可近似 O(N+总标签数)。',
});
