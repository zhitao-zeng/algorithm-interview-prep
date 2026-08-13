import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-matcha-cfm', category: '语音合成', title: 'Matcha-TTS 的条件 Flow Matching',
  prompt: '请从概率路径、速度场训练、ODE 采样和步数解释 Matcha-TTS，不能只说“它比 diffusion 快”。',
  quickAnswer: 'Matcha 在文本和时长条件下学习把简单噪声分布沿连续概率路径运输到 mel 分布的速度场；训练随机采样时间 t 回归目标速度，推理从噪声用 ODE solver 积分少量步得到 mel。',
  why: '简历声称交付 Matcha/VITS-Melo，面试官会要求区分 flow matching、diffusion score matching 与普通非自回归模型。',
  implementation: '文本 encoder 与时长/对齐给条件 μ；采样 x0、x1 和 t 构造 x_t；网络预测 vθ(x_t,t,cond) 并回归目标速度；推理选 Euler/Heun 和步数。',
  tradeoffs: '步数少速度快但离散误差大；对齐和时长错误仍会造成漏读重读；solver、温度和条件强度影响自然度与多样性。',
  evaluation: '画 NFE/RTF/MOS Pareto 曲线，报告 mel 失真、漏读重读率、长句稳定性和不同 solver 的重复实验。',
  prerequisites: ['连续归一化流与 ODE', 'Flow Matching 速度场', 'TTS 文本-时长对齐'],
  workedExample: ['训练时随机取 t=0.4 构造中间状态，网络学习此处应朝目标 mel 移动的速度。', '推理用 4、8、16 步 Euler，观察 8→16 步听感收益是否值得两倍时延。'],
  edgeCases: ['时长预测导致 mel 长度错误', '极少采样步产生高频伪影', '长静音区速度场不稳定'],
  pitfalls: ['把 flow matching 直接说成逐步加噪 DDPM', '只报步数，不报 solver 与 NFE'],
  followUps: [{ question: 'Flow Matching 为什么训练不必反解 ODE？', answer: '训练直接在已知概率路径的随机中间点监督目标速度场；只有采样时才数值积分 learned ODE。' }, { question: '步数越多一定越好吗？', answer: '数值误差通常下降，但模型误差不会消失，且时延线性增加；应在质量-速度 Pareto 上选工作点。' }],
  complexity: '训练一次网络前向；采样约 O(NFE·C_model)，NFE 为 ODE 函数评估次数。',
});
