export default {
  "kind": "concept",
  "id": "perf-ttft-tpot-tps",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "TTFT / TPOT / TPS 指标",
  "prompt": "评测大模型服务时 TTFT、TPOT、TPS 分别指什么？",
  "quickAnswer": "TTFT(Time To First Token)=从请求发出到首个 token 返回的延迟，反映 Prefill 速度；TPOT(Time Per Output Token)=相邻输出 token 的平均间隔，反映 Decode 速度；TPS(Tokens Per Second)=总 token/总耗时，综合吞吐。三者分别刻画首响、流畅度与吞吐。",
  "approach": "分相位测延迟：首响看 prefill，间隔看 decode，总量看吞吐。",
  "explanationFocus": "是什么：TTFT 首 token 延迟、TPOT 每 token 间隔、TPS 总吞吐，分别刻画 prefill/decode/整体。",
  "bruteForce": "只看平均端到端延迟：掩盖 prefill 与 decode 的不同瓶颈。",
  "derivation": [
    "为什么需要：用户感知由\"等多久出第一个字\"和\"出字流不流畅\"决定，单一延迟指标无法区分。",
    "怎么实现：在客户端记录首 token 到达时间算 TTFT；用相邻 token 时间戳均值算 TPOT；总 token 数除以总时长算 TPS。",
    "有什么代价：流式下要埋点每个 token 时间戳；不同 batch/并发下指标会变化，需固定负载条件对比。",
    "怎么评测：在固定并发与输入/输出长度下统计 p50/p95/p99 的 TTFT、TPOT、TPS。"
  ],
  "invariant": "端到端延迟 ≈ TTFT + (输出token数-1)*TPOT；TPS ≈ 输出token数/总耗时。",
  "walkthrough": "输出 100 token，TTFT=200ms，TPOT=20ms → 端到端≈200+99*20=2180ms，TPS≈100/2.18≈46 tok/s。",
  "edgeCases": [
    "极短输出：TPOT 样本少，统计不稳。",
    "流式中断/重试：时间戳需排除异常样本。",
    "并发升高：TTFT 受排队影响而上升。"
  ],
  "code": "# Python\ndef tps(tokens, start, end):\n    return (tokens - 1) / (end - start)        # tok/s (不含首token等待)\ndef ttft(first_ts, req_ts):\n    return first_ts - req_ts                     # 首token延迟",
  "codeNotes": [
    "TPS 常用 (n-1)/duration 避免把 prefill 算进 decode。",
    "流式埋点每个 token 时间戳。"
  ],
  "complexity": "O(样本数)；统计分位数即可。",
  "followUps": [
    {
      "question": "TTFT 高说明什么？",
      "answer": "通常是 Prefill 慢（输入长、batch 大、排队）或 KV/算力不足，与 decode 阶段无关。"
    },
    {
      "question": "TPS 和 TPOT 什么关系？",
      "answer": "TPS≈1/TPOT（单请求）；多并发下 TPS 指系统总产出，会高于单请求 TPOT 倒数。"
    }
  ],
  "followUpAnswers": [
    "TTFT 对应 prefill 瓶颈。",
    "TPOT 对应 decode 瓶颈。"
  ],
  "pitfalls": [
    "把 TTFT 算进 TPS 分母导致偏高。",
    "只看均值忽略长尾 p99。"
  ],
  "beginnerSummary": "点外卖：TTFT 是\"下单到出餐第一口\"等多久，TPOT 是\"每口之间的间隔\"顺不顺畅，TPS 是\"单位时间内总共吃到多少口\"。三个数字合起来才说清这顿饭吃得爽不爽。",
  "prerequisites": [
    "推理分 Prefill 与 Decode 两阶段。",
    "流式输出逐 token 返回。",
    "延迟与吞吐需分场景度量。"
  ],
  "workedExample": [
    "输出100 token, TTFT=200ms, TPOT=20ms → 端到端≈2.18s, TPS≈46。",
    "高并发下 TTFT 因排队升高，但 TPS(系统)可能更高。"
  ],
  "lineByLine": [
    "记录请求发出时间。",
    "记录首 token 到达→TTFT。",
    "记录每 token 间隔均值→TPOT。",
    "总 token/总时长→TPS。"
  ],
  "diagram": "TTFT: 请求 ──▶ 首token (prefill主导)\nTPOT: token_i ─▶ token_{i+1} (decode主导)\nTPS : 总token / 总耗时 (系统吞吐)"
};
