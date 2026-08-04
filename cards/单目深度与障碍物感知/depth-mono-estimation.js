export default {
  "id": "depth-mono-estimation",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "单目深度估计三大家族横评",
  "prompt": "简述 DAv2、Depth Anything 与 ZipDepth 在单目深度估计上的核心差异、各自擅长的场景，以及如何按业务做选型？",
  "quickAnswer": "DAv2 是带 metric head 的度量深度回归（输出带物理尺度，适合需要真实距离的场景）；Depth Anything 是大规模弱监督的相对深度（零样本泛化强、相对序好但绝对尺度需校准）；ZipDepth 用扩散先验做室内 metric 深度，在遮挡与弱纹理处更稳。选型：端上实时选轻量 DAv2/Depth Anything 蒸馏版，室内结构化场景用 ZipDepth，跨域零样本用 Depth Anything。",
  "code": "def compare_models(estimators, samples, metric=\"f1\"):\n    # estimators: {name: model}; samples: [{rgb, gt}]\n    report = {}\n    for name, est in estimators.items():\n        preds = [est.infer(s[\"rgb\"]) for s in samples]\n        report[name] = evaluate(preds, [s[\"gt\"] for s in samples])\n    # 按下游指标排序而非公开榜\n    return sorted(report.items(), key=lambda kv: kv[1][metric], reverse=True)",
  "complexity": "时间 O(k·n)，k 为模型数、n 为样本数，空间 O(k)",
  "beginnerSummary": "三模型像三种'估算距离'的方法：DAv2 直接给米数，Depth Anything 给'谁近谁远'的排名（需校准才有米数），ZipDepth 用'想象补全'在杂乱室内更稳。业务要米数就选带尺度的，要泛化就选相对深度的。",
  "derivation": [
    "为什么需要：单目相机无基线，深度本质病态，需用先验/数据驱动模型估计距离，选型直接决定下游障碍物判断与算力。",
    "怎么实现：按训练信号分——metric 回归（DAv2/ZipDepth 含尺度监督）、相对深度（Depth Anything 用离散排序/仿射不变损失）。",
    "有什么代价：metric 对域偏移敏感、需标定尺度；相对深度零样本强但绝对尺度需校准；扩散类 ZipDepth 推理更慢。",
    "怎么评测：用 RMSE、相对误差、δ<1.25 与下游障碍物 F1，以业务指标为准而非单看排行榜。"
  ],
  "edgeCases": [
    "纹理缺失的纯色墙面/天空，深度易塌缩到中位值。",
    "训练域外的极端光照、透明或镜面物体，误差骤增。",
    "近距离大物体超出模型感受野，边缘深度抖动严重。"
  ],
  "pitfalls": [
    "把相对深度当 metric 距离直接做 1 m 阈值判定会全盘出错。",
    "跨域直接迁移而不重标定尺度，RMSE 虚高。",
    "只看公开榜不看下游 F1，线上仍可能 F1=0。"
  ],
  "prerequisites": [
    "相机成像与透视几何基础",
    "相对深度与度量深度的区别",
    "Transformer/扩散模型基本概念"
  ],
  "workedExample": [
    "场景：室内机器人避障，输入单张 RGB。",
    "步骤：用 ZipDepth 出 metric 深度图，再用 1 m 阈值团状区域作为候选障碍，交并求 F1 评测。"
  ],
  "lineByLine": [
    "def compare_models(estimators, samples, metric=\"f1\"): 定义对多个模型做横向对比的入口。",
    "for name, est in estimators.items(): 逐个模型推理深度图并收集预测。",
    "report[name] = evaluate(...) 计算每个模型的 RMSE/F1 等指标并汇总。",
    "return sorted(..., key=lambda kv: kv[1][metric], reverse=True) 按下游 F1 降序给出选型。"
  ],
  "followUps": [
    {
      "question": "零样本泛化与 metric 精度为何难以兼得？",
      "answer": "metric 需要尺度监督，监督域与目标域分布不一致时尺度漂移；相对深度放弃绝对尺度换取泛化，二者存在权衡，可用稀疏 LiDAR 或已知物体尺寸做在线校准桥接。"
    },
    {
      "question": "ZipDepth 的扩散先验在端侧如何降本？",
      "answer": "用少步蒸馏/一致性采样把扩散降为几步，或仅对低分辨率深度残差去噪后再上采样，配合 TensorRT 量化部署到 Jetson。"
    }
  ],
  "followUpAnswers": [
    "metric 需要尺度监督，监督域与目标域分布不一致时尺度漂移；相对深度放弃绝对尺度换取泛化，二者存在权衡，可用稀疏 LiDAR 或已知物体尺寸做在线校准桥接。",
    "用少步蒸馏/一致性采样把扩散降为几步，或仅对低分辨率深度残差去噪后再上采样，配合 TensorRT 量化部署到 Jetson。"
  ],
  "invariant": "遍历每个估算器时，report 始终保存已评测模型的指标，且未被评测的模型不在 report 中。",
  "walkthrough": "输入 90 张本地图，依次用 DAv2/Depth Anything/ZipDepth 推理；ZipDepth 在 6 个近距正例与室内场景拿到 F1 0.91、RMSE 1.03，依下游 F1 排在首位。",
  "kind": "code"
};
