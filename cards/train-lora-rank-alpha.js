export default {
  "kind": "concept",
  "id": "train-lora-rank-alpha",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "LoRA 秩 r 与缩放 α 的作用",
  "prompt": "LoRA 里秩 r 和缩放因子 α 分别控制什么？",
  "quickAnswer": "r 决定低秩增量容量（r 越大表达越强），α 通过缩放 α/r 控制增量对原模型的影响幅度，常设 α=2r。",
  "approach": "前向增量写 y=Wx+(α/r)BAx；r 调容量、α/r 调步长，二者解耦以便独立调『学多少』与『改多狠』。",
  "explanationFocus": "是什么：LoRA 中秩 r 是低秩矩阵的内维，决定 ΔW=BA 可表达的子空间维度（容量）；缩放 α 与 r 组成系数 α/r，控制低秩增量叠加到原权重的幅度。",
  "bruteForce": "只调 r 不调 α，增量幅度随 r 变化而漂移，难以稳定对比实验，且大 r 时增量可能过冲破坏基座能力。",
  "derivation": [
    "为什么需要：需分别控制『适配容量』与『改动强度』，否则调 r 会同时改变两者，超参难调。",
    "怎么实现：在 forward 乘 scaling=α/r；惯例 α=2r 使 scaling≈2，调 r 时幅度稳定。",
    "有什么代价：r 过大接近全秩则失去参数效率且易过拟合；α 过大使训练不稳、过小则学不动。",
    "怎么评测：在验证集扫描 (r,α) 网格，观察精度与过拟合拐点，选最小够用的 r。"
  ],
  "invariant": "常用 α=2r 使 scaling 恒定；先定 r 再微调 α（建议二次核对具体库默认值）。",
  "walkthrough": "r=16, α=32 → scaling=2；若改 r=32 且 α=64 仍 scaling=2，容量翻倍但幅度不变，便于公平对比。",
  "edgeCases": [
    "r 设 1 可能容量不足（但论文称有时够用）",
    "α/r 过大导致训练初期输出剧烈偏移",
    "不同层用统一 r 未必最优"
  ],
  "code": "def lora_scale(alpha, r):\n    # LoRA 增量缩放因子\n    return alpha / r\n\nscaling = lora_scale(alpha=32, r=16)  # = 2.0",
  "codeNotes": [
    "scaling 直接乘在 BA 分支输出上",
    "PEFT 库默认常 alpha=2*r"
  ],
  "complexity": "O(1) 超参，无额外计算。",
  "followUps": [
    {
      "question": "r 越大越好吗？",
      "answer": "不一定；r 增到接近 d 时参数效率消失且易过拟合，应在『够用最小 r』处停。"
    },
    {
      "question": "为什么用 α/r 而不是直接 α？",
      "answer": "除以 r 使增量幅度与秩解耦，调 r 改容量时不改变叠加强度，实验更可控。"
    }
  ],
  "followUpAnswers": [
    "不一定；r 增到接近 d 时参数效率消失且易过拟合，应在『够用最小 r』处停。",
    "除以 r 使增量幅度与秩解耦，调 r 改容量时不改变叠加强度，实验更可控。"
  ],
  "pitfalls": [
    "只调 r 不调 α 导致幅度漂移",
    "盲目拉大 r 以为更准，实则过拟合"
  ],
  "beginnerSummary": "r 像『外挂能装多少知识』，α/r 像『外挂对原脑子的改写力度』；通常让 α=2r，调 r 时力度不变只看容量。",
  "prerequisites": [
    "LoRA 原理",
    "超参数作用",
    "学习率与步长直觉"
  ],
  "workedExample": [
    "r=8, α=16 → scaling=2；r=64, α=128 → scaling=2",
    "同样幅度下对比 r=8 vs 64 的容量差异"
  ],
  "lineByLine": [
    "def lora_scale(alpha, r): 计算缩放",
    "return alpha / r：秩归一化",
    "示例 scaling=2.0 为常见设定"
  ],
  "diagram": "r: 容量(高维子空间)\nα/r: 叠加幅度\n通常 α = 2r → 幅度恒为 2"
};
