import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-k2-fsa', category: 'ASR 专项', title: 'k2 FSA/FST 解码图与剪枝',
  prompt: '简历写了 k2/icefall：请解释 FSA、FST、semiring、compose/intersect 与 pruning 在 ASR 解码中的作用。',
  quickAnswer: 'k2 用张量化 FSA 表示候选路径，把 acoustic lattice 与 token、lexicon、语言模型约束组合后求最优或 N-best；剪枝保留分数接近最优的活跃路径，控制显存与时延。',
  why: '只会调用 icefall recipe 不能证明理解解码，面试官通常会从 H/L/G 图、blank 和 beam 剪枝追到实现。',
  implementation: '定义状态、弧、label、aux_label 和 score；构造 token/lexicon/LM 图，与逐帧 dense scores 做 pruned intersection，再 shortest path 或 N-best 重排。',
  tradeoffs: 'beam 太小会剪掉正确路径，太大则 lattice 膨胀；图组合增强语言约束但增加构图、存储和词表维护成本。',
  evaluation: '画 beam-精度-RTF-显存曲线，检查 OOV、热词、长句和多语种图，并验证空 lattice 与数值异常率。',
  prerequisites: ['有限状态自动机与转导器', 'log semiring 与路径分数', 'CTC/RNN-T lattice'],
  workedExample: ['两条路径声学分分别为 -3 和 -3.4，beam=0.3 时第二条被剪，beam=0.5 时保留。', '将词典图 L 与语言模型图 G 组合后，非法 token-to-word 路径不再进入候选。'],
  edgeCases: ['组合后产生 epsilon 环', '某帧所有路径被剪为空', '图与 tokenizer label 编号错位'],
  pitfalls: ['把 compose 与逐帧 intersect 混为一谈', '调大 beam 改善 CER 却不报告显存爆炸'],
  followUps: [{ question: '为什么使用 log semiring？', answer: '概率连乘在 log 域变成分数相加，既数值稳定又能用路径和或最短路算法统一计算。' }, { question: 'label 和 aux_label 有什么区别？', answer: '常用 label 表示输入侧 token，aux_label 表示输出侧词或其他符号，使 FST 同时完成约束和映射。' }],
  complexity: '最坏复杂度随活跃状态和弧组合爆炸；实际由 beam、max_active_states 等剪枝参数控制。',
});
