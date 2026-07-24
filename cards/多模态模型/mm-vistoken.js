export default {
  "kind": "concept",
  "id": "mm-vistoken",
  "category": "多模态模型",
  "difficulty": "Easy",
  "title": "视觉 token 化 patch→token",
  "prompt": "把图像变成\"视觉 token\"这一步具体是怎么做的？",
  "quickAnswer": "标准做法(沿 ViT)是把图像切成不重叠的 p×p patch，每个 patch 展平后经线性层投影成 d 维向量并加上位置嵌入，得到一串视觉 token，token 数 = (H/p)×(W/p)。它是把二维像素转成一维序列、使其能被 Transformer/LLM 消费的关键一步。patch 越小 token 越多、细节越好但算力 O(token^2) 涨；patch 越大越快但丢细节；高分辨率时 token 爆炸需用切图/采样控制。",
  "approach": "resize → 切 patch → 展平 → 线性投影 + 位置嵌入 → token 序列。具体：先把图归一到模型输入尺寸，按 patch 大小切成不重叠网格，每块展平成 c·p·p 维向量，过 Linear 投到 d 维，叠加可学习或二维插值得到的位置嵌入；对超高分辨率可做切图再分别编码后拼接，兼顾细节与序列长度。",
  "explanationFocus": "是什么：视觉 token 化是把一张图像切成若干不重叠的 p×p patch，每个 patch 展平后经线性层投影成向量并加上位置嵌入，得到一串视觉 token，使图像能被 Transformer/LLM 当作\"词序列\"消费。token 数 = (H/p)×(W/p)，这是连接二维像素与一维序列、让多模态模型看懂图的关键一步。",
  "bruteForce": "最朴素是把整图展平成一长向量直接喂全连接：维度=H·W·C 极高(如 336·336·3≈33 万)，参数爆炸且完全丢失局部结构(相邻像素的局部相关性被抹平)，Transformer 也无法高效建模。patch 化正是为了兼顾局部性与序列长度可控，是连接 CNN 局部性与 Transformer 全局性的桥梁。",
  "derivation": [
    "为什么需要：Transformer/LLM 吃的是一维 token 序列，而图像是二维像素网格。要先把它离散成定长、含结构的 token，才能复用同一套序列建模；直接展平维度过高且丢失局部性，所以必须用 patch 切块。",
    "怎么实现：图像除以 patch 尺寸得到网格，每格展平投影为 d 维向量，叠加可学习或二维位置嵌入(标明行列)。实现上常用 reshape+permute 不重叠切分，再接 Linear 投影到 d 维。",
    "有什么代价：patch 越小 token 越多、算力 O(token^2) 涨；patch 越大丢细节、定位/grounding 变差。分辨率升高时 N 平方级膨胀，需要切图或 token 合并来控制。",
    "怎么评测：下游任务精度随 token 数/token 质量的曲线、定位能力(grounding/检测)。消融\"去掉位置嵌入\"应观察到空间能力明显下降，验证位置信息确实被模型利用。"
  ],
  "invariant": "相同图像与相同切分参数(patch 大小、是否切图)得到相同数量与内容的视觉 token；这是可复现性的基础，也是后续位置嵌入正确对齐、跨模态注意力能对应到正确空间位置的前提。",
  "walkthrough": "以 336×336 图像、patch=14 为例：网格 24×24=576 个视觉 token，每 token 投影到 1024 维。若用 patch=16 则 21×21=441 token，略省算力；若图升到 448×448 同 patch=14 则 32×32=1024 token，注意力 O(n^2) 涨到约 3.1 倍。高分辨率模型(如 448/672)常配合切图(把大图切成多个 336 子图)控制单图 token 数，否则 KV 与算力爆炸，长上下文多图场景尤甚。",
  "edgeCases": [
    "图像尺寸非 patch 整数倍：需 resize 到整数倍或 pad，否则 reshape 维度不匹配、切分失败。",
    "高分辨率：token 数激增需切图(多个子图)或降采样，否则注意力 O(n^2) 与 KV 不可承受。",
    "非方形 patch：位置嵌入需相应调整(二维插值或自定义)，不能套用方形假设。",
    "极端长宽比图像：均匀切 patch 会产生大量 padding，需自适应切分策略减少浪费。"
  ],
  "code": "def patchify(img, p=14):\n    b, c, h, w = img.shape\n    assert h % p == 0 and w % p == 0\n    tokens = img.reshape(b, c, h//p, p, w//p, p)\n    tokens = tokens.permute(0, 2, 4, 1, 3, 5).flatten(3)   # (B, H/p, W/p, c*p*p)\n    return tokens.reshape(b, -1, c*p*p)                    # (B, N, patch_dim)",
  "codeNotes": [
    "reshape+permute 实现不重叠切分，无重叠保证 token 数最小、信息不冗余。",
    "之后接 Linear 投影到 d 维并加位置嵌入；位置嵌入可用可学习或正弦/二维插值。",
    "patch_dim = c·p·p，p 越大单 token 信息量越大但数量越少，是精度/算力的重要旋钮。"
  ],
  "complexity": "token 数 N=(H/p)·(W/p)；投影开销 O(N·patch_dim·d)。注意力主导成本 O(N^2·d)。因此 N 随分辨率平方增长，是视觉大模型算力的主要来源；降低 N(大 patch/切图/token 合并)是降本核心杠杆，也是高分辨率多模态部署的关键优化点。",
  "followUps": [
    {
      "question": "patch 大小怎么选？",
      "answer": "小 patch(如 14)保细节、定位准但 token 多、注意力 O(n^2) 贵；大 patch(如 32)快但粗、grounding 变差。常按分辨率与任务在 14~32 间权衡：高分辨率理解/检测用较小 patch，粗分类可用较大 patch。还需与模型预训练时的 patch 尺寸一致，否则位置嵌入需重新插值，可能掉点。"
    },
    {
      "question": "位置嵌入为什么不能少？",
      "answer": "去掉后模型拿到的是一堆\"顺序无关\"的 patch 向量，不知道哪块在图上哪个位置，空间信息完全丢失，导致定位、检测、图文对齐(grounding)等依赖空间关系的任务大幅下降。位置嵌入给每个 token 注入行列坐标，是视觉 token 保持\"图像性\"的关键，消融实验里去掉它精度通常明显掉。"
    }
  ],
  "followUpAnswers": [
    "小 patch(如 14)保细节、定位准但 token 多、注意力 O(n^2) 贵；大 patch(如 32)快但粗、grounding 变差。常按分辨率与任务在 14~32 间权衡：高分辨率理解/检测用较小 patch，粗分类可用较大 patch。还需与模型预训练时的 patch 尺寸一致，否则位置嵌入需重新插值，可能掉点。",
    "去掉后模型拿到的是一堆\"顺序无关\"的 patch 向量，不知道哪块在图上哪个位置，空间信息完全丢失，导致定位、检测、图文对齐(grounding)等依赖空间关系的任务大幅下降。位置嵌入给每个 token 注入行列坐标，是视觉 token 保持\"图像性\"的关键，消融实验里去掉它精度通常明显掉。"
  ],
  "pitfalls": [
    "忽略尺寸非整数倍导致的对齐错误(reshape 维度不匹配，运行即报错)。",
    "盲目减小 patch 引发 token 爆炸，注意力算力与 KV 不可承受。",
    "忘记加位置嵌入，模型不知道 patch 在空间的位置，定位/grounding 能力丧失。"
  ],
  "beginnerSummary": "把图变成 token 就像把一张大拼图拆成许多等大的小方块，每块编个号写成一句描述。方块越小(描述越细)图越清楚但句子越长、越费算力；方块越大越省事但看不清细节。编号(位置嵌入)很重要，否则模型不知道哪块在图上哪个位置，空间信息就丢了，定位能力会崩。",
  "prerequisites": [
    "图像是二维像素网格：理解 'H×W×C' 到序列的维度转换需求。",
    "Transformer 吃一维序列：任何非序列输入(图、音频)都需先 token 化。",
    "位置信息需显式编码：patch 打乱后顺序无意义，必须靠位置嵌入恢复空间。"
  ],
  "workedExample": [
    "336×336, patch=14 → 24×24=576 token，每 token 投影到 1024 维。",
    "同图 patch=16 → 21×21=441 token，省约 24% 算力但细节略粗。",
    "448×448 patch=14 → 32×32=1024 token，注意力算力约为 576 token 的 3.1 倍，需切图控制。"
  ],
  "lineByLine": [
    "图像按 patch 尺寸切分：reshape 出 (B, C, H/p, p, W/p, p) 网格。",
    "每块展平成一维向量：permute+flatten 成 (B, N, C·p·p)。",
    "线性投影到模型维度 d：接 Linear，得到 (B, N, d) 的 token 序列。",
    "加位置嵌入保留空间：可学习或二维插值，标明每块行列位置，供后续注意力使用。"
  ],
  "diagram": "图像(336x336) ─▶ 切14x14块 ─▶ 576块\n   每块展平 ─▶ 投影 ─▶ 视觉token(1024维)"
};
