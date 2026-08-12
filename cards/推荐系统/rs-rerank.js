export default {
  "id": "rs-rerank",
  "kind": "concept",
  "category": "推荐系统",
  "title": "重排与多样性：MMR、DPP 与 Listwise",
  "difficulty": "Hard",
  "prompt": "精排之后为何还要重排？MMR、DPP 与 LambdaMART 分别是如何在相关性与多样性/新鲜度之间做平衡的？",
  "quickAnswer": "重排在精排 Top 候选上做列表级优化，纠正精排逐点/逐对忽略的多样性与业务约束。MMR 贪心加边际相关-冗余项；DPP 用行列式刻画质量与多样性；LambdaMART 是 listwise 树模型直接优化 NDCG。",
  "code": "import numpy as np\n\ndef mmr_select(candidates, sim_matrix, rel, lam=0.7, k=10):\n    # 最大边际相关：相关高且彼此不冗余\n    selected, pool = [], list(range(len(candidates)))\n    while len(selected) < k and pool:\n        best = max(pool, key=lambda i: lam * rel[i]\n                   - (1 - lam) * max([sim_matrix[i][j] for j in selected], default=0))\n        selected.append(best); pool.remove(best)\n    return selected\n\ndef dpp_det(L):\n    # 行列式越大：质量与多样性越均衡\n    return float(np.linalg.det(L))",
  "complexity": "MMR O(K²)；DPP 最大后验 O(K³)",
  "beginnerSummary": "精排像给每道菜单独打分，重排像摆一桌宴席——不能全是红烧肉，要荤素搭配、冷热交替才舒服。",
  "explanationFocus": "是什么：重排(rerank)是级联架构最后一步，对精排产出的候选列表做整体优化，兼顾相关性、多样性、新鲜度与业务约束(打散/去重)，输出最终曝光序列。",
  "approach": "MMR 贪心选\"相关高且彼此不冗余\"的条目；DPP 用核矩阵行列式同时建模质量与多样性做 MAP 推断；LambdaMART 等 listwise 模型直接以 NDCG 为目标训练排序。",
  "derivation": [
    "为什么需要：精排逐点打分易推同质内容，损害多样性与体验。",
    "怎么实现：MMR 用 λ·rel-(1-λ)·max_sim；DPP 最大化 det(L) 平衡质量与差异。",
    "有什么代价：列表级优化计算随 K 增大，需近似；约束多时难求最优。",
    "怎么评测：看 ILS/覆盖率(多样性)、NDCG(相关)、线上时长与互动。"
  ],
  "edgeCases": [
    "列表需强制打散同类目(如连续视频不超2)，MMR 需加硬约束。",
    "DPP 核矩阵半正定需正则防 det=0。",
    "业务强约束(版权/合规)优先于模型分。"
  ],
  "pitfalls": [
    "过度追求多样性牺牲相关性，核心 CTR 下跌。",
    "MMR 贪心次优，长列表多样性不足。"
  ],
  "prerequisites": [
    "列表级排序度量(NDCG/ILS)",
    "行列式点与子模性"
  ],
  "workedExample": [
    "MMR：λ=0.7，候选 A 相关0.9相似B0.8、C0.1；先选A，再算 B=0.7*0.85-0.3*0.8=0.355，C=0.7*0.8-0.3*0.1=0.53→选C提升多样性。",
    "DPP：3 物品核矩阵 det(L)=0.42 优于纯相关Top3的0.18，覆盖更多类目。"
  ],
  "lineByLine": [
    "def mmr_select：贪心选边际收益最大(相关减冗余)的条目。",
    "redundancy = max(sim(selected, c))：与已选集合的最大相似度。",
    "score = λ*rel - (1-λ)*redundancy：平衡相关性与冗余度。",
    "def dpp_det：核矩阵行列式越大代表质量与多样性越均衡。"
  ],
  "followUps": [
    {
      "question": "DPP 相比 MMR 强在哪？",
      "answer": "MMR 是贪心、只看与已选项的成对冗余，次优且忽略集合整体结构；DPP 用行列式同时刻画\"质量\"(对角)与\"多样性\"(非对角)，在集合级做更优的多样性-相关权衡。"
    },
    {
      "question": "LambdaMART 是 listwise 为什么也算重排？",
      "answer": "LambdaMART 是梯度提升树直接以列表级指标 NDCG 为优化目标，能利用整列候选的相对顺序信息，常作为重排阶段的学习排序模型，比逐点/逐对更贴合最终列表质量。"
    }
  ],
  "followUpAnswers": [
    "MMR 是贪心、只看与已选项的成对冗余，次优且忽略集合整体结构；DPP 用行列式同时刻画\"质量\"(对角)与\"多样性\"(非对角)，在集合级做更优的多样性-相关权衡。",
    "LambdaMART 是梯度提升树直接以列表级指标 NDCG 为优化目标，能利用整列候选的相对顺序信息，常作为重排阶段的学习排序模型，比逐点/逐对更贴合最终列表质量。"
  ],
  "order": 9
};
