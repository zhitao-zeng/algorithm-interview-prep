export default {
  "kind": "concept",
  "id": "pa-what",
  "category": "PagedAttention",
  "difficulty": "Easy",
  "title": "PagedAttention 是什么",
  "prompt": "PagedAttention 是什么？",
  "quickAnswer": "PagedAttention 受操作系统分页启发，把 KV Cache 切成固定大小的\"块(block)\"，用块表把逻辑位置映射到物理显存块，从而消除连续显存碎片、按需分配 KV，并支持块级共享（如前缀缓存）。它是 vLLM 高吞吐的核心。",
  "approach": "KV 分块 + 逻辑/物理块映射表，仿 OS 虚拟内存分页。",
  "explanationFocus": "是什么：PagedAttention 将 KV Cache 分页为定长 block，用 block table 做逻辑→物理映射，消除碎片并支持共享。",
  "bruteForce": "传统连续分配：为每个请求预留最大上下文的连续 KV 显存，内部碎片严重。",
  "derivation": [
    "为什么需要：不同请求/生成长度不同，连续预分配造成大量内部碎片，显存被浪费，并发受限。",
    "怎么实现：KV 按 block 存储，每个请求维护 block table 记录逻辑块→物理块；注意力计算时按表取物理块拼接。",
    "有什么代价：需维护 block table 与分配器，注意力 kernel 要支持非连续分块读取；block 过小有元数据开销、过大有碎片。",
    "怎么评测：对比连续分配，看显存利用率、可支撑最大并发与吞吐提升。"
  ],
  "invariant": "逻辑上请求看到连续 KV 序列，物理上由若干不连续 block 拼成，映射由 block table 决定。",
  "walkthrough": "block=16 token：请求生成 50 token 占 4 个 block（16+16+16+2），无需预留 128；另一请求可复用剩余物理块。",
  "edgeCases": [
    "请求长度跨 block 边界：最后一个 block 不满，仅少量浪费。",
    "前缀共享：多个请求共享同一物理前缀 block（引用计数）。",
    "block size 选择：太小元数据多，太大碎片回弹。"
  ],
  "code": "# Python\ndef paged_attention(q, block_table, physical_kv, block_size):\n    # block_table: 逻辑块 -> 物理块索引\n    ks = [physical_kv[block_table[b]] for b in range(len(block_table))]\n    K = cat(ks)                      # 按逻辑顺序拼回\n    return softmax(q @ K.T) @ V_from(ks)",
  "codeNotes": [
    "注意力 kernel 内部按 block 读取物理 KV。",
    "block table 类似 OS 页表。"
  ],
  "complexity": "显存利用率近 100%（仅末块少量浪费）；注意力计算量不变。",
  "followUps": [
    {
      "question": "PagedAttention 和操作系统分页哪里像？",
      "answer": "都用语义连续的\"逻辑地址\"映射到不连续的\"物理页/块\"，都靠一张表管理映射，从而消除外部碎片并支持共享页。"
    },
    {
      "question": "它怎么支持前缀共享？",
      "answer": "多个请求的逻辑块可映射到同一物理块并加引用计数，系统提示等公共前缀只存一份 KV。"
    }
  ],
  "followUpAnswers": [
    "引用计数管理共享块生命周期。",
    "块表类比页表。"
  ],
  "pitfalls": [
    "以为 PagedAttention 改变了注意力数学——它只改 KV 的内存布局。",
    "忽视 block size 对碎片与元数据开销的权衡。"
  ],
  "beginnerSummary": "计算机用\"分页\"把程序的逻辑内存映射到不连续的物理内存，避免找一大块连续空间。KV Cache 也面临同样问题：给每个对话预留最长上下文的连续显存太浪费。PagedAttention 把 KV 切成固定小页，用一张\"页表\"记录哪页在哪，谁要用哪段就拼起来——桌子（显存）利用率接近满分。",
  "prerequisites": [
    "KV Cache 常驻显存且随长度增长。",
    "连续预分配会留大量内部碎片。",
    "OS 分页用页表做逻辑→物理映射。"
  ],
  "workedExample": [
    "block=16：50 token 占 4 block（末块仅 2 有效），无需预留 128。",
    "并发下空闲物理块被新请求复用，显存利用率近 100%。"
  ],
  "lineByLine": [
    "KV 切成定长 block。",
    "每请求维护 block table。",
    "注意力按表取物理块拼回逻辑序。",
    "释放时回收物理块供复用/共享。"
  ],
  "diagram": "逻辑KV: [b0 b1 b2 b3]\nblock表: b0→P5, b1→P2, b2→P9, b3→P1\n物理显存: 不连续块, 按需分配\n→ 无连续预留, 碎片极小"
};
