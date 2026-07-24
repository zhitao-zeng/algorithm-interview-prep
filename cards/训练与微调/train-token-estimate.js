export default {
  "kind": "concept",
  "id": "train-token-estimate",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "训练 token 量估算（给定模型规模推 token）",
  "prompt": "已知模型参数量，如何估算其计算最优的训练 token 数？",
  "quickAnswer": "按 Chinchilla 比例，训练 token≈20×参数量（如 7B 模型约 140B token），再按算力预算用 C≈6ND 校正。",
  "approach": "先用经验比例 D≈20N 粗估，再用算力约束 C=6ND 反解验证，二者一致即为计算最优训练量。",
  "explanationFocus": "是什么：训练 token 量估算是在已知模型规模 N 或算力预算 C 时，推算应喂多少训练 token D，使算力用得最值（Chinchilla 下 D≈20N）。",
  "bruteForce": "拍脑袋定 token（如所有模型都喂 300B），导致大模型欠训练、小模型过训练，算力利用低效。",
  "derivation": [
    "为什么需要：数据需求随模型规模增长，需规划语料规模与训练步数，避免中途断料或欠训练。",
    "怎么实现：D = 20 × N；或已知 C 时 D = C/(6N)，两者联立可得 N=sqrt(C/120)。",
    "有什么代价：高质量数据有限时 D 达不到 20N，只能多 epoch 或接受次优；过训练小模型时 D 远超 20N。",
    "怎么评测：观察训练损失是否随步数平稳下降、验证困惑度是否饱和，判断是否还欠训练。"
  ],
  "invariant": "默认 D≈20N；受数据上限时用多 epoch 但需配合课程/重采样（建议二次核对前沿模型实际比例）。",
  "walkthrough": "7B 模型：N=7e9，D≈20×7e9=1.4e11（140B token）；若算力只允许 8e22 FLOPs，则 D≈8e22/(6×7e9)≈1.9e12，说明可更充分训练。",
  "edgeCases": [
    "数据不足时 D 远小于 20N，被迫多 epoch 易过拟合",
    "推理优先场景 D 取数百倍 N（过训练）",
    "MoE 的『激活参数』而非总参数决定比例"
  ],
  "code": "def estimate_tokens(params, C_flops=None):\n    D_from_N = 20 * params\n    if C_flops:\n        return min(D_from_N, C_flops / (6 * params))\n    return D_from_N",
  "codeNotes": [
    "返回 min 表示受『比例』与『算力』双重约束取较小可行值",
    "真实训练还需换算成 steps = D / (batch × seq_len)"
  ],
  "complexity": "O(1) 估算。",
  "followUps": [
    {
      "question": "若数据只有 100B 但模型 7B 怎么办？",
      "answer": "只能在 100B 上多 epoch，但需配合数据重采样与早停，避免记忆化；或缩小模型以贴合数据。"
    },
    {
      "question": "怎么把 token 数转成训练 steps？",
      "answer": "steps = total_tokens / (global_batch_size × seq_len)，再配合学习率预热与余弦衰减。"
    }
  ],
  "followUpAnswers": [
    "只能在 100B 上多 epoch，但需配合数据重采样与早停，避免记忆化；或缩小模型以贴合数据。",
    "steps = total_tokens / (global_batch_size × seq_len)，再配合学习率预热与余弦衰减。"
  ],
  "pitfalls": [
    "把 20N 当死规则，忽视数据可得性上限",
    "用总参数而非激活参数估算 MoE"
  ],
  "beginnerSummary": "模型越大越要『读书多』：参数量乘以 20 大概就是该喂的 token 数；书不够就只能反复读同一本（多 epoch）。",
  "prerequisites": [
    "Chinchilla 规律",
    "FLOPs 估算",
    "batch/step 概念"
  ],
  "workedExample": [
    "13B 模型：D≈20×13e9=2.6e11（260B token）",
    "若仅 200B 数据可用，则最多约 15 个 epoch"
  ],
  "lineByLine": [
    "D_from_N = 20 * params：Chinchilla 比例粗估",
    "if C_flops: 用算力约束再校准",
    "return min(...)：取比例与算力两者中较小可行训练量"
  ],
  "diagram": "N(参数) ──×20──▶ D(最优 token)\n   │\n   └─ C=6ND ─▶ 受算力封顶"
};
