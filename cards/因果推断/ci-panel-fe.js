export default {
  "id": "ci-panel-fe",
  "kind": "concept",
  "category": "因果推断",
  "title": "面板固定效应(FE)与双向固定效应(TWFE)",
  "difficulty": "Medium",
  "prompt": "面板数据固定效应如何通过 within-transformation 消去不随时间变的未观测混杂？它与 DID 有何联系，双向固定效应又是什么？",
  "quickAnswer": "面板 FE 对每单位 i 引入固定截距 α_i 吸收所有不随时间变的未观测混杂(如企业文化、地理)。within-transformation 对每个变量减去其个体均值，把 α_i 消去后只比较同一单位随时间的变动，从而识别随时间变化的处理的因果效应。DID 是 FE 的特例：双向固定效应(TWFE)同时含个体 FE α_i 与时间 FE γ_t，既消不随时变混杂也消共同时间冲击，正是多期 DID 的标准设定。",
  "code": "import numpy as np\nimport pandas as pd\n\ndef within_transform(df, y, x, unit='id'):\n    mu = df.groupby(unit)[[y, x]].transform('mean')\n    dy = df[y] - mu[y]\n    dx = df[x] - mu[x]\n    return np.sum(dx * dy) / np.sum(dx * dx)\n\ndef twfe(df, y, treat, unit='id', time='t'):\n    return pd.get_dummies(df, columns=[unit, time])",
  "complexity": "within 变换 O(N·T)；含哑变量的 OLS O((N+T)·观测)，大 N 需吸收哑变量技巧",
  "beginnerSummary": "每个公司底子不同(不随时变)，硬比会乱。固定效应先把每家公司\"自己的平均线\"扣掉，只看每家公司内部随时间的涨跌——好比只比同一个人吃药前后来判断药效。",
  "explanationFocus": "是什么：面板固定效应(FE)为每个个体引入不随时变的截距 α_i，吸收所有恒定的未观测混杂；within-transformation 对变量减去个体均值以消去 α_i，仅用单位内随时间的变化识别处理效应。双向固定效应(TWFE)再加时间哑变量 γ_t。",
  "approach": "对个体做组内去心(within)消去 α_i 得 FE 估计；DID 即 TWFE 含 α_i+γ_t，同时消恒定混杂与共同时间趋势。",
  "derivation": [
    "为什么需要：面板含不随时间变的未观测混杂(α_i)，混进截距造成遗漏变量偏倚。",
    "怎么实现：设 Y_it=β·T_it+α_i+γ_t+ε，组内去心消去 α_i，或加时间哑变量消 γ_t。",
    "有什么代价：只能识别随时间变化的 T 的效应，恒定 T 被 α_i 吸收不可估；需严格外生假设。",
    "怎么评测：豪斯曼检验选 FE 还是 RE，看时间趋势、做平行趋势与稳健标准误。"
  ],
  "edgeCases": [
    "处理 T_it 几乎不随时间变(单位内变动极小)，within 估计退化、标准误爆炸。",
    "存在不随单位变但随时间变的混杂(如宏观冲击)，需 γ_t 才能消。",
    "短面板 N 小、T 大，α_i 维度高占自由度。"
  ],
  "pitfalls": [
    "把单位内固定效应误当处理了所有混杂，对随单位变的时变混杂无能为力。",
    "DID/TWFE 在存在异质处理效应与动态效应时，TWFE 系数可能被负权重污染(需别方法如 CS/事件研究)。"
  ],
  "prerequisites": [
    "面板数据(长/宽)结构与遗漏变量偏倚",
    "双重差分(DID)基础"
  ],
  "workedExample": [
    "10 家公司、5 年，Y 为公司利润、T 为是否上云。组内去心后公司 A 均值利润 100，某年 T=1 时利润 130(偏离+30)，T=0 年偏离-5，斜率估得 β≈上云边际 +25。",
    "加时间哑变量 γ_t 后，共同行业景气冲击被吸收，β 从 25 调为 22，说明原估计含 3 单位时间趋势混淆；TWFE 即标准多期 DID。"
  ],
  "lineByLine": [
    "def within_transform：groupby 个体求 y,x 的组内均值。",
    "dy,dx = 原值减组内均值：消去 α_i，仅留单位内变动。",
    "np.sum(dx*dy)/np.sum(dx*dx)：within 估计量 β 的闭式解。"
  ],
  "followUps": [
    {
      "question": "FE 和随机效应(RE)怎么选？",
      "answer": "若未观测 α_i 与处理 T 相关(典型因果场景)，FE 一致、RE 有偏，豪斯曼检验显著应选 FE；RE 仅在 α_i 与 T 无关且需估恒定 T 效应时才更优。"
    },
    {
      "question": "TWFE 在现代 DID 里有什么坑？",
      "answer": "当处理时点 staggered 且效应异质时，传统 TWFE 会因\"已处理单位被当控制\"产生负权重、估计偏。应改用 Callaway-Sant′Anna、Sun-Abraham 事件研究或堆叠估计。"
    }
  ],
  "order": 19,
  "followUpAnswers": [
    "若未观测 α_i 与处理 T 相关(典型因果场景)，FE 一致、RE 有偏，豪斯曼检验显著应选 FE；RE 仅在 α_i 与 T 无关且需估恒定 T 效应时才更优。",
    "当处理时点 staggered 且效应异质时，传统 TWFE 会因\"已处理单位被当控制\"产生负权重、估计偏。应改用 Callaway-Sant′Anna、Sun-Abraham 事件研究或堆叠估计。"
  ]
};
