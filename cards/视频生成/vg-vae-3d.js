export default {
  "id": "vg-vae-3d",
  "category": "视频生成",
  "difficulty": "Medium",
  "title": "3D VAE 时空压缩",
  "prompt": "视频生成里为什么普遍用一个 3D VAE 先压缩时空，而不是直接在像素上扩散？",
  "quickAnswer": "3D VAE 把 (T,H,W,3) 视频压成 (t,h,w,c) 潜变量，把 Token 数降一到两个数量级，使后续扩散 Transformer 的注意力开销从 O((THW)^2) 降到可承受范围；同时 VAE 学到强时空先验，让去噪更稳定、重建质量更高。直接在像素扩散会因 Token 爆炸而不可训练。",
  "approach": "用带时序下采样的 3D 卷积编码器把视频压成潜变量，解码器对称上采样重建；训练用重建损失（L1/LPIPS）+ 可选对抗/感知损失。扩散模型只在潜空间操作，时空压缩比（如 4x8x8）由卷积步长决定。",
  "explanationFocus": "是什么：3D VAE 是“带时间轴的变分自编码器”，用 3D 卷积同时压缩视频的时间与空间维度，得到低帧率低分辨率的紧凑潜变量，作为视频扩散模型的“视频 tokenizer”。",
  "bruteForce": "朴素做法是不压缩，直接在像素帧上做 3D 扩散，Token 数随 T·H·W 立方增长，注意力 O(N^2) 在 16 帧 256x256 就已爆显存，基本不可行。",
  "invariant": "重建不变量：对同一样本，编码-解码往返应尽量保真（像素与感知一致），且潜变量分布平滑，使扩散模型能在连续空间稳定去噪。",
  "walkthrough": "视频 x 经 3D 编码器 E 得 z=E(x)；扩散在 z 上加噪/去噪得 z0；解码器 D 还原 x_hat=D(z0)；训练时最小化 ||x-x_hat|| 与感知损失。",
  "complexity": "3D 卷积编码约 O(T·H·W·C·k^3)，较 2D 多一个时间维常数；收益是后续扩散 Token 数降为 (T/s_t)(H/s)(W/s)，注意力开销大幅下降。",
  "beginnerSummary": "一句话：3D VAE 像一个“视频压缩器”，把一段又长又大的视频压成一串小而紧凑的“小块”，让后面的 AI 只需要处理这些小块而不是每一帧的每个像素，又快又稳。",
  "diagram": "video (T,H,W,3)\n   -> [3D Conv enc, stride 4,8,8]\n   -> z (t,h,w,c)  <- diffusion works here\n   -> [3D Conv dec]\n   -> video_hat (T,H,W,3)",
  "code": "class VAE3D:\n    def encode(self, x):\n        return self.encoder(x)          # (T,H,W,3)->(t,h,w,c)\n    def decode(self, z):\n        return self.decoder(z)",
  "derivation": [
    "为什么需要：像素空间视频 Token 数随 T·H·W 立方增长，扩散注意力不可承受，必须先压缩。",
    "怎么实现：用堆叠的 3D 卷积（时间/空间分别 stride）做下采样编码，对称转置卷积上采样解码，训练目标为重建+感知损失，必要时加 KL 正则约束潜空间。",
    "有什么代价：压缩会丢失高频细节与小幅运动，压缩比过大时重建模糊；3D 卷积比 2D 多时间维计算，且需时序对齐的视频数据。",
    "怎么评测：用 PSNR/SSIM/LPIPS 测重建质量，用下游扩散 FVD 测“作为 tokenizer 是否利于生成”，并检查时间维度是否保持运动连贯。"
  ],
  "edgeCases": [
    "快速运动：时间下采样造成运动混叠，重建出现拖影。",
    "极端压缩比：潜变量太小导致解码出现块状伪影。",
    "非整数倍帧数：需 pad 或裁剪到 stride 整数倍。",
    "跨镜头切换：单段 3D VAE 假设连续运动，切镜会模糊。"
  ],
  "pitfalls": [
    "把时间 stride 设得过大导致小幅运动丢失，生成视频“跳帧”。",
    "只在图像上预训练 VAE 再直接用于视频，缺乏时序建模能力。"
  ],
  "prerequisites": [
    "2D VAE 与卷积自编码器。",
    "3D 卷积与时空下采样。",
    "感知损失（LPIPS）/对抗训练基础。"
  ],
  "workedExample": [
    "一段 16 帧 256x256 视频经 4x8x8 压缩成 4x32x32x4 潜变量，Token 数从 16*256*256≈1M 降到约 16k，注意力开销降约 4000 倍。",
    "训练时随机遮盖时间片做重建，迫使 VAE 学到帧间冗余，提升后续扩散稳定性。"
  ],
  "lineByLine": [
    "class VAE3D: 定义 3D 变分自编码器，用于视频时空压缩与重建。",
    "def encode(self, x): return self.encoder(x) 编码器用 3D 卷积把视频压成低帧率低分辨率潜变量。",
    "def decode(self, z): return self.decoder(z) 解码器对称上采样把潜变量还原为视频像素。",
    "注意：真实实现还有量化/正则项与感知损失头，这里只示意主路径。"
  ],
  "codeNotes": [
    "时间 stride 通常小于空间 stride（如 4 vs 8），因为帧间冗余比空间冗余少，过大易丢运动。"
  ],
  "followUps": [
    {
      "question": "3D VAE 和把每帧单独用 2D VAE 有什么不同？",
      "answer": "每帧独立 2D VAE 没有时间压缩、Token 数仍随帧数线性增长，且帧间潜变量不共享时序先验；3D VAE 同时压时间维并学到帧间依赖，更利于扩散建模运动。"
    },
    {
      "question": "压缩比怎么选？",
      "answer": "在重建质量与后续扩散效率间权衡：压缩比大则生成快但细节糊，常用 4x8x8 或 8x8x8；高运动视频宜降低时间压缩比。"
    }
  ],
  "followUpAnswers": [
    "每帧独立 2D VAE 没有时间压缩、Token 数仍随帧数线性增长，且帧间潜变量不共享时序先验；3D VAE 同时压时间维并学到帧间依赖，更利于扩散建模运动。",
    "在重建质量与后续扩散效率间权衡：压缩比大则生成快但细节糊，常用 4x8x8 或 8x8x8；高运动视频宜降低时间压缩比。"
  ],
  "kind": "concept"
};
