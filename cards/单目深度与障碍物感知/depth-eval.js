export default {
  "id": "depth-eval",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "深度评测：F1/RMSE/相对误差",
  "prompt": "在仅 6 个近距正例、90 张本地图的障碍物评测中，为什么单纯用 RMSE 不够，应如何组合 F1、RMSE 与相对误差？",
  "quickAnswer": "RMSE 对全局距离敏感但掩盖近距漏检，近距正例极少时准确率无意义。应同时报告：近距 1 m 阈值的 F1（查召回/假阳）、整体 RMSE（度量精度）、相对误差（尺度鲁棒性），并以 F1 为主指标、RMSE 为辅。",
  "code": "import numpy as np\n\ndef eval_obstacle(pred_metric, gt_depth, gt_mask, thr=1.0):\n    pred_pos = pred_metric < thr                 # 近距预测为正\n    gt_pos = gt_mask.bool()\n    tp = int((pred_pos & gt_pos).sum())\n    fp = int((pred_pos & ~gt_pos).sum())\n    fn = int((~pred_pos & gt_pos).sum())\n    precision = tp / (tp + fp + 1e-9)\n    recall = tp / (tp + fn + 1e-9)\n    f1 = 2 * precision * recall / (precision + recall + 1e-9)\n    rmse = float(np.sqrt(((pred_metric - gt_depth) ** 2).mean()))\n    rel = float((np.abs(pred_metric - gt_depth) / (gt_depth + 1e-9)).mean())\n    return dict(f1=f1, rmse=rmse, rel=rel)",
  "complexity": "时间 O(H·W)，空间 O(H·W)",
  "beginnerSummary": "RMSE 像'平均偏差'，但少数近距障碍被海量远处像素淹没；F1 像'查没查到障碍'的体检，正例少时比准确率靠谱。三者搭配：F1 看安全、RMSE 看精度、相对误差看稳不稳。",
  "derivation": [
    "为什么需要：障碍物任务是安全相关二分类，仅看 RMSE 会忽略近距漏检，需匹配任务目标的指标。",
    "怎么实现：以 1 m 阈值把深度图二值化，与 GT 掩码算 TP/FP/FN 得 F1，并附带 RMSE 与相对误差。",
    "有什么代价：阈值选定敏感、正例稀少时 F1 方差大，需交叉验证与置信区间。",
    "怎么评测：用消融对照各模块对 F1/RMSE 的贡献，以 F1 为主选模型。"
  ],
  "edgeCases": [
    "近距正例仅 6 个，单个漏检使 F1 大幅波动。",
    "GT 掩码边界模糊，TP/FP 边界像素争议。",
    "全图无正例帧，recall 分母为 0 需特殊处理。"
  ],
  "pitfalls": [
    "只用 RMSE 选模型，上线后近距障碍仍漏检。",
    "正例稀少却用准确率，模型全预测负即得高分。",
    "阈值固定不随场景校准，跨域 F1 崩。"
  ],
  "prerequisites": [
    "精确率/召回率/F1 定义",
    "RMSE 与相对误差",
    "不平衡数据评估"
  ],
  "workedExample": [
    "90 图本地集：模型 A RMSE 0.9 但近距漏检，F1=0.6。",
    "模型 B RMSE 1.03 但近距全中，F1=0.91——选 B 更安全。"
  ],
  "lineByLine": [
    "pred_pos = pred_metric < thr 用 1 m 阈值产预测正例。",
    "tp/fp/fn 统计与 GT 掩码的交集、误检、漏检。",
    "precision/recall/f1 由混淆统计得出近距障碍质量。",
    "rmse/rel 补充全局度量精度与尺度鲁棒性。"
  ],
  "followUps": [
    {
      "question": "正例极少时如何给出可信的 F1？",
      "answer": "用 Bootstrap 重采样估计 F1 的置信区间，或做留一法，并同时报告 PR 曲线下面积以免单点阈值偏差。"
    },
    {
      "question": "RMSE 与相对误差哪个更适合跨域比较？",
      "answer": "相对误差对尺度偏移不敏感更适合跨域；RMSE 受绝对尺度影响，跨域前需统一校准或改用尺度不变指标。"
    }
  ],
  "followUpAnswers": [
    "用 Bootstrap 重采样估计 F1 的置信区间，或做留一法，并同时报告 PR 曲线下面积以免单点阈值偏差。",
    "相对误差对尺度偏移不敏感更适合跨域；RMSE 受绝对尺度影响，跨域前需统一校准或改用尺度不变指标。"
  ],
  "invariant": "统计 tp/fp/fn 时，pred_pos 与 gt_pos 始终基于同一 1 m 阈值与同一 GT 掩码，未参与像素不计入分母。",
  "walkthrough": "对 90 图本地集调用 eval_obstacle：因仅 6 近距正例，RMSE 仅从 1.10 微降到 1.03，但 F1 从 0.78 升到 0.91 才真实反映障碍召回改善。",
  "kind": "code"
};
