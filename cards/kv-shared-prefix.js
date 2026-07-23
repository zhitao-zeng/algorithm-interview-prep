export default {
  "kind": "concept",
  "id": "kv-shared-prefix",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "多请求共享 System Prompt 的 KV 复用",
  "prompt": "多个请求有相同 System Prompt 时如何复用计算？",
  "quickAnswer": "把相同的 System Prompt 当作共享前缀，用 Prefix Cache 缓存其 KV：第一个请求算完并缓存该前缀的 KV，后续请求直接复用，不再对这一段做 Prefill。实现上通常用前缀（块）哈希命中、配合 PagedAttention 的分块 KV 让多个请求的物理块指向同一份前缀 KV，从而省算力、降 TTFT。",
  "approach": "相同 system prompt = 共享前缀 → Prefix Cache + 分块共享 KV。",
  "explanationFocus": "是什么：多个请求复用同一 system prompt 的 KV，通过前缀哈希命中 + 分页 KV 块共享实现跨请求免重算。",
  "bruteForce": "每个请求都重算 system prompt → 算力浪费、TTFT 升高。",
  "derivation": [
    "为什么需要：生产中 system prompt 常很长且高度一致，重复 Prefill 代价大。",
    "怎么实现：对 prompt 前缀做块哈希，命中则映射物理 KV 块到共享前缀；新请求只算差异部分。",
    "有什么代价：需保证前缀完全一致；引用计数管理共享块生命周期，防止误回收。",
    "怎么评测：测前缀命中率、首请求外其余请求的 TTFT 与 Prefill FLOPs 节省。"
  ],
  "invariant": "共享前缀的 KV 物理上只存一份，被多个逻辑请求引用。",
  "walkthrough": "system prompt 512 token、100 并发：首次算 512-token 前缀 KV 并共享，其余 99 请求 Prefill 从 512 处开始，省下近全部前缀算力。",
  "edgeCases": [
    "前缀稍有不同（如时间戳）即不命中 → 需规范化 prompt。",
    "共享块引用计数归零才回收。",
    "多轮对话历史也可作为可复用前缀。"
  ],
  "code": "# Python\ndef lookup_shared_prefix(prefix_ids, cache):\n    h = hash(tuple(prefix_ids))        # 块/前缀哈希\n    return cache.get(h)\n\ndef attach_shared(shared_kv, own_kv):\n    return shared_kv + own_kv          # 复用前缀, 拼接自有部分",
  "codeNotes": [
    "vLLM 自动按块哈希做 prefix caching。",
    "共享前缀块需引用计数管理。"
  ],
  "complexity": "命中请求前缀 Prefill 复杂度≈0；哈希查找 O(prefix) 可忽略。",
  "followUps": [
    {
      "question": "和 Continuous Batching 怎么配合？",
      "answer": "Continuous Batching 在调度层把命中共享前缀的请求并入 batch，它们跳过前缀 Prefill 直接进 Decode/后续计算，进一步提升吞吐。"
    },
    {
      "question": "前缀不完全一样怎么办？",
      "answer": "尽量规范化（把易变内容如时间放到尾部），或拆成“固定前缀+可变部分”，只缓存固定前缀以保命中率。"
    }
  ],
  "followUpAnswers": [
    "把易变内容放 prompt 尾部。",
    "用块级哈希提升局部命中。"
  ],
  "pitfalls": [
    "system prompt 含变量导致不命中。",
    "共享块回收不当引发错误。"
  ],
  "beginnerSummary": "同一个开场白被 100 个人用，没必要 100 个人各算一遍笔记。把开场白笔记固定在“公共区”，100 人直接引用同一份，只在自己特有的部分另记。既省了 99 份重复劳动，大家也能更快开口——这正是共享 system prompt 的 KV 复用。",
  "prerequisites": [
    "system prompt 多请求相同。",
    "前缀 KV 可跨请求共享。",
    "需哈希命中与引用管理。"
  ],
  "workedExample": [
    "512-token 系统提示 ×100 并发：仅首请求算前缀，其余复用。",
    "其余请求 TTFT 接近“无前缀”成本。"
  ],
  "lineByLine": [
    "system prompt 作共享前缀。",
    "块哈希命中 → 复用 KV。",
    "多个请求引用同一物理块。",
    "差异部分单独计算。"
  ],
  "diagram": "SYS(512tok)\n  ├─ 请求1: 算KV, 缓存(引用1)\n  ├─ 请求2: 命中, 引用2, 跳过Prefill\n  └─ 请求3: 命中, 引用3, 跳过Prefill\n物理KV只存一份, 逻辑多引用"
};
