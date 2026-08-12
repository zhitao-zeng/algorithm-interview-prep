export default {
  "id": "rs-din",
  "kind": "concept",
  "category": "推荐系统",
  "title": "用户兴趣建模：DIN 与 DIEN 的注意力机制",
  "difficulty": "Medium",
  "prompt": "DIN 如何用注意力机制根据候选广告\"激活\"用户历史中的局部兴趣，DIEN 又是怎样引入序列演化(GRU/AUGRU)来建模兴趣随时间变化的？",
  "quickAnswer": "DIN 用一个 candidate-aware 注意力给历史行为加权，与候选越相关的历史贡献越大，实现局部兴趣激活。DIEN 在 DIN 之上加一层兴趣抽取 GRU 与兴趣演化 AUGRU，用隐状态序列刻画兴趣漂移并让注意力读演化后的兴趣。二者都区别于把历史压成定长向量的早期序列做法。",
  "code": "import numpy as np\n\ndef din_attention(target_ad, user_hist, W):\n    # target_ad: (d,) 候选; user_hist: (T, d) 用户行为序列\n    scores = []\n    for h in user_hist:\n        feat = np.concatenate([h, target_ad, h * target_ad])\n        scores.append(W @ feat)            # 局部相关性打分\n    a = np.exp(scores) / np.sum(np.exp(scores))\n    return a @ user_hist                   # 加权局部兴趣向量\n\ndef augru_update(h_prev, x_t, a_t):\n    # AUGRU: 用注意力 a_t 门控更新, 抑制无关历史对演化的干扰\n    z = _sigmoid(W_z @ np.concatenate([h_prev, x_t]))\n    h = (1 - z) * h_prev + z * x_t\n    return a_t * h + (1 - a_t) * h_prev    # 注意力加权演化",
  "complexity": "DIN: O(T·d)；DIEN: O(T·d·L)，T 历史长度、L 为 GRU 步",
  "beginnerSummary": "普通做法把你的浏览历史压成一坨固定印象；DIN 像看到\"运动鞋\"广告时，自动翻出你买过的鞋类记录重点参考，其它记录暂时靠边。",
  "explanationFocus": "是什么：DIN(Deep Interest Network)是一类用候选物品对用户在行为序列上的注意力来\"激活\"局部兴趣的 CTR 模型；DIEN 在 DIN 之上引入 GRU/AUGRU 序列建模，刻画兴趣随时间的演化。",
  "approach": "DIN 用 candidate 与每个历史行为算注意力再加权求和得兴趣向量；DIEN 先用 GRU 抽兴趣序列、用 AUGRU 以注意力门控演化，注意力作用在演化后兴趣上。",
  "derivation": [
    "为什么需要：用户兴趣多样且随候选不同侧重不同，定长向量压扁会丢局部信号。",
    "怎么实现：DIN 注意力 a_i∝f(h_i, target)；DIEN 加 GRU 抽兴趣、AUGRU 用 a_t 门控更新。",
    "有什么代价：序列长度 T 大时计算与显存上升，需要截断或兴趣抽取降采样。",
    "怎么评测：AUC/GAUC(按用户分组)、对比 pooled 序列基线看 CTR 增益。"
  ],
  "edgeCases": [
    "新用户历史为空(T=0)，需回退到全局平均 embedding 或冷启动向量。",
    "历史含大量无关行为，注意力若过软会稀释目标兴趣，需温度系数调。",
    "序列过长(数千行为)需截断或分层采样，否则 O(T) 拖慢训练。"
  ],
  "pitfalls": [
    "注意力只用历史自身相似度而忽略候选，退化成自注意力而非 target attention。",
    "DIEN 把 GRU 隐状态直接当注意力 key，未做兴趣抽取层导致演化噪声大。"
  ],
  "prerequisites": [
    "注意力机制(Attention)基础",
    "用户行为序列与 embedding 表示"
  ],
  "workedExample": [
    "用户历史 T=50，候选为\"运动鞋\"广告；DIN 注意力后 8 个鞋类行为权重和达 0.62，其余 42 个权重和仅 0.38，局部兴趣被激活。",
    "DIEN 中 AUGRU 门控：某无关历史 a_t=0.05，其更新量仅 5% 进入兴趣演化，避免污染\"运动\"兴趣轨迹。"
  ],
  "lineByLine": [
    "def din_attention：对每个历史行为算与候选的相关性分数。",
    "feat = concat([h, target, h*target])：拼接原始与逐元素乘, 捕捉交叉。",
    "a = softmax(scores)：归一化得到注意力分布。",
    "def augru_update：用注意力 a_t 门控 GRU 更新, 抑制无关历史。"
  ],
  "followUps": [
    {
      "question": "DIN 和序列推荐(如 SASRec)的区别？",
      "answer": "DIN 是 candidate-aware 注意力、为每个候选重算兴趣，属 CTR 精排；SASRec 用自注意力从序列预测下一个 item，属序列召回/排序，不依赖外部候选。"
    },
    {
      "question": "AUGRU 相比普通 GRU 好在哪？",
      "answer": "AUGRU 用兴趣注意力 a_t 直接门控隐状态更新，无关历史几乎不推进演化，避免兴趣漂移被噪声行为带偏。"
    }
  ],
  "followUpAnswers": [
    "DIN 是 candidate-aware 注意力、为每个候选重算兴趣，属 CTR 精排；SASRec 用自注意力从序列预测下一个 item，属序列召回/排序，不依赖外部候选。",
    "AUGRU 用兴趣注意力 a_t 直接门控隐状态更新，无关历史几乎不推进演化，避免兴趣漂移被噪声行为带偏。"
  ],
  "order": 12
};
