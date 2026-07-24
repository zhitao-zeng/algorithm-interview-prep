export default {
  "kind": "concept",
  "id": "quant-int4-awq",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "INT4 与 AWQ 原理",
  "prompt": "AWQ(激活感知权重量化)的核心思想是什么，和 GPTQ 有何不同？",
  "quickAnswer": "AWQ 观察到只有约 1% 的\"显著权重\"(对应大激活通道)对精度影响最大，因此不直接量化全部权重，而是按激活幅度给每通道乘一个缩放系数(保持显著权重相对精度更高)，再统一 INT4 量化。它不依赖权重重建误差补偿，而是从激活分布出发保护重要通道。",
  "approach": "按激活幅度估计通道重要性，缩放后再量化。",
  "explanationFocus": "是什么：AWQ 是基于\"激活大小反映权重重要性\"的权重量化，用通道级缩放保护重要权重，主打 INT4 高效且 kernel 友好。",
  "bruteForce": "对所有通道统一 RTN INT4，忽略通道重要性。",
  "derivation": [
    "为什么需要：部分权重通道对应的大激活贡献主要输出，统一量化会无差别损伤它们。",
    "怎么实现：用校准激活的逐通道均方(L2)作重要性 s_c；求最优缩放 α 使重要通道\"等效被少量化\"，再按 group 量化权重。",
    "有什么代价：需校准激活统计；缩放系数带来轻微存储/计算开销，但数学可并入现有 group 量化。",
    "怎么评测：比较 AWQ INT4 与 GPTQ 的精度/速度，AWQ 往往 kernel 更易加速。"
  ],
  "invariant": "重要通道(大激活)等效比特更高，整体仍 INT4 存储。",
  "walkthrough": "7B 模型 AWQ INT4 在 MMLU 上常仅比 FP16 低 1 分内，且因结构规整比 GPTQ 更易写快 kernel。",
  "edgeCases": [
    "校准激活统计不稳，重要性估计偏。",
    "group 大小需与硬件匹配。",
    "与 SmoothQuant 思路互补而非互斥。"
  ],
  "code": "# Python (AWQ 通道缩放思路)\ndef awq_scale(weight, act_stats, alpha=0.5):\n    s = act_stats.pow(2).mean(0).sqrt()        # 通道激活 L2 重要性\n    s = s / s.max()\n    scale = (s.pow(alpha)).clamp(min=1e-4)      # 放大不重要? 实际保重要\n    w_scaled = weight * scale.unsqueeze(1)\n    return quantize_int4(w_scaled)              # 再统一 INT4",
  "codeNotes": [
    "AWQ 的 scale 可吸收进 group 量化, 不增加部署负担。",
    "核心是\"保护\"而非\"补偿\"显著权重。"
  ],
  "complexity": "O(校准样本·通道) 统计 + O(元素) 量化；无需海森求逆。",
  "followUps": [
    {
      "question": "AWQ 和 GPTQ 谁更快？",
      "answer": "结构上都落 INT4，但 AWQ 的缩放可并入标准 group 量化，kernel 更简单规整，实际常更易达高吞吐。"
    },
    {
      "question": "为什么用激活而非权重判断重要性？",
      "answer": "输出≈激活·权重，通道的大激活放大了对应权重的影响，故激活幅度是更好的\"重要性\"代理。"
    }
  ],
  "followUpAnswers": [
    "AWQ 从激活侧保护重要权重。",
    "AWQ 更易写高效 kernel。"
  ],
  "pitfalls": [
    "以为 AWQ 也做权重重建补偿(它不)。",
    "校准激活分布偏移导致重要性错配。"
  ],
  "beginnerSummary": "同样一份试卷，有些题(大激活对应的权重)分值高。AWQ 先看出哪几道题最值钱，给它们\"加保护\"(缩放)，再整体用 4 位速记——保证高分题少写错，比不分轻重地缩写更稳。",
  "prerequisites": [
    "输出由激活与权重相乘得到。",
    "不同通道重要性不同。",
    "INT4 group 量化基础。"
  ],
  "workedExample": [
    "通道激活 L2 大 → 该通道权重受保护。",
    "α 控制保护强度, 再统一 INT4。"
  ],
  "lineByLine": [
    "统计校准激活逐通道幅度。",
    "估计通道重要性。",
    "求最优缩放保重要通道。",
    "缩放后统一 INT4 量化。"
  ],
  "diagram": "激活大 ─▶ 权重重要 ─▶ 加缩放保护\n                       └─▶ 统一 INT4 量化"
};
