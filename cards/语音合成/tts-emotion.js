export default {
  "id": "tts-emotion",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "情感与韵律控制",
  "prompt": "如何在 TTS 中注入情感与韵律控制，使合成语音表达不同情绪？",
  "quickAnswer": "将情感标签或参考音频编码为韵律嵌入(全局/局部条件)，注入解码器或后验；可用离散情感分类、连续维度(效价-唤醒)或参考编码器三种方式控制。",
  "code": "import torch\n\ndef emotion_tts(text, emotion_label):\n    # 将情感标签映射为韵律嵌入并注入解码器\n    e = emotion_encoder(emotion_label)  # (1, D)\n    return decoder(text, global_cond=e)",
  "complexity": "时间 O(n)，空间 O(model)（n 为文本长度）",
  "beginnerSummary": "像给同一句话选\"开心/悲伤\"的语气滤镜，情绪不同声音的高低快慢就不同。",
  "derivation": [
    "为什么需要：中性语音缺乏表现力，情感控制拓展有声书、客服等场景。",
    "怎么实现：情感标签→embedding(或参考音频编码)→作为全局条件注入解码器/流。",
    "有什么代价：标签体系有限难覆盖细微情绪；参考编码易泄露说话人身份。",
    "怎么评测：情感识别准确率、情绪相似度 MOS、自然度是否下降。"
  ],
  "edgeCases": [
    "中性与微情绪边界模糊难标注。",
    "参考音频含强噪声影响编码。",
    "多情感混合表达需插值。",
    "不同说话人同一情绪音色差异大。"
  ],
  "pitfalls": [
    "把说话人信息当情绪控制，导致变声而非变情绪。",
    "离散标签过粗丢失细腻情绪层次。"
  ],
  "prerequisites": [
    "说话人嵌入与条件生成",
    "情感维度理论(效价/唤醒)"
  ],
  "workedExample": [
    "标签\"开心\"→emotion_encoder→向量 e。",
    "解码器在文本隐变量上叠加 e，生成上扬基频的开心语音。"
  ],
  "lineByLine": [
    "def emotion_tts(text, emotion_label)：情感合成入口。",
    "e = emotion_encoder(emotion_label)：把标签编码为韵律向量。",
    "return decoder(text, global_cond=e)：向量作为全局条件注入解码器。"
  ],
  "followUps": [
    {
      "question": "参考编码器方式与标签方式各有什么取舍？",
      "answer": "参考方式零样本、细腻但易混说话人；标签方式可控但覆盖有限，需按场景选择。"
    },
    {
      "question": "如何解耦情感与说话人？",
      "answer": "用独立编码器+对抗分类器去除说话人信息，或正交约束两嵌入空间。"
    }
  ],
  "followUpAnswers": [
    "参考方式零样本、细腻但易混说话人；标签方式可控但覆盖有限，需按场景选择。",
    "用独立编码器+对抗分类器去除说话人信息，或正交约束两嵌入空间。"
  ],
  "explanationFocus": "是什么：情感 TTS 通过韵律嵌入控制语音的情绪表达，控制粒度可为离散标签、连续维度或参考音频。本课关注情感与韵律的注入方式。",
  "approach": "将情感标签/参考音频编码为全局或局部韵律条件，注入解码器或归一化流，并用解耦训练避免与说话人身份混淆。",
  "kind": "concept"
};
