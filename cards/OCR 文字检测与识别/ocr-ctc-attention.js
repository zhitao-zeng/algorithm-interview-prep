export default {
  "id": "ocr-ctc-attention",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "CTC 与 Attention 解码对比",
  "prompt": "在文本识别中，CTC 与 Attention 两种解码方式各有什么优缺点，如何根据场景选择？",
  "quickAnswer": "CTC 无需对齐、并行输出、推理快且易部署，但假设时间步条件独立、对强上下文弱；Attention 用对齐建模全局依赖、精度高，但自回归慢且易注意力漂移。",
  "code": "import torch\nimport torch.nn.functional as F\n\ndef ctc_decode(logits, blank=0):\n    \"\"\"贪心 CTC 解码：去 blank + 去相邻重复\"\"\"\n    pred = logits.argmax(-1)            # (T,)\n    out = []\n    for t in pred:\n        if t != blank and (not out or t != out[-1]):\n            out.append(int(t))\n    return out\n\ndef attention_step(decoder, emb_t, enc_feat, hidden):\n    \"\"\"单步注意力解码，计算上下文向量\"\"\"\n    attn = F.softmax((enc_feat @ hidden[-1]) / (enc_feat.size(-1) ** 0.5), dim=0)\n    ctx = (attn.unsqueeze(-1) * enc_feat).sum(0)\n    return decoder(emb_t, ctx, hidden)\n",
  "complexity": "CTC 时间 O(T)，空间 O(T)；Attention 时间 O(T²)（训练）/O(T·d)（推理），空间 O(T)",
  "beginnerSummary": "CTC 像“一眼扫过去直接念”，快但容易把连着的相同字读成一个；Attention 像“边指边读”，更准但要点名字、慢一点。",
  "derivation": [
    "为什么需要：识别标签是字符序列，但图像特征是无对齐的时间步，需要一种从特征到序列的映射策略。",
    "怎么实现：CTC 引入 blank 并允许任意对齐路径、用动态规划求和概率；Attention 在解码每步计算特征上的软对齐权重再生成字符。",
    "有什么代价：CTC 忽略时间步间依赖，难以处理需要强语言模型约束的文本；Attention 推理串行、长序列易注意力逃逸到错误位置。",
    "怎么评测：在通用基准上对比字准确率与 NED，并统计 Attention 的漏字/重复率以判断是否漂移。"
  ],
  "edgeCases": [
    "连续重复字符('OO'、'll')",
    "解码到句末注意力仍未归位",
    "CTC 路径数爆炸的长序列",
    "低质量模糊导致注意力发散"
  ],
  "pitfalls": [
    "CTC 未去重导致重复字符",
    "Attention 训练用 teacher forcing 推理分布偏移(exposure bias)",
    "二者 max length 设置不一致"
  ],
  "prerequisites": [
    "CTC 损失原理",
    "注意力机制",
    "动态规划(前向算法)"
  ],
  "workedExample": [
    "logits 贪心得 [1,1,0,2,2]（blank=0）→ CTC 去重去 blank → [1,2] 即 'AB'。",
    "Attention 解码 'apple' 时第3步注意力意外跳到第1个像素导致重复 'appple'，需用 coverage 惩罚修正。"
  ],
  "lineByLine": [
    "def ctc_decode(logits, blank): CTC 贪心解码入口。",
    "logits.argmax(-1): 取每时间步最可能字符。",
    "if t!=blank and ...: 跳过 blank 并抑制相邻重复。",
    "def attention_step: 计算注意力权重并聚合上下文送解码器。"
  ],
  "followUps": [
    {
      "question": "如何缓解 Attention 的注意力漂移？",
      "answer": "加入 coverage 机制累计历史注意力、用单调注意力约束，或采用 Transformer 的局部/稀疏注意力，并在训练时对齐标签做 guided attention。"
    },
    {
      "question": "工业部署为何常优先 CTC？",
      "answer": "CTC 可整行并行解码、无需自回归、延迟低，配合轻量 backbone 易落地到端侧，且对规整打印体足够鲁棒。"
    }
  ],
  "followUpAnswers": [
    "加入 coverage 机制累计历史注意力、用单调注意力约束，或采用 Transformer 的局部/稀疏注意力，并在训练时对齐标签做 guided attention。",
    "CTC 可整行并行解码、无需自回归、延迟低，配合轻量 backbone 易落地到端侧，且对规整打印体足够鲁棒。"
  ],
  "invariant": "ctc_decode 维护 out 为非空且相邻不重复的字符下标序列；注意力权重 attn 每步和为 1。",
  "walkthrough": "logits(T=5,C=3) 贪心 argmax=[1,1,0,2,2]；遍历：t=1 入 out=[1]，t=1 相邻重复跳过，t=0 为 blank 跳，t=2 入 out=[1,2]，t=2 重复跳，最终 'AB'。",
  "kind": "code"
};
