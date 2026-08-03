export default {
  "id": "vg-tokenizer-vae",
  "category": "视频生成",
  "difficulty": "Hard",
  "title": "视频 Tokenizer 与 VAE 压缩",
  "prompt": "视频 tokenizer（如 VQ-VAE / MAGVIT）如何对时空联合压缩并离散化为 token，与图像 VAE 有何不同？",
  "quickAnswer": "视频 tokenizer 在 VAE 基础上增加时间下采样，把 [T,H,W,3] 压成 [Tp,Hp,Wp,C] 的连续潜变量，再用向量量化（VQ）或因果卷积离散成 token 序列。与图像 VAE 的关键区别是它必须建模时间冗余，常采用因果 3D 卷积与时空码本。离散 token 让视频可像语言一样做自回归/掩码生成，便于与 LLM 对齐。",
  "approach": "先讲连续压缩（3D 卷积编码器+解码器），再讲离散化（VQ 码本 + commitment loss），最后讲因果 vs 双向时序与码本崩溃问题。",
  "explanationFocus": "是什么：视频 tokenizer 是把一段视频压缩并离散化为一串 token 的模型，相当于视频的\"分词器\"，常见做法是带时间维的 VAE 接向量量化（VQ），输出可被 Transformer 直接消费的 token 序列。",
  "bruteForce": "朴素做法是对每一帧独立用图像 VQ-VAE 编码再拼起来，完全忽略时间冗余，token 数量随帧数线性爆炸且帧间无关联。",
  "invariant": "量化后的 token 经解码器重建视频，应该在像素与感知层面逼近原视频；同一视频多次编码得到相同 token 序列（确定性 encoder）。",
  "walkthrough": "以 MAGVIT 风格为例：16 帧 128×128×3 视频，编码器用 4×8×8 时空下采样得 [4,16,16,256] 潜变量；VQ 码本大小 8192、维度 256，量化后得到 4×16×16=1024 个 token；重建 LPIPS≈0.08。",
  "code": "import torch\n\ndef vq_quantize(z, codebook):\n    # z: [B,D,T,H,W]；codebook: [K,D]\n    B, D, T, H, W = z.shape\n    flat = z.permute(0, 2, 3, 4, 1).reshape(-1, D)\n    dist = torch.cdist(flat, codebook)          # 到各码本向量距离\n    idx = dist.argmin(dim=1)                     # 最近码本下标\n    z_q = codebook[idx].reshape(B, T, H, W, D).permute(0, 4, 1, 2, 3)\n    return z_q, idx",
  "complexity": "量化复杂度 O(N·K·D)，N=1024 token、K=8192、D=256，约 2G 次操作，远小于扩散去噪；瓶颈在 3D 卷积编码 O(T·H·W·C²)。",
  "beginnerSummary": "视频 tokenizer 像把一段动画压成一本\"密码本\"上的编号序列，每个编号代表一小块时空内容，之后只要处理这些编号就能生成视频，省事很多。",
  "diagram": "视频[T,H,W,3]\n   │ 3D 卷积编码 + 4×8×8 下采样\n   ▼\n潜变量[Tp,Hp,Wp,D]\n   │ 向量量化(VQ)\n   ▼\ntoken 序列(1024个) ──► Transformer 生成",
  "derivation": [
    "为什么需要：原始视频像素量巨大，且需与语言模型统一的离散接口。",
    "怎么实现：3D 卷积压缩时空 + VQ 码本离散化为 token。",
    "有什么代价：量化有损、码本易崩溃，时间下采样损失高频运动。",
    "怎么评测：重建指标（PSNR/LPIPS）+ token 重建视频的 FVD。"
  ],
  "edgeCases": [
    "极快运动在 4× 时间下采样后产生混叠，token 无法表达。",
    "码本中冷门向量长期不更新导致表示退化。",
    "视频长度非下采样整数倍需 padding，解码后裁掉多余帧。"
  ],
  "pitfalls": [
    "commitment loss 权重过大让 encoder 退化为恒等、码本不被使用。",
    "训练和推理用不同码本导致 token 分布漂移。"
  ],
  "prerequisites": [
    "VQ-VAE 与码本量化",
    "3D 卷积",
    "感知损失（LPIPS）"
  ],
  "workedExample": [
    "16 帧 64×64 视频，2×4×4 下采样得 [8,16,16,128]，码本 4096，量化后 2048 token。",
    "与图像 VAE 比：同样 16 帧若逐帧编码得 16×256=4096 token，时空联合压缩减半。"
  ],
  "lineByLine": [
    "def vq_quantize(z, codebook)：定义向量量化函数。",
    "flat = z.permute(...).reshape(-1, D)：把潜变量摊平为 N 个 D 维向量。",
    "dist = torch.cdist(flat, codebook)：计算每个向量到 K 个码本的距离。",
    "idx = dist.argmin(dim=1)：取最近码本下标作为 token。",
    "z_q = codebook[idx].reshape(...)：用码本向量替换得到量化后潜变量。"
  ],
  "codeNotes": [
    "用 argmin 选码本是标准 VQ；可用 straight-through 估计把梯度透传回 encoder。"
  ],
  "followUps": [
    {
      "question": "因果 tokenizer 与双向 tokenizer 区别？",
      "answer": "因果只在时间上依赖过去帧，支持流式生成；双向看到全视频，重建更好但不可在线生成。"
    },
    {
      "question": "码本崩溃怎么缓解？",
      "answer": "用 codebook reset、EMA 更新、或软量化（Gumbel/VQ-GAN 的 perceptual loss）提升码本利用率。"
    }
  ],
  "followUpAnswers": [
    "因果只在时间上依赖过去帧，支持流式生成；双向看到全视频，重建更好但不可在线生成。",
    "用 codebook reset、EMA 更新、或软量化（Gumbel/VQ-GAN 的 perceptual loss）提升码本利用率。"
  ],
  "kind": "concept"
};
