export default {
  "id": "slm-audio-encoder-adapter",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "音频编码器与适配器",
  "prompt": "Whisper/HuBERT 这类音频编码器如何接入 LLM？适配器（adapter）的作用与常见结构是什么？",
  "quickAnswer": "音频编码器（Whisper/HuBERT）先抽取帧级表征，再用适配器（如线性投影、Q-Former、或轻量 MLP）把变长序列压缩并投影到 LLM 隐空间，作为前缀软 token 接入。适配器还能缓解模态 gap 并降低序列长度。",
  "code": "from torch import nn\n\nclass AudioAdapter(nn.Module):\n    def __init__(self, d_enc, d_llm, n=32):\n        self.proj = nn.Linear(d_enc, d_llm)        # 维度对齐\n        self.down = nn.Conv1d(1, 1, 4, stride=4)   # 4倍下采样\n    def forward(self, feat):\n        x = self.down(feat).squeeze(0)             # 压缩帧率\n        return self.proj(x)                        # 投到 LLM 空间",
  "complexity": "时间 O(T*d)，空间 O(params)",
  "beginnerSummary": "编码器像翻译把声音变成'外语笔记'，适配器像字典把笔记翻成大模型看得懂的'母语'，并顺手把长篇笔记压缩成要点。",
  "derivation": [
    "为什么需要：音频编码器输出维度与帧率都与 LLM 隐空间不同，需适配器做对齐与压缩。",
    "怎么实现：在 encoder 后接线性/MLP/Q-Former，将帧级特征投影到 LLM 维度并下采样，作为前缀 token 拼入。",
    "有什么代价：适配器引入额外参数，下采样过猛会丢信息，训练需与 LLM 对齐避免表征漂移。",
    "怎么评测：用下游 ASR/WER 与语音问答准确率，及适配后特征与文本空间的对齐度（如零样本检索）。"
  ],
  "edgeCases": [
    "长音频下采样后关键信息丢失，需自适应池化或注意力下采样。",
    "编码器与 LLM 维度差过大时单层线性不够，需多层 MLP。",
    "冻结编码器只训适配器时容量受限，难学复杂对齐。",
    "多采样率输入需重采样到编码器期望 16k/24k。"
  ],
  "pitfalls": [
    "直接把 encoder 输出无下采样拼入 LLM，序列过长撑爆显存与上下文。",
    "适配器与 LLM 一起从头训导致编码器表征被破坏，应先冻编码器。"
  ],
  "prerequisites": [
    "CNN / Transformer 音频编码器",
    "投影层与表征对齐"
  ],
  "workedExample": [
    "Whisper encoder 输出 1500 帧 1280 维，经 4 倍下采样+线性投影成 375 个 4096 维 LLM 前缀 token。",
    "仅训 adapter 冻结 HuBERT，在语音问答上 zero-shot 达 72% 准确率。"
  ],
  "lineByLine": [
    "self.proj = nn.Linear(d_enc, d_llm)：构建维度对齐投影。",
    "self.down = nn.Conv1d(..., stride=4)：用卷积做 4 倍帧率下采样。",
    "x = self.down(feat).squeeze(0)：压缩时间维减少 token 数。",
    "return self.proj(x)：投影到 LLM 隐空间作为前缀。"
  ],
  "followUps": [
    {
      "question": "Q-Former 适配器相比线性投影好在哪儿？",
      "answer": "Q-Former 用可学习查询做交叉注意力，把变长音频压缩为固定数量语义 token，既降序列又保留关键信息，适合长音频与多任务。"
    },
    {
      "question": "Whisper 与 HuBERT encoder 怎么选？",
      "answer": "Whisper 偏识别、对 ASR 友好；HuBERT 自监督、语义表征更通用且适合做语义 token 源，按任务选或二者融合。"
    }
  ],
  "followUpAnswers": [
    "Q-Former 用可学习查询做交叉注意力，把变长音频压缩为固定数量语义 token，既降序列又保留关键信息，适合长音频与多任务。",
    "Whisper 偏识别、对 ASR 友好；HuBERT 自监督、语义表征更通用且适合做语义 token 源，按任务选或二者融合。"
  ],
  "explanationFocus": "是什么：音频编码器（如 Whisper/HuBERT）负责把波形抽取成帧级表征，适配器是把这些表征投影并压缩到 LLM 隐空间的桥梁模块，使音频能作为前缀 token 接入语言模型。",
  "approach": "在 encoder 后接投影/下采样/交叉注意力类适配器，做维度对齐与序列压缩，再作为软前缀拼入 LLM，从而以最小改动把听觉能力注入现成大模型。",
  "kind": "concept"
};
