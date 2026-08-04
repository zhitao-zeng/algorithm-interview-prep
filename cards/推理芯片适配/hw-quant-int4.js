export default {
  "id": "hw-quant-int4",
  "category": "推理芯片适配",
  "difficulty": "Hard",
  "title": "端侧 INT4 量化",
  "prompt": "在端侧 NPU 上做 INT4 权重量化时，主要面临哪些精度与部署挑战，应如何应对？",
  "quickAnswer": "INT4 仅 16 个量化级别，weights 量化误差被放大，需采用逐通道（per-channel）缩放、校准集选择代表性数据、对敏感层保留更高精度（混合精度），并配合 NPU 的 INT4 专用指令与反量化逻辑；部署上要解决权重的 INT4 打包格式与反量化开销。",
  "approach": "从\"量化公式与粒度\"入手：说明对称/非对称、per-tensor vs per-channel；再谈校准、敏感层保护、混合精度，最后落到端侧 NPU 的指令与数据布局支持。",
  "explanationFocus": "是什么：INT4 权重量化是把 FP16/FP32 权重压缩到 4-bit 整数表示，以减半（相对 INT8）或 1/4（相对 FP16）的存储与带宽换取推理加速，代价是量化误差。",
  "bruteForce": "朴素量化：对整模型用单一全局 scale 做 INT4，不考虑通道分布差异，结果很多层严重失真、精度崩塌。",
  "invariant": "反量化后权重在数值上应\"尽量逼近\"原始权重，即量化-反量化（fake quant）过程在训练/校准时保持可微与一致，保证部署与模拟一致。",
  "walkthrough": "以端侧视觉模型为例：用校准集统计每通道分布 → per-channel 计算 scale/zero-point → 对注意力输出等敏感层保留 INT8 → 把 INT4 权重按 NPU 要求的 2-in-1 字节打包 → 推理时硬件解包并乘加。",
  "complexity": "量化本身为 O(权重数) 的一次性离线开销；推理期 INT4 降低权重访存 4 倍（相对 FP16），计算若支持 INT4 MAC 则算力也提升，但反量化与解包引入少量额外指令。",
  "beginnerSummary": "INT4 像用 4 档而不是 16 档调色：省空间但色阶粗；聪明做法是给重要图层留更多档（混合精度），并选有代表性的样本定档位。",
  "diagram": "FP16 weights\n   | per-channel quant\n   v\nINT4 (2 per byte)\n   | NPU dequant\n   v\nINT4 MAC -> output",
  "code": "def quant_int4(w, scale, zero):\n    q = torch.round(w / scale + zero).clamp(0, 15)\n    return q.to(torch.int8)  # 实际 2 值打包",
  "derivation": [
    "为什么需要：端侧 NPU 内存与带宽紧张，FP16 权重体积大，INT4 把权重存储与带宽压到 1/4，是端侧落地的关键手段。",
    "怎么实现：用校准集确定每通道 scale/zero-point，做对称或非对称量化；敏感层保留 INT8/FP16（混合精度）；按硬件要求把两个 4-bit 打包进一个字节。",
    "有什么代价：4-bit 级少，量化误差大，易在注意力/归一化等层掉点；需校准与混合精度，增加部署复杂度与调参成本。",
    "怎么评测：用任务精度（如准确率）回退幅度、权重压缩比与端到端时延/功耗评测；关注敏感层是否保精度。"
  ],
  "edgeCases": [
    "离群值（outlier）权重：少数极大权重撑大 scale，使其余权重全部挤到极低档，需 clip 或逐异常通道处理。",
    "校准集不匹配：用错分布校准导致 scale 偏差，部署精度崩。",
    "硬件不支持 INT4 MAC：需反量化回 INT8/FP16 计算，失去算力收益只省带宽。",
    "激活未量化：仅权重量化时激活仍是 FP16，需注意计算单元的数据通路兼容。"
  ],
  "pitfalls": [
    "全局单一 scale：忽略通道间分布差异，是精度崩塌最常见原因。",
    "只压权重不看激活：若激活仍高精度且硬件无 INT4 计算，收益仅限带宽，误判加速效果。"
  ],
  "prerequisites": [
    "量化基础（scale/zero-point、对称/非对称量化）",
    "校准（calibration）与混合精度概念"
  ],
  "workedExample": [
    "示例1：对 CNN 主干做 INT4 权重量化，per-channel + 敏感层 INT8，ImageNet top-1 仅掉 0.8%。",
    "示例2：端侧 LLM 用 INT4 权重 + INT8 激活，模型体积降为 1/4，首 token 时延减半。"
  ],
  "lineByLine": [
    "def quant_int4(w, scale, zero): 入参为权重张量、每通道 scale 与零点。",
    "q = torch.round(w / scale + zero).clamp(0, 15) 仿量化到 4-bit 范围并裁剪。",
    "return q.to(torch.int8) 返回整数；真实部署再两个值打包进一个字节以省带宽。"
  ],
  "codeNotes": [
    "示意用 PyTorch 表达 fake quant；生产用校准后的常量 scale，并在 NPU 上走专用 INT4 解包路径。"
  ],
  "followUps": [
    {
      "question": "权重量化（weight-only）和激活也量化（W8A8）有什么区别？",
      "answer": "weight-only 只压权重省带宽，计算仍在较高精度；W8A8 同时压激活，可走 INT8 MAC 获得算力收益，但对激活分布更敏感、更易掉点。"
    },
    {
      "question": "INT4 为什么通常需要 per-channel 而非 per-tensor？",
      "answer": "不同输出通道权重分布差异大，per-tensor 的单一 scale 会被极值撑大，使多数通道量化过粗；per-channel 各自定标可显著降低误差。"
    }
  ],
  "followUpAnswers": [
    "weight-only 只压权重省带宽，计算仍较高精度；W8A8 同时压激活可走 INT8 MAC 获算力收益但更易掉点。",
    "不同通道分布差异大，per-tensor 单一 scale 被极值撑大使多数通道过粗；per-channel 各自定标降误差。"
  ],
  "kind": "concept"
};
