export default {
  "id": "de-multimodal-align",
  "category": "多模态数据工程",
  "difficulty": "Hard",
  "title": "多模态对齐数据构建",
  "prompt": "如何系统性地构建\"细粒度多模态对齐数据\"（区域-短语、时序-字幕、实体-属性），超越粗粒度图文对？",
  "quickAnswer": "细粒度对齐数据在三个层级增强：空间上用 grounding 把短语绑到图像区域（bounding box），时间上把字幕绑到视频片段，语义上把实体/属性显式标注。构建靠强 VLM 自动标注+人工校验，或用现成检测器+关联规则，显著提升模型细粒度理解与生成可控性。",
  "approach": "对图像用检测/分割+captioner 生成\"短语-区域\"对；对视频做 ASR 时间对齐成\"片段-字幕\"；再用 NER 抽取实体属性做结构化对齐，全部带坐标/时间戳元数据。",
  "explanationFocus": "是什么：多模态对齐数据超越\"整图-整段文本\"，把文本中的词/短语/实体精确绑定到图像的特定区域或视频的特定时刻，形成细粒度监督，使模型学会局部而非仅全局对应。",
  "bruteForce": "朴素做法：只用整图配整段 alt 训练，模型只学到全局粗对齐，难做指代与定位。",
  "invariant": "核心不变式：每个对齐单元（短语/实体）必须附带其空间区域或时间区间，且文本片段与区域/区间语义一致。",
  "walkthrough": "一张街景图：检测得 6 个区域，captioner 生成\"红色公交车停在左侧\"，NER 抽出\"公交车(红,左)\"并绑定 box#3。由此产生 6 个（短语, box）对齐对；视频侧 1 分钟片段对齐 8 条字幕时间戳。最终细粒度对占训练集 30%。",
  "code": "def align_phrase_region(caption, boxes, matcher):\n    spans = extract_noun_phrases(caption)\n    paired = []\n    for sp in spans:\n        box = matcher.match(sp, boxes)\n        if box:\n            paired.append({'phrase': sp, 'box': box})\n    return paired",
  "complexity": "每图 O(短语数×候选框) 匹配，加检测/caption 前向，整体随样本数线性但单样本更贵，属高质量小数据。",
  "beginnerSummary": "像给图画\"连线题\"：不光说\"图里有公交车\"，而是用线把\"公交车\"这几个字连到图上那辆车的位置，机器才真正懂哪部分对应哪句话。",
  "diagram": "caption: \"红色公交车在左侧\"\n   │\n  NER: 公交车(红,左)\n   │ match\n [box#3]◄──── 对齐单元 (phrase, box)\n其他 5 区域 ─► 各自短语绑定",
  "derivation": [
    "为什么需要：粗图文对只教全局对齐，模型不会指代、定位与细粒度控制。",
    "怎么实现：检测/分割产区域 + NER 产短语 + 匹配器绑定，视频加时间对齐。",
    "有什么代价：标注成本高、自动匹配有错绑风险，需校验，且数据更稀疏。",
    "怎么评测：在 grounding/指代/密集描述等细粒度 benchmark 上看提升。"
  ],
  "edgeCases": [
    "短语指代多个分散区域需多框绑定。",
    "模糊指代（\"它\"）无法定位需消歧。",
    "视频中实体跨片段出现，时间区间需合并。",
    "抽象属性（\"温暖氛围\"）无空间绑定。"
  ],
  "pitfalls": [
    "自动匹配把短语错绑到相似但错误的区域。",
    "只做图像忽略视频时序对齐，能力不完整。"
  ],
  "prerequisites": [
    "目标检测/分割",
    "命名实体识别(NER)",
    "跨模态匹配与 grounding"
  ],
  "workedExample": [
    "caption 提名词\"公交车\"，matcher 在 6 框中选中 box#3（红色、左）。",
    "产出对齐单元 {phrase:\"公交车\", box:[x1,y1,x2,y2]}。",
    "视频 60s 对齐 8 条带时间戳字幕，形成时序对齐。"
  ],
  "lineByLine": [
    "def align_phrase_region(caption, boxes, matcher): 做短语-区域对齐。",
    "spans = extract_noun_phrases(caption) 从描述抽取名词短语。",
    "for sp in spans: 遍历每个短语。",
    "box = matcher.match(sp, boxes) 在候选框中匹配对应区域。",
    "if box: paired.append(...) 命中则记录对齐单元。"
  ],
  "codeNotes": [
    "matcher 可用区域-文本相似度模型，比 IoU 启发式更准。"
  ],
  "followUps": [
    {
      "question": "自动对齐出错如何控制？",
      "answer": "对低置信匹配做人工抽检或阈值过滤，并用一致性（同图多次生成是否稳定）做质量门。"
    },
    {
      "question": "细粒度数据要占多大比例？",
      "answer": "不必全量，常作为高质量小比例混合（如 10-30%）即可显著提升细粒度能力。"
    }
  ],
  "followUpAnswers": [
    "对低置信匹配做人工抽检或阈值过滤，并用一致性（同图多次生成是否稳定）做质量门。",
    "不必全量，常作为高质量小比例混合（如 10-30%）即可显著提升细粒度能力。"
  ],
  "kind": "concept"
};
