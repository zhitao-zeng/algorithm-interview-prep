export default {
  "kind": "concept",
  "id": "train-token-estimate",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "训练 token 量估算（给定模型规模推 token）",
  "prompt": "已知模型参数量，如何估算其计算最优的训练 token 数？",
  "quickAnswer": "按 Chinchilla 计算最优规律，训练 token 数 D≈20×参数量 N（例如 7B 模型约需 140B token，13B 约 260B token）。若已知算力预算 C，则可用 C≈6ND 反解：D=C/(6N)，并与 20N 取较小可行值。当高质量数据不足以支撑 20N 时，只能采用多 epoch（重复训练）或缩小模型来贴合数据上限。实际规划还需把 D 换算成训练步数 steps=D/(global_batch_size×seq_len)，并结合学习率预热与余弦衰减安排。",
  "approach": "先用经验比例 D≈20N 粗估数据需求，再用算力约束 C=6ND 反解验证，二者联立还可推出在固定算力下的最优参数量 N=√(C/120)。当高质量数据量低于 20N 时，采用「数据受限」策略：要么多 epoch 训练并配合数据重采样/课程学习/早停，要么等比例缩小模型使 N 与可用数据匹配。最终把 token 预算 D 换算成训练步数与显存占用，纳入整体训练计划。",
  "explanationFocus": "是什么：训练 token 量估算（token budget estimation）是指在已知模型参数量 N 或总算力预算 C 时，推算「应该喂多少训练 token D」，使得在给定约束下算力利用最优、模型性能最大化。在 Chinchilla Scaling Laws 的结论下，计算最优（compute-optimal）训练量满足 D≈20N（即训练 token 约为参数量的 20 倍）。当算力充足时，更大的模型配更多数据共同 scaling；当数据受限时，则需要反过来约束模型规模，避免「大马拉小车」或「小马拉大车」。",
  "bruteForce": "如果拍脑袋定一个固定 token 量（比如所有模型都无脑喂 300B token），会带来两类问题：对 70B 这类大模型而言 300B 远小于 20N（1.4T），模型严重欠训练、能力没被充分激发；对 1B 这类小模型而言 300B 又远大于 20N（20B），被迫多 epoch 导致过拟合与记忆化。更糟的是忽视算力约束，可能出现「算不全」（预算不够跑完）或「算浪费」（算力没用满）的情况，整体训练效率低下。",
  "derivation": [
    "为什么需要：随着模型规模扩大，所需训练数据量也在增长，需要提前规划语料规模、训练步数与算力预算，避免中途断料（数据耗尽）或严重欠训练（数据不够）。Scaling Laws 告诉我们数据与参数需协同 scaling，否则任一方过剩都是浪费。",
    "怎么实现：最直接的经验公式是 D=20×N（Chinchilla 计算最优）。若已知总算力 C，则用前向+反向的近似 FLOPs 公式 C≈6ND 反解 D=C/(6N)；联立两者可得在固定算力下最优参数量 N=√(C/120)，以及对应的最优 D=√(C/120)×20。",
    "有什么代价：高质量数据有限时 D 达不到 20N，只能多 epoch（重复看数据）或接受次优、缩小模型；这会带来过拟合与记忆化风险。反之，推理优先场景常把 D 取到数百倍 N（过度训练/uptraining）以榨干模型能力，但训练成本陡增。",
    "怎么评测：观察训练损失是否随步数平稳下降、验证困惑度是否饱和，判断还欠训练与否；做 ablation 对比不同 D（如 10N/20N/40N）下下游任务（MMLU、GSM8K）的得分拐点；监控记忆化指标确认多 epoch 未导致背诵。"
  ],
  "invariant": "核心不变式：默认按 D≈20N 规划，受数据上限时改用多 epoch 或缩模型；受算力上限时按 D=C/(6N) 封顶。无论哪种修正，都应保证「模型规模、数据量、算力」三者自洽（建议二次核对前沿模型实际比例，因为新一代模型有时采用更高 data-to-param 比）。",
  "walkthrough": "以 7B 模型为例：N=7×10⁹，按 Chinchilla 比例 D≈20×7e9=1.4×10¹¹，即约 140B token。若算力预算只允许 C=8×10²² FLOPs，则 D≈C/(6N)=8e22/(4.2e10)≈1.9×10¹²（1.9T token），说明算力还绰绰有余、可更充分训练，此时瓶颈在数据而非算力。反过来，若只有 100B token 可用，则受数据约束只能多 epoch（约 100B/140B≈0.7 epoch，若要到 140B 需约 1.4 个 epoch）或把模型缩到 N≈5B 以贴合数据。",
  "edgeCases": [
    "数据不足时 D 远小于 20N，被迫多 epoch，易过拟合与记忆化，需要早停与数据重采样。",
    "推理优先场景（如为最强 Base 模型 uptraining）D 可取到数百倍 N，属于「过训练」但收益递减。",
    "MoE 模型里决定比例的应是激活参数（activated params）而非总参数，直接用总参数估算会严重高估数据需求。",
    "序列长度或 batch 受限导致无法在合理步数内吃完 D，需要重新切分训练计划。"
  ],
  "code": "def estimate_tokens(params, C_flops=None):\n    D_from_N = 20 * params\n    if C_flops:\n        return min(D_from_N, C_flops / (6 * params))\n    return D_from_N",
  "codeNotes": [
    "返回 min 表示同时受「比例」与「算力」双重约束，取较小可行训练量，避免计划超出任何一边。",
    "真实训练还需把 token 数换算成 steps = D / (batch × seq_len)，并配合学习率预热与余弦衰减；C≈6ND 是含前向+反向的近似。",
    "对 MoE 应传入「激活参数量」而非总参数量，否则估算失真。"
  ],
  "complexity": "估算本身是 O(1) 的常数级运算（几次乘法/除法）。真正的复杂度在于把 token 预算 D 落地：训练步数 steps=D/(global_batch_size×seq_len) 决定迭代轮数；单步 FLOPs≈6ND/S（S 为并行度）决定单步耗时。当数据不足需多 epoch 时，实际有效 epoch 数 = D/(可用数据量)，关系到过拟合风险；当采用 MoE 时，决定比例的应是「激活参数量」而非总参数。",
  "followUps": [
    {
      "question": "若数据只有 100B 但模型 7B 怎么办？",
      "answer": "只能在 100B 上多 epoch 训练，但需配合数据重采样（降低重复样本的抽样权重）、课程学习与早停，避免模型单纯背诵；或者更务实的做法是把模型缩小到约 5B 以贴合数据，使比例重回 20N 附近。若强行用 7B 吃 100B 又要多 epoch，下游易出现过拟合信号（验证损失早升）。"
    },
    {
      "question": "怎么把 token 数转成训练 steps？",
      "answer": "steps = total_tokens / (global_batch_size × seq_len)。例如 140B token、global_batch=4M token、seq_len=4096，则约需 35K 步。再结合学习率预热（前 2K 步线性升）与余弦衰减到尾声，即可排布完整训练 schedule。注意 global_batch 是「所有并行卡上的总批大小」而非单卡。"
    },
    {
      "question": "新一代模型（如过训练到 30N~40N）还适用 20N 吗？",
      "answer": "20N 是 Chinchilla「计算最优」的经典结论，但近年很多前沿模型主动采用更高的 data-to-param 比（如 30N~40N 甚至更多）来 uptraining，换取更强的最终能力，代价是更多算力。所以 20N 应作为起点而非终点：在算力允许、数据充足时，可向上探索并做 ablation 找本任务的拐点。"
    }
  ],
  "followUpAnswers": [
    "只能在 100B 上多 epoch 训练，但需配合数据重采样（降低重复样本的抽样权重）、课程学习与早停，避免模型单纯背诵；或者更务实的做法是把模型缩小到约 5B 以贴合数据，使比例重回 20N 附近。若强行用 7B 吃 100B 又要多 epoch，下游易出现过拟合信号（验证损失早升）。",
    "steps = total_tokens / (global_batch_size × seq_len)。例如 140B token、global_batch=4M token、seq_len=4096，则约需 35K 步。再结合学习率预热（前 2K 步线性升）与余弦衰减到尾声，即可排布完整训练 schedule。注意 global_batch 是「所有并行卡上的总批大小」而非单卡。",
    "20N 是 Chinchilla「计算最优」的经典结论，但近年很多前沿模型主动采用更高的 data-to-param 比（如 30N~40N 甚至更多）来 uptraining，换取更强的最终能力，代价是更多算力。所以 20N 应作为起点而非终点：在算力允许、数据充足时，可向上探索并做 ablation 找本任务的拐点。"
  ],
  "pitfalls": [
    "把 20N 当成死规则，忽视高质量数据可得性上限，导致计划无法落地或被迫疯狂多 epoch。",
    "用 MoE 的总参数而非激活参数估算，把数据需求虚高数倍。",
    "只算 token 不换算成 steps，忽视 batch/seq_len/并行度带来的实际训练天数偏差。"
  ],
  "beginnerSummary": "模型越大越要「读书多」：参数量乘以 20 大概就是该喂的 token 数；书不够就只能反复读同一本（多 epoch），或者换本薄点的书（缩小模型）。这样既不会饿着大模型，也不会让小模型读吐。",
  "prerequisites": [
    "Chinchilla / Scaling Laws：理解参数与数据量需协同 scaling 的计算最优关系。",
    "FLOPs 估算（C≈6ND）：理解前向+反向的算力近似公式。",
    "batch / step / epoch 概念：理解 token 预算如何换算成实际训练步数。",
    "过拟合与早停：理解多 epoch 训练的风险与应对。"
  ],
  "workedExample": [
    "13B 模型：D≈20×13e9=2.6×10¹¹，即约 260B token；若每步 global_batch=4M token、seq_len=4096，则约需 65K 步。",
    "若仅 200B 数据可用而目标 260B token，则最多约 1.3 个 epoch，需在 200B 上多 epoch 或缩小模型到约 10B。",
    "算力 C=1e23 FLOPs，则 D=C/(6N)=1e23/(6×13e9)≈1.28×10¹²（1.28T），说明算力充足、瓶颈在数据。"
  ],
  "lineByLine": [
    "D_from_N = 20 * params：按 Chinchilla 比例粗估最优训练 token 量，是最常用的第一步。",
    "if C_flops: 当给定算力预算时，用 C≈6ND 反解 D=C_flops/(6×params) 作为算力上限。",
    "return min(D_from_N, C_flops/(6*params))：取「比例约束」与「算力约束」中的较小可行值，保证两者都不超标。",
    "补充：真实训练还需 steps = D / (global_batch_size × seq_len) 才能落地为具体训练计划。"
  ],
  "diagram": "N(参数) ──×20──▶ D(最优 token)\n   │\n   └─ C=6ND ─▶ 受算力封顶"
};
