export default {
  "id": "dt-grad-checkpoint",
  "kind": "concept",
  "category": "分布式训练",
  "title": "Gradient Checkpointing",
  "difficulty": "Medium",
  "prompt": "请讲讲 Gradient Checkpointing / Activation Recomputation 是怎么以时间换显存的，checkpoint 该如何选择，对吞吐有什么影响？",
  "quickAnswer": "Gradient Checkpointing 不在前向保存全部中间激活，只对少数“检查点”层存激活，反向时从这些点重新前向计算得到缺失激活，从而把激活显存从 O(层数) 降到 O(√层数) 甚至更小。代价是多一次前向重算，吞吐约降 20–40%。选择上应在显存瓶颈处对冗余激活做分块 checkpoint，而非全量。",
  "beginnerSummary": "训练时要存下中间结果用于反传，太多会爆显存。检查点技术只记“关键节点”，反传需要时再临时重算一遍，用多花一点时间换显存空间。",
  "explanationFocus": "是什么：Gradient Checkpointing（又称 Activation Recomputation）是以额外计算换取显存的技术：前向只保留部分层的输出（检查点），其余中间激活丢弃；反向传播时从最近的检查点重新执行前向以重建激活，再正常求梯度。",
  "approach": "把网络按段划分，每段入口设为 checkpoint，只存段输入。反向时对每个段：先重算该段前向得到激活，再算该段梯度，递归向上。选择性 checkpoint（如只对 transformer block 级而非每算子）在显存与重算成本间取平衡。分布式下常与序列并行/PP 配合进一步省激活。",
  "code": "import torch\nfrom torch.utils.checkpoint import checkpoint\n\ndef block_forward(block, x):\n    # 只对 block 入口做检查点，内部激活不保存\n    return checkpoint(block, x, use_reentrant=False)",
  "complexity": "显存 O(√L)（全量重算）至 O(L/S)；时间多 1 次前向（约 +33% 计算）",
  "derivation": [
    "为什么需要：大模型前向产生的中间激活（尤其长序列/大 batch）常比权重更占显存，成为单卡容量瓶颈。",
    "怎么实现：用 checkpoint 包裹子模块，前向不建计算图只存输入；反向触发重算并建图求梯度。",
    "有什么代价：每个 checkpoint 段在反向需重算一次前向，总 FLOPs 增加约 1/3，吞吐下降。",
    "怎么评测：对比开/关 checkpoint 的峰值显存与 step 时间；目标是显存够放下更大 batch，整体吞吐反升。"
  ],
  "edgeCases": [
    "RNG 相关层（dropout）重算时必须复用前向相同的随机种子，否则梯度错误（需 seed 保存/恢复）。",
    "use_reentrant=True 旧实现不兼容某些含 inplace 的算子，易报错或静默错误。",
    "与 DDP/FSDP 混用时，重算发生在哪一层、是否跨分片需对齐，否则显存统计失真。"
  ],
  "pitfalls": [
    "对所有算子都 checkpoint 导致重算过多、吞吐暴跌，应只 checkpoint 显存大头（如 attention/FFN 块）。",
    "误以为 checkpoint 免费，在显存本就充裕时开启反而单纯变慢。"
  ],
  "prerequisites": [
    "反向传播的计算图与激活存储机制",
    "显存峰值与 activation 占用的关系"
  ],
  "workedExample": [
    "例：Transformer 有 24 层，每层激活 2GB，全存需 48GB；每 4 层设一个 checkpoint，仅存 6 个入口激活约 12GB，反向重算被丢弃的段。",
    "例：开启 checkpoint 后峰值显存从 80GB 降到 32GB，得以把 micro-batch 翻倍，虽然 step 时间 +30%，但有效吞吐因更大 batch 提升。"
  ],
  "lineByLine": [
    "`from torch.utils.checkpoint import checkpoint`：引入检查点函数。",
    "`def block_forward(block, x)`：包裹单个 block 的前向。",
    "`checkpoint(block, x, use_reentrant=False)`：前向不保存 block 内部激活，仅记录输入 x。",
    "`return ...`：反向时框架自动从 x 重算 block 内部并求梯度（非重入式更安全）。"
  ],
  "followUps": [
    {
      "question": "全量重算和选择性重算怎么选？",
      "answer": "全量（每段都 checkpoint）显存最省但重算最多；选择性（只 checkpoint 大激活块）在二者间折中。经验上按 transformer block 级 checkpoint 即可，不必到算子级。"
    },
    {
      "question": "为什么重算不影响梯度正确性？",
      "answer": "重算用的是确定性的前向（固定输入和权重），重建的激活与原前向数学上一致，因此反向链式法则得到的梯度与“本该保存”的完全等价，只是多花了一次前向。"
    }
  ],
  "followUpAnswers": [
    "全量（每段都 checkpoint）显存最省但重算最多；选择性（只 checkpoint 大激活块）在二者间折中。经验上按 transformer block 级 checkpoint 即可，不必到算子级。",
    "重算用的是确定性的前向（固定输入和权重），重建的激活与原前向数学上一致，因此反向链式法则得到的梯度与“本该保存”的完全等价，只是多花了一次前向。"
  ]
};
