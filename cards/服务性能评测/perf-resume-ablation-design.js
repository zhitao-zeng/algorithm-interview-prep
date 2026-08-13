import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'perf-resume-ablation-design', category: '服务性能评测', title: '单变量消融、交互项与收益归因',
  prompt: 'RIR、数据混合、模型替换和 decoder 调参同时变化后指标提升，怎样设计消融才能说明各自贡献？',
  quickAnswer: '先定义共同 baseline，做 one-at-a-time 主效应，再对可能交互的关键因素做小型 factorial；所有 run 固定数据、seed、评测链和预算，报告增量与组合是否非加性。',
  why: '多项同时变化只能证明组合有效，不能支撑“某技术带来多少收益”的简历陈述。',
  implementation: '建立 A baseline、A+RIR、A+mix、A+decoder、A+RIR+mix 等矩阵；按相同训练预算和多 seed 运行；用差分估主效应与交互。',
  tradeoffs: '完整 2^k factorial 成本指数增长；只做单变量又会漏掉交互，因此要按机制预判选择关键组合。',
  evaluation: '报告每项 Δmetric 的均值/区间、训练成本和最差切片；组合收益需与单项收益之和对比。',
  prerequisites: ['对照实验与随机种子', '主效应与交互项', '训练预算公平性'],
  workedExample: ['RIR 单独降 CER 1.0，mix 单独降 0.8，组合只降 1.1，说明二者高度重叠。', 'decoder 调参不重训即可复用同一 acoustic output，减少实验噪声与成本。'],
  edgeCases: ['不同 run 使用不同数据顺序', '早停步数不同造成预算不公平', '先看结果再选择要展示的消融'],
  pitfalls: ['把组合提升全部归给最后加入的模块', '只跑一个 seed 把训练波动当技术收益'],
  followUps: [{ question: '实验太贵怎么办？', answer: '先做低成本代理、缩小数据或冻结模型筛选方向，再对少数候选完整训练；同时优先检验最可能交互的因素。' }, { question: '怎样定义公平预算？', answer: '固定 token/音频小时、优化 step、硬件时长或收敛准则，并同时报告最终效果和资源成本。' }],
  complexity: '完整 factorial 为 O(2^k)，筛选设计可降到 O(k) 到 O(k²) 个实验。',
});
