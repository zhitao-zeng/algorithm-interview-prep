export default {
  "kind": "concept",
  "id": "pa-attention-adapt",
  "category": "PagedAttention",
  "difficulty": "Hard",
  "title": "注意力计算如何适配分块 KV",
  "prompt": "注意力计算如何适配分块、非连续的 KV？",
  "quickAnswer": "标准注意力假设 K/V 是连续张量，可直接矩阵乘。PagedAttention 的 K/V 散在多个物理 block，于是注意力 kernel 先按 block table 把各物理 block 的 K/V \"gather\"成逻辑连续序列再做点积；且可在 block 粒度上流式累加 softmax 的分母（在线归一化），避免一次性拼成大张量。核心是 kernel 内部按表寻址而非假设连续。",
  "approach": "kernel 内按 block table gather 物理块，并在块粒度上做在线 softmax。",
  "explanationFocus": "是什么：注意力 kernel 改为按 block table 逐块读取物理 KV（gather），以块为单位累加注意力分子与分母，从而支持非连续布局。",
  "bruteForce": "先把所有物理块拷贝拼成一个连续大张量再做注意力——额外显存与带宽。",
  "derivation": [
    "为什么需要：KV 不再连续，原注意力算子无法直接索引。",
    "怎么实现：kernel 接收 block_table 与物理块数组，循环每个逻辑块，取对应物理块 K/V 参与注意力并累积。",
    "有什么代价：kernel 更复杂，需处理末块有效长度与跨块归一化；但省去拼接的临时显存。",
    "怎么评测：对比\"先拼后算\"与\"分块直接算\"的数值一致性、显存与速度。"
  ],
  "invariant": "分块计算的结果 == 把所有物理块按逻辑序拼成连续 KV 后算出的注意力（数值等价）。",
  "walkthrough": "逻辑块 0,1,2 对应物理 P5,P2,P9：kernel 依次取 P5 的 K/V 算注意力并累加分母，再 P2、再 P9，在线 softmax 得与连续拼接相同结果。",
  "edgeCases": [
    "末块有效长度 < block_size：需 mask 掉无效槽。",
    "query 自身所在块：自注意力需正确包含。",
    "多查询头：GQA 下每块 K/V 被多 Q 头复用。"
  ],
  "code": "# Python\ndef paged_attention(q, block_table, phys_kv, block_size):\n    num = 0.0; den = 0.0\n    for lb in range(len(block_table)):\n        Kb, Vb = phys_kv[block_table[lb]]          # 按表取物理块\n        s = q @ Kb.T / sqrt(d)                     # 本块注意力分数\n        m = softmax(s); num += m @ Vb; den += m.sum()\n    return num / den                               # 在线归一化",
  "codeNotes": [
    "关键在于\"按 block_table 索引物理块\"。",
    "在线 softmax 避免拼成大张量。"
  ],
  "complexity": "计算量 O(n·d) 与传统相同；额外是 O(n/block_size) 次查表，可忽略。",
  "followUps": [
    {
      "question": "为什么不直接拼成一个连续张量再算？",
      "answer": "拼接要额外 O(n·d) 显存与一次全量拷贝带宽，且破坏了\"按需分配\"的意义；分块直接算零额外显存、带宽更省。"
    },
    {
      "question": "在线 softmax 怎么保证数值正确？",
      "answer": "用 running max 做数值稳定的在线归一化（类似 flash attention 的 incremental softmax），逐块累加分子与分母，结果与先拼后算一致。"
    }
  ],
  "followUpAnswers": [
    "gather 替代拼接省显存。",
    "running max 保证在线 softmax 稳定。"
  ],
  "pitfalls": [
    "以为分块会改变注意力数学结果——只是布局不同。",
    "忽略末块有效长度 mask，导致读到脏数据。"
  ],
  "beginnerSummary": "考试时答案散落在好几页草稿纸（物理块）上，但你按题目顺序（block table）一张张翻着看，边看边在脑中汇总——最后得出的结论，和先把所有草稿抄到一页长纸上看，结果完全一样。PagedAttention 的 kernel 就是那个\"按目录翻页、边翻边汇总\"的过程，省去了抄写的麻烦。",
  "prerequisites": [
    "注意力=Q 与 K/V 点积后加权 V。",
    "KV 被切成不连续物理块。",
    "softmax 可在线增量计算。"
  ],
  "workedExample": [
    "物理 P5,P2,P9 按逻辑序 gather，逐块累加 softmax。",
    "结果与拼成连续张量一致。"
  ],
  "lineByLine": [
    "kernel 接收 block_table 与物理块。",
    "逐逻辑块按表取物理 K/V。",
    "块内算分数并增量累加分子/分母。",
    "在线 softmax 得最终输出。"
  ],
  "diagram": "q × [P5的K | P2的K | P9的K]  (按表拼, 不真拷贝)\n  └─> 逐块算分数 -> 增量softmax -> 输出\n等价: q × 连续KV"
};
