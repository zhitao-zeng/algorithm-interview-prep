export default {
  "id": "vis-visual-grounding",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "视觉定位：Grounding 与 Referring Expression",
  "difficulty": "Medium",
  "prompt": "视觉定位（visual grounding / referring expression）是什么？与纯目标检测的语言对齐有何不同？",
  "quickAnswer": "视觉定位按自然语言短语在图中定位对应区域（框或掩码），如\"左边穿红衣的人\"。它比检测多了语言条件：模型需把文本指代表达与视觉区域跨模态对齐。常用短语-区域对比或检测+语言融合（如 GLIP、MDETR），是开放词汇检测的前身。",
  "code": "import torch\n\ndef grounding_score(text_feat, region_feats):\n    # text_feat:[D], region_feats:[N,D]\n    region_feats = torch.nn.functional.normalize(region_feats, dim=-1)\n    return region_feats @ text_feat.unsqueeze(-1)",
  "complexity": "O(N·D) 区域-文本",
  "beginnerSummary": "不只是\"图里有什么\"，而是\"你说的那个在哪\"——用一句话指出目标，这就是视觉定位。",
  "explanationFocus": "是什么：视觉定位依据自然语言描述在图像中找出对应区域，是检测与语言对齐的交叉任务，输出与短语对应的框/掩码。",
  "approach": "把文本编码为短语向量，与候选区域（检测框/像素）视觉特征做相似度匹配；或用统一检测器在文本条件下直接预测，实现开放词汇定位。",
  "derivation": [
    "为什么需要：用户用语言交互式指定目标，比固定类别检测更灵活。",
    "怎么实现：区域-文本对比对齐，或端到端文本条件检测。",
    "有什么代价：需短语-区域配对标注，语言歧义与多目标指代难。",
    "怎么评测：定位 Acc@0.5 IoU、定位 mAP（如 RefCOCO）。"
  ],
  "edgeCases": [
    "代词/相对位置（\"那个\"）指代模糊。",
    "描述匹配多个区域需排序而非二分类。",
    "文本出现训练未见属性组合。"
  ],
  "pitfalls": [
    "把它等同于检测+caption，忽略\"对齐\"核心。",
    "忽略语言组合泛化，仅在见过的短语上评测。"
  ],
  "prerequisites": [
    "目标检测",
    "文本编码与跨模态对齐"
  ],
  "workedExample": [
    "RefCOCO 句子\"穿蓝色衬衫的男人\"应定位到特定框。",
    "GLIP 用文本提示\"person.red shirt\"直接检测对应区域。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def grounding_score(text_feat, region_feats)：算区域与文本相似度。",
    "normalize(region_feats)：区域特征归一化。",
    "return region_feats @ text_feat：点积得每个区域的匹配分，取最高为定位。"
  ],
  "followUps": [
    {
      "question": "视觉定位与开放词汇检测关系？",
      "answer": "开放词汇检测把定位推广到任意文本类别，可视为 grounding 的规模化，共享文本-区域对齐预训练。"
    },
    {
      "question": "Referring expression 的歧义如何处理？",
      "answer": "用上下文与关系建模（如\"左边\"\"更大\"）消解，并输出置信分布而非硬决策，配合交互式澄清。"
    }
  ],
  "followUpAnswers": [
    "开放词汇检测把定位推广到任意文本类别，可视为 grounding 的规模化，共享文本-区域对齐预训练。",
    "用上下文与关系建模（如\"左边\"\"更大\"）消解，并输出置信分布而非硬决策，配合交互式澄清。"
  ],
  "order": 10
};
