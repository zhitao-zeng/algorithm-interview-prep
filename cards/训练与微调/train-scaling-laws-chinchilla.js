export default {
  "kind": "concept",
  "id": "train-scaling-laws-chinchilla",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "Chinchilla 计算最优：模型参数量与训练 token 的关系",
  "prompt": "给定固定训练算力预算，模型参数量 N 与训练 token 数 D 应如何分配才能最小化损失？",
  "quickAnswer": "Chinchilla 规律表明 N 与 D 应同比例缩放，约每 1 个参数配 20 个训练 token（70B 参数配 1.4T token）。",
  "approach": "在固定 FLOPs 下联合优化 N 与 D，使二者沿 C^0.5 对称增长，而非偏向堆参数。",
  "explanationFocus": "是什么：Chinchilla scaling 是 Hoffmann 等（2022）提出的计算最优训练法则，指出此前 GPT-3/ Gopher 等大模型参数量过大而训练 token 不足（欠训练）；最优配置下训练 token 数约为参数量的 20 倍，即 token/param≈20。",
  "bruteForce": "Kaplan（2020）做法：固定算力下尽量放大模型、复用同一批数据多 epoch，导致数据复用过拟合与算力浪费，最终损失高于均衡方案。",
  "derivation": [
    "为什么需要：Gopher(280B,300B)、GPT-3(175B,300B) 证明同样算力下大参数+少数据明显欠训练，需要为给定算力找到 N、D 最优组合。",
    "怎么实现：用 C≈6ND（每 token 每参数约6 FLOPs），令 N∝C^0.5、D∝C^0.5，得 D≈20N；70B 模型配 1.4T token。",
    "有什么代价：该规律仅优化训练损失，未考虑推理成本；前沿模型受高质量数据可得性约束，常被迫超 Chinchilla 比例过训练小模型。",
    "怎么评测：在多个 iso-FLOP 预算上比较最终验证损失，Chinchilla 点处损失最低；经验上 70B/1.4T 在多数基准超越 4 倍参数的 Gopher。"
  ],
  "invariant": "固定算力下，N 与 D 大致各占 C^0.5，token/param≈20 是经验法则（建议二次核对具体架构）。",
  "walkthrough": "预算 C=5.76e23 FLOPs：N_opt≈sqrt(C/120)≈70B，D_opt≈C/(6·N)≈1.4T，比例≈20 token/param。",
  "edgeCases": [
    "MoE、检索增强等非稠密 Transformer 的最优比例可能不同",
    "数据耗尽时无法满足 Chinchilla 比例，只能多 epoch 或合成数据",
    "仅优化训练算力，未计入推理成本，生产常反向过训练小模型"
  ],
  "code": "def chinchilla_optimal(C_flops):\n    # 估算给定算力下的最优参数量与 token 数\n    N_opt = (C_flops / 120) ** 0.5   # C ≈ 6 * N * (20N) = 120 N^2\n    D_opt = C_flops / (6 * N_opt)\n    return N_opt, D_opt, D_opt / N_opt",
  "codeNotes": [
    "因子 120 = 6 × 20，其中 6 为每参数每 token 的近似训练 FLOPs",
    "结果为粗估，真实训练需配合学习率扫描与余弦调度"
  ],
  "complexity": "估算为 O(1)；实际需训练上百个小模型拟合幂律，成本极高。",
  "followUps": [
    {
      "question": "Kaplan 规律与 Chinchilla 的根本分歧在哪？",
      "answer": "Kaplan 用固定学习率调度导致大模型看似更样本高效，实际是欠训练；Chinchilla 为每个尺寸独立调 LR，揭示应按 C^0.5 对称缩放。"
    },
    {
      "question": "为什么生产常违背 Chinchilla 比例？",
      "answer": "推理成本按模型规模持续付费，故宁可在更多 token 上过训练更小模型（如 LLaMA-3 8B 用 15T token），以换更低 serving 成本。"
    }
  ],
  "followUpAnswers": [
    "Kaplan 用固定学习率调度导致大模型看似更样本高效，实际是欠训练；Chinchilla 为每个尺寸独立调 LR，揭示应按 C^0.5 对称缩放。",
    "推理成本按模型规模持续付费，故宁可在更多 token 上过训练更小模型（如 LLaMA-3 8B 用 15T token），以换更低 serving 成本。"
  ],
  "pitfalls": [
    "误读比例为『20 参数 : 1 token』，正确是 1 参数 : 20 token",
    "把 Chinchilla 视为部署最优，忽略推理成本维度"
  ],
  "beginnerSummary": "训练大模型像分预算：钱（算力）固定时，不要全买『更宽的脑子』（参数），也要买够『读的书』（数据）。Chinchilla 说两者大致按 1:20 配最划算。",
  "prerequisites": [
    "Transformer 基础",
    "FLOPs 与算力预算概念",
    "幂律 scaling 直觉"
  ],
  "workedExample": [
    "取算力 C=5.76e23 FLOPs，代入公式 N=sqrt(C/120)",
    "得 N≈7.0e10(70B)，D≈1.4e12(1.4T)，比例≈20"
  ],
  "lineByLine": [
    "N_opt = (C_flops/120)**0.5：由 C=6·N·20N 反解最优参数量",
    "D_opt = C_flops/(6*N_opt)：用总算力减去参数占用得到训练 token",
    "返回三者中 D_opt/N_opt 即 Chinchilla 比例≈20"
  ],
  "diagram": "算力 C 固定\n ┌─────────────┐\n │  N (参数)   │  ∝ C^0.5\n │  D (token)  │  ∝ C^0.5\n └─────────────┘\n D / N ≈ 20 : 1"
};
