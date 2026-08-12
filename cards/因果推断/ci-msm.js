export default {
  "id": "ci-msm",
  "kind": "concept",
  "category": "因果推断",
  "title": "边际结构模型(MSM)与序列 IPTW",
  "difficulty": "Hard",
  "prompt": "处理时变混杂(time-varying confounding)时，边际结构模型如何用序列 IPTW 加权后拟合得到因果效应？",
  "quickAnswer": "时变混杂指基线或前期处理影响后续协变量、而这些协变量又影响后续处理与结果，传统调整会切断合法中介路径。MSM 先对每一步处理用\"序列 IPTW\"构造稳定权重：w=∏_k P(A_k|A_{<k},L_{<k})/P(A_k|A_{<k},L_{≤k})，把观测人群伪造成各时点处理相互独立(即打破时变混杂)；再在加权样本上拟合边际模型(如 E[Y(a)]=β0+β1·a)得到 population-level 因果参数。权重需截断控方差。",
  "code": "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\ndef seq_iptw(A, L, eps=0.01):\n    w = np.ones(len(A))\n    for k in range(A.shape[1]):\n        hist = np.c_[A[:, :k], L[:, :k+1]] if k else L[:, :1]\n        denom = LogisticRegression(max_iter=1000).fit(hist, A[:, k]).predict_proba(hist)[:, 1]\n        num = A[:, k].mean()\n        w *= (num / np.clip(denom, eps, 1 - eps))\n    return w\n\ndef fit_msm(Y, A_final, w):\n    model = LogisticRegression().fit(A_final.reshape(-1, 1), Y, sample_weight=w)\n    return model.coef_[0][0]",
  "complexity": "每时点拟合两个模型 O(T·N·d)；权重乘积 O(N·T)，截断维持数值稳定",
  "beginnerSummary": "病人病情随治疗变化，而病情又决定下一步治疗——这是\"绕圈\"的混杂。MSM 给每步治疗按\"本该被如何治疗\"反着加权，把人掰回每步都随机决定的人群，再直接看治疗量和结果的关系。",
  "explanationFocus": "是什么：边际结构模型(MSM)用序列逆概率加权(seq-IPTW)处理时变混杂，先构造跨所有时点的稳定权重把各时点处理伪随机化，再在加权样本上拟合一个对边际处理史设定的模型，得到总体(population)因果效应参数。",
  "approach": "对每个时点 k 用分母 P(A_k|历史处理、历史协变量)与分子 P(A_k|历史处理)构造稳定权重并累乘，加权后拟合边际模型估计因果参数。",
  "derivation": [
    "为什么需要：时变混杂同时被前期处理影响又影响后续处理，标准回归调整会切断处理经协变量的合法路径。",
    "怎么实现：逐时点估分母/分子倾向并累乘稳定权重，加权后拟合 MSM 得 β。",
    "有什么代价：权重跨时点连乘易极端、方差暴涨；依赖各时点可忽略性成立。",
    "怎么评测：检查加权后各时点协变量平衡、做权重截断与敏感性分析。"
  ],
  "edgeCases": [
    "某时点分母 e≈0(几乎必处理)，连乘权重爆炸，单样本主导。",
    "时变混杂含未观测成分，seq-IPTW 无法校正，β 有偏。",
    "处理史类别爆炸(多时点多水平)，权重分母稀疏不稳。"
  ],
  "pitfalls": [
    "在 MSM 前对时变中介做标准回归调整，错误关掉合法因果路径。",
    "为稳方差过度截断权重，改变目标人群且引入微小偏倚未报告。"
  ],
  "prerequisites": [
    "时变混杂与因果序",
    "逆概率加权与稳定权重"
  ],
  "workedExample": [
    "两时点：时点1稳定权重 1.8，时点2分母 e=0.05 截断到 0.1 得权重 2.0，累乘稳定权重=3.6。",
    "加权后拟合 MSM E[Y(a)]=β0+β1·a，β1=0.22(p<0.01)，表示坚持两期治疗较中断平均多 0.22 结果分；未加权回归仅得 0.10(被时变混杂压低)。"
  ],
  "lineByLine": [
    "def seq_iptw：逐时点 k 拟合分母(含历史协变量)与分子(仅历史处理)倾向。",
    "w *= num/np.clip(denom,...)：累乘稳定权重并截断防极端。",
    "def fit_msm：用 sample_weight=w 拟合边际模型，coef_ 即因果参数 β1。"
  ],
  "followUps": [
    {
      "question": "MSM 和 g-formula 处理时变混杂有何不同？",
      "answer": "MSM 用序列 IPTW 伪随机化后拟合简单边际模型，重点是总体参数且依赖倾向模型；递归 g-formula 直接建模状态演化，依赖结果模型。DR 方法(如 SWIG+AIPW)可结合二者提升稳健性。"
    },
    {
      "question": "稳定权重为什么用分子 P(A_k|历史处理)？",
      "answer": "分子只含历史处理(不含时变协变量)，相当于把人群拉回到\"仅由已发生处理决定下一步\"的伪随机状态，从而打破时变混杂；分母含协变量保证无偏、分子保证权重有界更稳。"
    }
  ],
  "order": 18,
  "followUpAnswers": [
    "MSM 用序列 IPTW 伪随机化后拟合简单边际模型，重点是总体参数且依赖倾向模型；递归 g-formula 直接建模状态演化，依赖结果模型。DR 方法(如 SWIG+AIPW)可结合二者提升稳健性。",
    "分子只含历史处理(不含时变协变量)，相当于把人群拉回到\"仅由已发生处理决定下一步\"的伪随机状态，从而打破时变混杂；分母含协变量保证无偏、分子保证权重有界更稳。"
  ]
};
