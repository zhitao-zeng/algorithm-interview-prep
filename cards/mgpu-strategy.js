export default {
  "kind": "concept",
  "id": "mgpu-strategy",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "并行策略选择",
  "prompt": "给定模型规模和硬件拓扑，应该怎么选择并行策略组合？",
  "quickAnswer": "先按可训/可推显存确定是否需要切模型(TP/PP/ZeRO)，再按拓扑布局：TP/EP 必须限制在单机 NVLink 域(高频通信)，PP 用于跨机扩层(低通信、有 bubble)，DP/ZeRO 跨机扩样本。典型 3D 并行 = TP(单机)×PP(跨机)×DP(数据)，MoE 再加 EP。目标是让通信密集维走高带宽、用 micro-batch 与重叠掩盖剩余通信。",
  "approach": "显存定切分→拓扑定布局→组合成 3D/4D 并行，平衡通信与 bubble。",
  "explanationFocus": "是什么：并行策略选择是按模型规模与硬件拓扑，把 TP/PP/DP/EP/ZeRO 组合成最优布局，使通信密集的维度走高带宽链路、用流水线/重叠掩盖空闲。",
  "bruteForce": "拍脑袋单一 DP → 大模型 OOM 或跨机 TP 通信爆炸。",
  "derivation": [
    "为什么需要：单一并行维度无法同时满足显存、算力与通信约束，必须组合且匹配拓扑。",
    "怎么实现：算显存缺口定 tp/pp/zero 度；单机内尽量用满 NVLink 做 TP×EP；跨机用 PP 切层、DP/ZeRO 扩样本；用 1F1B 与计算通信重叠压气泡。",
    "有什么代价：组合越多调参越难，通信组与调度复杂；需在 MFU、显存、延迟间折中。",
    "怎么评测：在目标硬件上扫并行度组合，选 MFU 最高且显存安全的方案。"
  ],
  "invariant": "正确组合下数值等价于单卡，只是资源分布与执行顺序不同。",
  "walkthrough": "175B、32 机×8 卡：tp=8(NVLink 域)、pp=4(跨机)、dp=8 → 32×8=256 卡，3D 并行训练。",
  "edgeCases": [
    "tp 度受隐藏维整除与 NVLink 域卡数限制。",
    "pp 过大气泡上升，需更多 micro-batch。",
    "MoE 需额外 EP 维与负载均衡。"
  ],
  "code": "# Python (概念)\ndef choose_parallel(model_gb, gpus, nvlink_domain):\n    tp = min(nvlink_domain, divisible(model.hidden, ...))  # 单机高带宽\n    pp = max(1, gpus // nvlink_domain)                     # 跨机切层\n    dp = gpus // (tp * pp)                                 # 剩余扩样本\n    return tp, pp, dp",
  "codeNotes": [
    "TP 限单机 NVLink 域。",
    "PP 跨机、DP 扩样本，凑成 3D。"
  ],
  "complexity": "并行度乘积 = 总卡数；MFU 取决于通信/ bubble 平衡。",
  "followUps": [
    {
      "question": "3D 并行指哪三维？",
      "answer": "通常指 TP(层内切权重)×PP(层间切段)×DP(数据复制)，MoE 场景再加 EP，构成 4D 并行。"
    },
    {
      "question": "小模型需要这么复杂吗？",
      "answer": "不需要；小模型单卡或纯 DP/ZeRO 即可，只有当显存或算力不够且跨多机时才上 TP/PP 组合。"
    }
  ],
  "followUpAnswers": [
    "TP×PP×DP 三维，MoE 加 EP。",
    "小模型纯 DP/ZeRO 即可。"
  ],
  "pitfalls": [
    "把 TP 跨机导致通信爆炸。",
    "忽视拓扑直接套经验并行度。"
  ],
  "beginnerSummary": "要把一个大工程分给一个办公室加几个分公司的团队：办公室内部传话快，就让需要频繁对答案的活(TP)在内部做；分公司之间传话慢，就安排只偶尔交半成品的活(PP)；再让各团队各做一批不同客户(DP)提总量。关键是根据\"谁离谁近、传话多快\"来排活。",
  "prerequisites": [
    "理解各并行维度特性。",
    "了解 NVLink/IB 带宽差异。",
    "掌握显存预算估算。"
  ],
  "workedExample": [
    "175B、256 卡：tp=8, pp=4, dp=8。",
    "TP 限单机、PP 跨机、DP 扩样本。"
  ],
  "lineByLine": [
    "按显存缺口定是否切模型。",
    "TP/EP 限单机 NVLink 域。",
    "PP 跨机切层、DP 扩样本。",
    "用 1F1B/重叠压气泡与通信。"
  ],
  "diagram": "总卡数 = TP × PP × DP (MoE:+EP)\n布局: [TP×EP 在 NVLink 单机] × [PP 跨机] × [DP 跨机]"
};
