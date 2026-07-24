export default {
  "id": "dt-overlap-bubble",
  "kind": "concept",
  "category": "分布式训练",
  "title": "通信计算重叠与 Pipeline Bubble 优化",
  "difficulty": "Hard",
  "prompt": "请讲讲分布式训练中通信计算重叠与 pipeline bubble 优化：1F1B、interleaved schedule、comm/compute overlap 如何减小 bubble 比例？",
  "quickAnswer": "Pipeline 并行中，各 stage 等待前 stage 数据会产生 bubble（空闲）。朴素 GPipe 先全前向再全后向，bubble 大；1F1B 在 warmup 后每完成一次前向立即排一次后向，使后向与前向在不同 stage 重叠，bubble 降到 (pp-1)/(m+pp-1)。interleaved 1F1B 让每设备持有多段不连续层，进一步把等效 pp 减小。comm/compute overlap 用异步通信（如 FSDP 的 all-gather 与 forward 重叠）隐藏通信延迟。",
  "beginnerSummary": "流水线训练像工厂流水线，某些工位等料时会空转（bubble）。优化办法是让“算完一部分立刻回头算梯度”以及“在等数据的空隙里偷偷做通信”，把空转时间压到最小。",
  "explanationFocus": "是什么：Pipeline bubble 指流水线并行中部分 stage 因等待前序 stage 的输出而空闲的时间比例。通信计算重叠是指在前反向计算的同时异步执行集合通信（如梯度同步、参数 all-gather），把通信延迟隐藏在计算背后，从而提升设备利用率。",
  "approach": "用 1F1B 调度：先 warmup 若干 micro-batch 的前向，之后每完成一个前向就安排一个后向，使下游后向与上游前向重叠，bubble 仅出现在两端。interleaved schedule 让每个设备切分为多段（如 1F1B-int）并交错排布，缩短关键路径。comm/compute overlap 借助非阻塞 NCCL 调用，把 FSDP/TP 的 all-gather/reduce-scatter 与矩阵计算并发。",
  "code": "import torch\nfrom torch.distributed.pipeline.sync import Pipe\n\ndef build_pipe(layers, chunks):\n    # 把模型按 stage 切分并以 micro-batch=chunks 流水\n    model = Pipe(nn.Sequential(*layers), chunks=chunks)\n    return model",
  "complexity": "bubble 占比 ≈ (pp-1)/(m+pp-1)；interleaved 等效 pp 减半则 bubble 近减半",
  "derivation": [
    "为什么需要：PP 必然有 stage 间依赖，朴素全前向再全后向导致大量设备空等，MFU 低。",
    "怎么实现：1F1B 交错前反向；interleaved 让每设备多段层交错流水；异步通信 overlap 隐藏 all-reduce/gather。",
    "有什么代价：1F1B 需保存更多在途 micro-batch 的激活（显存随 m 增）；interleaved 实现复杂、调度开销上升。",
    "怎么评测：测 bubble 时间占比、MFU、以及 overlap 后通信是否在 timeline 上被隐藏。"
  ],
  "edgeCases": [
    "micro-batch 数 m < pp-1 时 1F1B 无法填满流水线，bubble 接近理论最大。",
    "warmup 阶段需缓存激活，m 过大导致显存峰值上升，需与 activation checkpoint 配合。",
    "异步通信若与计算争用同一 NVLink/IB 带宽，overlap 收益下降甚至反噬。"
  ],
  "pitfalls": [
    "只切 PP 却不调 micro-batch 数，bubble 仍高，误以为 PP 无效。",
    "把通信和计算强行绑在同一流未用独立 stream，导致本可重叠的通信串行化。"
  ],
  "prerequisites": [
    "Pipeline 并行 stage 切分与 micro-batch 概念",
    "异步集合通信（非阻塞 NCCL）与 CUDA stream"
  ],
  "workedExample": [
    "例：pp=8, m=8，朴素 GPipe bubble 约 (8-1)/8≈88%；1F1B 降到 (8-1)/(8+8-1)=7/15≈47%；interleaved 等效 pp≈4 则约 3/11≈27%。",
    "例：FSDP 中把下一层参数的 all-gather 与当前层 forward 计算重叠，timeline 上通信被计算完全掩盖，step 时间接近纯计算。"
  ],
  "lineByLine": [
    "`from torch.distributed.pipeline.sync import Pipe`：引入同步流水线封装。",
    "`def build_pipe(layers, chunks)`：layers 为已按 stage 划分的层列表。",
    "`Pipe(nn.Sequential(*layers), chunks=chunks)`：以 chunks 个 micro-batch 做流水调度（默认类 1F1B）。",
    "`return model`：返回的模型在前向时按 micro-batch 切分并流水线执行，减小 bubble。"
  ],
  "followUps": [
    {
      "question": "1F1B 和 interleaved 1F1B 的关键区别？",
      "answer": "1F1B 每个设备持一段连续层，bubble 取决于 pp；interleaved 让每设备持多段不连续的薄层并交错调度，使等效流水线深度变小、关键路径更短，bubble 进一步下降，但实现与激活管理更复杂。"
    },
    {
      "question": "comm/compute overlap 真的零成本吗？",
      "answer": "不是零成本：异步通信仍占用网络带宽与部分计算资源，若通信量超过空闲带宽或同 stream 竞争，重叠会失效；需把通信放到独立 CUDA stream 并留足空闲带宽才算真正隐藏。"
    }
  ],
  "followUpAnswers": [
    "1F1B 每个设备持一段连续层，bubble 取决于 pp；interleaved 让每设备持多段不连续的薄层并交错调度，使等效流水线深度变小、关键路径更短，bubble 进一步下降，但实现与激活管理更复杂。",
    "不是零成本：异步通信仍占用网络带宽与部分计算资源，若通信量超过空闲带宽或同 stream 竞争，重叠会失效；需把通信放到独立 CUDA stream 并留足空闲带宽才算真正隐藏。"
  ]
};
