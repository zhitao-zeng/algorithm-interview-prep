export default {
  "kind": "concept",
  "id": "kv-why",
  "category": "KV Cache",
  "difficulty": "Easy",
  "title": "为什么需要 KV Cache",
  "prompt": "为什么需要 KV Cache？",
  "quickAnswer": "自回归生成时，历史 token 的 Key/Value 在后续每一步都不变。若每次都重算，计算量随已生成长度平方增长；缓存后每步只需算当前 token 的 QKV 并与历史 KV 做注意力，把每步复杂度从 O(n²) 降到 O(n)，是 Decode 能实时进行的前提。",
  "approach": "复用不变的历史 K/V，省去重复计算。",
  "explanationFocus": "是什么：因历史 K/V 不变，缓存可把每步注意力从“重算全历史”降为“查缓存”，是实时 Decode 的前提。",
  "bruteForce": "无缓存 → 每生成一个 token 都对全部历史重算注意力，不可接受。",
  "derivation": [
    "为什么需要：自回归每步只看新 token，但注意力要覆盖全部历史。",
    "怎么实现：首次 Prefill 算出并缓存全部历史 K/V；后续每步只算新 token 的 K/V 并 append。",
    "有什么代价：换取算力节省的代价是显存（KV 常驻）。",
    "怎么评测：对比有无缓存的每步 FLOPs 与端到端延迟；看 KV 显存占比。"
  ],
  "invariant": "有缓存时，生成第 n 个 token 的注意力计算量 O(n)，无缓存时 O(n²)。",
  "walkthrough": "无缓存生成 100 token：第 k 步重算前 k 个 token 的 K/V，总计 ~Σk²；有缓存：每步仅算 1 个新 token 的 K/V。",
  "edgeCases": [
    "极长生成：省下的计算量极其可观。",
    "显存不足时缓存本身成瓶颈（需用 PagedAttention/量化）。",
    "Prefix Cache 进一步复用跨请求的公共前缀。"
  ],
  "code": "# Python\ndef flops_no_cache(n):\n    return sum(k*k for k in range(1, n+1))   # 每步 O(k^2), 总计 ~n^3/3\n\ndef flops_with_cache(n):\n    return n * (n + 1) // 2                  # 每步 O(k): Σ_{k=1..n} k ≈ n^2/2",
  "codeNotes": [
    "无缓存是 O(n³) 总计算（每步再乘 d），有缓存降到 O(n²)。",
    "这是注意力部分；线性层每步也要读权重，与缓存正交。"
  ],
  "complexity": "无缓存总计算 O(n³)（含维度），有缓存 O(n²)；显存换算力。",
  "followUps": [
    {
      "question": "KV Cache 只省注意力吗？",
      "answer": "主要省注意力的重复 K/V 计算；但线性层每步仍要读全量权重（那是 Decode 带宽瓶颈的来源，与 KV 缓存是正交的两件事）。"
    },
    {
      "question": "能不能完全不存 KV？",
      "answer": "不能又不重算。线性注意力/稀疏注意力等架构尝试降低 KV 依赖，但标准 Transformer 必靠 KV Cache 才能高效自回归。"
    }
  ],
  "followUpAnswers": [
    "用 GQA 减小 KV 体积。",
    "用 PagedAttention 省显存碎片。"
  ],
  "pitfalls": [
    "以为缓存只省一点，其实省的是 O(n²)→O(n)。",
    "忽视“省算力”换来“占显存”的权衡。"
  ],
  "beginnerSummary": "想象写长作文，每写一句都要把前面整篇重读一遍才能接下一句——太慢。KV Cache 相当于你边写边在页边做笔记，后面直接看笔记续写，速度是线性增长而非越写越慢。代价是笔记要占地方（显存）。",
  "prerequisites": [
    "历史 token 的 K/V 在生成中不变。",
    "无缓存会重复计算。",
    "显存换算力是常见权衡。"
  ],
  "workedExample": [
    "生成 100 token：无缓存 ≈ Σk² ≈ 338k 单位；有缓存 ≈ 100×100=10k。",
    "差距随长度急剧扩大。"
  ],
  "lineByLine": [
    "历史 K/V 不变 → 可缓存。",
    "Prefill 一次算全历史 K/V 并缓存。",
    "每 Decode 步只算新 token 的 K/V。",
    "新 K/V 复用历史，复杂度 O(n) 每步。"
  ],
  "diagram": "无缓存: 步k 重算前k个K/V → 总 ~O(n^3)\n有缓存: 步k 只算1个新K/V → 总 ~O(n^2)\n代价: KV 常驻显存"
};
