import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-sherpa-streaming', category: 'ONNX/TensorRT', title: 'sherpa-onnx 流式状态与端到端打包',
  prompt: 'ASR/TTS 用 sherpa-onnx 端侧交付时，如何管理 stream state、chunk、tokenizer、模型资产、取消与错误恢复？',
  quickAnswer: '模型、tokens、配置和前后处理必须作为版本化原子资产；每会话拥有独立 stream state，chunk 按模型约束推进；取消时清空队列与缓存，异常后不得复用污染状态。',
  why: '模型能推理不等于 SDK 可交付，端侧最常见故障来自资产错配、跨会话状态串扰和生命周期管理。',
  implementation: '定义 create/accept/decode/flush/reset/destroy 状态机；验证模型 hash 与 token 表；音频线程和推理线程用有界队列解耦；暴露 trace 与错误码。',
  tradeoffs: 'chunk 小首包快但调用和边界成本高，chunk 大吞吐好但延迟高；状态隔离增加内存；严格版本校验降低热更新灵活性。',
  evaluation: '测首包、RTF、连续时长、取消响应、内存泄漏、并发会话、资产损坏和重启恢复。',
  prerequisites: ['流式 ASR/TTS chunk', '会话状态机', '模型/tokenizer 资产版本'],
  workedExample: ['会话 A/B 各建独立 stream，交错送 chunk，结果不得互相出现 token 或音频。', '用户打断 TTS 后 cancel 生成并清空播放队列，下一句从全新 state 开始。'],
  edgeCases: ['模型与 tokens.txt 版本不一致', '最后一个 chunk 未 flush', '取消发生在异步 kernel 执行中'],
  pitfalls: ['全局复用一个 stream state', '只测试完整句，不测打断、空 chunk 和长会话'],
  followUps: [{ question: 'chunk 越小越好吗？', answer: '不是。小 chunk 减少等待但增加调度、边界和模型调用开销，需联合首包、RTF、质量和功耗选择。' }, { question: '如何防资产错配？', answer: 'manifest 固化模型、tokenizer、采样率、前端配置和 hash，加载时原子校验，失败则拒绝启动而非带病运行。' }],
  complexity: '每 chunk 推理成本由模型决定；状态内存约 O(S·C)，S 为并发会话，C 为单会话缓存。',
});
