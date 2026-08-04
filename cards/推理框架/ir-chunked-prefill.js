export default {
  "id": "ir-chunked-prefill",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "分块 prefill",
  "prompt": "分块 prefill（chunked prefill）如何缓解长提示 prefill 阻塞 decode 的问题？",
  "quickAnswer": "把长提示切成分块，每块作为一次小批量与正在 decode 的序列混合调度，避免一次超大 prefill 长时间独占 GPU 而饿死解码。",
  "approach": "将 prefill 请求按 token 数切块，每块与当前 decode 批次拼成一次迭代；逐块推进 prefill，decode 序列在块间持续前进，平衡二者延迟。",
  "explanationFocus": "是什么：分块 prefill 是把原本一次性、可能上千 token 的 prefill 计算切成若干小块，与 decode 批次交织执行，从而平滑 GPU 负载、降低 decode 的 TPOT 尖刺。",
  "bruteForce": "朴素做法：prefill 与 decode 分开排队，长提示 prefill 一次性跑完，期间 decode 请求被挂起，造成明显卡顿。",
  "invariant": "不变式：prefill 任一分块对应的 KV 在块边界正确拼接，且 decode 序列在每个迭代都至少推进一个 token。",
  "walkthrough": "执行追踪：调度器取 decode 批次并加入一个 prefill 分块；一次融合 kernel 同时算 decode 与 prefill 块；prefill 未完成则下一块继续，直至整段提示消费完转 decode。",
  "complexity": "说明：单步计算量被限制在上界，TPOT 更平稳；代价是 prefill 总步数增多、需处理块内/块间注意力因果掩码。",
  "beginnerSummary": "长提示一次性算 prefill 会让解码卡很久。分块 prefill 把长提示切成小块，每块都和正在解码的请求一起算，大家轮流用 GPU。",
  "diagram": "iter1: [decode x3] + [prefill chunk1]\niter2: [decode x3] + [prefill chunk2]\niter3: [decode x3] + [prefill chunk3 -> 转 decode]",
  "code": "def chunked_prefill(tokens, chunk=512):\n    for i in range(0, len(tokens), chunk):\n        run(tokens[i:i+chunk])  # 分块进 attention，避免卡住 decode",
  "derivation": [
    "为什么需要：长提示 prefill 是算力重头，一次性执行会长时间占用 GPU，使并发 decode 的 TPOT 出现巨大尖刺甚至超时。",
    "怎么实现：将提示按 chunk_size 切分，每个 chunk 与 decode 批次拼成一次融合前向；chunk 内用因果掩码，跨 chunk 复用已算 KV，逐块完成整段 prefill。",
    "有什么代价：prefill 被拆成多步、总 kernel 启动与调度开销上升；需正确处理块间 KV 拼接与注意力掩码，实现更复杂。",
    "怎么评测：对比不同 chunk_size 下 decode TPOT 的 P99 抖动与整体吞吐，找延迟与效率的折中点。"
  ],
  "edgeCases": [
    "提示长度不足一个 chunk 时退化为普通 prefill，不应有额外开销。",
    "chunk 边界处注意力需同时处理块内因果与块间已可见历史。",
    "prefill 中途请求被抢占时，已算分块的 KV 需保留以便恢复。",
    "chunk 过大则失去平滑效果，过小则 prefill 步数过多、开销上升。"
  ],
  "pitfalls": [
    "分块后未复用前面块的 KV，导致重复计算整段提示。",
    "decode 与 prefill 共用 batch 时掩码错误，造成信息泄漏或丢弃。"
  ],
  "prerequisites": [
    "连续批处理与 decode 迭代调度",
    "因果注意力（causal attention）与 KV Cache"
  ],
  "workedExample": [
    "2048 token 提示、chunk=512：拆为 4 块，每步与 3 条 decode 混合，decode 的 TPOT 从\"卡 2048 步\"降为每步仅多 512 token 算力。",
    "短提示 128 token、chunk=512：整段一次 prefill，不触发分块逻辑，无额外开销。"
  ],
  "lineByLine": [
    "range(0, len(tokens), chunk) 产生各分块起点，控制单步算力上限。",
    "tokens[i:i+chunk] 取出当前分块送入注意力计算。",
    "run 内部将该块与 decode 批次拼成融合 kernel，共享一次前向。"
  ],
  "codeNotes": [
    "真实实现中 chunk 边界通过分页 KV 的块表衔接，并配合 variable-length 因果掩码避免跨块信息错乱。"
  ],
  "followUps": [
    {
      "question": "分块 prefill 与 continuous batching 如何协作？",
      "answer": "连续批处理提供迭代级调度骨架，分块 prefill 在其每个迭代中把长提示切块注入，使 prefill 与 decode 在同一迭代内共存。"
    },
    {
      "question": "chunk_size 如何选取？",
      "answer": "在 TPOT 抖动与 prefill 额外开销间权衡，通常取能覆盖数个 decode 步算力的中等值（如 512~2048），并用 P99 延迟调参。"
    }
  ],
  "followUpAnswers": [
    "连续批处理提供迭代级调度骨架，分块 prefill 在其每个迭代中把长提示切块注入，使 prefill 与 decode 在同一迭代内共存。",
    "在 TPOT 抖动与 prefill 额外开销间权衡，通常取能覆盖数个 decode 步算力的中等值（如 512~2048），并用 P99 延迟调参。"
  ],
  "kind": "concept"
};
