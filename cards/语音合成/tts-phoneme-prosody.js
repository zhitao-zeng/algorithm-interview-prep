export default {
  "id": "tts-phoneme-prosody",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "音素与韵律时长建模",
  "prompt": "TTS 中如何基于音素建模时长与韵律，使朗读节奏符合语言习惯？",
  "quickAnswer": "用时长预测器依据音素上下文预测每个音素占的帧数，再配合韵律模型(基频/能量曲线)塑造节奏与轻重；非自回归模型常把时长作为显式条件。",
  "code": "import torch.nn as nn\n\nclass DurationPredictor(nn.Module):\n    def forward(self, x):\n        # 基于音素上下文预测每个音素帧数\n        return self.conv(x).squeeze(-1).exp()  # 时长(帧)",
  "complexity": "时间 O(n)，空间 O(n)（n 为音素数）",
  "beginnerSummary": "像给每个字分配\"演唱时长\"，再按旋律起伏决定轻重缓急，朗读才像人说话。",
  "derivation": [
    "为什么需要：均匀时长听感机械，需按音素/语境分配时长与重音。",
    "怎么实现：时长预测器输出每音素帧数→上采样对齐；韵律模型给基频/能量轮廓。",
    "有什么代价：时长预测误差会累积导致对齐抖动；需与声码器节奏匹配。",
    "怎么评测：时长 Pearson 相关、韵律自然度 MOS、与真值的帧对齐误差。"
  ],
  "edgeCases": [
    "停顿符号被当成音素分配了时长。",
    "多音字时长随具体读音变化。",
    "韵律词边界处时长需压缩。",
    "长元音/辅音簇有特殊时长规律。"
  ],
  "pitfalls": [
    "直接指数化输出未裁剪导致时长过长爆炸。",
    "忽略上下文使重音位置错乱。"
  ],
  "prerequisites": [
    "音素与声学特征",
    "序列预测基础"
  ],
  "workedExample": [
    "文本\"你好\"→音素[n i x ao]→预测帧数[8,6,10,12]。",
    "上采样后送入解码器，长音素占更多帧形成节奏。"
  ],
  "lineByLine": [
    "class DurationPredictor(nn.Module)：定义时长预测网络。",
    "x = self.conv(x)：卷积提取音素上下文特征。",
    "return self.conv(x).squeeze(-1).exp()：输出取指数保证正值时长(帧)。"
  ],
  "followUps": [
    {
      "question": "时长预测误差如何缓解？",
      "answer": "用真实对齐(MFA)蒸馏、加方差约束，并在推理做局部平滑抑制抖动。"
    },
    {
      "question": "韵律模型与时长模型如何协同？",
      "answer": "时长决定\"何时说\"，韵律模型决定\"怎么说\"，二者共享文本编码并在解码端拼接条件。"
    }
  ],
  "followUpAnswers": [
    "用真实对齐(MFA)蒸馏、加方差约束，并在推理做局部平滑抑制抖动。",
    "时长决定\"何时说\"，韵律模型决定\"怎么说\"，二者共享文本编码并在解码端拼接条件。"
  ],
  "explanationFocus": "是什么：音素级建模把文本映射到音素序列并预测每个音素的持续时长与韵律(基频/能量)，决定朗读的节奏与轻重。本课聚焦时长与韵律模型。",
  "approach": "用时长预测器依据音素上下文估计每音素帧数并上采样对齐，配合韵律模型生成基频/能量轮廓，共同作为声学模型的条件。",
  "kind": "concept"
};
