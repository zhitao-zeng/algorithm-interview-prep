import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'perf-resume-run-manifest', category: '服务性能评测', title: '实验可复现的 Run Manifest 与证据链',
  prompt: '半年后如何复现简历中的最好结果？一个 run manifest 至少应保存哪些模型、数据、环境和评测信息？',
  quickAnswer: '必须固化 git SHA、配置、数据/标签 hash、tokenizer、预训练权重、随机种子、容器与驱动、硬件、训练日志、checkpoint、原始输出和评测脚本版本，形成从结论回溯到样本的证据链。',
  why: '只保存 checkpoint 无法知道数据、代码和后处理，既不能复现，也无法在模型回归时定位变化。',
  implementation: '训练入口自动生成不可变 run ID 和 manifest；artifact 使用内容 hash；评测引用 run ID；表格与简历数字由结果文件自动生成而非手填。',
  tradeoffs: '完整 artifact 存储昂贵；容器仍不能完全冻结硬件非确定性；需要设置保留层级与隐私权限。',
  evaluation: '由新环境和第二位工程师从 manifest 重跑，关键指标落在预设容差，且任一汇总数字能追到逐样本记录。',
  prerequisites: ['版本控制与内容 hash', '随机性和非确定性', '模型/数据 artifact registry'],
  workedExample: ['run 记录 dataset manifest SHA，而不是只写“西语 10k”。', '报告中的 CER 单元格链接到 hypothesis/reference 和 scorer version，可重新聚合。'],
  edgeCases: ['外部模型仓库同 tag 内容改变', 'CUDA kernel 非确定性', '数据因合规要求被删除'],
  pitfalls: ['只记超参数，不记数据和后处理版本', '人工复制最好数字到报告导致证据链断裂'],
  followUps: [{ question: '所有 checkpoint 都永久保存吗？', answer: '不必。可永久保存里程碑与最终模型，中间 checkpoint 按策略过期，但 manifest、日志、评测输出和数据引用应长期保留。' }, { question: '无法完全复现怎么办？', answer: '预先定义统计容差和多 seed 分布；若硬件非确定性存在，目标是结论与分布可复现，而非每个 bit 一致。' }],
  complexity: 'manifest 生成 O(文件数)，内容 hash 与 artifact 大小线性；主要成本是存储和治理。',
});
