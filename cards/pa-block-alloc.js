export default {
  "kind": "concept",
  "id": "pa-block-alloc",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "KV block 分配与逻辑/物理块映射",
  "prompt": "PagedAttention 中 KV block 如何分配，逻辑块如何映射到物理块？",
  "quickAnswer": "系统维护一个全局空闲物理块池。新 token 到来时，若当前逻辑块的槽位已满，就从空闲池取一个物理块、追加到该请求的 block table（即\"逻辑块号→物理块号\"）。这样逻辑上请求看到连续的块序列，物理上块可来自池中任意位置，释放时把引用为 1 的块归还空闲池。",
  "approach": "空闲块池 + 每请求 block table，写满再分配下一物理块。",
  "explanationFocus": "是什么：用全局空闲块池按需分配物理 block，并以 block table 记录每个逻辑块对应的物理块号。",
  "bruteForce": "预分配一整段连续物理块给每个请求。",
  "derivation": [
    "为什么需要：必须支持\"用到才分配\"才能消除预留浪费。",
    "怎么实现：维护 free_pool；append token 时若当前块满则 pop 一块挂到 block table。",
    "有什么代价：分配/释放/查表有少量开销，需保证并发安全。",
    "怎么评测：看分配器在高频 append/free 下的时延与空闲池命中率。"
  ],
  "invariant": "len(block_table) = ceil(当前 token 数 / block_size)；物理块要么在某请求的 block table 中，要么在空闲池。",
  "walkthrough": "block=16：写第 17 个 token 时当前块(块0)满，从池取物理块 P3 挂为逻辑块1；写第 33 个 token 再取 P7 挂为逻辑块2。",
  "edgeCases": [
    "空闲池耗尽：触发抢占/淘汰或拒绝新请求。",
    "块内未满：仅末块有空槽，可继续写。",
    "并发分配：需原子操作或锁保护空闲池。"
  ],
  "code": "# Python\ndef alloc_block(allocator, req, block_table):\n    phys = allocator.free_pop()          # 从空闲池取一个物理块\n    block_table.append(phys)             # 追加为下一个逻辑块\n    return block_table\n\ndef append_token(req, kv, allocator):\n    if req.block_full():\n        alloc_block(allocator, req, req.block_table)\n    req.write_current_block(kv)          # 写当前物理块的下一个槽",
  "codeNotes": [
    "空闲池是全局共享资源。",
    "只有在当前块写满时才申请新块。"
  ],
  "complexity": "每次分配 O(1)（池 pop）；总块数 = ceil(len/block_size)。",
  "followUps": [
    {
      "question": "空闲块池和 block table 谁持有物理块的所有权？",
      "answer": "物理块要么被某请求的 block table 引用（可能多个请求共享同一块），要么在全局空闲池；引用计数为 0 时回到空闲池。"
    },
    {
      "question": "为什么不在请求开始就分好所有块？",
      "answer": "因为不知道最终长度，提前分就是回到连续预分配的浪费；按需分才能只付实际长度的钱。"
    }
  ],
  "followUpAnswers": [
    "引用计数管理块归属。",
    "按需分配避免预留浪费。"
  ],
  "pitfalls": [
    "以为逻辑块号就是物理地址——必须查表转换。",
    "忽视空闲池并发安全。"
  ],
  "beginnerSummary": "图书馆有一排空书架（空闲块池）。你每写满一本笔记册（一个 block），就再去架子上取一本空册接着写，并在自己的目录（block table）上记\"第几册放在第几号书架\"。你只管册子的顺序，具体摆在哪排架子无所谓——空册子大家共用，谁用完谁还。",
  "prerequisites": [
    "有全局空闲物理块池。",
    "请求长度事先未知。",
    "需逻辑→物理的映射记录。"
  ],
  "workedExample": [
    "block=16：第17 token 触发取物理块 P3 挂逻辑块1。",
    "第33 token 再取 P7 挂逻辑块2。"
  ],
  "lineByLine": [
    "维护全局空闲块池。",
    "当前块写满才申请新块。",
    "新块号追加到 block table。",
    "释放时引用归零回池。"
  ],
  "diagram": "空闲池: [P3][P7][P9]...\n请求A block_table: [0]→P5, [1]→P3, [2]→P9\n写满块0 → pop P3 挂为块1"
};
