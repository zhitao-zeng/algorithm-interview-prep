export default {
  "id": "rs-debias",
  "kind": "concept",
  "category": "推荐系统",
  "title": "偏置与去偏：位置/选择/流行度偏置",
  "difficulty": "Hard",
  "prompt": "推荐模型训练中存在哪些偏置？位置偏置(PAL)、选择偏置与流行度偏置分别如何用因果/倾向建模来纠正？",
  "quickAnswer": "常见偏置有位置(靠前的更易被点)、选择(只看曝光样本)、流行度(爆款被过度推)。位置偏置用 PAL 把位置效应建模为独立倾向项；选择偏置用 IPS/ESMM 全空间；流行度偏置靠降权或因果去混杂。",
  "code": "import numpy as np\n\ndef pal_click(content_score, pos_propensity):\n    # 位置偏置分解：点击概率 = 内容分 × 位置倾向\n    return content_score * pos_propensity\n\ndef ips_weight(propensity, clip=5.0):\n    # 选择偏置：逆倾向得分加权，剪裁控方差\n    return min(1.0 / max(propensity, 1e-3), clip)",
  "complexity": "IPS 引入方差，需剪裁/正则",
  "beginnerSummary": "排在第一位的东西更容易被点，不代表它更好——这是\"位置作弊\"。去偏就是把\"它排第几\"这个干扰因素从模型里剥掉。",
  "explanationFocus": "是什么：偏置指训练数据分布与真实兴趣分布不一致，导致模型学到的是\"曝光机制\"而非\"用户偏好\"；位置、选择、流行度是最典型的三类，需以因果/倾向得分纠正。",
  "approach": "PAL 把点击概率拆成内容分×位置倾向，位置项在 serving 时置为固定；选择偏置用 IPS 以倾向得分逆加权或 ESMM 全空间；流行度偏置通过对抗训练/降权去混杂。",
  "derivation": [
    "为什么需要：观察数据被曝光机制污染，直接监督会复刻偏置。",
    "怎么实现：PAL 分离位置倾向；IPS 用 1/propensity 重加权无偏估计。",
    "有什么代价：IPS 方差大需剪裁；倾向估计本身也有偏。",
    "怎么评测：在随机流量(无偏)上验证，或看去偏后长尾曝光占比提升。"
  ],
  "edgeCases": [
    "位置1与位置末点击率差 10 倍，不纠偏模型会高估靠前内容。",
    "倾向得分极端小→IPS 权重爆炸，需剪裁到上限。",
    "新物品无曝光历史，倾向估计不稳。"
  ],
  "pitfalls": [
    "把位置当作特征喂入主模型却不分离，serving 时仍带位置偏置。",
    "IPS 直接用于高方差场景不剪裁，训练震荡。"
  ],
  "prerequisites": [
    "因果推断与倾向得分",
    "曝光-点击观测偏差"
  ],
  "workedExample": [
    "PAL：真实点击 0.2，但当位置=1 时观测点击 0.35，位置倾向 p(位置=1)=0.35/0.2=1.75；serving 置位置项为 1 即去掉位置增益。",
    "IPS：某样本曝光倾向 0.1，则权重 1/0.1=10 并剪裁到 5，无偏估计加权后 AUC 提升 0.8%。"
  ],
  "lineByLine": [
    "def pal_click：点击概率分解为内容分与位置倾向的乘积。",
    "p_click = content_score * pos_propensity：把位置效应显式分离。",
    "def ips_weight：用倾向得分逆加权纠正选择偏置。",
    "w = min(1/propensity, clip)：剪裁防止极端权重导致方差爆炸。"
  ],
  "followUps": [
    {
      "question": "PAL 在线上 serving 时怎么去掉位置影响？",
      "answer": "训练时把位置倾向作为独立因子与内容分相乘，线上推断把位置项固定为\"标准位置\"(如置 1 或平均位置倾向)，使打分只反映内容本身，消除排序位置带来的不公平。"
    },
    {
      "question": "IPS 和 ESMM 去选择偏置有何区别？",
      "answer": "IPS 用逆倾向得分对样本重加权，是无偏估计但方差大需剪裁；ESMM 从建模角度在全空间定义 pCTCVR=pCTR·pCVR，让所有曝光样本都可监督 CVR，不必显式估倾向，更稳。"
    }
  ],
  "followUpAnswers": [
    "训练时把位置倾向作为独立因子与内容分相乘，线上推断把位置项固定为\"标准位置\"(如置 1 或平均位置倾向)，使打分只反映内容本身，消除排序位置带来的不公平。",
    "IPS 用逆倾向得分对样本重加权，是无偏估计但方差大需剪裁；ESMM 从建模角度在全空间定义 pCTCVR=pCTR·pCVR，让所有曝光样本都可监督 CVR，不必显式估倾向，更稳。"
  ],
  "order": 8
};
