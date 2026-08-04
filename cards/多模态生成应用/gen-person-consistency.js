export default {
  "id": "gen-person-consistency",
  "category": "多模态生成应用",
  "difficulty": "Hard",
  "title": "人物一致性：ArcFace 身份相似度与锚点检索去重",
  "prompt": "做人物一致性生成时，如何用 ArcFace 量化身份相似度并通过几何归一化与分散锚点做 embedding 检索去重？",
  "quickAnswer": "先用 ArcFace 取归一化身份向量，按人脸几何（眼距/角度）归一化对齐后算余弦相似度；再用 FPS 抽帧 + k-means++ 选分散锚点，对候选图做近邻检索与去重，保证同一角色跨镜头一致。",
  "code": "import numpy as np\nfrom sklearn.cluster import KMeans\n\ndef identity_similarity(emb_a, emb_b):\n    # ArcFace 输出已是归一化特征, 余弦即可度量身份相似度\n    a = emb_a / np.linalg.norm(emb_a)\n    b = emb_b / np.linalg.norm(emb_b)\n    return float(np.dot(a, b))\n\ndef select_anchors(embs, fps: int, k: int):\n    # 按 FPS 均匀抽帧 + k-means++ 选分散锚点做检索去重\n    sampled = embs[::fps]\n    km = KMeans(n_clusters=k, init='k-means++', n_init=4).fit(sampled)\n    return km.cluster_centers_\n",
  "complexity": "相似度 O(d)、空间 O(d)；k-means++ 选 k 锚点约 O(k·n·d)",
  "beginnerSummary": "ArcFace 像给每张脸发一张身份证向量，向量越近越像同一个人；先摆正脸再比对，并用几个分散的样板脸快速找重复。",
  "derivation": [
    "为什么需要：多镜头/多角色生成容易出现脸变样或同人重复，需要客观度量身份一致并去重。",
    "怎么实现：ArcFace 输出单位球上特征，几何归一化消除姿态偏差后用余弦度量；FPS 均匀抽帧后用 k-means++ 选最分散的 k 个锚点代表该角色。",
    "有什么代价：ArcFace 对遮挡/大角度仍会降分，几何归一化本身有误差；k-means++ 随机性需固定 seed 保证可复现。",
    "怎么评测：在同人不同图间算平均相似度应高于阈值，跨人应低于阈值；去重后保留集重复率应接近 0。"
  ],
  "edgeCases": [
    "侧脸/遮挡导致 ArcFace 向量落入错误簇，相似度骤降。",
    "两人长相接近时余弦阈值难以区分，需要配合属性校验。",
    "k-means++ 随机种子不同会选到不同锚点，去重结果不稳定。",
    "视频帧率变化使 FPS 抽帧密度不均，锚点覆盖偏差。"
  ],
  "pitfalls": [
    "直接用原始像素算相似度而非归一化 ArcFace 向量，姿态一变就误判。",
    "把 k-means 默认 init 当确定性结果，复现时锚点漂移引发评测抖动。"
  ],
  "prerequisites": [
    "人脸检测与 ArcFace / 度量学习",
    "余弦相似度与向量检索",
    "聚类与 k-means++ 初始化"
  ],
  "workedExample": [
    "对某角色 200 帧抽 10 fps 得 20 张，算两两 ArcFace 余弦，平均 0.62 高于 0.5 阈值判定一致。",
    "用 k-means++ 选 3 个锚点，对候选新图做近邻检索，余弦>0.55 的判为重复并剔除，保留 5 张多样图。"
  ],
  "lineByLine": [
    "def identity_similarity：计算两张脸身份相似度。",
    "a=emb_a/norm；b=emb_b/norm：ArcFace 特征再归一化到单位向量。",
    "return dot(a,b)：返回余弦相似度作为身份得分。",
    "def select_anchors：按 FPS 与 k-means++ 选分散锚点。",
    "sampled=embs[::fps]：每隔 fps 帧取一帧降低冗余。",
    "KMeans(init='k-means++')：用分散初始化选 k 个代表锚点。",
    "return km.cluster_centers_：返回锚点 embedding 供检索。"
  ],
  "followUps": [
    {
      "question": "几何归一化具体怎么做？",
      "answer": "用关键点（双眼、鼻尖）做人脸仿射对齐到标准模板，再送 ArcFace，消除旋转缩放带来的向量偏差。"
    },
    {
      "question": "k-means++ 相比 random 好在哪？",
      "answer": "它按距离概率选初始中心，使锚点彼此分散，避免聚到同一密集区，去重覆盖更均匀。"
    },
    {
      "question": "锚点数量 k 怎么定？",
      "answer": "按角色表情/光照跨度经验取 3~8，k 太小覆盖不全、太大检索成本升高，可用肘部法在验证集上选。"
    }
  ],
  "followUpAnswers": [
    "用关键点（双眼、鼻尖）做人脸仿射对齐到标准模板，再送 ArcFace，消除旋转缩放带来的向量偏差。",
    "它按距离概率选初始中心，使锚点彼此分散，避免聚到同一密集区，去重覆盖更均匀。",
    "按角色表情/光照跨度经验取 3~8，k 太小覆盖不全、太大检索成本升高，可用肘部法在验证集上选。"
  ],
  "explanationFocus": "是什么：ArcFace 是一种加角度间隔的人脸识别损失训练的骨干，输出位于单位超球面的高判别性身份 embedding，可直接用余弦距离度量是否为同一人。",
  "approach": "先几何归一化对齐姿态再取 ArcFace 向量，FPS 抽帧降冗余后用 k-means++ 选分散锚点，以锚点为代表做近邻检索与阈值去重，兼顾一致性与多样性。",
  "kind": "concept"
};
