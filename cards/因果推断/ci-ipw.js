export default {
  "id": "ci-ipw",
  "kind": "concept",
  "category": "因果推断",
  "title": "逆概率加权(IPW/IPTW)",
  "difficulty": "Medium",
  "prompt": "逆概率加权如何利用倾向得分估计因果效应？为何会方差爆炸，截断(trimming)如何缓解？",
  "quickAnswer": "IPW 用倾向得分 e(x)=P(T=1|x) 构造权重 w=1/e(x)(处理组)或 1/(1-e(x))(对照组)，把观测样本伪造成处理与协变量独立的随机化人群，ATE≈加权结果差。当 e(x) 接近 0 或 1 时权重爆炸、方差剧增，故对 e(x) 做截断(如 [0.01,0.99])以稳定估计。",
  "code": "import numpy as np\n\ndef ipw_weights(t, propensity, eps=0.01):\n    e = np.clip(propensity, eps, 1 - eps)      # 截断防止极端权重\n    return np.where(t == 1, 1.0 / e, 1.0 / (1.0 - e))\n\ndef ipw_ate(y, t, propensity):\n    w = ipw_weights(t, propensity)\n    num = np.sum(w * t * y) / np.sum(w * t)\n    den = np.sum(w * (1 - t) * y) / np.sum(w * (1 - t))\n    return num - den",
  "complexity": "拟合倾向得分 O(N·d)；加权估计 O(N)",
  "beginnerSummary": "吃药的人大多本来健康(倾向高)，直接比不公平；IPW 给\"难得吃药却健康差的人\"更大权重，把样本\"掰\"回随机化的样子。",
  "explanationFocus": "是什么：逆概率加权用每个样本被分配到实际处理的概率倒数作权重，重新构造一个处理与协变量独立的伪人群，从而由观测数据无偏估计因果效应。",
  "approach": "先拟合倾向得分 e(x)，构造稳定权重使加权后处理组与对照组协变量平衡，再算加权结果差得到 ATE/ATT。",
  "derivation": [
    "为什么需要：观测数据里处理组与对照组协变量分布不同，直接比较有混杂偏倚。",
    "怎么实现：用模型估 e(x)，处理组权重 1/e(x)、对照组 1/(1-e(x))，加权后 covariate 平衡。",
    "有什么代价：e(x) 极端时权重爆炸、方差大增；e(x) 误设带来偏倚。",
    "怎么评测：看加权后协变量平衡(标准化均值差)、用截断/稳定权重控方差、做敏感性分析。"
  ],
  "edgeCases": [
    "倾向得分接近 0/1 的个体权重极大，单点就能主导估计。",
    "倾向模型误设(漏交互项)使 e(x) 偏差传递到效应估计。",
    "小样本或稀疏区 e(x) 估计不稳，权重波动剧烈。"
  ],
  "pitfalls": [
    "只校正观测混杂，对未观测混杂无能为力。",
    "为降方差过度截断 e(x)，虽稳却引入微小偏倚，需权衡并报告。"
  ],
  "prerequisites": [
    "潜在结果与可忽略性",
    "倾向得分定义"
  ],
  "workedExample": [
    "某对照个体 e(x)=0.02，原始权重=1/0.02=50；截断到 [0.1,0.9] 后权重=1/0.9≈1.11，方差大幅下降。",
    "加权前处理-对照差 0.30(含混杂)，IPW(截断后)估计 ATE≈0.18，更接近真实效应。"
  ],
  "lineByLine": [
    "def ipw_weights：用 np.clip 把倾向得分截到 [eps,1-eps]，避免权重爆炸。",
    "np.where(t==1, 1/e, 1/(1-e))：处理组用 1/e，对照组用 1/(1-e)。",
    "def ipw_ate：按权重分别求处理组与对照组加权均值，相减得 ATE。"
  ],
  "followUps": [
    {
      "question": "IPW 和直接回归调整倾向得分有何区别？",
      "answer": "回归调整在结果模型里控制 e(x)，对模型形式敏感；IPW 通过权重重建平衡人群、更依赖倾向模型正确但结果模型更灵活。实践中常结合二者用 AIPW(增强 IPW)以降低模型误设敏感度。"
    },
    {
      "question": "什么是稳定 IPW(SW)?",
      "answer": "稳定权重 w=T·P(T=1)/(e(x)) + (1-T)·P(T=0)/(1-e(x))，分子乘上处理边际概率，能在保持无偏的同时显著降低权重方差，比原始 IPW 更稳定。"
    }
  ],
  "followUpAnswers": [
    "回归调整在结果模型里控制 e(x)，对模型形式敏感；IPW 通过权重重建平衡人群、更依赖倾向模型正确但结果模型更灵活。实践中常结合二者用 AIPW(增强 IPW)以降低模型误设敏感度。",
    "稳定权重 w=T·P(T=1)/(e(x)) + (1-T)·P(T=0)/(1-e(x))，分子乘上处理边际概率，能在保持无偏的同时显著降低权重方差，比原始 IPW 更稳定。"
  ],
  "order": 5
};
