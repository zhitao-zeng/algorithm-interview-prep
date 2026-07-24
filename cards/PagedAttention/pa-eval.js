export default {
  "kind": "concept",
  "id": "pa-eval",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "PagedAttention 的评测：显存利用率/吞吐提升",
  "prompt": "如何评测 PagedAttention 的效果，看哪些指标？",
  "quickAnswer": "核心看两类指标：(1) 显存侧——KV 显存利用率（实际/已分配）、可支撑的最大并发序列数、最大上下文；(2) 性能侧——吞吐(tokens/s)、TTFT、同显存下相比连续分配基线的吞吐提升倍数。vLLM 论文实测在真实负载下吞吐可达 HuggingFace 基线的 2~4 倍，主要得益于碎片消除与 Continuous Batching 配合。",
  "approach": "显存利用率 + 最大并发 + 吞吐/延迟，对比连续分配基线。",
  "explanationFocus": "是什么：评测 PagedAttention 看 KV 利用率、最大并发与吞吐提升，对比连续分配基线算倍数。",
  "bruteForce": "只看模型精度，忽略显存与吞吐收益。",
  "derivation": [
    "为什么需要：要量化\"分页\"到底带来多少收益，才能决策。",
    "怎么实现：固定模型与硬件，扫并发/长度，记录利用率与吞吐曲线。",
    "有什么代价：需设计贴近真实长度分布的负载，否则数字失真。",
    "怎么评测：与 HF Transformers 等连续分配实现做同条件 A/B。"
  ],
  "invariant": "在真实长度分布下，分页方案的 最大并发 ≈ 连续方案的 (平均预留/平均实际) 倍。",
  "walkthrough": "同 40GB 显存、7B 模型：连续方案最长上下文受限约 60 并发；PagedAttention + 连续批处理实测约 2~4 倍吞吐，且长上下文更稳。",
  "edgeCases": [
    "负载长度分布偏斜：均值短则利用率收益更大。",
    "极长单请求：分页不减其绝对 KV，只减并发间的浪费。",
    "小 batch：分页收益相对小，主要收益在并发高时。"
  ],
  "code": "# Python\ndef kv_utilization(used_tokens, allocated_blocks, block_size):\n    allocated = allocated_blocks * block_size\n    return used_tokens / allocated\n\ndef speedup(paged_tput, baseline_tput):\n    return paged_tput / baseline_tput   # 目标 >= 2x",
  "codeNotes": [
    "利用率与吞吐要一起看。",
    "基线必须是同硬件连续分配。"
  ],
  "complexity": "评测本身 O(实验次数)；结论为相对倍数，无算法复杂度。",
  "followUps": [
    {
      "question": "吞吐提升主要来自分页还是连续批处理？",
      "answer": "两者协同：分页消除了碎片让更多请求进得来，连续批处理让它们高效同跑；单独分页也提升利用率，但真正把利用率转化为吞吐要靠连续批处理。"
    },
    {
      "question": "会不会有反向情况（分页更慢）？",
      "answer": "在极低并发、极短请求时，分页的查表/管理开销可能使微基准略慢，但生产高并发下收益远大于开销。"
    }
  ],
  "followUpAnswers": [
    "利用率靠分页，吞吐靠批处理。",
    "高并发才显收益。"
  ],
  "pitfalls": [
    "只报吞吐不报利用率，掩盖收益来源。",
    "用不真实的长度分布做评测。"
  ],
  "beginnerSummary": "评价一项改进要看\"省了多少地方\"和\"快了多少\"。对餐厅来说就是：同样大的店能同时招待几桌（最大并发/利用率），以及每小时翻台多少桌（吞吐）。PagedAttention 让店能多摆几桌、翻台更快——vLLM 实测大约能多接 2 到 4 倍的客人。",
  "prerequisites": [
    "需量化显存与吞吐收益。",
    "要有连续分配基线对比。",
    "负载长度分布影响数字。"
  ],
  "workedExample": [
    "同 40GB：连续约 60 并发，分页+批处理 2~4x 吞吐。",
    "利用率从 ~30% 提升到近 100%。"
  ],
  "lineByLine": [
    "测 KV 利用率。",
    "测最大可并发序列。",
    "测吞吐与 TTFT。",
    "对比连续分配基线算倍数。"
  ],
  "diagram": "指标:\n 利用率 = 实际/已分配KV  (->~100%)\n 最大并发 = f(剩余显存)\n 吞吐 = tokens/s  (分页/基线 ≈ 2~4x)\n基线: HF连续分配"
};
