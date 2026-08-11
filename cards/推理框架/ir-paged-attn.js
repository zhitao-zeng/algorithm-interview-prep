export default {
  "id": "ir-paged-attn",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "PagedAttention 显存分页",
  "prompt": "PagedAttention 如何像操作系统虚拟内存一样对 KV Cache 做分页管理来减少显存碎片化？",
  "quickAnswer": "把每条序列的 KV Cache 切成固定大小的逻辑块（page），用块表把逻辑块映射到任意物理块，使 KV 不必连续存放，从而消除预留式分配带来的内部碎片与跨序列外部碎片。",
  "approach": "维护 (seq -> 逻辑块列表 -> 物理块号) 的映射；预填充按块写入，解码每次追加一个 token 到当前块，块满再分配新物理块；attention 时按块表 gather 物理 KV 后计算。",
  "explanationFocus": "是什么：PagedAttention 将 KV Cache 按固定大小的块（block/page）分配，并维护逻辑块到物理块的映射表，像 OS 虚拟内存一样让序列的 KV 不必连续存储，从而消除预留式显存浪费与内部/外部碎片。",
  "bruteForce": "朴素做法：为每条序列按最大长度（如 2048）在连续显存上预留整段 KV，未用部分永久闲置形成内部碎片。",
  "invariant": "不变式：任一时刻逻辑块号到物理块号的映射全局一致，且已占用物理块总数等于所有序列已分配逻辑块数之和。",
  "walkthrough": "执行追踪：预填充生成前缀块并分配物理块；逐 token 解码时写入当前块，块满触发新物理块分配；attention 按块表 gather 物理 KV 计算分数。",
  "complexity": "说明：显存碎片趋近于零，块表开销 O(序列数×块数)，gather/lookup 为常数开销；吞吐相较预留式显著提升，代价是间接访存与块表维护。",
  "beginnerSummary": "KV Cache 占显存巨大。预留整段会浪费。PagedAttention 像给内存分页一样把 KV 切块、用表映射，空闲块可复用，省显存又提速。",
  "diagram": "seq A: [L0][L1][L2]\n         |   |   |\n        P3  P1  P7\nseq B: [L0][L1]\n         |   |\n        P2  P5\nfree physical blocks: P0 P4 P6",
  "code": "def paged_attention(q, block_table, kv_blocks, block_size=16):\n    # block_table: 逻辑块 -> 物理块\n    ks = [kv_blocks[block_table[i]] for i in range(len(block_table))]\n    k = concat(ks, axis=0)\n    return softmax(q @ k.T / sqrt(d)) @ v",
  "derivation": [
    "为什么需要：自回归解码必须为每个历史 token 保存 KV，连续预留导致大量内部碎片，且不同序列长度差异大，显存利用率低、并发受限。",
    "怎么实现：将 KV 按 block_size 分页，逻辑块号经块表映射到任意物理块；分配器维护空闲物理块池，按需分配/回收，同一提示前缀可被多序列共享引用。",
    "有什么代价：引入块表 lookup 与 gather 的间接访存开销，块边界处需拼接；实现与调度复杂度上升，需要精确的引用计数回收。",
    "怎么评测：对比预留式在相同并发下的显存占用、有效 batch 吞吐量（token/s）与尾延迟；观察碎片化率与最大并发序列数提升。"
  ],
  "edgeCases": [
    "序列长度不是 block_size 整数倍时，末块存在部分填充需正确边界处理。",
    "一条物理块被多个序列共享时，不能在某序列结束时就释放，需引用计数。",
    "抢占/驱逐场景下块表需支持换出与换回，保证映射不丢失。",
    "极短序列（小于一个块）仍占一个物理块，小块数目多时元数据膨胀。"
  ],
  "pitfalls": [
    "把块表当成连续偏移处理，导致 gather 错位、注意力观感越界。",
    "回收时仅看序列结束而忽略共享引用，误删其他序列仍在用的 KV。"
  ],
  "prerequisites": [
    "Transformer 自回归解码与 KV Cache 的基本原理",
    "操作系统虚拟内存分页与页表映射概念"
  ],
  "workedExample": [
    "序列 A 长 40、block_size=16：分配逻辑块 L0/L1/L2 映射到物理 P3/P1/P7，最后一个块仅用 8 个槽。",
    "序列 B 复用 A 的前 16 token 前缀：可直接共享 L0 对应物理块 P3，无需重复存储。"
  ],
  "lineByLine": [
    "block_table[i] 给出第 i 个逻辑块的物理块号，解耦逻辑与物理布局。",
    "ks 按逻辑顺序 gather 各物理块的 KV，恢复连续语义供注意力计算。",
    "concat 后在块边界无缝拼接，注意力分数计算与连续存储结果一致。"
  ],
  "codeNotes": [
    "真实实现中 kv_blocks 为 [num_physical_blocks, block_size, n_heads, head_dim] 的张量，gather 走 GPU kernel。"
  ],
  "followUps": [
    {
      "question": "PagedAttention 与 KV Cache 共享前缀（prefix caching）如何结合？",
      "answer": "逻辑块可指向同一物理块并以引用计数共享，相同系统提示的多个请求只存一份前缀 KV，进一步省显存。"
    },
    {
      "question": "块表映射会带来哪些性能损耗？",
      "answer": "主要是间接访存与 gather 拼接开销，可通过合并 kernel、保持块内连续来摊薄，通常远小于显存节省带来的吞吐收益。"
    }
  ],
  "followUpAnswers": [
    "逻辑块可指向同一物理块并以引用计数共享，相同系统提示的多个请求只存一份前缀 KV，进一步省显存。",
    "主要是间接访存与 gather 拼接开销，可通过合并 kernel、保持块内连续来摊薄，通常远小于显存节省带来的吞吐收益。"
  ],
  "kind": "concept"
};
