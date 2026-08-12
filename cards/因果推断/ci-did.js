export default {
  "id": "ci-did",
  "kind": "concept",
  "category": "因果推断",
  "title": "双重差分(DID)",
  "difficulty": "Medium",
  "prompt": "双重差分如何用\"处理组前后 vs 对照组前后\"识别因果效应？核心假设是什么，2×2 估计量怎么算？",
  "quickAnswer": "DID 比较处理组在干预前后的变化，减去对照组同期的自然变化，从而剔除同时影响两组的共同时间趋势。核心假设是平行趋势(若无干预两组走势本应一致)。2×2 估计量=(Y_处理_后−Y_处理_前)−(Y_对照_后−Y_对照_前)。",
  "code": "import numpy as np\n\ndef did_2x2(y_tp, y_tpre, y_cp, y_cpre):\n    # 处理组前后差 - 对照组前后差\n    treat_diff = y_tp - y_tpre\n    control_diff = y_cp - y_cpre\n    return treat_diff - control_diff\n\ndef parallel_trend_check(trend_t, trend_c, pre_periods):\n    # 干预前各期组间差应稳定(近似常数)，支持平行趋势\n    gaps = trend_t[:pre_periods] - trend_c[:pre_periods]\n    return gaps",
  "complexity": "2×2 O(1)；面板多期 DID 用固定效应 O(N·T)",
  "beginnerSummary": "想知涨价对销量的影响，先看自己涨价前后掉了 X，再看没涨价的对手同期自然掉了 Y，那\"真正因为涨价\"的就是 X−Y，把大盘整体的下滑扣掉了。",
  "explanationFocus": "是什么：双重差分利用处理组与对照组在政策/干预前后的四格数据，用\"两组前后变化之差\"识别处理效应，前提是干预前两组具有平行趋势。",
  "approach": "取 2×2(组×时间)均值，做差再差，消去共同时间趋势与组间固有差异；识别关键靠平行趋势假设。",
  "derivation": [
    "为什么需要：单看处理组前后差混入了时间趋势，对照组提供趋势基准。",
    "怎么实现：DID=(后_处理−前_处理)−(后_对照−前_对照)，两次减法分别消组间差与时间趋势。",
    "有什么代价：强依赖平行趋势；若政策同期有其他冲击则估计受污染。",
    "怎么评测：画干预前组间差趋势、事件研究法、安慰剂检验。"
  ],
  "edgeCases": [
    "平行趋势不成立：处理组本就有不同走势，DID 估计有偏。",
    "政策同期发生其他冲击(如竞品也调价)，混淆处理效应。",
    "仅有两期数据无法检验趋势，需多期或外部证据支撑。"
  ],
  "pitfalls": [
    "对照组选错(非可比群体)，导致趋势不可比。",
    "只看期末平均忽视动态效应，掩盖效应随时间变化。"
  ],
  "prerequisites": [
    "面板数据基础",
    "平行趋势假设"
  ],
  "workedExample": [
    "处理组 pre=100, post=120；对照组 pre=100, post=110。",
    "DID=(120−100)−(110−100)=20−10=10。若只看处理组前后 +20 会高估，DID 扣掉共同趋势后得到真实效应 10。"
  ],
  "lineByLine": [
    "def did_2x2：分别算处理组与对照组的前后变化。",
    "treat_diff - control_diff：用对照组变化作基准，剔除非处理带来的趋势。",
    "def parallel_trend_check：检查干预前各期组间差是否稳定，验证平行趋势。"
  ],
  "followUps": [
    {
      "question": "平行趋势假设怎么检验？",
      "answer": "用事件研究法估计各期相对处理前的动态效应，若干预前各期系数均不显著异于 0，则支持平行趋势；也可做安慰剂(把处理时间提前)看是否出现伪效应。"
    },
    {
      "question": "多期/交叠 DID 有什么新坑？",
      "answer": "单元在不同时间进入处理时，传统双向固定效应当处理比例高会产生负权重偏倚；需用稳健估计量(如 Callaway-Sant'Anna、Sun-Abraham 堆叠法)并谨慎定义对照组。"
    }
  ],
  "followUpAnswers": [
    "用事件研究法估计各期相对处理前的动态效应，若干预前各期系数均不显著异于 0，则支持平行趋势；也可做安慰剂(把处理时间提前)看是否出现伪效应。",
    "单元在不同时间进入处理时，传统双向固定效应当处理比例高会产生负权重偏倚；需用稳健估计量(如 Callaway-Sant'Anna、Sun-Abraham 堆叠法)并谨慎定义对照组。"
  ],
  "order": 8
};
