export default {
  "kind": "concept",
  "id": "mgpu-pp",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "流水线并行 PP 原理",
  "prompt": "流水线并行（Pipeline Parallelism）是如何把模型放到多张卡的？",
  "quickAnswer": "PP 按层把模型切成若干阶段(stage)，每张卡持连续几层，微批次(micro-batch)像流水线一样依次流过各 stage，前向向下传激活、反向向上传梯度。它显存按层分摊、通信只传激活/梯度(量小)，但会带来空闲气泡(bubble)，需用 micro-batch 调度缓解。",
  "approach": "模型按层切段，各卡持一段，micro-batch 流水穿过各 stage。",
  "explanationFocus": "是什么：PP 是把神经网络按层切成多个连续阶段，每张卡负责其中一段，数据以 micro-batch 为单位在阶段间像工厂流水线一样流动。",
  "bruteForce": "单卡放不下整模型 → OOM；或纯 DP 显存不扩展。",
  "derivation": [
    "为什么需要：DP 不省显存、TP 受限于单机带宽；当模型层数/参数极多时，按层切段能让每卡只存一部分层，显存线性下降。",
    "怎么实现：把 L 层均分到 P 个 stage；micro-batch 依次进入 stage0→stage1→…；前向传激活、反向传梯度；典型调度有 GPipe(填满再回流)与 1F1B。",
    "有什么代价：阶段间存在等待，形成 bubble 空转；切分不均衡或 micro-batch 少时气泡大、设备利用率低。",
    "怎么评测：bubble 占比、设备利用率、端到端吞吐、是否与单卡数值一致。"
  ],
  "invariant": "各 stage 参数不冗余，整体等价于单卡串行执行，仅执行顺序被流水化。",
  "walkthrough": "24 层切 4 卡，每卡 6 层；1 个样本拆成 4 个 micro-batch 流水，吞吐高于朴素串行。",
  "edgeCases": [
    "层不均匀会导致最慢 stage 成为瓶颈。",
    "跨机 PP 通信走激活，量比梯度小但仍受带宽影响。",
    "stage 数过多气泡占比上升。"
  ],
  "code": "# Python (概念)\ndef pipeline_step(stages, micro_batches, rank):\n    for mb in micro_batches:\n        act = send_recv_forward(stages[rank], mb)   # 向下传激活\n        grad = send_recv_backward(stages[rank], act)\n    return grad",
  "codeNotes": [
    "stages[rank] 是本卡持有的连续若干层。",
    "send/recv 只在相邻 stage 间发生。"
  ],
  "complexity": "显存每卡 ~ 1/P 模型；通信仅相邻 stage 的激活/梯度。",
  "followUps": [
    {
      "question": "PP 和 TP 怎么配合？",
      "answer": "常组合使用：先对每层做 TP(单机内高带宽)，再跨机做 PP(层间低带宽)，形成 3D 并行(TP×PP×DP)。"
    },
    {
      "question": "为什么 PP 通信量比 DP 小？",
      "answer": "PP 只在相邻 stage 传激活/梯度(尺寸≈单层输出)，而 DP 要对全模型参数做梯度 all-reduce，量级小很多。"
    }
  ],
  "followUpAnswers": [
    "TP 层内 + PP 层间，组合成 3D 并行。",
    "PP 只传激活，量远小于全参梯度。"
  ],
  "pitfalls": [
    "忽略 bubble 导致设备利用率低。",
    "以为 PP 通信免费——相邻 stage 仍有激活传输。"
  ],
  "beginnerSummary": "工厂装配线：把模型当成一道很长的工序，第一台机器装前几步、第二台接手下一步……零件(micro-batch)依次流过每台机器。每台机器只负责一段，不用来回搬整个大件，但中间会有短暂等待空档。",
  "prerequisites": [
    "模型层数多、可按层切分。",
    "相邻层之间只需传激活。",
    "希望显存随卡数下降。"
  ],
  "workedExample": [
    "24 层模型切 4 卡，每卡 6 层。",
    "micro-batch 流水穿过 4 个 stage。"
  ],
  "lineByLine": [
    "把模型按层切成 P 个 stage。",
    "每卡持有连续若干层。",
    "micro-batch 前向逐级传激活。",
    "反向逐级传梯度并各自更新。"
  ],
  "diagram": "样本→[卡0:层1-6]→[卡1:层7-12]→[卡2:层13-18]→[卡3:层19-24]→输出\n            (micro-batch 流水，存在气泡)"
};
