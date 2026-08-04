export default {
  "id": "me-router-zloss",
  "category": "MoE 架构",
  "difficulty": "Hard",
  "title": "Router z-loss",
  "prompt": "Router z-loss 是什么，它如何缓解路由 logits 爆炸并稳定训练？",
  "quickAnswer": "Router z-loss 定义为 L_z = β · mean_t ( log(Σ_j exp(x_{t,j})) )²，其中 x_{t,j} 是 token t 对专家 j 的路由 logits。它惩罚路由 logits 整体幅值过大，防止 softmax 输出过度尖锐，从而稳定路由数值与训练。",
  "approach": "核心思路是约束路由打分的数量级：对每 token 计算 logsumexp（即路由幅度的度量）并平方取平均作为惩罚，使路由器不敢把某些专家 logit 推得极高，保持概率分布相对平滑。",
  "explanationFocus": "是什么：Router z-loss 是 ST-MoE 提出的辅助损失项，专门惩罚路由 logits 的幅值（而非分配均衡），用二次惩罚把路由打分限制在温和范围，提升数值稳定性。",
  "bruteForce": "朴素做法：只靠负载均衡损失，不约束 logits 幅值，训练中可能某些 logit 飙到很大，softmax 几乎 one-hot，梯度与专家分配剧烈抖动。",
  "invariant": "数值不变式：在加入 z-loss 且系数合适时，任意 token 的 logsumexp(x_t) 应保持在一个较小常数附近，路由概率不会退化为极端 one-hot。",
  "walkthrough": "计算流程：1) 取路由 logits X (T,E)；2) 每 token 算 l_t = logsumexp_j X_{t,j}；3) 平方得 l_t²；4) 对所有 token 取平均；5) 乘 β 加入总损失并反传。",
  "complexity": "说明：logsumexp 与平方为 O(T·E) 逐元素操作，开销可忽略；系数 β 通常很小（如 1e-3），主要作用是正则而非主导训练。",
  "beginnerSummary": "入门概览：路由打分“喊得越大”，softmax 就越极端、只认一个专家。z-loss 像音量限制器，谁打分太高就罚谁，让路由别那么极端，训练更平稳。",
  "diagram": "   router logits X (T, E)\n          |\n   logsumexp over experts  -> l_t\n          |\n        l_t ** 2\n          |\n   mean over tokens * beta\n          |\n      router z-loss",
  "code": "import torch\n\ndef router_z_loss(logits, beta=1e-3):\n    # logits: (T, E)  router 原始打分\n    l = torch.logsumexp(logits, dim=-1)     # (T,) 每 token 路由幅值\n    return beta * torch.mean(l ** 2)        # 惩罚过大幅度",
  "derivation": [
    "为什么需要：仅靠负载均衡损失无法阻止路由 logits 幅值爆炸，极端 logits 让 softmax 尖锐、训练尖刺多、数值不稳。",
    "怎么实现：对每 token 的 logsumexp（路由幅值代理）平方取平均作为惩罚项，反向传播压低过大 logits。",
    "有什么代价：β 过大会压制路由区分度、专家趋同；且它不保证分配均衡，仍需与负载均衡损失搭配使用。",
    "怎么评测：观察路由 logits 的均值/最大值是否收敛到温和区间、loss 曲线尖刺是否减少、下游精度是否改善。"
  ],
  "edgeCases": [
    "β 过大，路由概率被迫接近均匀，失去稀疏选择性。",
    "logits 初始化就很大，初期 z-loss 主导，需 warmup 缓冲。",
    "与负载均衡损失系数失衡，二者目标冲突导致训练目标模糊。",
    "推理时 z-loss 应关闭，仅训练期作为正则。"
  ],
  "pitfalls": [
    "与负载均衡损失混淆，以为 z-loss 也能均衡专家分配。",
    "忘记 z-loss 只在训练期生效，误在推理图里保留。"
  ],
  "prerequisites": [
    "softmax、logsumexp 与数值稳定性",
    "MoE 路由与辅助损失机制"
  ],
  "workedExample": [
    "token 的 logits=[8.0,0.2,-1.0]，logsumexp≈8.0，z-loss 项≈64·β；而 logits=[1.0,0.5,-0.5] 时 logsumexp≈1.6，项≈2.56·β，前者惩罚重得多。",
    "加入 β=1e-3 后，训练初期某步 z-loss 从 0.064 逐步降到 0.004，路由 logits 幅值明显收敛。"
  ],
  "lineByLine": [
    "torch.logsumexp(logits, dim=-1)：沿专家维计算 log(Σexp)，是 logits 整体幅值的稳定度量。",
    "l ** 2：平方放大对大幅度 logits 的惩罚（二次）。",
    "torch.mean(l ** 2)：对所有 token 取平均得到 batch 级惩罚。",
    "beta * ...：乘小系数，使该项以正则身份温和介入训练。"
  ],
  "codeNotes": [
    "z-loss 惩罚的是“幅值”而非“分配”，与负载均衡损失互补，二者常同时使用。"
  ],
  "followUps": [
    {
      "question": "logsumexp 平方为什么比直接惩罚 max logit 好？",
      "answer": "logsumexp 平滑地反映整体幅值且全程可微、数值稳定，不像 max 那样不可微；平方让其对大值更敏感。"
    },
    {
      "question": "z-loss 和负载均衡损失能否只留一个？",
      "answer": "不能互相替代：z-loss 管数值幅度、负载均衡管分配均匀，目标不同，实践中两者配合效果最好。"
    }
  ],
  "followUpAnswers": [
    "logsumexp 平滑地反映整体幅值且全程可微、数值稳定，不像 max 那样不可微；平方让其对大值更敏感。",
    "不能互相替代：z-loss 管数值幅度、负载均衡管分配均匀，目标不同，实践中两者配合效果最好。"
  ],
  "kind": "concept"
};
