export default {
  "kind": "concept",
  "id": "inf-prefill-decode",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Prefill 与 Decode 区别",
  "prompt": "Prefill 和 Decode 有什么区别？",
  "quickAnswer": "Prefill 一次性并行处理全部输入 token，生成它们的 KV Cache 并产出第一个输出 token，计算密集；Decode 在已有 KV Cache 上每次只生成 1 个新 token，反复读取模型权重与历史 KV，访存密集。",
  "approach": "Prefill=并行编码输入+建 KV；Decode=自回归逐 token，靠 KV 避免重算。",
  "explanationFocus": "是什么：Prefill 处理提示并建 KV Cache；Decode 基于 KV 逐 token 生成。",
  "bruteForce": "不区分两阶段、对历史逐 token 重算注意力 → 重复计算、延迟高。",
  "derivation": [
    "为什么需要：输入是整体，适合并行；输出必须逐 token 自回归，必须分步。",
    "怎么实现：Prefill 用全序列矩阵乘算 Q/K/V 并缓存；Decode 每步只算新 token 的 Q/K/V，拼到 KV 后做一步注意力。",
    "有什么代价：Prefill 吃算力、易占满显存（长 prompt）；Decode 步数多、每步小、带宽受限。",
    "怎么评测：分别看 Prefill 耗时与 Decode 步速（TPOT），以及首 token 延迟 TTFT。"
  ],
  "invariant": "Decode 步的注意力只需算新 token 的 Q，与历史 K 的历史点积复用已缓存 KV。",
  "walkthrough": "Prompt(32 token) → Prefill 一次算 32 个 token 的 KV，出第 1 个生成 token；之后每 Decode 一步只算 1 个新 token，拼 KV，出下 1 个。",
  "edgeCases": [
    "超长 prompt：Prefill 算力/显存峰值高。",
    "长生成：Decode 步数主导总延迟。",
    "流式输出：Prefill 完成后立即开始 Decode，边生成边返回。"
  ],
  "code": "# Python\ndef prefill_decode_demo(prompt_len, gen_len):\n    prefill_flops = prompt_len * 12   # 简化: 并行处理全部 prompt\n    decode_flops = gen_len * 1        # 每步只算 1 个新 token\n    return prefill_flops, decode_flops",
  "codeNotes": [
    "Prefill 的 batch 维 = prompt_len，矩阵“胖”，算力利用率高。",
    "Decode 矩阵 batch 维=1，极“瘦”，算力闲置。"
  ],
  "complexity": "Prefill O(L·n²d + L·nd²) 一次；Decode O(gen·(d² + n·d)) 每步（n 为当前总长度）。",
  "followUps": [
    {
      "question": "为什么要把两个阶段分开优化？",
      "answer": "两者硬件特性相反：Prefill 像大矩阵乘（compute-bound），Decode 像反复搬权重（memory-bound），分开才能分别用不同策略（批处理 vs KV 管理）榨干性能。"
    },
    {
      "question": "Chunked Prefill 是什么？",
      "answer": "把长 prompt 切成块分批 prefill，与 Decode 请求混排，避免长 prompt 独占 GPU 导致短请求饿死，是 Continuous Batching 的常见做法。"
    }
  ],
  "followUpAnswers": [
    "用 separate batch 分别调度两阶段。",
    "Chunked Prefill 降低长 prompt 的调度阻塞。"
  ],
  "pitfalls": [
    "以为 Decode 也并行算多 token（自回归必须串行）。",
    "忽略 Prefill 的显存峰值。"
  ],
  "beginnerSummary": "把大模型想成“先读题、再答题”。读题阶段（Prefill）一次性把整段提示同时看一遍，并记住要点（KV Cache）；答题阶段（Decode）才一个字一个字写，每写一个都回头参考之前记住的要点。读题是“并行猛算”，答题是“慢慢写、反复查笔记”。",
  "prerequisites": [
    "输入提示是一次给全的，可以并行处理。",
    "输出必须一个字一个字生成。",
    "“笔记”= KV Cache，避免重读提示。"
  ],
  "workedExample": [
    "Prompt 32 token：Prefill 一次算 32 个 token 的 KV，出第 1 个生成 token。",
    "之后 Decode 每步只算 1 个新 token 的 QKV，拼到 KV 后出下 1 个。"
  ],
  "lineByLine": [
    "Prefill：并行处理全部输入 token。",
    "Prefill 生成并缓存 KV Cache。",
    "Decode：基于 KV 每次生成 1 个新 token。",
    "Decode 反复读权重与历史 KV。"
  ],
  "diagram": "用户输入 Prompt\n       │\n       ▼\nPrefill\n一次并行处理全部输入 Token\n生成 KV Cache\n       │\n       ▼\nDecode\n一次生成一个 Token\n反复读取 KV Cache\n       │\n       ▼\n输出结果"
};
