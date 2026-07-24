export default {
  "kind": "concept",
  "id": "pa-cow-prefix",
  "category": "PagedAttention",
  "difficulty": "Hard",
  "title": "copy-on-write 共享前缀（prefix sharing）",
  "prompt": "PagedAttention 如何用 copy-on-write 实现前缀共享？",
  "quickAnswer": "当多个序列共享同一前缀（如 system prompt、beam search 的候选、并行采样），它们的 block table 可指向同一批物理块并加引用计数，从而只存一份 KV。只有当某个序列要改写某个已被共享的块时，才真正拷贝一份出来（copy-on-write），避免影响其他共享者。这把\"相同前缀的 KV\"从 N 份压成 1 份。",
  "approach": "共享物理块+引用计数，写时才拷贝（COW）。",
  "explanationFocus": "是什么：多个序列的 block table 指向同一物理前缀块并计引用，改写时 copy-on-write 分裂出独立副本，实现前缀 KV 只存一份。",
  "bruteForce": "每个序列各存一份完整 KV，公共前缀重复占用显存。",
  "derivation": [
    "为什么需要：beam search、并行采样、相同 system prompt 都产生大量重复前缀 KV。",
    "怎么实现：fork 时复制 block table 并把各物理块 ref+1；写某块前若 ref>1 则拷贝新块、ref 调整。",
    "有什么代价：需维护引用计数与 COW 拷贝逻辑；前缀必须逐块完全一致才共享。",
    "怎么评测：看共享前缀命中率与 KV 显存节省倍数。"
  ],
  "invariant": "只要某物理块 ref>1，它就是只读共享；写入前必 COW，保证不串扰。",
  "walkthrough": "beam=4 共享 512-token 前缀：4 个序列 block table 都指向同一批前缀物理块（ref=4），仅存 1 份；当某 beam 第 513 token 改写首块时才拷贝出新块。",
  "edgeCases": [
    "前缀逐块一致才能共享（否则从该块起分叉）。",
    "引用归零才真正回收物理块。",
    "自动 prefix caching 用块哈希命中共享（vLLM）。"
  ],
  "code": "# Python\ndef fork_sequence(parent_table, phys_blocks):\n    child = list(parent_table)\n    for b in child:\n        phys_blocks[b].ref += 1        # 共享物理块, 引用+1\n    return child\n\ndef write_on_fork(block, phys_blocks):\n    if phys_blocks[block].ref > 1:     # 被共享, 写时拷贝\n        new = copy(phys_blocks[block])\n        phys_blocks[block].ref -= 1\n        return new                    # COW: 返回独立副本\n    return phys_blocks[block]",
  "codeNotes": [
    "fork 只复制\"指针\"(block table)，不复制 KV。",
    "引用计数是安全共享的关键。"
  ],
  "complexity": "fork O(前缀块数)；COW 仅在写冲突时发生，均摊极低成本。",
  "followUps": [
    {
      "question": "和普通 Prefix Cache 有什么区别？",
      "answer": "Prefix Cache 跨请求复用已算好的前缀 KV（省算力）；COW 更侧重序列 fork 时的内存共享与写时分裂，二者都依赖\"块级共享+引用计数\"，vLLM 把两者统一在分页 KV 上。"
    },
    {
      "question": "什么场景 COW 收益最大？",
      "answer": "beam search、并行采样、以及大量请求共享同一 system prompt 的场景——共享前缀越长、副本越多，省下的 KV 越可观。"
    }
  ],
  "followUpAnswers": [
    "beam/采样靠 COW 共享。",
    "均靠引用计数保安全。"
  ],
  "pitfalls": [
    "忘记引用计数，写共享块污染其他序列。",
    "以为 fork 会复制全部 KV（其实只复制表）。"
  ],
  "beginnerSummary": "四个人合写一份报告，开头都相同。与其各抄一份开头，不如四个人共用同一份开头稿（共享块），在稿子上标\"4 人引用\"。只有当某人要修改开头时，才给他另复印一份让他改，不影响另外三人。这样既省纸（显存），又不会互相改乱。",
  "prerequisites": [
    "多个序列共享相同前缀。",
    "物理块可被多表引用。",
    "需引用计数判断共享。"
  ],
  "workedExample": [
    "beam=4 共 512-token 前缀：KV 只存 1 份(ref=4)。",
    "某 beam 改写首块时 COW 分裂出新块。"
  ],
  "lineByLine": [
    "fork 复制 block table。",
    "各物理前缀块 ref+1。",
    "写入前若 ref>1 则 COW。",
    "引用归零才回收。"
  ],
  "diagram": "seqA: [P1 P2 P3] ref各+1\nseqB: [P1 P2 P3] 共享同一批\nseqC: [P1 P2 P3]\n写P3时: COW -> 新P3' 给C, 原P3 ref-1"
};
