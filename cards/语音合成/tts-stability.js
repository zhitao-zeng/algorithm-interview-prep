export default {
  "id": "tts-stability",
  "category": "语音合成",
  "difficulty": "Hard",
  "title": "TTS 稳定性与崩坏归因",
  "prompt": "TTS 合成中\"崩坏\"与 KL loss 爆炸通常如何归因，怎样用回归评测尽早发现并抑制？",
  "quickAnswer": "崩坏常来自对齐失败、后验坍塌、训练数据噪声与学习率过大导致 KL 爆炸；应监控逐句 KL/重构损失、设阈值报警，并用稳定性回归集统计崩坏率与异常样本。",
  "code": "import torch\n\ndef stability_score(model, testset, THRESH=5.0):\n    # kloss 监控 + 崩坏率统计\n    crash = 0\n    for text in testset:\n        loss = model.kl_loss(text)\n        if loss > THRESH or torch.isnan(loss):\n            crash += 1\n    return 1.0 - crash / len(testset)",
  "complexity": "时间 O(N)，空间 O(1)（N 为测试句数）",
  "beginnerSummary": "像工厂质检：给每句话打分，分数异常(过高/NaN)的就判为\"残次品\"，统计残次率盯住产线稳定。",
  "derivation": [
    "为什么需要：线上偶发崩坏(重复/尖叫/静音)严重影响体验，需可量化归因。",
    "怎么实现：实时监控 KL/对抗损失，异常即标记；用稳定性回归集测崩坏率。",
    "有什么代价：逐句评测有算力成本；阈值需随模型迭代调整。",
    "怎么评测：崩坏率、异常 loss 占比、自然度 MOS 在低置信子集上的衰减。"
  ],
  "edgeCases": [
    "极短文本(单字)易重复崩坏。",
    "含大量标点/符号的异常输入触发失稳。",
    "未见领域术语触发对齐失败。",
    "推理温度偏高导致尖叫音。"
  ],
  "pitfalls": [
    "只看平均 loss 掩盖个别崩坏句。",
    "阈值固定不变，模型迭代后误报/漏报。"
  ],
  "prerequisites": [
    "KL 散度与变分训练",
    "异常检测基础"
  ],
  "workedExample": [
    "对回归集每句算 KL，>THRESH 或 NaN 计为崩溃。",
    "崩坏率 = 崩溃句数/总数，趋势上升即回退模型版本。"
  ],
  "lineByLine": [
    "def stability_score(model, testset, THRESH=5.0)：定义稳定性评分入口。",
    "loss = model.kl_loss(text)：取该句 KL 损失。",
    "if loss > THRESH or torch.isnan(loss)：异常(爆炸或数值溢出)判定。",
    "return 1.0 - crash / len(testset)：返回稳定性分数(1-崩坏率)。"
  ],
  "followUps": [
    {
      "question": "KL 爆炸与后验坍塌有何关系？",
      "answer": "学习率过大或流容量不足时后验被先验拉垮，KL 骤增且生成退化，是坍塌前兆，应早停或降 lr。"
    },
    {
      "question": "如何在训练中抑制崩坏？",
      "answer": "加 KL 退火、梯度裁剪，用稳定性子集做早停与正则，并对异常样本重采样。"
    }
  ],
  "followUpAnswers": [
    "学习率过大或流容量不足时后验被先验拉垮，KL 骤增且生成退化，是坍塌前兆，应早停或降 lr。",
    "加 KL 退火、梯度裁剪，用稳定性子集做早停与正则，并对异常样本重采样。"
  ],
  "explanationFocus": "是什么：TTS 稳定性指模型在多样输入下不出现重复/尖叫/静音等\"崩坏\"的能力；KL loss 爆炸是变分模型训练失稳的典型信号。本课关注归因与回归评测。",
  "approach": "以逐句 KL/重构损失监控结合阈值报警捕捉异常，并用覆盖疑难句的稳定性回归集统计崩坏率，辅以 KL 退火与梯度裁剪从源头抑制。",
  "kind": "concept"
};
