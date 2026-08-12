export default {
  "id": "ci-selection",
  "kind": "concept",
  "category": "因果推断",
  "title": "样本选择偏差与 Heckman 两阶段",
  "difficulty": "Hard",
  "prompt": "样本选择偏差如何导致估计偏？Heckman 两阶段模型如何用逆米尔斯比(IMR)校正？",
  "quickAnswer": "当样本进入观测(如被雇佣、回问卷)本身与结果相关且由未观测因素驱动时，仅用观测样本回归会系统性偏倚(如最低工资样本截断了低工资)。Heckman 两阶段：第一阶段对\"是否被观测\"Probit 得选择概率，算逆米尔斯比 λ=φ(·)/Φ(·)；第二阶段在结果方程中加入 λ 作为控制项，吸收选择机制带来的相关性，得到一致估计。需 excluded restriction(至少一个只影响选择不影响结果的变量)保证可识别。",
  "code": "import numpy as np\nfrom scipy.stats import norm\nfrom sklearn.linear_model import LogisticRegression\n\ndef inverse_mills(p):\n    return norm.pdf(norm.ppf(p)) / p\n\ndef heckman_two_stage(Z, X, observed, Y_obs):\n    sel = LogisticRegression().fit(Z, observed)\n    p = sel.predict_proba(Z)[:, 1]\n    imr = inverse_mills(p)\n    design = np.c_[X, imr]\n    model = LogisticRegression().fit(design[observed], Y_obs)\n    return model.coef_",
  "complexity": "两阶段各 O(N·d)；Probit 用 MLE 略贵；IMR 需数值求逆 Φ",
  "beginnerSummary": "只调查到\"愿意回问卷的人\"，而这群人往往工资更高，直接算平均会高估。Heckman 法先算\"你被看见的概率\"，用这个概率造一个修正项加进模型，把\"看不见的人\"的影响补回来。",
  "explanationFocus": "是什么：样本选择偏差指观测样本并非随机子集、且其进入观测的机制与结果相关，导致对全体的回归有偏；Heckman 两阶段用选择方程估逆米尔斯比(IMR)并在结果方程中控制它来校正该偏倚。",
  "approach": "第一阶段 Probit 估观测概率得 IMR λ；第二阶段在 Y~X+λ 中加入 λ 吸收选择相关性；需排除性约束保证 λ 可识别。",
  "derivation": [
    "为什么需要：观测样本由选择机制生成，误差与解释变量相关，OLS 有偏(如截断/自选择)。",
    "怎么实现：Probit 选观测、算 λ=φ/Φ，结果方程加 λ 控制选择。",
    "有什么代价：依赖排除性约束与 Probit 正态假设；λ 由估计带来两阶段标准误需校正。",
    "怎么评测：检验 λ 系数显著性、做排除变量的敏感性、对比全样本(若有)。"
  ],
  "edgeCases": [
    "无有效排除变量(选择方程与结果方程同解释变量)，模型不可识别、λ 共线。",
    "选择概率接近 0/1，IMR 数值不稳、λ 极端。",
    "选择机制近似随机时 λ≈0，强行加 λ 反而引入噪声。"
  ],
  "pitfalls": [
    "把显著 λ 当证明存在选择偏倚，可能只是函数形式误设。",
    "忽略两阶段标准误校正，直接对第二阶段 OLS 做推断导致置信区间偏窄。"
  ],
  "prerequisites": [
    "选择偏差与自选择",
    "Probit 模型与截断回归"
  ],
  "workedExample": [
    "女性工资研究：仅观测到就业者，Probit 得就业概率 p，IMR λ 在就业样本均值 0.4。",
    "结果方程 wage~education+λ，λ 系数显著为正 1.2，说明未校正的 OLS 低估了教育回报约 1.2；校正后教育回报由 0.8 调为 0.9，更接近全样本真实。"
  ],
  "lineByLine": [
    "def inverse_mills：计算逆米尔斯比 λ=φ(Φ⁻¹(p))/Φ(Φ⁻¹(p))。",
    "def heckman_two_stage：第一阶段 Logistic 近似 Probit 估观测概率 p。",
    "design=np.c_[X,imr]：第二阶段把 λ 作为控制项拟合，吸收选择偏倚。"
  ],
  "followUps": [
    {
      "question": "Heckman 和直接丢缺失/截断样本有何不同？",
      "answer": "直接只用观测样本是 Naive 删截回归，因选择相关而有偏；Heckman 显式建模选择机制并用 IMR 校正。若选择确随机则二者接近，但现实中少见。"
    },
    {
      "question": "排除性约束找不到怎么办？",
      "answer": "无排除变量时 Heckman 不可识别、λ 与 X 共线。可改用工具变量、断点/实验设计的外部变动，或敏感性分析量化选择强度，而非强行估 λ。"
    }
  ],
  "order": 20,
  "followUpAnswers": [
    "直接只用观测样本是 Naive 删截回归，因选择相关而有偏；Heckman 显式建模选择机制并用 IMR 校正。若选择确随机则二者接近，但现实中少见。",
    "无排除变量时 Heckman 不可识别、λ 与 X 共线。可改用工具变量、断点/实验设计的外部变动，或敏感性分析量化选择强度，而非强行估 λ。"
  ]
};
