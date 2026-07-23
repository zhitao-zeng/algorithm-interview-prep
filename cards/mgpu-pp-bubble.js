export default {
  "kind": "concept",
  "id": "mgpu-pp-bubble",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "PP 的气泡 bubble 问题",
  "prompt": "流水线并行中的 bubble（气泡）是什么，怎么产生的？",
  "quickAnswer": "bubble 是流水线中某些 stage 因等待前驱前向结果或后继反向信号而空转的时间。朴素 GPipe 先填后排会留出大量空档；气泡占比约为 (P-1)/(m+P-1)(m 为 micro-batch 数、P 为 stage 数)，m 越小、P 越大气泡越严重，直接拉低设备利用率与扩展效率。",
  "approach": "用更多 micro-batch 和 1F1B 调度填充空闲，降低气泡占比。",
  "explanationFocus": "是什么：bubble 是流水线并行里设备因等待数据/梯度而在一段时间内无事可做的空转，源于前向必须先流完才能开始反向。",
  "bruteForce": "stage 少、micro-batch 少 → 大量气泡，设备空转。",
  "derivation": [
    "为什么需要：PP 把模型切段后，第一个 stage 算完才能传给下一个，反向也要从末段往回传，导致两端 stage 在流水未填满时空等。",
    "怎么实现：GPipe 先让所有 micro-batch 走完前向再统一反向，留下三角形空闲；1F1B 让反向尽早插入，压缩气泡。",
    "有什么代价：气泡时间不产出有效计算，设备利用率 = 1 - (P-1)/(m+P-1)，浪费算力与电费。",
    "怎么评测：气泡占比、设备利用率、随 P 的扩展效率衰减。"
  ],
  "invariant": "无论调度如何，总计算量不变；bubble 只影响时间重叠，不影响数值结果。",
  "walkthrough": "P=4、m=4：气泡占比 ≈ (4-1)/(4+4-1)=3/7≈43%，近半数时间空转。",
  "edgeCases": [
    "micro-batch 数 m 必须 ≥ P 才能较好填充。",
    "各 stage 计算量不均会放大有效气泡。",
    "反向通信也会与计算争带宽。"
  ],
  "code": "# Python (概念)\ndef bubble_ratio(P, m):\n    return (P - 1) / (m + P - 1)   # GPipe 朴素气泡占比",
  "codeNotes": [
    "m 越大气泡占比越小。",
    "1F1B 可进一步压低该比值。"
  ],
  "complexity": "气泡占比 ≈ (P-1)/(m+P-1)；利用率 = 1 - 该值。",
  "followUps": [
    {
      "question": "怎么减小 bubble？",
      "answer": "增加 micro-batch 数 m、采用 1F1B 让反向尽早启动、均衡各 stage 计算量，以及减少 stage 数 P。"
    },
    {
      "question": "bubble 和实际加速比关系？",
      "answer": "加速比 ≈ P × 设备利用率 = P×(1 - bubble)，气泡越大实际并行收益越偏离线性 P 倍。"
    }
  ],
  "followUpAnswers": [
    "增 m、用 1F1B、均衡 stage。",
    "加速比≈P×(1-bubble)。"
  ],
  "pitfalls": [
    "只看 stage 数忽略 micro-batch 对气泡的影响。",
    "以为 PP 能线性加速——气泡吃掉收益。"
  ],
  "beginnerSummary": "装配线上如果上游零件还没送到，下游工人就只能干等着搓手(bubble)。要是只给流水线很少的零件(micro-batch 少)、又分了很多工序(stage 多)，大部分人时间都在等，白白闲置。",
  "prerequisites": [
    "理解 PP 按层切段。",
    "知道前向必须先于反向。",
    "micro-batch 概念。"
  ],
  "workedExample": [
    "P=4 个 stage、m=4 个 micro-batch。",
    "气泡占比 ≈ 3/7 ≈ 43%。"
  ],
  "lineByLine": [
    "模型切成 P 个 stage。",
    "前向需逐级传递激活。",
    "反向需逐级回传梯度。",
    "两端等待形成空转气泡。"
  ],
  "diagram": "时间→\n卡0: ████░░░░░░   (先忙后等)\n卡1:  ████░░░░░░\n卡2:   ████░░░░░\n卡3:    ████░░░░  ← 三角空白=bubble"
};
