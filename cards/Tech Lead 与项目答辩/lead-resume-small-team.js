import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-small-team', category: 'Tech Lead 与项目答辩', order: 3, title: '两人算法小组的任务拆解与 Bus Factor',
  prompt: '带领 2 人算法小组时，如何拆分研究、数据、评测与交付，既并行推进又避免只有一个人懂关键模块？',
  quickAnswer: '按可独立验收的接口拆工作而非按文件拆；每项有 owner 和 reviewer，关键链路双人可运行；通过短设计文档、复现实验和轮换 on-call 降低 bus factor。',
  why: '小团队速度快但单点风险高，Tech Lead 既要明确责任，又不能亲自成为所有模块的瓶颈。',
  implementation: '拆成数据/模型/评测/部署里程碑，定义输入输出和 DoD；每周一次交叉复现，PR 由非 owner review；关键脚本和 runbook 必须可由另一人执行。',
  tradeoffs: '交叉学习占用短期速度；过度文档化拖慢探索；完全共享 ownership 又容易没人负责。',
  evaluation: '看里程碑准时率、review 周期、复现成功率、单人请假时关键链路是否继续，以及线上问题恢复时间。',
  prerequisites: ['RACI/DRI', 'Definition of Done', '代码评审与 runbook'],
  workedExample: ['成员 A 负责数据与训练，成员 B 负责评测与端侧；每周交换一次从 manifest 到结果的复现。', 'Tech Lead 负责接口和风险，不代替 owner 写完所有关键代码。'],
  edgeCases: ['两人都在同一紧急问题上', '知识交叉导致责任模糊', '新人尚不能独立 review'],
  pitfalls: ['把任务拆成互相强耦合的小碎片', '关键环境只存在 owner 本机'],
  followUps: [{ question: '如何避免 review 变形式？', answer: 'reviewer 必须能复现核心结果、检查失败路径和验收指标，而不只是看代码风格。' }, { question: 'Tech Lead 自己写多少代码？', answer: '应亲自攻高风险原型、接口和诊断工具，但逐步把稳定模块交给 owner，避免所有 merge 都等待自己。' }],
  complexity: '协调成本随依赖边增长；清晰接口可让两人主要并行，避免频繁串行等待。',
});
