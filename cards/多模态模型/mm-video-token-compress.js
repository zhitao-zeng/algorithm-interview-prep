export default {
  "kind": "concept",
  "id": "mm-video-token-compress",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "长视频为什么会产生 Token Explosion？有哪些视频 Token 压缩方法？",
  "prompt": "长视频为什么会产生 Token Explosion？有哪些视频 Token 压缩方法？",
  "quickAnswer": "视频相比图像多了时间维度：帧×空间 patch×通道，token 数随帧数和分辨率近似线性膨胀，长视频/高分辨率会迅速撑爆上下文与算力（Token Explosion）。压缩分几类：输入侧（均匀/动态采帧、降分辨率、Patch Merge）、模型侧（Pooling、Query Token、Token Pruning 剪冗余、Token Merging 合并相似）、跨模态（文本/音频/事件引导保留关键帧与区域）。目标是保住 OCR、小目标、关键动作等信息的同时降 token 数。",
  "approach": "从“采帧—空间—时序—语义”多阶段压缩，按信息重要性保留 token：先抽帧与降空间分辨率，再在模型内做 Pooling/Query Token 聚合，最后用注意力分数 Pruning 或相似度 Merging 去冗余；跨模态信号（ASR/事件）引导保留关键帧。每一步都要校验是否丢了 OCR/小目标/关键动作。",
  "explanationFocus": "是什么：视频相比图像多了时间维度，token 数 ≈ 帧数 × 每帧 patch 数 × 通道，随帧数和分辨率近似线性膨胀，长视频/高分辨率会迅速撑爆 LLM 上下文与算力，这就是 Token Explosion。压缩路线分四类：输入变换（采帧/降分辨率/merge）、相似度合并（Token Merging）、注意力选择（Token Pruning）、查询压缩（Query Token）——目标是在可接受精度损失内降 token，同时保住 OCR、小目标、关键动作等易丢信息。",
  "bruteForce": "把每一帧每个 patch 都送进 LLM（不压缩）：一段 60s@30fps×720p 视频 token 数可达数百万，远超上下文，直接 OOM 或截断丢信息。",
  "derivation": [
    "为什么需要：视频 token = 帧数 × 每帧 patch 数 × 通道，长视频轻易超 LLM 上下文（如 128k）与算力，必须压缩才能进模型。",
    "输入侧怎么做：均匀/动态采帧、降空间分辨率、Patch Merge 减少每帧 patch；动态采帧用镜头边界/运动强度挑关键帧。",
    "模型侧怎么做：Pooling 下采样、Query Token 用少量可学习向量聚合（Q-Former/Resampler）、Pruning 删低注意力的 token、Merging 合并相似 token（ToMe）。",
    "怎么评测：在下游任务（检索/问答/描述）上比较压缩率与精度，看是否丢 OCR/小目标/关键动作，并用人工抽检关键帧保留率。"
  ],
  "invariant": "压缩的目标是在可接受的精度损失内降低 token 数；不能只均匀抽帧，否则会丢时序关键事件（短时动作/转场）。压缩位置（输入前 vs ViT 后）与策略需权衡：前压缩便宜但可能误删，中层利用注意力更精准但已占算力。",
  "walkthrough": "一段 60s@1fps×720p 视频，每帧约 600 patch，则 ~36k token；若抽到 0.5fps + Patch Merge 4×，可降到 ~4.5k，但需保证关键动作帧不被抽掉。若进一步用 32 个 Query Token 聚合（如 Q-Former/Resampler），可压到 ~32 token 进 LLM，但会丢细粒度 OCR——所以长视频常分层：粗压缩用于全局摘要，关键片段保留细粒度。",
  "edgeCases": [
    "只均匀抽帧：可能漏掉短时关键动作（如“关门”“摔倒”“爆炸”），需关键帧/事件感知采样补充。",
    "Token Pruning 过狠：删掉低注意力但含 OCR/小目标的 token，识别率掉。",
    "压缩放在 LLM 中间层：可能已丢失早期细节，需权衡位置（输入前便宜、ViT 后更准）。",
    "高帧率长视频：均匀抽仍过多，需结合镜头聚类去冗余。"
  ],
  "code": "# Python\ndef video_tokens(frames, patches_per_frame, sample_rate=1.0, merge=1):\n    n = int(frames * sample_rate)\n    per = patches_per_frame // merge\n    return n * per   # 近似 token 数(未计通道/查询压缩)\n# 均匀抽帧+Patch Merge 的简化估算",
  "codeNotes": [
    "真实压缩还含 Query Token/Pruning/Merging，远非线性，代码只是帧×patch 的近似估算。",
    "关键帧/事件感知采样能保住时序重点，比纯均匀抽更稳。",
    "merge 因子不是越大越好：4× 常可接受，16× 易丢小目标与文字。"
  ],
  "complexity": "原始 token ≈ 帧数 × 每帧 patch × 通道；压缩后随采样率与 merge 因子下降，但保信息需额外选择/合并计算（Pruning 需算注意力、Merging 需算相似度）。整体仍是线性或轻量二次，远小于直接把全 token 送 LLM 的 O(n²) 注意力。",
  "followUps": [
    {
      "question": "为什么不能只均匀抽帧？",
      "answer": "均匀抽会漏掉短时关键事件（动作、转场），且对长视频仍可能过多；需结合关键帧/事件感知采样（镜头边界检测、运动强度/光流幅值高的时刻优先保留）。理想是“均匀保覆盖 + 关键帧保重点”的混合策略。"
    },
    {
      "question": "视频比图片多了什么冗余？",
      "answer": "多了时间维度：相邻帧高度相似（时序冗余），以及运动一致性，可借帧间差/光流压缩；同一物体在多帧重复出现，可用跨帧聚合而非每帧独立编码。这是视频独有的、图片没有的压缩空间。"
    },
    {
      "question": "Token Pruning 与 Token Merging 区别？",
      "answer": "Pruning 直接删除低重要性 token（信息可能永久丢失）；Merging 把相似 token 合并为一个（保留信息更连续、平均而非丢弃），二者粒度不同。Merging（如 ToMe）通常比 Pruning 更保精度，但实现稍复杂。"
    },
    {
      "question": "压缩放 LLM 前还是中间层？",
      "answer": "输入侧（前）压缩便宜但可能误删关键信息；中间层（如 ViT 后、注意力之后）可利用注意力分数更精准地剪/并，但已占部分算力。实践常“前压缩打底 + 中层精修”，兼顾成本与保真。"
    },
    {
      "question": "如何保证 OCR、小目标、关键动作不丢？",
      "answer": "用文本/音频/事件引导的保留策略（如 ASR 提到某词就保对应帧）、关键帧检测、以及对低层特征的保护，避免只按全局注意力剪枝——低注意力区域常含关键文字/小物体，需跨模态信号兜底。"
    }
  ],
  "followUpAnswers": [
    "均匀抽会漏掉短时关键事件（动作、转场），且对长视频仍可能过多；需结合关键帧/事件感知采样（镜头边界检测、运动强度/光流幅值高的时刻优先保留）。理想是“均匀保覆盖 + 关键帧保重点”的混合策略。",
    "多了时间维度：相邻帧高度相似（时序冗余），以及运动一致性，可借帧间差/光流压缩；同一物体在多帧重复出现，可用跨帧聚合而非每帧独立编码。这是视频独有的、图片没有的压缩空间。",
    "Pruning 直接删除低重要性 token（信息可能永久丢失）；Merging 把相似 token 合并为一个（保留信息更连续、平均而非丢弃），二者粒度不同。Merging（如 ToMe）通常比 Pruning 更保精度，但实现稍复杂。",
    "输入侧（前）压缩便宜但可能误删关键信息；中间层（如 ViT 后、注意力之后）可利用注意力分数更精准地剪/并，但已占部分算力。实践常“前压缩打底 + 中层精修”，兼顾成本与保真。",
    "用文本/音频/事件引导的保留策略（如 ASR 提到某词就保对应帧）、关键帧检测、以及对低层特征的保护，避免只按全局注意力剪枝——低注意力区域常含关键文字/小物体，需跨模态信号兜底。"
  ],
  "pitfalls": [
    "以为抽帧率越低越好（错：丢时序关键事件，短时动作整段漏）。",
    "把 Pruning 与 Merging 混为一谈：Pruning 删、Merging 并，粒度与信息保留不同。",
    "只按全局注意力剪枝，丢 OCR/小目标：低注意力区域可能含关键文字，需跨模态引导保护。"
  ],
  "beginnerSummary": "一张图切成很多小块（patch）送进模型，视频就是成千上万张图连起来——帧数×每帧块数，token 数量爆炸式增长，轻易超出模型能处理的字数上限（上下文）。压缩办法有几类：拍得少一点（抽帧）、每块大一点（降分辨率/合并 patch）、模型自己挑重要的留（Pooling/Query Token）、把差不多的块合并或删掉（Pruning/Merging）、还可以让文字或声音提示“这段重要别删”。但光“每隔几帧抽一张”会漏掉一闪而过的动作（比如摔跤），所以得聪明地抽——结合关键帧检测，别把关键瞬间丢了。",
  "prerequisites": [
    "视频 = 时间×空间 的 token 网格，帧数放大 token 总量。",
    "LLM 有上下文长度上限（如 32k/128k），超了必须截断或压缩。",
    "相邻帧有高度时序冗余（运动一致性），可借帧间差/光流压缩。"
  ],
  "workedExample": [
    "60s@1fps×600patch ≈ 36k token；抽 0.5fps + merge 4× → ~4.5k，关键动作帧用事件采样保住。",
    "再叠 32 个 Query Token 聚合 → ~32 token 进 LLM 做全局摘要，但细粒度 OCR 需保留原片段。",
    "仅均匀抽帧漏掉短时“摔倒”动作；加运动强度关键帧检测后召回恢复。"
  ],
  "lineByLine": [
    "视频 token = 帧 × 每帧 patch × 通道，时间维是膨胀主因。",
    "输入侧：抽帧（均匀/动态）/降分辨率/Patch Merge 减每帧 token。",
    "模型侧：Pooling/Query Token/Pruning/Merging 进一步压缩与去冗余。",
    "跨模态引导（ASR/事件）保关键帧与区域，防误删。",
    "目标：在精度损失内降 token，保 OCR/小目标/关键动作。"
  ],
  "diagram": "视频 Token 压缩:\n输入侧: 均匀/动态采帧, 降分辨率, Patch Merge\n模型侧: Pooling, Query Token, Pruning, Merging\n跨模态: 文本/音频/事件引导保留\n目标: 保 OCR/小目标/关键动作, 降 token"
};
