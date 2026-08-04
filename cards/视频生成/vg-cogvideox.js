export default {
  "id": "vg-cogvideox",
  "category": "视频生成",
  "difficulty": "Hard",
  "title": "CogVideoX 模型",
  "prompt": "CogVideoX 的 3D 因果 VAE 与“专家 Transformer（STDiT）”是怎么配合实现文生视频的？",
  "quickAnswer": "CogVideoX 用 3D 因果 VAE 把视频压缩为时空潜变量，再用一个 3D 因果卷积 + 专家 Transformer（空间专家负责单帧内、时间专家负责帧间）在潜空间做扩散去噪，文本经 T5 编码作为条件。因果结构保证推理时可流式生成，专家分离让长视频建模更高效。",
  "approach": "先以 3D 因果 VAE 编码视频得到潜变量，沿时空做 patch 嵌入；Transformer 中空间专家处理每帧内部 token、时间专家沿帧轴处理同位置 token；训练目标是预测加噪潜变量的噪声，推理用多步采样还原。",
  "explanationFocus": "是什么：CogVideoX 是智谱提出的文生视频模型，核心是“3D 因果 VAE 压缩 + 专家化时空 Transformer 扩散”，用因果卷积保证时间方向可流式、用空间/时间专家分工降低长视频注意力开销。",
  "bruteForce": "朴素做法是对每一帧独立用 2D 扩散生成再用时序模型拼接，帧间一致性差且无法端到端优化时空联合分布。",
  "invariant": "因果约束不变量：第 t 帧的潜变量只依赖第 <=t 帧的信息，保证流式解码时不会“偷看未来”，去噪目标在每一步仍是对真实噪声残差的回归。",
  "walkthrough": "视频经 3D 因果 VAE 编码为 z；加噪得 zt；文本经 T5 编码为 cond；专家 Transformer 以 (zt, t, cond) 预测噪声；多步去噪得 z0；3D 因果 VAE 解码还原视频。",
  "complexity": "时间专家沿帧轴的注意力约 O(T^2·(hw))，空间专家约 O((hw)^2·T)；因果卷积额外引入线性开销。相比全时空联合注意力显著降低峰值显存。",
  "beginnerSummary": "一句话：CogVideoX 把视频压成小潜变量后，用一个“分了工的 Transformer”——一部分看画面内部、一部分看帧与帧之间——按文字逐步去噪生成视频，而且可以像流水一样一帧帧往后出。",
  "diagram": "text -> [T5] -> cond\nvideo -> [3D Causal VAE] -> z0 -> +noise -> zt\nzt -> [Spatial Expert: per-frame attn] -+\n      -> [Temporal Expert: per-token across frames] -+\n           (zt,t,cond) -> pred_noise -> z0_hat\nz0_hat -> [3D Causal VAE dec] -> video",
  "code": "def cogvideox_step(zt, t, cond, spatial_expert, temporal_expert):\n    h = spatial_expert(zt, cond)          # 帧内建模\n    h = temporal_expert(h, t)             # 帧间因果建模\n    return h",
  "derivation": [
    "为什么需要：要让文生视频既能建模长程时间依赖，又能在推理时流式输出，且显存可控。",
    "怎么实现：用 3D 因果 VAE 做时空压缩并约束时间因果性；Transformer 拆成空间专家（帧内自注意力）与时间专家（跨帧因果注意力），文本用 T5 注入作为条件，在潜空间做扩散。",
    "有什么代价：专家结构增加实现与通信复杂度，因果约束限制模型利用“未来帧”信息，长视频仍需分段与位置外推处理。",
    "怎么评测：用 FVD、VBench（语义一致、运动质量、时空一致性）及人工偏好评测，并测流式延迟与显存峰值。"
  ],
  "edgeCases": [
    "长视频超出训练帧数：需要位置编码外推或分段重叠生成。",
    "强运动场景：时间专家容量不足导致运动模糊，需要更高时间分辨率。",
    "文本描述多主体：条件注意力分散，主体易丢失，需要布局控制。",
    "低光/高动态范围视频：3D VAE 重建质量下降。"
  ],
  "pitfalls": [
    "把空间专家和时间专家简单串行却不共享位置编码，导致帧间错位。",
    "误用非因果注意力做训练却要求流式推理，线上出现帧抖动或“未来泄漏”。"
  ],
  "prerequisites": [
    "扩散模型与噪声预测目标。",
    "3D 卷积 / 因果卷积与视频时空压缩。",
    "Mixture-of-Experts 或多专家注意力基本概念。"
  ],
  "workedExample": [
    "输入“宇航员在月球上跳跃”，T5 编码文本，3D 因果 VAE 提供潜空间，专家 Transformer 去噪 50 步生成 5 秒片段，可逐帧流式解码。",
    "图生视频时把首帧作为强条件注入，空间专家锁定首帧内容，时间专家只生成后续帧运动。"
  ],
  "lineByLine": [
    "def cogvideox_step(zt, t, cond, spatial_expert, temporal_expert): 定义一步去噪，含时空专家。",
    "h = spatial_expert(zt, cond) 先在每个时间片内部做自注意力，捕捉单帧结构并与文本对齐。",
    "h = temporal_expert(h, t) 再沿时间轴做因果注意力，建模帧间运动，t 控制当前时间步。",
    "return h 返回融合时空信息后的隐藏表示，供噪声头预测噪声。"
  ],
  "codeNotes": [
    "真实实现中空间/时间专家常交替堆叠多层，而非单次调用；这里为示意做了简化。"
  ],
  "followUps": [
    {
      "question": "为什么用因果 VAE 而不是普通 3D VAE？",
      "answer": "因果 VAE 的时间卷积只依赖过去帧，使编码与解码都可流式进行，适合实时/长视频生成；普通 3D VAE 需整段视频才能编码，无法在线生成。"
    },
    {
      "question": "空间专家和时间专家如何避免信息错位？",
      "answer": "两者共享同一套时空位置编码与潜变量布局，时间专家在“同空间位置、不同帧”的 token 上做注意力，保证对齐；训练时联合优化。"
    }
  ],
  "followUpAnswers": [
    "因果 VAE 的时间卷积只依赖过去帧，使编码与解码都可流式进行，适合实时/长视频生成；普通 3D VAE 需整段视频才能编码，无法在线生成。",
    "两者共享同一套时空位置编码与潜变量布局，时间专家在“同空间位置、不同帧”的 token 上做注意力，保证对齐；训练时联合优化。"
  ],
  "kind": "concept"
};
