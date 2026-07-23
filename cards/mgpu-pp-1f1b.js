export default {
  "kind": "concept",
  "id": "mgpu-pp-1f1b",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "PP 的 micro-batch 调度 1F1B",
  "prompt": "1F1B 调度是如何缓解流水线气泡的？",
  "quickAnswer": "1F1B(一次前向一次反向)在流水填满后，每完成一个 micro-batch 的前向就立刻安排它的反向，使反向尽早回灌流水线，把 GPipe 的大块气泡拆成细碎小块，显著降低空闲。它需维护固定数量的\"在飞\"micro-batch 以限制显存，并配合梯度累加，是 Megatron/DeepSpeed 的默认 PP 调度。",
  "approach": "填满阶段后交替执行 1F1B，尽早启动反向压缩气泡。",
  "explanationFocus": "是什么：1F1B 是流水线并行的一种调度，流水稳定后每做一次前向就紧接着做一次反向，让反向尽早进入流水线，从而把连续大气泡切成分散小气泡。",
  "bruteForce": "GPipe 先全前向再全反向 → 大三角气泡，利用率低。",
  "derivation": [
    "为什么需要：GPipe 等全部前向完再反向，首段在后期长时间空闲；需要让反向尽早开始以填充空闲。",
    "怎么实现：先 warmup 做若干纯前向填满管道，之后对每个已完成前向的 micro-batch 立即做其反向(1F1B)，最后 cooldown 收尾反向；在飞数固定以控显存。",
    "有什么代价：实现更复杂(需调度状态机)、需梯度累加与显存上限管理；但气泡远低于 GPipe。",
    "怎么评测：气泡占比下降、设备利用率提升、显存峰值是否可控。"
  ],
  "invariant": "总的前向/反向次数与 GPipe 相同，数值等价，只是执行顺序交错。",
  "walkthrough": "P=4、在飞=4：warmup 4 个前向后进入 1F1B，反向紧随前向，气泡从 43% 降到约 14%。",
  "edgeCases": [
    "在飞 micro-batch 数须 ≥ P 才能持续流水。",
    "梯度需按 micro-batch 累加后再更新。",
    "异常/中断时状态恢复更复杂。"
  ],
  "code": "# Python (概念)\ndef schedule_1f1b(stages, micro_batches, P):\n    inflight = []\n    for mb in micro_batches:                 # warmup + steady\n        fwd = forward(stages, mb); inflight.append(fwd)\n        if len(inflight) >= P:\n            bwd = backward(inflight.pop(0))  # 尽早反向\n    while inflight: backward(inflight.pop(0))",
  "codeNotes": [
    "稳态保持 P 个在飞 micro-batch。",
    "warmup 填满后转 1F1B。"
  ],
  "complexity": "气泡 ≈ (P-1)/(m) 量级(小于 GPipe)；显存受在飞数限制。",
  "followUps": [
    {
      "question": "1F1B 和 GPipe 气泡差多少？",
      "answer": "GPipe 气泡 (P-1)/(m+P-1)，1F1B 约为 (P-1)/m，当 m≫P 时明显更小，设备利用率更高。"
    },
    {
      "question": "为什么 1F1B 要限制\"在飞\"数？",
      "answer": "因为在飞 micro-batch 会同时占用各 stage 激活显存，不限数会 OOM，固定窗口可在气泡与显存间取平衡。"
    }
  ],
  "followUpAnswers": [
    "1F1B 气泡约 (P-1)/m，更小。",
    "限制在飞数防止激活 OOM。"
  ],
  "pitfalls": [
    "以为 1F1B 改变计算量——只改顺序。",
    "忘记梯度累加导致更新错误。"
  ],
  "beginnerSummary": "原本等所有零件都走到末尾才统一返工(GPipe)，前面的人闲很久。1F1B 改成：只要手头一个零件走完一步，立刻让它回头返工一步，这样返工的人早早进场，大家几乎一直在忙，空等少多了——只是得记住同时摊着的零件别太多以免桌子放不下。",
  "prerequisites": [
    "理解 bubble 成因。",
    "知道梯度累加。",
    "了解 micro-batch 概念。"
  ],
  "workedExample": [
    "P=4、在飞=4，warmup 后转 1F1B。",
    "气泡从 ~43% 降到 ~14%。"
  ],
  "lineByLine": [
    "warmup 阶段做若干纯前向。",
    "管道填满后进入稳态。",
    "每完成一个前向立即做其反向。",
    "cooldown 收尾剩余反向。"
  ],
  "diagram": "GPipe:  FFFF|BBBB  (大块气泡)\n1F1B:  FFFB FBFB FBFB B  (气泡切碎)\n       ↑ warmup   ↑ steady 1F1B"
};
