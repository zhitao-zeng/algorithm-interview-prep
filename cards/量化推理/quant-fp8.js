export default {
  "kind": "concept",
  "id": "quant-fp8",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "FP8 量化(E4M3/E5M2)",
  "prompt": "FP8 量化的两种格式 E4M3 和 E5M2 是什么，怎么用？",
  "quickAnswer": "FP8 用 8 位浮点而非整数表示：E4M3（4 指数/3 尾数）动态范围适中、精度较好，适合权重与前向激活；E5M2（5 指数/2 尾数）范围更大，适合梯度/易溢出场景。FP8 天然带指数，对 outlier 比 INT8 更友好，校准更简单，且 Hopper/Blackwell 等新一代 GPU 有原生 FP8/FP4 Tensor Core 可加速。",
  "approach": "实践上按张量选格式：前向的权重与激活用精度更高的 E4M3；反向梯度或动态范围极大的用 E5M2 防溢出。流程是\"选格式 → clamp 到该格式可表范围 → cast 成 FP8 → 低位乘 → FP32 累加\"，必要时配微小 loss scaling 防下溢。",
  "explanationFocus": "是什么：FP8 量化是把数值表示成 8 位浮点（符号 + 指数 + 尾数），而不是像 INT8 那样用定点整数。它提供两种格式在\"动态范围\"与\"精度\"之间做取舍——E4M3（4 位指数/3 位尾数）范围适中、精度较好，适合权重与前向激活；E5M2（5 位指数/2 位尾数）范围更大，适合梯度或易溢出场景。由于浮点带指数，它对 outlier 比 INT8 更友好，且 Hopper/新 GPU 有原生 FP8 Tensor Core。",
  "bruteForce": "仍用 INT8，对大动态范围/outlier 需额外的 per-channel/per-group 缩放与细致校准，工程复杂；而 FP8 用指数自动适配尺度，对 outlier 天生更宽容，校准更省心。",
  "derivation": [
    "为什么需要：INT8 均匀量化对大动态范围/outlier 不友好，需额外缩放与校准；FP8 用指数自动适配尺度，更省校准且对 outlier 宽容，新硬件又给了原生加速。",
    "怎么实现：E4M3 可表 ~±448、最小步长 2^-9；E5M2 范围更大但精度粗；按张量选择格式并做 cast/clamp，低位乘完用 FP32 累加。",
    "有什么代价：FP8 尾数少，极端精度敏感处仍会舍入；需要硬件支持才能加速（否则只省存储）；训练用 FP8 还需 loss scaling 与收敛验证。",
    "怎么评测：对比 FP8(E4M3) 与 FP16 的精度（困惑度、任务指标）与吞吐，通常近无损且更快；训练场景还要看 loss 曲线是否稳定收敛。"
  ],
  "invariant": "FP8 比特数 = INT8（都是 8 bit）但表示的是浮点；E4M3 精度高、E5M2 范围大；累加器保持 FP32 是稳定铁律。无论哪种格式，超出可表范围都必须 clamp，否则溢出成 inf/nan。",
  "walkthrough": "具体看硬件收益：H100（Hopper）上 FP8 矩阵乘峰值约为 FP16 的 2 倍（如 1979 vs 989 TFLOPs），E4M3 用于线性层前向，多数任务掉点 < 0.5%。数值范围上，E4M3 可表约 ±448、最小步长 2^-9，E5M2 范围更大但尾数仅 2 位、精度更粗。累加器仍用 FP32，避免低精度累加的误差爆炸——这是稳定关键。",
  "edgeCases": [
    "E4M3 最大有限值约 448，超范围需切 E5M2 或做缩放/clamp，否则溢出。",
    "累加仍用 FP32 防误差累积：若在 FP8 累加会快速爆炸/消失。",
    "不支持 FP8 的硬件上只省存储、不加速，收益有限。",
    "（2025 现状）Blackwell 进一步引入 NVFP4（FP4），把权重/激活压到 4bit，trade-off 更激进，需精细 scaling。"
  ],
  "code": "# Python (模拟 FP8 E4M3 截断)\ndef to_e4m3(x):\n    x = x.clamp(-448, 448)                      # E4M3 最大有限值\n    return x.to(torch.float8_e4m3fn) if hasattr(torch,'float8_e4m3fn') else x.half()\n# GEMM: C = (A_fp8 @ B_fp8).float()  # 用 FP32 累加",
  "codeNotes": [
    "E4M3 尾数 3 位适合前向；E5M2 指数 5 位适合梯度，分工明确。",
    "累加器保持 FP32 是稳定关键，绝不能省。",
    "草图用 torch.float8_e4m3fn 模拟；真实训练还需 loss scaling 与 master weight 维护。"
  ],
  "complexity": "cast 为 O(元素数)，几乎免费；真正的加速取决于 FP8 Tensor Core 是否可用——有则 GEMM 吞吐翻倍，无则只是存储省一半、算力不变。训练前向用 FP8 还需 careful loss scaling 与收敛性验证，并非无脑替换。",
  "followUps": [
    {
      "question": "为什么 FP8 对 outlier 更友好？",
      "answer": "浮点的指数部分能自动放大/缩小尺度，无需像 INT8 那样为 outlier 牺牲整体精度去拉大全局 scale；因此校准更简单，少量极端值不会压垮整张量的量化粒度。"
    },
    {
      "question": "E4M3 和 E5M2 怎么分工？",
      "answer": "前向的权重/激活用精度更高的 E4M3（尾数 3 位，掉点小）；反向梯度或动态范围极大的量用 E5M2（指数 5 位，防溢出）。训练里常见组合是权重/激活 E4M3、梯度 E5M2。"
    },
    {
      "question": "FP8 训练要注意什么？",
      "answer": "关键是保持 FP32 累加/master weight，并对梯度做 careful loss scaling 防下溢；还要验证 loss 收敛曲线与 FP16 基线一致。Blackwell 的 NVFP4 把压缩推到 4bit，更激进但需更精细的 scaling 与逐组量化。"
    }
  ],
  "followUpAnswers": [
    "浮点的指数部分能自动放大/缩小尺度，无需像 INT8 那样为 outlier 牺牲整体精度去拉大全局 scale；因此校准更简单，少量极端值不会压垮整张量的量化粒度。",
    "前向的权重/激活用精度更高的 E4M3（尾数 3 位，掉点小）；反向梯度或动态范围极大的量用 E5M2（指数 5 位，防溢出）。训练里常见组合是权重/激活 E4M3、梯度 E5M2。",
    "关键是保持 FP32 累加/master weight，并对梯度做 careful loss scaling 防下溢；还要验证 loss 收敛曲线与 FP16 基线一致。Blackwell 的 NVFP4 把压缩推到 4bit，更激进但需更精细的 scaling 与逐组量化。"
  ],
  "pitfalls": [
    "以为 FP8 一定比 INT8 准：FP8 尾数同样很少（E4M3 仅 3 位），极端精度敏感处仍有舍入，不能神话。",
    "累加用低精度导致误差累积：务必保持 FP32 累加器，这是稳定关键。",
    "无脑替换训练：FP8 训练需要 careful loss scaling 与收敛性验证，并非把权重直接转 FP8 就完事。"
  ],
  "beginnerSummary": "INT8 像固定刻度的尺（每格一样宽），遇到特别大的数就得把整把尺拉长、精度变粗。FP8 像科学计数法（1.23×10³），自动用指数调刻度，大小数都能塞进 8 位——E4M3 是\"刻度细\"版（精度高、能量到 ±448），E5M2 是\"能数到很大\"版（范围大、精度粗）。新显卡原生支持 FP8 乘法，所以既省内存又加速。",
  "prerequisites": [
    "浮点 = 符号 + 指数 + 尾数：理解指数提供动态范围、尾数提供精度，二者此消彼长。",
    "INT8 均匀量化对 outlier 吃力：明白为什么固定刻度在遇到大数时精度塌缩。",
    "新 GPU 有 FP8/FP4 指令：Hopper/Blackwell 的 Tensor Core 原生支持低位浮点乘加。"
  ],
  "workedExample": [
    "E4M3：1 符号 + 4 指数 + 3 尾数，范围约 ±448、步长 2^-9，适合前向权重/激活。",
    "E5M2：1 + 5 + 2，范围更大（指数 5 位）但精度更粗（尾数 2 位），适合反向梯度防溢出。",
    "H100 实测：FP8 GEMM 峰值约 FP16 的 2 倍，E4M3 前向掉点常 < 0.5%，且省一半权重显存。"
  ],
  "lineByLine": [
    "选格式（E4M3/E5M2）：按张量动态范围决定用\"精度型\"还是\"范围型\"。",
    "clamp 到格式可表范围：E4M3 截到 ±448，防溢出成 inf。",
    "cast 成 FP8：把 FP16/BF16 张量转成 8 位浮点存储/计算。",
    "低精度乘、FP32 累加：乘法在 FP8 完成，累加器保持 FP32 防误差爆炸。"
  ],
  "diagram": "FP8(8bit): [S|Exp|Mant]\nE4M3: 1|1111|111  (精度高, 范围±448)\nE5M2: 1|11111|11  (范围大, 精度粗)"
};
