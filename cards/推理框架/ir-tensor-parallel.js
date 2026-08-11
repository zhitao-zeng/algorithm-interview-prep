export default {
  "id": "ir-tensor-parallel",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "张量并行实现",
  "prompt": "张量并行（Tensor Parallelism）如何在多卡间切分单个大模型层的计算？",
  "quickAnswer": "对线性层做列切分（column-parallel）时各卡输出 chunk 直接拼接（concat），无需 all-reduce；其后的行切分（row-parallel）层才把各卡 partial 求和，只需一次 all-reduce(sum)。注意力头也可按头切分，使单卡只持有部分参数与激活。",
  "approach": "对线性层权重做列切分（Megatron-LM 风格），各 rank 独立算 Y_i=A·X_i，再 all-reduce 得到完整输出；注意切分点要匹配 GEMM 维度避免额外通信。",
  "explanationFocus": "是什么：张量并行是把单层内的权重矩阵沿特定维度切到多张卡上，各卡并行计算该层的一部分，再通过集合通信（all-reduce/all-gather）合并结果，从而放得下单卡放不下的模型。",
  "bruteForce": "朴素做法：单卡放不下整模型只能靠流水线或卸载，单层计算无法并行，显存与算力都受限。",
  "invariant": "不变式：列切分各卡 concat、行切分各卡经 all-reduce(sum) 合并后的结果，等于在单卡上用完整权重计算的输出（数值一致）。",
  "walkthrough": "执行追踪：输入 X 广播到各 rank；各 rank 用本地列切片 W_i 算 Z_i；all-reduce(sum) 得 Z=ΣZ_i；下一层若行切分则先 all-gather 再乘。",
  "complexity": "说明：单卡显存降为 1/N，计算并行；代价是每层一次 all-reduce 通信，受卡间带宽限制，需与流水线并行搭配。",
  "beginnerSummary": "模型太大一张卡装不下。张量并行把一层的大矩阵切成几块分到多卡，各算各的再求和，单卡只扛一部分。",
  "diagram": "X -> rank0:[W0]  -> Z0 --\n     rank1:[W1]  -> Z1 --> all-reduce(sum) -> Z\n     rank2:[W2]  -> Z2 --/",
  "code": "def tp_linear_all_reduce(x, W_local, rank, world):\n    z = x @ W_local.T          # 列切片局部计算\n    z = all_reduce(z, op='sum')  # 跨卡求和恢复完整输出\n    return z",
  "derivation": [
    "为什么需要：单卡显存/算力不足以容纳与加速超大模型单层，需在卡间切分权重以并行计算。",
    "怎么实现：对权重做列切分使 GEMM 可并行，各卡算部分输出经 all-reduce 求和；对后续行切分层则先 all-gather 输入再本地乘，减少通信次数。",
    "有什么代价：每层引入一次集合通信，受 NVLink/IB 带宽制约；切分不当会增加通信量；需保证各卡计算同步。",
    "怎么评测：对比不同 TP 度下的单步延迟、显存峰值与多卡扩展效率，关注通信占比与带宽利用率。"
  ],
  "edgeCases": [
    "concat/切分维度必须对齐 GEMM 输出维度，否则 all-reduce 语义错误。",
    "注意力头数需能被 TP 度整除，按头切分时保证头完整。",
    "最后一层通常行切分后需 all-gather 还原，不能漏通信。",
    "TP 度超过卡间带宽收益临界点后通信成为瓶颈，扩展效率下降。"
  ],
  "pitfalls": [
    "切分维度选错，导致各卡输出无法简单求和还原。",
    "忘记在层间插入必要的 all-reduce/all-gather，结果跨卡不一致。"
  ],
  "prerequisites": [
    "矩阵乘法维度与分块",
    "集合通信 all-reduce/all-gather 与多卡拓扑"
  ],
  "workedExample": [
    "TP=4 切一个 4096×4096 权重：每卡持 4096×1024，GEMM 并行，all-reduce 合并输出。",
    "注意力 32 头、TP=8：每卡负责 4 个头，head 维度切分后各自算注意力再合并。"
  ],
  "lineByLine": [
    "W_local 是完整权重的列向切片，保证各卡覆盖不同输出通道。",
    "x @ W_local.T 在本地完成部分 GEMM，无需等待他卡。",
    "all_reduce(sum) 把各卡部分结果求和，等价于完整权重计算。"
  ],
  "codeNotes": [
    "Megatron-LM 采用\"列切+行切\"配对，使相邻两层间只需一次 all-reduce，最小化通信次数。"
  ],
  "followUps": [
    {
      "question": "张量并行与流水线并行怎么配合？",
      "answer": "TP 在层内切分、通信频繁需高带宽域（如 NVLink），PP 在层间切分、通信少但引入 bubble；二者常组合（TP×PP×DP）以兼顾显存与扩展。"
    },
    {
      "question": "TP 度受什么限制？",
      "answer": "受卡间带宽与单层可切分维度限制；当通信开销追上计算收益时继续增大 TP 度反而变慢，且头数/隐藏维需可整除。"
    }
  ],
  "followUpAnswers": [
    "TP 在层内切分、通信频繁需高带宽域（如 NVLink），PP 在层间切分、通信少但引入 bubble；二者常组合（TP×PP×DP）以兼顾显存与扩展。",
    "受卡间带宽与单层可切分维度限制；当通信开销追上计算收益时继续增大 TP 度反而变慢，且头数/隐藏维需可整除。"
  ],
  "kind": "concept"
};
