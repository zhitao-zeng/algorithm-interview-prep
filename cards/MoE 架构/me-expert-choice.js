export default {
  "id": "me-expert-choice",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "Expert Choice 路由",
  "prompt": "Expert Choice 路由为什么能让负载天然均衡、不需要辅助损失？",
  "quickAnswer": "Expert Choice 反转了路由方向：不是 token 选专家，而是每个专家按 gate 分数挑选得分最高的 top-k 个 token。因为每专家固定选 k 个，所有专家处理的 token 数天然相等，负载绝对均衡，不再需要辅助负载均衡损失。",
  "approach": "核心思路是“专家挑 token”：先算 token-专家分数矩阵，每个专家沿 token 维取 top-k 得到自己的一批 token，再各自前向；未入选的 token 由残差或其他专家处理，分配天然均匀。",
  "explanationFocus": "是什么：Expert Choice 是 Google 2022 年提出的一种 MoE 路由范式，把传统的“token 选专家”反转为“专家选 token”，从而绕开了负载均衡这一长期难题。",
  "bruteForce": "朴素做法：token 选专家（token choice），必须额外加辅助负载均衡损失并调系数才能勉强均衡，且仍可能抖动。",
  "invariant": "路由不变式：每个专家恰好处理 k 个 token（共 E·k 个槽位），只要 k·E >= 总 token 数，所有 token 都至少被一个专家覆盖，分配严格均衡。",
  "walkthrough": "前向流程：1) 算分数矩阵 S (T,E)；2) 对每个专家 e，沿 token 维取 argtopk 得该专家的 token 集合；3) 各专家对各自 token 集合做 FFN；4) 把结果按原 token 位置写回并（可）加权求和；5) 未被选中的 token 走残差。",
  "complexity": "说明：分数矩阵与 top-k 为 O(T·E) 与 O(E·T log k)；每专家固定处理 k 个 token，总专家计算量 = E·k·d_ff 恒定且均衡；代价是部分 token 可能落选需残差兜底。",
  "beginnerSummary": "入门概览：通常是“哪个 token 去哪个专家”。Expert Choice 反过来——“每个专家自己挑最喜欢的几个 token”。因为专家人数固定、每人挑固定数量，自然人人有活干、不会有人闲着。",
  "diagram": "   scores S (T x E)\n        |\n   per expert e: topk over tokens\n        |\n   E0 picks k tokens \\  E1 picks k tokens  ...\n        |                |\n   FFN per expert     (balanced: each k)\n        |\n   scatter back by token",
  "code": "import torch\n\ndef expert_choice_route(scores, k):\n    # scores: (T, E)  token 对专家的得分\n    _, idx = torch.topk(scores, k, dim=0)        # 每专家选 k 个 token -> (k, E)\n    return idx                                    # idx[j, e] = 第 e 个专家选的第 j 个 token\n\ndef gather_tokens(x, idx):\n    return x[idx]                                 # (k, E, d) 各专家对应的 token",
  "derivation": [
    "为什么需要：token-choice 路由天然不均，依赖辅助损失且仍抖动；需要一种结构上就均衡、无需额外损失的方案。",
    "怎么实现：把路由问题转置——对每个专家沿 token 维做 top-k，使每专家固定处理 k 个 token，分配在数学上严格均衡。",
    "有什么代价：被所有专家落选的 token 得不到专家处理需残差兜底；每 token 可能被多个专家选中需加权/截断；实现比 token-choice 稍复杂。",
    "怎么评测：观察各专家 token 数的标准差（应为 0）、下游任务精度，以及与 token-choice+aux-loss 在同算力下的对比。"
  ],
  "edgeCases": [
    "总 token 数 T < E·k，部分专家选不满 k 个（可用 padding 或允许少选）。",
    "某 token 被多个专家同时选中，需要决定如何合并其输出。",
    "某 token 被所有专家落选，只能走残差，可能丢信息。",
    "top-k 的 k 太大导致每专家计算量上升、稀疏性下降。"
  ],
  "pitfalls": [
    "仍按 token-choice 习惯加辅助损失，反而破坏 Expert Choice 的天然均衡。",
    "忽略未被选中 token 的残差处理，造成信息丢失。"
  ],
  "prerequisites": [
    "MoE token-choice 路由与负载均衡损失",
    "torch.topk 与张量 gather/scatter 操作"
  ],
  "workedExample": [
    "T=6, E=2, k=2：专家 E0 从 6 个 token 中挑得分最高的 2 个，E1 同样挑 2 个，可能重叠也可能不重叠，但每专家恰处理 2 个。",
    "分数矩阵某列 [0.9,0.2,0.8,...]，E0 沿 token 维取 top-2 得到 token 0 与 token 2，分配确定且均衡。"
  ],
  "lineByLine": [
    "torch.topk(scores, k, dim=0)：沿 token 维（dim=0）取每专家得分最高的 k 个 token。",
    "返回 idx 形状 (k, E)：idx[j,e] 是第 e 个专家选中的第 j 个 token 下标。",
    "x[idx]：按专家分组取出对应 token 表示，得到 (k, E, d) 供各专家并行 FFN。",
    "“专家挑 token”使每专家槽位数恒为 k，分配天然均衡，无需 aux-loss。"
  ],
  "codeNotes": [
    "dim=0 是 Expert Choice 与 token-choice 的根本区别：前者在专家列上做 top-k，后者在 token 行上做 top-k。"
  ],
  "followUps": [
    {
      "question": "Expert Choice 下被多个专家选中的 token 怎么合并？",
      "answer": "常见做法是对该 token 在各专家的输出做加权平均（用归一化得分）或简单相加，也可限制每 token 最多被 r 个专家选中以控计算量。"
    },
    {
      "question": "它和 token-choice 在分布式实现上有什么不同？",
      "answer": "token-choice 按 token 派发专家，易做专家并行；expert-choice 需先全局 top-k 再按专家聚批，通信模式不同但负载更均衡、更省负载均衡调参。"
    }
  ],
  "followUpAnswers": [
    "常见做法是对该 token 在各专家的输出做加权平均（用归一化得分）或简单相加，也可限制每 token 最多被 r 个专家选中以控计算量。",
    "token-choice 按 token 派发专家，易做专家并行；expert-choice 需先全局 top-k 再按专家聚批，通信模式不同但负载更均衡、更省负载均衡调参。"
  ],
  "kind": "concept"
};
