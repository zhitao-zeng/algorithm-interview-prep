export default {
  "id": "tts-fastspeech",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "非自回归 TTS 与并行生成（FastSpeech / Matcha）",
  "prompt": "为什么非自回归 TTS（如 FastSpeech、Matcha-TTS）能做到实时并行合成，它和自回归 TTS 在时长建模上有什么根本区别？",
  "quickAnswer": "自回归 TTS 逐帧生成、速度受序列长度限制；非自回归 TTS 通过显式时长预测（length regulator）把音素一次性展开成帧序列再并行声学/波形合成，推理延迟与长度解耦，易于流式与端侧落地（如简历中的 Matcha / Melo）。",
  "code": "import torch\n\ndef length_regulator(x, dur):\n    # x: [B, T_text, D], dur: [B, T_text]\n    out = []\n    for i in range(x.size(1)):\n        out.append(x[:, i, :].repeat_interleave(dur[:, i], dim=1))\n    return torch.cat(out, dim=1)",
  "complexity": "时长展开 O(sum(dur))，并行声学模型 O(1) 步前向，整体与文本长度相关、与音频长度解耦。",
  "beginnerSummary": "自回归 TTS 像一字一字念，非自回归 TTS 先规划好每个字念多长（时长预测），再把整句话一次性画出来，因此更快。",
  "derivation": [
    "为什么需要：自回归逐帧生成使推理时延随音频长度线性增长，难以满足实时/流式与端侧需求。",
    "怎么实现：用时长预测器给出每个音素/词的帧数，length regulator 把文本表征按帧数展开，再并行过声学模型与声码器。",
    "有什么代价：时长预测可能不准导致节奏异常，且并行生成弱化了上下文依赖，需要额外对齐或知识蒸馏（teacher 自回归）辅助。",
    "怎么评测：用 RTF（实时率）、MOS、相似度与 ASR 回测 WER 衡量速度与质量权衡。"
  ],
  "edgeCases": [
    "静音/停顿时长估计偏差导致节奏怪异。",
    "多音字展开后音素序列错误。",
    "极长短文本时并行收益有限。",
    "低资源方言缺少对齐数据训练时长模型。"
  ],
  "pitfalls": [
    "直接用自回归模型做 teacher 未做长度匹配，蒸馏失效。",
    "忽略时长预测的方差，推理时取 argmax 丢失韵律多样性。"
  ],
  "prerequisites": [
    "自回归 TTS（如 Tacotron/VITS）",
    "时长建模与对齐（forced alignment）"
  ],
  "workedExample": [
    "FastSpeech 用自回归 teacher 提供的时长作为监督，训练并行时长预测器。",
    "简历中 Matcha-TTS / Melo 以非自回归流式结构交付中英混读与多方言，正是该思路的工程化。"
  ],
  "lineByLine": [
    "def length_regulator(x, dur)：定义把文本表征按预测时长展开的函数。",
    "for i in range(x.size(1))：遍历每个文本帧（音素/词）。",
    "out.append(x[:, i, :].repeat_interleave(dur[:, i], dim=1))：按预测帧数重复该帧表征。",
    "return torch.cat(out, dim=1)：拼接得到与音频等长的声学表征序列。"
  ],
  "followUps": [
    {
      "question": "非自回归 TTS 如何保证可懂度？",
      "answer": "通常用自回归 teacher 做序列级知识蒸馏，并辅以时长对齐与 ASR 回测 WER 监控，避免并行带来的信息丢失。"
    },
    {
      "question": "时长预测不准怎么办？",
      "answer": "可用 variance adaptor（pitch/energy/duration）联合建模，或在推理时做轻量时长搜索与韵律控制。"
    }
  ],
  "followUpAnswers": [
    "通常用自回归 teacher 做序列级知识蒸馏，并辅以时长对齐与 ASR 回测 WER 监控，避免并行带来的信息丢失。",
    "可用 variance adaptor（pitch/energy/duration）联合建模，或在推理时做轻量时长搜索与韵律控制。"
  ],
  "explanationFocus": "是什么：非自回归 TTS 通过显式时长预测把文本一次性展开为声学帧序列再并行合成，从而把推理时延与音频长度解耦，是实现实时、流式与端侧 TTS（如 FastSpeech、Matcha、Melo）的关键思路。",
  "approach": "核心思路是先预测时长、再并行生成：时长预测器 + length regulator 负责把音素映射成帧数，声学模型与声码器并行前向；训练时常借助自回归 teacher 蒸馏来补偿并行带来的上下文弱化。",
  "kind": "concept"
};
