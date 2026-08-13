import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'edge-resume-export-parity', category: 'ONNX/TensorRT', title: 'PyTorch→ONNX 数值一致性与逐层定位',
  prompt: '模型导出 ONNX 后整体精度下降，如何区分预处理、算子语义、动态 shape、精度格式和后处理差异？',
  quickAnswer: '先冻结同一输入与预后处理，比较 PyTorch/ONNX 的最终输出；再为关键层导出中间张量，寻找首个超容差节点，并核对 eval 状态、opset、padding、resize、normalization 和 dtype。',
  why: '只看最终 CER/F1 无法定位导出错误，端侧部署最重要的是建立可重复的 parity pipeline。',
  implementation: '保存 golden input/output；强制 eval 与固定 seed；逐层记录 max/mean error、cosine similarity；二分模型子图定位首个漂移算子，再替换或写 plugin。',
  tradeoffs: '导出大量中间节点增加模型体积和调试时间；容差过严会误报正常浮点差，过松会放过累计误差。',
  evaluation: '单元层容差、端到端任务指标、不同 shape/dtype/device 的矩阵测试全部通过，才能进入性能优化。',
  prerequisites: ['ONNX graph/node/tensor', '浮点误差与 dtype', '模型预处理和后处理一致性'],
  workedExample: ['最终 cosine 从 0.999 降到 0.91，逐层发现 Resize 后首次异常。', '核对后发现 align_corners 语义不同，显式设置导出属性后恢复一致。'],
  edgeCases: ['BatchNorm 未切 eval', '随机算子或 dropout 未关闭', '空序列/极端 shape 走不同分支'],
  pitfalls: ['直接用最终输出猜哪一层错', '还未证明一致性就开始量化和融合'],
  followUps: [{ question: '容差怎样设？', answer: '按 dtype、层类型和输出尺度设置 abs/rel tolerance，并以最终任务指标为上层护栏；FP16 容差不能照搬 FP32。' }, { question: '找不到中间输出怎么办？', answer: '修改 ONNX graph 将目标 tensor 注册为 graph output，或按子图拆分运行进行二分定位。' }],
  complexity: '逐层全量比较约 O(L·C)，二分子图可将定位轮数降到 O(log L)，C 为一次推理成本。',
});
