import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-icefall-lhotse', category: 'ASR 专项', title: 'icefall 与 Lhotse 训练流水线',
  prompt: '从 Lhotse manifest、动态采样、特征、checkpoint 到 k2 解码，讲清一个可复现的 icefall ASR recipe。',
  quickAnswer: 'Lhotse 用 Recording/Supervision/Cut manifest 把音频、标注和切片版本化；sampler 依时长动态组 batch，icefall 负责模型训练、断点恢复和 k2 解码，配置、随机种子与数据清单共同决定可复现性。',
  why: '简历列出工具链后，面试官会区分“跑过脚本”和“能设计、定位、复现整条训练管线”。',
  implementation: '校验 manifest 与音频可读性，固定特征和 tokenizer 版本；按总时长动态 batch；记录 config、git SHA、数据 hash、seed 与 checkpoint；解码输出保留原始 hypothesis。',
  tradeoffs: '动态 batch 提升利用率但使 step 间样本数变化；在线特征节省存储却增加 CPU 抖动；严格复现会降低部分吞吐优化空间。',
  evaluation: '除 loss/CER 外监控 batch 时长、dataloader wait、坏音频率、GPU 利用率、恢复后一致性和 decoder 失败率。',
  prerequisites: ['Lhotse Cut/Recording/Supervision', 'PyTorch 分布式训练', 'k2 解码与 tokenizer'],
  workedExample: ['将每 batch 上限设为 300 秒而非固定 32 条，使短句 batch 更大、长句 batch 自动变小。', '从 step 20k 恢复后比较下一批样本 ID、学习率和 loss，验证随机状态完整恢复。'],
  edgeCases: ['manifest 指向丢失或损坏音频', '多进程 sampler 重复取样', '断点只恢复权重未恢复优化器与随机状态'],
  pitfalls: ['只保存模型参数，不保存配置和数据版本', '把动态 batch 的单 step loss 直接与固定 batch 比较'],
  followUps: [{ question: '为什么 Lhotse 用 Cut 抽象？', answer: 'Cut 把录音片段、监督、特征与增广组合成可懒执行的数据单元，便于切片、混音和动态采样。' }, { question: '怎样证明实验可复现？', answer: '在同环境从同一 checkpoint 恢复，验证后续样本序列、学习率、若干 step loss 和最终指标落在预设容差内。' }],
  complexity: '数据扫描 O(N)，动态分桶通常 O(N log N) 或近线性；训练成本由总音频时长与模型前向决定。',
});
