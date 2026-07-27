export default {
  "id": "gen-latent-diffusion",
  "kind": "concept",
  "category": "生成式模型",
  "title": "Latent Diffusion / LDM",
  "difficulty": "Medium",
  "prompt": "Latent Diffusion（LDM，如 Stable Diffusion）为什么先用 VAE 压到潜空间再扩散？它为何能大幅降低算力？",
  "quickAnswer": "LDM 用一个预训练 VAE 把图像编码到低维潜空间（如 64×64×4 相对 512×512×3），扩散过程在该紧凑表征上完成，再解码回像素。由于潜空间维度与通道数大幅下降，U-Net 计算量按面积平方级减小，训练/采样显存与时延都显著降低，且语义信息被保留。",
  "code": "from torch import randn\ndef latent_sample(vae, unet, text_enc, prompt):\n    z = randn(1, 4, 64, 64)            # 在潜空间加噪\n    c = text_enc(prompt)\n    for t in scheduler:\n        z = unet(z, t, c)              # 潜空间去噪\n    return vae.decode(z)               # 解码回像素",
  "complexity": "O(T·h·w·C_l)，h,w≪H,W",
  "beginnerSummary": "不在“原图大小”上作画，而是先把它压缩成一张小巧的“草图”再扩散，最后展开成高清图——省下大量算力却几乎不丢内容。",
  "explanationFocus": "是什么：Latent Diffusion 是把扩散过程从像素空间迁移到由 VAE 学到的低维潜空间进行的生成范式，是 Stable Diffusion 的核心。",
  "approach": "用 encoder 把图像压成潜变量，diffusion 在潜空间建模；生成时先在潜空间去噪，再用 decoder 还原像素，从而把昂贵的高分辨率卷积换成小尺寸操作。",
  "derivation": [
    "为什么需要：像素空间扩散在 512² 上 U-Net 极贵，难以普及。",
    "怎么实现：预训练 VAE 提供 encoder/decoder，扩散只在潜空间运行，条件经 cross-attn 注入。",
    "有什么代价：VAE 压缩会丢高频细节，需权衡压缩率；VAE 与扩散需分别训或冻结。",
    "怎么评测：对比同算力下像素扩散的 FID，并测解码保真度（LPIPS）。"
  ],
  "edgeCases": [
    "潜空间分辨率过小会丢细节，Stable Diffusion 用 8× 下采样折中。",
    "VAE 与扩散分布不匹配时会出现色偏或结构崩。",
    "高分辨率输出常配合 refiner 或 latent upscale。"
  ],
  "pitfalls": [
    "以为扩散“看不到”原图——它通过 VAE 间接建模像素分布。",
    "忽略 VAE 的正则（如 KL）对潜空间结构的影响。"
  ],
  "prerequisites": [
    "自编码器 / VAE",
    "扩散训练",
    "cross-attention 条件注入"
  ],
  "workedExample": [
    "用 VAE encoder 把 512² 图压成 64²×4 潜变量。",
    "在潜空间跑 50 步 DDIM 去噪得到 z。",
    "VAE decode(z) 得到最终图像，比对像素扩散省约 16× 计算。"
  ],
  "lineByLine": [
    "randn 在潜空间直接采初始噪声 z，尺寸远小于像素。",
    "text_enc 把 prompt 编码为条件 c。",
    "循环里 unet 在潜空间做条件去噪，计算量小。",
    "vae.decode 把结果还原为可见图像。"
  ],
  "followUps": [
    {
      "question": "潜空间维度怎么定？",
      "answer": "由 VAE 下采样倍率与通道数决定，SD 用 8× 下采、4 通道，平衡细节与效率。"
    },
    {
      "question": "为什么不直接在像素训小图？",
      "answer": "小图丢全局结构，潜空间保留语义且可在原分辨率解码，质量更好。"
    },
    {
      "question": "LDM 能用于视频吗？",
      "answer": "可以，3D VAE 把视频压到时空潜空间再扩散（如 SVD、SD3 视频扩展）。"
    }
  ],
  "followUpAnswers": [
    "由 VAE 下采样倍率与通道数决定，SD 用 8× 下采、4 通道，平衡细节与效率。",
    "小图丢全局结构，潜空间保留语义且可在原分辨率解码，质量更好。",
    "可以，3D VAE 把视频压到时空潜空间再扩散（如 SVD、SD3 视频扩展）。"
  ]
};
