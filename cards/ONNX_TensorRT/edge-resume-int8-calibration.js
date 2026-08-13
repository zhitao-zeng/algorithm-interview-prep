import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-int8-calibration', category: 'ONNX/TensorRT', title: 'INT8 校准集、敏感层与混合精度回退',
  prompt: '端侧 INT8 为什么可能总体指标不变但长尾小字、低能量音素或深度边界明显退化？如何做校准和敏感层回退？',
  quickAnswer: '校准集若缺少长尾动态范围，scale 会让稀有激活被截断或量化到同一格；应分切片覆盖真实分布，逐层做 FP32/FP16 回退敏感性实验，并用任务级 hard set 守护。',
  why: '量化不是只看模型大小和平均精度，端侧项目往往败在少数高代价切片。',
  implementation: '采样代表性校准集；记录激活直方图与 clipping；比较 per-tensor/per-channel；逐层或分组回退，寻找最小精度成本组合。',
  tradeoffs: '回退层越多精度越稳但速度和内存收益下降；校准集扩大增加准备成本，且未来域漂移仍需重校。',
  evaluation: '报告总体与 hard-set 指标、逐层误差、P50/P99 延迟、峰值内存和能耗，形成精度-性能 Pareto。',
  prerequisites: ['对称/非对称量化', 'per-channel scale', '校准与 clipping'],
  workedExample: ['OCR 总 F1 只降 0.1%，但小字召回降 4%，定位到输出头动态范围。', '仅将输出头回退 FP16，小字召回恢复且端到端仍保留大部分加速。'],
  edgeCases: ['校准集没有静音或纯黑图', '激活含极端 outlier', '同一引擎跨设备量化 kernel 不同'],
  pitfalls: ['用训练集随机 100 条就完成校准', '只看平均精度，不做关键切片和逐层回退'],
  followUps: [{ question: 'PTQ 不够时何时用 QAT？', answer: '若敏感层过多、激活分布难校准且业务需要更低位宽，可用 QAT 让模型适应量化噪声；先用 PTQ 明确瓶颈。' }, { question: '校准集要多大？', answer: '没有固定数字，应以激活统计和任务指标收敛为准，重点是覆盖真实 shape、域和长尾，而非盲目扩大。' }],
  complexity: '校准约 O(N·C_model)，逐层回退扫描最坏 O(L·N·C_model)，可用误差排序减少候选。',
});
