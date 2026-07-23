export default {
  "kind": "concept",
  "id": "rec-ctr",
  "category": "搜索推荐",
  "difficulty": "Medium",
  "title": "CTR 预估",
  "prompt": "推荐系统的 CTR 预估是什么？",
  "quickAnswer": "CTR（点击率）预估是建模\"在给定上下文下用户点击某物品的概率 pCTR\"。它是精排核心目标之一，常用 LR/GBDT、FM/DeepFM、DIN 等模型，以交叉熵为损失、负采样或全量曝光为训练数据，输出校准后的概率用于排序与竞价。",
  "approach": "曝光点击样本 → 特征交叉模型 → 交叉熵训练 → 输出校准 pCTR。",
  "explanationFocus": "是什么：CTR 预估学习\"用户在某场景下点某物品的概率\"，是推荐/广告排序与出价的基础目标。",
  "bruteForce": "用全局平均点击率当所有物品分数：无个性化，效果极差。",
  "derivation": [
    "为什么需要：排序与竞价都需\"被点概率\"这个统一可比信号。",
    "怎么实现：用(用户,物品,上下文)特征过模型输出 σ(logit)；以曝光-点击为 label 训交叉熵；线上做概率校准。",
    "有什么代价：正负样本极不均衡、位置/曝光偏差大；未校准概率不可直接比大小以外用途。",
    "怎么评测：离线 AUC/LogLoss，线上看 CTR 与校准(可靠性曲线)。"
  ],
  "invariant": "pCTR 是条件概率，需在相同特征口径下跨物品可比。",
  "walkthrough": "100 亿曝光样本 → DeepFM 交叉熵训练 → 输出 pCTR，线上校准后用于排序与 eCPM= pCTR×bid。",
  "edgeCases": [
    "样本不均衡：负样本远多于正。",
    "未校准：概率偏保守/激进。",
    "位置偏差：高位置天然高 CTR。"
  ],
  "code": "# Python\ndef ctr_loss(logit, y):\n    p = sigmoid(logit)\n    return -(y*log(p) + (1-y)*log(1-p))     # 交叉熵\ndef predict(model, feat):\n    return sigmoid(model(feat))             # 校准后 pCTR",
  "codeNotes": [
    "交叉熵是标准损失。",
    "上线前需概率校准。"
  ],
  "complexity": "训练 O(样本数·模型)；推理 O(单样本前向)，受精排候选数约束。",
  "followUps": [
    {
      "question": "CTR 模型输出为什么要校准？",
      "answer": "训练目标只保序，绝对值常偏移；竞价/融合要用真实概率，需 Platt/保序回归把 pCTR 校准到接近真实点击频率。"
    },
    {
      "question": "CTR 和 CVR 预估有何不同？",
      "answer": "CTR 是\"曝光→点击\"，样本是全量曝光；CVR 是\"点击→转化\"，只有点击才有 label，存在样本选择偏差，常用 ESMM 等借 CTR 间接建模。"
    }
  ],
  "followUpAnswers": [
    "CTR 需校准成真实概率。",
    "CVR 有样本选择偏差。"
  ],
  "pitfalls": [
    "直接用未校准 pCTR 做乘法融合。",
    "忽视位置偏差致 CTR 虚高。"
  ],
  "beginnerSummary": "CTR 预估就是猜\"把这件推给你，你有多大概率点\"。模型看过海量\"谁、在什么场景、点了啥\"的历史，学会这套概率。它不直接说\"推不推\"，而是给每个候选一个\"被点可能性\"分数，系统据此排序——分越高越往前放。",
  "prerequisites": [
    "排序需统一概率信号。",
    "存在曝光-点击样本。",
    "概率需跨物品可比。"
  ],
  "workedExample": [
    "海量曝光点击样本训交叉熵。",
    "输出校准 pCTR 用于排序/竞价。"
  ],
  "lineByLine": [
    "构造(用户,物品,上下文)特征。",
    "模型输出 logit。",
    "sigmoid 得 pCTR。",
    "校准后用于排序。"
  ],
  "diagram": "样本(曝光,点击)\n   │ 特征交叉\n   ▼ 模型\n logit ─▶ sigmoid ─▶ pCTR ─▶ 排序/竞价"
};
