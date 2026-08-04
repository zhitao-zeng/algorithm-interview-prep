export default {
  "id": "sr-prefill-stream",
  "category": "流式推理工程",
  "difficulty": "Hard",
  "title": "prefill 流式输出",
  "prompt": "prefill 阶段能否也做到“流式”输出？增量 prefill（chunked prefill）如何在不阻塞 decode 的前提下边处理 prompt 边产出 token？",
  "quickAnswer": "可以。把长 prompt 切成块做 chunked prefill，每块处理完立即把已就绪部分并入 KV 并允许 decode 步穿插，从而让首字更早出现且不长时间独占 GPU。",
  "approach": "将 prompt 分块，逐块前向生成局部 KV；每处理一块就调度若干 decode 步，使长 prompt 不再一次性占满整个 batch 时间，缩短 TTFT 并降低对在线 decode 的阻塞。",
  "explanationFocus": "是什么：prefill 流式（增量 prefill / chunked prefill）是把长提示分块前向计算，边处理边让 decode 穿插进行，避免一次性 prefill 长时间霸占算力。",
  "bruteForce": "朴素做法：等整段 prompt 一次性 prefill 完才进入 decode，长 prompt 会让整批请求卡在 prefill 阶段，后续 decode 请求被饿死。",
  "invariant": "分块 prefill 必须保证 KV Cache 的拼接顺序与一次性 prefill 完全一致，否则注意力计算的结果（即生成分布）会出错。",
  "walkthrough": "1) 把 prompt 切成等长块；2) 对块 i 做前向，写入对应 KV 槽位；3) 在块间隙插入 decode 步消耗已生成 token；4) 所有块处理完，正常自回归 decode；5) 首 token 在较早的块后即可产出。",
  "complexity": "单次 prefill 由 O(N) 连续变成若干 O(chunk) 块，TTFT 近似降为首个 chunk 的耗时；代价是多了块间调度与 KV 拼接开销，吞吐略降。",
  "beginnerSummary": "长 prompt 一次算完会卡住别人。把 prompt 切块算，算一块就让“出字”插空进行，既早出首字又不耽误别的请求。",
  "diagram": "prompt [c1][c2][c3]\n prefill:c1 -> decode* -> c2 -> decode* -> c3 -> decode...\n  (首 token 在 c1 后即可出现)",
  "code": "def chunked_prefill(tokens, chunk=128):\n    kv = []\n    for i in range(0, len(tokens), chunk):\n        kv.append(model.prefill_step(tokens[i:i+chunk]))\n        yield model.decode_step(kv)  # 穿插出字\n\ndef generate(prompt):\n    return list(chunked_prefill(encode(prompt)))",
  "derivation": [
    "为什么需要：长 prompt 一次性 prefill 会长时间独占 batch，抬高 TTFT 并阻塞并发 decode，需要把“大块算”拆小。",
    "怎么实现：按固定长度切块前向，每块写入对应 KV 区段，块间插入 decode 步，使新 token 尽早生成且不影响他者。",
    "有什么代价：块边界引入额外调度与拼接逻辑，KV 拼接若错位会算错；小块过多会增加 kernel 启动开销、轻微降吞吐。",
    "怎么评测：对比同 prompt 下 TTFT 与整体吞吐，确认 TTFT 下降而吞吐下降在可接受范围，并校验生成结果与整段 prefill 一致。"
  ],
  "edgeCases": [
    "prompt 长度不是 chunk 整数倍：最后一块需正确截断且不越界写 KV。",
    "chunk 过小：kernel 启动开销抵消收益，需调参到吞吐拐点。",
    "与 continuous batching 混用：需保证新到的 decode 请求能插在块间隙而不破坏 KV 顺序。",
    "跨请求 KV 复用（prefix cache）：分块需与缓存前缀对齐，避免重复计算。"
  ],
  "pitfalls": [
    "忽略 KV 拼接顺序：分块写入若错位，注意力会读到错误历史，生成分布偏差却难察觉。",
    "为降 TTFT 无限制缩小 chunk：反而因调度开销使总吞吐崩塌。"
  ],
  "prerequisites": [
    "理解 prefill 与 decode 两阶段及 KV Cache 结构",
    "了解连续批处理与 GPU kernel 调度开销"
  ],
  "workedExample": [
    "示例A：prompt 2048 token，chunk=512，首 token 在第 1 块后即产出，TTFT 由 2048 步降到约 512 步量级。",
    "示例B：chunk=16 时 kernel 启动开销占比过高，吞吐较 chunk=512 下降明显，需取折中。"
  ],
  "lineByLine": [
    "chunked_prefill：以 chunk 为步长切片，逐块调用 prefill_step 累积 KV。",
    "yield decode_step(kv)：在每块后穿插 decode，使首字提前出现。",
    "generate：把生成器展开为列表，演示端到端产出。"
  ],
  "codeNotes": [
    "真实实现要处理 kv 的页式管理与块间 mask，示例省略了 causal mask 细节。"
  ],
  "followUps": [
    {
      "question": "chunked prefill 与 prefix caching 如何配合？",
      "answer": "把命中缓存的 prompt 前缀作为首个整块直接复用 KV，仅对未命中部分分块 prefill，减少重复计算。"
    },
    {
      "question": "会不会影响生成质量？",
      "answer": "只要 KV 拼接顺序与因果掩码正确，数学上等价于一次性 prefill，生成分布一致，不影响质量。"
    }
  ],
  "followUpAnswers": [
    "把命中缓存的 prompt 前缀作为首个整块直接复用 KV，仅对未命中部分分块 prefill，减少重复计算。",
    "只要 KV 拼接顺序与因果掩码正确，数学上等价于一次性 prefill，生成分布一致，不影响质量。"
  ],
  "kind": "concept"
};
