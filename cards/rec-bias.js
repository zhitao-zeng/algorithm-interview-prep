export default {
  "kind": "concept",
  "id": "rec-bias",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "推荐系统中的偏差（Position / Selection Bias）",
  "prompt": "推荐系统中的偏差（position bias / selection bias）是什么？",
  "quickAnswer": "Position bias 指用户更可能点靠前位置的项，与相关性无关，使靠前的样本被高估；Selection bias 指训练只用\"被曝光\"的样本，未曝光的好物无标签，模型只学到\"已展示分布\"。二者让离线训练与线上真实分布错位，需用逆倾向加权(IPS)、位置消偏或随机曝光纠偏。",
  "approach": "识别偏差 → IPS/位置特征消偏 或 随机曝光收集无偏数据 → 再训练。",
  "explanationFocus": "是什么：position bias 是位置带来的点击偏好，selection bias 是\"只看曝光样本\"导致的分布偏差，二者使模型学偏，需显式纠偏。",
  "bruteForce": "直接用曝光点击训、把位置当特征喂：位置效应混入相关性，线上重排后失效。",
  "derivation": [
    "为什么需要：训练数据由旧模型产生，自带位置与选择偏差，直接学等于拟合偏差。",
    "怎么实现：训练加入位置特征(预测时置中性位)消 position bias；用 IPS 按曝光概率加权纠 selection bias；或做小流量随机曝光收集无偏数据。",
    "有什么代价：IPS 方差大、需准确 propensity；随机曝光伤短期指标；纠偏过度降相关。",
    "怎么评测：看位置无关后的 AUC、随机曝光集上的表现、线上纠偏 AB。"
  ],
  "invariant": "纠偏后模型在\"给定相关性\"下对位置应不敏感(位置无关性)。",
  "walkthrough": "训练时把展示位置作为特征、 serving 时固定为中性位 → CTR 预测剥离位置效应；另用 1% 随机曝光估 propensity 做 IPS。",
  "edgeCases": [
    "IPS propensity 估计错：方差爆炸。",
    "随机曝光比例：太小无效太大伤收入。",
    "位置特征泄露：线上需置中性。"
  ],
  "code": "# Python\ndef train_with_debias(feat, pos, y, model):\n    feat = concat(feat, onehot(pos))        # 位置作特征\n    model.fit(feat, y)\ndef serve(model, feat):\n    return model(concat(feat, NEUTRAL_POS)) # 预测时中性位",
  "codeNotes": [
    "位置特征 training-aware。",
    "IPS 按曝光概率加权。"
  ],
  "complexity": "训练 O(样本·模型)；IPS 需估 propensity，推理不变。",
  "followUps": [
    {
      "question": "位置特征法和 IPS 法纠 position bias 区别？",
      "answer": "位置特征法在训练加入位置、预测时置中性位，简单实用；IPS 用 1/曝光概率 对样本加权，理论无偏但方差大、依赖 propensity 估计。"
    },
    {
      "question": "selection bias 为什么难解？",
      "answer": "未曝光 item 永远无 label，模型只见旧策略选出的分布；只能靠探索/随机曝光或 IPS 反推无偏，成本高且易引入方差。"
    }
  ],
  "followUpAnswers": [
    "位置特征法更实用。",
    "selection 需随机曝光。"
  ],
  "pitfalls": [
    "把位置当普通特征却线上不中性。",
    "忽略 selection bias 只纠位置。"
  ],
  "beginnerSummary": "position bias：同样一个视频，放第 1 位比第 10 位天然多点，不代表它更好看——就像货架黄金位置的东西总先被拿。selection bias：你只知道\"被摆出来的商品\"卖得如何，从没摆出来的好货你根本没数据，模型只会越来越像旧货架。纠偏就是要么\"告诉模型这是位置效应别算进质量\"，要么\"随机摆几次\"收集公平数据。",
  "prerequisites": [
    "训练数据由旧策略产生。",
    "位置影响点击独立于相关。",
    "曝光样本非随机。"
  ],
  "workedExample": [
    "训练加位置特征，预测置中性位。",
    "1% 随机曝光估 propensity 做 IPS。"
  ],
  "lineByLine": [
    "识别位置/选择偏差。",
    "训练加入位置特征。",
    "线上预测用中性位。",
    "IPS/随机曝光补无偏。"
  ],
  "diagram": "曝光样本(带位置,有偏)\n   │ 加位置特征 / IPS\n   ▼ 去偏训练\n 模型(位置无关) ─▶ 线上"
};
