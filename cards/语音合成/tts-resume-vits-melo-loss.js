import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'tts-resume-vits-melo-loss', category: '语音合成', title: 'VITS-Melo 的损失、对齐与推理路径',
  prompt: 'VITS-Melo 中 posterior encoder、text prior、flow、duration predictor、decoder 和 discriminator 各自做什么？训练与推理路径为何不同？',
  quickAnswer: '训练时 posterior 从真实语音提取潜变量，flow 将其对齐到文本条件 prior，MAS/时长模块学习单调对齐，decoder 与多尺度/多周期判别器重建波形；推理时没有真实语音，只从文本 prior 和预测时长采样后经逆 flow/decoder 出声。',
  why: '只背 VAE+GAN 无法解释声音微调为何崩、哪些模块能冻结、推理时为何不需要 posterior。',
  implementation: '分别画训练和推理计算图；列 mel/feature、KL、duration、adversarial、feature matching 等损失；微调按数据量选择冻结 text encoder、flow 或 decoder。',
  tradeoffs: '端到端联合优化自然度高但损失互相牵制；GAN 不稳定；小数据全量更新容易破坏发音和韵律。',
  evaluation: '监控各 loss 只是诊断，最终需 MOS、说话人相似度、音素错误、时长/F0、崩坏率和 unseen text 泛化。',
  prerequisites: ['VAE/ELBO 与 KL', 'Normalizing Flow', 'GAN 判别器与 feature matching'],
  workedExample: ['训练时 wav→posterior z，文本→prior，二者通过 flow 对齐；推理时 posterior 分支完全移除。', '2 小时方言数据只更新 speaker/language embedding 与部分 decoder，和全量微调比较旧域发音退化。'],
  edgeCases: ['MAS 对齐跳字导致漏读', '判别器过强使生成器梯度不稳', '小数据声纹提高但音素准确率下降'],
  pitfalls: ['把训练 posterior 当推理必须模块', '只用训练 loss 选择声线 checkpoint'],
  followUps: [{ question: 'Flow 在 VITS 中解决什么？', answer: '它用可逆变换缩小 posterior 潜变量与文本条件 prior 的分布差距，同时保留可计算 likelihood/Jacobian。' }, { question: '小数据先冻结哪些层？', answer: '通常先保留已学稳的文本/对齐模块，优先更新 speaker/language 条件与少量声学/decoder 层，再依据发音和音色指标逐层解冻。' }],
  complexity: '训练含生成器与判别器多次前后向；推理主要为文本 encoder、时长、flow 与并行 decoder，近似随输出长度线性增长。',
});
