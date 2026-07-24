export default {
  "kind": "concept",
  "id": "rec-multiobjective",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "多目标（CTR / CVR / 时长）建模",
  "prompt": "推荐系统的多目标（CTR / CVR / 时长）建模是什么？",
  "quickAnswer": "多目标建模是同时预估多个指标（点击率、转化率、观看/阅读时长等）再融合成最终排序分。常用共享底层(Shared-Bottom)+多专家(MMoE)分塔各估一目标，避免单目标偏科；融合用 pCTR×pCVR×价格 或加权求和，并做目标间帕累托权衡。",
  "approach": "共享表征 + 多专家塔 → 各目标分 → 融合公式/权重排序。",
  "explanationFocus": "是什么：多目标建模用一个模型同时学 CTR、CVR、时长等多个目标，各出一分到融合公式里，避免只优化点击却伤转化或时长。",
  "bruteForce": "只优化 CTR：标题党霸屏，转化与时长崩，长期留存掉。",
  "derivation": [
    "为什么需要：业务关心点击+转化+时长+留存，单一目标会牺牲其他。",
    "怎么实现：Shared-Bottom 或 MMoE 多专家共享底层、各目标独立塔；ESMM 用 pCTR×pCVR 间接估 CVR 解样本选择偏差。",
    "有什么代价：目标间冲突(点击vs时长)需权衡；融合权重难调、随场景变。",
    "怎么评测：各目标独立离线指标 + 线上综合 AB(营收/时长/留存)。"
  ],
  "invariant": "融合后的排序分需对各目标方向单调，且权重可解释可调。",
  "walkthrough": "同底层出 pCTR、pCVR、pStay → 分=0.6*pCTR+0.3*pCVR+0.1*pStay，线上按场景调权重。",
  "edgeCases": [
    "目标冲突：高点击低转化。",
    "CVR 样本选择偏差：用 ESMM。",
    "权重固定不通用：需分场景。"
  ],
  "code": "# Python\ndef multi_target(feat, mmoe):\n    pctr, pcvr, pstay = mmoe(feat)          # 多塔各估\n    return 0.6*pctr + 0.3*pcvr + 0.1*pstay  # 融合",
  "codeNotes": [
    "MMoE 让各目标学专属专家。",
    "ESMM 解 CVR 样本偏差。"
  ],
  "complexity": "训练 O(样本·(共享+多塔))；推理 O(单样本多塔前向)，受候选数约束。",
  "followUps": [
    {
      "question": "MMoE 相比多任务共享底层好在哪？",
      "answer": "Shared-Bottom 所有任务抢同一底层易冲突；MMoE 用多个专家门控，各任务选不同专家组合，缓解负迁移。"
    },
    {
      "question": "CVR 为什么不能直接像 CTR 那样训？",
      "answer": "CVR 只在\"点击\"后有 label，未点击样本无转化标签，直接训练有样本选择偏差；ESMM 改估 pCTR×pCVR 在全曝光上训练来规避。"
    }
  ],
  "followUpAnswers": [
    "MMoE 缓解任务冲突。",
    "ESMM 间接估 CVR。"
  ],
  "pitfalls": [
    "只优化单目标伤其他指标。",
    "融合权重写死不调场景。"
  ],
  "beginnerSummary": "老板要的不是一个指标：既想你\"点多\"(点击)、又想你\"买下\"(转化)、还想你\"看久\"(时长)。多目标建模就像招一个团队，底层共享常识，但专人分别盯点击、转化、时长，最后按\"综合 KPI\"加权排名。只顾点击会招来标题党，综合 KPI 才健康。",
  "prerequisites": [
    "业务有多指标诉求。",
    "目标间可能冲突。",
    "多目标需统一融合。"
  ],
  "workedExample": [
    "MMoE 同底层出三目标分。",
    "加权融合排序，权重分场景调。"
  ],
  "lineByLine": [
    "共享底层提表征。",
    "多专家塔各估目标。",
    "输出 pCTR/pCVR/pStay。",
    "加权融合成排序分。"
  ],
  "diagram": "特征\n  │ 共享底层\n  ├─专家A─▶ pCTR\n  ├─专家B─▶ pCVR   ─▶ 融合 ─▶ 排序\n  └─专家C─▶ pStay"
};
