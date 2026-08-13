import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-disagreement', category: 'Tech Lead 与项目答辩', order: 6, title: '技术分歧、反馈与成员培养',
  prompt: '成员坚持更大模型，端侧坚持更低延迟，产品坚持尽快上线时，Tech Lead 如何决策并让团队成长？',
  quickAnswer: '先把立场翻译成共同指标和不可违反约束，用小型可证伪实验减少争论；明确 DRI 和决策期限，记录取舍；反馈针对行为与影响，并让成员拥有方案和复盘，而非只执行答案。',
  why: '技术领导不是所有争论都靠权威拍板，而是建立能持续产出高质量决策的机制。',
  implementation: '分别复述各方目标；列硬约束与未知；设计时间盒 PoC；由 DRI 依据预设阈值决策；一对一反馈使用具体事实、影响和下一步。',
  tradeoffs: '共识过程需要时间；紧急情况可能必须先决策后解释；过度追求一致会造成迟迟不定。',
  evaluation: '看决策周期、返工、团队能否复述理由、成员后续能否独立负责类似问题，以及冲突是否反复出现。',
  prerequisites: ['DRI 与决策权', '可证伪实验', 'SBI 反馈与授权'],
  workedExample: ['用真实设备比较大模型和轻模型的 CER/RTF/P99，若大模型违反硬 SLA 即停止争论。', '让成员主导实验和 ADR，Tech Lead review 风险，使其下次能独立选型。'],
  edgeCases: ['数据无法在 deadline 前给出结论', '高级成员公开否定新人', '决策正确但沟通造成信任下降'],
  pitfalls: ['把分歧视为不服从', '表面投票却不明确最终责任人'],
  followUps: [{ question: '什么时候应直接拍板？', answer: '发生事故、硬 deadline 或风险不可逆时，应由明确 DRI 快决策，同时记录信息不足和后续复核点。' }, { question: '如何给负面反馈？', answer: '私下描述具体行为、对项目/团队的影响、期待的替代行为，并约定支持和复查，不给人格标签。' }],
  complexity: '决策流程应与风险匹配：可逆低风险决策快速下放，不可逆高风险决策增加证据和评审。',
});
