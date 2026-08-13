import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-model-selection', category: 'Tech Lead 与项目答辩', order: 1, title: 'Tech Lead 的模型选型决策',
  prompt: '面对 Zipformer、Paraformer、Whisper、Qwen3-ASR 等候选，Tech Lead 如何从业务目标走到可审计的选型结论？',
  quickAnswer: '先把业务约束翻译成精度、延迟、内存、可流式、许可、维护和数据要求，再分硬门槛与可优化指标；用冻结 scorecard 和代表性 PoC 选 Pareto 解，而非追单一榜单第一。',
  why: 'Tech Lead 的职责是为约束下的结果负责，模型名字只是候选，决策过程必须能被团队复核。',
  implementation: '与产品/端侧确认 SLA 和高代价错误；先用低成本 smoke test 淘汰硬不兼容项，再对少数候选做完整数据、部署和维护评审；记录 ADR。',
  tradeoffs: '评测越完整成本越高；过早锁定会错过更优方案，长期保持过多候选又拖慢交付。',
  evaluation: '选型不仅看离线表，还看 PoC 上线后的回归、故障、维护投入和未来扩展；事后复盘假设是否成立。',
  prerequisites: ['多目标 Pareto 选型', '业务 SLA 与高代价错误', 'Architecture Decision Record'],
  workedExample: ['某大模型 CER 最低但无法端侧流式，违反硬门槛，不能因榜单第一入选。', 'Zipformer 精度略低但 RTF、内存和可维护性满足目标，可进入灰度并保留后续优化路径。'],
  edgeCases: ['需求在评测中途改变', '候选使用不同外部数据或许可', '短期 PoC 快但长期维护成本高'],
  pitfalls: ['先喜欢某模型再反向设计指标', '只呈现赢家，不保存被淘汰原因和假设'],
  followUps: [{ question: '选错了怎么办？', answer: 'ADR 明确假设、触发重评条件和退出方案；模型接口、数据与评测尽量解耦，使替换成本可控。' }, { question: '怎样平衡创新与交付？', answer: '用双轨：稳定候选保证里程碑，探索候选设置时间盒和明确胜出阈值，未达标自动停止。' }],
  complexity: '选型成本约 O(C·S)，C 为候选数、S 为评测场景数；分阶段淘汰可显著减少完整实验数。',
});
