export default {
  "id": "ci-learner-tsx",
  "kind": "concept",
  "category": "因果推断",
  "title": "元学习器估计 CATE(T/S/X-learner)",
  "difficulty": "Hard",
  "prompt": "如何用 T-learner、S-learner 与 X-learner 估计条件平均处理效应 CATE？各自适用什么数据场景？",
  "quickAnswer": "T-learner 为处理组/对照组各训一个模型 μ1、μ0，CATE=μ1(x)-μ0(x)，适合组间差异大的异质效应；S-learner 把处理指示 T 当特征训单一模型，CATE=μ(x,1)-μ(x,0)，借共享结构降方差但易低估效应；X-learner 先用 T/S 思路估 CATE，再用倾向得分对两组估计做加权交叉，小处理组与效应稀疏时更准。选择看组大小与效应强度：组均衡且效应强用 T，稀疏用 X。",
  "code": "import numpy as np\nfrom sklearn.ensemble import GradientBoostingRegressor\n\ndef t_learner(X, T, Y):\n    m1 = GradientBoostingRegressor().fit(X[T == 1], Y[T == 1])\n    m0 = GradientBoostingRegressor().fit(X[T == 0], Y[T == 0])\n    return m1, m0\n\ndef s_learner(X, T, Y):\n    m = GradientBoostingRegressor().fit(np.c_[X, T], Y)\n    return m\n\ndef x_learner(X, T, Y, e, m1, m0):\n    tau_t = m1.predict(X) - m0.predict(X)\n    tau = np.where(T == 1, Y - m0.predict(X), m1.predict(X) - Y)\n    mx = GradientBoostingRegressor().fit(X, tau)\n    return e * tau_t + (1 - e) * mx.predict(X)",
  "complexity": "各 learner 拟合 1~2 个 GBRT，O(N·d·trees)；预测 O(trees)",
  "beginnerSummary": "想知道\"这药对哪类人特别有效\"。T 法给两类人各建一本账相减；S 法把\"是否吃药\"当备注记在一本账里；X 法聪明地把两本账按\"这人多可能被给药\"融合，小样本更稳。",
  "explanationFocus": "是什么：元学习器(meta-learner)用现成监督模型包装来估计条件平均处理效应 CATE=τ(x)=E[Y(1)-Y(0)|x]，主流有 T/S/X 三种：T 双模型、S 单模型带处理指示、X 倾向加权交叉。",
  "approach": "据样本量与效应结构选 learner：T 分别建模两组、S 共享建模、X 在伪结果上用倾向得分加权融合两组 CATE 估计。",
  "derivation": [
    "为什么需要：RCT 只给 ATE，个性化干预需 CATE，但处理与结果模型异质难直接建模。",
    "怎么实现：T 训 μ1,μ0 相减；S 训含 T 的单模型取差；X 用伪结果 τ 与倾向 e 加权组合。",
    "有什么代价：T 在小组方差大；S 易把效应 shrinkage 掉；X 依赖 e(x) 准确与伪结果可靠。",
    "怎么评测：用基准(cate suite)或实验数据比 MSE，看异质区校准与 Coverage。"
  ],
  "edgeCases": [
    "处理组极小，T-learner 的 μ1 欠拟合，CATE 在高维区崩。",
    "S-learner 把 T 当弱特征，强效应也被共享结构稀释成近 0。",
    "e(x) 极端时 X-learner 加权失衡，伪结果方差爆炸。"
  ],
  "pitfalls": [
    "忽略对 CATE 的校准验证，只在 ATE 上评估误导异质估计。",
    "X-learner 用同批数据估 e 与 τ 导致过拟合，应交叉拟合。"
  ],
  "prerequisites": [
    "潜在结果与 CATE 定义",
    "集成树模型(Gradient Boosting)"
  ],
  "workedExample": [
    "N=10000，处理组仅 500 人，真实 τ(x) 在中年组高。T-learner 在小组区 MSE 高；S-learner 把 τ 估成接近常数 0.1(真实 0.6)。",
    "X-learner 用 e(x) 加权后，在中年组 CATE 估到 0.55、老年组 0.12，MSE 比 T 低约 23%，因借对照组结构补了处理组稀疏。"
  ],
  "lineByLine": [
    "def t_learner：分别对 T=1/T=0 训模型，返回两模型即 CATE 的组件。",
    "def s_learner：把 T 拼进特征，对 (x,1) 与 (x,0) 预测相减。",
    "def x_learner：用伪结果 τ 与倾向 e 加权融合两组估计，缓解小组方差。"
  ],
  "followUps": [
    {
      "question": "什么时候别用 S-learner？",
      "answer": "当处理效应强且异质、而你用的模型有正则/共享结构(如单一树或带 L2 的模型)时，S-learner 会把 τ shrinkage 掉，这时优先 T 或 X-learner。"
    },
    {
      "question": "X-learner 的 e(x) 怎么来才稳？",
      "answer": "用交叉拟合(cross-fitting)在留出集上估倾向得分，避免用同批数据既估 e 又估 τ 造成过拟合；e 极端处应截断或改用 DR-learner。"
    }
  ],
  "order": 15,
  "followUpAnswers": [
    "当处理效应强且异质、而你用的模型有正则/共享结构(如单一树或带 L2 的模型)时，S-learner 会把 τ shrinkage 掉，这时优先 T 或 X-learner。",
    "用交叉拟合(cross-fitting)在留出集上估倾向得分，避免用同批数据既估 e 又估 τ 造成过拟合；e 极端处应截断或改用 DR-learner。"
  ]
};
