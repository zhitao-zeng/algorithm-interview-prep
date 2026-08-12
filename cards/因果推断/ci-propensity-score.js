export default {
  "id": "ci-propensity-score",
  "kind": "concept",
  "category": "因果推断",
  "title": "倾向得分(Propensity Score)：定义、估计与 overlap 诊断",
  "difficulty": "Medium",
  "prompt": "倾向得分 e(x)=P(T=1|x) 如何用来做因果调整？估计时为何要关注 positivity/overlap 假设，又如何诊断与处理重叠不足？",
  "quickAnswer": "倾向得分为给定协变量 x 下接受处理的概率 e(x)=P(T=1|x)，它是协变量的一维平衡分数，给定 e(x) 即平衡所有观测混杂(Rosenbaum-Rubin 定理)。估计可用逻辑回归或更灵活的机器学习模型，但需避免过拟合导致 e(x) 极端。positivity 要求每个 x 都有 0<e(x)<1 的非零被处理机会，重叠不足会让加权/匹配失效，可用重叠图诊断并对重叠区外个体做 trimming。",
  "code": "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\ndef fit_propensity(X, T):\n    model = LogisticRegression(max_iter=1000)\n    model.fit(X, T)\n    return model.predict_proba(X)[:, 1]\n\ndef overlap_diagnose(e, lo=0.1, hi=0.9):\n    return (e < lo) | (e > hi)",
  "complexity": "估计 O(N·d·iter)；平衡得分把维度从 d 压缩到 1",
  "beginnerSummary": "人群千差万别，倾向得分把\"这个人有多可能被分到处理组\"压成一个 0~1 的概率，用它把处理组和对照组拉到同一类人上再比结果。",
  "explanationFocus": "是什么：倾向得分 e(x)=P(T=1|x) 是在给定协变量 x 时个体接受处理的条件概率，它是一维平衡分数——所有观测混杂经 e(x) 平衡后处理组与对照组可比。",
  "approach": "先估 e(x)(逻辑回归或机器学习)，再用它做加权(IPW)、匹配或分层以平衡混杂；同时诊断 overlap 并对重叠不足区域 trimming。",
  "derivation": [
    "为什么需要：多维协变量直接匹配遇维度灾难，需把可比性压缩到一维。",
    "怎么实现：用分类模型在观测数据上拟合 P(T=1|x) 得 e(x)，再据 e(x) 加权/匹配/分层。",
    "有什么代价：e(x) 估计误差直接传到效应估计；机器学习估得准但易给极端值，破坏 positivity。",
    "怎么评测：看加权/匹配后各协变量标准化均值差(SMD<0.1)是否平衡，并检查 overlap 覆盖。"
  ],
  "edgeCases": [
    "某 x 区域 e(x)≈0 或 1，positivity 被破坏，该子群效应无法识别。",
    "用强模型估 e(x) 出现过拟合，少数样本 e(x) 极端，加权方差爆炸。",
    "协变量含与处理近乎确定的关系(如政策强制)，e(x) 边界化。"
  ],
  "pitfalls": [
    "只平衡了 e(x) 一维，若正确模型需高阶交互，简单逻辑回归仍留残余混杂。",
    "为稳住方差过度 trimming，丢弃大量样本并改变目标人群，需报告估计的是重叠人群效应。"
  ],
  "prerequisites": [
    "潜在结果与可忽略性假设",
    "逆概率加权(IPW)基础"
  ],
  "workedExample": [
    "1000 人，逻辑回归得 e(x)：处理组均值 0.62、对照组 0.38；按 e(x) 五分位分层后各层协变量 SMD 均<0.1。",
    "重叠诊断发现 40 人 e(x)>0.95(几乎必处理)，trimming 到 [0.05,0.95] 后保留 960 人，IPW 加权 ATE 由 0.31 变为 0.24，方差更稳。"
  ],
  "lineByLine": [
    "def fit_propensity：用 LogisticRegression 在 (X,T) 上拟合处理概率。",
    "model.predict_proba(X)[:,1]：取正类概率即 e(x)。",
    "def overlap_diagnose：标记落在 [lo,hi] 之外的样本，定位重叠不足个体。"
  ],
  "followUps": [
    {
      "question": "倾向得分分层和 IPW 有什么区别？",
      "answer": "分层是把 e(x) 相近样本分组比较再加权平均，解释性强但仍有信息损失；IPW 用权重重构伪人群，更平滑但方差大。两者都依赖 e(x) 正确与 positivity。"
    },
    {
      "question": "机器学习估 e(x) 比逻辑回归好在哪、风险在哪？",
      "answer": "灵活模型能捕捉非线性与交互，平衡更好；但易对训练样本给出 0/1 极端概率，破坏 positivity 并使加权爆炸，常需交叉拟合(cross-fitting)与截断。"
    }
  ],
  "order": 11,
  "followUpAnswers": [
    "分层是把 e(x) 相近样本分组比较再加权平均，解释性强但仍有信息损失；IPW 用权重重构伪人群，更平滑但方差大。两者都依赖 e(x) 正确与 positivity。",
    "灵活模型能捕捉非线性与交互，平衡更好；但易对训练样本给出 0/1 极端概率，破坏 positivity 并使加权爆炸，常需交叉拟合(cross-fitting)与截断。"
  ]
};
