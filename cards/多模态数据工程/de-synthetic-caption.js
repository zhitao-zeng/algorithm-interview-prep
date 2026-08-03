export default {
  "id": "de-synthetic-caption",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "合成 caption 与 recaption",
  "prompt": "什么是合成 caption 与 recaption？如何用更强的 captioning 模型重写弱文本来提升多模态数据质量？",
  "quickAnswer": "合成 caption 是用视觉模型为图像自动生成描述文本；recaption 是拿已有（可能很差的）alt 文本的图像，再喂给更强的 captioner 重新生成 richer、更结构化的描述，替换原弱文本。这样能用廉价方式把海量网页弱标注升级成高质量训练对。",
  "approach": "对原文本过短/粗糙的图像调用强 captioning 模型（或 VLM）生成新描述，结合原文本做融合，按质量分择优替换，保留原对作为兜底。",
  "explanationFocus": "是什么：合成 caption 指用模型自动写图像描述；recaption（重描述）特指用更强的模型把已有弱文本（如网页 alt）重写为信息更丰富的文本，以提升训练样本密度与准确性。",
  "bruteForce": "朴素做法：直接用网页原始 alt 文本训练，不管其往往过短、无关或为空。",
  "invariant": "核心不变式：recaption 后的文本必须仍描述同一图像内容（与原图语义一致），且信息量不低于原文本。",
  "walkthrough": "100M 图文对中 40M 原 alt 过短（<5 词）。对这 40M 调强 captioner 生成平均 20 词描述，质量分从 0.5 升到 0.8，替换后训练集平均文本长度由 8 词增至 14 词，下游图像生成文本遵循度提升明显。",
  "code": "def recaption(image, old_text, captioner, min_len=10):\n    new_text = captioner.describe(image)\n    if len(new_text) >= min_len:\n        return new_text\n    return old_text  # 兜底保留原文本",
  "complexity": "每图一次 captioning 前向，约 O(图像分辨率×模型) ，是数据准备中较贵一步，但通常一次性离线完成。",
  "beginnerSummary": "像请一位更会写作的人，把原本只有\"图1\"两个字的说明，重写成\"雪山下红色小屋，傍晚天空泛紫\"这样丰富的描述。",
  "diagram": "weak alt(\"pic1\") ─► [strong captioner] ─► rich caption\n                              │\n                    score<min_len? ─► fallback old",
  "derivation": [
    "为什么需要：网页 alt 文本普遍过短/无关，限制模型学细粒度对齐。",
    "怎么实现：强 captioner 离线生成新描述，按长度/质量择优替换，原文本兜底。",
    "有什么代价：captioning 推理成本高，且可能引入幻觉，需要事实一致性校验。",
    "怎么评测：人工评新文本信息量与准确性，及下游生成/检索指标。"
  ],
  "edgeCases": [
    "原 alt 为空，recaption 是唯一文本来源。",
    "强模型幻觉出图中没有的物体，需一致性过滤。",
    "艺术/抽象图难以用文字准确描述。",
    "多主体图描述侧重偏移。"
  ],
  "pitfalls": [
    "无脑替换导致原准确短文本被啰嗦但错误的长文本取代。",
    "captioner 风格单一，使训练文本分布同质化。"
  ],
  "prerequisites": [
    "图像 captioning / VLM",
    "文本质量评估",
    "图文对数据格式"
  ],
  "workedExample": [
    "原 alt=\"image3\"（无信息）→ 生成\"三只猫趴在木地板上\"。",
    "原 alt 长但偏题 → 保留原文本作兜底。",
    "最终 40M 弱对升级为平均 20 词描述。"
  ],
  "lineByLine": [
    "def recaption(image, old_text, captioner, min_len=10): 重写单图描述。",
    "new_text = captioner.describe(image) 调用强模型生成描述。",
    "if len(new_text) >= min_len: return new_text 达标则采用新文本。",
    "return old_text 否则回退原文本，避免丢失标注。"
  ],
  "codeNotes": [
    "min_len 只是粗过滤，还应加质量/一致性分才稳妥。"
  ],
  "followUps": [
    {
      "question": "recaption 会引入幻觉怎么办？",
      "answer": "用原文本和生成文本做一致性校验，或只替换明显过短的，并对长文本保守。"
    },
    {
      "question": "合成 caption 能完全替代人工标注吗？",
      "answer": "不能，关键评测/难例仍需人工，合成文本适合做大规模预训练增益。"
    }
  ],
  "followUpAnswers": [
    "用原文本和生成文本做一致性校验，或只替换明显过短的，并对长文本保守。",
    "不能，关键评测/难例仍需人工，合成文本适合做大规模预训练增益。"
  ],
  "kind": "concept"
};
