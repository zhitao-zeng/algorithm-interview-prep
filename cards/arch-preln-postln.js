export default {
  "kind": "concept",
  "id": "arch-preln-postln",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "Pre-LN 与 Post-LN 对比",
  "prompt": "Pre-LN 和 Post-LN 在训练稳定性和梯度路径上有什么差别？",
  "quickAnswer": "Pre-LN 先归一化再做子层、残差路径不被归一化，梯度更稳，可训练更深；Post-LN 反之易在深层发散。",
  "approach": "对比两种残差块的归一化位置：Pre-LN 为 x+Sub(Norm(x))，Post-LN 为 Norm(x+Sub(x))。",
  "explanationFocus": "是什么：Pre-LN（前置归一化）在注意力/FFN 子层之前对输入做归一化，残差直接加回未归一化的输入；Post-LN（后置归一化）是原始 Transformer 做法，在残差相加之后再归一化。",
  "bruteForce": "原始 Transformer 用 Post-LN，需要精心学习率 warmup 才能在深层稳定，否则梯度爆炸/消失。",
  "derivation": [
    "为什么需要：深层堆叠时若不做归一化，激活/梯度幅值会逐层漂移导致不可训练。",
    "怎么实现：Pre-LN→ x = x + Sub(Norm(x))；Post-LN→ x = Norm(x + Sub(x))。",
    "有什么代价：Post-LN 在 >12~24 层时常需 warmup 且深层易不稳；Pre-LN 残差路径「干净」，梯度经恒等路径回传，无需复杂 warmup。",
    "怎么评测：对比同深度下无 warmup 的训练曲线与最终困惑度；现代 LLM 全用 Pre-LN。"
  ],
  "invariant": "不变量：Pre-LN 的残差流保持恒等直通，梯度方差不随深度被归一化压缩——这是它能训百层的关键。",
  "walkthrough": "12 层以内 Post-LN 还能靠 warmup 训练；但 32 层如 LLaMA 用 Post-LN 会发散，换成 Pre-LN 后稳定收敛且无需激进 warmup。",
  "edgeCases": [
    "Post-LN 并非不可用，浅层+warmup 仍可。",
    "Pre-LN 有时最终质量略逊 Post-LN（同设置下），但稳定优势压倒。",
    "归一化对象（RMSNorm vs LayerNorm）与前后置是正交选择。"
  ],
  "code": "def block(x, sub, norm, pre_ln=True):\n    if pre_ln:\n        return x + sub(norm(x))      # 前置归一化\n    return norm(x + sub(x))          # 后置归一化",
  "codeNotes": [
    "sub 可为注意力或 FFN；norm 可为 LayerNorm/RMSNorm。"
  ],
  "complexity": "两种方案每层计算量相同 O(N·d² + N²·d)；差别在数值稳定性而非复杂度。",
  "followUps": [
    {
      "question": "Pre-LN 会不会让特征不被归一化？",
      "answer": "残差流本身不归一化，但每个子层输入都被归一化，子层输出以「归一化后的增量」加回，整体尺度仍受控。"
    },
    {
      "question": "为什么原始 Transformer 用 Post-LN 也能训？",
      "answer": "原始模型仅 6 层且用 warmup，层数浅、warmup 充分时 Post-LN 仍可稳定。"
    }
  ],
  "followUpAnswers": [
    "残差流不归一化，但子层输入被归一化，输出作为受控增量加回，整体尺度仍稳定。",
    "原始模型仅 6 层且配 warmup，浅层+充分 warmup 时 Post-LN 仍可训练。"
  ],
  "pitfalls": [
    "把 Pre/Post 与 LayerNorm/RMSNorm 混为一谈——二者正交。",
    "误以为 Post-LN 一定更差，它只是需要更多训练技巧。"
  ],
  "beginnerSummary": "Pre-LN 像先「整理桌面」再干活，残差那条捷径始终保持畅通；Post-LN 则干完活再整理，深层时捷径被「整理」卡住导致梯度不稳。",
  "prerequisites": [
    "残差连接",
    "层归一化",
    "梯度消失/爆炸"
  ],
  "workedExample": [
    "Pre-LN: 输入先 Norm 再过 Attention，结果加回原输入。",
    "Post-LN: 输入过 Attention 加回原输入后再 Norm。"
  ],
  "lineByLine": [
    "pre_ln 分支：先 norm(x) 再 sub，最后残差加。",
    "非 pre_ln 分支：先 sub(x) 残差加，再整体 norm。",
    "两者仅顺序不同，但梯度路径差异巨大。"
  ],
  "diagram": "Pre:  x -> Norm -> Sub ->+ x -> out\nPost: x -> Sub ->+ x -> Norm -> out"
};
