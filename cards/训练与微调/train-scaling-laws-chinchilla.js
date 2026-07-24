export default {
  "kind": "concept",
  "id": "train-scaling-laws-chinchilla",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "Chinchilla 计算最优：模型参数量与训练 token 的关系",
  "prompt": "给定固定训练算力预算，模型参数量 N 与训练 token 数 D 应如何分配才能最小化损失？",
  "quickAnswer": "Chinchilla 规律表明在固定算力下 N 与 D 应同比例缩放，约每 1 个参数配 20 个训练 token（70B 参数配 1.4T token）。用 C≈6ND 估算：令 N∝C^0.5、D∝C^0.5 得 D≈20N。注意它只优化训练损失，未计入推理成本，所以生产常反向“过训练更小模型”（如 LLaMA-3 8B 用 15T token）以降 serving 成本。",
  "approach": "在固定 FLOPs 下联合优化 N 与 D，使二者沿 C^0.5 对称增长，而非偏向堆参数。用 C≈6ND 反解：N_opt=(C/120)^0.5、D_opt=C/(6N_opt)，得到 token/param≈20。再用学习率扫描与余弦调度落地，而非只套公式。",
  "explanationFocus": "是什么：Chinchilla scaling 是 Hoffmann 等（2022，DeepMind）提出的计算最优训练法则，指出此前 GPT-3 / Gopher 等大模型参数量过大而训练 token 不足（欠训练）；在固定算力下，最优配置是训练 token 数约为参数量的 20 倍（token/param≈20），即 N 与 D 应沿 C^0.5 对称增长，而非偏向堆参数。它把“模型该多大、数据该多少”从经验拍脑袋变成可计算的预算分配公式。",
  "bruteForce": "Kaplan（2020）做法：固定算力下尽量放大模型、复用同一批数据多 epoch，导致数据复用过拟合与算力浪费，最终损失高于均衡方案——本质是“大模型 + 少数据”的欠训练陷阱。",
  "derivation": [
    "为什么需要：Gopher(280B,300B)、GPT-3(175B,300B) 证明同样算力下大参数+少数据明显欠训练，需要为给定算力找到 N、D 最优组合，而非凭直觉堆参数。",
    "怎么实现：用 C≈6ND（每 token 每参数约 6 FLOPs），并假设损失随 N、D 各呈幂律下降，令 N∝C^0.5、D∝C^0.5，解出 D≈20N；70B 模型配 1.4T token。",
    "有什么代价：该规律仅优化训练损失，未考虑推理成本；前沿模型受高质量数据可得性约束，常被迫超 Chinchilla 比例过训练小模型，且幂律外推到超大 N 有不确定性。",
    "怎么评测：在多个 iso-FLOP 预算上比较最终验证损失，Chinchilla 点处损失最低；经验上 70B/1.4T 在多数基准超越 4 倍参数的 Gopher，验证“均衡缩放”的有效性。"
  ],
  "invariant": "固定算力下，N 与 D 大致各占 C^0.5，token/param≈20 是经验法则（稠密 Transformer）。该比例随架构（MoE、稀疏）与数据可得性变化；它描述的是“训练损失最优”，不等于“部署最优”。",
  "walkthrough": "预算 C=5.76e23 FLOPs：N_opt≈sqrt(C/120)=sqrt(4.8e21)≈6.93e10≈70B，D_opt≈C/(6·N)=5.76e23/(4.16e11)≈1.38e12≈1.4T，比例≈20 token/param。对比：Gopher(280B,300B) 是 1 参数配 ~1 token，明显欠训练；Chinchilla 7B 用 1.4T 反而常超更大旧模型的部分基准。",
  "edgeCases": [
    "MoE、检索增强等非稠密 Transformer 的最优比例不同（激活参数 vs 总参数需重新定义 N）。",
    "数据耗尽时无法满足 Chinchilla 比例，只能多 epoch 或合成数据，会偏离最优。",
    "仅优化训练算力，未计入推理成本，生产常反向过训练小模型以降 serving 费用。",
    "超长上下文训练会改变有效 token 计与注意力成本，简单 6ND 近似失真。"
  ],
  "code": "def chinchilla_optimal(C_flops):\n    # 估算给定算力下的最优参数量与 token 数\n    N_opt = (C_flops / 120) ** 0.5   # C ≈ 6 * N * (20N) = 120 N^2\n    D_opt = C_flops / (6 * N_opt)\n    return N_opt, D_opt, D_opt / N_opt",
  "codeNotes": [
    "因子 120 = 6 × 20，其中 6 为每参数每 token 的近似训练 FLOPs（前向+后向）。",
    "结果为粗估，真实训练需配合学习率扫描与余弦调度，且 6ND 忽略了 embedding/注意力中的非参数项。",
    "若关心部署，应把推理 FLOPs（≈2ND_per_token·L_served）并入总代价，最优 N 会偏小。"
  ],
  "complexity": "估算为 O(1) 闭式；但得到该律本身需在数十到上百个 iso-FLOP 预算上训练小模型拟合幂律 L(N,D)=a/N^α + b/D^β + e，成本极高，是离线研究而非在线计算。",
  "followUps": [
    {
      "question": "Kaplan 规律与 Chinchilla 的根本分歧在哪？",
      "answer": "Kaplan 用固定学习率调度导致大模型看似更“样本高效”，实际是欠训练（同样数据反复看）；Chinchilla 为每个尺寸独立调 LR 并联合缩放 N、D，揭示应按 C^0.5 对称缩放、token/param≈20。分歧根源是“是否充分训练到该尺寸的收敛点”——Kaplan 停得早，所以误以为大模型更省数据。"
    },
    {
      "question": "为什么生产常违背 Chinchilla 比例？",
      "answer": "推理成本按模型规模持续付费（每次请求都跑全量参数），故宁可在更多 token 上过训练更小模型（如 LLaMA-3 8B 用 15T token，远超 20× 的 160B），以换更低 serving 成本与更快推理。Chinchilla 优化的是“训练损失”，而生产优化的是“总拥有成本（训练+推理）”，二者目标不同。"
    }
  ],
  "followUpAnswers": [
    "Kaplan 用固定学习率调度导致大模型看似更“样本高效”，实际是欠训练（同样数据反复看）；Chinchilla 为每个尺寸独立调 LR 并联合缩放 N、D，揭示应按 C^0.5 对称缩放、token/param≈20。分歧根源是“是否充分训练到该尺寸的收敛点”——Kaplan 停得早，所以误以为大模型更省数据。",
    "推理成本按模型规模持续付费（每次请求都跑全量参数），故宁可在更多 token 上过训练更小模型（如 LLaMA-3 8B 用 15T token，远超 20× 的 160B），以换更低 serving 成本与更快推理。Chinchilla 优化的是“训练损失”，而生产优化的是“总拥有成本（训练+推理）”，二者目标不同。"
  ],
  "pitfalls": [
    "误读比例为“20 参数 : 1 token”，正确是 1 参数 : 20 token。",
    "把 Chinchilla 视为部署最优，忽略推理成本维度，导致上线 serving 费用失控。",
    "高估幂律外推可靠性，在远超拟合范围的 N 上直接套用 20× 比例。"
  ],
  "beginnerSummary": "训练大模型像分预算：钱（算力）固定时，不要全买“更宽的脑子”（参数），也要买够“读的书”（数据）。Chinchilla 说两者大致按 1:20 配最划算——1 单位脑子配 20 单位书。以前大家脑子买太大、书读太少（欠训练），所以同样钱效果差。但要注意：这公式只管“训练时最省力”，不管“上线后每次答题多贵”，所以实际常反过来让小脑袋多读书以省服务费。",
  "prerequisites": [
    "Transformer 基础与前向/后向 FLOPs 概念（约 6ND）。",
    "FLOPs 与算力预算（C）概念，及 iso-FLOP 实验含义。",
    "幂律 scaling 直觉：损失随 N、D 各呈负幂下降。"
  ],
  "workedExample": [
    "取算力 C=5.76e23 FLOPs，代入公式 N=(C/120)^0.5 = (4.8e21)^0.5 ≈ 6.9e10（70B）。",
    "得 D=C/(6N)=5.76e23/(4.16e11)≈1.38e12（1.4T），比例 D/N≈20。",
    "对照 Gopher(280B,300B) 仅 ~1 token/param，明显欠训练，Chinchilla 7B+1.4T 反超部分基准。"
  ],
  "lineByLine": [
    "N_opt = (C_flops/120)**0.5：由 C=6·N·(20N)=120 N^2 反解最优参数量（120=6×20）。",
    "D_opt = C_flops/(6*N_opt)：用总算力减去参数占用得到训练 token 数（6 为每参数每 token FLOPs）。",
    "返回三者中 D_opt/N_opt 即 Chinchilla 比例≈20，用于检查预算分配是否均衡。"
  ],
  "diagram": "算力 C 固定\n ┌─────────────┐\n │  N (参数)   │  ∝ C^0.5\n │  D (token)  │  ∝ C^0.5\n └─────────────┘\n D / N ≈ 20 : 1"
};
