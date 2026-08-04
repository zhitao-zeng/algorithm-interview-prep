export default {
  "id": "wm-video-forecast",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "视频预测模型（对比 VAE/扩散）",
  "prompt": "用世界模型的视角做视频预测时，VAE 系与扩散系方法各有什么权衡，应如何选择？",
  "quickAnswer": "VAE 系（如 SVG、VAE-forecasting）训练快、推理确定性但易出现模糊平均；扩散系生成清晰、能刻画多模态未来但采样慢、训练复杂。世界模型常把二者结合：用 VAE 提供紧凑潜空间，用扩散在潜空间或像素空间补全细节。",
  "approach": "VAE 路线：编码帧为潜码、在潜空间自回归预测再解码；扩散路线：以过去帧为条件逐步去噪生成未来帧。折中：在 VAE 潜空间上跑扩散（latent diffusion）兼顾效率与清晰。",
  "explanationFocus": "是什么：视频预测是“给前几帧、生成后续帧”的任务，也是世界模型最常用的自监督训练信号之一；常见做法是 VAE 系（潜空间自回归，快但偏模糊）与扩散系（逐步去噪，清晰但慢），二者常在潜空间融合。",
  "bruteForce": "朴素做法：直接对像素做自回归 CNN 预测，序列长、计算大且难建模多模态未来。",
  "invariant": "不变式：无论 VAE 还是扩散，预测帧在条件帧一致时应保持时序连贯，且多步预测的运动轨迹不应自相矛盾。",
  "walkthrough": "1) 编码历史帧为表征；2) VAE 路线在潜空间 rollout 后解码，扩散路线以历史为条件做多步去噪；3) 用 LPIPS/ FVD 评估清晰度与时序；4) 按需融合潜扩散提速。",
  "complexity": "说明：VAE 推理接近一次前向，扩散需多步去噪，步数决定延迟；训练上扩散更吃显存与调度。",
  "beginnerSummary": "入门概览：视频预测就像“看前几张图猜后面会发生什么”。VAE 快但画得糊，扩散画得清但慢，工程上常在压缩后的小图（潜空间）上用扩散。",
  "diagram": "history frames\n   |\n   +--> [ VAE ] --> latent rollout --> decode  (fast, blurry)\n   |\n   +--> [ condition ] --> [ diffusion denoise x T ] --> sharp frames (slow)\n   |\n   +--> [ latent diffusion ] --> decode  (balanced)",
  "code": "def forecast(frames, model, steps=10):\n    # 自回归预测未来帧潜变量后解码\n    z = model.encode(frames)\n    for _ in range(steps):\n        z = model.transition(z)\n    return model.decode(z)",
  "derivation": [
    "为什么需要：像素级 MSE 预测倾向于输出多模态未来的平均值（模糊），而真实未来本就多可能，需要能表达不确定性的生成模型。",
    "怎么实现：VAE 系在潜空间自回归并解码；扩散系以历史为条件做多步去噪；latent diffusion 把扩散搬到压缩潜空间降低代价。",
    "有什么代价：VAE 模糊且可能模式崩塌；扩散采样慢、需调度与高显存；潜空间方法牺牲部分像素细节。",
    "怎么评测：用 FVD / LPIPS / SSIM 在测试集对比清晰度与多样性，并测长程预测的运动一致性。"
  ],
  "edgeCases": [
    "未来存在多种合理走向时，VAE 会平均成糊状，扩散能给出多样本但需多次采样。",
    "长程预测误差逐帧累积，运动逐渐停滞或失真。",
    "训练/测试分辨率不一致时扩散的去噪调度需重新校准。"
  ],
  "pitfalls": [
    "只用 MSE 当指标会偏好模糊结果，忽视多模态正确性，应补 FVD。",
    "把扩散步数调得过小以提速，导致生成帧出现结构性伪影。"
  ],
  "prerequisites": [
    "变分自编码器与重参数化",
    "扩散模型与去噪调度基础"
  ],
  "workedExample": [
    "示例：在 BAIR 机器人推杆数据上，SVG（VAE 系）能给出平滑但偏模糊的未来，latent diffusion 在更少步数下更清晰。",
    "示例：自动驾驶前视预测中，用条件扩散生成多种避让轨迹，再用世界模型筛选可行者。"
  ],
  "lineByLine": [
    "def forecast(frames, model, steps=10): 给定历史帧预测未来若干步。",
    "z = model.encode(frames) 把历史压缩到潜空间，降低后续预测维度。",
    "z = model.transition(z) 在潜空间自回归推进，每步生成下一帧潜码。",
    "return model.decode(z) 解码潜码回像素得到预测帧。"
  ],
  "codeNotes": [
    "在潜空间而非像素上 rollout 可显著减少计算与误差累积，是 VAE 系视频预测的核心思路。"
  ],
  "followUps": [
    {
      "question": "视频预测与“世界模型”是同一回事吗？",
      "answer": "不是。视频预测只是重建像素的未来，世界模型还包含动作条件、奖励与可控规划，视频预测常作为其自监督训练信号。"
    },
    {
      "question": "何时选 latent diffusion 而非纯扩散？",
      "answer": "当实时性或显存受限、且可接受轻微细节损失时，latent diffusion 用更少去噪步数换取效率。"
    }
  ],
  "followUpAnswers": [
    "不是。视频预测只是重建像素的未来，世界模型还包含动作条件、奖励与可控规划，视频预测常作为其自监督训练信号。",
    "当实时性或显存受限、且可接受轻微细节损失时，latent diffusion 用更少去噪步数换取效率。"
  ],
  "kind": "concept"
};
