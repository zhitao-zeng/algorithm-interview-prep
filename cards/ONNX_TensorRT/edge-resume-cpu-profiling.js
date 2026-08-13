import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-cpu-profiling', category: 'ONNX/TensorRT', title: '端侧 CPU 线程、亲和性与算子 Profiling',
  prompt: 'MNN/ORT 在 CPU 上线程越多为何可能越慢？如何拆分预处理、推理、后处理并定位 3.1 倍加速来自哪里？',
  quickAnswer: '线程过多会产生调度、缓存争用和应用线程抢核；应固定大小核/频率条件，分别测预处理、runtime node、内存拷贝和后处理，扫描 intra/inter-op 线程与 affinity，报告端到端而非只报 kernel。',
  why: '移动和嵌入式 CPU 性能受 DVFS、热降频和线程竞争影响，桌面单次 warm benchmark 不可信。',
  implementation: '预热后跑长时压测；记录 wall/cpu time、上下文切换、cache miss、频率和温度；逐阶段埋点并用 runtime profiler 找 top operators。',
  tradeoffs: '绑核提高稳定性但可能影响系统其他任务；少线程延迟稳却降低峰值吞吐；高性能核耗电与发热更高。',
  evaluation: '给线程数-延迟-吞吐-功耗曲线，至少报告 P50/P99、冷启动、稳态热机和端到端加速分解。',
  prerequisites: ['intra-op/inter-op 并行', 'CPU cache 与线程调度', 'DVFS 与热降频'],
  workedExample: ['线程从 4 增到 8，单模型 kernel 快 5%，但与音频线程抢核使端到端 P99 变差 20%。', '3.1× 中 2.2× 来自计算后端，剩余来自 buffer 复用和后处理向量化，应分别说明。'],
  edgeCases: ['性能核被系统任务占用', '短请求线程启动成本大于计算', '持续运行后热降频'],
  pitfalls: ['只跑一次取最小延迟', '只报模型 infer，不含 resize/tokenizer/decoder'],
  followUps: [{ question: '为什么平均延迟不够？', answer: '交互式语音和端侧 UI 更受尾延迟影响，线程争用与热降频通常首先体现在 P95/P99。' }, { question: '如何验证亲和性收益？', answer: '固定其他变量，分别在大小核配置下长时重复测，记录频率温度和系统负载，不能只看一次最好值。' }],
  complexity: '线程配置扫描约 O(H·N·C)，H 为配置数、N 为请求数、C 为单次端到端成本。',
});
