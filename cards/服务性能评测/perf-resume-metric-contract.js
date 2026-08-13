import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'perf-resume-metric-contract', category: '服务性能评测', title: '简历指标的口径、分母与 Metric Contract',
  prompt: 'CER、WER、F1、Judge mean、RTF、FPS 和 23 min/segment 如何写成不可歧义、可复算的 metric contract？',
  quickAnswer: '每个指标必须固定输入集合、过滤规则、分母、聚合方式、硬件、并发、预热、版本和失败样本处理；同时保存逐样本结果，使任何人可从原始记录复算简历数字。',
  why: '同名指标常因 macro/micro、忽略失败、硬件或后处理不同而不可比较，精确小数反而更容易被质疑。',
  implementation: '为每个指标定义 schema：dataset hash、sample ID、raw output、parser、S/D/I/N 或 TP/FP/FN、latency timeline、hardware manifest 和 aggregation version。',
  tradeoffs: '严格 contract 增加数据和版本维护成本，但能避免评测漂移；保存逐样本结果需要隐私和存储治理。',
  evaluation: '由第二人独立运行复算，结果在容差内一致；修改 normalizer/过滤规则必须触发版本变化和新旧对账。',
  prerequisites: ['micro/macro/weighted 聚合', '数据与代码版本化', '失败样本计入原则'],
  workedExample: ['20 FPS 必须说明分辨率、batch、硬件、是否含预后处理和持续运行窗口。', '23 min/segment 必须说明 segment 时长、50 steps、并行数以及是否包含编码和落盘。'],
  edgeCases: ['失败请求被直接从分母删除', '测试集更新但名称未变', '缓存命中让重复压测虚高'],
  pitfalls: ['只在幻灯片保留汇总数字', '把不同硬件、batch 或后处理结果横向比较'],
  followUps: [{ question: '为什么保留逐样本结果？', answer: '汇总值无法做 paired test、切片、错误归因和口径迁移，逐样本记录是可复算性的最小证据。' }, { question: '失败样本如何计入？', answer: '预先定义：质量任务通常作为最差结果或单独 failure rate，性能任务报告超时/崩溃并保留在请求分母，不能事后删除。' }],
  complexity: '聚合 O(N)，存储 O(N·R)，R 为每样本保留的原始输出与诊断字段大小。',
});
