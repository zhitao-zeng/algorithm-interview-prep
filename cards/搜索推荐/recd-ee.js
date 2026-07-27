export default {
  "id": "recd-ee",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "探索与利用(EE)：置信上界与 Thompson Sampling",
  "difficulty": "Medium",
  "prompt": "推荐系统如何在\"利用已知好内容\"和\"探索未知潜力内容\"之间做平衡？请说明 UCB 与 Thompson Sampling 的思路？",
  "quickAnswer": "EE 通过给不确定性高的内容更多曝光来发现潜在好物品。UCB 用\"均值+置信半径\"选分高且不确定者；Thompson Sampling 从后验采样再贪心，理论上 regret 更优。冷启动与多样性都依赖 EE 来打破马太效应。",
  "code": "import math\nimport random\n\ndef ucb_score(avg_reward, n_item, n_total, c=1.0):\n    # avg_reward: 该物品平均奖励; n_item: 该物品曝光次数\n    if n_item == 0:\n        return float('inf')          # 未曝光优先探索\n    bonus = c * math.sqrt(math.log(n_total + 1) / n_item)\n    return avg_reward + bonus\n\ndef thompson_sample(alpha, beta):\n    # 对每个物品从 Beta 后验采样一次，取最大者\n    return random.betavariate(alpha, beta)",
  "complexity": "O(N) per decision (N 物品数)",
  "beginnerSummary": "如果系统只推它\"以为\"你喜欢的东西，就永远发现不了你可能更喜欢的新内容。EE 就是给没把握的内容一点机会去试探。",
  "explanationFocus": "是什么：探索与利用(EE)是一类在\"推已知好内容(利用)\"和\"试探未知内容(探索)\"之间权衡的策略，目标是最小化长期累积遗憾(regret)。",
  "approach": "把每个物品的奖励建模为带不确定性的分布：UCB 用均值加置信上界显式鼓励未充分曝光物品；Thompson Sampling 从后验分布采样再贪心，理论 regret 界更紧；线上常配合随机流量与多样性约束。",
  "derivation": [
    "为什么需要：纯利用会陷入信息茧房、马太效应，新内容永远没机会，长期收益受损。",
    "怎么实现：维护每物品奖励估计与曝光计数；UCB=均值+√(logN/n)；TS 从 Beta/高斯后验采样取最大。",
    "有什么代价：探索浪费部分流量于可能低质内容，短期指标有损，需控制探索比例。",
    "怎么评测：用累积 regret、长期留存/多样性指标，以及探索内容的后续转化率。"
  ],
  "edgeCases": [
    "全新物品 n_item=0，UCB 应返回无穷大优先探索或给先验。",
    "奖励非平稳（热点时效性强）需衰减计数或滑动窗口。",
    "物品海量时逐物品 UCB 计算开销大，需分桶或乱序抽样。"
  ],
  "pitfalls": [
    "探索比例固定拍脑袋，未随置信度自适应。",
    "把点击当唯一奖励，忽略负反馈导致探索到低质内容。"
  ],
  "prerequisites": [
    "多臂老虎机(MAB)基础",
    "贝叶斯推断与后验分布"
  ],
  "workedExample": [
    "两个视频：A 曝光100次均值0.8，B 曝光5次均值0.6；n_total=105，c=1。",
    "UCB_A≈0.8+√(ln106/100)≈0.829，UCB_B≈0.6+√(ln106/5)≈0.954，选 B 探索，因为 B 不确定性高。"
  ],
  "lineByLine": [
    "def ucb_score：计算单个物品的 UCB 分数。",
    "if n_item==0: return inf：未曝光物品优先探索。",
    "bonus = c*√(log(n_total+1)/n_item)：曝光越少置信半径越大。",
    "def thompson_sample：从 Beta 后验采样一个值用于贪心比较。"
  ],
  "followUps": [
    {
      "question": "UCB 和 Thompson Sampling 哪个更好？",
      "answer": "TS 在理论 regret 上通常更优且实现简单（只需采样），UCB 更直观易调参；实践中 TS 配合 Beta-Bernoulli 在推荐 EE 中更常见。"
    },
    {
      "question": "怎么把 EE 和深度学习排序结合？",
      "answer": "可在召回/重排层注入探索流量，或用基于模型的 EE（如 LinUCB 用上下文特征预估置信区间），让探索更个性化。"
    }
  ],
  "followUpAnswers": [
    "TS 在理论 regret 上通常更优且实现简单（只需采样），UCB 更直观易调参；实践中 TS 配合 Beta-Bernoulli 在推荐 EE 中更常见。",
    "可在召回/重排层注入探索流量，或用基于模型的 EE（如 LinUCB 用上下文特征预估置信区间），让探索更个性化。"
  ]
};
