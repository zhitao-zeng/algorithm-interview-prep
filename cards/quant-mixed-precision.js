export default {
  "kind": "concept",
  "id": "quant-mixed-precision",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "混合精度量化",
  "prompt": "混合精度量化是什么，怎么决定哪些层留高精度？",
  "quickAnswer": "混合精度对不同层/模块用不同比特(如敏感层 FP16、其余 INT4/INT8)，在显存与精度间精细权衡。判断敏感度常用\"量化前后输差异\"或\"对下游精度边际贡献\"做搜索(如 Hessian 迹、逐层回放评估)，把预算留给最敏感的少数层。",
  "approach": "先全量量化，再逐层回升精度看收益，保留高收益层。",
  "explanationFocus": "是什么：混合精度按敏感度给不同层分配不同比特，敏感层留高精度、耐量化层压低位。",
  "bruteForce": "全部 INT4，敏感层崩了再全回 INT8，浪费显存。",
  "derivation": [
    "为什么需要：不同层对量化误差敏感度差异大，统一低位会无谓牺牲关键层、又没省到该省的。",
    "怎么实现：用敏感指标(逐层量化误差、Hessian 对角)排序，按显存预算从低位起逐步把最敏感层升精度。",
    "有什么代价：需离线的逐层评估与搜索，部署时要支持多种精度 kernel/调度。",
    "怎么评测：在固定显存预算下比较混合方案与均匀方案的精度，看拐点。"
  ],
  "invariant": "少数敏感层占精度损失大头，保护它们收益最大。",
  "walkthrough": "70B 模型把约 10% 最敏感层留 INT8、其余 INT4，比全 INT4 精度升 2 分且显存仅多 5%。",
  "edgeCases": [
    "敏感层跨模块分布不均。",
    "lm_head/embedding 常留高精度。",
    "多精度调度增加 kernel 复杂度。"
  ],
  "code": "# Python (敏感度=量化前后输出差异)\ndef layer_sensitivity(layer, x, bits=4):\n    y_fp = layer(x)\n    y_q  = layer(quantize_weights(layer.weight, bits))(x)\n    return (y_fp - y_q).pow(2).mean().item()     # 越大越敏感→留高精度",
  "codeNotes": [
    "常用余弦相似度或 MSE 作敏感指标。",
    "预算分配可用贪心/整数规划。"
  ],
  "complexity": "逐层评估 O(层数·样本·前向)；搜索 O(层数)。",
  "followUps": [
    {
      "question": "哪些层通常要留高精度？",
      "answer": "embedding、lm_head 及少数对输出影响大的中间层常留 FP16/INT8。"
    },
    {
      "question": "怎么自动化选层？",
      "answer": "逐层量化回放测敏感指标，按显存预算贪心地把最敏感层升精度。"
    }
  ],
  "followUpAnswers": [
    "敏感层常是 head/embed。",
    "贪心回升精度最实用。"
  ],
  "pitfalls": [
    "凭直觉选层而非数据驱动。",
    "混合精度增加部署复杂度被低估。"
  ],
  "beginnerSummary": "全班合影，脸小的人(耐量化层)用缩略图就行，主角(敏感层)得给高清。混合精度就是\"谁重要谁高清\"，把钱花在刀刃上。",
  "prerequisites": [
    "层间量化敏感度不同。",
    "有显存预算约束。",
    "能逐层回放评估。"
  ],
  "workedExample": [
    "全 INT4: 精度掉 4 分。",
    "10% 层回 INT8: 只掉 1 分。"
  ],
  "lineByLine": [
    "逐层量化并测输出差异。",
    "按敏感度排序。",
    "按预算回升最敏感层精度。",
    "混合部署。"
  ],
  "diagram": "层敏感度: 高●●● 低○○○○○○\n精度:      FP16 INT4 INT4 INT4 ..."
};
