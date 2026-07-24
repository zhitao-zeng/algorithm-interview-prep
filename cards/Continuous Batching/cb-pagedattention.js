export default {
  "kind": "concept",
  "id": "cb-pagedattention",
  "category": "Continuous Batching",
  "difficulty": "Hard",
  "title": "与 PagedAttention 的协同",
  "prompt": "Continuous Batching 和 PagedAttention 是什么协同关系？",
  "quickAnswer": "二者是\"调度\"与\"显存底座\"的关系：Continuous Batching 负责在 token 步动态换入换出请求，而 PagedAttention 以分页 block 管理 KV，使 KV 能按需分配、独立释放、跨请求复用。没有 PagedAttention 这类分页显存，连续批就做不到\"任意步释放 slot 并接新请求\"，所以常配套出现（如 vLLM）。",
  "approach": "把连续批当调度层，PagedAttention 当 KV 显存管理层，上下配合。",
  "explanationFocus": "是什么：协同指连续 batching 的细粒度调度依赖 PagedAttention 的分页 KV 管理来实现按需分配与释放，二者共同消除气泡与预留浪费。",
  "bruteForce": "连续批调度 + 整段预分配 KV：插入新请求时无法腾出连续大块，调度优势被显存卡死。",
  "derivation": [
    "为什么需要：连续批要求请求级独立生命周期，预分配整段 KV 难以在运行中释放零散空间，二者配合困难；但 Continuous Batching 是调度机制、PagedAttention 是 KV 内存管理机制，逻辑上不绑定——用预分配 slot、连续 KV buffer 或其他 block allocator 也能实现 iteration-level batching，只是显存利用率可能更差。",
    "怎么实现：PagedAttention 把 KV 切成 block，页表映射；连续批每步释放完成请求的 block、把空闲 block 给新请求，attention kernel 按页表跨块读取。",
    "有什么代价：跨块访问需专门 kernel 与额外元数据；二者耦合使系统实现更复杂。",
    "怎么评测：对比\"连续批+分页\"与\"连续批+预分配\"在并发上限与碎片率上的差距。"
  ],
  "invariant": "若无分页 KV，连续批无法真正按需释放；分页是连续批可落地的必要条件之一。",
  "walkthrough": "连续批释放请求 A 的 3 个 block → 空闲池 +3；新请求 B 取这 3 块起步，无需连续大块，PagedAttention 按页表拼出 B 的历史 KV。",
  "edgeCases": [
    "block 碎片导致无连续逻辑但物理够用：分页天然解决。",
    "page table 膨胀：超长请求页表长，需控制元数据。",
    "共享前缀(如 system prompt)：可跨请求共享 block 进一步省显存。"
  ],
  "code": "# Python\ndef attach_new_request(pool, page_table, need_blocks):\n    for _ in range(need_blocks):\n        page_table.append(pool.free.pop())  # 离散取块拼逻辑序列",
  "codeNotes": [
    "逻辑连续靠页表, 物理离散靠 block。",
    "两者解耦才支持任意步插入。"
  ],
  "complexity": "分页近乎零预留浪费；协同使并发上限与利用率同时提升。",
  "followUps": [
    {
      "question": "能不能没有 PagedAttention 也做连续批？",
      "answer": "理论上可用其他变长/分页方案，但必须能按需分配释放 KV；纯整段预分配做不到真正的逐请求释放。"
    },
    {
      "question": "共享前缀怎么帮连续批？",
      "answer": "system prompt 等公共前缀的 block 可被多请求只读共享，省显存、提并发，连续批下更明显。"
    }
  ],
  "followUpAnswers": [
    "需任意分页方案, 非必须 PagedAttention。",
    "公共前缀 block 可共享省显存。"
  ],
  "pitfalls": [
    "把 PagedAttention 当成连续批的替代品而非底座。",
    "以为有了连续批调度就自动省显存。"
  ],
  "beginnerSummary": "连续批是\"调度员\"，决定谁上谁下；PagedAttention 是\"停车场管理员\"，把车位切成小块、随用随分、开走即收。没有管理员，调度员再会排也找不到零散车位给新车。",
  "prerequisites": [
    "连续批需逐请求释放。",
    "KV 显存需按需管理。",
    "分页支持离散分配。"
  ],
  "workedExample": [
    "A 释放 3 block 回池。",
    "B 离散取 3 块，页表拼出历史 KV。"
  ],
  "lineByLine": [
    "连续批释放完成请求 block。",
    "block 回空闲池。",
    "新请求从池取离散 block。",
    "页表把离散块映射为逻辑序列。"
  ],
  "diagram": "连续批(调度) ──依赖──▶ PagedAttention(分页KV)\n释放 block ⇄ 取 block 闭环"
};
