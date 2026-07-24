export default {
  "id": "dt-zero-fsdp",
  "kind": "concept",
  "category": "分布式训练",
  "title": "ZeRO 与 FSDP 显存分片",
  "difficulty": "Hard",
  "prompt": "请讲讲 ZeRO 的三种分片策略（ZeRO-1/2/3）分别分片了什么，FSDP 是如何实现 ZeRO-3 的，以及 CPU offload 和通信量对比？",
  "quickAnswer": "ZeRO 把训练状态（优化器状态、梯度、参数）做分片以消除数据并行中的冗余显存。ZeRO-1 只分片优化器状态，ZeRO-2 再分片梯度，ZeRO-3（即 ZeRO-DP 全分片）进一步分片模型参数。FSDP 是 PyTorch 对 ZeRO-3 的工程实现，用 all-gather 在用时拼回完整参数、用 reduce-scatter 汇总梯度。CPU offload 把优化器状态/梯度卸载到内存换显存，代价是 host-device 传输开销；ZeRO-3 通信量比 DDP 约高 1.5 倍。",
  "beginnerSummary": "训练大模型时，每张 GPU 都存一份完整的模型、梯度和优化器状态，非常浪费。ZeRO 的思路是让不同的卡各自只保存其中一份，需要的时候再临时拼起来用，从而大幅省显存。FSDP 是 PyTorch 里开箱即用的实现。",
  "explanationFocus": "是什么：ZeRO（Zero Redundancy Optimizer）是微软提出的显存优化数据并行策略，核心思想是把原本每张卡都完整冗余保存的“训练状态”（优化器状态、梯度、模型参数）沿数据并行维度分片，使每张卡的显存占用从 O(full) 降到接近 O(full/N)。FSDP（Fully Sharded Data Parallel）是 PyTorch 原生对 ZeRO-3 的实现，让分片对用户基本透明。",
  "approach": "先按“分片粒度”由浅入深：ZeRO-1 仅分片优化器状态（Adam 的 m/v 和 fp32 主权重最占显存）；ZeRO-2 在 1 的基础上再分片梯度；ZeRO-3 进一步把参数也分片。FSDP 在 forward/backward 前用 all-gather 把本层 shard 拼成完整参数，用完后立即释放；backward 中用 reduce-scatter 把梯度按行求和并分散到对应 owner。CPU offload 通过把优化器步进放到 CPU 并异步搬运来换显存。",
  "code": "import torch\nfrom torch.distributed.fsdp import FullyShardedDataParallel as FSDP\n\n# 把每个子模块包装成分片单位\ndef wrap(model):\n    for name, child in model.named_children():\n        if name == 'decoder':\n            setattr(model, name, FSDP(child, cpu_offload=True))\n        else:\n            setattr(model, name, child)\n    return FSDP(model)",
  "complexity": "显存 O(model_size / gpu_count)，通信量 ZeRO-3 比 DDP 约高 1.5x（多一次参数 all-gather）",
  "derivation": [
    "为什么需要：标准 DDP 每张卡都存完整优化器状态（fp32 主权重+动量≈12字节/参数）+梯度+参数，7B 模型仅优化器状态就约 84GB，远超单卡显存，且大量冗余。",
    "怎么实现：ZeRO-1 沿 DP 维分片优化器状态，每卡只更新自己那 1/N；ZeRO-2 再分片梯度，backward 中用 reduce-scatter 代替 all-reduce；ZeRO-3 分片参数，forward 前 all-gather 拼回、用完释放。",
    "有什么代价：分片越细，通信越多——ZeRO-3 比 DDP 多一次参数 all-gather（约 1.5x 通信）；CPU offload 引入 PCIe/NVLink 搬运延迟并增加 step 时间。",
    "怎么评测：在固定 batch/模型下对比峰值显存、吞吐 tokens/s、通信占比；用 torch 显存快照看碎片与峰值，用 NCCL 计时看 bubble。"
  ],
  "edgeCases": [
    "参数量很小（如 <100M）时，ZeRO-3 的分片开销与通信可能让吞吐反低于 DDP。",
    "嵌套与共享权重（tied embedding）在分片参数时会出现多 owner，需要 wrap 策略或 flatten 处理。",
    "CPU offload 与梯度累积配合时，若累积步数过多，offload 缓冲区会堆积导致显存/内存峰值异常。"
  ],
  "pitfalls": [
    "误以为 ZeRO-3 一定比 ZeRO-2 省显存却忽视通信上涨，节点间带宽不足时反而变慢。",
    "FSDP wrap 粒度太细（逐层）会爆增 all-gather 次数，应按 transformer block 为单位 wrap。"
  ],
  "prerequisites": [
    "数据并行 DDP 与 all-reduce/reduce-scatter 的基本概念",
    "优化器状态组成（fp32 主权重、一阶/二阶动量）与 Adam 显存占用"
  ],
  "workedExample": [
    "例：7B 模型用 fp16 参数(14GB)+fp32 主权重+Adam 动量(84GB)。DDP 每卡需约 98GB；ZeRO-1 把优化器状态 84GB 分到 8 卡，每卡约 24.5GB；ZeRO-3 再把参数与梯度分摊，每卡约 2GB 级。",
    "例：8 卡 A100-80G 训 13B，ZeRO-3+CPU-offload 可放下；forward 时 FSDP 逐 block all-gather 参数，backward 后 reduce-scatter 梯度，optimizer.step 在 CPU 完成。"
  ],
  "lineByLine": [
    "`import torch` / `from torch.distributed.fsdp import ...`：引入 FSDP 包装器。",
    "`for name, child in model.named_children()`：按子模块遍历，决定分片单位。",
    "`if name == 'decoder': setattr(..., FSDP(child, cpu_offload=True))`：对重模块启用分片并 offload 优化器状态到 CPU。",
    "`return FSDP(model)`：最外层再包一层，使根模块参数也参与分片。"
  ],
  "followUps": [
    {
      "question": "ZeRO-3 的 all-gather 和 DDP 的 all-reduce 在通信量上到底差多少？",
      "answer": "DDP 每步对梯度做一次 all-reduce（2ψ 字节，ψ 为参数量）。ZeRO-3 还需对参数做 N-1 次 all-gather（≈2ψ），总通信约 1.5x；但 ZeRO-3 显存省很多，可在更少卡上跑更大模型，通信/卡数比更优。"
    },
    {
      "question": "为什么 CPU offload 不完全免费？",
      "answer": "offload 把 optimizer.step 放到 CPU，需把梯度从 GPU 拷到 CPU、更新后再拷回，引入 PCIe 带宽瓶颈且 step 串行化；只在 GPU 显存真正不够、且 CPU 内存与带宽富余时划算。"
    }
  ],
  "followUpAnswers": [
    "DDP 每步对梯度做一次 all-reduce（2ψ 字节，ψ 为参数量）。ZeRO-3 还需对参数做 N-1 次 all-gather（≈2ψ），总通信约 1.5x；但 ZeRO-3 显存省很多，可在更少卡上跑更大模型，通信/卡数比更优。",
    "offload 把 optimizer.step 放到 CPU，需把梯度从 GPU 拷到 CPU、更新后再拷回，引入 PCIe 带宽瓶颈且 step 串行化；只在 GPU 显存真正不够、且 CPU 内存与带宽富余时划算。"
  ]
};
