export default {
  "id": "ocr-recognition",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "文本识别（CRNN / Transformer seq2seq）",
  "prompt": "CRNN 与基于 Transformer 的文本识别在建模方式上有何差异，seq2seq 如何避免固定长度输出限制？",
  "quickAnswer": "CRNN 用 CNN 提特征+BiLSTM 建模序列+CTC 对齐，输出变长且无需对齐；Transformer 用自注意力直接做编码器-解码器 seq2seq，可建模全局依赖并支持注意力对齐。",
  "code": "import torch.nn as nn\n\nclass CRNN(nn.Module):\n    def __init__(self, num_chars):\n        super().__init__()\n        self.cnn = CNNFeatureExtractor()\n        self.rnn = nn.LSTM(512, 256, bidirectional=True, batch_first=True)\n        self.head = nn.Linear(512, num_chars + 1)  # +1 为 CTC blank\n\n    def forward(self, x):\n        feat = self.cnn(x)            # (B, C, H, W) -> (B, W, 512)\n        seq, _ = self.rnn(feat)\n        return self.head(seq)         # 逐时间步字符分布，CTC 解码\n",
  "complexity": "时间 O(W·d²)（序列长度×隐层维），空间 O(W·d)",
  "beginnerSummary": "识别就像先“看一遍一整行字”再一个字一个字念出来。CRNN 像边看边记的读书人，Transformer 像能一眼看到整行并前后对照的速读者。",
  "derivation": [
    "为什么需要：文本长度不固定且字符间有上下文，直接用分类头无法输出变长序列。",
    "怎么实现：CRNN 用 CNN 压成序列特征，BiLSTM 捕获上下文，CTC 处理无对齐标签；Transformer 用位置编码+自注意力做编码器-解码器生成。",
    "有什么代价：CTC 假设时间步条件独立、难建模强上下文；Transformer 自注意力对长序列是 O(W²) 计算，推理需自回归或并行解码。",
    "怎么评测：用归一化编辑距离(NED)/准确率，端到端用 NLCS 或字级精确匹配。"
  ],
  "edgeCases": [
    "含空格与标点的混合文本",
    "极长序列超出训练最大长度",
    "易混淆字符(0/O、1/l)",
    "空白或噪声行图"
  ],
  "pitfalls": [
    "CTC 把相邻重复字符误合并需加 blank 处理",
    "Transformer 解码未加 coverage 导致漏字或重复",
    "训练/推理最大宽度不一致"
  ],
  "prerequisites": [
    "CNN 特征提取",
    "RNN/LSTM",
    "CTC 损失与注意力机制"
  ],
  "workedExample": [
    "输入 32×100 灰度行图，CRNN 输出 25 个时间步×字符分布，CTC 去 blank 与去重得 'HELLO'。",
    "同样图送 Transformer 解码器自回归输出 'HELLO'，注意力图显示每个输出对齐到对应笔画。"
  ],
  "lineByLine": [
    "class CRNN(nn.Module): 定义卷积循环识别模型。",
    "self.cnn: 提取局部笔画特征并压缩高度。",
    "self.rnn: 双向 LSTM 捕获左右上下文。",
    "self.head: 每时间步映射到字符+blank 的 logits 供 CTC。"
  ],
  "followUps": [
    {
      "question": "什么时候选 CRNN 而不是 Transformer？",
      "answer": "当部署算力受限、文本较规整且序列不长时，CRNN 参数量小、推理稳定；Transformer 在复杂版式与强上下文(如中英文混排)上更优但更重。"
    },
    {
      "question": "CTC 与 Attention 解码能否结合？",
      "answer": "可以，常见做法是二者联合训练并以 Attention 为主、CTC 作辅助正则，或蒸馏/融合两路输出提升鲁棒性。"
    }
  ],
  "followUpAnswers": [
    "当部署算力受限、文本较规整且序列不长时，CRNN 参数量小、推理稳定；Transformer 在复杂版式与强上下文(如中英文混排)上更优但更重。",
    "可以，常见做法是二者联合训练并以 Attention 为主、CTC 作辅助正则，或蒸馏/融合两路输出提升鲁棒性。"
  ],
  "invariant": "feat 序列时间步数 W 与输入宽度成正比，head 在每个时间步独立输出字符分布。",
  "walkthrough": "x(1,1,32,100) → cnn 得 (1,512,1,25) 展平为 (1,25,512)；LSTM 输出 (1,25,512)；head 映射为 (1,25,num_chars+1)；CTC 对 25 步去重去 blank 得字符串。",
  "kind": "code"
};
