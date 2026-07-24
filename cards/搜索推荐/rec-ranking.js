export default {
  "kind": "concept",
  "id": "rec-ranking",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "精排（Ranking）模型",
  "prompt": "推荐系统的精排（ranking）模型是什么？",
  "quickAnswer": "精排是漏斗最后一级，用表达力最强的模型（DeepFM、DIN、DIEN、MMoE 等）对少量候选（几十）精确预估 CTR/CVR/时长等多目标分数并按组合公式排序。它充分做用户-物品特征交叉，追求精度；代价是重、只能吃少量候选，依赖上游缩窄。",
  "approach": "候选(几十) → 重模型特征交叉 → 多目标预估 → 融合公式排序。",
  "explanationFocus": "是什么：精排用最重的模型对上游留下的少量候选做精细打分，充分交叉用户与物品特征，直接决定最终展示顺序。",
  "bruteForce": "对所有候选都上精排重模型：算力爆炸，延迟不达标。",
  "derivation": [
    "为什么需要：最终顺序直接影响点击与营收，必须在小候选集上追求极致精度。",
    "怎么实现：拼接用户/上下文/物品特征，经embedding+MLP，加 FM/Attention 做交叉，输出多目标 logits。",
    "有什么代价：模型深、特征多、推理慢；只能处理上游缩窄后的少量候选。",
    "怎么评测：离线 AUC/GAUC，线上 AB 看 CTR、CVR、时长、营收。"
  ],
  "invariant": "精排对相同(用户,物品)输入给出确定、可复现的预估分。",
  "walkthrough": "粗排给 200 → 精排 DeepFM 逐条算 pCTR、pCVR → 按 pCTR*CVR*price 排序取 top。",
  "edgeCases": [
    "特征穿越：训练用未来特征导致线下虚高。",
    "置信度校准：预估分需校准才能直接相乘。",
    "候选极少时精排仍要稳定。"
  ],
  "code": "# Python\ndef rank(cands, user, model, Calib):\n    out = []\n    for it in cands:\n        f = build_features(user, it)             # 特征交叉输入\n        pctr, pcvr = model(f)\n        score = Calib(pctr) * Calib(pcvr) * it.price\n        out.append((it, score))\n    return sorted(out, key=lambda x: -x[1])",
  "codeNotes": [
    "多目标分需校准后再融合。",
    "特征交叉是精排核心能力。"
  ],
  "complexity": "每候选 O(重模型前向)，总量=粗排输出数，故受上游严格约束。",
  "followUps": [
    {
      "question": "精排为什么能做到双塔做不到的特征交叉？",
      "answer": "精排把用户与物品特征拼在一起过同一网络，可在任意层交互；双塔在最后才点积，早期无法交叉。"
    },
    {
      "question": "多目标分数怎么合成一个排序分？",
      "answer": "常用 pCTR*pCVR*价格 等公式，或引入 MMoE 多塔各估一目标再用权重/ESMM 关联校准后融合。"
    }
  ],
  "followUpAnswers": [
    "精排充分交叉用户-物品特征。",
    "多目标需校准后融合。"
  ],
  "pitfalls": [
    "把精排直接用于全量召回(算力不可行)。",
    "未校准分数直接相乘，权重失真。"
  ],
  "beginnerSummary": "精排就是最终拍板的\"用人经理\"：只面对初筛后几十个候选人，会深挖简历、和岗位要求逐条比对(特征交叉)，给出最靠谱的录用排序。它看得最细，但太慢，所以前面必须有召回和粗排先替它缩小范围。",
  "prerequisites": [
    "上游已把候选缩到可精排的量。",
    "特征交叉能显著提升精度。",
    "多目标需统一成排序分。"
  ],
  "workedExample": [
    "粗排 200 候选进精排。",
    "DeepFM 算 pCTR/pCVR 排序取 top。"
  ],
  "lineByLine": [
    "为候选构造交叉特征。",
    "重模型预估多目标。",
    "校准并融合成单分。",
    "按分排序出最终序。"
  ],
  "diagram": "候选(几十)\n   │ 特征交叉(DeepFM/DIN)\n   ▼\n pCTR,pCVR ─▶ 校准融合 ─▶ 排序 ─▶ 最终序"
};
