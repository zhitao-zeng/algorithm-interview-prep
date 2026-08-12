export default {
  "id": "ci-rdd",
  "kind": "concept",
  "category": "因果推断",
  "title": "断点回归(RDD)",
  "difficulty": "Hard",
  "prompt": "断点回归为什么能在 cutoff 附近当作\"局部随机实验\"？清晰 RDD 与模糊 RDD 有何区别，带宽怎么选？",
  "quickAnswer": "当处理由连续变量 X 越过 cutoff 强制决定时，cutoff 两侧个体除处理外几乎随机(仅差一个无穷小 X)，故可像 RCT 比较两侧结果。清晰 RDD 中 X>cutoff 必接受处理，跳变即效应；模糊 RDD 中只是概率跳变，需用 X>=cutoff 作 IV(Wald 估计)。带宽过宽偏倚大、过窄方差大，常用 IMSE 最优或做稳健性检验。",
  "code": "import numpy as np\n\ndef sharp_rdd(y, x, cutoff):\n    left = y[x < cutoff]\n    right = y[x >= cutoff]\n    return right.mean() - left.mean()         # cutoff 处跳变=局部效应\n\ndef fuzzy_rdd(y, t, x, cutoff):\n    # 用指示 x>=cutoff 作 IV 的 Wald 估计\n    z = (x >= cutoff).astype(float)\n    numerator = y[z == 1].mean() - y[z == 0].mean()\n    denominator = t[z == 1].mean() - t[z == 0].mean()\n    return numerator / denominator",
  "complexity": "局部多项式 O(N·h)；带宽选择决定偏倚-方差",
  "beginnerSummary": "考试过 60 分才发奖，59 和 61 分的人水平几乎一样，只差\"有没有奖\"，那获奖组比落榜组高出的分数就是奖的真实作用。",
  "explanationFocus": "是什么：断点回归利用一个连续变量在临界值处强制或概率性地决定处理，使 cutoff 附近个体近似随机分配，从而用局部比较识别在 cutoff 处的因果效应。",
  "approach": "在 cutoff 两侧分别拟合结果关于 X 的趋势，比较极限处的跳跃；清晰 RDD 直接比均值差，模糊 RDD 用跳跃比(IV/Wald)。",
  "derivation": [
    "为什么需要：cutoff 附近 X 近乎随机，提供类似实验的局部随机化。",
    "怎么实现：对两侧结果做局部多项式回归，取 cutoff 处左右极限之差为效应。",
    "有什么代价：只识别 cutoff 处(而非全局)的效应；带宽选择影响偏倚-方差。",
    "怎么评测：密度检验(无精确操控)、不同带宽稳健性、伪断点安慰剂。"
  ],
  "edgeCases": [
    "个体可操纵 X(在 cutoff 附近主动跨线)，破坏局部随机化。",
    "无连续变量或 cutoff 处样本极少，估计不稳。",
    "结果在 cutoff 附近本身有非线性趋势，易被误当效应。"
  ],
  "pitfalls": [
    "把 X 与结果的非线性趋势误读成处理跳变。",
    "模糊 RDD 忽略依从性，把概率跳当确定跳直接相减。"
  ],
  "prerequisites": [
    "局部随机化直觉",
    "工具变量/Wald 估计"
  ],
  "workedExample": [
    "奖学金 cutoff=80 分：左侧(70-80)均值 2.8，右侧(80-90)均值 3.4，清晰 RDD 效应=0.6。",
    "模糊 RDD：右侧获奖概率仅 0.7，Wald=(3.4−2.8)/(0.7−0.0)=0.857，校正了不完全依从。"
  ],
  "lineByLine": [
    "def sharp_rdd：直接比 cutoff 两侧结果均值，差即清晰断点效应。",
    "def fuzzy_rdd：构造 x>=cutoff 的指示变量 z 作为 IV。",
    "numerator/denominator：Wald 估计=结果跳变/处理概率跳变，校正不完全依从。"
  ],
  "followUps": [
    {
      "question": "怎么判断个体有没有操纵 cutoff 附近的 X？",
      "answer": "看处理变量在 cutoff 处的密度是否出现不连续跳变(密度检验/McCrary 检验)；若出现堆积或空缺，说明存在精确操控，局部随机化假设受损，RDD 结果不可信。"
    },
    {
      "question": "带宽选大了和小了分别怎样？",
      "answer": "带宽过大纳入远离 cutoff 的点，结果被整体趋势主导、偏倚上升；过小则样本少、方差大。常用 IMSE 最优带宽并报告多种带宽下的稳健性。"
    }
  ],
  "followUpAnswers": [
    "看处理变量在 cutoff 处的密度是否出现不连续跳变(密度检验/McCrary 检验)；若出现堆积或空缺，说明存在精确操控，局部随机化假设受损，RDD 结果不可信。",
    "带宽过大纳入远离 cutoff 的点，结果被整体趋势主导、偏倚上升；过小则样本少、方差大。常用 IMSE 最优带宽并报告多种带宽下的稳健性。"
  ],
  "order": 9
};
