export default {
  "kind": "concept",
  "id": "kv-prefix-cache",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "Prefix Cache",
  "prompt": "Prefix Cache 是什么？",
  "quickAnswer": "Prefix Cache（前缀缓存）把“相同前缀 prompt”的 KV Cache 缓存下来，后续请求若共享该前缀（如相同的系统提示、Few-shot 示例、长文档），直接复用已算好的 KV，跳过这部分 Prefill。它跨请求复用计算，显著降低 TTFT 与重复算力，是 Continuous Batching 系统（如 vLLM）的常见优化。",
  "approach": "按前缀复用 KV，跳过重复 Prefill。",
  "explanationFocus": "是什么：Prefix Cache 把公共前缀（系统提示等）的 KV 缓存并跨请求复用，省去重复 Prefill。",
  "bruteForce": "每请求都重算相同的系统提示 → 浪费算力、抬高 TTFT。",
  "derivation": [
    "为什么需要：大量请求共享同一段前缀（system prompt），重复算浪费。",
    "怎么实现：以前缀 token 序列为 key 缓存其 KV；新请求命中则直接拼接，从非共享处开始算。",
    "有什么代价：需管理缓存生命周期与失效；prefix 部分要完全相同才能命中。",
    "怎么评测：看前缀命中率、TTFT 降幅、Prefill FLOPs 节省。"
  ],
  "invariant": "相同前缀的 KV 只算一次，被所有命中请求共享。",
  "walkthrough": "100 个请求都用同一 500-token 系统提示：首次算并缓存，其余 99 个直接复用，省下 99 次 500-token Prefill。",
  "edgeCases": [
    "前缀必须 token 级完全相同才命中。",
    "长文档问答：文档作前缀，多问题共享。",
    "PagedAttention 用逻辑/物理块映射支持前缀共享。"
  ],
  "code": "# Python\nprefix_cache = {}\ndef get_prefix_kv(prefix_ids):\n    key = tuple(prefix_ids)          # 前缀token序列作key\n    return prefix_cache.get(key)      # 命中则复用KV, 否则None",
  "codeNotes": [
    "vLLM 的 Prefix Caching 基于块哈希自动命中。",
    "与 PagedAttention 的分块 KV 天然契合。"
  ],
  "complexity": "命中时该前缀 Prefill 复杂度降为 O(0)；缓存查找 O(prefix_len) 哈希。",
  "followUps": [
    {
      "question": "Prefix Cache 和 KV Cache 什么关系？",
      "answer": "KV Cache 是单请求内复用历史 K/V；Prefix Cache 是跨请求复用“相同前缀”的 KV，是 KV Cache 思想在请求间的扩展。"
    },
    {
      "question": "什么场景收益最大？",
      "answer": "所有请求带相同系统提示、长文档多轮问答、Few-shot 模板——前缀越长、共享请求越多，收益越大。"
    }
  ],
  "followUpAnswers": [
    "系统提示统一化以提升命中率。",
    "长文档作共享前缀。"
  ],
  "pitfalls": [
    "前缀不完全一致导致不命中。",
    "忽略缓存失效管理。"
  ],
  "beginnerSummary": "公司每周例会都用同一份开场白。与其每人每次重读开场白，不如把开场白的笔记贴在墙上，大家直接复用。Prefix Cache 就是这面“公共笔记墙”：相同开头（系统提示/长文档）只算一次，后面所有请求直接抄，省时省力、首响更快。",
  "prerequisites": [
    "多请求共享相同前缀。",
    "前缀 KV 可复用。",
    "需按前缀索引缓存。"
  ],
  "workedExample": [
    "100 请求共享 500-token 系统提示：省 99 次重复 Prefill。",
    "命中后 TTFT 大幅下降。"
  ],
  "lineByLine": [
    "以前缀 token 序列为 key 缓存 KV。",
    "新请求命中则复用。",
    "从非共享处开始计算。",
    "省去重复 Prefill。"
  ],
  "diagram": "请求A: [SYS]... → 算KV并缓存\n请求B: [SYS]... → 命中, 复用KV, 跳过Prefill\n请求C: [SYS]... → 命中, 复用\n(SAME prefix → 只算一次)"
};
