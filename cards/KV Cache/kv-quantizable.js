export default {
  "kind": "concept",
  "id": "kv-quantizable",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "KV Cache 能否量化",
  "prompt": "KV Cache 能不能量化？",
  "quickAnswer": "可以。KV Cache 通常占大量显存，且对精度相对不敏感，是最适合量化的部分之一。常见做法：把 K/V 从 FP16 量化到 INT8/FP8（约省一半）甚至 INT4（约省 3/4），在 Cache 中存低精度、计算前按需反量化。多数场景下质量损失很小，是长上下文服务的标配优化。",
  "approach": "KV 量化：存低精度(K/V)，用前反量化；FP8/INT8 常用，INT4 激进。",
  "explanationFocus": "是什么：KV Cache 是显存大户且对数值精度较鲁棒，适合量化到 INT8/FP8/INT4 以省显存。",
  "bruteForce": "全 FP16 存 KV → 长上下文显存吃紧、并发受限。",
  "derivation": [
    "为什么需要：KV 占显存大，量化是性价比最高的降压手段之一。",
    "怎么实现：对每层 K/V 做 per-token 或 per-channel 缩放量化；Cache 存低精度，Attention 计算前反量化或用语低位 kernel。",
    "有什么代价：量化引入舍入误差，极端长上下文或敏感任务可能有质量下滑；需低精度 Attention kernel 支持。",
    "怎么评测：对比量化前后 KV 显存、吞吐与下游精度（尤其长上下文任务）。"
  ],
  "invariant": "KV 显存 ∝ 每参数字节数；FP16→INT8 约 1/2。注意本函数返回 torch.int8（1 字节），bits=4 时仍只是 int8（1/2 显存），并非真正 INT4（0.5 字节）；‘INT4 约 1/4’需配套两个 4-bit 打包进 1 字节或专用 packed 格式/ kernel 才成立。",
  "walkthrough": "FP16→INT8：单请求 KV 2GB→1GB，同显存并发翻倍；用 per-token 缩放 + 反量化注意力，困惑度几乎不变。",
  "edgeCases": [
    "INT4 更激进，需更细缩放(如 per-head)以防崩。",
    "异常值(outlier)会放大 KV 量化误差，需处理。",
    "需框架支持低精度 KV Attention kernel。"
  ],
  "code": "# Python\ndef quantize_kv(tensor, bits=8):\n    maxval = tensor.abs().max()\n    scale = maxval / (2**(bits-1) - 1) if float(maxval) > 0 else torch.tensor(1.0)     # 对称缩放; maxval 为 0 时避免除零(scale 置 1)\n    # 注意: torch.int8 始终占 1 字节; bits=4 时本函数仍返回 int8(仅 1/2 显存),\n    #       真正 INT4 需把两个 4-bit 数打包进 1 字节或专用 packed 格式/ kernel。\n    return torch.round(tensor / scale).to(torch.int8), scale\n\ndef dequantize(q, scale):\n    return q.float() * scale",
  "codeNotes": [
    "FP8(E4M3) 对 KV 很友好且硬件加速。",
    "per-token 缩放比 per-tensor 更稳。"
  ],
  "complexity": "量化 O(元素数)；省下的显存线性于精度下降（×1/2 或 ×1/4）。",
  "followUps": [
    {
      "question": "KV 量化会不会明显掉点？",
      "answer": "通常很小。KV 是中间激活而非权重，对舍入较鲁棒；INT8/FP8 在多数基准近乎无损，INT4 需更细缩放才会略降。"
    },
    {
      "question": "为什么先量化 KV 而不是权重？",
      "answer": "权重量化要保任务精度更难(有 outlier)，而 KV 对精度更宽容且体量随上下文暴涨；先量化 KV 收益大、风险小，是性价比首选。"
    }
  ],
  "followUpAnswers": [
    "KV 量化优先于权重量化。",
    "FP8 KV 几乎无损且硬件快。"
  ],
  "pitfalls": [
    "忽略 outlier 导致量化崩。",
    "以为量化一定掉点（KV 很鲁棒）。"
  ],
  "beginnerSummary": "笔记内容不必用高清纸笔记录，潦草缩写（低精度）也看得懂，还省地方。把 KV 从“工整手写(FP16)”改成“速记缩写(INT8/INT4)”，笔记体积直接砍半甚至砍到 1/4，桌上一半空间腾出来了，而内容基本不丢。",
  "prerequisites": [
    "KV 占显存大。",
    "KV 对精度较鲁棒。",
    "量化=低精度存储+反量化计算。"
  ],
  "workedExample": [
    "FP16→INT8：KV 2GB→1GB，并发约 ×2。",
    "FP16→INT4：KV 2GB→0.5GB，但需细缩放防崩。"
  ],
  "lineByLine": [
    "KV 适合量化(占显存大、容错好)。",
    "FP16→INT8/FP8 省一半，INT4 省 3/4。",
    "Cache 存低精度，用前反量化。",
    "需低精度 KV Attention kernel。"
  ],
  "diagram": "精度: FP16(2B) ─▶ INT8(1B) 省1/2 ─▶ INT4(0.5B) 省3/4\nKV 量化: 高收益 + 低质量风险\n(因 KV 对舍入较鲁棒)"
};
