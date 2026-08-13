import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-buffer-concurrency', category: 'ONNX/TensorRT', title: 'Buffer 复用、峰值内存与并发安全',
  prompt: '简历写“buffer 复用降低约 220 MiB HWM”：为什么复用能降峰值？并发请求下怎样避免数据竞争和隐式重新分配？',
  quickAnswer: '预先按 profile 上界分配输入、输出和 workspace，生命周期跨请求复用，可避免 allocator 水位、碎片和短时双份 buffer；并发时必须为每个 execution context 配独立 buffer，或用有界池显式租借。',
  why: '单线程复用很容易，并发安全、真实 HWM 测量和异常 shape 才是工程难点。',
  implementation: '构建 context+buffer pool；按 shape bucket 分配；RAII/try-finally 归还；记录 in-use、等待、扩容和 HWM；禁止超 profile 请求偷偷 realloc。',
  tradeoffs: '池过大常驻内存高，过小增加排队；按最大 shape 分配浪费，按多 bucket 管理复杂；零拷贝可能限制内存布局。',
  evaluation: '在固定并发和 shape 分布下比较稳态/HWM、P99、allocator 次数、等待时间，并做竞态与异常恢复压力测试。',
  prerequisites: ['内存分配器与碎片', 'execution context 线程安全', '对象池与背压'],
  workedExample: ['旧实现每次 infer 分配输入输出，瞬时旧 buffer 尚未释放就申请新 buffer，HWM 抬高。', '改为 4 个 context-buffer slot 对应最大并发 4，超出请求排队而不无限扩容。'],
  edgeCases: ['异常路径未归还 slot', '动态 shape 超过 bucket 容量', '异步 kernel 未完成就复用 buffer'],
  pitfalls: ['多个线程共享同一 context 和输出 buffer', '只看进程结束后的内存，不测运行中 HWM'],
  followUps: [{ question: '为何释放后 HWM 仍不降？', answer: 'CUDA/运行时分配器常保留内存池以便复用，且碎片和异步生命周期会让高水位不立即归还系统。' }, { question: '如何确定池大小？', answer: '由允许并发、目标 P99、单 slot 内存和设备预算共同决定，并通过压测选择而非无限扩容。' }],
  complexity: '池租借平均 O(1)，内存约 O(P·B_max)，P 为 slot 数、B_max 为单 slot 上界。',
});
