export default {
  "kind": "concept",
  "id": "perf-sla",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "SLA 定义与达标率",
  "prompt": "什么是 LLM 服务的 SLA，怎么计算达标率(success/meet rate)？",
  "quickAnswer": "SLA 是对用户的量化承诺，如\"p95 TTFT<800ms 且可用性 99.9%\"。达标率=满足所有约束的请求数/总请求数。评测要同时统计延迟达标率与错误率，二者都达标才算 SLA 通过。",
  "approach": "把 SLA 拆成可测阈值(延迟分位、错误率、吞吐)，压测/监控中统计每项的达标比例。",
  "explanationFocus": "是什么：SLA 是用分位延迟、错误率、可用性等阈值表达的承诺；达标率=达标的请求占比，衡量承诺被履行的程度。",
  "bruteForce": "只保证\"平均达标\"：均值过关但长尾超时被大量用户感知为不可用。",
  "derivation": [
    "为什么需要：SLA 是商务与稳定性契约，需可度量、可追责。",
    "怎么实现：定义阈值(如 p99<1s, 错误率<0.1%)，逐请求判定是否达标再求比例。",
    "有什么代价：阈值设太严成本飙升，太松无意义，需结合用户容忍度。",
    "怎么评测：在目标负载下跑，报告各指标达标率与综合达标率。"
  ],
  "invariant": "综合达标率 = 各约束均达标请求数 / 总请求数；任一项违约即该请求不达标。",
  "walkthrough": "压测 10 万请求，p99 TTFT=0.9s(达标)，错误率0.05%(达标) → 综合达标率 99.2%。",
  "edgeCases": [
    "超时算错误还是仅延迟违约。",
    "部分完成(截断)是否达标。",
    "不同接口 SLA 不同需分别统计。"
  ],
  "code": "# Python\ndef meet_rate(reqs, pred):\n    return sum(1 for r in reqs if pred(r)) / len(reqs)\ndef sla_ok(r, ttft_lim, err_lim):\n    return r.ttft <= ttft_lim and r.err <= err_lim",
  "codeNotes": [
    "延迟与错误需分别且同时达标。",
    "阈值需结合业务容忍度设定。"
  ],
  "complexity": "O(请求数) 判定。",
  "followUps": [
    {
      "question": "SLA 和 SLO 区别？",
      "answer": "SLO 是内部目标(如 p99<900ms)，SLA 是对外的带赔偿承诺，通常 SLA 阈值比 SLO 宽松。"
    },
    {
      "question": "达标率 99% 够吗？",
      "answer": "看基数：10 万请求中 1% 违约即 1000 次失败，对用户量大的服务仍显著，需结合绝对量。"
    }
  ],
  "followUpAnswers": [
    "SLO 内部目标，SLA 对外承诺。",
    "看绝对失败量而非仅比例。"
  ],
  "pitfalls": [
    "只看均值忽略违约长尾。",
    "混淆延迟违约与错误。"
  ],
  "beginnerSummary": "快递承诺：SLA 像\"99% 的包裹 24 小时内送达\"。达标率就是真有百分之几准时了。平均 20 小时送达听起来好，但若有 5% 拖了一周，那些倒霉用户照样投诉——所以看\"违约比例\"而非平均。",
  "prerequisites": [
    "分位数概念。",
    "错误率与可用性。",
    "阈值判定。"
  ],
  "workedExample": [
    "10万请求 p99=0.9s, 错误0.05% → 达标率99.2%。",
    "SLA 阈值比内部 SLO 宽松。"
  ],
  "lineByLine": [
    "定义 SLA 阈值。",
    "逐请求判定达标。",
    "求达标比例。",
    "综合多约束给出总达标率。"
  ],
  "diagram": "SLA: p99<800ms & 错误<0.1%\n  └─▶ 达标率 = 合规请求 / 总请求"
};
