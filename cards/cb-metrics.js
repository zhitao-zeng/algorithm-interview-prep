export default {
  "kind": "concept",
  "id": "cb-metrics",
  "category": "Continuous Batching",
  "difficulty": "Easy",
  "title": "衡量 Continuous Batching 的收益",
  "prompt": "怎么衡量 Continuous Batching 带来的实际收益，看哪些指标？",
  "quickAnswer": "核心看四类：(1) 吞吐——有效 token/s 与请求/s；(2) 延迟——TTFT(首 token)、TPOT(每输出 token 间隔)、端到端平均与 P99；(3) GPU 利用率与气泡率；(4) 可达并发上限与排队延迟。连续批应在相同成本下显著提高吞吐、压低尾延迟、抬升并发。",
  "approach": "围绕吞吐、延迟、利用率、并发四个维度建指标。",
  "explanationFocus": "是什么：衡量收益就是用一组可比指标量化\"同样硬件成本下服务能力的提升\"，重点是有效吞吐与尾延迟。",
  "bruteForce": "只看平均延迟或只看峰值 TPS，单方面下结论。",
  "derivation": [
    "为什么需要：没有统一指标就无法判断调参/换实现是否真的更好，也容易用低载数据自我安慰。",
    "怎么实现：埋点记录每请求 arrival、first_token、finish 时间，聚合出 TTFT/TPOT/端到端分位数与 TPS；同时采 GPU util。",
    "有什么代价：埋点有轻微开销；多指标需综合权衡，不能单押一个。",
    "怎么评测：在多个 QPS 档位测上述指标，画曲线看饱和点与拐点。"
  ],
  "invariant": "在饱和区，连续批的有效 TPS 与 P99 应同时优于静态批。",
  "walkthrough": "QPS=16: TTFT 120ms, TPOT 18ms, TPS 2600, util 91%；对比静态批同点 TPS 900, util 55%。",
  "edgeCases": [
    "只看平均值掩盖长尾：必须看 P99/P999。",
    "低载下指标都好，看不出差异。",
    "吞吐高但 TTFT 爆炸：用户仍不满意。"
  ],
  "code": "# Python\ndef tail(latencies, p=99):\n    s = sorted(latencies)\n    return s[min(len(s)-1, int(len(s)*p/100))]  # P 分位延迟",
  "codeNotes": [
    "分位数比均值更能反映体验。",
    "TTFT/TPOT 分离定位瓶颈。"
  ],
  "complexity": "指标采集 O(请求数)；收益需在饱和区才显著。",
  "followUps": [
    {
      "question": "TTFT 和 TPOT 分别说明什么？",
      "answer": "TTFT 反映排队与 prefill 速度（受并发影响大），TPOT 反映 decode 步延迟（受 batch 规模影响大）。"
    },
    {
      "question": "为什么必须看 P99 不看均值？",
      "answer": "均值被大量短请求拉平，少数长尾请求才是用户体验痛点，连续批的价值恰恰在压长尾。"
    }
  ],
  "followUpAnswers": [
    "TTFT 排队+prefill, TPOT decode 步。",
    "长尾决定体验, 均值会掩盖。"
  ],
  "pitfalls": [
    "用低载数据声称\"无差异\"。",
    "只看吞吐忽略尾延迟。"
  ],
  "beginnerSummary": "评价一家餐厅不能只看\"平均上菜速度\"，还得看\"最慢那桌等多久\"(P99)和\"高峰期翻台率\"(吞吐)。连续批的强项就是把最慢那桌的等待压下来、翻台更快。",
  "prerequisites": [
    "吞吐与延迟是两大主轴。",
    "分位数反映长尾。",
    "GPU 利用率指示浪费。"
  ],
  "workedExample": [
    "同 QPS=16 测两组。",
    "连续批 TPS 2600/util91% vs 静态 900/55%。"
  ],
  "lineByLine": [
    "记录每请求关键时间戳。",
    "聚合 TTFT/TPOT/端到端。",
    "算 P 分位抓长尾。",
    "多 QPS 档位对比曲线。"
  ],
  "diagram": "指标: 吞吐↑ 延迟(P99)↓ 利用率↑ 并发↑"
};
