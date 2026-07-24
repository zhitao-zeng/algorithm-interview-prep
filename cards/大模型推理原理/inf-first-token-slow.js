export default {
  "id": "inf-first-token-slow",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "首 Token 为何更慢",
  "prompt": "为什么生成第一个 Token 比生成后续 Token 慢？",
  "code": "# Python\ndef ttft(prefill_time, first_decode_time):\n    return prefill_time + first_decode_time   # 首 token 延迟\n\ndef tpot(decode_time_per_step):\n    return decode_time_per_step               # 后续每 token",
  "diagram": "时间 ─▶ [Prefill: 处理全部 prompt] ─▶ 第1 token\n                    (重, 计算密集)\n       ─▶ [Decode] ─▶ 第2 token ─▶ [Decode] ─▶ ...\n            (轻, 每步 ~TPOT)",
  "explanationFocus": "是什么：首 Token 延迟（TTFT, Time To First Token）约等于 Prefill 阶段的耗时，因为生成第一个字之前，模型必须先并行编码（Prefill）整段提示、算完所有层的注意力并建好 KV Cache，这一步的计算量等于一次覆盖全部输入 token 的完整前向；而之后每个 token 只是一次轻量的 Decode（只算 1 个新 token）。所以『首 token 慢』是结构性的：它把『理解整段输入』的成本一次性付清。",
  "quickAnswer": "第一个 token 包含了整个 Prefill 阶段——要把全部输入 token 并行过完所有层并建 KV Cache，计算量等于一次完整前向；后续每个 token 只是一次轻量 Decode（只算 1 个新 token）。所以首 token 延迟 ≈ Prefill 时间，天然比单步 Decode 慢数倍到数百倍，取决于 prompt 长度。",
  "beginnerSummary": "说第一句话前，你得先听完并理解对方整段话——这一步（Prefill）最费时。之后每接一个字只是一小步。所以『开口第一句慢』是正常的，它把『听懂』的成本一次性付清了，后续才轻快。就像老师改卷，先通读整张试卷（慢），之后每写一句评语很快。",
  "walkthrough": "用户发 1000 字（约 1000 token）的 prompt：Prefill 要跑 1000 个 token 的一次完整前向（含 32 层注意力与 FFN），在 A100 上约 1.2s，期间显存峰值高（要存 1000 个 token 的 KV）；Prefill 末层 LM Head 输出第 1 个生成 token，耗时约 30ms 的首次 Decode。故 TTFT ≈ 1.23s。之后每字只是 1 token 的 Decode，约 30ms（TPOT）。可见首 token 比后续每步慢约 40 倍。",
  "approach": "拆成两段看：首 token = Prefill（重，并行处理全部 prompt）+ 第一次 Decode（轻）；后续 token = 纯 Decode（每步 1 token，反复读权重与 KV）。要降低 TTFT 就优化 Prefill（更优注意力 kernel、更短/可缓存前缀、Chunked Prefill 与 Decode 混排减少排队）；要降低后续延迟就优化 Decode（量化、大 batch、投机解码）。",
  "bruteForce": "把首 token 当成普通 Decode 步来理解和优化——比如以为『首 token 慢是因为 Decode 慢』而去量化权重，结果 TTFT 几乎没变，因为瓶颈在 Prefill 的并行计算而非 Decode 的带宽。不区分两阶段会选错优化手段。",
  "invariant": "TTFT = Prefill 时间 + 首个 Decode 步时间；当 prompt 较长时 TTFT ≈ Prefill。Prefill 的计算量随 prompt 长度近似线性，与生成长度无关；首个 Decode 步与后续 Decode 步同量级。因此长 prompt 时 TTFT 由 Prefill 主导，可数秒甚至更久。",
  "complexity": "TTFT 与 prompt 长度近似线性（Prefill 算力 ∝ prompt_len × d² 每层，加上注意力 O(prompt_len²·d)）；TPOT 与生成长度无关、近似常数（每步只算 1 个新 token）。在 batch 服务中，TTFT 还受排队延迟影响（前面请求未完会阻塞新请求的首 token），故线上 TTFT = 排队 + Prefill + 首 Decode。测量时应分别打点，避免把排队算进模型固有延迟。",
  "derivation": [
    "为什么需要：要生成第一个字，模型必须先理解整段输入——没有捷径可跳过『读 prompt』。这一步无法避免，所以首 token 必然包含一个完整 Prefill；若误以为首 token 也是轻量 Decode，就会用错优化手段。",
    "怎么实现：Prefill 一次性对 prompt 的 n 个 token 做全序列前向（矩阵 batch 维=n，高度并行），并缓存每层 K/V 到 KV Cache；末层 LM Head 在最后一个位置输出第 1 个生成 token 的 logits，经采样得到首 token。随后进入 Decode 循环。",
    "有什么代价：长 prompt 使 Prefill 的算力与显存峰值都很高（KV Cache 随 prompt 长度线性增长），直接推高 TTFT，且在批服务中长 prompt 会占满 GPU 一段时间、阻塞其他请求的 TTFT。Chunked Prefill 可缓解但 TTFT 仍 > 单步 Decode。",
    "怎么评测：单独测量 TTFT（从请求发起到收到首字节）并拆出排队/Prefill/首 Decode 三段；与 TPOT 对比可判断瓶颈在 Prefill 还是 Decode，进而决定优化方向（加速 Prefill vs 加速 Decode）。"
  ],
  "edgeCases": [
    "Prompt 极短（如 10 token）：Prefill 几乎免费，TTFT ≈ 一个 Decode 步（约 30~45ms），与 TPOT 接近，看不出首 token 更慢。",
    "Prompt 很长（如 32K token）：TTFT 由 Prefill 主导，可能数秒到十几秒，且 KV Cache 显存峰值可能触发 OOM。",
    "Chunked Prefill：把长 prompt 切块分多步 prefill，TTFT 被切成多段，但仍严格大于单步 Decode；同时与 Decode 混排可降低排队。",
    "Prefix Cache 命中：系统提示等公共前缀 KV 已缓存，Prefill 只需算新增部分，TTFT 大幅下降。"
  ],
  "pitfalls": [
    "混淆 TTFT 与 TPOT，误以为首 token 也是 Decode 步，于是对首 token 慢去做 Decode 优化（量化）而无效。",
    "用长 prompt 测出的 TTFT 当成模型固有延迟，忽略是 prompt 长度导致的 Prefill 成本，误导性能结论。",
    "在批服务中把排队延迟算进 TTFT 模型成本，导致误判 Prefill 本身慢。"
  ],
  "prerequisites": [
    "生成前必须先理解整段输入（自回归的条件依赖）。",
    "Prefill 是一次完整前向、且高度并行（batch 维=prompt_len）。",
    "后续 Decode 每步只算一个 token，与 Prefill 量级不同。",
    "KV Cache 在 Prefill 阶段建立，供 Decode 复用。"
  ],
  "workedExample": [
    "例 1（长 prompt）：1000 token prompt，Prefill ~1.2s，单 Decode ~30ms → TTFT≈1.23s，是 TPOT 的约 40 倍。",
    "例 2（短 prompt）：10 token prompt，Prefill ~15ms → TTFT≈45ms，与 TPOT（~30ms）接近，差异很小。",
    "例 3（Prefix Cache）：系统提示 500 token 已缓存，用户新增 50 token，Prefill 只算 50 token ~75ms，TTFT 从 0.6s 降到 ~0.1s。"
  ],
  "lineByLine": [
    "def ttft(prefill_time, first_decode_time): 首 token 延迟入口。",
    "return prefill_time + first_decode_time：首 token = Prefill 重计算 + 首次 Decode 轻计算。",
    "def tpot(decode_time_per_step): 后续每 token 稳态延迟，与生成长度无关。",
    "（隐含）TTFT ≫ TPOT 当 prompt 长时，因为 Prefill 覆盖全部输入。"
  ],
  "codeNotes": [
    "TTFT 常含排队与 Prefill；线上测量要把排队单独剥离，否则会高估模型 Prefill 成本。",
    "优化 TTFT 靠加速 Prefill：更优注意力 kernel（如 FlashAttention）、缩短/缓存前缀、Chunked Prefill 与 Decode 混排减少排队。",
    "TPOT 是稳态每 token 延迟，适合用来评估『生成流畅度』，与 TTFT 是两个独立 SLA 指标。"
  ],
  "followUps": [
    {
      "question": "为什么有时首 token 反而快（接近 Decode）？",
      "answer": "当 prompt 很短，或者命中了 Prefix Cache（系统提示等公共前缀的 KV 已缓存），Prefill 只需算极少新 token 甚至几乎免费，此时 TTFT 就接近一个 Decode 步（几十毫秒）。例如 10 token 短问句，Prefill 仅 ~15ms，TTFT≈45ms ≈ TPOT。"
    },
    {
      "question": "TTFT 高怎么优化？",
      "answer": "缩短/缓存前缀（Prompt Cache、系统提示复用）、用更优注意力 kernel（FlashAttention/PA）加速 Prefill、采用 Chunked Prefill 与 Decode 混排减少排队、提升算力利用率（更大 Prefill 矩阵、FP8）。若长 prompt 不可避免，可异步流式返回或先吐占位。"
    },
    {
      "question": "TTFT 和 TPOT 应该分别设 SLA 吗？",
      "answer": "应该。TTFT 影响『响应及时感』（用户等多久看到第一个字），TPOT 影响『生成流畅感』（逐字速度），两者瓶颈不同（Prefill vs Decode），优化手段相反，应分别设阈值与监控，否则会顾此失彼。"
    }
  ],
  "followUpAnswers": [
    "当 prompt 很短，或者命中了 Prefix Cache（系统提示等公共前缀的 KV 已缓存），Prefill 只需算极少新 token 甚至几乎免费，此时 TTFT 就接近一个 Decode 步（几十毫秒）。例如 10 token 短问句，Prefill 仅 ~15ms，TTFT≈45ms ≈ TPOT。",
    "缩短/缓存前缀（Prompt Cache、系统提示复用）、用更优注意力 kernel（FlashAttention/PA）加速 Prefill、采用 Chunked Prefill 与 Decode 混排减少排队、提升算力利用率（更大 Prefill 矩阵、FP8）。若长 prompt 不可避免，可异步流式返回或先吐占位。",
    "应该。TTFT 影响『响应及时感』（用户等多久看到第一个字），TPOT 影响『生成流畅感』（逐字速度），两者瓶颈不同（Prefill vs Decode），优化手段相反，应分别设阈值与监控，否则会顾此失彼。"
  ]
};
