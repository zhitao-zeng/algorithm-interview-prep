export default {
  "id": "vg-stable-video",
  "category": "视频生成",
  "difficulty": "Medium",
  "title": "Stable Video Diffusion",
  "prompt": "Stable Video Diffusion（SVD）是如何在图像扩散基础上扩展出“图生视频”能力的？",
  "quickAnswer": "SVD 在 Stable Diffusion 2.1 的 U-Net 中插入时序层（帧间注意力/卷积），把单张图像条件扩展为“首帧 + 多帧潜变量”的时序扩散；先大规模无监督预训练帧间一致性，再微调为用首帧作条件生成短视频。它本质仍是潜在扩散，只是把 2D U-Net 变成时空 U-Net。",
  "approach": "把图像 VAE 编码的首帧复制/扩展到 T 个时间片作为初始潜变量，U-Net 加时序卷积与注意力让各帧交换信息；训练时对所有帧加噪并预测噪声，条件为首帧潜变量，推理从噪声逐步去噪生成连贯帧。",
  "explanationFocus": "是什么：Stable Video Diffusion 是在 latent diffusion（Stable Diffusion）骨架上加“时序层”得到的图生视频模型：先在大量视频上无监督学帧间先验，再微调为以单张图像为条件生成数秒短视频。",
  "bruteForce": "朴素做法是把视频当多张图逐帧用图扩散生成再用光流对齐，帧间常出现闪烁与物体跳变，且无法保证运动自然。",
  "invariant": "去噪不变量：每一帧潜变量始终受到首帧条件约束，帧间注意力保持运动平滑，最终解码出的帧序列在首帧内容上与条件一致。",
  "walkthrough": "首帧经 VAE 编码为 z_cond；初始化 T 帧噪声潜变量，首帧位置用 z_cond 强约束；时空 U-Net 以 (zt, t, z_cond) 预测噪声；多步去噪得 z0；VAE 解码各帧成视频。",
  "complexity": "相比图扩散多了时间轴注意力，复杂度约 O(T·N^2)（N 为单帧 token 数）；SVD 默认生成 14–25 帧，T 较小，显存可控。",
  "beginnerSummary": "一句话：SVD 把“会画图的 Stable Diffusion”改造成“会让图动起来”——在原来只处理一张图的网络里加了几层让帧与帧交流的模块，再喂一张图就能生成围绕它的小动画。",
  "diagram": "image -> [VAE enc] -> z_cond (frame0)\ninit: z0..zT-1 ~ N(0,1), z0 = z_cond\n      |\nzt -> [Spatial+Temp U-Net] -> pred_noise\n      |  (x steps)\nz0_frames -> [VAE dec] -> video",
  "code": "def svd_denoise(zt, t, z_cond, unet):\n    zt[:, 0] = z_cond            # 首帧强条件\n    pred = unet(zt, timestep=t)  # 时空 U-Net\n    return pred",
  "derivation": [
    "为什么需要：已有强图像扩散先验，但缺“让图动起来且帧间一致”的时序建模能力。",
    "怎么实现：在 SD 的 2D U-Net 每个 block 增加时序卷积与帧间注意力，把单帧条件扩展为 T 帧潜变量扩散，先做三阶段无监督视频预训练再微调图生视频。",
    "有什么代价：时序层带来额外参数与显存，且默认只生成短片段（无长视频时序外推），运动幅度与镜头由微调数据分布决定。",
    "怎么评测：用 FVD、帧间光流一致性、首帧保真度（LPIPS 到条件图）及人工评测运动自然度。"
  ],
  "edgeCases": [
    "首帧含强纹理/文字：扩散可能破坏文字，需要更高引导权重保真。",
    "大幅摄像机运动：SVD 默认小运动，大幅运镜会崩坏。",
    "高分辨率输入：需先将首帧缩放到模型训练分辨率再生成。",
    "生成超过默认帧数：需分段并保证段间重叠帧一致。"
  ],
  "pitfalls": [
    "误以为 SVD 能纯文生视频；它主要是图生视频，文本需经其他模型先出首帧。",
    "把时序注意力写成非因果却用于长视频，导致段间不连续。"
  ],
  "prerequisites": [
    "Stable Diffusion / 潜在扩散基础。",
    "2D U-Net 与交叉注意力条件注入。",
    "帧间光流与运动一致性的基本直觉。"
  ],
  "workedExample": [
    "给一张静物照片，SVD 以它为条件生成 14 帧轻微呼吸/光影变化的小动画，首帧与输入完全一致。",
    "把一张角色立绘作为首帧，生成角色轻微转头的短视频，用于表情/口型后续驱动。"
  ],
  "lineByLine": [
    "def svd_denoise(zt, t, z_cond, unet): 定义 SVD 单步去噪，zt 为 T 帧潜变量批次。",
    "zt[:, 0] = z_cond 把第 0 帧潜变量强制设为条件首帧，实现图生视频的强约束。",
    "pred = unet(zt, timestep=t) 时空 U-Net 同时做空间去噪与帧间一致性建模。",
    "return pred 返回预测噪声，供采样器推进到上一步。"
  ],
  "codeNotes": [
    "真实推理还会对首帧做 dropout 增强鲁棒性；条件注入也可经 cross-attention 而非直接覆盖。"
  ],
  "followUps": [
    {
      "question": "SVD 的“三阶段训练”指什么？",
      "answer": "分别是：在大规模视频上做无标签的帧间一致性预训练、在高质量视频上微调基础版、再微调为特定帧数/分辨率的图生视频版本，逐步收敛到可控短视频。"
    },
    {
      "question": "SVD 与直接用图像扩散逐帧生成有何本质区别？",
      "answer": "SVD 的时序层让所有帧在潜空间联合去噪、彼此交换信息，保证运动连贯；逐帧生成各帧独立，易出现闪烁和物体跳变。"
    }
  ],
  "followUpAnswers": [
    "分别是：在大规模视频上做无标签的帧间一致性预训练、在高质量视频上微调基础版、再微调为特定帧数/分辨率的图生视频版本，逐步收敛到可控短视频。",
    "SVD 的时序层让所有帧在潜空间联合去噪、彼此交换信息，保证运动连贯；逐帧生成各帧独立，易出现闪烁和物体跳变。"
  ],
  "kind": "concept"
};
