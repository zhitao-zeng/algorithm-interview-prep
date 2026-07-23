export default {
  "kind": "concept",
  "id": "perf-throughput-vs-latency",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "吞吐（throughput）与延迟（latency）的区别",
  "prompt": "大模型服务里吞吐和延迟有什么本质区别，为何常互相矛盾？",
  "quickAnswer": "延迟是单个请求从发起到完成的时间（体验面），吞吐是单位时间系统处理的总 token 数或请求数（效率面）。提高批大小能抬升吞吐却往往增加单请求延迟，二者呈权衡关系，需按场景取舍。",
  "approach": "把延迟当\"单客体验\"、吞吐当\"全店效率\"，用批处理在两者之间找平衡点。",
  "explanationFocus": "是什么：延迟=单请求完成耗时(越小越好)，吞吐=系统单位时间产出(越大越好)，二者常因批处理而此消彼长。",
  "bruteForce": "只优化平均延迟：可能在低并发下很爽，但高并发时吞吐不够、整体崩。",
  "derivation": [
    "为什么需要：用户关心自己快不快(延迟)，老板关心能服务多少人(吞吐)，指标不同决策不同。",
    "怎么实现：延迟用单请求端到端耗时；吞吐用 总输出token / 总时长 或 总请求数 / 总时长。",
    "有什么代价：批处理提升吞吐却拉长排队与每请求耗时，需控制 batch 上限。",
    "怎么评测：在同一负载下同时画延迟-吞吐曲线，找拐点(Sweet Spot)。"
  ],
  "invariant": "在固定资源下，提升吞吐通常以提高单请求延迟为代价；二者曲线在某 batch 处出现拐点。",
  "walkthrough": "batch=1 时单请求延迟 50ms 但吞吐 20 tok/s；batch=32 时延迟 180ms 但吞吐 600 tok/s，拐点约在 batch=8。",
  "edgeCases": [
    "延迟用均值会掩盖排队长尾。",
    "吞吐按 token 与按请求计数口径不同。",
    "突发流量下吞吐未变但延迟飙升。"
  ],
  "code": "# Python\ndef latency(req_sent, req_done):\n    return req_done - req_sent\ndef throughput(tokens, duration):\n    return tokens / duration                # tok/s",
  "codeNotes": [
    "吞吐与延迟口径要一致(都按 token 或都按请求)。",
    "看曲线拐点而非单一值。"
  ],
  "complexity": "O(样本数) 统计。",
  "followUps": [
    {
      "question": "什么时候更看重延迟？",
      "answer": "对话/Copilot 等交互场景，用户等不及；延迟优先于吞吐。"
    },
    {
      "question": "什么时候更看重吞吐？",
      "answer": "离线批量摘要/抽取，不急但量大，追求单位成本产出最大化。"
    }
  ],
  "followUpAnswers": [
    "交互场景优先延迟。",
    "批量场景优先吞吐。"
  ],
  "pitfalls": [
    "混淆 token 吞吐与请求吞吐。",
    "只看延迟不顾吞吐导致扩容不足。"
  ],
  "beginnerSummary": "奶茶店：延迟是你从点单到拿到奶茶的时间；吞吐是一小时店里总共做多少杯。让店员一次做 10 杯(大单)能提升吞吐，但排在后面的人拿到奶茶更慢(延迟上升)。",
  "prerequisites": [
    "批处理(Batching)可并行计算。",
    "GPU 擅长并行而非串行的单请求。",
    "延迟与吞吐是两个独立关注面。"
  ],
  "workedExample": [
    "batch=1: 延迟50ms, 吞吐20；batch=32: 延迟180ms, 吞吐600。",
    "交互场景选低延迟档，批量场景选高吞吐档。"
  ],
  "lineByLine": [
    "定义延迟=单请求耗时。",
    "定义吞吐=总产出/总时长。",
    "扫不同 batch 测两者。",
    "画曲线找拐点取舍。"
  ],
  "diagram": "延迟↓       吞吐↑\n  \\      /\n   \\    /\n    \\  /  ← 拐点\n     \\/\n   大batch"
};
