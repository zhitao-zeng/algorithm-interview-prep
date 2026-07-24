export default {
  "id": "inf-prefill-decode",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Prefill 与 Decode 区别",
  "prompt": "Prefill 和 Decode 有什么区别？",
  "code": "# Python\ndef prefill_decode_demo(prompt_len, gen_len):\n    prefill_flops = prompt_len * 12   # 简化: 并行处理全部 prompt\n    decode_flops = gen_len * 1        # 每步只算 1 个新 token\n    return prefill_flops, decode_flops",
  "diagram": "用户输入 Prompt\n       │\n       ▼\nPrefill\n一次并行处理全部输入 Token\n生成 KV Cache\n       │\n       ▼\nDecode\n一次生成一个 Token\n反复读取 KV Cache\n       │\n       ▼\n输出结果",
  "explanationFocus": "是什么：Prefill 与 Decode 是 Transformer 自回归推理的两个阶段。Prefill 一次性并行处理全部输入 token，计算它们的 KV Cache 并产出第一个输出 token，计算密集（大矩阵乘，compute-bound）；Decode 在已有 KV Cache 上每次只生成 1 个新 token，反复读取模型权重与历史 KV，访存密集（memory-bound）。两者硬件特性相反，需分开优化。",
  "quickAnswer": "Prefill 一次性并行处理全部输入 token，生成它们的 KV Cache 并产出第一个输出 token，计算密集（compute-bound）；Decode 在已有 KV Cache 上每次只生成 1 个新 token，反复读取模型权重与历史 KV，访存密集（memory-bound）。KV Cache 是连接两阶段的桥梁——避免 Decode 重算历史。",
  "beginnerSummary": "把大模型想成『先读题、再答题』。读题阶段（Prefill）一次性把整段提示同时看一遍，并记住要点（KV Cache）；答题阶段（Decode）才一个字一个字写，每写一个都回头参考之前记住的要点。读题是『并行猛算』，答题是『慢慢写、反复查笔记』。",
  "walkthrough": "用户输入 Prompt（32 token）→ Prefill 一次算 32 个 token 的 QKV 并缓存 KV，末层 LM Head 输出第 1 个生成 token（compute-bound，batch 维=32，~毫秒级）；之后每 Decode 一步只算 1 个新 token 的 QKV，拼到 KV 后做一步注意力，出下 1 个 token（memory-bound，batch 维=1，~30ms/tok）。生成 200 字则 200 步 Decode。流式输出时 Prefill 一完立即开始 Decode，边生成边返回。",
  "approach": "Prefill=并行编码输入+建 KV；Decode=自回归逐 token，靠 KV 避免重算。Prefill 用全序列矩阵乘（batch 维=n），Decode 每步只算新 token。两阶段用不同策略：Prefill 优化算力利用率/更优 kernel/Chunked Prefill；Decode 优化带宽/量化/大 batch/投机解码。",
  "bruteForce": "不区分两阶段、对历史逐 token 重算注意力（无 KV Cache）——每生成一个新 token 都把前面所有 token 重新过注意力，复杂度 O(n²) 每步、总 O(n³)，长序列直接爆炸，且完全浪费 Prefill 已算好的中间结果。",
  "invariant": "Decode 步的注意力只需算新 token 的 Q，与历史 K 的点积复用已缓存 KV（不重算历史）。Prefill 与 Decode 共享同一套权重与 KV Cache 格式；Decode 每步把新 token 的 K/V append 到 KV Cache 供下一步使用。",
  "complexity": "Prefill O(L·(n²d + nd²)) 一次（n=prompt_len，全并行）；Decode O(gen·(d² + n·d)) 每步（每步只算新 token 的 d² 计算，但注意力要读 n 个历史 KV 做点积，n 为当前总长度）。总延迟 = Prefill + gen×TPOT。Prefill 显存峰值高（一次性存 n 个 KV），Decode 显存随生成增长但平缓。Continuous Batching 下多请求 Prefill/Decode 混跑。",
  "derivation": [
    "为什么需要：输入是整体、适合并行处理（Prefill）；输出必须逐 token 自回归、只能分步生成（Decode）。两者计算形态不同，若混为一谈用同一优化会选错方向，故必须分开建模。",
    "怎么实现：Prefill 用全序列矩阵乘算 Q/K/V 并缓存每层 K/V 到 KV Cache，末层输出第 1 个 token；Decode 每步只算新 token 的 Q/K/V，把新 K/V append 到缓存，注意力用新 Q 与全部历史 K/V 点积得上下文，再过输出投影与 LM Head 出下一 token。",
    "有什么代价：Prefill 吃算力、易占满显存（长 prompt 时 KV 巨大），可能阻塞其他请求；Decode 步数多、每步小、带宽受限，且自回归使其无法并行、延迟随生成长度线性增长。Chunked Prefill 可缓解 Prefill 阻塞但增加调度复杂度。",
    "怎么评测：分别测量 Prefill 耗时与 Decode 步速（TPOT），以及首 token 延迟 TTFT=Prefill+首 Decode。看 TTFT 判断 Prefill 是否过快/过慢，看 TPOT 与吞吐判断 Decode 效率；用 Roofline 确认 Prefill 在算力屋顶、Decode 在带宽屋顶。"
  ],
  "edgeCases": [
    "超长 prompt（>32K）：Prefill 算力/显存峰值极高，KV Cache 可能 OOM，需 PagedAttention/KV 量化/Chunked Prefill。",
    "长生成（>1K token）：Decode 步数主导总延迟，TPOT 决定体验，需量化/投机解码压每步。",
    "流式输出：Prefill 完成后立即开始 Decode，边生成边返回，TTFT 即用户感知的首字延迟。",
    "Continuous Batching：多请求 Prefill 与 Decode 步混排，调度器需分别管理两阶段显存与计算。"
  ],
  "pitfalls": [
    "以为 Decode 也并行算多 token：自回归必须串行，每步依赖上一步输出，无法并行（除非投机解码一次性验证多 token）。",
    "忽略 Prefill 的显存峰值：长 prompt 的 KV Cache 一次性占满显存，导致 OOM 或阻塞。",
    "混淆 TTFT 与 TPOT 的瓶颈：优化首字用 Prefill 手段，优化逐字用 Decode 手段，混用无效。"
  ],
  "prerequisites": [
    "输入提示是一次给全的，可以并行处理（Prefill 基础）。",
    "输出必须一个字一个字生成（自回归，Decode 基础）。",
    "『笔记』= KV Cache，避免重读/重算提示，是连接两阶段的桥梁。",
    "两阶段硬件特性相反：Prefill compute-bound、Decode memory-bound。"
  ],
  "workedExample": [
    "例 1（单轮 32 token）：Prompt 32 token → Prefill 一次算 32 个 token 的 KV（compute-bound，~20ms），出第 1 个生成 token；之后 Decode 每步只算 1 个新 token（~30ms/tok）。",
    "例 2（长生成 200 字）：TTFT≈Prefill(20ms)+首 Decode(30ms)=50ms；总延迟≈50ms + 200×30ms = 6.05s。",
    "例 3（Chunked Prefill）：8K prompt 切成 1K 块分批 prefill，与 4 个 Decode 请求混排，避免 8K 独占 GPU 导致短请求饿死，提升整体吞吐。"
  ],
  "lineByLine": [
    "Prefill：并行处理全部输入 token（batch 维=n 的矩阵乘）。",
    "Prefill 生成并缓存 KV Cache（每层 K/V 存下供 Decode 复用）。",
    "Decode：基于 KV 每次生成 1 个新 token（batch 维=1）。",
    "Decode 反复读权重与历史 KV，append 新 K/V 到缓存。"
  ],
  "codeNotes": [
    "Prefill 的 batch 维 = prompt_len，矩阵『胖』，算力利用率高（compute-bound）；Decode 矩阵 batch 维=1，极『瘦』，算力闲置（memory-bound）。",
    "KV Cache 是两段共享状态：Prefill 写、Decode 读并 append，格式必须一致（含 GQA 下的 KV 头数）。",
    "prefill_decode_demo 是简化模型：真实 FLOPs 远比 prompt_len×12 复杂，仅用于示意两阶段量级差异。"
  ],
  "followUps": [
    {
      "question": "为什么要把两个阶段分开优化？",
      "answer": "因为两者硬件特性相反：Prefill 像大矩阵乘（batch 维=n，compute-bound，受算力限制）；Decode 像反复搬权重（batch 维=1，memory-bound，受带宽限制）。分开才能用不同策略——Prefill 用更优注意力 kernel/FP8/Chunked Prefill 提算力利用率，Decode 用量化/KV 压缩/大 batch/投机解码减带宽压力。混用手段会南辕北辙。"
    },
    {
      "question": "Chunked Prefill 是什么？",
      "answer": "把长 prompt 切成固定大小的块分批做 Prefill，并与 Decode 请求在调度上混排（continuous batching 的一种），避免一条长 prompt 独占 GPU 做完整 Prefill 导致短请求长时间饿死。它牺牲了一点 Prefill 的并行度，换取更公平、更高的整体吞吐与更稳的尾延迟。"
    },
    {
      "question": "Continuous Batching 和两阶段什么关系？",
      "answer": "Continuous Batching 让不同请求在不同阶段混跑：新请求到来立即开始 Prefill（不再等批次填满），已完成的请求让出位置、新 Decode 步补上。它需要调度器分别管理 Prefill（写 KV）与 Decode（读/append KV）的显存与计算，是连接两阶段、提升 GPU 利用率的关键工程机制。"
    }
  ],
  "followUpAnswers": [
    "因为两者硬件特性相反：Prefill 像大矩阵乘（batch 维=n，compute-bound，受算力限制）；Decode 像反复搬权重（batch 维=1，memory-bound，受带宽限制）。分开才能用不同策略——Prefill 用更优注意力 kernel/FP8/Chunked Prefill 提算力利用率，Decode 用量化/KV 压缩/大 batch/投机解码减带宽压力。混用手段会南辕北辙。",
    "把长 prompt 切成固定大小的块分批做 Prefill，并与 Decode 请求在调度上混排（continuous batching 的一种），避免一条长 prompt 独占 GPU 做完整 Prefill 导致短请求长时间饿死。它牺牲了一点 Prefill 的并行度，换取更公平、更高的整体吞吐与更稳的尾延迟。",
    "Continuous Batching 让不同请求在不同阶段混跑：新请求到来立即开始 Prefill（不再等批次填满），已完成的请求让出位置、新 Decode 步补上。它需要调度器分别管理 Prefill（写 KV）与 Decode（读/append KV）的显存与计算，是连接两阶段、提升 GPU 利用率的关键工程机制。"
  ]
};
