export default {
  "id": "me-st-moe",
  "category": "MoE 架构",
  "difficulty": "Hard",
  "title": "ST-MoE 稳定训练技巧",
  "prompt": "ST-MoE 用了哪些技巧让稀疏 MoE 训练更稳定、避免路由震荡？",
  "quickAnswer": "ST-MoE（Stable and Transferable Mixture-of-Experts）通过引入 router z-loss 抑制路由 logits 幅度、对专家使用 dropout 正则、采用更小学习率与更稳的初始化、并从稠密预训练模型初始化（upcycling），显著缓解了稀疏 MoE 常见的路由震荡与训练不稳定。",
  "approach": "核心思路是把“稳定”当作一等目标：在路由侧加 z-loss 惩罚过大 logit，在专家侧加 dropout 与权重衰减，在优化侧用 warmup 与低学习率，在初始化侧复用稠密权重，从而让专家分配平滑、梯度健康。",
  "explanationFocus": "是什么：ST-MoE 是 Google 2022 年提出的稳定且可迁移的稀疏 MoE 方法，提出了一系列让 MoE 训练不“炸”、且微调后效果能迁移的工程技巧组合。",
  "bruteForce": "朴素做法：直接把稠密模型切成 MoE 并从随机初始化开始大学习率训练，结果往往路由剧烈震荡、部分专家饿死、loss 尖刺频发。",
  "invariant": "稳定不变式：在整个训练过程中，路由 logits 的幅值被 z-loss 限制在一定范围，任意专家处理的 token 比例不应长期为 0（否则视为不稳定）。",
  "walkthrough": "训练流程：1) 从稠密 checkpoint 初始化专家；2) 用 warmup 线性提升学习率；3) 每步算主损失 + 负载均衡损失 + router z-loss；4) 对专家输出加 dropout；5) 监控路由熵与丢弃率，异常则调 capacity。",
  "complexity": "说明：稳定技巧多为“免费或近乎免费”的正则/损失项，不增加专家内计算量；z-loss 仅对路由 logits 做标量二次惩罚，开销可忽略，但换来更稳的收敛曲线。",
  "beginnerSummary": "入门概览：MoE 虽然省算力，但训练时路由容易“抽风”——一会儿全选这个专家一会儿全选那个。ST-MoE 像给路由加了“安全带”：限制路由打分别太夸张、给专家加点随机丢神经元、用更稳的学习节奏。",
  "diagram": "   dense pretrained init --> MoE experts\n              |\n   router z-loss  (penalize |logits|)\n   expert dropout (regularize FFN)\n   lr warmup + low lr\n              |\n        stable training",
  "code": "import torch\n\ndef router_z_loss(logits):\n    # logits: (T, E)  router 原始打分\n    log_z = torch.logsumexp(logits, dim=-1)        # (T,)\n    return torch.mean(log_z ** 2)                   # 惩罚过大幅度\n\ndef expert_dropout(x, p=0.1, training=True):\n    if not training or p <= 0:\n        return x\n    mask = (torch.rand_like(x) > p) / (1.0 - p)     # 训练时按比例丢弃\n    return x * mask",
  "derivation": [
    "为什么需要：稀疏 MoE 训练常因路由 logits 爆炸、专家分配抖动而出现 loss 尖刺与专家饥饿，需要系统性的稳定手段。",
    "怎么实现：引入 router z-loss 约束路由 logits 幅值，对专家 FFN 加 dropout 与权重衰减，使用学习率 warmup 与较小峰值 lr，并从稠密预训练权重初始化专家。",
    "有什么代价：z-loss 需调系数，过大会压制路由区分度；dropout 与低 lr 会拖慢早期收敛，需要更多步数达到同等效果。",
    "怎么评测：对比有无稳定技巧的预训练 loss 曲线平滑度、下游微调后准确率，以及“迁移性”（同一 MoE 在不同任务微调是否都稳）。"
  ],
  "edgeCases": [
    "z-loss 系数过大，路由退化为接近均匀分配，丧失稀疏专业性。",
    "dropout 在推理未关闭，导致输出方差变大、精度下降。",
    "从容量过小的稠密模型 upcycle，专家无法学到差异化表示。",
    "warmup 太短，初期大 lr 仍触发路由震荡。"
  ],
  "pitfalls": [
    "把 router z-loss 与负载均衡损失混淆，前者稳数值、后者均分配。",
    "直接套用稠密模型的学习率，导致 MoE 训练初期不稳定。"
  ],
  "prerequisites": [
    "MoE 路由与负载均衡损失原理",
    "深度学习正则化（dropout、权重衰减）与学习率调度"
  ],
  "workedExample": [
    "某步路由 logits=[8.0,0.2,-1.0]，logsumexp≈8.0，z-loss≈64，远大于正常步（logits≈2 时 z-loss≈4），说明该步路由打分过大被惩罚。",
    "对专家输出以 p=0.1 做 dropout，推理时 p=0 关闭，训练时保留以抑制过拟合与路由依赖。"
  ],
  "lineByLine": [
    "torch.logsumexp(logits, dim=-1)：对专家维取 log(sum(exp))，即路由 logits 的整体幅值度量。",
    "log_z ** 2：平方惩罚，幅值越大惩罚越重，迫使路由打分保持温和。",
    "torch.mean(...)：对 batch 内所有 token 取平均，得到标量 z-loss。",
    "(torch.rand_like(x) > p) / (1.0 - p)：以概率 p 置零并按 1/(1-p) 缩放，保持期望不变（inverted dropout）。"
  ],
  "codeNotes": [
    "z-loss 与负载均衡损失正交：一个管“路由打分幅度”，一个管“专家分配均衡”，常一起用。"
  ],
  "followUps": [
    {
      "question": "router z-loss 和辅助负载均衡损失有什么区别？",
      "answer": "z-loss 惩罚路由 logits 的幅度（数值稳定、防爆炸），负载均衡损失惩罚专家分配不均（均衡性），两者目标不同可叠加。"
    },
    {
      "question": "ST-MoE 的初始化为什么重要？",
      "answer": "从稠密预训练权重复制初始化专家，让训练起点就在良好流形上，避免随机初始化带来的剧烈路由震荡，是“稳定+可迁移”的关键。"
    }
  ],
  "followUpAnswers": [
    "z-loss 惩罚路由 logits 的幅度（数值稳定、防爆炸），负载均衡损失惩罚专家分配不均（均衡性），两者目标不同可叠加。",
    "从稠密预训练权重复制初始化专家，让训练起点就在良好流形上，避免随机初始化带来的剧烈路由震荡，是“稳定+可迁移”的关键。"
  ],
  "kind": "concept"
};
