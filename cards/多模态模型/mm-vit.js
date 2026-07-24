export default {
  "kind": "concept",
  "id": "mm-vit",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "视觉编码器 ViT",
  "prompt": "多模态模型里的视觉编码器（如 ViT）起什么作用？",
  "quickAnswer": "视觉编码器（如 ViT）把输入图像切成若干 patch、线性投影成视觉 token 序列，经 Transformer 编码出富含语义的视觉特征。它相当于\"把图片翻译成 LLM 能读的一串 token\"，是多模态模型里图像/视频接入语言模型的前置模块；其输出经连接器（如 MLP、Q-Former）对齐到文本空间后喂给 LLM。",
  "approach": "标准流水线：图像 → 切 patch（如 16×16）→ 每个 patch 线性投影成向量并加位置嵌入（保留空间结构）→ 多层 Transformer 自注意力编码 → 得到视觉 token 序列 → 经连接器（MLP / Q-Former / 残差连接）把维度与语义对齐到 LLM 文本空间 → 与文本 token 拼接送入 LLM。核心是\"把二维像素变成一维同构 token\"。",
  "explanationFocus": "是什么：视觉编码器（如 ViT，Vision Transformer）的作用是把图像这种二维像素数据，\"翻译\"成 LLM 能消费的、一维的视觉 token 序列。它先把图像切成若干不重叠的 patch、线性投影成向量，再经 Transformer 编码出富含语义的视觉特征；相当于给\"只读文字的 LLM\"配了一双\"能看图并写出视觉描述的眼睛\"。其输出通常再经一个连接器（connector）对齐到文本嵌入空间，才喂给 LLM。",
  "bruteForce": "直接把整张原始像素（如 224×224×3 = 15 万维）塞给 LLM：维度爆炸、序列长度失控，且原始像素缺乏语义抽象，LLM 根本无法从中读出\"这是猫、那是车\"的高级语义，效果灾难。",
  "derivation": [
    "为什么需要：LLM 只懂 token 序列，图像是二维像素网格，必须先转成与它同构的 token 表示，才能进入同一套 Transformer 计算。",
    "怎么实现：图像分 patch（如 16×16），各 patch 投影为向量并加位置嵌入，经多层 Transformer 得到视觉 token；再用 Q-Former/MLP 等连接器把维度与语义对齐到 LLM 词嵌入空间。",
    "有什么代价：高分辨率图像 patch 数多，视觉 token 长，占 KV Cache 与算力；编码器本身也有推理开销（额外一次前向）；过长的视觉序列会挤压文本可用长度。",
    "怎么评测：看多模态基准（MMBench、MME、OCR 类）表现、视觉 token 质量与信息保留度、以及端到端延迟中图像编码开销占比。"
  ],
  "invariant": "同一图像经固定编码器得到确定性的视觉 token（无随机性）；连接器保证视觉嵌入与文本嵌入落在同一可比空间，使 LLM 能把\"视觉 token\"和\"文字 token\"一视同仁地做注意力。",
  "walkthrough": "具体算一笔账：一张 224×224 的图，patch 大小取 16×16，则沿边切成 224/16 = 14 格，共 14×14 = 196 个视觉 token。每个 patch 经线性投影（如 16×16×3=768 维像素 → 1024 维）后再过 ViT 的多层 Transformer，得到 196 个 1024 维的视觉特征向量；最后经连接器投影到 LLM 的词嵌入维度（如 4096 维），与文本 token 拼在一起送入 LLM。",
  "edgeCases": [
    "高分辨率：patch 数随分辨率平方暴涨（512×512 → 1024 token），需切图/动态分辨率控制视觉 token 长度。",
    "视频输入：多帧 → 多组视觉 token，需时序聚合或分段处理，否则序列极长。",
    "细粒度 OCR / 小字：需更高分辨率或切图放大局部，否则细节丢失。",
    "非正方形/任意长宽比：需 resize 或保持比例切 patch，避免形变。"
  ],
  "code": "def image_to_tokens(img, patch=16, proj=None):\n    patches = img.unfold(2, patch, patch).unfold(3, patch, patch)\n    tokens = proj(patches.flatten(2).transpose(1, 2))   # (196, d_model)\n    return tokens",
  "codeNotes": [
    "patch 投影常用 Conv（kernel=patch_size, stride=patch_size）或 Linear，一行即可完成\"切+投影\"。",
    "位置嵌入（可学习或二维正弦）对保持空间结构至关重要，缺了模型会丢失\"上下左右\"。",
    "草图用 unfold 手动切块，真实实现多由 vision backbone（如 CLIP/ViT）封装，输出再接连接器。"
  ],
  "complexity": "视觉 token 数 = (H/p) × (W/p)（如 224/16 → 196），与分辨率平方相关；编码这些 token 的 Transformer 自注意力复杂度为 O(token²)，所以高分辨率会让视觉编码成本快速上升，KV Cache 也随之增大。",
  "followUps": [
    {
      "question": "视觉 token 太长怎么办？",
      "answer": "可用更大 patch（牺牲细节换长度）、切图后只取关键区域、或对视觉 token 做池化/重采样压缩（如 Perceiver、Q-Former 把可变长视觉 token 压到固定数）。目标是在\"信息量\"与\"KV 成本\"间平衡，高分辨率细节用动态分辨率按需保留。"
    },
    {
      "question": "连接器（Q-Former）做什么？",
      "answer": "Q-Former 用一组可学习的 query，对视觉 token 做跨注意力，把可变长、高维的视觉特征压缩并对齐到固定数量、与文本对齐的查询 token，既降长度又做跨模态对齐，让 LLM 更容易消费。BLIP-2 即以此桥接视觉编码器与 LLM。"
    },
    {
      "question": "ViT 和 CNN 编码器有何取舍？",
      "answer": "CNN 局部归纳偏置强、小数据友好；ViT 靠大规模预训练、全局注意力对长程依赖建模更好，且输出天然是 token 序列、契合 LLM。多模态里 ViT 系（CLIP/ViT-H）因与文本对齐训练更常用。"
    }
  ],
  "followUpAnswers": [
    "可用更大 patch（牺牲细节换长度）、切图后只取关键区域、或对视觉 token 做池化/重采样压缩（如 Perceiver、Q-Former 把可变长视觉 token 压到固定数）。目标是在\"信息量\"与\"KV 成本\"间平衡，高分辨率细节用动态分辨率按需保留。",
    "Q-Former 用一组可学习的 query，对视觉 token 做跨注意力，把可变长、高维的视觉特征压缩并对齐到固定数量、与文本对齐的查询 token，既降长度又做跨模态对齐，让 LLM 更容易消费。BLIP-2 即以此桥接视觉编码器与 LLM。",
    "CNN 局部归纳偏置强、小数据友好；ViT 靠大规模预训练、全局注意力对长程依赖建模更好，且输出天然是 token 序列、契合 LLM。多模态里 ViT 系（CLIP/ViT-H）因与文本对齐训练更常用。"
  ],
  "pitfalls": [
    "以为 LLM 能直接吃像素：必须先用视觉编码器把图转成 token，否则维度与语义都不匹配。",
    "忽视高分辨率带来的视觉 token 爆炸：token 太多既占 KV 又拖慢，需要动态分辨率或 token 压缩。",
    "连接器设计草率：若视觉/文本空间没对齐好，LLM 读不懂视觉 token，多模态能力崩塌。"
  ],
  "beginnerSummary": "LLM 像只会读文字的人，看不懂图片。ViT 相当于把一张图切成许多小方块，每块写成一句\"视觉描述\"（token），再经翻译器对齐到文字的词意空间，这样 LLM 就能\"读图\"了。图越清晰（分辨率越高），方块越多、描述越长，LLM 看到的细节也越多——但方块太多也会占地方、拖慢速度。",
  "prerequisites": [
    "LLM 输入是 token 序列：理解它会把一切输入都当成一串嵌入向量来处理。",
    "图像需转为同构 token：像素网格要变成与文本嵌入同维度的向量序列。",
    "需把视觉特征对齐到文本空间：靠连接器（MLP/Q-Former）完成跨模态对齐。"
  ],
  "workedExample": [
    "224×224 图、patch=16 → 14×14 = 196 个视觉 token；ViT 把每个编码为 1024 维，再经连接器投影到 LLM 的 4096 维。",
    "高分辨率场景：一张 448×448 图若仍用 patch=16，则视觉 token 达 784 个，常需切图成 2×2 子图分块编码再拼接，控制单图 token 数。",
    "视频例子：1 秒 4 帧、每帧 196 token → 784 视觉 token，需时序池化或采样，否则序列过长。"
  ],
  "lineByLine": [
    "图像切成不重叠 patch：把二维图网格化成若干小块，每块对应一个视觉 token 的雏形。",
    "每个 patch 投影成向量：用 Conv 或 Linear 把像素块映射到模型维度（如 768→1024）。",
    "加位置嵌入保留空间：让模型知道\"这块在第几行第几列\"，维持空间结构。",
    "Transformer 编码成视觉 token：自注意力让各 patch 互相交换信息，得到语义化特征。"
  ],
  "diagram": "图像 ─▶ 切patch(16x16) ─▶ 投影 ─▶ ViT编码 ─▶ 视觉token\n        └─ 连接器对齐到 LLM 词空间 ─▶ LLM"
};
