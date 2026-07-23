export default {
  "kind": "concept",
  "id": "perf-saturation-capacity",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "饱和度与容量规划",
  "prompt": "什么是系统饱和度，如何用它做 LLM 服务的容量规划？",
  "quickAnswer": "饱和度=资源实际使用量/可用上限(如 GPU 算力、显存、KV cache)。当延迟随负载近乎线性恶化、错误率上升时即达饱和点。容量规划就是在目标 QPS 与 SLA 下，由饱和点反推所需副本数并留余量(如 70% 水位)。",
  "approach": "阶梯加压找饱和拐点，按目标负载×安全系数反算副本数，设弹性扩缩容。",
  "explanationFocus": "是什么：饱和度衡量资源被占用的程度；容量规划依据饱和点与目标负载，确定需要多少实例并留出安全水位。",
  "bruteForce": "按峰值 QPS 直接堆机器：要么浪费要么在尖峰饱和，无数据支撑。",
  "derivation": [
    "为什么需要：资源有限，需知道一副本能扛多少、何时该扩容，避免过载与浪费。",
    "怎么实现：加压记录 QPS-延迟-错误率曲线，定位延迟陡升/错误出现的点即饱和点。",
    "有什么代价：要找到稳定饱和点需长时间压测；真实流量有突发，要留 buffer。",
    "怎么评测：在多副本下验证线性扩展比(near-linear scaling)，确认扩容有效。"
  ],
  "invariant": "在饱和点前延迟近似平稳；超过后延迟与错误率陡升；副本数 ≈ ceil(目标QPS / 单副本安全QPS)。",
  "walkthrough": "单副本安全 QPS=40(p99<1s)，目标 200 QPS → 需 5 副本，留 20% buffer 取 6 副本。",
  "edgeCases": [
    "突发尖峰瞬时超饱和。",
    "多副本负载不均。",
    "扩容后 KV/显存成新瓶颈而非算力。"
  ],
  "code": "# Python\ndef replicas(target_qps, safe_qps, buffer=0.2):\n    return math.ceil(target_qps / (safe_qps * (1 - buffer)))\ndef saturation(used, total):\n    return used / total                        # 0..1",
  "codeNotes": [
    "安全水位常取 60~70%。",
    "验证扩缩容线性度。"
  ],
  "complexity": "O(压测点) 拟合拐点。",
  "followUps": [
    {
      "question": "饱和点和拐点一样吗？",
      "answer": "常近似同义：拐点即延迟/错误开始陡升处，即资源饱和、边际收益骤降的点。"
    },
    {
      "question": "为什么不能 100% 利用？",
      "answer": "要吸收突发、给 GC/调度留余量，且非线性的尾部延迟在高位爆炸式增长。"
    }
  ],
  "followUpAnswers": [
    "饱和点≈延迟拐点。",
    "留余量吸收突发与尾延迟。"
  ],
  "pitfalls": [
    "把瞬时峰值当可持续容量。",
    "忽略多副本负载不均。"
  ],
  "beginnerSummary": "电梯：一部电梯满载(饱和)后，再挤人门就关不上、大家更慢。容量规划就是算\"高峰期要几部电梯\"，并永远多留一部应对突然涌入的人，别把每部都塞到满。",
  "prerequisites": [
    "吞吐-延迟权衡。",
    "QPS 与并发概念。",
    "弹性扩缩容。"
  ],
  "workedExample": [
    "单副本安全QPS=40 → 200 QPS 需 6 副本(含buffer)。",
    "扩到 4 副本验证近线性。"
  ],
  "lineByLine": [
    "阶梯加压测饱和点。",
    "记录延迟/错误率拐点。",
    "按目标负载反算副本。",
    "留 buffer 并验证扩展比。"
  ],
  "diagram": "延迟\n  │        ╱← 饱和拐点\n  │      ╱\n  │    ╱\n  └──────── 负载(QPS)"
};
