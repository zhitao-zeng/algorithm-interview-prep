import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-release-rollback', category: 'ONNX/TensorRT', title: '端侧模型灰度、监控与可恢复回滚',
  prompt: '端侧模型不像服务端能随时热修，如何设计模型包灰度、兼容校验、线上指标和回滚？',
  quickAnswer: '模型包需签名、版本化并声明 runtime/设备兼容；分设备和人群逐级灰度，监控崩溃、加载失败、延迟、内存和任务代理指标；保留上一稳定包与原子切换，失败自动回退。',
  why: '端侧碎片化和弱联网使错误传播后修复慢，发布机制与模型精度同等重要。',
  implementation: 'manifest 包含 schema、hash、最低 runtime、shape profile；下载后校验并离线冒烟；1%→10%→50%→100% 灰度；触发阈值自动停止和回滚。',
  tradeoffs: '保留双版本占包体；细粒度 telemetry 有隐私和流量成本；代理质量指标不等于金标精度。',
  evaluation: '演练损坏包、断网、磁盘不足、runtime 不兼容和质量回归，验证回滚成功率、恢复时长与数据完整性。',
  prerequisites: ['版本化模型资产', '灰度发布与回滚', '端侧 telemetry 与隐私'],
  workedExample: ['1% 灰度发现某 GPU driver 加载失败率 8%，按设备型号停止扩量并回退旧包。', '新包校验通过才原子更新 active pointer；断电时仍能启动旧版本。'],
  edgeCases: ['下载一半设备断电', '旧 runtime 不认识新 schema', '用户长期离线错过多个中间版本'],
  pitfalls: ['覆盖唯一模型文件后再校验', '只监控崩溃，不监控静默质量和延迟回归'],
  followUps: [{ question: '没有线上标签怎么监控质量？', answer: '使用稳定性、输出长度、置信度、拒识率、ASR 回识等代理指标，并对匿名抽样在合规前提下做人工或延迟评测。' }, { question: '何时自动回滚？', answer: '对崩溃、加载失败、P99、HWM 等可即时量化指标设硬阈值；质量代理异常可先停止扩量并人工确认。' }],
  complexity: '发布控制本身 O(设备数)；双版本存储约为 2 倍模型包体，telemetry 成本随采样率线性增长。',
});
