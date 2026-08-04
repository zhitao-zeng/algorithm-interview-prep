export default {
  "id": "ml-uplift",
  "category": "因果推断与树模型",
  "difficulty": "Hard",
  "title": "Uplift 建模与转化率提升（+15%）",
  "prompt": "uplift 建模如何估计个体处理效应（ITE）并用 Qini 曲线衡量效果，从而把转化率提升 15%？",
  "quickAnswer": "Uplift 模型预测 P(Y=1|T=1)-P(Y=1|T=0) 的条件差，常用双模型、变形建模（transformed outcome）或因果树。Qini 曲线按 uplift 预测降序分组，横轴累计人群、纵轴两组累计转化差，曲线下面积（Qini 系数）量化增量价值；据此只对高 uplift 人群投放可使整体转化 +15%。",
  "code": "import numpy as np\n\ndef uplift_score(df, treat=\"treatment\", conv=\"converted\"):\n    tr = df.loc[df[treat] == 1, conv].mean()\n    ct = df.loc[df[treat] == 0, conv].mean()\n    return float(tr - ct)\n\ndef qini_curve(df, score=\"uplift_pred\", treat=\"treatment\", conv=\"converted\", n_bins=10):\n    df = df.sort_values(score, ascending=False).reset_index(drop=True)\n    df[\"bucket\"] = np.floor(np.arange(len(df)) / len(df) * n_bins).astype(int)\n    rows = []\n    n_t = (df[treat] == 1).sum()\n    n_c = (df[treat] == 0).sum()\n    for b in range(n_bins):\n        sub = df[df[\"bucket\"] <= b]\n        tr = sub.loc[sub[treat] == 1, conv].mean()\n        ct = sub.loc[sub[treat] == 0, conv].mean()\n        rows.append((b + 1) / n_bins, float(tr - ct))\n    return rows",
  "complexity": "时间 O(n log n)（排序）+ O(n)，空间 O(n)",
  "beginnerSummary": "普通模型预测“谁会买”，uplift 预测“谁的购买是被这波优惠‘逼’出来的”；只给最可能被优惠打动的人发券，转化提升更多且省钱。",
  "derivation": [
    "为什么需要：整体投放券会浪费在“不给也会买”的人身上，uplift 找出净增量最高人群才能把转化 +15% 且控成本。",
    "怎么实现：用双模型分别估 P(Y|T=1)、P(Y|T=0) 相减，或因果树按异质性分裂，变形建模把标签改成 (Y·(2T-1)) 直接回归 uplift。",
    "有什么代价：需同时有处理/对照数据，uplift 信号弱、方差大，需大样本与校准，错误定向反而损转化。",
    "怎么评测：用 Qini 曲线与 Qini 系数、AUUC 在保持集上比较随机投放基线与模型策略的增量。"
  ],
  "edgeCases": [
    "处理组与对照组样本量严重失衡时 Qini 估计方差大，须分层或加权。",
    "uplift 近 0 的人群定向无意义，应设阈值只投放正 uplift。",
    "存在“负 uplift”（优惠引发反感）人群，需识别并排除。",
    "标签延迟（转化滞后）时要做时间窗口对齐，否则训练标签失真。"
  ],
  "pitfalls": [
    "用普通转化率模型排序再投放，优化的是 propensity 而非 uplift，浪费预算。",
    "Qini 横轴用人数比例而非随机分配比例，会高估实际增益。",
    "把训练集 Qini 当最终效果，未做时间外样本验证导致过拟合。"
  ],
  "prerequisites": [
    "因果推断与 ATE（见 ml-causal）",
    "分类模型与概率校准",
    "ROC/AUC 评测基础"
  ],
  "workedExample": [
    "对 50 万用户随机发券（T=1）或不发（T=0），记录是否转化 Y。",
    "训练 uplift 模型输出每用户增量分，按降序取前 30% 人群定向发券。",
    "对比全量发券，转化提升 15% 且券成本下降，验证集 Qini 系数 0.12。"
  ],
  "lineByLine": [
    "import numpy：载入数值计算。",
    "uplift_score：算处理组与对照组整体转化差，即群体层面 uplift。",
    "sort_values(score, ascending=False)：按模型 uplift 预测从高到低排，准备累计评估。",
    "np.floor(.../len*n_bins)：把样本切为 n_bins 个等份桶用于累积曲线。",
    "循环每桶算累计 tr-ct，返回 (人群比例, 增量转化) 序列即 Qini 曲线点。"
  ],
  "followUps": [
    {
      "question": "双模型法与变形建模（Transformed Outcome）各有什么优劣？",
      "answer": "双模型直观但两端概率相减放大方差；变形建模把标签转为 Y·(2T-1)/p 直接回归 uplift，偏差更小但依赖倾向得分准确，实践中常两者对照。"
    },
    {
      "question": "上线后如何持续监测 uplift 模型是否失效？",
      "answer": "保留小流量随机对照做真值校准，定期重算 Qini 与 AUUC，监控高分段实际增量是否衰减，并做特征漂移与概念漂移检测后重训。"
    }
  ],
  "followUpAnswers": [
    "双模型直观但两端概率相减放大方差；变形建模把标签转为 Y·(2T-1)/p 直接回归 uplift，偏差更小但依赖倾向得分准确，实践中常两者对照。",
    "保留小流量随机对照做真值校准，定期重算 Qini 与 AUUC，监控高分段实际增量是否衰减，并做特征漂移与概念漂移检测后重训。"
  ],
  "explanationFocus": "是什么：Uplift 建模估计的是“干预带来的净增量”（个体处理效应 ITE = P(Y|T=1)-P(Y|T=0)），而非预测结果本身；目标是找到最容易被干预改变行为的人群，从而把营销预算只投向高增量用户。",
  "approach": "核心思路是用双模型/因果树/变形建模输出每个样本的条件 uplift，再按 Qini 或 AUUC 曲线在保持集上评估增量价值，只向高分段定向投放，实现转化 +15% 且控制成本。",
  "kind": "concept"
};
