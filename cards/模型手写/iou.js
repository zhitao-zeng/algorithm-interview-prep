export default {
  "kind": "code",
  "id": "iou",
  "category": "模型手写",
  "difficulty": "Easy",
  "title": "IoU",
  "prompt": "计算两个 xyxy 框的 Intersection over Union。",
  "quickAnswer": "交集宽高取 max(0, min(right)-max(left))，再除并集。",
  "approach": "交集宽高取 max(0, min(right)-max(left))，再除并集。",
  "explanationFocus": "IoU：交集宽高取 max(0, min(right)-max(left))，再除并集。",
  "bruteForce": "《IoU》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "仅靠中心点距离不能反映框的贴合度，IoU 直接度量面积重合，更贴合任务目标。",
    "用 max(0, ...) 保证无重叠时交集为 0，避免出现负面积。",
    "作为损失（如 1-IoU）可端到端优化定位。"
  ],
  "invariant": "实现始终保持 IoU：交集宽高取 max(0, min(right)-max(left))，再除并集。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《IoU》，逐步核对形状和中间数值。",
  "edgeCases": [
    "两框完全不重叠：inter=0 → IoU=0。",
    "完全包含：IoU = 小框面积 / 大框面积。",
    "两框面积都为 0：并集为 0，需特殊处理避免除零。"
  ],
  "code": "# Python\ndef iou(box_a, box_b):\n    ax1, ay1, ax2, ay2 = box_a\n    bx1, by1, bx2, by2 = box_b\n    iw = max(0.0, min(ax2, bx2)-max(ax1, bx1))\n    ih = max(0.0, min(ay2, by2)-max(ay1, by1))\n    inter = iw*ih\n    area_a = max(0.0, ax2-ax1)*max(0.0, ay2-ay1)\n    area_b = max(0.0, bx2-bx1)*max(0.0, by2-by1)\n    union = area_a+area_b-inter\n    return inter/union if union else 0.0",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(1)（逐框常数运算），空间 O(1)。",
  "followUps": [
    {
      "question": "为什么不能把宽高写成 abs？",
      "answer": "交集要求边界有重叠；不重叠时应取 0，abs 会把没有交集的间隔误当成正宽。"
    },
    {
      "question": "IoU 阈值如何影响 NMS？",
      "answer": "阈值低会更激进地抑制相邻框，阈值高会保留更多重叠框；需按目标密集程度调节。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "忘记对交集宽高取 max(0,·)，无重叠时得到负面积、IoU 为负。",
    "坐标顺序不一致（如 x1>x2）未归一化，算出错误面积。"
  ],
  "beginnerSummary": "IoU（交并比）衡量两个 bounding box 的重合程度，是检测/定位任务的核心指标。IoU = 两框交集面积 / 两框并集面积，范围 [0,1]：完全不重叠为 0，完全重合为 1。常用于 NMS 阈值判断与目标检测精度评估。",
  "prerequisites": [
    "框由 (x1,y1,x2,y2) 表示（左上、右下坐标）。",
    "交集面积 = 重叠区域的宽 × 高，宽高需对 0 取 max（无重叠时为 0）。",
    "并集 = 两框面积之和 - 交集。"
  ],
  "workedExample": [
    "预测框 A 与真实框 B 重叠一部分：交集面积=20，A 面积=50、B 面积=40 → IoU=20/(50+40-20)=20/70≈0.286。",
    "完全重叠：交集=各自面积 → IoU=1。"
  ],
  "lineByLine": [
    "取两框的 x1=max(ax1,bx1)、y1=max(ay1,by1)、x2=min(ax2,bx2)、y2=min(ay2,by2)。",
    "交集宽 = max(0, x2-x1)，高 = max(0, y2-y1)，inter = 宽×高。",
    "union = areaA + areaB - inter。",
    "return inter / union（union 为 0 时按约定处理）。"
  ],
  "diagram": "预测框 A   真实框 B\n  ┌──┐\n  │  ├──┐\n  └──┤  │\n     └──┘\nIoU = |A∩B| / |A∪B|\n重叠越多 → IoU → 1"
};
