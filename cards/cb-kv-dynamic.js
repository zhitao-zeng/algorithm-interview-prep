export default {
  "kind": "concept",
  "id": "cb-kv-dynamic",
  "category": "Continuous Batching",
  "difficulty": "Hard",
  "title": "in-flight 请求的 KV cache 动态分配",
  "prompt": "Continuous Batching 下，运行中(in-flight)请求的 KV cache 是如何动态分配的？",
  "quickAnswer": "关键是不再为整批预留固定长度 KV，而是按请求实际已生成的 token 数按需分配/扩展。常用分页管理（如 vLLM 的 PagedAttention）：把 KV 切成固定大小页(block)，每个请求持有一张页表动态追加页；请求完成释放其页回空闲池，新请求复用。这既避免预留浪费，也支持任意步插入。",
  "approach": "用分页(block)显存池 + 每请求页表，按需增长、完成即回收。",
  "explanationFocus": "是什么：KV cache 动态分配指以页/块为单位、按请求生成进度增量分配 KV 显存，并由页表映射，而非整批预分配整段。",
  "bruteForce": "静态批为每个请求预留 max_seq_len 的 KV，哪怕只生成几个 token 也占满。",
  "derivation": [
    "为什么需要：若预分配最大长度，长尾会撑爆显存、压低并发；连续批要支持任意步插入就必须能\"随用随分\"。",
    "怎么实现：维护全局 block 池；请求每生成满一个 block 的 token 就向页表追加一块；attention 按页表跨块读取历史 KV。",
    "有什么代价：跨块访存带来间接寻址开销，需专门 kernel；页表管理增加实现复杂度与少量碎片。",
    "怎么评测：对比显存峰值占用、可达并发数、以及因 KV 管理引入的 kernel 耗时占比。"
  ],
  "invariant": "已分配 KV 页总 token 容量 ≥ 所有 running 请求当前长度之和，无越界。",
  "walkthrough": "block=16 token；请求 A 已生成 40 token → 占用 3 页(48 容量)；再生成到 50 → 追加第 4 页。完成释放 4 页回池。",
  "edgeCases": [
    "block 碎片：空闲页散布，需回收整理或容忍。",
    "瞬时峰值：所有请求同时增长，block 池可能临时枯竭触发抢占。",
    "超长请求：占多页，但只按实际占用，不浪费预留。"
  ],
  "code": "# Python\nclass KVPool:\n    def alloc_block(self): return self.free.pop()      # 取空闲页\n    def free_blocks(self, page_table):                 # 回收\n        for b in page_table: self.free.add(b)",
  "codeNotes": [
    "block 为固定 token 数的 KV 单元。",
    "页表让逻辑连续、物理离散。"
  ],
  "complexity": "分配 O(1)/页；显存利用率近 100%，并发上限显著提高。",
  "followUps": [
    {
      "question": "分页 KV 会不会拖慢 attention？",
      "answer": "会引入间接寻址，但专用 kernel(PagedAttention)把随机访存批处理化，开销很小，换来高利用率是值得的。"
    },
    {
      "question": "动态分配和连续 batching 什么关系？",
      "answer": "前者是后者的显存基石：没有按需分配，就无法在任意步释放/插入请求。"
    }
  ],
  "followUpAnswers": [
    "专用 kernel 把开销压到很小。",
    "动态分配是连续批的显存基石。"
  ],
  "pitfalls": [
    "以为 KV 仍按 max_len 预留就支持连续批。",
    "忽视跨块访存需要专门 kernel 优化。"
  ],
  "beginnerSummary": "静态分配像每人预租一整年车位（不管开不开）；分页分配像按小时租，车在就续费一格，开走立刻退格给别人。显存就是车位，动态分配让它几乎零浪费。",
  "prerequisites": [
    "KV cache 随长度线性增长。",
    "显存总量有限。",
    "请求长度不可预知。"
  ],
  "workedExample": [
    "block=16，A 长 40 → 占 3 页。",
    "长到 50 → 第 4 页；完成释放 4 页。"
  ],
  "lineByLine": [
    "全局维护空闲 block 池。",
    "请求生成满一块即追加页。",
    "页表记录逻辑-物理映射。",
    "完成把页归还空闲池。"
  ],
  "diagram": "请求页表: [b0,b1,b2] → 物理离散块\n完成 → 块归还 free pool"
};
