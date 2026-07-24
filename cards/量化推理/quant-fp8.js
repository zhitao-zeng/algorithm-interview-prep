export default {
  "kind": "concept",
  "id": "quant-fp8",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "FP8 量化(E4M3/E5M2)",
  "prompt": "FP8 量化的两种格式 E4M3 和 E5M2 是什么，怎么用？",
  "quickAnswer": "FP8 用 8 位浮点而非整数表示：E4M3(4 位指数/3 位尾数)动态范围适中、精度较好，适合权重与前向激活；E5M2(5 位指数/2 位尾数)范围更大，适合梯度/易溢出场景。FP8 天然带指数，对 outlier 比 INT8 更友好，且 Hopper/新 GPU 有原生 FP8 Tensor Core。",
  "approach": "前向/权重用 E4M3，易溢出或大动态范围用 E5M2。",
  "explanationFocus": "是什么：FP8 是把数值表示成 8 位浮点(符号+指数+尾数)，两种格式在\"范围\"与\"精度\"间取舍。",
  "bruteForce": "仍用 INT8，对大动态范围/outlier 需额外缩放。",
  "derivation": [
    "为什么需要：INT8 均匀量化对大动态范围/outlier 不友好，FP8 用指数自动适配尺度，更省校准。",
    "怎么实现：E4M3 可表 ~±448、最小步长 2^-9；E5M2 范围更大但精度粗；按张量选择格式并做 cast/clamp。",
    "有什么代价：FP8 尾数少，极端精度敏感处仍会舍入；需要硬件支持才能加速，否则只是存储省。",
    "怎么评测：对比 FP8(E4M3)与 FP16 的精度与吞吐，通常近无损且更快。"
  ],
  "invariant": "FP8 比特数=INT8 但表示浮点；E4M3 精度高、E5M2 范围大。",
  "walkthrough": "H100 上 FP8 矩阵乘峰值约 FP16 的 2 倍；E4M3 用于线性层前向，掉点常<0.5。",
  "edgeCases": [
    "E4M3 最大 448，超范围需切 E5M2 或缩放。",
    "累加仍用 FP32 防误差累积。",
    "不支持硬件上 FP8 无加速。"
  ],
  "code": "# Python (模拟 FP8 E4M3 截断)\ndef to_e4m3(x):\n    x = x.clamp(-448, 448)                      # E4M3 最大有限值\n    return x.to(torch.float8_e4m3fn) if hasattr(torch,'float8_e4m3fn') else x.half()\n# GEMM: C = (A_fp8 @ B_fp8).float()  # 用 FP32 累加",
  "codeNotes": [
    "E4M3 尾数 3 位, 适合前向; E5M2 指数 5 位, 适合梯度。",
    "累加器保持 FP32 是稳定关键。"
  ],
  "complexity": "O(元素) cast；加速取决于 FP8 Tensor Core 是否可用。",
  "followUps": [
    {
      "question": "为什么 FP8 对 outlier 更友好？",
      "answer": "浮点指数自动放大/缩小尺度，无需像 INT8 那样为 outlier 牺牲整体精度，校准也更简单。"
    },
    {
      "question": "E4M3 和 E5M2 怎么分工？",
      "answer": "前向权重/激活用精度更高的 E4M3；反向梯度或动态范围极大的用 E5M2 防溢出。"
    }
  ],
  "followUpAnswers": [
    "FP8 省校准、抗 outlier。",
    "E4M3 前向、E5M2 梯度。"
  ],
  "pitfalls": [
    "以为 FP8 一定比 INT8 准(尾数少仍有舍入)。",
    "累加用低精度导致误差累积。",
    "（事实核查·2025）FP8(E4M3/MXFP8) 已用于训练前向与推理降本；Blackwell 进一步引入 NVFP4（FP4）把权重/激活压更狠。注意 FP8 训练需要 careful loss scaling 与收敛性验证，并非无脑替换。要能量化“精度换算力”的 trade-off。"
  ],
  "beginnerSummary": "INT8 像固定刻度的尺(每格一样宽)，遇到特别大的数就得把整把尺拉长、精度变粗。FP8 像科学计数法(1.23×10³)，自动用指数调刻度，大小数都能塞进 8 位——E4M3 是\"刻度细\"版，E5M2 是\"能数到很大\"版。",
  "prerequisites": [
    "浮点=符号+指数+尾数。",
    "INT8 均匀量化对 outlier 吃力。",
    "新 GPU 有 FP8 指令。"
  ],
  "workedExample": [
    "E4M3: 1 符号+4 指数+3 尾数, 范围±448。",
    "E5M2: 1+5+2, 范围更大精度更粗。"
  ],
  "lineByLine": [
    "选格式(E4M3/E5M2)。",
    "clamp 到格式可表范围。",
    "cast 成 FP8。",
    "低精度乘、FP32 累加。"
  ],
  "diagram": "FP8(8bit): [S|Exp|Mant]\nE4M3: 1|1111|111  (精度高, 范围±448)\nE5M2: 1|11111|11  (范围大, 精度粗)"
};
