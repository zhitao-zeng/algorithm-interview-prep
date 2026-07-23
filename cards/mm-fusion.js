export default {
  "kind": "concept",
  "id": "mm-fusion",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "多模态融合方式",
  "prompt": "多模态融合里的 early fusion 和 late fusion 有什么区别，各自适合什么？",
  "quickAnswer": "Early fusion 在特征层就把多模态拼到一起联合编码(如把视觉 token 与文本 token 一起进 Transformer)，交互早、语义融合深但需对齐且算力高；Late fusion 各模态独立编码、最后再融合决策(拼接/加权/投票)，工程解耦、鲁棒但跨模态交互浅。多模态 LLM 多用 early fusion(统一 token 序列)。",
  "approach": "early=特征级联合编码；late=决策级后融合。",
  "explanationFocus": "是什么：多模态融合指把多个模态的信息合并成统一表征或决策，分\"早期特征融合(early)\"与\"晚期决策融合(late)\"。",
  "bruteForce": "只取最强单模态硬决策：丢互补信息。",
  "derivation": [
    "为什么需要：单模态信息不全，融合可互补(图给外观、文给语义)，提升鲁棒与精度。",
    "怎么实现：early 在嵌入层 concat/attention 联合；late 各塔出表征或 logits 后加权/注意力/投票融合。",
    "有什么代价：early 需模态对齐且序列变长、算力高；late 交互浅、错过细粒度跨模态推理。",
    "怎么评测：对比融合后在多模态任务上的精度、鲁棒性与延迟。"
  ],
  "invariant": "无论早/晚融合，最终决策应同时用到各模态有效信号。",
  "walkthrough": "LLaVA 把 576 视觉 token 与文本 token 一起进 7B Transformer(early)；传统 VQA 可各编码后接分类头(late)。",
  "edgeCases": [
    "模态缺失：late 可降级，early 需 mask。",
    "模态冲突：需加权或注意力裁决。",
    "长序列 early fusion 算力爆炸。"
  ],
  "code": "def early_fusion(v_tokens, t_tokens, model):\n    return model(concat([v_tokens, t_tokens], dim=1))   # 联合编码\n\ndef late_fusion(logits_v, logits_t, w):\n    return w * logits_v + (1 - w) * logits_t             # 决策级加权",
  "codeNotes": [
    "early 融合交互深但贵。",
    "late 融合解耦、易扩展新模态。"
  ],
  "complexity": "early O((V+T)^2)；late 各 O(V^2)+O(T^2) 再加轻量融合。",
  "followUps": [
    {
      "question": "多模态 LLM 为什么多用语义 early fusion？",
      "answer": "因为统一 token 序列让 Transformer 注意力天然做细粒度跨模态交互，比 late 融合更会推理。"
    },
    {
      "question": "模态缺失时怎么处理？",
      "answer": "late 融合可直接去掉该路；early 融合需对缺失模态做 mask/零向量并保持位置一致。"
    }
  ],
  "followUpAnswers": [
    "注意力天然跨模态交互。",
    "late 直接去路，early 需 mask。"
  ],
  "pitfalls": [
    "认为 late 融合永远省算力而忽略交互损失。",
    "early 融合未对齐就拼接导致噪声。"
  ],
  "beginnerSummary": "融合就像小组合作写报告。early fusion 是大家一开始就坐一起边聊边写(交流深但占会议室)；late fusion 是各自写好再拼(省事、某人缺席也不崩，但容易各说各话)。大模型常用\"坐一起写\"的方式。",
  "prerequisites": [
    "多模态信息可互补。",
    "融合可在特征或决策层做。",
    "需权衡交互深度与算力。"
  ],
  "workedExample": [
    "early: 视觉+文本 token 同进 Transformer。",
    "late: 两塔出 logits 后加权。"
  ],
  "lineByLine": [
    "确定融合层级(特征/决策)。",
    "early 在嵌入层拼接联合编码。",
    "late 各编码后加权/投票。",
    "评估融合后任务表现与开销。"
  ],
  "diagram": "early: 视觉─┐\n             ├─▶ 联合 Transformer ─▶ 输出\n       文本─┘\nlate:  视觉─▶塔─┐\n                ├─▶ 加权/投票 ─▶ 决策\n       文本─▶塔─┘"
};
