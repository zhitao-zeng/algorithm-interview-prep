export default {
  "id": "ci-causal-forest",
  "kind": "concept",
  "category": "因果推断",
  "title": "因果森林(GRF)与诚实树(Honesty)",
  "difficulty": "Hard",
  "prompt": "因果森林(GRF)如何估计异质处理效应？其分裂准则、Honesty 与方差估计与传统随机森林有何不同？",
  "quickAnswer": "GRF 把随机森林的分裂准则换成\"最大化子节点间 CATE 异质性\"的伪结果梯度(对 ATE 用双重稳健 scores)，从而专门找效应分歧大的切分。Honesty 把样本随机分成生长集与估计集，树结构用前者、叶内 CATE 用后者，消除同数据既建树又估效应的乐观偏。方差用 bootstrap/Jackknife 在叶层聚合估计，给出逐点置信区间。传统 RF 优化预测误差、不保证异质识别且无因果方差。",
  "code": "import numpy as np\nfrom sklearn.ensemble import RandomForestRegressor\n\ndef grf_pseudo_outcome(Y, T, e, mu0, mu1):\n    return T * (Y - mu1) / e - (1 - T) * (Y - mu0) / (1 - e) + (mu1 - mu0)\n\ndef honesty_split(X, Y, T, e, mu0, mu1):\n    n = len(Y)\n    grow, est = np.split(np.random.permutation(n), [n // 2])\n    forest = RandomForestRegressor().fit(X[grow], grf_pseudo_outcome(Y[grow], T[grow], e[grow], mu0[grow], mu1[grow]))\n    return forest.predict(X[est])",
  "complexity": "每棵树 O(N log N·d) 同 RF，但需预估 e,μ 且多次重抽样，常数更大；方差估计增 O(B·N)",
  "beginnerSummary": "普通随机森林想\"猜结果\"，因果森林想\"找哪拨人对药反应差别最大\"。它每切一刀都问：这一刀两边的效果差异拉得够大吗？还特意用一半数据长树、另一半算效果，防止自己骗自己。",
  "explanationFocus": "是什么：因果森林(Generalized Random Forest)是一类针对异质处理效应(CATE)的森林方法，用最大化 CATE 异质性的伪结果梯度作分裂准则，并借 Honesty 划分与刀切方差给出逐点置信区间。",
  "approach": "构造双重稳健伪结果，以最大化子节点 CATE 方差的准则递归分裂；Honesty 把样本分两半分别用于建树与估叶内效应；bootstrap 聚合得 CATE 与方差。",
  "derivation": [
    "为什么需要：传统 RF 优化 MSE，分裂不针对效应异质，给不了可信区间。",
    "怎么实现：用伪结果定义局部矩，分裂使子节点 τ 差异最大；诚实划分防乐观偏；聚合得 τ(x) 与方差。",
    "有什么代价：需先估倾向 e 与结果 μ，预模型误差传到森林；计算比普通 RF 重。",
    "怎么评测：Best Linear Predictor 检验、置信区间覆盖、与基准 CATE 比 MSE。"
  ],
  "edgeCases": [
    "处理组极稀疏，叶内两类样本失衡，CATE 方差大、区间空。",
    "预估 e,μ 偏差大，伪结果失真，森林沿错误方向分裂。",
    "特征无真实异质，森林仍会\"编造\"分裂，需 BLP 检验把关。"
  ],
  "pitfalls": [
    "误把 GRF 输出当无偏点估计而忽略其依赖 e,μ 正确。",
    "未做 Honesty 而同数据建树又估效应，置信区间偏窄、覆盖不足。"
  ],
  "prerequisites": [
    "随机森林与装袋",
    "双重稳健估计与 CATE"
  ],
  "workedExample": [
    "N=5000，GRF 在年龄切分点 45 岁处子节点 τ 分别为 0.2(青年)与 0.7(中年)，异质分裂显著。",
    "Honesty 下中年组 CATE 估 0.68，95% CI [0.55,0.81] 排除 0；非诚实版 CI [0.60,0.76] 偏窄，覆盖率低 8 个百分点。"
  ],
  "lineByLine": [
    "def grf_pseudo_outcome：构造双重稳健伪结果，把 CATE 估计转成回归目标。",
    "def honesty_split：把样本随机分生长集/估计集，树结构用生长集、CATE 用估计集。",
    "forest.predict(X[est])：在估计集上预测，避免同数据乐观偏。"
  ],
  "followUps": [
    {
      "question": "GRF 和普通随机森林核心区别？",
      "answer": "普通 RF 分裂最小化预测 MSE，目标是 Y；GRF 分裂最大化 CATE 异质(用伪结果梯度)，目标是 τ(x)，并额外提供 Honesty 与逐点方差，是因果而非预测。"
    },
    {
      "question": "Honesty 会损失样本效率吗？",
      "answer": "会牺牲约一半数据用于建树，但换来无偏的叶内估计与可信区间；在异质效应估计中这种偏差-方差权衡通常值得，且可用交叉化 Honesty 缓解。"
    }
  ],
  "order": 16,
  "followUpAnswers": [
    "普通 RF 分裂最小化预测 MSE，目标是 Y；GRF 分裂最大化 CATE 异质(用伪结果梯度)，目标是 τ(x)，并额外提供 Honesty 与逐点方差，是因果而非预测。",
    "会牺牲约一半数据用于建树，但换来无偏的叶内估计与可信区间；在异质效应估计中这种偏差-方差权衡通常值得，且可用交叉化 Honesty 缓解。"
  ]
};
