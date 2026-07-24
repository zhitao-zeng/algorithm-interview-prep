export default {
  "kind": "concept",
  "id": "mm-vit",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "视觉编码器 ViT",
  "prompt": "多模态模型里的视觉编码器（如 ViT）起什么作用？",
  "quickAnswer": "视觉编码器(如 ViT)把输入图像切成若干 patch、线性投影成视觉 token 序列，经 Transformer 编码出富含语义的视觉特征。它相当于\"把图片翻译成 LLM 能读的一串 token\"，是图像/视频接入语言模型的前置模块，其输出经连接器对齐到文本空间后喂给 LLM。",
  "approach": "图像 → patch → token → Transformer 编码 → 视觉特征 → 连接器 → LLM。",
  "explanationFocus": "是什么：视觉编码器(ViT)把图像切成 patch 编码成视觉 token 序列，作为 LLM 可消费的\"图片语言\"。",
  "bruteForce": "直接把整张原始像素塞给 LLM：维度爆炸且语义缺失。",
  "derivation": [
    "为什么需要：LLM 只懂 token 序列，图像是二维像素，必须先转成同构的 token 表示。",
    "怎么实现：图像分 patch(如16x16)，各 patch 投影为向量并加位置嵌入，经多层 Transformer 得到视觉 token；再用 Q-Former/MLP 等连接器把维度对齐到 LLM 词嵌入空间。",
    "有什么代价：高分辨率图像 patch 数多，视觉 token 长，占 KV 与算力；编码器本身也有推理开销。",
    "怎么评测：看多模态基准(MMBench/MME)表现、视觉 token 质量、端到端延迟与图像编码开销占比。"
  ],
  "invariant": "同一图像经固定编码器得到确定视觉 token；连接器保证视觉/文本嵌入在同一空间可比。",
  "walkthrough": "224x224 图, patch=16 → 14x14=196 个视觉 token，每个经 ViT 编码为 1024 维向量，再投影到 LLM 的 4096 维。",
  "edgeCases": [
    "高分辨率：patch 数激增，需切图/动态分辨率控制长度。",
    "视频：多帧 → 多组视觉 token，需时序处理。",
    "细粒度 OCR：需更高分辨率或切图。"
  ],
  "code": "def image_to_tokens(img, patch=16, proj=None):\n    patches = img.unfold(2, patch, patch).unfold(3, patch, patch)\n    tokens = proj(patches.flatten(2).transpose(1, 2))   # (196, d_model)\n    return tokens",
  "codeNotes": [
    "patch 投影常用 Conv / Linear。",
    "位置嵌入保持空间结构。"
  ],
  "complexity": "视觉 token 数 = (H/p)·(W/p)；编码 O(token^2) 于 encoder。",
  "followUps": [
    {
      "question": "视觉 token 太长怎么办？",
      "answer": "用更大 patch、切图后只取关键区、或 tokenizer/池化压缩视觉 token 数，平衡信息量与 KV 成本。"
    },
    {
      "question": "连接器(Q-Former)做什么？",
      "answer": "把可变长的视觉 token 压缩/对齐到固定数、与文本对齐的查询 token，让 LLM 更容易消费。"
    }
  ],
  "followUpAnswers": [
    "增大 patch 或减少 token 数。",
    "Q-Former 做跨模态对齐与压缩。"
  ],
  "pitfalls": [
    "以为 LLM 能直接吃像素。",
    "忽视高分辨率带来的视觉 token 爆炸。"
  ],
  "beginnerSummary": "LLM 像只会读文字的人，看不懂图片。ViT 相当于把一张图切成许多小方块，每块写成一句\"视觉描述\"(token)，再经翻译器对齐到文字的词意空间，这样 LLM 就能\"读图\"了。图越清晰，方块越多、描述越长。",
  "prerequisites": [
    "LLM 输入是 token 序列。",
    "图像需转为同构 token。",
    "需把视觉特征对齐到文本空间。"
  ],
  "workedExample": [
    "224x224, patch16 → 196 个视觉 token。",
    "ViT 编码 1024 维 → 投影到 LLM 4096 维。"
  ],
  "lineByLine": [
    "图像切成不重叠 patch。",
    "每个 patch 投影成向量。",
    "加位置嵌入保留空间。",
    "Transformer 编码成视觉 token。"
  ],
  "diagram": "图像 ─▶ 切patch(16x16) ─▶ 投影 ─▶ ViT编码 ─▶ 视觉token\n        └─ 连接器对齐到 LLM 词空间 ─▶ LLM"
};
