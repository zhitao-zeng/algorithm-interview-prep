export default {
  "id": "vg-diffusion-arch",
  "category": "视频生成",
  "difficulty": "Medium",
  "title": "视频扩散模型架构",
  "prompt": "视频扩散模型（如 SVD、AnimateDiff）的整体架构由哪些核心模块组成，潜空间中的时间维度一般如何处理？",
  "quickAnswer": "视频扩散模型在图像扩散 U-Net 基础上加入时间维度，核心模块包括：VAE 编码器把视频压到潜空间、带时序卷积/注意力（或 Motion Module）的 U-Net 做去噪、以及把单帧条件扩展到多帧的机制。SVD 直接训练视频 U-Net，AnimateDiff 则冻结图像基底、只插入可插拔的时序运动模块。时间维度通常沿帧轴做 3D 卷积或分离式（空间+时间）注意力来建模运动。",
  "approach": "先定位三条主线：潜空间压缩（VAE）、去噪主干（U-Net + 时序模块）、条件注入（帧/文本）。面试时沿\"数据→潜空间→去噪→解码\"的流水线讲，再对比 SVD 端到端训练与 AnimateDiff 适配器式设计的取舍。",
  "explanationFocus": "是什么：视频扩散模型是在图像扩散模型上扩展时间维、对视频潜变量序列做逐步去噪的生成架构，把\"生成一张图\"升级为\"生成一组时序一致的帧\"。",
  "bruteForce": "最朴素的办法是把视频每一帧当作独立图像、用图像扩散模型逐帧生成，再靠后处理拼起来；时间一致性完全靠运气或光流对齐，运动很容易跳变、闪烁。",
  "invariant": "去噪网络在任意噪声步 t 上必须满足：输入同分布噪声、输出对该步噪声水平的预测（噪声或 x0），且相邻帧的潜变量共享同一个时间位置编码与运动场，保证帧间一致性。",
  "walkthrough": "以 SVD 为例：输入 1024×576、25fps、14 帧的视频，VAE 先把空间下采样 8 倍、时间下采样 4 倍，得到潜空间张量形状 [B,4,4,128,72]（4 个时间潜帧）；U-Net 在约 1.2B 参数下做 25 步 DDIM 去噪，每步对 4 个时间潜帧联合卷积；最后 VAE 解码回 14 帧原始视频。",
  "code": "import torch\nimport torch.nn as nn\n\ndef temporal_attention(x, n_heads=8):\n    # x: [B, C, T, H, W] 沿时间维做自注意力\n    B, C, T, H, W = x.shape\n    x_seq = x.permute(0, 3, 4, 2, 1).reshape(B * H * W, T, C)\n    attn = nn.MultiheadAttention(C, n_heads, batch_first=True)\n    out, _ = attn(x_seq, x_seq, x_seq)\n    return out.reshape(B, H, W, T, C).permute(0, 4, 3, 1, 2)",
  "complexity": "训练复杂度约 O(T·H·W·C²) 与帧数 T 线性增长；推理为去噪步数 ×（U-Net 单次前向），14 帧 SVD 约 25 步、单步约 1.2B 参数量级，显存随 T 与时间注意力序列长度 T·H·W 增长。",
  "beginnerSummary": "想象要画一本翻页小动画：图像扩散模型只会画其中一页，视频扩散模型额外学会\"这一页和上一页该怎么连起来动\"，于是翻动时画面是连贯的而不是各自乱跳。",
  "diagram": " 视频(14帧)\n    │ VAE 编码\n    ▼\n [B,4,4,128,72] 潜空间\n    │ 加噪 + U-Net 去噪(含时序模块)\n    ▼\n 去噪后潜变量\n    │ VAE 解码\n    ▼\n 生成视频(14帧)",
  "derivation": [
    "为什么需要：图像扩散只能保证单帧合理，视频需要帧间运动一致，否则会闪烁跳变。",
    "怎么实现：在 U-Net 中插入沿时间轴的 3D 卷积或分离式时空注意力/运动模块，让去噪在潜空间联合处理多帧。",
    "有什么代价：计算与显存随帧数线性甚至更高增长，训练数据与时间对齐标注成本大。",
    "怎么评测：用 FVD 衡量视频分布距离，配合帧一致性和主观人工评分。"
  ],
  "edgeCases": [
    "输入只有 1 帧（退化为图像）时时间模块退化为恒等，应保证不死机。",
    "高帧率或超长视频超出时间注意力序列长度时需分块或因果处理。",
    "非 8 的整数倍分辨率会让 VAE 下采样产生错位，需 padding 到对齐。",
    "带大幅度相机运动的场景时序注意力容易建模失败产生拖影。"
  ],
  "pitfalls": [
    "把时间模块和空间模块顺序搞反导致运动建模失效。",
    "冻结图像基底时学习率过大反而破坏已有生成能力。"
  ],
  "prerequisites": [
    "图像扩散模型（DDPM/DDIM）原理",
    "VAE 与潜空间表示",
    "自注意力与 3D 卷积"
  ],
  "workedExample": [
    "给定 576×320、8 帧的小视频，VAE 8× 空间下采样得 [B,4,1,40,20]，时间不压缩，去噪只在 1 个时间潜帧上做。",
    "AnimateDiff 在已有 SD1.5 上插入 Motion Module，用 WebVid 视频微调只训练新增参数，图像先验保留。"
  ],
  "lineByLine": [
    "import torch, nn：引入 PyTorch 与神经网络模块。",
    "def temporal_attention(x, n_heads=8)：定义沿时间维做自注意力的函数，输入 [B,C,T,H,W]。",
    "x_seq = x.permute(...).reshape(B*H*W, T, C)：把空间位置摊平为 batch，时间 T 作为序列长度。",
    "attn = nn.MultiheadAttention(...)：构造多头注意力，在时序上做帧间信息交互。",
    "return out.reshape(...).permute(...)：还原回 5D 视频张量形状。"
  ],
  "codeNotes": [
    "将空间位置并入 batch 是把 3D 时空注意力降为 1D 时序注意力的常用技巧，避免 O(T²H²W²) 的爆炸。"
  ],
  "followUps": [
    {
      "question": "SVD 与 AnimateDiff 的核心区别？",
      "answer": "SVD 端到端训练整视频 U-Net，质量高但贵；AnimateDiff 冻结图像基底、只训可插拔 Motion Module，便宜且兼容已有文生图生态。"
    },
    {
      "question": "时间维用 3D 卷积还是分离的时空注意力更好？",
      "answer": "3D 卷积感受野局部、省显存；分离式时空注意力长程建模更强但显存高，实际常混合使用（如先空间卷积再时间注意力）。"
    }
  ],
  "followUpAnswers": [
    "SVD 端到端训练整视频 U-Net，质量高但贵；AnimateDiff 冻结图像基底、只训可插拔 Motion Module，便宜且兼容已有文生图生态。",
    "3D 卷积感受野局部、省显存；分离式时空注意力长程建模更强但显存高，实际常混合使用（如先空间卷积再时间注意力）。"
  ],
  "kind": "concept"
};
