export default {
  "id": "as-whisper",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "Whisper 模型",
  "prompt": "Whisper 为什么只用 Transformer 编码器-解码器加大规模弱监督，就能做到多语言零样本转录？",
  "quickAnswer": "Whisper 在 68 万小时多语言弱监督数据上训练一个标准 Encoder-Decoder Transformer，把语言/任务（转录、翻译）作为特殊前缀 token 输入解码器，从而零样本泛化到多种语言与任务，无需每语言单独微调。",
  "approach": "音频经 log-Mel 谱送 Encoder 得隐表示；Decoder 自回归生成文本，起始 token 指定语言与任务（如 <zh>、<transcribe>）；训练目标是多任务混合的交叉熵，推理用贪心或 beam 即可。",
  "explanationFocus": "是什么：Whisper 是 OpenAI 开源的语音识别/翻译模型，采用标准 Transformer 编码器-解码器，在海量弱监督多语言数据上训练，用特殊控制 token 实现零样本多语言转录与翻译。",
  "bruteForce": "传统做法每种语言单独收集标注、单独训练一个 ASR，工程与数据成本随语言数线性增长，难以覆盖小语种。",
  "invariant": "给定相同音频与相同控制 token，解码输出确定（贪心下）；控制 token 决定输出语言与任务，不依赖外部语言 ID 模型。",
  "walkthrough": "读 16kHz 音频 → 算 80 维 log-Mel（30s 窗）→ Encoder 编码 → Decoder 以 <zh><transcribe> 起手自回归出文本 → 跨窗用时间戳 token 拼接长音频。",
  "complexity": "推理随音频长度线性增长，Encoder 为 O(T²) 注意力；大模型（large）参数量 1.5B，需 GPU；小模型可实时。",
  "beginnerSummary": "Whisper 像一个“见多识广”的转录员：它听过几十万小时各国语言，所以换一种语言也能直接听懂，不必重新培训。",
  "diagram": "mel spectrogram\n   |\nencoder (Transformer)\n   |\ndecoder (cross-attn)\n   |\ntext + timestamp",
  "code": "import torch\n\ndef whisper_decode(model, mel, language='zh'):\n    tokens = model.encoder(mel)\n    return model.decoder(tokens)",
  "derivation": [
    "为什么需要：多语言 ASR 标注昂贵，且长尾语言数据稀少，需要一种能跨语言共享知识、零样本泛化的方案。",
    "怎么实现：在 68 万小时弱监督数据上训练 Enc-Dec Transformer，把语言/任务编码为特殊前缀 token，多任务统一训练目标。",
    "有什么代价：弱监督含噪声、对特定领域（医疗/方言）易错；大模型算力高；对短语音和嘈杂环境鲁棒性不如专用流式系统。",
    "怎么评测：在 Common Voice / 多语言测试集上测 WER 与语言检测准确率，并测长音频时间戳质量。"
  ],
  "edgeCases": [
    "无语音/纯噪声：模型可能幻觉出文字，需要 VAD 前置。",
    "语种混淆：相似语言（葡/西）易被误判语言 token。",
    "专业术语：训练分布外词汇易写错。",
    "超 30s 音频：需滑窗拼接，可能切断句子。"
  ],
  "pitfalls": [
    "忘记加语言 token 导致自动检测错误、输出错误语言。",
    "直接用于低延迟流式，而 Whisper 原生为非流式 30s 窗设计。"
  ],
  "prerequisites": [
    "Transformer 编码器-解码器",
    "log-Mel 频谱与多任务学习"
  ],
  "workedExample": [
    "输入中文 30s 音频，前缀 <zh><transcribe>，Whisper large 直接输出中文文本，WER 约 4%。",
    "前缀 <en><translate> 时同一音频被翻译成英文，体现控制 token 的任务切换。"
  ],
  "lineByLine": [
    "def whisper_decode(...)：封装一次音频的解码流程，language 控制输出语种。",
    "model.encoder(mel)：把 log-Mel 谱编码为上下文隐表示。",
    "model.decoder(tokens)：以控制 token 起手自回归生成文本。"
  ],
  "codeNotes": [
    "实际推理还需拼特殊 token（如 <|startoftranscript|> <|zh|> <|transcribe|>），并用 beam 解码。"
  ],
  "followUps": [
    {
      "question": "Whisper 与 Conformer-CTC 怎么选？",
      "answer": "Whisper 多语言零样本、易部署但不流式；Conformer-CTC/RNN-T 更适合低延迟流式与领域微调。"
    },
    {
      "question": "Whisper 能做流式吗？",
      "answer": "原生非流式；可借助 chunk 化与 token 缓冲近似流式，但延迟与稳定性不如专用流式架构。"
    }
  ],
  "followUpAnswers": [
    "Whisper 多语言零样本、易部署但不流式；Conformer-CTC/RNN-T 更适合低延迟流式与领域微调。",
    "原生非流式；可借助 chunk 化与 token 缓冲近似流式，但延迟与稳定性不如专用流式架构。"
  ],
  "kind": "code"
};
