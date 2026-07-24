export default {
  "kind": "concept",
  "id": "mgpu-zero",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "ZeRO 优化器并行",
  "prompt": "ZeRO 是怎么在仍按数据并行逻辑下大幅降低显存的？",
  "quickAnswer": "ZeRO(Zero Redundancy Optimizer)在 DP 基础上把原本每卡都冗余保存的 optimizer 状态(分片 ZeRO-1)、梯度(ZeRO-2)、乃至参数(ZeRO-3)沿数据并行维度分片到各卡，前向/反向时按需 all-gather、更新后丢弃，使显存从 O(完整模型) 降到约 1/N。它保持 DP 的通信模式(仍 all-reduce 梯度)，却把可训模型规模提升近 N 倍。",
  "approach": "分片优化器状态/梯度/参数，按需 all-gather，消除 DP 冗余。",
  "explanationFocus": "是什么：ZeRO 是数据并行的显存优化技术，把优化器状态、梯度和参数分片到各卡，打破 DP 每卡存完整副本的冗余，从而用相近通信换来近 N 倍显存节省。",
  "bruteForce": "纯 DP 每卡存完整参数+梯度+优化器 → 大模型 OOM。",
  "derivation": [
    "为什么需要：Adam 下优化器状态(fp32 参数+m/v)常占显存大头，DP 每卡都复制一份，限制可训规模。",
    "怎么实现：ZeRO-1 只分片优化器状态；ZeRO-2 再分片梯度；ZeRO-3 进一步分片参数，前向/反向时 all-gather 所需参数、算完释放；各卡只更新自己那份分片。",
    "有什么代价：引入参数的 all-gather/reduce-scatter 通信，ZeRO-3 通信量比纯 DP 略增，但换得显存近线性下降。",
    "怎么评测：峰值显存、可训最大模型、相比 DP 的吞吐/扩展效率。"
  ],
  "invariant": "每步更新等价于全量优化器在单卡上更新；分片只在存储与通信上拆分。",
  "walkthrough": "ZeRO-3、N=8：每卡仅持 1/8 参数分片，前向 all-gather 临时拼回，峰值显存 ≈ 单卡的 1/8(加临时 gather 缓冲)。",
  "edgeCases": [
    "ZeRO-3 参数 all-gather 增加通信。",
    "offload(ZeRO-Offload)可把状态卸到 CPU 换算力。",
    "分片粒度影响通信效率。"
  ],
  "code": "# Python (概念)\ndef zero3_step(param_shard, grad_shard, opt_shard, world):\n    param = all_gather(param_shard, world)   # 临时拼回\n    grad = reduce_scatter(grad_shard, world) # 梯度分片\n    opt_shard.update(param_shard, grad)      # 只更新本分片\n    return param",
  "codeNotes": [
    "ZeRO-3 参数按需 gather、算完释放。",
    "梯度用 reduce-scatter 而非全 all-reduce。"
  ],
  "complexity": "显存 ≈ 1/N 完整模型(加临时缓冲)；通信略多于 DP。",
  "followUps": [
    {
      "question": "ZeRO-1/2/3 区别？",
      "answer": "依次分片优化器状态、再加梯度、再加参数；级别越高显存越省，但参数 all-gather 通信越多，ZeRO-3 最省显存。"
    },
    {
      "question": "ZeRO 还是 DP 吗？",
      "answer": "是；它保持数据并行逻辑(各卡吃不同数据、参数最终一致)，只是把冗余状态分片，通信仍围绕梯度/参数分片进行。"
    }
  ],
  "followUpAnswers": [
    "逐级分片 优化器→梯度→参数。",
    "ZeRO 仍是 DP，仅分片冗余状态。"
  ],
  "pitfalls": [
    "以为 ZeRO 完全不通信——仍有 gather/scatter。",
    "混淆 ZeRO 与 TP/PP 的切分维度。"
  ],
  "beginnerSummary": "原本每人手里都有一整套相同的笔记(参数+优化器)，很占地方。ZeRO 说：别都存全本，大家分着存——你存第 1 章、我存第 2 章，要用时临时互相借看(all-gather)，改完只改自己那章。这样每人书包轻了近 N 倍，还能管更大的书。",
  "prerequisites": [
    "理解 DP 的冗余存储。",
    "知道 Adam 优化器状态占比大。",
    "会 all-gather/reduce-scatter。"
  ],
  "workedExample": [
    "ZeRO-3、N=8，每卡持 1/8 参数。",
    "前向 all-gather 临时拼回后释放。"
  ],
  "lineByLine": [
    "把优化器/梯度/参数分片。",
    "前向按需 all-gather 参数。",
    "反向 reduce-scatter 梯度。",
    "各卡只更新自己分片。"
  ],
  "diagram": "DP: 每卡 [参数+梯度+优化器] (冗余)\nZeRO-3: 卡0[1/8] 卡1[1/8] ... 卡7[1/8]  (按需 gather)"
};
