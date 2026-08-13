import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-rir-signal-chain', category: 'ASR 专项', title: 'RIR、频响、AGC、Codec 与 Clipping 信道仿真',
  prompt: '怎样按真实播放链路构造 RIR、频响、AGC、Codec、Clipping 失真，为什么顺序和响度归一化会影响训练收益？',
  quickAnswer: '应先依据真实链路确定顺序：卷积 RIR/设备频响，再做增益或 AGC、非线性 clipping 与 codec；每步保存参数并在合理响度范围内归一化，避免把伪影或音量捷径当鲁棒性。',
  why: '随机叠增广容易生成物理上不存在的信号，模型学到仿真器特征而非真实信道不变性。',
  implementation: '用 FFT overlap-add 计算 x*h；从实测分布采样 RT60、频响、增益、codec 码率和 clipping threshold；按 clean/augmented/in-domain 比例回放并记录 recipe。',
  tradeoffs: '参数范围太窄覆盖不足，太宽会伤害 clean；串联失真越多越难定位单项收益，且 codec 调用增加数据生成成本。',
  evaluation: '做单因子与组合消融，分别报告 clean、合成信道、真实信道 CER，并比较仿真参数分布与线上采样分布。',
  prerequisites: ['离散卷积与 FFT overlap-add', 'dB/SNR/响度', 'AGC、量化与非线性失真'],
  workedExample: ['对 16 kHz 音频卷积 0.4 秒 RIR，尾部能量应被保留而非截掉。', '先随机增益再 clipping 与先 clipping 再增益会得到完全不同的削顶比例，必须匹配真实链路。'],
  edgeCases: ['卷积后长度变化导致标注错位', '归一化把 clipping 痕迹部分抹掉', 'codec 编解码引入固定延迟'],
  pitfalls: ['把 RIR 卷积错误实现成逐点乘法', '只在合成测试集提升就宣称真实信道鲁棒'],
  followUps: [{ question: '为什么 RIR 改用 FFT 会快？', answer: '长卷积直接计算约 O(TK)，FFT 分块卷积约 O(T log K)，RIR 较长时差异显著。' }, { question: '如何避免增强伤害 clean？', answer: '控制增强采样率与强度，保留 clean replay，分域采样并设置 clean CER regression gate。' }],
  complexity: '直接卷积 O(TK)，FFT overlap-add 约 O(T log K)；额外存储取决于 FFT block 与 RIR 长度。',
});
