export default {
  "id": "rs-multi-task",
  "kind": "concept",
  "category": "推荐系统",
  "title": "多目标排序：MMoE 与 ESMM",
  "difficulty": "Hard",
  "prompt": "多目标排序如何同时优化点击率(CTR)与转化率(CVR)？MMoE 用多专家共享解决了什么，ESMM 又如何用全空间建模缓解样本选择偏差？",
  "quickAnswer": "多目标排序用共享表示+多塔分别预测各目标。MMoE 用多个专家网络加门控让各任务按需取用，缓解跷跷板；ESMM 在\"曝光→点击→转化\"全空间用 pCTCVR=pCTR·pCVR 训练，避免 CVR 只在点击空间训练的偏差。",
  "code": "import numpy as np\n\ndef mmoe_gate(x, experts, task_W):\n    # 每个任务有独立门控，对专家输出加权\n    gate = softmax(task_W @ x)\n    out = sum(g * e(x) for g, e in zip(gate, experts))\n    return out\n\ndef esmm(p_ctr, p_cvr):\n    # 全空间：p(点击且转化) = pCTR * pCVR\n    return p_ctr * p_cvr\n\ndef softmax(x):\n    e = np.exp(x - x.max())\n    return e / e.sum()",
  "complexity": "训练 O(专家数·单塔) 略高于单任务",
  "beginnerSummary": "一个模型同时管\"点不点\"和\"买不买\"两件事；MMoE 像几个专家顾问，不同任务挑不同顾问；ESMM 则把\"点击后转化\"放在全部曝光里算，避免只看点过的人。",
  "explanationFocus": "是什么：多目标排序指在一个模型里同时预估多个业务目标(如 CTR、CVR、时长)并融合排序；MMoE 用多专家+门控实现任务间软共享，ESMM 在转化链路全空间建模以纠正样本选择偏差。",
  "approach": "MMoE 多个专家网络输出经各任务门控加权融合再各自塔预测；ESMM 共享底层，主塔预测 pCTR、辅塔预测 pCVR，用 pCTR·pCVR 直接监督 pCTCVR(全空间曝光样本都有 label)。",
  "derivation": [
    "为什么需要：单目标(只优化 CTR)会推高点击低转化内容，需多目标兼顾。",
    "怎么实现：MMoE 多专家+门控；ESMM 在全空间用乘积分解训练 CVR。",
    "有什么代价：多目标融合权重需调且随业务变；任务冲突时仍可能跷跷板。",
    "怎么评测：分目标看 AUC；线上看 GMV/留存；用帕累托前沿衡量取舍。"
  ],
  "edgeCases": [
    "某目标样本极少(如转化)需加权或全空间建模(ESMM)。",
    "任务完全冲突时门控失效，需 MMoE 变体或 PCGrad。",
    "融合权重静态拍脑袋，应随场景/用户分群自适应。"
  ],
  "pitfalls": [
    "把 CVR 直接在点击样本上训，曝光未点击样本丢失→样本选择偏差(ESMM 解法)。",
    "多目标直接等权求和，忽略目标量级差异导致某目标主导。"
  ],
  "prerequisites": [
    "多任务学习与门控网络",
    "转化漏斗与样本选择偏差"
  ],
  "workedExample": [
    "ESMM：曝光1000中点击100、转化10；pCTR=0.1, pCVR=0.1, pCTCVR=0.01，用全部1000曝光样本监督，避免只在100点击样本估CVR的偏差。",
    "MMoE 8专家2任务，门控对 CTR 任务权重 [0.3,0.1,0.6,...]，对 CVR 任务权重不同，任务间 AUC 均提升约 1.2%。"
  ],
  "lineByLine": [
    "def mmoe_gate：对各专家输出做任务专属门控加权。",
    "gate = softmax(task_W @ x)：每个任务学一个独立门控分布。",
    "out = sum(g * e(x) for ...)：按门控聚合专家，任务各取所需。",
    "def esmm：pCTCVR = pCTR * pCVR 在全空间直接监督。"
  ],
  "followUps": [
    {
      "question": "MMoE 怎么缓解跷跷板效应？",
      "answer": "硬共享底层会让冲突任务互相拖累(此消彼长)；MMoE 用多个专家+门控让各任务选择性利用专家，冲突任务可走不同专家组合，从而减少负迁移。"
    },
    {
      "question": "ESMM 为什么比单独训 CVR 好？",
      "answer": "单独训 CVR 只在点击样本上，丢失了海量曝光未点击样本且引入选择偏差；ESMM 在全空间用 pCTR·pCVR 监督 pCTCVR，所有曝光都有 label，训练更充分更无偏。"
    }
  ],
  "followUpAnswers": [
    "硬共享底层会让冲突任务互相拖累(此消彼长)；MMoE 用多个专家+门控让各任务选择性利用专家，冲突任务可走不同专家组合，从而减少负迁移。",
    "单独训 CVR 只在点击样本上，丢失了海量曝光未点击样本且引入选择偏差；ESMM 在全空间用 pCTR·pCVR 监督 pCTCVR，所有曝光都有 label，训练更充分更无偏。"
  ],
  "order": 6
};
