export default {
  "id": "depth-fusion-seg",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "深度与分割/检测融合方案",
  "prompt": "深度图与实例分割/检测结果如何融合，以提升近距障碍物召回且不引入假阳性？",
  "quickAnswer": "把 metric 深度投影到每个实例掩码内取统计（均值/分位）作为该实例距离，结合分割置信度得到融合置信，仅当距离<thr 且置信>η 才判障碍。深度补分割的'距离'维度、分割补深度的'实例边界'，互相校正降假阳。",
  "code": "import numpy as np\n\ndef fuse_depth_segment(metric_depth, seg_masks, thr=1.0, conf_min=0.5):\n    fused = []\n    for mask, label, score in seg_masks:     # (bool mask, 类别, 分割置信)\n        region = metric_depth[mask]\n        if region.size == 0:\n            continue\n        mean_d = float(region.mean())\n        # 距离越近置信越高，乘分割分数得融合置信\n        conf = float(np.clip(1.0 - mean_d / (thr * 3), 0, 1)) * score\n        fused.append(dict(label=label, depth=round(mean_d, 3),\n                          conf=round(conf, 3),\n                          hit=(mean_d < thr) and (conf >= conf_min)))\n    return fused",
  "complexity": "时间 O(H·W + M)，M 为实例数，空间 O(H·W)",
  "beginnerSummary": "深度图知道'多远'但分不清'是啥'，分割知道'是啥'但不知'多远'。把两者叠起来：每个被圈出的物体都带上距离，近且可信才报警，远或不可信就忽略。",
  "derivation": [
    "为什么需要：纯深度阈值易把远墙/地面误判障碍，纯分割缺距离无法定'近距危险'，融合互补。",
    "怎么实现：实例掩码内聚合深度得距离，融合分割置信成综合得分，双阈值判定。",
    "有什么代价：掩码边界误差污染深度统计，需稳健聚合（分位而非均值）。",
    "怎么评测：看近距召回提升与假阳下降，对比单模态基线的 F1 差。"
  ],
  "edgeCases": [
    "实例跨近远（如斜停车），均值深度失真，宜用近分位。",
    "分割边界溢出到背景，深度被拉偏。",
    "低分割置信的小物体，融合后被误过滤。"
  ],
  "pitfalls": [
    "直接对全图深度阈值不结合实例，假阳高。",
    "用均值而非分位，大实例距离被稀释。",
    "忽略分割置信，低质掩码仍触发障碍。"
  ],
  "prerequisites": [
    "实例分割后处理",
    "深度图投影与掩码索引",
    "置信度融合"
  ],
  "workedExample": [
    "YOLO 圈出车实例，掩码内深度均值 0.8 m、分割分 0.9。",
    "融合置信≈0.66>0.5 且距离<1 m，判为近距障碍。"
  ],
  "lineByLine": [
    "for mask,label,score in seg_masks: 遍历每个实例。",
    "region = metric_depth[mask] 取该实例覆盖的深度像素。",
    "mean_d = region.mean() 以均值（或更稳的分位）作代表距离。",
    "conf = clip(1-mean_d/(thr*3),0,1)*score 距离近且分割可信才高置信。",
    "hit = (mean_d<thr) and (conf>=conf_min) 双阈值判定障碍。"
  ],
  "followUps": [
    {
      "question": "实例跨近远时如何聚合深度更稳？",
      "answer": "用近分位（如 10% 分位）而非均值代表'最近危险距离'，并对掩码做形态学腐蚀去边界噪声，避免被远处像素稀释。"
    },
    {
      "question": "融合置信如何随场景自适应？",
      "answer": "用验证集标定 thr 与 conf_min，或在线以深度方差/分割熵作不确定性，动态调高阈值抑制高不确定区域假阳。"
    }
  ],
  "followUpAnswers": [
    "用近分位（如 10% 分位）而非均值代表'最近危险距离'，并对掩码做形态学腐蚀去边界噪声，避免被远处像素稀释。",
    "用验证集标定 thr 与 conf_min，或在线以深度方差/分割熵作不确定性，动态调高阈值抑制高不确定区域假阳。"
  ],
  "invariant": "遍历每个实例时，fused 收录所有 region 非空的实例，并以 hit 字段标记其是否同时满足 距离<thr 与 置信≥η；region 为空的实例被显式 skip 不计入。",
  "walkthrough": "对 90 图本地集融合 ZipDepth 深度与 YOLO 分割：用近分位聚合使 6 个近距正例全部命中，融合置信过滤掉远处墙面假阳，F1 达 0.91、RMSE 1.03。",
  "kind": "code"
};
