export default {
  "kind": "concept",
  "id": "mgpu-dp",
  "category": "多GPU并行",
  "difficulty": "Easy",
  "title": "数据并行 DP 及其局限",
  "prompt": "数据并行（Data Parallelism）是怎么工作的，它有哪些局限？",
  "quickAnswer": "DP 在每张卡上复制完整模型，各自吃不同的数据分片，前向反向后通过 all-reduce 把梯度求平均再同步参数。它实现简单、通信只在梯度层，但每张卡都要存完整模型与优化器状态，显存无法扩展，且梯度 all-reduce 在卡多时会成为瓶颈。",
  "approach": "每张卡持有完整模型副本，按数据分片并行，梯度 all-reduce 后更新。",
  "explanationFocus": "是什么：DP 是把同一份模型复制到 N 张卡，每卡处理不同 batch 分片，反向后汇总梯度求平均，使各卡参数保持一致。",
  "bruteForce": "只在单卡训练——batch 受限、显存受限，大模型直接 OOM 且慢。",
  "derivation": [
    "为什么需要：单卡 batch 太小训练不稳、显存不足，但很多场景模型能单卡放下，只需扩大样本并行。",
    "怎么实现：各卡前向得 loss、反向得梯度；用 all-reduce(SUM)/N 得到平均梯度；各卡用同一平均梯度更新，保持参数一致(或零冗余 ZeRO 变体)。",
    "有什么代价：每张卡都存完整参数+梯度+优化器状态，显存不随卡数减少；梯度同步通信量正比于参数量。",
    "怎么评测：吞吐随卡数扩展效率(linear scaling)、梯度同步耗时占比、最终精度是否与单卡一致。"
  ],
  "invariant": "所有卡参数始终一致；平均梯度等价于把全部样本拼成一个大 batch 求梯度的期望。",
  "walkthrough": "8 卡各吃 1/8 数据，反向得到 8 份梯度，all-reduce 求和除以 8 得平均梯度，各卡相同更新。",
  "edgeCases": [
    "参数量大时每卡优化器状态冗余，显存仍爆。",
    "卡数很多时 all-reduce 通信成为瓶颈。",
    "梯度异步(ASP)可能伤收敛，需调 lr。"
  ],
  "code": "# Python (概念)\ndef data_parallel_step(model, batch_shard, rank, world):\n    loss = model.forward_backward(batch_shard)   # 各卡独立算梯度\n    grad = all_reduce_avg(model.grads(), world)   # 梯度求平均\n    model.apply_grad(grad)                        # 各卡同步更新\n    return loss",
  "codeNotes": [
    "all_reduce_avg = all_reduce(SUM) / world。",
    "每卡必须保留完整模型副本。"
  ],
  "complexity": "显存每卡 = 完整模型；通信量 = 参数量×2(前向不传、仅梯度)。",
  "followUps": [
    {
      "question": "DP 和 ZeRO 什么关系？",
      "answer": "ZeRO 是 DP 的显存优化变体，把优化器状态/梯度/参数分片到各卡，消除冗余，从而扩展可训练模型规模，同时仍按数据并行逻辑更新。"
    },
    {
      "question": "DP 为什么显存不随卡数降？",
      "answer": "因为每卡都保留完整参数、梯度和优化器状态副本，复制 N 份，显存占用与单卡几乎相同，只靠增大 batch 提吞吐。"
    }
  ],
  "followUpAnswers": [
    "ZeRO 是 DP 的显存分片优化。",
    "DP 每卡存完整副本，显存不降。"
  ],
  "pitfalls": [
    "以为加卡能放下更大模型——DP 显存不扩展。",
    "忽视梯度 all-reduce 通信在大规模下的瓶颈。"
  ],
  "beginnerSummary": "老师给每个同学发一模一样的练习册(模型副本)，大家各自做不同的题目(数据分片)，做完后对一对答案、算出大家的平均解法(梯度平均)，再一起改正。这就是数据并行——人人都有完整册子，只是做的题不同。",
  "prerequisites": [
    "模型能放进单卡显存。",
    "梯度可在多卡间求平均。",
    "需要更大 batch 或更快吞吐。"
  ],
  "workedExample": [
    "8 卡各吃不同数据分片。",
    "梯度 all-reduce 平均后各卡同步更新。"
  ],
  "lineByLine": [
    "每卡复制完整模型。",
    "各卡处理不同数据分片。",
    "反向得到本地梯度。",
    "all-reduce 求平均并同步更新。"
  ],
  "diagram": "卡0:[模型副本]+数据0 ─┐\n卡1:[模型副本]+数据1 ─┼─ all-reduce(梯度) ─→ 同步参数\n...\n卡N:[模型副本]+数据N ─┘"
};
