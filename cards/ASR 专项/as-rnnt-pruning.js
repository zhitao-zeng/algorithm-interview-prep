export default {
  "id": "as-rnnt-pruning",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "RNN-T 剪枝",
  "prompt": "RNN-T 的联合网络与词汇输出很大，推理时有哪些剪枝手段能在不明显掉点的情况下加速？",
  "quickAnswer": "主要在解码 beam 内做 top-k 剪枝：对联合网络输出 vocab 取 top-k、对预测网络历史做 beam 截断，并用前缀共享（label-synchronous）避免重复计算；也可对声学隐状态做帧级丢弃。",
  "approach": "在每帧对联合网络 logits 取 top-k 候选词，beam 仅保留得分前 B 的假设；用前缀束搜索共享相同前缀的历史、只展开差异 token；预测网络可缓存并量化，联合网络可用小矩阵近似。",
  "explanationFocus": "是什么：RNN-T 剪枝是在不重训或仅轻量微调的前提下，削减解码时的候选规模与计算量，使联合网络与词汇输出在流式推理中保持低延迟。",
  "bruteForce": "朴素解码每帧对全部 V 个词算联合网络并保留全部历史，复杂度 O(T·V·B)，在大词表上不可承受。",
  "invariant": "剪枝后保留的 beam 中必须仍包含最终最优路径（或近似最优），即被丢弃的候选分数须严格低于保留阈值。",
  "walkthrough": "逐帧取声学隐状态 → 联合网络对所有 beam 历史算 score → 对 vocab 取 top-k → 与预测网络拼接得新假设 → 按总分保留前 B → 帧末压缩相同前缀共享状态。",
  "complexity": "剪枝后复杂度约 O(T·k·B)（k≪V），配合前缀共享进一步降到接近 O(T·B)；精度随 k、B 减小而缓降。",
  "beginnerSummary": "RNN-T 剪枝像“提前淘汰没希望的候选”：每一步只留分数最高的几个词和几条历史，既快又几乎不丢准确率。",
  "diagram": "full vocab (V)\n   |\ntop-k prune (beam)\n   |\njoint network\n   |\nkept hypotheses",
  "code": "import torch\n\ndef rnnt_prune(logits, beam=4):\n    topk = torch.topk(logits, beam, dim=-1)\n    return topk.indices",
  "derivation": [
    "为什么需要：RNN-T 词表常达数千到数万，逐帧全词表联合计算在流式场景算力与延迟不可接受。",
    "怎么实现：解码时对联合网络输出做 top-k 词剪枝、beam 截断，并用前缀束搜索共享历史状态，预测网络量化/缓存。",
    "有什么代价：k 或 B 过小会丢真值路径导致 WER 上升；共享状态实现复杂，需正确处理 blank 与非 blank 分支。",
    "怎么评测：在测试集测 WER 随 k、B 的变化，并对比 RTF/解码耗时，取满足延迟预算的最小配置。"
  ],
  "edgeCases": [
    "罕见词被剪掉：专业术语在 top-k 外导致漏识。",
    "blank 分支：剪枝不能误删 blank，否则对齐崩溃。",
    "beam 过小：长句搜索空间不足、过早收敛到次优。",
    "动态 k：按置信度自适应 k 可能增加实现分支。"
  ],
  "pitfalls": [
    "对所有 beam 历史重复算联合网络而不共享，浪费大量算力。",
    "剪枝阈值固定，未考虑静音帧与语音帧的差异，静音时仍全量计算。"
  ],
  "prerequisites": [
    "RNN-T 联合网络与预测网络结构",
    "Beam Search 与 top-k 操作"
  ],
  "workedExample": [
    "V=4096、k=64、B=8 时相比全词表解码 RTF 从 1.8 降到 0.3，WER 仅升 0.1%。",
    "用前缀束搜索共享 “你” 开头的历史，重复联合计算减少约 40%。"
  ],
  "lineByLine": [
    "logits：联合网络输出的 T×V（或本帧 beam×V）分数张量，含全部词表。",
    "torch.topk(logits, beam, dim=-1)：在词表维取分数最高的 beam 个候选。",
    "return topk.indices：返回被保留候选的词索引供后续展开。"
  ],
  "codeNotes": [
    "真实解码还需对 blank 单独保留，并对 beam 历史做前缀压缩以免重复计算。"
  ],
  "followUps": [
    {
      "question": "RNN-T 剪枝与模型量化能否叠加？",
      "answer": "可以，剪枝减候选数、量化减单次计算精度，二者正交；量化后需注意 top-k 数值稳定性。"
    },
    {
      "question": "align 与 prune 冲突吗？",
      "answer": "不冲突，剪枝只限制候选规模，对齐由 blank 机制保证，只要保留 blank 分支即可。"
    }
  ],
  "followUpAnswers": [
    "可以，剪枝减候选数、量化减单次计算精度，二者正交；量化后需注意 top-k 数值稳定性。",
    "不冲突，剪枝只限制候选规模，对齐由 blank 机制保证，只要保留 blank 分支即可。"
  ],
  "kind": "code"
};
