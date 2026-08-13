import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'lead-resume-cross-team', category: 'Tech Lead 与项目答辩', order: 4, title: '算法、端侧与产品的跨团队交付',
  prompt: '算法模型离线达标后，如何推动端侧集成、产品验收和灰度，避免“算法已完成”但项目仍不能上线？',
  quickAnswer: '从项目开始就共同定义端到端 DoD：模型资产、SDK 接口、设备矩阵、质量/性能 SLA、埋点、错误码和回滚；每个里程碑交付可运行 artifact，而不是只交 checkpoint。',
  why: '跨团队失败通常发生在接口、口径、设备和时间预期，而非模型结构本身。',
  implementation: '建立单一 owner map 和周风险表；接口先行；用 golden sample 做联调；算法与端侧共同维护性能分解；产品按冻结验收集签字。',
  tradeoffs: '前置对齐占用探索时间；接口过早冻结限制模型变化；需将稳定协议与可变模型配置分层。',
  evaluation: '追踪端到端里程碑、集成缺陷、跨设备通过率、灰度指标、回滚演练和问题平均解决时间。',
  prerequisites: ['端到端 Definition of Done', '接口契约与 golden sample', '风险/依赖管理'],
  workedExample: ['TTS 交付包含 model、tokens、前端配置、示例音频、延迟内存报告和 cancel API，不只是 ONNX。', '端侧发现 P99 超标时，依据 timeline 判断是模型、拷贝还是播放 buffer，由对应 owner 处理。'],
  edgeCases: ['端侧硬件在后期更换', '产品改变文本格式', '离线指标达标但用户体验不佳'],
  pitfalls: ['用“模型推理正常”代替端到端验收', '依赖口头约定，不保存接口和指标版本'],
  followUps: [{ question: '接口必须早冻结吗？', answer: '稳定核心 schema 和生命周期，实验性字段可版本化扩展；目标是减少破坏性变化而非阻止迭代。' }, { question: '跨团队意见冲突怎么办？', answer: '回到共同业务目标和可测证据，列方案成本/风险，明确最终 DRI；无法消除的取舍写入 ADR。' }],
  complexity: '交付复杂度随设备、runtime 和接口组合增长，契约测试可把重复联调降为自动矩阵。',
});
