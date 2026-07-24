export default {
  "kind": "concept",
  "id": "ctx-007",
  "category": "长上下文与位置编码",
  "difficulty": "Hard",
  "title": "长上下文训练的序列并行与上下文并行",
  "prompt": "训练超长序列时，序列并行 / 上下文并行如何切分注意力以突破单卡显存？",
  "quickAnswer": "上下文并行（CP）沿序列维把长序列切成段分到多卡，各卡算自己段的 Q 并与全量 K/V 交互（常以 Ring/All-to-All 实现因果注意力的块间通信）；序列并行（SP） further 把 LayerNorm/dropout 的序列维也切分以省激活显存，常与 TP 配合。",
  "approach": "把『长』这个维度从单卡拆到多卡：CP 解决注意力序列长度，SP 解决层内序列激活。",
  "explanationFocus": "是什么：序列并行（Sequence Parallelism, SP）与上下文并行（Context Parallelism, CP）是一类把序列长度维度拆分到多设备上的并行策略，用于训练/推理超出单卡显存与算力极限的超长序列，核心难点在因果自注意力需跨段交换 K/V。",
  "bruteForce": "单卡直接算全长注意力：显存 O(L·d) 激活 + O(L²) 注意力矩阵，L 到几十万时单卡 OOM；朴素重算也救不了注意力平方开销。",
  "derivation": [
    "为什么需要：长上下文训练 L 可达 32K–1M，单卡显存与注意力算力都不够，必须把序列维切分。",
    "怎么实现：CP 把序列分段，每段在一卡算 Q，通过 ring/All-to-All 与所有段的 K/V 做分块注意力（因果下需处理块间掩码与通信顺序）；SP（如 Megatron SP）把 LayerNorm、Dropout 等本来 TP 复制的序列维也切分，配合 TP 减少冗余激活。",
    "有什么代价：跨卡通信开销（K/V 传递、梯度同步）；因果注意力需仔细处理块边界掩码避免信息泄漏；实现复杂度高，需与 TP/PP/FlashAttention 协同。",
    "怎么评测：在固定模型下测『可训练最大 L』、吞吐量(tokens/sec/GPU)、显存峰值；对比 CP 度与通信占比，验证长文本任务指标不降。"
  ],
  "invariant": "CP/SP 的不变式：数学结果须等价于单卡全序列计算（仅通信与切分方式不同），因果掩码边界不能泄漏未来信息。",
  "walkthrough": "例：L=32K 用 8 卡 CP，每卡持 4K 序列算 Q，通过 8 步 ring 与各卡 K/V 分块做注意力，总激活显存降约 8×。",
  "edgeCases": [
    "因果注意力块边界必须正确加掩码，否则后段『看到』前段未来 token。",
    "CP 度不是越大越好，通信成为瓶颈时需与 TP/PP 平衡。",
    "Ring 注意力需处理首尾块，避免死锁或重复计算。"
  ],
  "code": "def context_parallel_attn(q_shard, kv_all, cp_rank, cp_size):\n    # q_shard: 本卡 Q [L/cp_size, d]; kv_all: 各卡 K/V 列表\n    out = []\n    for step in range(cp_size):\n        k, v = kv_all[(cp_rank + step) % cp_size]\n        # 因果掩码: 仅允许 attend 到不晚于当前块的 key\n        scores = q_shard @ k.T / math.sqrt(d)\n        scores = causal_mask(scores, cp_rank, step)\n        out.append(softmax(scores) @ v)\n    return sum(out)  # 跨步累加(示意)",
  "codeNotes": [
    "真实实现用 Ring/All-to-All + FlashAttention 分块，避免物化全 L²。",
    "causal_mask 必须按 (cp_rank, step) 判断当前块能看哪些 key，防泄漏。"
  ],
  "complexity": "算力随卡数近似线性加速；通信 O(L·d·cp_size) 量级，瓶颈在 K/V 跨卡传递与边界同步。",
  "followUps": [
    {
      "question": "CP 和 SP 到底区别在哪？",
      "answer": "CP 主要切分注意力的序列长度维并跨卡交换 K/V；SP 进一步把 LayerNorm/Dropout 等层内序列维也切分以省激活，通常叠在 TP 之上。"
    },
    {
      "question": "为什么不能直接用数据并行训长序列？",
      "answer": "数据并行每张卡仍要持完整序列，L 超显存照样 OOM；CP/SP 才是把『序列长度』本身拆开。"
    }
  ],
  "followUpAnswers": [
    "CP 主要切分注意力的序列长度维并跨卡交换 K/V；SP 进一步把 LayerNorm/Dropout 等层内序列维也切分以省激活，通常叠在 TP 之上。",
    "数据并行每张卡仍要持完整序列，L 超显存照样 OOM；CP/SP 才是把『序列长度』本身拆开。"
  ],
  "pitfalls": [
    "实现因果注意力时块边界掩码错误，导致未来信息泄漏。",
    "盲目加大 CP 度使通信压过计算收益。"
  ],
  "beginnerSummary": "长文章太长，一张显卡放不下。上下文并行就是把文章切成几段分给几张卡，每段算自己的『提问』，再互相问问别的段里有什么，最后拼起来——前提是绝不能让前面的段偷看后面的内容。",
  "prerequisites": [
    "Transformer 注意力与因果掩码",
    "模型并行（TP/PP/DP）基础"
  ],
  "workedExample": [
    "L=32K, 8 卡 CP，每卡 4K 序列。",
    "每卡用 ring 与各卡 K/V 分块做注意力，因果掩码防泄漏，显存约降 8×。"
  ],
  "lineByLine": [
    "q_shard：本卡持有的 Q 分片。",
    "for step：沿 ring 依次与各卡 K/V 做分块注意力。",
    "causal_mask + sum：保证因果且累加各步结果，等价于全序列注意力。"
  ],
  "diagram": "卡0[blk0]──┐\n卡1[blk1]──┼─ Ring 交换 K/V ─> 每块看允许的历史\n卡2[blk2]──┤\n卡3[blk3]──┘  因果掩码防泄漏未来"
};
