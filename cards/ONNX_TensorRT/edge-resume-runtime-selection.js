import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-runtime-selection', category: 'ONNX/TensorRT', title: 'MNN、ONNX Runtime、TensorRT 与 sherpa-onnx 选型',
  prompt: '同一个 ASR/TTS/OCR 模型何时选 MNN、ONNX Runtime、TensorRT 或 sherpa-onnx？请给出硬件、算子、流式状态和维护成本的选型矩阵。',
  quickAnswer: 'TensorRT 适合 NVIDIA GPU 极致性能，MNN 偏移动/嵌入式多后端，ONNX Runtime 适合通用跨平台与多 EP，sherpa-onnx 提供语音前后处理和流式状态封装；最终应以目标设备实测而非框架名决定。',
  why: '运行时性能取决于目标硬件、算子落地、线程和内存，不能用单机 benchmark 替代产品选型。',
  implementation: '列出设备/OS/加速器、模型算子、动态 shape、流式 API、包体、冷启动和维护能力；同一模型和输入在候选 runtime 上跑 parity 与性能矩阵。',
  tradeoffs: '专用 runtime 性能高但锁定硬件；通用 runtime 易维护但关键算子可能回退 CPU；语音封装省工程却限制底层定制。',
  evaluation: '在真实设备测精度、RTF/延迟、P99、HWM、包体、冷启动、功耗和异常恢复，并给出版本升级成本。',
  prerequisites: ['推理运行时与 Execution Provider', '目标硬件算子支持', '流式语音状态机'],
  workedExample: ['Jetson OCR 优先 TensorRT，Android CPU/NPU 候选 MNN，桌面跨平台原型可先 ORT。', 'TTS 需要成熟 streaming decoder 时评估 sherpa-onnx，但仍检查自定义前端和量化算子是否支持。'],
  edgeCases: ['某算子静默回退 CPU', '目标设备驱动版本碎片化', 'runtime 线程池与应用线程池抢核'],
  pitfalls: ['引用官方峰值性能代替本机实测', '忽略包体、冷启动和升级维护成本'],
  followUps: [{ question: '如何发现 CPU fallback？', answer: '打开执行 provider/profiler 日志，检查每个 node 的实际后端，并对关键算子做 timeline 分析。' }, { question: '为什么 sherpa-onnx 不是单纯 runtime？', answer: '它在 ORT 等推理基础上提供 ASR/TTS 模型适配、特征、tokenizer、流式状态和解码接口，属于更高层语音部署框架。' }],
  complexity: '选型评测约 O(R·D·S)，R 为 runtime 数、D 为设备数、S 为测试场景数。',
});
