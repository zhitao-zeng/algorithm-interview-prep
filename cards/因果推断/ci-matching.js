export default {
  "id": "ci-matching",
  "kind": "concept",
  "category": "因果推断",
  "title": "倾向得分匹配与分层",
  "difficulty": "Medium",
  "prompt": "倾向得分匹配(最近邻+卡钳)与分层如何估计因果效应？它们各自的偏差-方差权衡是什么？",
  "quickAnswer": "匹配为每个处理组个体在对照组中找倾向得分相近者(最近邻)，卡钳限制最大距离以丢弃不匹配样本；分层把得分分桶后在桶内算差再加权。匹配偏差低但丢弃样本增大方差；分层保留全部样本但桶宽带来残余偏倚，二者都是偏差-方差的权衡。",
  "code": "import numpy as np\n\ndef nearest_neighbor_match(t, propensity, caliper=0.2):\n    treated = np.where(t == 1)[0]\n    control = np.where(t == 0)[0]\n    pairs = []\n    for i in treated:\n        d = np.abs(propensity[control] - propensity[i])\n        j = control[np.argmin(d)]\n        if d[np.argmin(d)] <= caliper:        # 卡钳内才配对\n            pairs.append((i, j))\n    return pairs\n\ndef stratification_ate(y, t, propensity, bins=5):\n    edges = np.quantile(propensity, np.linspace(0, 1, bins + 1))\n    strata = [y[t == 1][(propensity[t == 1] >= edges[k]) & (propensity[t == 1] < edges[k + 1])].mean()\n              - y[t == 0][(propensity[t == 0] >= edges[k]) & (propensity[t == 0] < edges[k + 1])].mean()\n              for k in range(bins)]\n    return np.nanmean(strata)",
  "complexity": "匹配 O(N_treat·N_ctrl)；分层 O(N)",
  "beginnerSummary": "给每个吃药的人配一个\"各方面差不多但没吃药\"的替身，两人之差就近似药的效应；卡钳像\"差太远就不勉强配对\"。",
  "explanationFocus": "是什么：倾向得分匹配用协变量浓缩成的单一得分，为处理组个体匹配得分相近的对照组个体，使两组协变量分布可比，从而估计条件/平均处理效应。",
  "approach": "拟合 e(x) 后按得分匹配或分层，使处理组与对照组在观测协变量上平衡，再比较结果得效应估计。",
  "derivation": [
    "为什么需要：观测数据中处理组与对照组协变量分布不同，需构造可比子集。",
    "怎么实现：用 e(x) 做最近邻配对(加卡钳)或分桶分层，层内/对内比较结果。",
    "有什么代价：匹配丢弃无配对样本、损失效率；分层桶宽则残余混杂。",
    "怎么评测：匹配后做协变量平衡检验、比较不同卡钳/桶数下的稳健性。"
  ],
  "edgeCases": [
    "共同支撑不足：某些得分区间只有一侧有样本，无法配对。",
    "卡钳过严：丢弃过多处理样本，效率下降、方差上升。",
    "一对多匹配(1:k)改变方差结构，需相应加权。"
  ],
  "pitfalls": [
    "匹配后不做平衡检验，误以为配对即平衡。",
    "只校正观测混杂，未观测混杂仍可能存在。"
  ],
  "prerequisites": [
    "倾向得分定义",
    "可忽略性与共同支撑"
  ],
  "workedExample": [
    "处理组 500 人、对照 5000 人，卡钳 0.2：匹配后保留 480 对，配对得分差均 <0.2。",
    "匹配前处理-对照差 0.30(含混杂)，匹配后约 0.18；分层 5 桶加权后约 0.19，结论一致。"
  ],
  "lineByLine": [
    "def nearest_neighbor_match：对每个处理个体在对照中找得分最近的样本。",
    "if d <= caliper：仅当最近距离不超过卡钳才配对，否则丢弃。",
    "def stratification_ate：按得分分位分桶，桶内算处理-对照差再取均值。"
  ],
  "followUps": [
    {
      "question": "匹配和 IPW 怎么选？",
      "answer": "匹配产出平衡的子集、直观易解释但损失样本；IPW 保留全样本、方差更大且依赖权重稳定。常见做法是先用匹配/分层做平衡诊断，再用 IPW 或 AIPW 做主估计。"
    },
    {
      "question": "卡钳(caliper)设太大或太小会怎样？",
      "answer": "太大则 poor matches 被接受、偏差上升；太小则很多处理样本无配对被丢弃、方差上升且可能引入选择偏倚。常用 0.2 倍得分标准差作起点并做敏感性检验。"
    }
  ],
  "followUpAnswers": [
    "匹配产出平衡的子集、直观易解释但损失样本；IPW 保留全样本、方差更大且依赖权重稳定。常见做法是先用匹配/分层做平衡诊断，再用 IPW 或 AIPW 做主估计。",
    "太大则 poor matches 被接受、偏差上升；太小则很多处理样本无配对被丢弃、方差上升且可能引入选择偏倚。常用 0.2 倍得分标准差作起点并做敏感性检验。"
  ],
  "order": 6
};
