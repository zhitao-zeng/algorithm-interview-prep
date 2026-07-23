export default {
  "kind": "concept",
  "id": "mm-vistoken",
  "category": "多模态模型",
  "difficulty": "Easy",
  "title": "视觉 token 化 patch→token",
  "prompt": "把图像变成\"视觉 token\"这一步具体是怎么做的？",
  "quickAnswer": "标准做法(沿 ViT)是把图像切成不重叠的 p×p patch，每个 patch 展平后经线性层投影成向量并加上位置嵌入，得到一串视觉 token。token 数 = (H/p)×(W/p)。这是把二维像素转成一维序列、使其能被 Transformer/LLM 消费的关键一步。",
  "approach": "resize → 切 patch → 展平 → 线性投影 + 位置嵌入 → token 序列。",
  "explanationFocus": "是什么：视觉 token 化是把一张图像切成若干小方块、每块编码成一个向量\"词\"，从而把图片变成 LLM 能读的一串 token。",
  "bruteForce": "整图展平成一长向量：维度过高、丢失局部结构。",
  "derivation": [
    "为什么需要：Transformer/LLM 吃序列，图像是二维网格，必须先离散成定长 token。",
    "怎么实现：图像除以 patch 尺寸得到网格，每格展平投影为 d 维向量，叠加可学习或二维位置嵌入。",
    "有什么代价：patch 越小 token 越多、算力 O(token^2) 涨；patch 越大丢细节。",
    "怎么评测：下游任务精度随 token 数/token 质量的曲线、定位能力(grounding)。"
  ],
  "invariant": "相同图像与切分参数得到相同数量与内容的视觉 token。",
  "walkthrough": "336x336 图, patch=14 → 24x24 = 576 个视觉 token，每 token 投影到 1024 维。",
  "edgeCases": [
    "图像尺寸非 patch 整数倍：需 resize 或 pad。",
    "高分辨率：token 数激增需切图。",
    "非方形 patch：位置嵌入需相应调整。"
  ],
  "code": "def patchify(img, p=14):\n    b, c, h, w = img.shape\n    assert h % p == 0 and w % p == 0\n    tokens = img.reshape(b, c, h//p, p, w//p, p)\n    tokens = tokens.permute(0, 2, 4, 1, 3, 5).flatten(3)   # (B, H/p, W/p, c*p*p)\n    return tokens.reshape(b, -1, c*p*p)                    # (B, N, patch_dim)",
  "codeNotes": [
    "reshape+permute 实现不重叠切分。",
    "之后接 Linear 投影到 d 维并加位置嵌入。"
  ],
  "complexity": "token 数 N = (H/p)·(W/p)；投影 O(N·patch_dim·d)。",
  "followUps": [
    {
      "question": "patch 大小怎么选？",
      "answer": "小 patch 保细节但 token 多、慢；大 patch 快但粗。常按分辨率与任务在 14~32 间权衡。"
    },
    {
      "question": "位置嵌入为什么不能少？",
      "answer": "去掉后模型不知道哪块在图上哪个位置，空间信息丢失、定位能力下降。"
    }
  ],
  "followUpAnswers": [
    "按分辨率与细节需求权衡。",
    "保持空间位置信息。"
  ],
  "pitfalls": [
    "忽略尺寸非整数倍导致的对齐错误。",
    "盲目减小 patch 引发 token 爆炸。"
  ],
  "beginnerSummary": "把图变成 token 就像把一张大拼图拆成许多等大的小方块，每块编个号写成一句描述。方块越小(描述越细)图越清楚但句子越长；方块越大越省事但看不清细节。编号(位置)很重要，否则模型不知道哪块在哪儿。",
  "prerequisites": [
    "图像是二维像素网格。",
    "Transformer 吃一维序列。",
    "位置信息需显式编码。"
  ],
  "workedExample": [
    "336x336, patch14 → 576 token。",
    "每 token 投影到 1024 维向量。"
  ],
  "lineByLine": [
    "图像按 patch 尺寸切分。",
    "每块展平成一维向量。",
    "线性投影到模型维度。",
    "加位置嵌入保留空间。"
  ],
  "diagram": "图像(336x336) ─▶ 切14x14块 ─▶ 576块\n   每块展平 ─▶ 投影 ─▶ 视觉token(1024维)"
};
