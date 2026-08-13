import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-confidence-calibration', category: 'ASR 专项', title: 'ASR 伪标签置信度校准与选择性风险',
  prompt: '为什么平均 token 概率不能直接作为伪标签可信度？如何校准阈值并决定哪些样本回灌训练？',
  quickAnswer: '序列长度、blank、beam 和语言模型都会扭曲原始分数，应先构造 utterance-level 特征，再用温度缩放、Platt 或 isotonic 在人工审计集上校准；按 coverage-risk 曲线选阈值，而不是拍脑袋设 0.9。',
  why: '未校准的高置信错误会通过自训练放大，尤其集中在口音、噪声和专有名词切片。',
  implementation: '聚合长度归一化 log probability、beam margin、熵和 LID 等特征；在独立人工集拟合校准器；阈值由目标伪标签错误率或人工预算反推。',
  tradeoffs: '阈值高则纯度高但覆盖低；校准器会随模型、语种和域漂移，需要分组或周期重校。',
  evaluation: '报告 ECE/Brier、可靠性图、coverage-risk 曲线，以及回灌后独立验证集 CER 与坏切片回归。',
  prerequisites: ['token/sequence 对数概率', '温度缩放与 isotonic regression', '选择性预测与 ECE'],
  workedExample: ['原始 0.9 分数样本实际仅 82% 正确，校准后映射为 0.82。', '要求伪标签错误率低于 3%，从 risk curve 选择 coverage 约 55% 的工作点。'],
  edgeCases: ['人工校准集过小且不含稀有口音', '模型升级后分数分布漂移', '超长句平均分被长度归一化掩盖局部错误'],
  pitfalls: ['直接把 softmax 最大值当真实正确率', '用同一批伪标签同时调阈值和报告收益'],
  followUps: [{ question: 'ECE 很低是否代表阈值一定好？', answer: '不一定。ECE 是分桶平均误差，可能掩盖关键切片；仍需看目标错误率下的 coverage、分语种可靠性与下游回灌效果。' }, { question: '没有足够人工标签怎么办？', answer: '优先分层抽样高风险切片，结合双模型一致性和 beam margin 做弱监督，但必须保留小型人工金标集做最终校准。' }],
  complexity: '校准拟合约 O(NF) 到 O(NF²)，线上打分 O(F)；N 为审计样本数，F 为置信特征数。',
});
