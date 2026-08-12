export default {
  "id": "rs-fm-deepfm",
  "kind": "concept",
  "category": "推荐系统",
  "title": "特征交叉：FM 与 DeepFM",
  "difficulty": "Medium",
  "prompt": "因子分解机(FM)如何实现二阶特征交叉？DeepFM 如何把 FM 与 DNN 并联，它与 Wide&Deep 的核心区别是什么？",
  "quickAnswer": "FM 用每个特征的隐向量做两两内积实现二阶交叉，无需手动组合且能泛化到未见组合。DeepFM 用 FM 与 DNN 共享同一份 embedding 并联输出，兼顾低阶与高阶交叉；与 Wide&Deep 不同在于它无需人工设计 wide 侧特征。",
  "code": "import numpy as np\n\ndef fm_second_order(X, V):\n    # FM 二阶交叉：Σ_{i<j} <V_i, V_j> * X_i * X_j\n    n = len(X)\n    crosses = []\n    for i in range(n):\n        for j in range(i + 1, n):\n            cross = float(np.dot(V[i], V[j]) * X[i] * X[j])\n            crosses.append(cross)\n    return sum(crosses)",
  "complexity": "FM O(k·n)；DeepFM O(k·n + DNN)",
  "beginnerSummary": "FM 像是给每个特征发一张\"性格卡片\"，任意两张卡片的契合度自动算出，不用人工去配对\"年龄×品类\"这种组合。",
  "explanationFocus": "是什么：因子分解机(FM)是一类用隐向量内积建模任意两个特征交叉的模型；DeepFM 将 FM 部分与 DNN 部分并联、共享输入 embedding，同时捕捉低阶与高阶特征交叉。",
  "approach": "FM 部分用 Σ⟨vi,vj⟩xixj 做二阶交叉；DNN 部分堆叠多层学高阶交叉；两者共享底层 embedding、输出相加；相对 Wide&Deep 省去人工 wide 特征工程。",
  "derivation": [
    "为什么需要：LR 不会交叉、手动组合稀疏且难泛化，需要自动二阶交叉。",
    "怎么实现：每个特征学隐向量 vi，交叉项 vi·vj 乘 xixj；DeepFM 并联 DNN 并在 FM/DNN 间共享 embedding。",
    "有什么代价：FM 只到二阶，高阶需 DNN；embedding 维度与特征量级影响训练成本。",
    "怎么评测：CTR 预估用 AUC/LogLoss；对比 Wide&Deep 看是否需要人工 wide 特征。"
  ],
  "edgeCases": [
    "超高维稀疏 id 类特征(用户/物品)需大 embedding 且做稀疏化。",
    "连续特征需归一化后再入 FM 交叉，否则量纲主导。",
    "特征缺失 x=0 时该交叉项自动为 0，天然支持稀疏。"
  ],
  "pitfalls": [
    "把 FM 当纯线性模型用，忘了二阶交叉项导致表达不足。",
    "DeepFM 与 Wide&Deep 混用，wide 侧重复人工特征反而引入偏置。"
  ],
  "prerequisites": [
    "Embedding 表示",
    "CTR 预估与对数损失"
  ],
  "workedExample": [
    "3 个特征隐向量 v1=[0.2,-0.1], v2=[0.1,0.3], x=[1,1,0]；二阶交叉 ⟨v1,v2⟩·1·1=0.2*0.1+(-0.1*0.3)=-0.01。",
    "Criteo 上 DeepFM AUC 0.789 优于 Wide&Deep 0.785，且免人工 wide 特征工程。"
  ],
  "lineByLine": [
    "def fm_second_order：累加所有特征两两交叉项。",
    "for i<j: 遍历特征对，避免重复计算。",
    "cross = dot(V[i], V[j]) * X[i] * X[j]：隐向量内积乘特征取值。",
    "return sum(crosses)：二阶交叉总分，喂给 sigmoid 做 CTR。"
  ],
  "followUps": [
    {
      "question": "FM 为什么能泛化到没见过的特征组合？",
      "answer": "因为交叉强度由学到的隐向量内积决定，即使某组合在训练集从没共现，只要各自隐向量学到，就能估计交叉；而手工组合在该组合缺失时直接为 0。"
    },
    {
      "question": "DeepFM 相比 Wide&Deep 的真正优势？",
      "answer": "Wide&Deep 的 wide 侧需人工设计交叉特征(如\"年龄×职业\")，DeepFM 用 FM 自动学低阶交叉且 FM 与 DNN 共享 embedding，省去特征工程并避免信息割裂。"
    }
  ],
  "followUpAnswers": [
    "因为交叉强度由学到的隐向量内积决定，即使某组合在训练集从没共现，只要各自隐向量学到，就能估计交叉；而手工组合在该组合缺失时直接为 0。",
    "Wide&Deep 的 wide 侧需人工设计交叉特征(如\"年龄×职业\")，DeepFM 用 FM 自动学低阶交叉且 FM 与 DNN 共享 embedding，省去特征工程并避免信息割裂。"
  ],
  "order": 4
};
