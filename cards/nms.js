export default {
  "kind": "code",
  "id": "nms",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "NMS",
  "prompt": "按置信度抑制重叠检测框。",
  "quickAnswer": "按分数降序取最高框，删除与它 IoU 超阈值的剩余框，直到为空。",
  "approach": "按分数降序取最高框，删除与它 IoU 超阈值的剩余框，直到为空。",
  "explanationFocus": "NMS：按分数降序取最高框，删除与它 IoU 超阈值的剩余框，直到为空。",
  "bruteForce": "《NMS》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "检测器滑窗/锚框会产生大量冗余框，直接全保留会重复计数。",
    "贪心策略：每次取当前最高分框，删掉与它的高重叠框，循环至无剩余。",
    "阈值权衡：太高漏检（同一目标多框并存），太低误删（相邻不同目标）。"
  ],
  "invariant": "实现始终保持 NMS：按分数降序取最高框，删除与它 IoU 超阈值的剩余框，直到为空。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《NMS》，逐步核对形状和中间数值。",
  "edgeCases": [
    "空输入：返回空列表。",
    "所有框互不重叠：全部保留。",
    "阈值越界（<0 或 >1）：校验报错。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef nms(boxes,scores,threshold=0.5):\n    boxes,scores=np.asarray(boxes,float),np.asarray(scores,float)\n    if boxes.ndim!=2 or boxes.shape[1:]!=(4,) or scores.shape!=(len(boxes),): raise ValueError(\"boxes must be (N,4), scores (N,)\")\n    if not 0<=threshold<=1: raise ValueError(\"threshold must be in [0,1]\")\n    order=scores.argsort()[::-1]; keep=[]\n    while order.size:\n        i=int(order[0]); keep.append(i); rest=order[1:]; survivors=[]\n        for j in rest:\n            ax1,ay1,ax2,ay2=boxes[i]; bx1,by1,bx2,by2=boxes[int(j)]; iw=max(0,min(ax2,bx2)-max(ax1,bx1)); ih=max(0,min(ay2,by2)-max(ay1,by1)); inter=iw*ih; aa=max(0,ax2-ax1)*max(0,ay2-ay1); ab=max(0,bx2-bx1)*max(0,by2-by1); union=aa+ab-inter\n            if (inter/union if union else 0)<=threshold: survivors.append(int(j))\n        order=np.asarray(survivors,dtype=int)\n    return keep",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(N²)（两两 IoU，可用近似优化），空间 O(N)。",
  "followUps": [
    {
      "question": "Soft-NMS 有何不同？",
      "answer": "Soft-NMS 不直接删除重叠框，而是按 IoU 连续降低其分数，密集目标场景通常召回更好。"
    },
    {
      "question": "为什么先取最高分？",
      "answer": "NMS 的贪心假设最高分框最可信；保留它后删除冲突框能用简单 O(N²) 得到稳定结果。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "阈值不在 [0,1] 却不校验，得到无意义的抑制行为。",
    "不同类别的框未分开做 NMS，导致跨类误抑制。"
  ],
  "beginnerSummary": "非极大值抑制（NMS）用于目标检测后处理：同一目标常被多个重叠框预测，NMS 只保留「得分最高」的框，并抑制与它重叠过高（IoU 超过阈值）的其他框，从而每个目标只留一个检测框。",
  "prerequisites": [
    "每个预测框带一个置信度分数；先按分数降序排序。",
    "用 IoU 衡量两框重叠度；超过阈值（如 0.5）视为「重复检测」予以抑制。",
    "每类独立做 NMS（不同类不互相抑制）。"
  ],
  "workedExample": [
    "同一目标有两个框：得分 0.9 与 0.7，二者 IoU=0.8 > 阈值 0.5 → 保留 0.9，抑制 0.7。",
    "与另一个得分 0.6、IoU=0.1 的框不冲突，保留。"
  ],
  "lineByLine": [
    "校验 threshold∈[0,1]（threshold must be in [0,1]），否则报错。",
    "按分数降序排序框。",
    "取分数最高框加入结果，计算它与剩余框的 IoU，抑制 IoU>阈值的框。",
    "递归/循环处理剩余框，直至为空。"
  ],
  "diagram": "同一目标多个框(分数不同):\n□0.9   □0.7(与□0.9 重叠0.8 > 阈值)\n保留最高分 □0.9, 抑制 □0.7\n→ 每类只留最高分且不重叠的框"
};
