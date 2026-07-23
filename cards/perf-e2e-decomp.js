export default {
  "kind": "concept",
  "id": "perf-e2e-decomp",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "端到端延迟分解（prefill / decode）",
  "prompt": "如何把大模型服务的端到端延迟拆成 prefill 与 decode 两部分来定位瓶颈？",
  "quickAnswer": "端到端延迟=排队+Prefill(处理全部输入)+Decode(逐 token 生成)。Prefill 是一次性矩阵乘，随输入长度增长；Decode 是自回归逐步生成，随输出长度增长。分别埋点两段耗时即可定位是\"输入长\"还是\"输出慢\"拖慢整体。",
  "approach": "在调度层对每段打点：请求入队→prefill 完成→逐 token→结束，比较各段占比。",
  "explanationFocus": "是什么：把端到端延迟拆为排队、Prefill(输入阶段)、Decode(输出阶段)三段，分别定量以定位瓶颈归属。",
  "bruteForce": "只报总延迟：不知道是输入长还是输出慢，优化方向完全错。",
  "derivation": [
    "为什么需要：Prefill 受输入长度与算力限制，Decode 受内存带宽限制，优化手段完全不同。",
    "怎么实现：记录 prefill 起止与首 token、decode 起止与末 token，分别计时。",
    "有什么代价：需框架支持阶段埋点；continuous batching 下各请求阶段交错，需按请求聚合。",
    "怎么评测：在固定输入/输出长度下统计两段 p50/p95，看占比。"
  ],
  "invariant": "端到端 ≈ 排队 + Prefill + (输出token数)×TPOT；Prefill∝输入长度，Decode∝输出长度。",
  "walkthrough": "输入2k token、输出500 token：prefill=0.8s，decode=500×4ms=2s，端到端≈2.8s，瓶颈在 decode。",
  "edgeCases": [
    "continuous batching 使阶段重叠难拆分。",
    "排队时间在高峰期占大头。",
    "prefix cache 命中省掉部分 prefill。"
  ],
  "code": "# Python\ndef e2e(queue, prefill, decode_t, n_out, tpot):\n    return queue + prefill + decode_t + n_out * tpot\ndef prefill_cost(in_len, flops_per_tok):\n    return in_len * flops_per_tok            # 与输入长度成正比",
  "codeNotes": [
    "decode 段受带宽限制而非算力。",
    "prefix cache 命中可减去重复 prefill。"
  ],
  "complexity": "O(请求数) 分段统计。",
  "followUps": [
    {
      "question": "prefill 慢怎么优化？",
      "answer": "用更优 attention 实现、增大 prefill batch、或 prefix cache 复用相同前缀。"
    },
    {
      "question": "decode 慢怎么优化？",
      "answer": "提升内存带宽利用率、量化、投机解码(speculative decoding)或减少输出长度。"
    }
  ],
  "followUpAnswers": [
    "prefill 慢→算力/attention 优化。",
    "decode 慢→带宽/量化/投机解码。"
  ],
  "pitfalls": [
    "把排队时间与计算时间混为一谈。",
    "忽略 continuous batching 造成的重叠。"
  ],
  "beginnerSummary": "做饭：prefill 像\"备菜切所有食材\"，一次用力但跟食材总量(输入)成正比；decode 像\"一道道炒出来\"，炒几道(输出)就花几倍时间。要提速得先知道是备菜慢还是炒菜慢。",
  "prerequisites": [
    "prefill 与 decode 两阶段。",
    "自回归逐 token 生成。",
    "continuous batching 概念。"
  ],
  "workedExample": [
    "prefill=0.8s, decode=2s → 瓶颈在 decode。",
    "prefix cache 命中省 0.5s prefill。"
  ],
  "lineByLine": [
    "记录入队到 prefill 开始(排队)。",
    "记录 prefill 起止(输入处理)。",
    "记录首 token 到末 token(decode)。",
    "按段聚合看占比定位瓶颈。"
  ],
  "diagram": "请求 →[排队]→[Prefill 输入]→[Decode tok1..tokN]→结束\n           输入长↑           输出长↑"
};
