export default {
  "id": "ir-prefix-cache",
  "category": "推理框架",
  "difficulty": "Medium",
  "title": "前缀缓存",
  "prompt": "推理框架中的前缀缓存（Prefix Caching）如何复用共享提示的 KV 来降低首 token 延迟与显存？",
  "quickAnswer": "前缀缓存把请求提示中可共享的前缀（如 system prompt、Few-shot 示例、对话历史）对应的 KV Cache 计算一次后存入缓存，后续命中相同前缀的请求直接复用，跳过重复的自注意力前段计算。它大幅降低首 token 时间（TTFT）并节省显存，在系统提示固定、多轮对话、Agent 批量调用等场景收益最大。需配合前缀哈希与淘汰策略管理缓存生命周期。",
  "approach": "把提示按\"可共享前缀 + 私有后缀\"切分，对前缀计算块做内容哈希寻址；命中则零重算直接拼接，未命中则补算并写回；用 LRU 等策略淘汰冷前缀。",
  "explanationFocus": "是什么：前缀缓存是一种 KV Cache 复用优化，将多个请求共有的提示前缀对应的键值缓存计算一次并保存，后续请求命中相同前缀时直接复用，从而避免对公共前缀的重复注意力计算。",
  "bruteForce": "朴素推理每个请求都从 system prompt 第 0 位重新算全部 KV，100 个请求共享同一 500-token 系统提示就重复计算 100×500 token 的注意力，纯属浪费。",
  "invariant": "核心不变量：相同 token 前缀必然产生相同 KV（在权重与位置编码固定下），因此可用前缀内容哈希唯一寻址并安全复用，缓存命中即结果一致。",
  "walkthrough": "设系统提示 500 token、隐藏维 4096、32 层、FP16，单次前缀 KV 约 0.25GB；100 并发请求朴素法重复算 25GB 等效算力，前缀缓存仅算 1 次，TTFT 从约 600ms 降到约 80ms，显存省近 100 倍前缀开销。",
  "code": "def get_kv(prompt, cache):\n    prefix, suffix = split_prefix(prompt)\n    key = hash(prefix)                       # 前缀内容寻址\n    if key in cache:\n        kv_pre = cache[key]                  # 命中直接复用\n    else:\n        kv_pre = compute_kv(prefix)\n        cache[key] = kv_pre                  # 未命中写回\n    kv_suf = compute_kv(suffix, past=kv_pre) # 仅算私有后缀\n    return kv_pre, kv_suf",
  "complexity": "命中时前缀计算 O(1)（查表），仅后缀 O(后缀长²)；未命中 O(前缀长²) 一次。缓存查找 O(1)，淘汰 O(命中数)。",
  "beginnerSummary": "像会议室白板上写好的公共公式，大家开会都直接拍照用，不用每人重新推导一遍，省时又省纸。",
  "diagram": "请求A: [公共前缀KV]→复用→[A后缀]\n请求B: [公共前缀KV]→复用→[B后缀]\n请求C: [公共前缀KV]→复用→[C后缀]\n        └─ 只算一次 ─┘",
  "derivation": [
    "为什么需要：大量请求共享相同提示前缀，重复计算既拖慢首 token 又浪费显存。",
    "怎么实现：对前缀做内容哈希寻址，命中复用 KV、未命中补算写回，后缀单独计算并拼接，配 LRU 淘汰。",
    "有什么代价：缓存占显存需上限管理；前缀仅差一 token 即哈希不同无法复用，需合理分块。",
    "怎么评测：对比命中率、TTFT 与显存占用，看重复前缀计算是否被消除。"
  ],
  "edgeCases": [
    "前缀差一个 token 哈希就不同，需按语义边界分块而非盲目整段。",
    "缓存无限增长，需 LRU/引用计数淘汰防 OOM。",
    "位置编码若含请求级偏置，前缀 KV 可能不能直接跨请求复用。"
  ],
  "pitfalls": [
    "把整个含私有信息的提示当前缀缓存，导致隐私串味。",
    "只缓存不淘汰，长尾前缀堆积撑爆显存。"
  ],
  "prerequisites": [
    "KV Cache 与自注意力计算",
    "哈希寻址与缓存淘汰（LRU）基础"
  ],
  "workedExample": [
    "100 个请求共用 500-token system 前缀，缓存命中后只首请求算前缀 KV，其余 99 个直接复用。",
    "多轮对话中历史轮次作前缀缓存，新轮只算本轮新问题后缀，TTFT 降约 7 倍。"
  ],
  "lineByLine": [
    "key = hash(prefix) 用前缀内容做唯一寻址，保证相同前缀命中同一缓存。",
    "if key in cache 命中则跳过昂贵的前缀自注意力计算。",
    "cache[key] = kv_pre 未命中时计算并写回，供后续请求复用。",
    "compute_kv(suffix, past=kv_pre) 仅对私有后缀计算并拼接前缀 KV。"
  ],
  "codeNotes": [
    "哈希需覆盖分词结果与位置偏移，避免不同请求误命中。"
  ],
  "followUps": [
    {
      "question": "前缀缓存和 PagedAttention/vLLM 什么关系？",
      "answer": "PagedAttention 提供 block 级 KV 管理基础设施，前缀缓存在其上用 block 哈希共享相同前缀的物理块（copy-on-write），二者互补。"
    },
    {
      "question": "什么场景前缀缓存收益最小？",
      "answer": "当每个请求提示都完全不同、几乎没有公共前缀时（如个性化长文档问答），命中率低，收益接近零甚至被管理开销抵消。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 提供 block 级 KV 管理基础设施，前缀缓存在其上用 block 哈希共享相同前缀的物理块（copy-on-write），二者互补。",
    "当每个请求提示都完全不同、几乎没有公共前缀时（如个性化长文档问答），命中率低，收益接近零甚至被管理开销抵消。"
  ],
  "kind": "concept"
};
