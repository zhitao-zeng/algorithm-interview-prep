export default {
  "kind": "concept",
  "id": "mm-video-temporal",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "视频理解处理时序",
  "prompt": "多模态模型处理视频时，怎么把\"时间\"这一维有效地建模进去？",
  "quickAnswer": "视频 = 多帧图像 + 时间。常见做法：对每帧独立提视觉 token(M-RoPE 时间维区分帧)，再(1) 直接拼接所有帧 token 让注意力学时序；(2) 时空 patch(把时间当第三维切 token)；(3) 先每帧编码再接时序模块(如时序注意力/池化)。关键是控制帧数与每帧 token 数以免序列爆炸，并用时间位置编码保留顺序。",
  "approach": "采样帧 → 逐帧提 token(带时间位置) → 拼接/时空切分 → 时序注意力或池化 → LLM。",
  "explanationFocus": "是什么：视频理解的时序建模是把\"多帧画面+先后顺序\"变成模型可消费的结构，常用逐帧 token 拼接加时间位置编码，或时空联合切分。",
  "bruteForce": "把整段视频每帧全提 token 全拼：序列极长、算不起。",
  "derivation": [
    "为什么需要：视频除空间内容外还有动作/顺序，忽略时间会丢失核心语义。",
    "怎么实现：均匀/关键帧采样；逐帧 ViT 提 token 并打时间位置(M-RoPE)；帧间用注意力或轻量时序模块交互；必要时对帧 token 池化压缩。",
    "有什么代价：帧数×每帧 token 乘法式增长，KV 与算力压力巨大；采样过少丢动作。",
    "怎么评测：视频 QA、动作识别、时序排序准确率与端到端延迟。"
  ],
  "invariant": "相同帧序列经固定时间编码得到确定且有序的表示。",
  "walkthrough": "16 帧 × 每帧 256 token = 4096 视觉 token；M-RoPE 时间维 0..15 区分帧序。",
  "edgeCases": [
    "长视频：需分段或仅关键帧。",
    "高帧率动作：采样过疏漏动作。",
    "静态镜头：冗余帧可去重压缩。"
  ],
  "code": "def video_to_tokens(frames, encoder, sampler, temporal_pos):\n    picked = sampler(frames)                       # 采关键帧\n    toks = [encoder(f) for f in picked]            # 逐帧提 token\n    for t, tk in enumerate(toks):\n        tk = add_temporal_pos(tk, temporal_pos(t)) # 打时间位置\n    return concat(toks, dim=1)                     # 拼成时序序列",
  "codeNotes": [
    "帧采样是第一道降本手段。",
    "时间位置保证顺序不被注意力打乱。"
  ],
  "complexity": "O(帧数 × 每帧 token 数)^2 注意力；可经池化降到 O(T·V')。",
  "followUps": [
    {
      "question": "帧太多 token 爆炸怎么办？",
      "answer": "减少帧数/降每帧分辨率、对帧 token 池化压缩、或用分段+摘要策略。"
    },
    {
      "question": "为什么不能只看单帧？",
      "answer": "许多语义(动作、因果、顺序)只在帧间变化中体现，单帧丢失时序信息。"
    }
  ],
  "followUpAnswers": [
    "减帧/池化/分段。",
    "动作与顺序只在帧间体现。"
  ],
  "pitfalls": [
    "忽视时间位置导致帧序错乱。",
    "无脑堆帧造成算力爆炸。"
  ],
  "beginnerSummary": "视频就是一连串照片加\"先后顺序\"。模型先挑几张关键照片(帧采样)，每张翻译成 token 并贴上时戳(时间位置)，再把所有带时戳的 token 排好队交给大脑，这样它既能看画面也能懂\"先发生后发生\"。照片太多就挑重点、能压缩就压缩，否则大脑算不过来。",
  "prerequisites": [
    "视频是多帧有序图像。",
    "逐帧可复用图像编码器。",
    "时间顺序需显式编码。"
  ],
  "workedExample": [
    "16 帧 × 256 token = 4096 视觉 token。",
    "M-RoPE 时间维 0..15 标帧序。"
  ],
  "lineByLine": [
    "采样关键帧降本。",
    "逐帧提视觉 token。",
    "加时间位置编码。",
    "拼接后注意力/池化建模时序。"
  ],
  "diagram": "视频 ─▶ 采样帧 ─▶ 逐帧编码 ─(时戳)─▶ 拼接 ─▶ 时序注意力 ─▶ LLM"
};
