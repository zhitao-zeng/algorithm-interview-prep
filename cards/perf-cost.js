export default {
  "kind": "concept",
  "id": "perf-cost",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "成本评测（每千 token 成本）",
  "prompt": "如何评测算大模型服务的成本，常用哪些单位？",
  "quickAnswer": "成本评测把 GPU 小时价摊到产出上，常用\"每千输入/输出 token 成本\"或\"每百万 token 成本\"。计算=GPU单价×占用卡时 / 产出 token 数，再结合命中缓存、量化、批处理优化来降本。关键要区分输入与输出 token 单价(输出通常更贵)。",
  "approach": "以单卡小时成本除以该卡在单位时间产出的 token 数，得单位 token 成本；比较不同配置下的 cost/token。",
  "explanationFocus": "是什么：成本评测将算力支出折算为每千/百万 token 的价格，区分输入与输出单价，用于横向比价与优化。",
  "bruteForce": "只看吞吐不看单价：吞吐高但用了更贵的大卡，单位成本反而更高。",
  "derivation": [
    "为什么需要：成本决定商业模式，需把性能折算成\"花多少钱产一个 token\"。",
    "怎么实现：cost_per_1k = GPU每小时价×卡数×时长 / (产出token/1000)；分别计输入/输出。",
    "有什么代价：需准确归因显存占用时长与共享资源；缓存命中使输入token近乎免费。",
    "怎么评测：在固定负载下比较各框架/量化/批配置的单位成本。"
  ],
  "invariant": "单位成本 ∝ GPU单价×卡时 / 产出token；吞吐越高或卡越便宜，单位成本越低。",
  "walkthrough": "A100 $2/h，单卡 1 小时产出 300 万 token → 成本≈$2/3000千=$0.00067/千token。",
  "edgeCases": [
    "输入缓存命中使输入近乎零成本。",
    "空闲副本仍计费拉高成本。",
    "输出比输入贵数倍需分项。"
  ],
  "code": "# Python\ndef cost_per_1k(gpu_price_h, cards, hours, tokens):\n    return gpu_price_h * cards * hours / (tokens / 1000)\ndef cost_split(in_tok, out_tok, p_in, p_out):\n    return in_tok/1000*p_in + out_tok/1000*p_out",
  "codeNotes": [
    "输入/输出通常不同单价。",
    "缓存命中降低输入成本。"
  ],
  "complexity": "O(1) 折算。",
  "followUps": [
    {
      "question": "为什么输出 token 更贵？",
      "answer": "每输出 token 都要一次完整前向(访存密集)，且需逐字生成无法并行，单位算力成本高。"
    },
    {
      "question": "如何用成本反选配置？",
      "answer": "在 SLA 内选单位 token 成本最低的组合(量化+大batch+缓存+合适卡型)。"
    }
  ],
  "followUpAnswers": [
    "输出每token需完整前向且串行。",
    "SLA 内选最低单位成本配置。"
  ],
  "pitfalls": [
    "忽略输入/输出不同单价。",
    "不计空闲副本成本。"
  ],
  "beginnerSummary": "打车：成本评测像算\"每公里多少钱\"。但上车起步(输入)和每多开一公里(输出)单价不同，且车空着等客也算钱(空闲副本)。要选最划算的组合，不能只看\"跑得快\"。",
  "prerequisites": [
    "吞吐与 GPU 计费。",
    "输入/输出 token 区别。",
    "prefix cache 概念。"
  ],
  "workedExample": [
    "A100 $2/h 产出300万token → $0.00067/千。",
    "输入缓存命中降输入成本。"
  ],
  "lineByLine": [
    "取 GPU 小时单价。",
    "算卡时总成本。",
    "除以总产出 token。",
    "分项输入/输出单价。"
  ],
  "diagram": "成本 = GPU单价 × 卡时\n          ────────────────\n             产出 token 数\n  (输入/输出分项计价)"
};
