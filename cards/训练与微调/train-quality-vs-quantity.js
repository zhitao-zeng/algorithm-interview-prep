export default {
  "kind": "concept",
  "id": "train-quality-vs-quantity",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "数据质量 vs 数据数量（Chinchilla 启示与 data-constrained regime）",
  "prompt": "训练数据质量和数量应如何权衡，尤其在数据受限时？",
  "quickAnswer": "Chinchilla 假设无限高质量数据；现实进入 data-constrained regime 时，质量（去重/过滤/合成）比单纯堆量更重要，可多 epoch 但需配合课程。",
  "approach": "在高质量数据耗尽前按 Chinchilla 比例用足；受限时优先提升质量（过滤、去重、合成增强），并谨慎多 epoch 而非无脑加量。",
  "explanationFocus": "是什么：数据质量 vs 数量讨论在固定算力下『更干净少数据』还是『更多含噪数据』更优；Chinchilla 假定无限干净数据（质量恒定），但前沿已进入 data-constrained regime——高质量语料见底，此时质量工程（过滤/合成）成为主矛盾。",
  "bruteForce": "不顾质量猛加原始网页并多 epoch，导致模型记住噪声、基准污染、收益递减甚至退化。",
  "derivation": [
    "为什么需要：高质量公开文本约 1-3T token，而 Chinchilla 最优需更多，数据成瓶颈。",
    "怎么实现：强过滤+去重提质量；用合成数据/重写扩量；data-constrained 下可控多 epoch 并降 LR。",
    "有什么代价：合成数据可能带入模型自身偏见（模型坍缩）；多 epoch 易过拟合需早停与重采样。",
    "怎么评测：对比『高质量少 epoch』vs『低质量多 epoch』在基准与困惑度上的差异。"
  ],
  "invariant": "质量优先，数量在质量边界内扩展；多 epoch 是数据受限时的无奈之选（建议二次核对前沿模型实际 epoch 数）。",
  "walkthrough": "Phi 系列用『教科书级合成数据』以远少于 LLaMA 的 token 达到强性能，说明高质量可弥补数量不足。",
  "edgeCases": [
    "纯合成数据导致模型坍缩/偏见循环",
    "多 epoch 超过某阈值收益转负",
    "过滤过严反而数据不足"
  ],
  "code": "def effective_epochs(total_tokens, unique_tokens):\n    return total_tokens / unique_tokens",
  "codeNotes": [
    "unique_tokens 为去重后规模",
    "effective_epochs>1 即重复训练"
  ],
  "complexity": "O(1) 估算；质量过滤另计。",
  "followUps": [
    {
      "question": "数据受限时该多 epoch 还是合成数据？",
      "answer": "优先用高质量合成/重写扩量并谨慎多 epoch；纯多 epoch 易记忆，纯合成易坍缩，宜混合。"
    },
    {
      "question": "Chinchilla 在 data-constrained 下还成立吗？",
      "answer": "其比例仍为参考，但受数据上限被迫偏离，需靠质量工程逼近最优。"
    }
  ],
  "followUpAnswers": [
    "优先用高质量合成/重写扩量并谨慎多 epoch；纯多 epoch 易记忆，纯合成易坍缩，宜混合。",
    "其比例仍为参考，但受数据上限被迫偏离，需靠质量工程逼近最优。"
  ],
  "pitfalls": [
    "迷信数量忽视过滤",
    "过度依赖合成数据引发模型坍缩"
  ],
  "beginnerSummary": "数据像教材：100 本烂书不如 10 本精读；Chinchilla 假设好教材无限，现实中好教材不够时，要先『编好教材』（质量）再考虑『多读几遍』（多 epoch）。",
  "prerequisites": [
    "Chinchilla 规律",
    "数据去重与过滤",
    "合成数据风险"
  ],
  "workedExample": [
    "unique=1T，训练用 3T token → 有效 3 epoch",
    "Phi 用合成教科书以 0.3T 抵 1T 网页效果"
  ],
  "lineByLine": [
    "def effective_epochs(...): 算有效轮数",
    "total/unique 即重复遍数",
    ">1 表示数据被复用"
  ],
  "diagram": "质量 ↑ ──优先\n数量 ↑ ──质量边界内"
};
