export default {
  "kind": "concept",
  "id": "mm-clip",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "图文对比学习 CLIP",
  "prompt": "CLIP 这种图文对比学习是怎么把图像和文本拉到同一个空间的？",
  "quickAnswer": "CLIP 用两个编码器(图像 Encoder + 文本 Encoder)分别把图片和句子编码成向量，在批量内做对比损失(InfoNCE)：让「匹配的图文对」相似度最大、「不匹配对」最小。训练后图像与文本嵌入落在同一空间，可直接做零样本分类与跨模态检索，也是多模态模型对齐的基石。",
  "approach": "图文对 → 双编码器 → 归一化向量 → 批内对比损失 → 共享嵌入空间。",
  "explanationFocus": "是什么：CLIP 是一种图文对比学习方法，用双塔编码器 + InfoNCE 把图像和文本映射到可互相比对的同一向量空间。",
  "bruteForce": "给每张图人工打标再分类：标注贵、泛化差、无法零样本。",
  "derivation": [
    "为什么需要：图像与文本天然异构，需要可计算的\"语义相近\"度量，且希望无需逐类标注就能泛化。",
    "怎么实现：图像塔与文本塔各输出 L2 归一化向量，构造相似度矩阵，对批内 N 个正对做交叉熵(行/列各一次)，优化 InfoNCE。",
    "有什么代价：依赖海量(数亿)图文对与大 batch，训练贵；分布外、细粒度、抽象概念易翻车。",
    "怎么评测：零样本分类准确率、跨模态检索 Recall@K、下游对齐质量(probe)。"
  ],
  "invariant": "匹配图文对的余弦相似度应显著高于随机对；嵌入空间对两类模态一致。",
  "walkthrough": "batch=32768，得到 32768x32768 相似度矩阵，对角线为正对，其余为负，两侧交叉熵各算一次。",
  "edgeCases": [
    "一张图配多句描述：需做配对采样或加权。",
    "分布外/抽象概念：零样本易错。",
    "细粒度区分(同物不同款)：对比信号太粗。"
  ],
  "code": "def clip_loss(img_emb, txt_emb, temp):\n    img_emb = normalize(img_emb); txt_emb = normalize(txt_emb)\n    logits = matmul(img_emb, txt_emb.T) * exp(temp)   # (N,N)\n    labels = arange(N)                                # 对角线为正对\n    return (ce(logits, labels) + ce(logits.T, labels)) / 2",
  "codeNotes": [
    "两塔对称，损失取图像→文本与文本→图像两侧平均。",
    "温度 temp 是可学习标量，控制分布锐度。"
  ],
  "complexity": "相似度矩阵 O(N^2)，N 为 batch 大小；双塔各 O(序列)。",
  "followUps": [
    {
      "question": "CLIP 能直接做零样本分类吗？",
      "answer": "能：把类别名写成 prompt 编码成文本向量，与图像向量算相似度取最高，即零样本分类。"
    },
    {
      "question": "为什么要用大 batch？",
      "answer": "对比学习靠大量负样本撑起难负例，batch 越大负对越多、表征越好，故常配分布式大 batch。"
    }
  ],
  "followUpAnswers": [
    "用 prompt 编码类别名比对图像向量。",
    "大 batch 提供更多负样本。"
  ],
  "pitfalls": [
    "以为 CLIP 空间语义完美，忽略分布外失效。",
    "仅看零样本均值，忽视细粒度/长尾翻车。"
  ],
  "beginnerSummary": "CLIP 像同时请了一位\"看图老师\"和\"读句老师\"，把图和句子都翻译成同一套\"意义坐标\"。训练时让它知道哪句描述配哪张图(正对)，不配的(负对)就推远。练成后，随便给张新图，它就能在没见过类别的情况下，靠\"哪句描述坐标离得近\"来认图。",
  "prerequisites": [
    "图像/文本各自可编码成向量。",
    "余弦相似度能量化语义接近度。",
    "对比学习靠正负对拉开距离。"
  ],
  "workedExample": [
    "图文对 4 亿张预训练。",
    "零样本把 \"a photo of a cat\" 与猫图相似度判最高。"
  ],
  "lineByLine": [
    "图像塔与文本塔分别编码。",
    "向量归一化到单位球面。",
    "算批内相似度矩阵。",
    "对角线为正对，对比损失拉近距离、推远负对。"
  ],
  "diagram": "图像 ─▶ 图像塔 ─┐\n                  ├─▶ 相似度矩阵 ─▶ InfoNCE(正对近/负对远)\n文本 ─▶ 文本塔 ─┘"
};
