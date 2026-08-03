export default {
  "id": "de-image-text-pair",
  "category": "多模态数据工程",
  "difficulty": "Easy",
  "title": "图文对构建与对齐",
  "prompt": "如何从网页中构建高质量的（图像, 文本）训练对，并保证图文语义对齐？",
  "quickAnswer": "构建步骤：抽取页面图片与其周围 alt 文本/标题/上下文，用规则清洗噪声（如按钮图标、占位图），再用图文相关性模型筛选真正描述关系的样本。对齐质量直接决定 CLIP 类模型能否学到正确的跨模态映射。",
  "approach": "解析 DOM 取 img 与其邻近文本节点，过滤无语义的装饰图，再用一个图文匹配打分模型对候选对排序，保留高分对。",
  "explanationFocus": "是什么：图文对构建是从网页/文档中抽取\"图像\"与\"描述它的文本\"并配成训练样本的过程；对齐指文本确实描述该图像内容而非仅同处一页。",
  "bruteForce": "朴素做法：把页面里每张图和整页正文拼成一对，不区分是否相关。",
  "invariant": "核心不变式：保留的图文对必须满足图文相关性分 > 阈值，且图像为非装饰性有效图片。",
  "walkthrough": "某页有 12 张图，其中 3 张是 logo/按钮、2 张是广告，剩 7 张配 alt 或标题。相关性模型给 5 张打高分（>0.7），2 张中等（0.4）被截掉，最终该页产出 5 个高质量图文对。",
  "code": "def build_pairs(dom, scorer, thr=0.7):\n    pairs = []\n    for img in dom.images:\n        if img.is_decorative():\n            continue\n        ctx = img.nearest_text()\n        if scorer(img, ctx) >= thr:\n            pairs.append((img.url, ctx))\n    return pairs",
  "complexity": "每页 O(图片数×上下文长度) 做规则，加 O(图片数) 次模型打分，整体随页面数线性。",
  "beginnerSummary": "像给杂志图片配图注：只给真正有说明文字的照片配，跳过 logo 和广告，且确保说明写的就是这张图。",
  "diagram": "page DOM\n  img1(logo) ─X\n  img2(photo)+alt ─► scorer 0.8 ─► keep\n  img3(ad)    ─X\n  img4(photo)+title─► scorer 0.4 ─X",
  "derivation": [
    "为什么需要：网页图文同处但不一定相关，错配样本会教坏跨模态对齐。",
    "怎么实现：DOM 抽取邻近文本 + 装饰图过滤 + 图文相关性打分截断。",
    "有什么代价：需要图文匹配模型推理，且上下文窗口有限可能漏掉远距离描述。",
    "怎么评测：人工标图文相关准确率，及 CLIP 类模型零样本分类/检索指标。"
  ],
  "edgeCases": [
    "图在文前很远，邻近文本并非描述。",
    "CSS 背景图被误当内容图。",
    "alt 为空但标题在父节点。",
    "多图共用一段说明需拆句分配。"
  ],
  "pitfalls": [
    "用整页正文当所有图的文本，制造大量错配。",
    "把二维码/表情包当有效图像保留。"
  ],
  "prerequisites": [
    "HTML/DOM 解析",
    "图文匹配模型(CLIP类)",
    "文本邻近性启发式"
  ],
  "workedExample": [
    "img2 的 alt=\"雪山日落\"，scorer 给 0.82 → 保留。",
    "img4 标题\"点击购买\"与图无关，scorer 0.4 → 丢弃。",
    "最终每页平均保留 4-6 个有效对。"
  ],
  "lineByLine": [
    "def build_pairs(dom, scorer, thr=0.7): 定义从页面抽取图文对。",
    "for img in dom.images: 遍历页面所有图片。",
    "if img.is_decorative(): continue 跳过 logo/按钮等装饰图。",
    "ctx = img.nearest_text() 取邻近文本作为候选描述。",
    "if scorer(img, ctx) >= thr: 相关性达标才保留。"
  ],
  "codeNotes": [
    "阈值 thr 控制精度-召回权衡，高精度场景取更高值。"
  ],
  "followUps": [
    {
      "question": "没有 alt 文本怎么办？",
      "answer": "用标题、段落或周边 caption，或退回用图像 captioning 模型生成再校验。"
    },
    {
      "question": "图文相关性模型怎么来？",
      "answer": "可用现成 CLIP 类模型做零样本打分，或用手工标注对微调。"
    }
  ],
  "followUpAnswers": [
    "用标题、段落或周边 caption，或退回用图像 captioning 模型生成再校验。",
    "可用现成 CLIP 类模型做零样本打分，或用手工标注对微调。"
  ],
  "kind": "concept"
};
