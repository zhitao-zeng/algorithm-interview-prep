export default {
  "id": "dt-megatron-3d",
  "kind": "concept",
  "category": "分布式训练",
  "title": "Megatron 3D 并行",
  "difficulty": "Hard",
  "prompt": "请讲讲 Megatron 的 3D 并行（TP/PP/EP + DP）是如何组合的，TP 的 all-reduce 如何切分，PP 的 micro-batch 与 bubble 怎么处理，EP 的 expert 分片是什么？",
  "quickAnswer": "3D 并行 = 张量并行(TP)切矩阵维度、流水线并行(PP)切层、专家并行(EP)切 MoE 专家，再叠加数据并行(DP)。TP 在层内把权重按行/列拆分，用一次 all-reduce 替代整矩阵乘法；PP 把模型按层分段，配合 micro-batch 和 1F1B 调度隐藏通信，但存在 pipeline bubble 空闲；EP 把不同 expert 放到不同卡，token 经 all-to-all 路由。三者正交组合可在数千卡上训超大模型。",
  "beginnerSummary": "一张卡放不下大模型，就把模型“横切竖切”。TP 把一层矩阵拆到多卡一起算，PP 把不同层放到不同卡像工厂流水线，EP 专门处理混合专家里的大量专家，DP 则是多份数据同时跑。把它们拼起来就是 3D 并行。",
  "explanationFocus": "是什么：Megatron-LM 提出的 3D 并行是张量并行(TP)、流水线并行(PP)、专家并行(EP) 与数据并行(DP) 的正交组合。TP 在单层内沿隐藏维切分矩阵乘法，PP 沿层维切分把模型变流水线，EP 沿 expert 维切分 MoE 专家，DP 在最外层复制并分数据。",
  "approach": "TP 用 Megatron 的行列切分：列并行把权重 W 按输出维分块各自做 GEMM 再拼接，行并行把输入 X 分块各自乘再 all-reduce 求和，从而把激活/权重的显存与计算均摊。PP 把网络切成若干 stage，每个 micro-batch 依次流过，用 1F1B 调度让后向与前向重叠以降低 bubble。EP 把 expert 分散到不同 rank，router 用 all-to-all 把 token 送到对应 expert 再送回。",
  "code": "import torch\nfrom megatron.core.tensor_parallel import ColumnParallelLinear\n\n# 列并行：把输出维切成 tp_size 份，各卡算一份再拼接\ndef build_tp_layer(hidden, ffn):\n    fc = ColumnParallelLinear(hidden, ffn, bias=False)\n    return fc  # 前向自动做 gather/reduce",
  "complexity": "通信 O(tokens * hidden) per TP层；bubble 占比约 (pp-1)/(m+pp-1)，m 为 micro-batch 数",
  "derivation": [
    "为什么需要：单卡显存/算力无法容纳百亿级以上模型，单一并行维度都有瓶颈（TP 受限于单节点带宽，PP 有 bubble，DP 冗余显存）。",
    "怎么实现：TP 用矩阵行列拆分+层内 all-reduce；PP 用 stage 切层+activation 重算/1F1B；EP 用 all-to-all 路由 token；DP 在最外层对 replica 做梯度同步。",
    "有什么代价：TP 引入高频 all-reduce（需高带宽 NVLink）；PP 有 pipeline bubble 浪费算力；EP 引入 all-to-all 通信且易负载不均。",
    "怎么评测：看 MFU（模型算力利用率）、bubble 比例、通信时间占比；调 pp/tp/ep/dp 网格使计算和通信均衡。"
  ],
  "edgeCases": [
    "TP 只能在节点内高效（依赖 NVLink），跨节点 TP 会因 IB 带宽不足而崩性能。",
    "PP 的 micro-batch 数 m 太小会让 bubble 占比飙升，需 m ≥ pp-1 才有合理重叠。",
    "EP 中某些 expert 被过度路由（负载倾斜）时，需 aux loss 或 drop 机制，否则长尾卡成为瓶颈。"
  ],
  "pitfalls": [
    "把 TP 设得过大却跨节点，all-reduce 走慢速 IB 反而比 DP+PP 更慢。",
    "忽略 PP 的 activation 重算代价，误以为切层零成本，导致吞吐不升反降。"
  ],
  "prerequisites": [
    "矩阵乘法与 GEMM 的维度关系",
    "数据并行 DDP 与 all-reduce 基础"
  ],
  "workedExample": [
    "例：64 卡训练 175B，可设 tp=8（节点内）、pp=4、dp=2，总并行度 8*4*2=64；每层 TP 算完一次 all-reduce，4 个 stage 以 micro-batch 流水。",
    "例：PP bubble 计算：pp=4, m=8 时 bubble 占比 (4-1)/(8+4-1)=3/11≈27%；若 m=2 则 3/5=60%，说明 micro-batch 必须足够多。"
  ],
  "lineByLine": [
    "`from megatron.core.tensor_parallel import ColumnParallelLinear`：引入列并行线性层。",
    "`def build_tp_layer(hidden, ffn)`：定义按隐藏维到 ffn 维的 TP 层构造。",
    "`fc = ColumnParallelLinear(hidden, ffn, bias=False)`：权重按输出维切成 tp_size 份，每卡持一份。",
    "`return fc`：前向时各卡独立算分块 GEMM，框架自动做必要的 all-gather/reduce。"
  ],
  "followUps": [
    {
      "question": "TP 的列并行和行并行为什么要配对使用？",
      "answer": "列并行把 Y=XA 中 A 按列切，输出需拼接；若下一层接行并行把 A 按行切，则前一个列并行的 all-gather 可与后一个的行并行输入分块抵消，中间只需一次 all-reduce，避免两次额外通信。"
    },
    {
      "question": "1F1B 如何减小 PP bubble？",
      "answer": "朴素满流水要先跑完所有前向再后向，bubble 大；1F1B 在积攒够 warmup 后每完成一个前向立即安排一个后向，使后向与前向在不同 stage 重叠，把空闲降到 (pp-1)/(m+pp-1)。"
    }
  ],
  "followUpAnswers": [
    "列并行把 Y=XA 中 A 按列切，输出需拼接；若下一层接行并行把 A 按行切，则前一个列并行的 all-gather 可与后一个的行并行输入分块抵消，中间只需一次 all-reduce，避免两次额外通信。",
    "朴素满流水要先跑完所有前向再后向，bubble 大；1F1B 在积攒够 warmup 后每完成一个前向立即安排一个后向，使后向与前向在不同 stage 重叠，把空闲降到 (pp-1)/(m+pp-1)。"
  ]
};
