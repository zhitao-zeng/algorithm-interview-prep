export default {
  "id": "ml-causal",
  "category": "因果推断与树模型",
  "difficulty": "Medium",
  "title": "因果推断基础：干预、反事实与相关性的区别",
  "prompt": "为什么相关性不等于因果，因果推断中的干预（intervention）与反事实（counterfactual）分别指什么，如何估计平均处理效应 ATE？",
  "quickAnswer": "相关只描述 P(Y|X) 的联合统计，因果关心 do(X) 带来的分布改变；干预 do(X=x) 是主动设定处理并切断其原有父节点，反事实是在已观测结果下设想“若当时选了另一处理”的结果。ATE 在可忽略性成立时可用 E[Y|T=1]-E[Y|T=0] 或倾向得分加权估计。",
  "code": "import numpy as np\nimport pandas as pd\n\ndef naive_ate(df, treat=\"treatment\", out=\"outcome\"):\n    treated = df.loc[df[treat] == 1, out].mean()\n    control = df.loc[df[treat] == 0, out].mean()\n    return float(treated - control)\n\ndef ips_ate(df, ps, treat=\"treatment\", out=\"outcome\"):\n    t = df[treat].values.astype(float)\n    y = df[out].values.astype(float)\n    ps_c = np.clip(ps, 1e-3, 1 - 1e-3)               # 裁剪极端权重、防除零\n    w = np.where(t == 1, 1.0 / ps_c, 1.0 / (1.0 - ps_c))\n    # 自归一化 IPW (Hájek): 处理组与对照组分别加权后再相减\n    ate_t = (w * t * y).sum() / (w * t).sum()\n    ate_c = (w * (1 - t) * y).sum() / (w * (1 - t)).sum()\n    return float(ate_t - ate_c)",
  "complexity": "时间 O(n)，空间 O(n)（n 为样本数）",
  "beginnerSummary": "冰淇淋销量和溺水人数都随天气升高而上升，但吃冰淇淋不会让人溺水——这是相关非因果。干预像是主动给病人吃药并切掉其他干扰，反事实是设想“若当初没吃这药会怎样”。",
  "derivation": [
    "为什么需要：仅靠观测相关会受混杂变量（如天气）影响，导致错误地归因，业务决策需知道“做了 X 会带来什么改变”。",
    "怎么实现：用 do-演算定义干预 P(Y|do(X=x))，反事实借助结构方程与已观测噪声重建；ATE 在可忽略性下用组间差或逆概率加权估计。",
    "有什么代价：因果识别依赖不可验证的假设（可忽略性、重叠），需敏感性分析与协变量平衡检验，否则估计有偏。",
    "怎么评测：用协变量平衡（SMD<0.1）、重叠图、安慰剂检验与 RCT 子样本验证外推有效性。"
  ],
  "edgeCases": [
    "倾向得分接近 0 或 1 时逆概率加权出现极端权重，须截断或改用 DR。",
    "未观测混杂（U）存在时 ATE 不可识别，需要工具变量或断点设计。",
    "处理非二值（多剂量）时需改用剂量-响应曲线 g-computation。",
    "样本量小导致组间协变量不平衡，ATE 方差很大需 bootstrap。"
  ],
  "pitfalls": [
    "把观测到的条件差 (Y|T=1)-(Y|T=0) 直接当因果，忽略选择偏差。",
    "过度依赖 p 值判断因果，忽略可识别性假设是否成立。",
    "反事实与干预混淆：干预是群体层面的 do，反事实是个体层面的假设。"
  ],
  "prerequisites": [
    "条件概率与贝叶斯公式",
    "混杂（confounding）与有向无环图 DAG",
    "期望、方差与无偏估计基本概念"
  ],
  "workedExample": [
    "发优惠券（T=1/0）给两组用户，观测购买额 Y，但活跃老用户更可能被发券形成混杂。",
    "朴素差 naive_ate 给出 12 元，但老用户本就多买，存在上偏。",
    "用倾向得分做 ips_ate 后估计降到 5 元，更接近真实因果效应。"
  ],
  "lineByLine": [
    "import numpy/pandas：载入数值与表格处理库。",
    "naive_ate：直接计算处理组与控制组结果均值差，未校正混杂。",
    "treated/control 用 df.loc 按处理列筛选并求均值。",
    "ips_ate：构造逆概率权重 w（处理组 1/ps、控制组 1/(1-ps)），并按 1e-3~1-1e-3 裁剪防止极端权重与除零。",
    "ate_t / ate_c 分别对处理组、对照组做自归一化加权（Hájek），二者相减得到无偏 ATE 点估计。"
  ],
  "followUps": [
    {
      "question": "可忽略性（ignorability）假设在实践里怎么检验？",
      "answer": "它本质上不可直接验证，只能检验已观测协变量在两组间平衡（SMD、重叠权重后分布），并用敏感性分析（如 E-value）量化未观测混杂需多大才推翻结论。"
    },
    {
      "question": "双鲁棒（Doubly Robust）估计为什么更稳？",
      "answer": "DR 同时建模倾向得分与结果回归，只要其中之一正确即可得到无偏 ATE，因此相比纯 IPS 或纯回归更抗模型误设。"
    }
  ],
  "followUpAnswers": [
    "它本质上不可直接验证，只能检验已观测协变量在两组间平衡（SMD、重叠权重后分布），并用敏感性分析（如 E-value）量化未观测混杂需多大才推翻结论。",
    "DR 同时建模倾向得分与结果回归，只要其中之一正确即可得到无偏 ATE，因此相比纯 IPS 或纯回归更抗模型误设。"
  ],
  "explanationFocus": "是什么：因果推断研究“若主动改变某变量（干预）会带来什么结果”，而非仅观测变量如何共同变化；它用 do-算子与反事实框架把相关提升到因果层面，关键在于处理变量是被外部设定而非被其他变量决定。",
  "approach": "核心思路是区分观测分布 P(Y|X) 与干预分布 P(Y|do(X))：通过 DAG 识别可忽略性后，用组间差、逆概率加权或 g-computation 估计 ATE，并以协变量平衡与敏感性分析保证可识别性。",
  "kind": "concept"
};
