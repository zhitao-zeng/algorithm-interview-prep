export default {
  "id": "ci-front-door",
  "kind": "concept",
  "category": "因果推断",
  "title": "前门准则(Front-Door Criterion)",
  "difficulty": "Hard",
  "prompt": "当存在未观测混杂 U 影响处理与结果时，前门准则在什么条件下仍能识别因果效应？它与后门准则如何互补？",
  "quickAnswer": "前门准则在存在未观测混杂 U 时仍可识别，需满足：(1)处理到中介 M 无未观测混杂；(2)中介 M 到结果 Y 无未观测混杂；(3)不存在处理到结果的直接路径(全部效应经 M)；(4)处理与中介充分强。效应按 P(y|do(x))=Σ_m P(m|x)Σ_x′ P(y|m,x′)P(x′) 识别，核心把效应拆成 X→M 与 M→Y 两段，每段各自未被 U 污染。后门处理观测混杂、前门处理特定结构的未观测混杂，二者互补。",
  "code": "import numpy as np\n\ndef front_door_effect(P_M_given_X, P_Y_given_M_X, X_vals):\n    total = 0.0\n    for x1 in X_vals:\n        acc = 0.0\n        for m in [0, 1]:\n            for x2 in X_vals:\n                acc += P_M_given_X[m, x1] * P_Y_given_M_X[1, m, x2] / len(X_vals)\n        total += acc / len(X_vals)\n    return total",
  "complexity": "枚举 x,m 组合 O(|X|·|M|·|X|)，离散情形线性、连续需积分/模型",
  "beginnerSummary": "抽烟和肺癌之间可能有说不清的遗传因素(U)同时影响两者。如果抽烟一定先伤肺(M)，且伤肺到肺癌没别的暗道，那就能把\"抽烟→伤肺\"和\"伤肺→肺癌\"两段分开量，绕开那个说不清的 U。",
  "explanationFocus": "是什么：前门准则是一种在存在未观测混杂 U 污染 X→Y 时仍可识别因果效应的图准则，前提是全部 X 对 Y 的效应都经由中介 M，且 X→M 与 M→Y 这两段各自没有未观测混杂。",
  "approach": "把不可识别的 X→Y 拆成两段：先识 X→M(无 U 污染)，再识 M→Y(无 U 污染)，乘积式 Σ_m P(m|x)Σ_x′ P(y|m,x′)P(x′) 给出 do 表达式。",
  "derivation": [
    "为什么需要：后门要求观测所有混杂，现实常有未观测 U，此时标准调整失效。",
    "怎么实现：验证 X→M、M→Y 两段无 U，且 X→Y 无直接边；用前门公式分段识别再相乘。",
    "有什么代价：对图结构假设极强，任一段漏掉混杂即偏倚；需 M 充分介导。",
    "怎么评测：敏感性分析检验 M 是否遗漏混杂、M 是否充分中介，对比后门估计。"
  ],
  "edgeCases": [
    "X→Y 存在未被 M 介导的直接路径，前门公式漏算直接效应。",
    "M→Y 存在未观测混杂(如社会因素同时影响伤肺程度与就诊)，识别失效。",
    "M 仅介导很小部分效应，估计方差大且对假设极敏感。"
  ],
  "pitfalls": [
    "把\"有中介\"误当\"完全中介\"，忽略直接路径导致低估总效应。",
    "前门的 M 必须本身不被 U 直接影响，否则和后门一样被污染。"
  ],
  "prerequisites": [
    "有向无环图(DAG)与 d-分离",
    "后门准则与 do-演算"
  ],
  "workedExample": [
    "抽烟(X)→焦油沉积(M)→肺癌(Y)，U=遗传同时影响 X,Y 但被假定不影响 M。",
    "测得 P(M=高|X=1)=0.8、P(M=高|X=0)=0.2；P(Y=1|M=高,X=1)=0.30、P(Y=1|M=高,X=0)=0.28(控制 X 后 M→Y 稳定)。前门效应≈Σ_m P(m|x)Σ_x′ P(y|m,x′)P(x′)，估算 do(X=1) 相对 do(X=0) 风险比约 2.1，绕开了 U。"
  ],
  "lineByLine": [
    "def front_door_effect：按前门公式在离散 x,m 上求和识别 do 效应。",
    "P_M_given_X[m,x1]：第一段 X→M 的概率，假定无未观测混杂可直接估。",
    "内层 Σ_x′ P_Y_given_M_X[1,m,x′] / len(X_vals)：第二段 M→Y 对 x′ 边际化，消去被 U 污染的 X 关联。"
  ],
  "followUps": [
    {
      "question": "前门和后门能同时用吗？",
      "answer": "可以。先用后门调整观测混杂得到 X→M 与 M→Y 的干净估计，再套前门公式；当 U 只污染 X→Y 而不污染两段时，前门是后门的必要补充。"
    },
    {
      "question": "前门公式里的 Σ_x′ P(x′) 为什么重要？",
      "answer": "它把 M→Y 的效应在 X 的边际分布上平均，消除 X→M 段可能残留的(被 U 污染的)X 与 Y 关联，这正是绕开 U 的关键一步。"
    }
  ],
  "order": 13,
  "followUpAnswers": [
    "可以。先用后门调整观测混杂得到 X→M 与 M→Y 的干净估计，再套前门公式；当 U 只污染 X→Y 而不污染两段时，前门是后门的必要补充。",
    "它把 M→Y 的效应在 X 的边际分布上平均，消除 X→M 段可能残留的(被 U 污染的)X 与 Y 关联，这正是绕开 U 的关键一步。"
  ]
};
