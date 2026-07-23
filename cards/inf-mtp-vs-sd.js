export default {
  "kind": "concept",
  "id": "inf-mtp-vs-sd",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "Multi-Token Prediction（MTP）与 Speculative Decoding 有什么区别？",
  "prompt": "Multi-Token Prediction（MTP）与 Speculative Decoding 有什么区别？MTP 本身一定带来推理加速吗？",
  "quickAnswer": "MTP 是训练目标：让模型在训练时同时预测多个未来 token（多个预测头/层），使隐藏状态对未来更敏感；Speculative Decoding 是推理手段：用 Draft 模型提议、Target 模型并行验证以无损减少大模型步数。二者都可产出“候选 token”，但 MTP 首先是一种训练策略，要转化成实际推理加速还需配套的候选生成、并行验证与推理 Runtime；单有 MTP 训练目标本身不保证推理更快。",
  "approach": "区分“训练期目标(MTP)”与“推理期机制(SD)”；MTP 提供结构化候选，SD 提供无损验证框架，二者可结合（如用 MTP 头做 Draft）。",
  "explanationFocus": "是什么：MTP 改的是“模型怎么训练（多步前瞻）”，SD 改的是“怎么推理（草稿+验证）”；常被混为一谈。",
  "bruteForce": "只做标准下一 token 训练 + 仅 Target 自回归推理（无 MTP、无 SD）。",
  "derivation": [
    "为什么需要：标准 LM 只预测下一 token，隐藏状态对更远未来不敏感；推理又受 Decode 步数限制。",
    "MTP 怎么实现：在主干上增加若干预测模块，每个负责预测第 k 个未来 token，损失为各步预测的交叉熵之和。",
    "SD 怎么实现：Draft 提议 + Target 并行验证，见 SD 题。",
    "怎么评测：MTP 看训练收益与下游任务；结合 SD 后看接受率与端到端加速比。"
  ],
  "invariant": "MTP 是训练目标，不自带推理加速；要加速必须再接候选生成与并行验证（推理 Runtime）。",
  "walkthrough": "DeepSeek-V3 把 MTP 作为训练目标（同时用 MLA 与 MoE），使模型在训练时就对齐多步预测；若要在推理加速，需要用 MTP 模块产出候选、再由大模型（或自身）并行验证——这本质借用了 SD 的验证框架。",
  "edgeCases": [
    "只训练 MTP 但不改推理：推理仍是逐 token 自回归，无加速。",
    "MTP 候选被大模型大量拒绝：加速收益低，同 SD 接受率问题。",
    "与 Medusa/EAGLE 混淆：Medusa 加多个独立预测头、EAGLE 预测高层特征，都是“候选生成”方案，不等于 MTP 训练目标本身。"
  ],
  "code": "# Python\n# 概念示意: MTP 训练时多步预测头\ndef mtp_loss(logits_per_step, targets_per_step, weights=None):\n    # logits_per_step[k]: 预测第 k+1 个未来 token 的 logits\n    loss = 0.0\n    for k, (logit, tgt) in enumerate(zip(logits_per_step, targets_per_step)):\n        w = (weights or [1.0] * (k + 1))[k]\n        loss += w * cross_entropy(logit, tgt)  # 越远权重可调\n    return loss",
  "codeNotes": [
    "这是训练损失示意; 推理加速还需用这些头做候选 + 并行验证(Runtime)。",
    "MTP 与 MLA/MoE 常一起出现(如 DeepSeek-V3), 但概念独立。"
  ],
  "complexity": "训练：每步多 K 个预测头的前向/反向，训练成本随 K 增；推理：仅当接 SD 类验证才影响步数，否则不变。",
  "followUps": [
    {
      "question": "MTP 与 Speculative Decoding 核心区别？",
      "answer": "MTP 是训练目标（让模型学会多步前瞻），SD 是推理机制（草稿提议+目标验证、无损减步）；一个在训练期、一个在推理期。"
    },
    {
      "question": "Medusa / EAGLE 属于哪类？",
      "answer": "二者是候选生成方案：Medusa 加多个独立预测头、EAGLE 预测高层特征，都给 SD 提供草稿；它们不是 MTP 训练目标本身。"
    },
    {
      "question": "MTP 本身一定带来推理加速吗？",
      "answer": "不一定。MTP 首先是训练目标；要变成实际加速，还需候选生成、并行验证和对应推理 Runtime（常复用 SD 框架）。"
    },
    {
      "question": "Target Verification 指什么？",
      "answer": "即用大模型对一批候选 token 一次前向、按目标分布接受/拒绝，保证输出分布无损——这是 SD 的核心验证步骤。"
    }
  ],
  "followUpAnswers": [
    "MTP 训练期, SD 推理期。",
    "Medusa/EAGLE 是候选生成, 非 MTP 目标。",
    "MTP 本身不保证加速, 需接验证。",
    "Target Verification = 大模型并行无损验证。"
  ],
  "pitfalls": [
    "把 MTP 直接当成“推理加速技术”（忽略它只是训练目标）。",
    "把 Medusa/EAGLE 与 MTP 混为一谈。",
    "以为多训练几步预测头就自动更快（还需推理 Runtime）。"
  ],
  "beginnerSummary": "这俩名字都带“多 token”，但不在同一阶段。MTP（多 token 预测）是“训练时的目标”：让模型读书时不仅猜下一个字，还顺手猜下下个、下下下个字，逼模型想得更远。投机解码（SD）是“推理时的技巧”：先用小车模猜一串字、大车模一次校验。MTP 让模型“更会猜”，SD 让生成“更快且不失真”。光训练 MTP 不会自动变快——你得再接一套“猜了之后怎么验”的推理流程，才能真的加速。",
  "prerequisites": [
    "训练目标与推理机制是两回事。",
    "SD 用草稿+并行验证实现无损加速。",
    "DeepSeek-V3 用 MTP+MLA+MoE(概念独立)。"
  ],
  "workedExample": [
    "MTP 训练: 主干 + K 个预测头, 损失含各步 CE。",
    "要加速: 用 MTP 头产候选 + 大模型并行验证(借 SD 框架)。"
  ],
  "lineByLine": [
    "MTP: 训练时预测多个未来 token。",
    "SD: 推理时草稿+验证减步。",
    "MTP 提供结构化候选。",
    "SD 提供无损验证框架。",
    "MTP 本身不加速, 需接 Runtime。"
  ],
  "diagram": "对比:\nMTP  -- 训练目标 --> 模型多步前瞻\nSD   -- 推理机制 --> 草稿+并行验证(无损)\n结合: MTP 头产候选 -> SD 验证 -> 加速\n关键: MTP 不自带加速, 需推理 Runtime"
};
