export default {
  "id": "vg-sora-arch",
  "category": "视频生成",
  "difficulty": "Hard",
  "title": "Sora 类架构（U-ViT / STDiT）",
  "prompt": "Sora 这类“视频扩散 + 时空联合 Transformer”的架构是怎么组织的，为什么用 U-ViT 而非纯 U-Net？",
  "quickAnswer": "Sora 把视频在时间-空间上 patch 化后丢进一个带 U 型结构的扩散 Transformer（U-ViT / STDiT）：底层卷积提取局部特征，中段用时空注意力建模长程依赖，去噪目标是压缩潜空间里的噪声视频潜变量。选用 U-ViT 是因为纯 U-Net 的卷积感受野有限、难以建模长视频的全局运动一致性，而纯 ViT 又丢失了多尺度局部归纳偏置，U-ViT 把两者折中。",
  "approach": "核心思路是“先压缩、再扩散、再解码”：用 3D VAE 把视频压成低帧率低分辨率的潜变量，再用时空 Transformer 在潜空间做多步去噪，最后解码回像素。训练时用带噪潜变量、时间步、文本条件联合预测噪声。",
  "explanationFocus": "是什么：Sora 类架构是一类“时空联合扩散 Transformer”，先用视频 tokenizer（3D VAE）把视频压成时空潜变量，再用类 U-ViT 的扩散 Transformer 在该潜空间里按文本/图像条件逐步去噪生成视频潜变量，最后解码成像素帧。",
  "bruteForce": "朴素做法是直接在像素空间对每帧用 2D 扩散逐个生成，再用光流或 3D 卷积把帧连起来。好处是无需 3D VAE，坏处是显存随时间平方增长、帧间一致性差、长视频几乎不可训练。",
  "invariant": "去噪过程中“每一步预测的噪声与真实噪声残差一致、且条件（文本/首帧）始终被注入”这一不变量保持成立，直到最终潜变量可被解码为合理视频。",
  "walkthrough": "输入文本经 CLIP/T5 编码为条件；视频经 3D VAE 编码为潜变量 x0，加噪得 xt；模型以 (xt, t, cond) 为输入预测噪声；多步采样得 x0_hat；3D VAE 解码器上采样还原视频。",
  "complexity": "训练算力随潜变量 Tokens 数 N 近似 O(N^2)（注意力），随帧数线性增长；推理步数由采样器决定，通常 20–50 步。显存主要被 3D 注意力与 VAE 解码占据。",
  "beginnerSummary": "一句话：Sora 先把视频压成“小方块序列”，再让一个既能看局部又能看全局的 Transformer 按文字描述把这些小方块一点点去噪还原成视频。",
  "diagram": "text -> [T5/CLIP] -> cond\nvideo -> [3D VAE enc] -> z0 -> +noise -> zt\n            |\n   (zt, t, cond) -> [U-ViT denoiser] -> pred_noise\n            |  (x N steps)\n           z0_hat -> [3D VAE dec] -> video",
  "code": "def sora_denoise(zt, t, cond, model):\n    # 单步去噪：预测并减去噪声\n    pred_noise = model(zt, timestep=t, context=cond)\n    zt_prev = step(zt, pred_noise, t)\n    return zt_prev",
  "derivation": [
    "为什么需要：纯像素空间扩散生成视频显存爆炸且帧间不一致；需要一个能在压缩时空潜空间里高效、长程建模的骨干。",
    "怎么实现：用 3D VAE 把 (T,H,W,3) 压成 (t,h,w,c) 潜变量，沿时空轴 patch/ token 化，送入带卷积下采样的 U 型 Transformer（U-ViT/STDiT），在潜空间做条件扩散去噪。",
    "有什么代价：3D 注意力对长视频是 O(N^2) 开销，且需要大规模、带文本配对的视频数据与时序对齐的 tokenizer，训练成本极高。",
    "怎么评测：用 FVD 看生成分布接近度，用人类偏好/文本-视频对齐（如 VBench 的语义一致性）评估可控性，并检查长视频的运动连贯性与物体一致性。"
  ],
  "edgeCases": [
    "极长视频：Token 数超出注意力窗口，需要分段时间轴或环形/稀疏注意力。",
    "文本与视频语义冲突：条件引导过强导致运动崩坏，需要调 classifier-free guidance 权重。",
    "低质量/噪声训练数据：会让 tokenizer 学到坏潜空间，需做数据清洗与美学打分。",
    "首帧条件缺失：纯文生视频比图生视频更难保持物体身份一致性。"
  ],
  "pitfalls": [
    "误以为 U-ViT 只是 2D U-Net 换注意力，其实时序轴的处理（帧采样、时间位置编码）才是关键差异。",
    "训练时把时间步 t 与空间位置编码混淆，导致模型无法区分“第几帧”与“第几步去噪”。"
  ],
  "prerequisites": [
    "扩散模型基础（前向/反向过程、噪声预测目标）。",
    "Vision Transformer 与 U-Net 的多尺度结构。",
    "3D 卷积与视频表征（光流、帧间一致性）概念。"
  ],
  "workedExample": [
    "文生视频：输入“一只猫在雪地里奔跑”，文本编码为 cond，模型从纯噪声潜变量开始去噪 30 步得到猫奔跑的视频潜变量，解码成 16 帧片段。",
    "图生视频：给定首帧潜变量作为强条件，模型只生成后续帧潜变量，保证首帧物体身份不变。"
  ],
  "lineByLine": [
    "def sora_denoise(zt, t, cond, model): 定义单步去噪函数，输入为含噪潜变量、时间步、条件和模型。",
    "pred_noise = model(zt, timestep=t, context=cond) 让 U-ViT 在给定时间步和文本条件下预测当前噪声。",
    "zt_prev = step(zt, pred_noise, t) 用采样器（如 DDPM/DDIM）从当前步推进到上一步潜变量。",
    "return zt_prev 返回去噪一步后的潜变量，循环调用即完成整段视频生成。"
  ],
  "codeNotes": [
    "step 这里抽象了具体采样器；真实实现里 DDIM 用确定性更新、DDPM 加随机噪声，影响生成多样性。"
  ],
  "followUps": [
    {
      "question": "U-ViT 与 STDiT 的区别是什么？",
      "answer": "U-ViT 强调在 U 型结构里早融合浅层特征、用长跳跃连接保留细节；STDiT（如 CogVideoX）更强调“空间视觉 Transformer + 时间 Transformer”分阶段建模，时间注意力单独成块，便于扩展视频长度。"
    },
    {
      "question": "为什么不直接在像素空间扩散？",
      "answer": "像素空间 Token 数随分辨率与帧数立方级增长，注意力 O(N^2) 不可承受；潜空间压缩后 Token 数降一到两个数量级，且 VAE 已学到强先验，去噪更稳定。"
    },
    {
      "question": "Sora 如何保证长视频一致性？",
      "answer": "靠 3D VAE 的时空连续潜空间 + 长程时空注意力维持全局运动，并常用分段时间轴 + 重叠帧约束拼接，配合身份/运动条件避免漂移。"
    }
  ],
  "followUpAnswers": [
    "U-ViT 强调在 U 型结构里早融合浅层特征、用长跳跃连接保留细节；STDiT 更强调“空间视觉 Transformer + 时间 Transformer”分阶段建模，时间注意力单独成块，便于扩展视频长度。",
    "像素空间 Token 数随分辨率与帧数立方级增长，注意力 O(N^2) 不可承受；潜空间压缩后 Token 数降一到两个数量级，且 VAE 已学到强先验，去噪更稳定。",
    "靠 3D VAE 的时空连续潜空间 + 长程时空注意力维持全局运动，并常用分段时间轴 + 重叠帧约束拼接，配合身份/运动条件避免漂移。"
  ],
  "kind": "concept"
};
