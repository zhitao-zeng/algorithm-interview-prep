export default {
  "id": "ci-iv",
  "kind": "concept",
  "category": "因果推断",
  "title": "工具变量(IV)与两阶段最小二乘",
  "difficulty": "Hard",
  "prompt": "工具变量法靠哪两个条件识别因果效应？2SLS 的直觉是什么，弱工具有什么问题？",
  "quickAnswer": "IV 需满足相关性(工具 Z 影响处理 T)与外生性(Z 只经 T 影响 Y、与潜在结果独立)。2SLS 先用 Z 回归 T 得预测 T̂(仅含 Z 解释的外生部分)，再用 T̂ 回归 Y，系数即局部因果效应(LATE)。弱工具(Z 对 T 影响小)使估计方差大且偏倚向 OLS。",
  "code": "import numpy as np\n\ndef tsls(z, t, y):\n    # 第一阶段: T ~ Z\n    beta1 = np.polyfit(z, t, 1)\n    t_hat = np.polyval(beta1, z)\n    # 第二阶段: Y ~ T_hat\n    beta2 = np.polyfit(t_hat, y, 1)\n    return beta2[0]            # LATE\n\ndef relevance_test(z, t):\n    from numpy.linalg import lstsq\n    X = np.vstack([np.ones_like(z), z]).T\n    coef, _, _, _ = lstsq(X, t, rcond=None)\n    return coef[1]            # 第一阶段斜率，弱工具时接近 0",
  "complexity": "2SLS 两次回归 O(N·d)；弱工具需做 F 检验",
  "beginnerSummary": "想知\"教育→收入\"，但能力和动机同时影响两者(混杂)。找个只推动人上学、本身不影响收入的因素(如离大学远近)当\"撬棍\"，只借它推动的那部分来估因果。",
  "explanationFocus": "是什么：工具变量利用一个仅通过处理影响结果、且与混杂无关的外部变量 Z，在处理与结果存在未观测混杂时仍能识别因果效应(局部平均处理效应 LATE)。",
  "approach": "满足相关性(相关)与外生性(排除限制)后，用 2SLS 先由 Z 预测 T 的外生部分，再用它回归 Y，避开未观测混杂。",
  "derivation": [
    "为什么需要：存在未观测混杂时回归 T 对 Y 系数有偏，需外部变动源隔离外生部分。",
    "怎么实现：第一阶段 T=α+πZ+u 得 T̂；第二阶段 Y=βT̂+v，β 即 LATE。",
    "有什么代价：只识别依从者(complier)的局部效应，不能代表全体；弱工具使估计不稳。",
    "怎么评测：第一阶段 F 检验(>10 判非弱)、过度识别检验(多 IV 时)、稳健性分析。"
  ],
  "edgeCases": [
    "弱工具：Z 对 T 影响很小，第一阶段 F 低，估计方差爆炸且偏倚向 OLS。",
    "排除限制不成立：Z 有直达 Y 的路径，外生性被破坏。",
    "多个 IV 且相互冲突时需过度识别检验，否则结论不可靠。"
  ],
  "pitfalls": [
    "把 LATE 误当成总体 ATE，忽略它只对依从者有效。",
    "外生性不可直接检验，靠领域论证，易被质疑。"
  ],
  "prerequisites": [
    "内生性与遗漏变量偏倚",
    "两阶段回归直觉"
  ],
  "workedExample": [
    "Z=是否就近大学(1/0), T=受教育年限, Y=年收入(万元)。第一阶段 β_ZT=1.2 年, F=25>10 非弱。",
    "第二阶段 β_T̂Y=0.08 万元/年；而 OLS 因能力混杂估得 0.12，明显偏高，IV 给出更可信的 LATE≈0.08。"
  ],
  "lineByLine": [
    "def tsls：第一阶段用 Z 拟合 T，得到仅由工具解释的部分 T̂。",
    "t_hat = polyval(beta1, z)：把 T 拆成外生(Z驱动)与残差两部分。",
    "def relevance_test：返回第一阶段斜率，用于判断工具是否够强(弱则接近0)。"
  ],
  "followUps": [
    {
      "question": "LATE 和 ATE 的关系是什么？",
      "answer": "LATE 是 2SLS 识别的局部平均处理效应，仅对因 Z 变动而改变的依从者(complier)成立；当所有单元都是依从者(单调可加等强假设)时 LATE=ATE，否则不能外推到全体。"
    },
    {
      "question": "怎么判断工具够强？",
      "answer": "看第一阶段回归中 Z 的系数显著性与整体 F 统计量，经验阈值 F>10 视为非弱工具；F 过低需换更强工具或报告弱工具偏倚。"
    }
  ],
  "followUpAnswers": [
    "LATE 是 2SLS 识别的局部平均处理效应，仅对因 Z 变动而改变的依从者(complier)成立；当所有单元都是依从者(单调可加等强假设)时 LATE=ATE，否则不能外推到全体。",
    "看第一阶段回归中 Z 的系数显著性与整体 F 统计量，经验阈值 F>10 视为非弱工具；F 过低需换更强工具或报告弱工具偏倚。"
  ],
  "order": 7
};
