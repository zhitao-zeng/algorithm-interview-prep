export default {
  "kind": "concept",
  "id": "quant-what",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "模型量化是什么",
  "prompt": "大模型推理里的量化是什么，为什么推理要做量化？",
  "quickAnswer": "量化把模型权重/激活从 FP16/BF16 映射到 INT8/INT4/FP8 等低精度表示，用更小存储与更快的低精度计算换得显存下降与吞吐提升。代价是引入舍入误差，设计不当会掉点，因此需校准与合适粒度。",
  "approach": "低精度存储+计算，用缩放因子把低精度值映射回原数值范围。",
  "explanationFocus": "是什么：量化用低比特(INT8/INT4/FP8)表示权重/激活，以精度换显存与速度。",
  "bruteForce": "全 FP16 推理：显存与算力都紧，并发和长上下文受限。",
  "derivation": [
    "为什么需要：LLM 权重量大、KV 随上下文线性暴涨，FP16 显存与带宽成为瓶颈；低精度可同时降显存、提算力。",
    "怎么实现：对权重/激活做线性缩放量化（如 INT8 对称 x_q=round(x/s)），存储低精度，计算前/中反量化或使用低位 kernel。",
    "有什么代价：舍入误差可能掉点；需校准与特殊 kernel；outlier 难处理；并非所有层都耐量化。",
    "怎么评测：对比量化前后显存、吞吐与下游精度（困惑度、MMLU 等），看 P99 是否劣化。"
  ],
  "invariant": "量化误差随比特数下降而上升；INT8≈1/2 显存，INT4≈1/4。",
  "walkthrough": "7B 模型 FP16 权重约 14GB；量化为 INT4 约 3.5GB，显存大降、可上更大 batch。",
  "edgeCases": [
    "outlier 通道：全局缩放被压扁，需 per-channel/per-group 或 SmoothQuant。",
    "敏感层（如 lm_head）：宜留高精度。",
    "激活比权重更敏感，常需更高精度或细粒度。"
  ],
  "code": "# Python\ndef linear_quantize(tensor, bits=8):\n    qmin, qmax = -(2**(bits-1)), 2**(bits-1)-1\n    scale = tensor.abs().max() / qmax          # 对称缩放\n    q = (tensor / scale).round().clamp(qmin, qmax)\n    return q, scale                             # 存 q, 用前 q*scale 反量化",
  "codeNotes": [
    "对称量化 z=0，公式简单、硬件友好。",
    "per-group 缩放比 per-tensor 更耐 outlier。"
  ],
  "complexity": "量化 O(元素)；省显存线性于精度下降；算力取决于低精度 kernel 支持。",
  "followUps": [
    {
      "question": "权重量化和激活量化哪个更难？",
      "answer": "激活含 outlier 且随输入变化，比权重更难；所以常见 W4A16（只量化权重）或需 SmoothQuant 把激活难度迁移到权重。"
    },
    {
      "question": "INT4 一定掉点吗？",
      "answer": "若用细粒度 group 缩放与校准，多数任务可接近无损；粗粒度全局缩放则易崩。"
    }
  ],
  "followUpAnswers": [
    "W4A16 是性价比常用配置。",
    "group 缩放显著提升 INT4 质量。"
  ],
  "pitfalls": [
    "以为量化一定掉点（INT8/FP8 在合理粒度下常接近无损，但非绝对，敏感任务仍可能掉点）。",
    "忽略 outlier 导致全局缩放崩。"
  ],
  "beginnerSummary": "模型参数原本用\"高清\"数字(FP16)记录，占地方又算得慢。量化好比把高清笔记改成速记缩写(INT8/INT4)，地方省一大半、翻得也快，代价是偶尔写错一两个字——只要缩写规则(缩放)设计好，大部分内容不丢。",
  "prerequisites": [
    "模型由大量浮点参数组成。",
    "低精度计算有硬件加速(Tensor Core)。",
    "量化=低精度存储+缩放反量化。"
  ],
  "workedExample": [
    "7B FP16 权重约 14GB → INT4 约 3.5GB。",
    "对称缩放: scale=max/127, 量化=round(x/scale)。"
  ],
  "lineByLine": [
    "选缩放因子(对称/非对称)。",
    "浮点乘 scale 后 round 到整数。",
    "存整数权重/激活。",
    "计算前乘回 scale 反量化。"
  ],
  "diagram": "FP16(2B) ─▶ INT8(1B) 省1/2 ─▶ INT4(0.5B) 省3/4\n代价: 舍入误差 → 需校准/细粒度缩放"
};
