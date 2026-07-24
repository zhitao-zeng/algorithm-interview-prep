export default {
  "kind": "concept",
  "id": "rec-metrics",
  "category": "搜索推荐",
  "difficulty": "Easy",
  "title": "推荐系统评测指标（AUC / GAUC / Recall）",
  "prompt": "推荐系统常用的评测指标 AUC / GAUC / Recall 是什么？",
  "quickAnswer": "AUC 衡量模型对\"正负样本对\"排序的能力(与阈值无关)，但混了全体用户；GAUC 按用户分组算 AUC 再按曝光加权，更贴个性化；Recall@K 看相关物品有多少进了前 K 候选，衡量召回覆盖。三者分别评\"排序质量/个性化排序/召回覆盖\"。",
  "approach": "AUC 全局排序能力 → GAUC 用户级加权 → Recall@K 召回覆盖。",
  "explanationFocus": "是什么：AUC 评模型整体排序能力，GAUC 评每个用户内的个性化排序(按曝光加权)，Recall@K 评召回把相关项捞回多少。",
  "bruteForce": "只看整体准确率：忽略排序与用户差异，掩盖个性化差。",
  "derivation": [
    "为什么需要：推荐关心\"把相关排前面\"和\"个性化\"，单点准确率不够。",
    "怎么实现：AUC 随机正负对排序正确率；GAUC=Σ_u w_u·AUC_u；Recall@K=|相关∩前K|/|相关|。",
    "有什么代价：AUC 对活跃用户主导、易被刷；GAUC 需分用户；Recall 依赖相关集定义。",
    "怎么评测：离线 AUC/GAUC 看排序，Recall@K 看召回，再结合线上 AB。"
  ],
  "invariant": "GAUC 是 AUC 在\"每用户内\"的加权平均，消除用户量差异。",
  "walkthrough": "100万样本 AUC=0.78；按用户算 GAUC(曝光加权)=0.71；召回 top500 命中 82% 相关物品。",
  "edgeCases": [
    "AUC 高但个性化差：需看 GAUC。",
    "相关集不全：Recall 低估。",
    "样本不均：AUC 偏活跃用户。"
  ],
  "code": "# Python\ndef gauc(scores_by_user, weights):\n    return sum(w*auc(s) for w,s in scores_by_user.items()) / sum(weights)\ndef recall_at_k(relevant, topk):\n    return len(relevant & set(topk)) / max(1, len(relevant))",
  "codeNotes": [
    "GAUC 按曝光加权用户 AUC。",
    "Recall@K 看召回覆盖。"
  ],
  "complexity": "AUC O(n log n) 排序；GAUC 同；Recall O(K+相关集)。",
  "followUps": [
    {
      "question": "为什么有了 AUC 还要 GAUC？",
      "answer": "AUC 把所有用户混在一起，被活跃用户主导；GAUC 先在每个用户内算 AUC 再按曝光加权，更反映\"对每个人的排序是否准\"，契合个性化。"
    },
    {
      "question": "Recall@K 的 K 怎么定？",
      "answer": "K 对应召回要传给下游的候选数(如 500)，Recall@K 即相关物品有多少落在这些候选里，衡量召回漏没漏。"
    }
  ],
  "followUpAnswers": [
    "GAUC 消除用户量偏差。",
    "Recall@K 看召回覆盖。"
  ],
  "pitfalls": [
    "只报 AUC 忽视个性化(GAUC)。",
    "相关集定义不清致 Recall 失真。"
  ],
  "beginnerSummary": "AUC 像\"总体考试排名能力\"：随机抽一个答对的和一个答错的，模型能否把答对的排前面。但它被学霸(活跃用户)带偏。GAUC 是\"给每个同学单独排名再按工作量加权\"，更公平看对每个人的准。Recall@K 则是\"该推荐的真正好东西，有几成进了你最终看到的 K 个里\"。",
  "prerequisites": [
    "推荐关心排序与个性化。",
    "需覆盖与排序两类指标。",
    "离线指标需对应用户体验。"
  ],
  "workedExample": [
    "全局 AUC=0.78，GAUC=0.71。",
    "召回 top500 命中 82% 相关。"
  ],
  "lineByLine": [
    "算随机正负对排序正确率得 AUC。",
    "按用户分组算各自 AUC。",
    "曝光加权得 GAUC。",
    "统计相关项落入 topK 比例得 Recall。"
  ],
  "diagram": "样本 ─▶ AUC(全局排序)\n用户分组 ─▶ AUC_u ─▶ 加权 ─▶ GAUC\n相关集 ∩ topK ─▶ Recall@K"
};
