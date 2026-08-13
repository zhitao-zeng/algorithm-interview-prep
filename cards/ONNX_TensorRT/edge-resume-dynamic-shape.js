import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-dynamic-shape', category: 'ONNX/TensorRT', title: 'Dynamic Shape、Opset 与 Shape Tensor',
  prompt: 'ASR/TTS/OCR 输入长度变化时，ONNX/TensorRT 的 dynamic axis、optimization profile 和 shape tensor 如何设计？',
  quickAnswer: 'ONNX dynamic axis 只声明维度可变，TensorRT 还需为每个动态输入配置 min/opt/max profile；依赖运行时长度的 reshape/slice 应使用合法 shape tensor，并验证所有边界 shape。',
  why: '只在 opt shape 跑通不代表真实业务可用，超长、空 chunk 或不同 batch 常在运行时才失败。',
  implementation: '从线上分布确定 profile；为 batch/time/height/width 分别声明；检查算子在目标 opset 的动态语义；构建多 profile 或按场景拆引擎。',
  tradeoffs: 'profile 范围大增加 tactic 搜索、workspace 与性能波动；范围小需要更多引擎并增加调度复杂度。',
  evaluation: 'min/opt/max 和分位 shape 全覆盖，检查 build time、引擎大小、延迟分布、失败率与 padding 浪费。',
  prerequisites: ['ONNX dynamic axis', 'TensorRT optimization profile', 'shape tensor 与 reshape'],
  workedExample: ['ASR chunk 长度 profile 设置 16/64/256 帧，线上 99.9% 不超过 256。', '输入 300 帧应被上游切块或路由到长序列 profile，而不是直接让执行失败。'],
  edgeCases: ['batch=0 或音频为空', '多个动态输入长度必须一致', 'shape 超出 max profile'],
  pitfalls: ['把 dynamic axis 当成无限动态', '只测 opt shape 并用平均延迟代表全部请求'],
  followUps: [{ question: '为什么 opt shape 重要？', answer: 'TensorRT 会围绕 opt shape 选择更合适的 tactic，线上主流 shape 应接近它，否则可能运行但性能差。' }, { question: '一个超大 profile 还是多个 profile？', answer: '若 shape 分布多峰且最佳 tactic 差异大，多个 profile 更稳；需权衡引擎体积与调度复杂度。' }],
  complexity: '运行计算随实际 shape；构建时 tactic 搜索成本随 profile 数与候选算法显著增加。',
});
