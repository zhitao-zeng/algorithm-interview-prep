export default {
  "kind": "code",
  "id": "positional-encoding",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "正弦位置编码",
  "prompt": "写出 Transformer 的 sinusoidal 位置编码。",
  "quickAnswer": "偶数维用 sin(pos/10000^(2i/d))，奇数维用 cos，使相对位移可线性表达。",
  "approach": "偶数维用 sin(pos/10000^(2i/d))，奇数维用 cos，使相对位移可线性表达。",
  "explanationFocus": "正弦位置编码：偶数维用 sin(pos/10000^(2i/d))，奇数维用 cos，使相对位移可线性表达。",
  "bruteForce": "《正弦位置编码》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "自注意力置换不变，必须显式给位置信号。",
    "用正余弦是因为对任意偏移 k，PE(pos+k) 可表示为 PE(pos) 的线性函数，利于学习相对位置。",
    "不同频率让编码在长短距离上都具区分度，且能外推到训练时未见过的更长序列。"
  ],
  "invariant": "实现始终保持 正弦位置编码：偶数维用 sin(pos/10000^(2i/d))，奇数维用 cos，使相对位移可线性表达。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《正弦位置编码》，逐步核对形状和中间数值。",
  "edgeCases": [
    "序列长度超过训练见过的最大 pos：用公式仍可算（外推性）。",
    "维度 d 为奇数：最后一个奇数维仍按规则处理。",
    "与可学习位置编码对比：正弦法不占参数、可外推。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef positional_encoding(length, dim):\n    pos = np.arange(length, dtype=float)[:, None]\n    even = np.arange(0, dim, 2)\n    angle = pos / np.power(10000.0, even / dim)\n    pe = np.zeros((length, dim), dtype=float)\n    pe[:, 0::2] = np.sin(angle)\n    pe[:, 1::2] = np.cos(angle[:, :pe[:, 1::2].shape[1]])\n    return pe",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(L·d)（L 序列长、d 维度），空间 O(L·d)。",
  "followUps": [
    {
      "question": "为什么 embedding 维度必须一致？",
      "answer": "位置编码要与 token embedding 逐元素相加，形状必须同为 (L,d)；否则无法广播到每个通道。"
    },
    {
      "question": "可学习位置编码有何不同？",
      "answer": "可学习表能适应训练长度但外推较弱；正弦编码无额外参数，可直接扩展到更长序列。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "忘记把 PE 加到嵌入上（或加反了顺序），模型依然无位置感。",
    "用单一频率而非随维度递减的频率，丢失多尺度位置信息。"
  ],
  "beginnerSummary": "Transformer 本身不含位置信息（自注意力对顺序不敏感），需用位置编码把「位置」注入。原始论文用正弦/余弦函数：PE(pos,2i)=sin(pos/10000^{2i/d})，PE(pos,2i+1)=cos(...)。不同维度用不同频率，既给每个位置唯一编码，又让相近位置编码相近、便于模型泛化到更长序列。",
  "prerequisites": [
    "每个位置 pos 得到一个 d 维向量；偶数维用 sin、奇数维用 cos。",
    "频率随维度递减（10000^{2i/d} 分母越大频率越低），高维捕捉细粒度、低维捕捉粗粒度位置。",
    "该编码是确定性的、与输入内容无关，可直接加到词嵌入上。"
  ],
  "workedExample": [
    "pos=0：所有 sin(0)=0、cos(0)=1 → PE[0]=[0,1,0,1,...]。",
    "pos=1, d=4：维度0频率 1/10000^0=1 → sin(1)≈0.841；维度1 → cos(1)≈0.540；依此类推。"
  ],
  "lineByLine": [
    "构造频率向量 freq = 1 / 10000^{2i/d}，i 为维度下标。",
    "偶数维 PE=sin(pos·freq)，奇数维 PE=cos(pos·freq)。",
    "将 PE 广播加到词嵌入上（通常还需乘 √d 缩放嵌入）。",
    "返回 embedding + PE。"
  ],
  "diagram": "PE(pos,2i)   = sin( pos / 10000^{2i/d} )\nPE(pos,2i+1) = cos( pos / 10000^{2i/d} )\npos=0: [sin0, cos0, ...] = [0, 1, ...]\npos=1: 不同频率振荡\n→ 给每个位置唯一编码, 注入顺序信息"
};
