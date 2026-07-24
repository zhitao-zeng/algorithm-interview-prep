export default {
  "kind": "concept",
  "id": "rec-din-deepfm",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "排序模型 DIN / DeepFM / 序列建模",
  "prompt": "推荐排序里的 DIN / DeepFM / 序列建模分别是什么？",
  "quickAnswer": "DeepFM 用 FM 显式做二阶特征交叉 + DNN 学高阶交叉，兼顾低阶与高阶；DIN（深度兴趣网络）用 Attention 让用户历史行为对\"当前候选物品\"加权，捕捉局部兴趣；序列建模(DIEN/Transformer)把行为当时序序列学兴趣演化。三者都针对\"用户-物品交叉\"，是精排主力。",
  "approach": "DeepFM(FM+DNN 交叉) / DIN(候选感知attention) / 序列(时序兴趣) → 多目标预估。",
  "explanationFocus": "是什么：DeepFM 做特征交叉、DIN 做候选感知的兴趣注意力、序列模型学兴趣演化，都是精排中强化用户-物品交互的模型。",
  "bruteForce": "只用普通 MLP 把特征拼一起：学不到显式交叉，表达力不足。",
  "derivation": [
    "为什么需要：精排要充分利用用户-物品交叉，普通拼接丢失组合信号。",
    "怎么实现：DeepFM 并联 FM 与 DNN 共享 embedding；DIN 以候选为 query 对行为序列做 attention 再聚合；序列模型用 GRU/Transformer 建模演化。",
    "有什么代价：序列/attention 增加计算与延迟；DIN 需存长行为序列。",
    "怎么评测：离线 AUC/GAUC，线上 CTR/CVR/时长。"
  ],
  "invariant": "对相同(用户,物品)输入，交叉/注意力结果确定可复现。",
  "walkthrough": "用户 50 条行为 + 候选物品 → DIN attention 得兴趣向量 → 与物品拼入 DNN 估 pCTR。",
  "edgeCases": [
    "行为序列过长：截断或分层采样。",
    "候选稀疏：attention 权重退化。",
    "序列噪声：需兴趣抽取(DIEN)。"
  ],
  "code": "# Python (DIN 思路)\ndef din(user_behavior, item, mlp):\n    w = [attention(b, item) for b in user_behavior]  # 候选感知权重\n    interest = sum(wi*emb(bi) for wi,bi in zip(w,user_behavior))\n    return mlp(concat(interest, item.emb))            # 兴趣×物品交叉",
  "codeNotes": [
    "attention 让兴趣随候选变。",
    "DeepFM 用 FM 做显式交叉。"
  ],
  "complexity": "DIN O(序列长·d)；DeepFM O(特征² + DNN)；序列模型随长度增。",
  "followUps": [
    {
      "question": "DIN 相比普通 embedding 平均好在哪？",
      "answer": "普通做法把用户兴趣压成定长向量，忽略当前候选；DIN 用候选当 query 对行为加权，不同候选看到不同\"兴趣侧写\"，更准。"
    },
    {
      "question": "FM 和 DNN 在 DeepFM 里各管什么？",
      "answer": "FM 显式建模任意两两特征交叉(低阶、可解释)，DNN 学高阶非线性交叉，二者共享 embedding 并行输出相加。"
    }
  ],
  "followUpAnswers": [
    "DIN 候选感知兴趣。",
    "FM 做显式二阶交叉。"
  ],
  "pitfalls": [
    "把行为序列无差别平均，丢局部兴趣。",
    "只上 DNN 忽视显式交叉。"
  ],
  "beginnerSummary": "给\"你\"和\"某件商品\"配对时：DeepFM 像既看两人单独条件、又看任意两两组合(年龄×类目)的匹配表；DIN 像根据你\"当前看中这件\"回头翻你历史——你买过类似的就重点参考，不相关的忽略；序列模型则看你兴趣怎么随时间变。三者都让\"你配不配这件\"算得更细。",
  "prerequisites": [
    "精排需强特征交叉。",
    "用户兴趣随候选/时间变。",
    "行为序列蕴含兴趣信号。"
  ],
  "workedExample": [
    "DIN 用候选对 50 条行为做 attention。",
    "DeepFM 共享 embedding 做 FM+DNN 交叉。"
  ],
  "lineByLine": [
    "候选当 query 算行为权重。",
    "加权聚合得兴趣向量。",
    "与物品特征交叉入 DNN。",
    "输出多目标预估分。"
  ],
  "diagram": "用户行为序列 ─▶ attention(候选为Q) ─▶ 兴趣向量\n                                          × 物品向量 ─▶ DNN ─▶ pCTR"
};
