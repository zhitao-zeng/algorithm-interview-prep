export default {
  "kind": "concept",
  "id": "pa-block-table",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "block table 的结构与作用",
  "prompt": "block table 的结构是什么，起什么作用？",
  "quickAnswer": "block table 是每个请求维护的一张\"逻辑块号 → 物理块号\"数组：下标是请求视角的连续逻辑块，值是对应的物理块索引。它让注意力计算能按逻辑顺序把离散的物理 block 拼回连续 KV，同时物理块上的引用计数决定何时回收。它是 PagedAttention 连接\"逻辑连续\"与\"物理离散\"的枢纽。",
  "approach": "每请求一张数组映射表 + 物理块上的引用计数。",
  "explanationFocus": "是什么：block table 是每个请求的逻辑块→物理块映射数组，是逻辑/物理解耦的核心数据结构。",
  "bruteForce": "直接用物理地址连续存储，无映射层。",
  "derivation": [
    "为什么需要：要同时保持\"请求看到连续 KV\"和\"物理离散存储\"两套视图。",
    "怎么实现：请求持有 block_table[i]=物理块号；物理块结构带 ref_count。",
    "有什么代价：每次取 KV 多一次查表；表本身占少量显存。",
    "怎么评测：看查表开销占比与映射正确性（单测拼接结果）。"
  ],
  "invariant": "对任意逻辑位置 pos，物理位置 = block_table[pos//bs] * bs + pos%bs。",
  "walkthrough": "block_table=[5,2,9]，bs=16：逻辑位置 20 在逻辑块1→物理块2，偏移 4，即物理块2的第4槽。",
  "edgeCases": [
    "多个请求 block table 指向同一物理块（共享/前缀）。",
    "引用计数随 fork/释放增减。",
    "表越界：逻辑块号 >= len(block_table) 表示尚未分配。"
  ],
  "code": "# Python\ndef read_kv(block_table, physical_kv, block_size, pos):\n    logical_block = pos // block_size\n    offset = pos % block_size\n    phys = block_table[logical_block]     # 逻辑块 -> 物理块\n    return physical_kv[phys][offset]      # 取该块内对应槽",
  "codeNotes": [
    "block table 是\"每请求\"的，不是全局的。",
    "物理块额外存 ref_count。"
  ],
  "complexity": "单点读取 O(1) 查表；整段拼接 O(序列长度)。",
  "followUps": [
    {
      "question": "block table 存在哪、谁来维护？",
      "answer": "通常存在 GPU 显存（或 pinned 内存）供 kernel 读取，由 BlockSpaceManager 在 append/free/fork 时统一维护。"
    },
    {
      "question": "引用计数为什么放在物理块而不是块表？",
      "answer": "因为同一物理块可能被多个请求的 block table 引用，计数必须挂在物理块上才能正确判断\"是否还有人用\"。"
    }
  ],
  "followUpAnswers": [
    "块表随请求创建/销毁。",
    "引用计数挂在物理块。"
  ],
  "pitfalls": [
    "把 block table 当成全局表——其实每请求一张。",
    "忘记引用计数导致共享块被提前回收。"
  ],
  "beginnerSummary": "block table 就像你笔记本的目录页：目录上写着\"第1章在蓝色册、第2章在绿色册、第3章在黄色册\"。册子（物理块）在书架上散着放，但目录让你按顺序翻。别人也能在同一本册子上做记号（共享），只有谁都不用了，那本册子才被收回归还。",
  "prerequisites": [
    "请求需要连续逻辑视图。",
    "物理块可离散、可共享。",
    "需记录每块被引用次数。"
  ],
  "workedExample": [
    "table=[5,2,9], bs=16：逻辑位20→块1→物理块2偏移4。",
    "两请求 table 都含物理块2 → 其 ref=2。"
  ],
  "lineByLine": [
    "每请求持有一张映射数组。",
    "下标=逻辑块号, 值=物理块号。",
    "读取按表定位物理块与偏移。",
    "物理块带引用计数管理生命周期。"
  ],
  "diagram": "请求A block_table\n  [0] -> P5\n  [1] -> P2\n  [2] -> P9\n逻辑pos20: 块1(P2) 偏移4\n物理块P2.ref = 2 (被A和B共享)"
};
