export default {
  "id": "as-streaming-asr",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "流式 ASR 架构",
  "prompt": "如何设计一个低延迟的流式 ASR 系统，使得用户说话时就能看到部分识别结果？",
  "quickAnswer": "把音频切成定长 chunk，每个 chunk 仅利用有限左/右上下文进行编码并即时输出，配合 CTC 或 RNN-T 逐帧发射；常用动态分块注意力、因果卷积与右上下文来平衡延迟与精度。",
  "approach": "采用 chunk-based 流式：编码器每次消费 N 帧，允许左看 L 帧、右看 R 帧（右上下文提升精度但增加延迟）；解码用 RNN-T 或 CTC 前缀束搜索，并在端点检测后做整体重打分。",
  "explanationFocus": "是什么：流式 ASR 是一类在音频持续输入时增量输出文本的系统，通过限制每个时刻可看的未来上下文来控制延迟，区别于整句输入的非流式 ASR。",
  "bruteForce": "朴素做法是等整句话说完再识别（非流式），延迟等于句长；或每来一帧就重新识别整段，算力浪费且结果抖动。",
  "invariant": "任意时刻已输出的前缀必须是最终完整结果的前缀（单调对齐），且已发射 token 不再被撤销（除非显式重打分）。",
  "walkthrough": "音频按 16 帧 chunk 流入 → 编码器带左 8 右 8 上下文算隐状态 → RNN-T 联合网络对每个 chunk 发射若干 token 或 blank → 接收端点后做整句 LM 重打分并刷新显示。",
  "complexity": "延迟约 (chunk+right_context)/帧率（如 16+8 帧 /100fps≈240ms），算力随 chunk 数线性增长；右上下文越大精度越高但首字延迟越大。",
  "beginnerSummary": "流式 ASR 像边听边写：每次只处理一小段音频并立刻给出已确定的文字，靠限制“能往后看多少”来控制等待时间。",
  "diagram": "audio stream\n   |  chunk = 16 frames\n   v\n[encoder + right ctx]\n   |\nemit partial text\n   |  next chunk ...\n   v\nendpoint -> rescore",
  "code": "import numpy as np\n\ndef chunk_stream(features, chunk=16, left=8, right=8):\n    # 动态分块 + 右上下文\n    for i in range(0, len(features), chunk):\n        yield features[max(0, i - left): i + chunk + right]",
  "derivation": [
    "为什么需要：语音助手、字幕等场景要求边说边出字，端到端等待整句不可接受，因此需要增量解码。",
    "怎么实现：把音频分 chunk，编码器用因果/受限注意力与右上下文，解码器用 RNN-T 或 CTC 逐帧发射并做端点触发重打分。",
    "有什么代价：右上下文与整句上下文缺失会损害精度，需要在延迟与 WER 间权衡；chunk 边界可能切断音素。",
    "怎么评测：用首字延迟（First Token Latency）、句末延迟与 WER 综合衡量，并在不同右上下文下画延迟-精度曲线。"
  ],
  "edgeCases": [
    "静音段过长：需静音抑制与端点检测避免空识别。",
    "断句错误：chunk 边界切断词导致错字，需要右上下文或重打分修正。",
    "网络抖动：音频到达不均时需要缓冲与超时策略。",
    "极短指令：如“停止”只有几帧，chunk 过大反而增加延迟。"
  ],
  "pitfalls": [
    "右上下文设得过大，名义“流式”实际延迟接近非流式。",
    "忽略 chunk 边界处状态传递，导致 Conformer/Transformer 跨块状态错位。"
  ],
  "prerequisites": [
    "CTC 与 RNN-T 解码原理",
    "因果卷积与 Masked 自注意力"
  ],
  "workedExample": [
    "设定 chunk=16、right=8、帧率 100fps，首字延迟约 (16+8)/100=240ms，满足实时字幕需求。",
    "用 RNN-T 在 AISHELL 上对比 right=0 与 right=8，WER 从 6.1% 降到 5.2%。"
  ],
  "lineByLine": [
    "for i in range(0, len(features), chunk)：按 chunk 滑动遍历特征序列。",
    "max(0, i - left)：左上下文不足时在句首截断。",
    "i + chunk + right：拼接右上下文供编码器看未来少许帧。",
    "yield：每次产出一个带上下文的局部窗口交给编码/解码。"
  ],
  "codeNotes": [
    "right 越大精度越高但延迟越大，是流式系统的核心超参。"
  ],
  "followUps": [
    {
      "question": "动态分块注意力（dynamic chunk）如何训练？",
      "answer": "训练时对每个样本随机采样 chunk 大小与右上下文，并加 causality mask，使模型适配不同流式配置。"
    },
    {
      "question": "CTC 与 RNN-T 谁更适合流式？",
      "answer": "RNN-T 自带自回归语言模型、逐帧发射更自然，流式体验更好；CTC 需额外 WFST/beam 才能平滑流式。"
    }
  ],
  "followUpAnswers": [
    "训练时对每个样本随机采样 chunk 大小与右上下文，并加 causality mask，使模型适配不同流式配置。",
    "RNN-T 自带自回归语言模型、逐帧发射更自然，流式体验更好；CTC 需额外 WFST/beam 才能平滑流式。"
  ],
  "kind": "code"
};
