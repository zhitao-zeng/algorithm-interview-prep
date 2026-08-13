import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-rnnt-context-graph', category: 'ASR 专项', title: 'RNN-T Beam Search 与热词 Context Graph',
  prompt: '如何在 RNN-T 解码中注入热词，同时避免前缀只匹配一半时错误加分和 blank 路径分数失真？',
  quickAnswer: '把热词 token 序列构造成 trie/FSA，beam 中每条 hypothesis 携带 context 状态；匹配弧时增量加分，失败或回退时撤销未完成奖励，并保持 blank 只推进 encoder 时间、不推进预测网络标签状态。',
  why: '业务热词不是简单把最终字符串加分，错误的状态与回退会造成大量误触发和普通词退化。',
  implementation: '为每条 beam 保存 token prefix、predictor state、context state 和 score；扩展非 blank token 时转移 context graph，完成词给终结奖励，失配按 failure link 回退。',
  tradeoffs: '热词权重大提高召回但增加误识；大词表扩大 beam 状态和延迟；不同 tokenizer 下同一热词可能有多种切分。',
  evaluation: '同时报告热词召回/精确率、通用 CER、误触发率、RTF，并按前缀重叠和同音词构造 hard set。',
  prerequisites: ['RNN-T blank 与 predictor state', 'Beam Search hypothesis 合并', 'Trie/FSA 与 failure link'],
  workedExample: ['热词“北京”切成 [北,京]，只匹配“北”时记录中间奖励，下一 token 失配则撤销。', '两条 beam 文本相同但 predictor/context state 不同，不能只按字符串盲目合并。'],
  edgeCases: ['多个热词共享长前缀', 'tokenizer 将热词切成未知或多种 token', '用户动态更新热词表'],
  pitfalls: ['前缀一匹配就永久加满热词分', '只看热词召回，不看通用集误触发与 CER'],
  followUps: [{ question: 'blank 为什么不推进 context graph？', answer: 'blank 表示当前 encoder 时刻不输出新标签，文本前缀没有变化，因此 predictor 和热词 token 状态都不应前进。' }, { question: '热词权重怎么调？', answer: '在独立 hard set 上扫描权重，画召回-误触发-通用 CER Pareto 曲线，并按业务代价选择工作点。' }],
  complexity: '约 O(T·B·K)，T 为 encoder 步数、B 为 beam、K 为每步候选 token 数；context 转移可近似 O(1)。',
});
