export default {
  "id": "ci-mediation",
  "kind": "concept",
  "category": "因果推断",
  "title": "中介分析(Mediation)：NDE、NIE 与 Sobel/Bootstrap",
  "difficulty": "Medium",
  "prompt": "中介分析如何把总效应拆成自然直接效应(NDE)与自然间接效应(NIE)？Sobel 检验与 Bootstrap 置信区间各有何优劣？",
  "quickAnswer": "中介分析在 X→M→Y 中加入中介 M，把总效应拆为 NDE(保持 M 在对照水平、改变 X 的效应)与 NIE(保持 X 在对照水平、经 M 传导的效应)，NDE+NIE=总效应。Sobel 检验假设 a·b 乘积近似正态，解析快但有正态性假设、对小样本保守；Bootstrap 不依赖正态假设、直接对 a·b 重抽样给置信区间，更稳健但计算贵。",
  "code": "import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\ndef mediation_effects(X, M, Y):\n    a = LinearRegression().fit(X, M).coef_[0]\n    b = LinearRegression().fit(np.c_[X, M], Y).coef_[1]\n    cp = LinearRegression().fit(np.c_[X, M], Y).coef_[0]\n    return a * b, cp\n\ndef sobel_se(a, sa, b, sb):\n    return np.sqrt(b**2 * sa**2 + a**2 * sb**2)",
  "complexity": "拟合两条回归 O(N·d)；Bootstrap B 次重抽样为 O(B·N·d)",
  "beginnerSummary": "药不仅能直接治病，还可能先改善睡眠再治病。中介分析就是把\"直接作用\"和\"绕道睡眠的作用\"分开算账。",
  "explanationFocus": "是什么：中介分析研究处理 X 通过中介变量 M 影响结果 Y 的机制，将总效应分解为自然直接效应(NDE，X 变而 M 保持原分布)与自然间接效应(NIE，X 固定而 M 随 X 变化的部分)。",
  "approach": "分别拟合 X→M(a) 与 X,M→Y(b,c′) 两条回归，乘积 a·b 估计 NIE、c′ 估计 NDE；用 Sobel 或 Bootstrap 给 NIE 置信区间。",
  "derivation": [
    "为什么需要：只知道 X 影响 Y 不够，还要弄清是直通车还是经 M 中转，指导干预靶点。",
    "怎么实现：估计 a(路径 X→M)、b(路径 M→Y 控 X)、c′(X→Y 控 M)，NIE=a·b、NDE=c′。",
    "有什么代价：需顺序可忽略性(无 X→M 与 M→Y 的未观测混杂)，否则效应分解有偏。",
    "怎么评测：报告 NDE/NIE 占比、Bootstrap 置信区间是否排除 0，并检验中介比例。"
  ],
  "edgeCases": [
    "存在 X→M 的未观测混杂，NIE 估计有偏且方向难判。",
    "M 与 Y 互为因果(X→M 与 Y→M 同时存在)，标准中介公式失效。",
    "a 或 b 接近 0 使 NIE 极小，Sobel 检验功效低易漏检。"
  ],
  "pitfalls": [
    "把相关链条当因果中介，忽略 M 与 Y 间的混杂(如基线严重度)。",
    "Sobel 检验要求 a·b 乘积正态，偏态小样本下 Bootstrap 更可靠却常被省略。"
  ],
  "prerequisites": [
    "潜在结果与可忽略性",
    "线性回归与系数解释"
  ],
  "workedExample": [
    "健身(X)经睡眠(M)提升精力(Y)：a=0.5(健身多睡0.5h)、b=2.0(每多睡1h精力+2)、c′=1.0(直接作用)。",
    "NIE=a·b=1.0，NDE=c′=1.0，总效应=2.0，中介占比 50%；Sobel SE=√(2²·0.1²+0.5²·0.3²)=√(0.04+0.0225)=0.25，z=1.0/0.25=4>1.96 显著。"
  ],
  "lineByLine": [
    "def mediation_effects：用 LinearRegression 估计 a(X→M) 和 b、c′(X,M→Y)。",
    "return a*b, cp：a*b 即自然间接效应 NIE，c′ 即自然直接效应 NDE。",
    "def sobel_se：按 √(b²sa²+a²sb²) 解析计算 a·b 的标准误用于 z 检验。"
  ],
  "followUps": [
    {
      "question": "NDE 和 NIE 加起来一定等于总效应吗？",
      "answer": "在线性且无交互、可忽略假设成立时 NDE+NIE=总效应；若存在 X×M 交互或暴露-中介交互，二者加总可能不等于总效应，需用反事实定义正确拆分。"
    },
    {
      "question": "Sobel 和 Bootstrap 该选哪个？",
      "answer": "Bootstrap(尤其偏差校正 BCa)不依赖乘积正态假设、对小样本与偏态更稳健，是现今主流；Sobel 计算快但保守且对正态敏感，适合大样本快速筛查。"
    }
  ],
  "order": 12,
  "followUpAnswers": [
    "在线性且无交互、可忽略假设成立时 NDE+NIE=总效应；若存在 X×M 交互或暴露-中介交互，二者加总可能不等于总效应，需用反事实定义正确拆分。",
    "Bootstrap(尤其偏差校正 BCa)不依赖乘积正态假设、对小样本与偏态更稳健，是现今主流；Sobel 计算快但保守且对正态敏感，适合大样本快速筛查。"
  ]
};
