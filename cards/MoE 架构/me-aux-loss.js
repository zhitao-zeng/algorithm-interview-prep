export default {
  "id": "me-aux-loss",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "辅助负载均衡损失",
  "prompt": "MoE 的辅助负载均衡损失（auxiliary load balancing loss）是怎么构造的、为什么有效？",
  "quickAnswer": "辅助负载均衡损失定义为 L_aux = α · Σ_i f_i · P_i，其中 f_i 是路由到专家 i 的 token 比例，P_i 是所有 token 对专家 i 的平均路由概率。当分配越不均（少数 f_i、P_i 偏大）该项越大，从而鼓励每个专家被均匀使用。",
  "approach": "核心思路是把“均衡”变成可微目标：用 token 级分配比例 f 与概率均值 P 的乘积和作为惩罚，加到主损失上，用系数 α 调节强度，让路由器在学任务的同时把 token 摊到所有专家。",
  "explanationFocus": "是什么：辅助负载均衡损失（auxiliary load balancing loss）是 MoE 训练中附加的一项正则损失，用于惩罚“少数专家被过度使用、其余专家闲置”的不均衡路由。",
  "bruteForce": "朴素做法：完全不加均衡项，路由自由发展，结果往往少数专家承担几乎所有 token，其余专家参数浪费且永不更新。",
  "invariant": "均衡不变式：若路由完全均匀，则 f_i = P_i = 1/E 对所有 i，L_aux = α·Σ(1/E²) = α/E 为最小可能值（在固定 Σf=ΣP=1 下）。",
  "walkthrough": "计算流程：1) 对 batch 统计每个专家被选中的 token 数，得 f_i = count_i / T；2) 对每个专家求所有 token 路由概率的均值 P_i；3) 计算 Σ_i f_i·P_i；4) 乘系数 α 加到总损失；5) 反向传播同时优化路由与专家。",
  "complexity": "说明：统计 f 与 P 为 O(T·E) 一次规约，开销极小；系数 α 通常取较小值（如 1e-2），对主任务影响有限但足以维持均衡。",
  "beginnerSummary": "入门概览：如果路由自由发挥，模型会偷懒——总把 token 送给同一两个“明星专家”，其他专家成摆设。辅助损失就像给“均匀分配”打分之，逼模型雨露均沾。",
  "diagram": "   tokens --> router --> expert i\n        f_i = #tok to i / T\n        P_i = mean prob to i\n        L_aux = a * sum_i (f_i * P_i)\n              |\n        balanced routing",
  "code": "import torch\n\ndef aux_load_balancing_loss(router_probs, expert_mask, alpha=1e-2):\n    # router_probs: (T, E)  softmax 后概率\n    # expert_mask:  (T, E)  1 表示 token 被分配到该专家\n    f = expert_mask.float().mean(dim=0)              # (E,) 各专家 token 比例\n    P = router_probs.mean(dim=0)                     # (E,) 各专家平均概率\n    loss = alpha * torch.sum(f * P)\n    return loss",
  "derivation": [
    "为什么需要：token-choice 路由在梯度下降下容易塌缩到少数专家，浪费参数且训练不稳定，需要显式均衡信号。",
    "怎么实现：用可微的 f_i（分配比例）与 P_i（平均概率）构造 Σ f_i·P_i，作为附加损失反向传播，使路由概率向均匀方向移动。",
    "有什么代价：α 过大时路由为均衡牺牲任务性能、专家趋同；α 过小时均衡失效；且它只是软约束，极端情况仍可能不均。",
    "怎么评测：监控各专家 token 数的分布/方差、专家权重范数差异，以及下游精度是否因均衡项受损。"
  ],
  "edgeCases": [
    "α 设得过大，路由被迫接近均匀，专家失去专业性、主任务掉点。",
    "batch 内 token 数极少，f_i 估计噪声大，均衡信号失真。",
    "存在被 mask 丢弃的 token，统计 f_i 时需计入或不计入要一致。",
    "专家数 E 很大时，1/E 很小，均衡项梯度也小，需相应调 α。"
  ],
  "pitfalls": [
    "把 f_i 与 P_i 顺序搞反或漏乘，导致损失语义错误。",
    "忘记对 f、P 在 token 维求均值，直接求和造成随 batch 大小漂移。"
  ],
  "prerequisites": [
    "MoE 路由与 softmax 概率",
    "可微损失与反向传播基础"
  ],
  "workedExample": [
    "E=2，batch 中 f=[0.9,0.1]，P=[0.85,0.15]，则 L_aux=α·(0.9·0.85+0.1·0.15)=α·0.78，明显偏高，反向推动路由更均匀。",
    "若 f=[0.5,0.5]、P=[0.5,0.5]，则 L_aux=α·(0.25+0.25)=α·0.5，达到该 E 下的最小均衡损失。"
  ],
  "lineByLine": [
    "expert_mask.float().mean(dim=0)：沿 token 维求每专家被选比例 f_i。",
    "router_probs.mean(dim=0)：沿 token 维求每专家平均路由概率 P_i。",
    "f * P：逐专家相乘，均衡度越低（某专家 f、P 同时偏大）该项越大。",
    "alpha * torch.sum(...) ：汇总并乘系数，得到标量辅助损失。"
  ],
  "codeNotes": [
    "经典 Switch Transformer 用 f_i·P_i 形式；GShard 用类似但稍不同的“重要性+路由”双均衡项，思想一致。"
  ],
  "followUps": [
    {
      "question": "f_i 和 P_i 分别捕捉什么？",
      "answer": "f_i 是实际分配比例（硬分配统计），P_i 是路由器给出的平均置信度（软概率），两者相乘在“既被选得多又被高置信选”时惩罚最重。"
    },
    {
      "question": "能不能完全用 Expert Choice 替代辅助损失？",
      "answer": "可以，Expert Choice 结构上均衡无需 aux-loss；但 token-choice 路线通常仍需辅助损失，二者是正交的均衡手段。"
    }
  ],
  "followUpAnswers": [
    "f_i 是实际分配比例（硬分配统计），P_i 是路由器给出的平均置信度（软概率），两者相乘在“既被选得多又被高置信选”时惩罚最重。",
    "可以，Expert Choice 结构上均衡无需 aux-loss；但 token-choice 路线通常仍需辅助损失，二者是正交的均衡手段。"
  ],
  "kind": "concept"
};
