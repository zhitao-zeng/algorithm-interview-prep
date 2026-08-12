export default {
  "id": "ci-gcomputation",
  "kind": "concept",
  "category": "因果推断",
  "title": "G-computation / g-formula",
  "difficulty": "Medium",
  "prompt": "G-computation(g-formula)如何通过对模型预测做边际化来估计 ATE？它与 IPTW、边际结构模型有何关系？",
  "quickAnswer": "G-computation 用观测数据拟合结果模型 E[Y|T,X]，再对每个个体把处理分别设为 1 与 0 做反事实预测，对所有 X 平均得到 E[Y(1)] 与 E[Y(0)]，其差即 ATE(需可忽略性)。本质是标准化/边际化掉协变量。它依赖结果模型正确；与 IPTW 互补——IPTW 靠倾向模型、G-formula 靠结果模型——AIPW/DR 把二者结合，对任一方误设仍一致。MSM 常在 IPTW 加权后拟合，G-formula 则直接建模结果。",
  "code": "import numpy as np\nfrom sklearn.linear_model import LogisticRegression\n\ndef g_formula(X, T, Y):\n    model = LogisticRegression().fit(np.c_[X, T], Y)\n    p1 = model.predict_proba(np.c_[X, np.ones(len(X))])[:, 1]\n    p0 = model.predict_proba(np.c_[X, np.zeros(len(X))])[:, 1]\n    return p1.mean() - p0.mean()\n\ndef aipw(X, T, Y, e, mu0, mu1):\n    tau = T * (Y - mu1) / e - (1 - T) * (Y - mu0) / (1 - e) + mu1 - mu0\n    return tau.mean()",
  "complexity": "拟合结果模型 O(N·d)；边际化 O(N)，比 IPTW 更省且无需极端权重",
  "beginnerSummary": "想知道全民吃药会怎样、都不吃会怎样。G-formula 给每个人各\"算一遍\"吃药和不吃的得分，再把所有人平均，差就是平均因果效应；它靠把个人特征\"抹平\"。",
  "explanationFocus": "是什么：G-computation(又称 g-formula)通过拟合观测结果模型 E[Y|T,X]，把处理分别干预为 1 与 0 生成反事实预测，再对所有协变量 X 取期望，用 E[Y(1)]-E[Y(0)] 估计 ATE。",
  "approach": "拟合结果回归 → 对每个样本算两种处理的预测 → 在 X 上平均得边际结果 → 相减得 ATE；可与 IPTW 组合成双重稳健 AIPW。",
  "derivation": [
    "为什么需要：直接边际化要求满协变量联合，不可行；需借模型参数化结果再平均。",
    "怎么实现：估 μ(t,x)=E[Y|T=t,X=x]，算全样本 μ(1,x) 与 μ(0,x) 均值之差。",
    "有什么代价：强依赖结果模型正确设定；外推到协变量支撑外有偏。",
    "怎么评测：与 IPTW/AIPW 交叉验证，检查重叠区与残差，报告稳健性。"
  ],
  "edgeCases": [
    "结果模型漏交互项，标准化后仍有残余混杂偏倚。",
    "某子群 X 在 T=1 下无支撑(无重叠)，反事实预测纯外推。",
    "Y 为生存/纵向时 g-formula 需递归状态演化，复杂度陡增。"
  ],
  "pitfalls": [
    "只校观测混杂，对未观测混杂无能为力，与所有可忽略性方法同限。",
    "误信 g-formula 比 IPTW 更\"安全\"——其实只是误设对象不同(结果 vs 倾向)。"
  ],
  "prerequisites": [
    "可忽略性与反事实框架",
    "标准化/边际化(直接标准化法)"
  ],
  "workedExample": [
    "1000 人，逻辑回归结果模型得：设 T=1 时平均预测概率 0.45，设 T=0 时 0.30。",
    "ATE=0.45-0.30=0.15；同数据 IPTW 估 0.16、AIPW 估 0.155，三者接近，说明结果模型与倾向模型一致、结论稳健。"
  ],
  "lineByLine": [
    "def g_formula：拟合 E[Y|T,X] 结果模型。",
    "predict_proba 对 (X, T=1) 与 (X, T=0) 分别预测反事实概率。",
    "p1.mean()-p0.mean()：在 X 上平均得 ATE，即 g-formula 边际化。"
  ],
  "followUps": [
    {
      "question": "G-formula 和 IPTW 哪个更稳？",
      "answer": "IPTW 靠倾向模型、对极端 e 方差大；G-formula 靠结果模型、无需极端权重但需正确设定。AIPW 同时用两者达到双重稳健——任一方正确即可一致，是更优默认。"
    },
    {
      "question": "g-formula 能处理时变处理吗？",
      "answer": "可以，但需递归 g-formula(序列化状态演化)，且每一步都需顺序可忽略性；实际常与 MSM/IPW 配合，计算与假设都更重。"
    }
  ],
  "order": 17,
  "followUpAnswers": [
    "IPTW 靠倾向模型、对极端 e 方差大；G-formula 靠结果模型、无需极端权重但需正确设定。AIPW 同时用两者达到双重稳健——任一方正确即可一致，是更优默认。",
    "可以，但需递归 g-formula(序列化状态演化)，且每一步都需顺序可忽略性；实际常与 MSM/IPW 配合，计算与假设都更重。"
  ]
};
