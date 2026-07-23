export default {
  "kind": "concept",
  "id": "cb-trt-llm",
  "category": "Continuous Batching",
  "difficulty": "Hard",
  "title": "TensorRT-LLM 中的 in-flight batching",
  "prompt": "TensorRT-LLM 里的 in-flight batching（连续批）是怎么实现的？",
  "quickAnswer": "TensorRT-LLM 称连续批为 in-flight batching，由 scheduler 在每次迭代把新请求加入正在跑的 batch、把完成的移出，配合其 KV cache 管理器(paged/linear)与专门 fused kernel。它支持 chunked context(prefill 分块)以减小 prefill 对 decode 的阻塞，并用 pagination 做 KV 按需分配，整体思路与 vLLM 一致但深度绑定 TRT 引擎优化。",
  "approach": "理解 TRT-LLM scheduler + paged KV + chunked context 三件套。",
  "explanationFocus": "是什么：in-flight batching 是 TensorRT-LLM 对 Continuous Batching 的叫法，通过在迭代级动态增删 batch 成员并配分页 KV 实现高吞吐。",
  "bruteForce": "早期 TRT 用静态/V1 batching，需等整批结束，气泡严重。",
  "derivation": [
    "为什么需要：TRT-LLM 追求极致 kernel 效率，但静态批浪费算力，必须把连续批融入其执行引擎。",
    "怎么实现：scheduler 在每步生成后更新 batch（增新/删完成），KV 用 paged 或 linear 管理器按需分配；chunked context 把长 prefill 切块插在 decode 之间。",
    "有什么代价：与 TRT 引擎强耦合，定制 kernel 多；paged 与 linear KV 模式需按场景选型。",
    "怎么评测：用 trtllm-bench 在固定负载测吞吐/延迟，对比开启 in-flight 与否。"
  ],
  "invariant": "开启 in-flight 后，batch 成员每步可变，KV 按实际占用而非 max_len 预留。",
  "walkthrough": "batch 上限 64，步 t 跑 60 含 1 长 prefill；chunked context 把该 prefill 拆 4 块，期间其余 59 个 decode 不阻塞；长请求完成即移出，新请求补入。",
  "edgeCases": [
    "paged vs linear KV：linear 更简单但碎片多，paged 利用率高。",
    "chunked context 增加 prefill 步数，需权衡。",
    "引擎 shape 约束：batch 维度动态需 TRT 支持变长。"
  ],
  "code": "# Python (TRT-LLM 风格伪代码)\ndef step(batch, scheduler):\n    batch.run_decode()                    # 当前成员推进一步\n    completed = [r for r in batch if r.done]\n    for r in completed: scheduler.free_kv(r)   # 释放 KV\n    for r in scheduler.poll_new():\n        if batch.has_slot(): batch.add(r)      # 即时插入",
  "codeNotes": [
    "in-flight = 迭代级增删 batch 成员。",
    "chunked context 削 prefill 尖峰。"
  ],
  "complexity": "依赖 TRT fused kernel 效率；吞吐随有效并发与 KV 利用率提升。",
  "followUps": [
    {
      "question": "in-flight batching 和 vLLM 连续批区别？",
      "answer": "思想一致，都是迭代级动态调度+分页 KV；区别在实现栈：TRT-LLM 绑定 TensorRT 引擎与专属 kernel，vLLM 自研 PagedAttention。"
    },
    {
      "question": "chunked context 有什么代价？",
      "answer": "把一次 prefill 拆多步会略微增加 prefill 总耗时，但换来 decode 不被长 prefill 阻塞，整体更稳。"
    }
  ],
  "followUpAnswers": [
    "同思想, 异实现栈(TRT vs 自研)。",
    "prefill 拆步略增耗时换不阻塞。"
  ],
  "pitfalls": [
    "以为 in-flight 是 TRT 独有概念，其实等同连续批。",
    "忽视 chunked context 对 prefill 耗时的影响。",
    "（事实核查·2025）NVIDIA 方向是 TensorRT-LLM 配合 NVIDIA Dynamo 做分布式推理服务（disaggregated prefill/decode、请求路由、弹性）。支持 in-flight batching、paged KV、FP8。别把 TRT-LLM 当孤立库，现在强调与 Dynamo 编排协同。"
  ],
  "beginnerSummary": "TensorRT-LLM 的 in-flight batching 和 vLLM 的连续批是同一招的不同名字：都是每步动态上下客。区别是它坐在 TensorRT 这台\"特制赛车\"上，kernel 更快，但改装也更绑定车型。",
  "prerequisites": [
    "in-flight == 连续批的同义名。",
    "需分页/按需 KV。",
    "TRT 引擎支持动态 batch 维。"
  ],
  "workedExample": [
    "batch 上限 64, 步t 跑60含1长prefill。",
    "chunked 拆4块, 其余59 decode 不阻塞。"
  ],
  "lineByLine": [
    "当前 batch 推进一步 decode。",
    "标记完成请求。",
    "释放其 KV 缓存。",
    "从 scheduler 拉新请求即时插入。"
  ],
  "diagram": "TRT-LLM: scheduler 每步 增/删 batch 成员\n+ paged KV + chunked context"
};
