export default {
  "kind": "concept",
  "id": "inf-first-token-slow",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "首 Token 为何更慢",
  "prompt": "为什么生成第一个 Token 比生成后续 Token 慢？",
  "quickAnswer": "第一个 token 包含了整个 Prefill 阶段：要把全部输入 token 并行过完所有层并建 KV Cache，计算量等于一次完整前向；后续每个 token 只是一次轻量 Decode（只算 1 个新 token）。所以“首 token 延迟 ≈ Prefill 时间”，天然比单步 Decode 慢。",
  "approach": "首 token = Prefill（重）+ 第一次 Decode（轻）；后续 = 纯 Decode。",
  "explanationFocus": "是什么：首 token 延迟 ≈ Prefill 耗时，因为要先并行编码整段提示。",
  "bruteForce": "把首 token 当成普通 Decode 步 → 无法解释为何 TTFT 远大于 TPOT。",
  "derivation": [
    "为什么需要：要生成第一个字，必须先理解整段输入，没有捷径。",
    "怎么实现：Prefill 一次性对 prompt 做全序列前向并缓存 KV；首 token 由最后一层 LM Head 输出。",
    "有什么代价：长 prompt 使 Prefill 算力/显存峰值高，直接推高 TTFT。",
    "怎么评测：TTFT 单独测量；与 TPOT 对比可判断瓶颈在 Prefill 还是 Decode。"
  ],
  "invariant": "TTFT = Prefill 时间 + 首个 Decode 步时间；当 prompt 长时 TTFT ≈ Prefill。",
  "walkthrough": "用户发 1000 字 → Prefill 跑 1000 token 的前向（重）→ 出第 1 个字；之后每字只是 1 token 的 Decode。",
  "edgeCases": [
    "Prompt 极短：TTFT 接近首个 Decode，差异小。",
    "Prompt 很长：TTFT 由 Prefill 主导，可能数秒。",
    "Chunked Prefill：TTFT 被切成多段，但仍 > 单步 Decode。"
  ],
  "code": "# Python\ndef ttft(prefill_time, first_decode_time):\n    return prefill_time + first_decode_time   # 首 token 延迟\n\ndef tpot(decode_time_per_step):\n    return decode_time_per_step               # 后续每 token",
  "codeNotes": [
    "TTFT 常含排队与 Prefill；TPOT 是稳态每 token 延迟。",
    "优化 TTFT 靠加速 Prefill（并行/更优 kernel/更短 prompt）。"
  ],
  "complexity": "TTFT 与 prompt 长度近似线性（Prefill 算力）；TPOT 与生成长度无关，近似常数。",
  "followUps": [
    {
      "question": "为什么有时首 token 反而快？",
      "answer": "若 prompt 很短且已命中 Prefix Cache（系统提示复用），Prefill 几乎免费，TTFT 就接近一个 Decode 步。"
    },
    {
      "question": "TTFT 高怎么优化？",
      "answer": "缩短/缓存前缀、用更优注意力 kernel、Chunked Prefill 与 Decode 混排减少排队、提升算力利用率。"
    }
  ],
  "followUpAnswers": [
    "Prefix Cache 复用系统提示的 KV。",
    "Prefill 用高算力利用率的大 kernel。"
  ],
  "pitfalls": [
    "混淆 TTFT 与 TPOT，误以为首 token 也是 Decode 步。",
    "用长 prompt 测出的 TTFT 当成模型固有延迟。"
  ],
  "beginnerSummary": "说第一句话前，你得先听完并理解对方整段话——这一步（Prefill）最费时。之后每接一个字只是一小步。所以“开口第一句慢”是正常的，它把“听懂”的成本一次性付清了，后续才轻快。",
  "prerequisites": [
    "生成前必须先理解整段输入。",
    "Prefill 是一次完整前向。",
    "后续 Decode 每步只算一个 token。"
  ],
  "workedExample": [
    "1000 token prompt，Prefill ~1.2s，单 Decode ~30ms → TTFT≈1.23s。",
    "短 prompt 10 token，Prefill ~15ms → TTFT≈45ms，与 TPOT 接近。"
  ],
  "lineByLine": [
    "首 token 含 Prefill（重计算）。",
    "Prefill 并行编码整段 prompt 并建 KV。",
    "后续 token 只是单次 Decode。",
    "故 TTFT ≈ Prefill 时间 ≫ 单步 TPOT。"
  ],
  "diagram": "时间 ─▶ [Prefill: 处理全部 prompt] ─▶ 第1 token\n                    (重, 计算密集)\n       ─▶ [Decode] ─▶ 第2 token ─▶ [Decode] ─▶ ...\n            (轻, 每步 ~TPOT)"
};
