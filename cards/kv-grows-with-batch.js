export default {
  "kind": "concept",
  "id": "kv-grows-with-batch",
  "category": "KV Cache",
  "difficulty": "Easy",
  "title": "KV Cache 随 Batch 增长",
  "prompt": "Batch Size 增加为什么会增加 KV Cache？",
  "quickAnswer": "KV Cache 对每个并发请求是独立的一份：总 KV 显存 = 单请求 KV × Batch B。提升并发（更大 batch 或 Continuous Batching 的并发 slot）会直接乘大 KV 总量，因此并发上限常由“显存能放下多少份 KV”决定，而非算力。",
  "approach": "总 KV = 单请求 KV × 并发 B，B 增则 KV 线性增。",
  "explanationFocus": "是什么：每个请求独立维护自己的 KV Cache，总 KV 与并发数 B 成正比。",
  "bruteForce": "只按算力定最大 batch → 实际被 KV 显存先一步卡住。",
  "derivation": [
    "为什么需要：高并发是吞吐来源，但受 KV 显存约束。",
    "怎么实现：每个请求 slot 分配独立 KV 块（PagedAttention 分页管理）。",
    "有什么代价：B 翻倍 KV 翻倍，可能先于算力达到显存上限 → 触发排队/拒绝。",
    "怎么评测：扫并发测 KV 显存与 OOM 点，定最大并发。"
  ],
  "invariant": "总 KV(B) = B × 单请求 KV(L)；B 与 L 独立相乘。",
  "walkthrough": "单请求 L=4k KV=2GB，B=16 → 总 KV=32GB；B=64 → 128GB，远超权重。",
  "edgeCases": [
    "请求长短不一：Continuous Batching 按实际长度占用，更省。",
    "Prefix Cache：相同前缀的请求可共享部分 KV，等效降 B 的 KV 成本。",
    "峰值并发瞬时冲高 → 需限流/排队。"
  ],
  "code": "# Python\ndef total_kv(B, per_req_kv_bytes):\n    return B * per_req_kv_bytes   # 严格线性于并发",
  "codeNotes": [
    "Continuous Batching 让 slot 被高效填满，但物理 KV 仍随并发涨。",
    "Prefix Cache 是并发维度的“去重”。"
  ],
  "complexity": "O(B·L·N·hkv·dkv)；并发与序列是两大乘法因子。",
  "followUps": [
    {
      "question": "最大并发由什么定？",
      "answer": "约由 (显存 − 权重 − 激活) / 单请求 KV(L) 决定；所以同样显存，短请求能撑更高并发。"
    },
    {
      "question": "Continuous Batching 能突破这个限制吗？",
      "answer": "不能突破物理显存，但能让 slot 在请求结束时立即回收、新请求即时插入，提高 KV 显存利用率，从而在同显存下服务更高有效并发。"
    }
  ],
  "followUpAnswers": [
    "用 PagedAttention 减少碎片提升利用率。",
    "Prefix Cache 跨请求共享降本。"
  ],
  "pitfalls": [
    "用算力定最大 batch。",
    "忽略并发对 KV 的乘法。"
  ],
  "beginnerSummary": "每个人同时写文档都要自己一份笔记。桌上能摊开的笔记份数（并发）直接乘大总占地。你开 16 个文档就 16 份笔记，开 64 个就 64 份——常常不是电脑算不过来，是桌子被 64 份笔记占满了。",
  "prerequisites": [
    "每请求独立 KV。",
    "总 KV 随并发线性。",
    "显存限制并发上限。"
  ],
  "workedExample": [
    "单请求 KV=2GB：B=16→32GB，B=64→128GB。",
    "短请求占 KV 少，同等显存撑更高并发。"
  ],
  "lineByLine": [
    "每请求一份独立 KV。",
    "总 KV = 单请求 × B。",
    "B 增 ⇒ KV 线性增。",
    "并发上限常由 KV 显存定。"
  ],
  "diagram": "总KV = 单请求KV × B\nB=1  ─▶ 2GB\nB=16 ─▶ 32GB\nB=64 ─▶ 128GB\n并发上限 ≈ 剩余显存 / 单请求KV"
};
