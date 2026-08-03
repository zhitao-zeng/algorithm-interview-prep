export default {
  "id": "hw-quant-on-chip",
  "category": "推理芯片适配",
  "difficulty": "Hard",
  "title": "芯片端量化部署",
  "prompt": "如何将训练好的浮点模型量化部署到仅支持 INT8 的国产推理芯片上？",
  "quickAnswer": "先做 PTQ 校准确定每层的量化参数(scale/zero-point)，把权重与激活从 FP32 映射为 INT8。再通过芯片量化算子(conv_int8)执行整型计算，最后反量化或接下一层量化。对敏感层用混合精度或 QAT 微调来挽回精度。",
  "approach": "流程为：校准集前向收集激活分布→选量化粒度(per-tensor/per-channel)与方案(symmetric/affine)→生成量化模型→在芯片上跑 int8 kernel。关键是为每层和每个通道确定 scale，使截断误差最小。",
  "explanationFocus": "是什么：芯片端量化部署是把 FP32 模型用更低比特(通常 INT8)表示与计算，以适配只支持整型的推理芯片并换取更高吞吐与更低功耗。",
  "bruteForce": "强行把浮点模型在芯片上用软件模拟 INT8，或退回到 FP16/FP32 仿真，既慢又未利用硬件整型单元。",
  "invariant": "量化模型在验证集上的任务指标下降须小于阈值，且反量化后的张量数值范围与原 FP32 张量在 scale 定义的映射下一致。",
  "walkthrough": "ResNet50 INT8 部署：校准 128 张图得到每层 scale，权重 per-channel 量化。芯片 INT8 算力 512 TOPS vs FP16 256 TFLOPS，理论提速 2x。实测 ImageNet Top1 从 76.1% 降到 75.6%，满足 <1% 掉点；某检测模型因激活动态范围大，per-tensor 掉 3%，改 per-channel 后回到 0.6%。",
  "code": "def quantize_fp32_to_int8(tensor, scale, zero=0):\n    # 对称量化示意\n    q = np.round(tensor / scale) + zero\n    return np.clip(q, -128, 127).astype(np.int8)\n\ndef dequantize_int8_to_fp32(q, scale, zero=0):\n    return (q.astype(np.float32) - zero) * scale",
  "complexity": "量化/反量化为 O(张量元素) 的逐元素线性变换；芯片上计算本身因 INT8 而乘加更快，整体端到端时间约降为 FP16 的 1/2。",
  "beginnerSummary": "像把高清照片压成小图：用更少的信息(8 位)存和算，只要压缩比例合适，肉眼(任务指标)看不出差别却快很多。",
  "diagram": "FP32权重 --scale_w--> INT8\nFP32激活 --scale_a--> INT8\n   INT8 conv (Cube) -> INT32 累加 -> 反量化",
  "derivation": [
    "为什么需要：许多国产推理芯片只有整型单元，不量化就无法发挥其 TOPS 算力且更省带宽功耗。",
    "怎么实现：校准得 scale/zero-point，权重与激活转 INT8，芯片执行整型 MAC，结果 INT32 累加后反量化。",
    "有什么代价：量化引入截断与舍入误差，敏感层掉点；需校准集且可能需 QAT 补偿。",
    "怎么评测：验证集任务指标掉点是否达标，并用各层量化误差(余弦)监控。"
  ],
  "edgeCases": [
    "激活存在离群大值(outlier)会撑大 scale 使多数值量化到 0，需 clip 或 per-channel。",
    "zero-point 非对称量化要注意芯片是否支持。",
    "首尾层(如检测框回归)对量化敏感，常保留 FP16/FP32。"
  ],
  "pitfalls": [
    "用全部训练集做校准导致过拟合校准分布，真实分布偏移后掉点。",
    "忽略权重 per-channel 与激活 per-tensor 的搭配，误差放大。"
  ],
  "prerequisites": [
    "定点数与量化(scale/zero-point)原理",
    "对称与仿射量化差异",
    "校准集与 PTQ/QAT 概念"
  ],
  "workedExample": [
    "MobileNetV2 INT8 在国产卡部署，per-channel 权重量化后 Top1 仅降 0.4%。",
    "检测 head 回归分支保留 FP16，避免量化导致框偏移。"
  ],
  "lineByLine": [
    "tensor/scale 把浮点值缩放到整数格点，round 取整完成量化。",
    "clip 到 [-128,127] 防止溢出芯片 INT8 表示范围。",
    "反量化乘回 scale 还原量级，供后续层或输出使用。"
  ],
  "codeNotes": [
    "真实芯片在硬件内完成 MAC 与累加(INT32)，无需显式反量化到 CPU。"
  ],
  "followUps": [
    {
      "question": "PTQ 和 QAT 怎么选？",
      "answer": "先试 PTQ，成本低；当 PTQ 掉点超阈值且校准无法缓解时，对敏感层做 QAT 微调，让网络适应量化噪声。"
    },
    {
      "question": "per-channel 和 per-tensor 哪个好？",
      "answer": "per-channel 对权重各通道分布差异大时更准，硬件若支持则优先；per-tensor 实现简单但易受单通道 outliers 拖累。"
    }
  ],
  "followUpAnswers": [
    "先试 PTQ，成本低；当 PTQ 掉点超阈值且校准无法缓解时，对敏感层做 QAT 微调，让网络适应量化噪声。",
    "per-channel 对权重各通道分布差异大时更准，硬件若支持则优先；per-tensor 实现简单但易受单通道 outliers 拖累。"
  ],
  "kind": "concept"
};
