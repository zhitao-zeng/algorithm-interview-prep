export default {
  "id": "depth-obstacle",
  "category": "单目深度与障碍物感知",
  "difficulty": "Hard",
  "title": "障碍物感知：F1=0 的拆解与分路",
  "prompt": "你的深度模型在障碍物任务上 F1=0，应如何拆解根因？给出 indoor ZipDepth + vehicle YOLO 的深度/分割分路方案？",
  "quickAnswer": "F1=0 不能直接归咎深度网络，要拆成四问：相对排序对不对、1 m 阈值是否合理、尺度校准做了没、实例分割是否漏检。分路方案：室内用 ZipDepth 出 metric 深度，车辆用 YOLO 出 depth/segmentation 两路，深度作尺度校准证据、分割作实例边界，二者交并得障碍。",
  "code": "import numpy as np\n\ndef obstacle_pipeline(rgb, depth_model, yolo, depth_thr=1.0):\n    rel = depth_model.infer(rgb)                     # 相对/度量深度\n    sparse = yolo.size_priors(rgb)                   # 车辆尺寸->稀疏度量点\n    a, b = calibrate_scale(rel, sparse)              # 在线仿射校准\n    metric = a * rel + b\n    masks = yolo.segment(rgb)                        # 实例分割\n    obstacles = []\n    for m in masks:\n        d = float(metric[m.bool()].mean())           # 实例内平均深度\n        if d < depth_thr:                            # 1 m 阈值判定\n            obstacles.append((m.label, round(d, 3)))\n    return obstacles",
  "complexity": "时间 O(H·W + M)，M 为实例数，空间 O(H·W)",
  "beginnerSummary": "F1=0 像考试不及格，不能怪'脑子不行'，要查是排序错、分数线定错、单位没换还是根本没圈出目标。分两路：深度负责'量距离'，YOLO 负责'圈目标'，合起来才判定障碍。",
  "derivation": [
    "为什么需要：深度模型 F1=0 往往是多因素叠加，盲目调参无效，需结构化拆解定位真因。",
    "怎么实现：四问法（排序/阈值/尺度/分割）+ 分路：ZipDepth 出 metric 深度，YOLO 出分割与尺寸先验双路。",
    "有什么代价：双路增加推理与后处理，阈值与校准不当会引入假阳性/假阴性。",
    "怎么评测：逐项消融——只排序、加阈值、加校准、加分割，看 F1 递增定位瓶颈。"
  ],
  "edgeCases": [
    "仅 6 个近距正例，正样本极少导致阈值敏感、F1 抖动大。",
    "车辆部分出框，YOLO 尺寸先验失效、校准偏。",
    "重叠/遮挡实例，分割边界错导致平均深度失真。"
  ],
  "pitfalls": [
    "深度网络输出的是相对深度却直接套 1 m 阈值。",
    "把 F1=0 全怪深度模型，忽略 YOLO 漏检。",
    "用全局尺度而非按帧在线校准，跨场景漂移。"
  ],
  "prerequisites": [
    "单目深度估计基础",
    "目标检测与实例分割",
    "尺度校准(见 Card2)"
  ],
  "workedExample": [
    "现象：端到端 F1=0，但目视深度图近大远小正确。",
    "拆解：相对序 OK→阈值用错(相对深度)→加在线校准→再加 YOLO 分割，F1 升至 0.91。"
  ],
  "lineByLine": [
    "rel = depth_model.infer(rgb) 得到相对或度量深度图。",
    "sparse = yolo.size_priors(rgb) 由车辆尺寸反推稀疏度量点。",
    "a,b = calibrate_scale(rel, sparse) 在线仿射校准消除尺度模糊。",
    "for m in masks: d = metric[m.bool()].mean() 取实例内平均深度作代表。",
    "if d < depth_thr: 用 1 m 阈值判定为障碍并收集。"
  ],
  "followUps": [
    {
      "question": "近距正例只有 6 个，如何避免过拟合与评估不稳？",
      "answer": "用 F1 而非准确率（正例稀少时准确率无意义），做留一/交叉验证，并报告置信区间；正例难增时用难例挖掘与合成近距样本扩充。"
    },
    {
      "question": "ZipDepth 与 YOLO 两路如何保证时间同步？",
      "answer": "两路共享同一帧输入，YOLO 轻量先行出候选与尺寸先验，ZipDepth 只对该帧推理，后处理融合，整体控制在实时预算内。"
    }
  ],
  "followUpAnswers": [
    "用 F1 而非准确率（正例稀少时准确率无意义），做留一/交叉验证，并报告置信区间；正例难增时用难例挖掘与合成近距样本扩充。",
    "两路共享同一帧输入，YOLO 轻量先行出候选与尺寸先验，ZipDepth 只对该帧推理，后处理融合，整体控制在实时预算内。"
  ],
  "invariant": "遍历每个实例掩码时，obstacles 列表只收录平均深度小于阈值的实例，且每个被收录实例都带有有效标签与深度。",
  "walkthrough": "对 90 图本地集跑四问消融：仅相对序 F1≈0.3，加 1 m 阈值≈0.5，加在线校准≈0.78，加 YOLO 分割≈0.91，最终 RMSE 1.03、8.38 FPS，仅 6 近距正例。",
  "kind": "code"
};
