export default {
  "id": "dt-moe-train",
  "kind": "concept",
  "category": "分布式训练",
  "title": "MoE 训练",
  "difficulty": "Hard",
  "prompt": "请讲讲 MoE 训练中的 expert parallelism、负载均衡（aux loss / router z-loss）、token dropping 与 fine-grained MoE 分别是什么？",
  "quickAnswer": "MoE 用多个专家 FFN 加 router 选 top-k，每个 token 只激活少数专家，算力近稠密但参数量大。Expert parallelism 把不同 expert 放到不同设备，token 经 all-to-all 路由。负载失衡会让部分专家过载，用 aux loss（鼓励均匀路由）与 router z-loss（抑制过大 logit）缓解。token dropping 在容量超限时丢弃溢出 token。fine-grained MoE 用更多更小专家提升粒度与利用率。",
  "beginnerSummary": "普通模型每层一个前馈网络，MoE 每层放多个“专家”，由一个路由器挑几个最适合当前词的专家来算。这样模型很大却每次只动用一小部分，省算力。难点是别让某些专家太忙、某些太闲。",
  "explanationFocus": "是什么：MoE（Mixture-of-Experts）在 Transformer 的 FFN 层用 N 个并行专家加一个 router，每个 token 只被路由到 top-k 个专家计算，从而在参数量大幅扩张的同时保持每 token 计算量近似不变。训练需解决专家分布、负载均衡与并行放置。",
  "approach": "每个 MoE 层有 router(W_r) 产出 logits，取 top-k 专家并归一权重；expert parallelism 把专家分布到不同 rank，token 通过 all-to-all 送到目标专家再送回。为防止倾斜，加 aux loss（使路由概率与专家利用率一致）和 z-loss（惩罚大 logit 防止 softmax 塌缩）。容量超限的 token 被 drop 或 overflow 处理。fine-grained 增加专家数、减小每专家尺寸提升选择粒度。",
  "code": "import torch\nimport torch.nn as nn\n\nclass Expert(nn.Module):\n    def __init__(self, d):\n        super().__init__(); self.fc = nn.Linear(d, d)\n    def forward(self, x):\n        return self.fc(x)  # 各专家分布在不同 rank",
  "complexity": "每 token 计算 O(k*d)（k 专家）；通信 all-to-all O(tokens)；参数量 O(N*d)",
  "derivation": [
    "为什么需要：稠密模型扩参必扩算力，MoE 解耦“参数量”与“每 token 计算”，用稀疏激活在固定算力下放大模型容量。",
    "怎么实现：router 选 top-k；expert parallelism 跨设备放专家；all-to-all 路由 token；aux/z-loss 保均衡；容量+drop 控显存。",
    "有什么代价：all-to-all 通信密集且易成瓶颈；负载不均导致设备利用率低；router 不优会塌缩到少数专家。",
    "怎么评测：看 expert 利用率方差、路由熵、被 drop 的 token 比例，以及同算力下的下游精度。"
  ],
  "edgeCases": [
    "某些专家长期不被选中（死专家），浪费参数且降低容量，需要 aux loss 或随机路由缓解。",
    "top-k 中 k 个专家恰在不同 rank 时，单 token 触发多次跨设备通信，小 batch 下延迟高。",
    "容量因子设太小导致大量 token 被 drop，训练信号丢失；太大则显存浪费。"
  ],
  "pitfalls": [
    "只加 aux loss 而系数过大，会牺牲模型质量换取均衡，需调参。",
    "把 MoE 当普通层做 TP 而未做 expert parallelism，导致 all-to-all 退化、负载无法分散。"
  ],
  "prerequisites": [
    "Transformer FFN 层与 top-k 选择",
    "All-to-all 集合通信与 expert parallelism"
  ],
  "workedExample": [
    "例：每层 64 专家，top-2，每 token 仅算 2/64 的专家，参数量扩 32 倍但算力仅约 2 倍；专家分布到 8 卡，all-to-all 按目标 rank 分发。",
    "例：某步路由 30% token 都选 expert 0，超过容量（如 1.25×平均），多出的 5% token 被 drop，用 aux loss 拉平分布后 drop 降到 <1%。"
  ],
  "lineByLine": [
    "`class Expert(nn.Module)`：定义一个专家（这里为简化，实际每专家在不同 rank）。",
    "`self.fc = nn.Linear(d, d)`：专家本质是一个 FFN 子层。",
    "`def forward(self, x)`：接收被路由到本专家的 token 子集。",
    "`return self.fc(x)`：在本地（本 rank）完成该专家计算，结果再经 all-to-all 送回原设备。"
  ],
  "followUps": [
    {
      "question": "aux loss 和 z-loss 各自解决什么问题？",
      "answer": "aux loss 鼓励每个专家被选中的总体概率与其实际处理 token 占比一致，缓解负载不均；z-loss 对 router logit 的平方做惩罚，防止个别 logit 过大使 softmax 塌缩到单一专家，二者互补。"
    },
    {
      "question": "fine-grained MoE 为什么更优？",
      "answer": "把大专家拆成更多小专家（如 64 个一半尺寸的专家配合 top-2/4），提升每 token 可选粒度与组合多样性，在相近算力下提高专家利用率与模型表达，且更易均衡。"
    }
  ],
  "followUpAnswers": [
    "aux loss 鼓励每个专家被选中的总体概率与其实际处理 token 占比一致，缓解负载不均；z-loss 对 router logit 的平方做惩罚，防止个别 logit 过大使 softmax 塌缩到单一专家，二者互补。",
    "把大专家拆成更多小专家（如 64 个一半尺寸的专家配合 top-2/4），提升每 token 可选粒度与组合多样性，在相近算力下提高专家利用率与模型表达，且更易均衡。"
  ]
};
