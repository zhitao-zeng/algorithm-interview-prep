import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-paraformer-cif', category: 'ASR 专项', title: 'Paraformer 与 CIF 非自回归对齐',
  prompt: 'Paraformer 为什么能非自回归解码？请解释 CIF 如何把帧级声学表示变成 token 级表示，以及预测长度错误会怎样传播。',
  quickAnswer: 'CIF 为每帧预测权重并累加到阈值，触发一次 fire 得到一个 token 级声学向量；Paraformer 据此并行预测 token，速度快但长度和边界预测错误会造成整句插删错。',
  why: '简历把 Paraformer 放进统一横评时，必须能解释它与 CTC、RNN-T 在对齐和解码依赖上的本质差异。',
  implementation: '从 encoder 帧表示预测 α_t，累加到阈值 1 并按权重整合向量；训练时加入 token 数量约束和采样策略，推理时一次性送入并行 decoder。',
  tradeoffs: '非自回归吞吐高，但 CIF 数量误差直接变成插入或删除；语言依赖和长句一致性通常弱于自回归路径。',
  evaluation: '同时报告 CER、插入/删除/替换分解、预测 token 数偏差、RTF，并按长句和数字实体切片。',
  prerequisites: ['CTC 与隐式对齐', '非自回归序列建模', 'token 级插入删除错误'],
  workedExample: ['帧权重 [0.4,0.7,0.2,0.8] 依次累积，跨过 1 时 fire，并把溢出权重留给下一个 token。', '若目标 10 个字但 α 总和只接近 9，至少会产生一个删除风险。'],
  edgeCases: ['α 在句尾未达到阈值', '长静音产生虚假 fire', '中英混读 token 粒度突然变化'],
  pitfalls: ['只说“并行所以快”却解释不了 CIF', '只看总 CER，不拆长度预测导致的插删错'],
  followUps: [{ question: '为什么需要 quantity loss？', answer: '它约束 α_t 总和接近目标 token 数，减少 CIF fire 次数与真实长度不一致的问题。' }, { question: 'Paraformer 与 CTC 都能并行，区别是什么？', answer: 'CTC 在帧上预测含 blank 的独立分布再折叠；Paraformer 用 CIF 先形成 token 级声学向量，再由 decoder 联合建模输出。' }],
  complexity: 'encoder 取决于主干；CIF 聚合 O(Td)，并行 decoder 通常一次前向，避免自回归 O(U) 次串行调用。',
});
