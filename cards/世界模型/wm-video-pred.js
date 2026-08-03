export default {
  "id": "wm-video-pred",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "视频预测模型",
  "prompt": "如何用世界模型做视频预测？请说明主流建模方式与关键技术权衡？",
  "quickAnswer": "视频预测是世界模型在像素空间的具象化：给定历史帧与(可选)动作，生成未来若干帧。主流路线有自回归像素生成、隐空间扩散、以及基于 tokenizer 的离散潜变量预测。关键在于在\"像素真实度\"与\"长期一致性/可控性\"之间取舍。",
  "approach": "先确定条件输入(历史帧+动作)，再选建模空间(像素/隐空间/离散 token)，训练时常用 VAE 压潜变量 + 时序模型或扩散去噪，最后用 FVD 等指标评测。",
  "explanationFocus": "是什么：视频预测模型学习帧间动力学 P(o_{t+1}|o_{≤t}, a_{≤t})，把世界模型落地为\"看得到\"的未来影像生成器。",
  "bruteForce": "用 3D-CNN 直接回归未来 N 帧像素，端到端无潜空间，难以捕捉长程结构且易模糊。",
  "invariant": "预测帧序列在语义与时序上应与真实未来\"可被判别器区分但指标相近\"，且动作条件改变时视频走向应随之改变。",
  "walkthrough": "以 256×256 视频、预测 16 帧为例：先用 VAE 把每帧压成 16×16×4 潜变量(共 1024 token)，再用时序 Transformer 在 8 历史帧(8192 token)上自回归预测未来 16 帧潜变量，最后 VAE 解码回像素；训练用 8 卡 A100 约 3 天。",
  "code": "from diffusers import AutoencoderKL\ndef predict_latents(vae, frames, action_cond, temporal_model):\n    z = vae.encode(frames).latent_dist.mode()      # 像素->潜变量\n    z_future = temporal_model(z, action_cond)      # 时序推演未来潜变量\n    return vae.decode(z_future).sample             # 潜变量->像素",
  "complexity": "VAE 编码/解码 O(HW) 每帧；时序模型自回归预测 T 帧为 O(T·L²)(L 为 token 数)，显存随帧数近似线性增长。",
  "beginnerSummary": "像让人看前几秒监控画面，猜接下来几秒会怎样；模型不是逐像素死记，而是先\"看懂\"再\"想象\"后续。",
  "diagram": "frames[t-7..t] --> [VAE encode] --> z (tokens)\n                                    |\n                              action_cond (a_t..a_{t+T})\n                                    v\n                       [Temporal Model] --> z_future\n                                    |\n                              [VAE decode] --> frames[t+1..t+T]",
  "derivation": [
    "为什么需要：机器人/自动驾驶要在像素级预演未来，验证动作安全，不能只看抽象状态。",
    "怎么实现：VAE 压潜变量降维，时序模型(Transformer/SSM)在潜空间做可控预测，再解码回像素。",
    "有什么代价：像素空间长程一致性难保证，扩散去噪慢、自回归易误差累积。",
    "怎么评测：FVD(视频级 Frechet 距离)、PSNR/SSIM，以及下游任务(如碰撞预测)准确率。"
  ],
  "edgeCases": [
    "画面中出现从未见过的物体类别，潜变量无法表示导致扭曲。",
    "长视频(>5秒)自回归逐步漂移，主体身份丢失。",
    "动作条件缺失或错误时，模型退化为无条件的平均化模糊预测。"
  ],
  "pitfalls": [
    "只看 PSNR 高就认为预测好，其实模糊的平均帧骗过了像素指标却丢了运动细节。",
    "把训练时的 teacher forcing 当成 inference，部署时自回归误差被放大。"
  ],
  "prerequisites": [
    "VAE / 自编码器",
    "视频时序建模(RNN/Transformer/SSM)",
    "扩散模型基础"
  ],
  "workedExample": [
    "输入 8 帧 256×256 行车视频 + 未来 4 帧方向盘转角序列。",
    "VAE 把每帧压成 16×16×4 潜变量，时序模型预测出后续 4 帧潜变量并解码，得到\"车向右并线\"的预测视频。"
  ],
  "lineByLine": [
    "vae.encode(...).mode() 取潜变量分布的众数，得到确定性的压缩表示。",
    "temporal_model 接收历史潜变量与动作条件，输出未来潜变量序列。",
    "vae.decode(...).sample 把潜变量还原成像素帧，完成一次视频预测。"
  ],
  "codeNotes": [
    "用 mode() 而非采样可得到确定性预测，适合评测；推理时也可采样做多样性生成。"
  ],
  "followUps": [
    {
      "question": "为什么不直接在像素上做扩散，而要压到潜空间？",
      "answer": "像素空间 256×256×3 计算量与显存巨大，潜空间把 token 数降到千级，大幅降低扩散成本并提升时序一致性。"
    },
    {
      "question": "FVD 和 PSNR 哪个更可信？",
      "answer": "FVD 衡量语义/运动分布更贴近人感，PSNR 只比像素离差易被模糊帧刷分，实际以 FVD 为主、PSNR 为辅。"
    }
  ],
  "followUpAnswers": [
    "像素空间 256×256×3 计算量与显存巨大，潜空间把 token 数降到千级，大幅降低扩散成本并提升时序一致性。",
    "FVD 衡量语义/运动分布更贴近人感，PSNR 只比像素离差易被模糊帧刷分，实际以 FVD 为主、PSNR 为辅。"
  ],
  "kind": "concept"
};
