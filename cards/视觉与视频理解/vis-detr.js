export default {
  "id": "vis-detr",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "DETR：Transformer 端到端检测与二分图匹配",
  "difficulty": "Hard",
  "prompt": "DETR 如何用 Transformer 与二分图匹配实现端到端检测并去掉 NMS？",
  "quickAnswer": "DETR 把检测看成集合预测问题：CNN 提特征后加位置编码送入 Transformer 编码器-解码器，解码器用一组可学习 object query 直接输出固定数量预测框。训练时用匈牙利算法做预测与真值的二分图最优匹配，一对一监督，因此重复框天然被抑制，无需 NMS。",
  "code": "import torch\nfrom scipy.optimize import linear_sum_assignment\n\ndef bipartite_match(cost):\n    # cost: [N_pred, N_gt] 匹配代价矩阵\n    row, col = linear_sum_assignment(cost.cpu().numpy())\n    return list(zip(row, col))",
  "complexity": "O(N^2) attention, N=token 数",
  "beginnerSummary": "传统检测要靠一堆候选框加 NMS 去重，DETR 借鉴翻译里的\"序列到序列\"思想，让模型一次性直接\"列出\"图里有哪些物体。",
  "explanationFocus": "是什么：DETR（DEtection TRansformer）是用 Transformer 做端到端集合预测的检测器，借助二分图匹配让每个真值唯一对应一个预测，从而省去 anchor 与 NMS。",
  "approach": "CNN 主干提取特征图并展平为 token 序列；Transformer 编码器做全局建模，解码器用 object query 与图像 token 交叉注意力产出固定数量预测；训练以匈牙利算法最小化匹配后的分类+框损失。",
  "derivation": [
    "为什么需要：两阶段/anchor 方法依赖大量手工设计（anchor、NMS），流程复杂且不可端到端优化。",
    "怎么实现：集合预测 + 二分图匹配（一对一）替代多对一标签分配，使重复预测受惩罚。",
    "有什么代价：Transformer 收敛慢、需长训练；小目标因下采样丢失细节而偏弱；固定 query 数限制最大检测数。",
    "怎么评测：沿用 COCO mAP；同时关注收敛步数与小目标 AP 是否落后 Faster R-CNN。"
  ],
  "edgeCases": [
    "图中物体数超过预设 object query 数量时会被截断。",
    "高度重叠物体容易共享 query 导致漏检。",
    "小目标在深层下采样后特征微弱，AP 明显偏低。"
  ],
  "pitfalls": [
    "误以为去掉 NMS 就完全无冗余，实际上匹配损失设计不当仍可能重复。",
    "直接用检测头套 Transformer 而忽略位置编码，会丢失空间先验导致不收敛。"
  ],
  "prerequisites": [
    "Transformer 自注意力与交叉注意力",
    "目标检测基本范式与 NMS"
  ],
  "workedExample": [
    "100 个 object query 经解码器输出 100 个 (class, box) 预测。",
    "匈牙利算法把 100 个预测与 5 个真值最优配对，其余预测被监督为背景类。"
  ],
  "lineByLine": [
    "import torch / from scipy...：引入张量与最优分配求解器。",
    "def bipartite_match(cost)：接收预测-真值代价矩阵。",
    "linear_sum_assignment：求解代价最小的二分匹配（匈牙利算法）。",
    "return list(zip(row, col))：返回 (pred_idx, gt_idx) 配对用于后续损失计算。"
  ],
  "followUps": [
    {
      "question": "DETR 收敛慢的根因是什么，有什么改进？",
      "answer": "根因是交叉注意力从零学空间对应很慢；Deformable DETR 用可变形注意力只看少量采样点，大幅加速收敛并提升小目标。"
    },
    {
      "question": "object query 到底学到了什么？",
      "answer": "它隐式编码了\"物体的典型位置/形状槽位\"，训练后每个 query 倾向于响应某一类空间-语义模式，但不应理解为显式 anchor。"
    }
  ],
  "followUpAnswers": [
    "根因是交叉注意力从零学空间对应很慢；Deformable DETR 用可变形注意力只看少量采样点，大幅加速收敛并提升小目标。",
    "它隐式编码了\"物体的典型位置/形状槽位\"，训练后每个 query 倾向于响应某一类空间-语义模式，但不应理解为显式 anchor。"
  ]
};
