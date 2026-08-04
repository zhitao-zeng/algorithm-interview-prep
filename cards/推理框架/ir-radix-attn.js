export default {
  "id": "ir-radix-attn",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "RadixAttention 前缀树复用",
  "prompt": "RadixAttention 如何用基数树（前缀树）在不同请求间复用相同提示前缀的 KV Cache？",
  "quickAnswer": "将已计算的 KV Cache 按 token 前缀组织成基数树节点，新请求到来时沿树最长匹配已有前缀，直接复用其 KV，仅对未命中后缀做计算。",
  "approach": "以 token 序列为路径构建 radix tree，节点缓存对应区间的 KV；调度时做前缀匹配，命中部分跳过 prefill，未命中部分增量计算并写回树。",
  "explanationFocus": "是什么：RadixAttention 是 vLLM/天数等框架采用的前缀复用机制，用基数树保存历史请求各前缀的 KV Cache，使共享相同系统提示或 few-shot 示例的后续请求能直接复用，避免重复 prefill。",
  "bruteForce": "朴素做法：每个请求独立做完整 prefill，哪怕与上个请求共享数千 token 的系统提示也重新计算并重新占用 KV 显存。",
  "invariant": "不变式：树上任一节点缓存的 KV 严格对应其路径上的 token 前缀，且引用计数等于正在依赖该前缀的活跃请求数。",
  "walkthrough": "执行追踪：新请求 token 流沿树逐节点匹配；最长公共前缀命中的节点 KV 直接可用；首个不匹配处分裂节点，对后缀做增量 prefill 并写入新节点。",
  "complexity": "说明：命中前缀越多，重复算力与 KV 显存越省；匹配为 O(前缀长度)，节点分裂 O(1)，代价是树维护与引用计数回收的复杂度。",
  "beginnerSummary": "很多请求共用同一段系统提示。RadixAttention 把提示前缀的 KV 存进树里，新请求命中就直接复用，不必重算，省时省显存。",
  "diagram": "root\n └─ \"You are a helpful assistant\\n\"\n      ├─ req1: \"Q1...\"  -> KV_A\n      └─ req2: \"Q2...\"  -> KV_B (前缀 KV 共享)",
  "code": "def match_prefix(radix_tree, tokens):\n    node = radix_tree.root\n    for t in tokens:\n        if t in node.children:\n            node = node.children[t]\n        else:\n            break\n    return node  # 从此节点起复用 KV",
  "derivation": [
    "为什么需要：生产流量中大量请求共享系统提示、工具描述或 few-shot 示例，逐请求重算前缀既浪费算力也浪费 KV 显存。",
    "怎么实现：用基数树按 token 前缀聚合 KV，节点记录起止区间与引用计数；新请求做最长前缀匹配，命中部分直接引用，未命中分裂节点并增量 prefill。",
    "有什么代价：树结构与引用计数带来额外元数据与回收逻辑；前缀不公共时收益有限；LRU 驱逐需保证活跃引用不被误删。",
    "怎么评测：在共享前缀的对话/批量评测集上对比 TTFT、prefill 算力与 KV 显存峰值，观察命中率随前缀长度的变化。"
  ],
  "edgeCases": [
    "前缀完全相同但后续 token 不同时，需正确分裂节点而非覆盖原 KV。",
    "引用计数归零的节点应在显存压力下按 LRU 驱逐。",
    "流式请求前缀边到边增长，需支持增量插入而非一次性建树。",
    "不同采样参数下同一前缀 KV 是否可复用（通常可，因 KV 与采样无关）。"
  ],
  "pitfalls": [
    "把整条请求当键而非按 token 前缀匹配，导致无法复用部分公共前缀。",
    "驱逐时忽略引用计数，误删仍被活跃请求依赖的前缀节点。"
  ],
  "prerequisites": [
    "PagedAttention 与 KV Cache 分页管理",
    "前缀树（trie/radix tree）与引用计数概念"
  ],
  "workedExample": [
    "100 条请求共用 512 token 系统提示：首条计算后入树，其余 99 条直接命中，省下约 99×512 token 的 prefill。",
    "请求 A 提示为 \"翻译：你好\"，请求 B 为 \"翻译：再见\"：共享 \"翻译：\" 前缀 KV，仅后缀不同部分增量计算。"
  ],
  "lineByLine": [
    "node 从根出发沿 tokens 逐 token 下探，路径即已缓存的公共前缀。",
    "t in node.children 判断是否还能继续匹配已有节点。",
    "返回的 node 是首个无法继续匹配的断点，其已缓存 KV 可直接复用。"
  ],
  "codeNotes": [
    "生产实现通常对节点做合并压缩（radix 压缩）以减少浅层节点数，并提高前缀匹配效率。"
  ],
  "followUps": [
    {
      "question": "RadixAttention 与 PagedAttention 的关系是什么？",
      "answer": "PagedAttention 解决单序列内 KV 分页，RadixAttention 在序列间用基数树复用公共前缀的页，二者互补，常同时启用。"
    },
    {
      "question": "前缀 KV 在不同采样温度下能否复用？",
      "answer": "可以。KV Cache 是注意力键值，与解码时的采样温度无关，因此相同前缀的 KV 可跨不同采样参数请求复用。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 解决单序列内 KV 分页，RadixAttention 在序列间用基数树复用公共前缀的页，二者互补，常同时启用。",
    "可以。KV Cache 是注意力键值，与解码时的采样温度无关，因此相同前缀的 KV 可跨不同采样参数请求复用。"
  ],
  "kind": "concept"
};
