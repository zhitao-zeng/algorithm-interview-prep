export default {
  "kind": "concept",
  "id": "mm-video-token-compress",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "长视频为什么会产生 Token Explosion？有哪些视频 Token 压缩方法？",
  "prompt": "长视频为什么会产生 Token Explosion？有哪些视频 Token 压缩方法？",
  "quickAnswer": "视频相比图像多了时间维度：帧×空间 patch×通道，token 数随帧数和分辨率近似线性膨胀，长视频/高分辨率会迅速撑爆上下文与算力（Token Explosion）。压缩分几类：输入侧（均匀/动态采帧、降分辨率、Patch Merge）、模型侧（Pooling、Query Token、Token Pruning 剪冗余、Token Merging 合并相似）、跨模态（文本/音频/事件引导保留关键帧与区域）。目标是保住 OCR、小目标、关键动作等信息的同时降 token 数。",
  "approach": "从“采帧—空间—时序—语义”多阶段压缩，按信息重要性保留 token。",
  "explanationFocus": "是什么：视频 token 爆炸来自时间×空间维度；压缩路线分输入变换、相似度合并、注意力选择、查询压缩四类。",
  "bruteForce": "把每一帧每个 patch 都送进 LLM（不压缩），长视频直接超上下文。",
  "derivation": [
    "为什么需要：视频 token = 帧数 × 每帧 patch 数 × 通道，长视频轻易超 LLM 上下文与算力。",
    "输入侧怎么做：均匀/动态采帧、降空间分辨率、Patch Merge 减少每帧 patch。",
    "模型侧怎么做：Pooling 下采样、Query Token 用少量可学习向量聚合、Pruning 删低注意力的 token、Merging 合并相似 token。",
    "怎么评测：在下游任务（检索/问答/描述）上比较压缩率与精度，看是否丢 OCR/小目标/关键动作。"
  ],
  "invariant": "压缩的目标是在可接受的精度损失内降低 token 数；不能只均匀抽帧，否则会丢时序关键事件。",
  "walkthrough": "一段 60s@1fps×720p 视频，每帧约 600 patch，则 ~36k token；若抽到 0.5fps + Patch Merge 4×，可降到 ~4.5k，但需保证关键动作帧不被抽掉。",
  "edgeCases": [
    "只均匀抽帧：可能漏掉短时关键动作（如“关门”“摔倒”）。",
    "Token Pruning 过狠：删掉低注意力但含 OCR/小目标的 token。",
    "压缩放在 LLM 中间层：可能已丢失早期细节，需权衡位置。"
  ],
  "code": "# Python\ndef video_tokens(frames, patches_per_frame, sample_rate=1.0, merge=1):\n    n = int(frames * sample_rate)\n    per = patches_per_frame // merge\n    return n * per   # 近似 token 数(未计通道/查询压缩)\n# 均匀抽帧+Patch Merge 的简化估算",
  "codeNotes": [
    "真实压缩还含 Query Token/Pruning/Merging, 远非线性。",
    "关键帧/事件感知采样能保住时序重点。"
  ],
  "complexity": "原始 token ≈ 帧数 × 每帧 patch × 通道；压缩后随采样率与 merge 因子下降，但保信息需额外选择/合并计算。",
  "followUps": [
    {
      "question": "为什么不能只均匀抽帧？",
      "answer": "均匀抽会漏掉短时关键事件（动作、转场），且对长视频仍可能过多；需结合关键帧/事件感知采样。"
    },
    {
      "question": "视频比图片多了什么冗余？",
      "answer": "多了时间维度：相邻帧高度相似（时序冗余），以及运动一致性，可借帧间差/光流压缩。"
    },
    {
      "question": "Token Pruning 与 Token Merging 区别？",
      "answer": "Pruning 直接删除低重要性 token；Merging 把相似 token 合并为一个（保留信息更连续），二者粒度不同。"
    },
    {
      "question": "压缩放 LLM 前还是中间层？",
      "answer": "输入侧（前）压缩便宜但可能误删；中间层（如 ViT 后）可利用注意力分数更精准，但已占部分算力，需权衡。"
    },
    {
      "question": "如何保证 OCR、小目标、关键动作不丢？",
      "answer": "用文本/音频/事件引导的保留策略、关键帧检测、以及对低层特征的保护，避免只按全局注意力剪枝。"
    }
  ],
  "followUpAnswers": [
    "均匀抽会漏关键事件。",
    "多了时间维度时序冗余。",
    "Pruning 删, Merging 合并。",
    "前压缩便宜, 中层更准。",
    "用跨模态引导保关键信息。"
  ],
  "pitfalls": [
    "以为抽帧率越低越好（错：丢时序关键事件）。",
    "把 Pruning 与 Merging 混为一谈。",
    "只按全局注意力剪枝，丢 OCR/小目标。"
  ],
  "beginnerSummary": "一张图切成很多小块（patch）送进模型，视频就是成千上万张图连起来——帧数×每帧块数，token 数量爆炸式增长，轻易超出模型能处理的字数上限。压缩办法有几类：拍得少一点（抽帧）、每块大一点（降分辨率/合并 patch）、模型自己挑重要的留（Pooling/Query Token）、把差不多的块合并或删掉（Pruning/Merging）、还可以让文字或声音提示“这段重要别删”。但光“每隔几帧抽一张”会漏掉一闪而过的动作（比如摔跤），所以得聪明地抽。",
  "prerequisites": [
    "视频 = 时间×空间 的 token 网格。",
    "LLM 有上下文长度上限。",
    "相邻帧有高度时序冗余。"
  ],
  "workedExample": [
    "60s@1fps×600patch ≈ 36k token; 抽0.5fps+merge4× → ~4.5k。",
    "仅均匀抽帧漏掉短时'摔倒'动作。"
  ],
  "lineByLine": [
    "视频 token = 帧×每帧patch×通道。",
    "输入侧: 抽帧/降分辨率/merge。",
    "模型侧: pooling/query/prune/merge。",
    "跨模态引导保关键。",
    "目标: 精度损失内降 token。"
  ],
  "diagram": "视频 Token 压缩:\n输入侧: 均匀/动态采帧, 降分辨率, Patch Merge\n模型侧: Pooling, Query Token, Pruning, Merging\n跨模态: 文本/音频/事件引导保留\n目标: 保 OCR/小目标/关键动作, 降 token"
};
