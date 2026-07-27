export default {
  "id": "vis-object-detection",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "目标检测范式：R-CNN→YOLO→anchor-free、NMS、mAP",
  "difficulty": "Medium",
  "prompt": "请梳理目标检测从 R-CNN 到 YOLO 再到 anchor-free 的演进，并说明 NMS 与 mAP 的作用？",
  "quickAnswer": "目标检测在分类之外还需定位，R-CNN 系列用两阶段（region proposal+分类）保证精度，YOLO 用单阶段网格回归换速度。anchor-free 进一步去掉预设框，直接预测关键点或中心。NMS 用于去除重叠冗余框，mAP 综合不同置信阈值下的精确率/召回率衡量整体质量。",
  "code": "import torch\n\ndef nms(boxes, scores, iou_thr=0.5):\n    # boxes: [N,4], scores: [N]\n    order = scores.argsort(descending=True)\n    keep = []\n    while order.numel() > 0:\n        i = order[0]; keep.append(i)\n        if order.numel() == 1: break\n        ious = bbox_iou(boxes[i], boxes[order[1:]])\n        order = order[1:][ious < iou_thr]\n    return keep",
  "complexity": "O(N^2) per image (N=proposals)",
  "beginnerSummary": "目标检测让计算机在图片中不仅认出\"是什么\"，还要框出\"在哪里\"。从慢而准到快而准，再到不要预设框，是检测算法演进的主线。",
  "explanationFocus": "是什么：目标检测是同时完成\"分类\"与\"定位\"的视觉任务，输出一组带类别与置信度的边界框；R-CNN/YOLO/anchor-free 是其三代代表性范式。",
  "approach": "两阶段先生成候选框再分类（精度高、慢）；单阶段在网格上直接回归框与类别（快）；anchor-free 去掉手工预设框，预测中心点或角点，简化设计并提升泛化。",
  "derivation": [
    "为什么需要：仅有图像分类无法回答\"物体在哪\"，下游任务（自动驾驶、追踪）必须知道位置与数量。",
    "怎么实现：R-CNN 用 Selective Search+CNN 两阶段；YOLO 把图切成网格一次前向出框；anchor-free 用关键点/中心热力图替代预设 anchor。",
    "有什么代价：两阶段推理慢；单阶段早期定位粗；anchor 需人工调尺度比例且正负样本极不均衡；NMS 是后处理不可导。",
    "怎么评测：IoU 判定预测框对错，mAP 在 0.5~0.95 多阈值平均 AP，再对各类别取均值，是最核心指标。"
  ],
  "edgeCases": [
    "物体严重重叠或被遮挡时 NMS 会误删真实目标。",
    "小目标特征少、IoU 对微小偏移敏感，mAP 偏低。",
    "类别极度不均衡时 anchor-based 易偏向背景类。",
    "极端长宽比目标难以被方形 anchor 覆盖。"
  ],
  "pitfalls": [
    "把 NMS 阈值调太低会漏检，太高则重复框多，需按场景调。",
    "误以为 mAP@0.5 高就等于定位好，实际严格阈值下可能崩。"
  ],
  "prerequisites": [
    "卷积神经网络与特征图概念",
    "分类交叉熵与边界框回归损失"
  ],
  "workedExample": [
    "输入 800x600 图像，YOLO 输出 7x7 网格，每个格子预测 2 个框与 20 类概率。",
    "后处理按置信度排序，对同类框做 NMS，最终得到去重后的检测框集合。"
  ],
  "lineByLine": [
    "import torch：引入张量运算库，便于向量化 IoU 计算。",
    "def nms(...)：定义按分数降序贪心抑制的接口。",
    "order = scores.argsort(descending=True)：最高分框优先保留。",
    "while 循环：每次保留当前最高分框，并计算其与剩余框的 IoU。",
    "order = order[1:][ious < iou_thr]：仅保留 IoU 低于阈值的框，迭代直到为空。"
  ],
  "followUps": [
    {
      "question": "YOLO 的 grid 负责一个物体时，两个预测框的作用是什么？",
      "answer": "两个 anchor 预测用于缓解同一格内多物体或形状差异，训练时按 IoU 分配最优框，推理时各自独立后经 NMS 合并。"
    },
    {
      "question": "为什么 anchor-free 能减少超参？",
      "answer": "它不再需要手工设计 anchor 的尺度/比例数量，直接从关键点或中心回归，降低了与数据集强相关的调参负担。"
    }
  ],
  "followUpAnswers": [
    "两个 anchor 预测用于缓解同一格内多物体或形状差异，训练时按 IoU 分配最优框，推理时各自独立后经 NMS 合并。",
    "它不再需要手工设计 anchor 的尺度/比例数量，直接从关键点或中心回归，降低了与数据集强相关的调参负担。"
  ]
};
