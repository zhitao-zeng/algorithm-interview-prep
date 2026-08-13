import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-incident', category: 'Tech Lead 与项目答辩', order: 5, title: '算法线上事故的止损、归因与复盘',
  prompt: '新模型灰度后某方言 CER 或端侧崩溃率异常，Tech Lead 前 30 分钟、当天和一周内分别做什么？',
  quickAnswer: '先停止扩量并按预案回滚，保护用户；随后冻结证据、按版本/设备/域切片定位，建立最小复现；修复需通过原事故集和完整回归，复盘关注系统防线而非追责个人。',
  why: '事故处理考验优先级、沟通和系统设计，继续调模型而不先止损会扩大影响。',
  implementation: '前 30 分钟确认影响、owner、回滚和通报；当天完成时间线、切片和复现；一周内补测试、监控、runbook、发布门禁并验证修复。',
  tradeoffs: '快速回滚可能丢失新版本收益，但应优先恢复稳定；证据收集和隐私要求需平衡。',
  evaluation: '看 MTTA/MTTR、回滚成功率、影响请求数、复发率和 action item 完成度，而非只看修复后的离线指标。',
  prerequisites: ['Incident command', '灰度与回滚', '时间线、五问和无责复盘'],
  workedExample: ['某设备加载失败率升高，立即停止该设备型号扩量并恢复旧资产。', '根因是 opset/runtime 不兼容，补 manifest compatibility gate 和设备矩阵测试。'],
  edgeCases: ['回滚包也损坏', '指标延迟导致影响发现晚', '多个版本同时在线'],
  pitfalls: ['未止损就直接在线试修', '复盘结论写成“工程师不够仔细”'],
  followUps: [{ question: '何时可以不回滚？', answer: '仅在影响可控、存在更快且低风险的配置开关/降级，并有明确监控时；否则恢复已知稳定版本。' }, { question: '怎样做无责复盘？', answer: '分析为何现有流程允许错误到达用户、哪些信号缺失、怎样增加系统防线；个人行为只作为上下文，不作为根因终点。' }],
  complexity: '事故响应不是算法复杂度问题，目标是通过自动检测和回滚把影响窗口与 MTTR 最小化。',
});
