export default {
  "kind": "concept",
  "id": "mgpu-tp",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "张量并行 TP 切分原理",
  "prompt": "张量并行（Tensor Parallelism）是怎么切分大模型的？",
  "quickAnswer": "张量并行把单层的大矩阵乘法沿行或列切到多张卡上：列切(把权重 W 按列拆成多份，各卡算一部分再拼接)用于 FFN 的升维；行切(各卡持有完整输入、部分权重，结果 all-reduce 求和)用于降维。每层需要一次 all-reduce 通信用来汇总，适合单机多卡高带宽(NVLink)场景。",
  "approach": "单层矩阵按行/列切多卡，层内 all-reduce 汇总。",
  "explanationFocus": "是什么：TP 把单层权重矩阵切分到多卡，列切算部分再拼接、行切算部分再 all-reduce 求和。",
  "bruteForce": "单卡放不下大模型 → 直接 OOM，无法推理/训练。",
  "derivation": [
    "为什么需要：单卡显存/算力不足以容纳大模型，需把计算和参数拆到多卡。",
    "怎么实现：对 Y=X·W，列切 W=[W1|W2]，各卡算 X·Wi 再拼接；行切（W 按行拆 [W1;W2]，Y=XW）时，数学上等价于各卡持输入分片 Xi 与权重分片 Wi，各自算 Xi·Wi 再 all-reduce 求和；Megatron 中因前一层列切已 all-reduce 使 X 完整到达，故表现为‘各卡持完整 X 与 Wi’，但维度上仍是 X 按输入维分片。面试需说明框架约定。",
    "有什么代价：每层都有一次 all-reduce 通信，通信量与隐藏维成正比；卡间带宽不足会成为瓶颈，故适合 NVLink 等高带宽互联。",
    "怎么评测：看切分后单卡显存是否装下、端到端吞吐与单卡基线的加速比、通信占比。"
  ],
  "invariant": "TP 下各卡持有部分权重（及按切分方式对应的部分/完整输入）；列切直接拼接、行切在层输出处 all-reduce；数学结果等价于单卡。行切时‘完整 X’是 Megatron 中前层列切 all-reduce 后的结果，本质仍是输入分片。",
  "walkthrough": "隐藏维 4096 切 2 卡：每卡持 2048 维权重，前向各算一半再 all-reduce，结果同单卡 4096。",
  "edgeCases": [
    "LayerNorm/激活需先同步输入或放在切分边界。",
    "通信与计算可重叠(计算同时发下一层通信)降开销。",
    "切分数需整除隐藏维。"
  ],
  "code": "# Python (概念)\ndef tp_matmul(x, W_shard, rank, world):\n    y_local = x @ W_shard            # 各卡算部分\n    y = all_reduce_sum(y_local)      # 跨卡求和\n    return y",
  "codeNotes": [
    "列切: Y=[XW1, XW2] 直接拼。",
    "行切: 输出需 all-reduce 求和。"
  ],
  "complexity": "单卡显存降为 1/tp；每层一次 all-reduce，通信 O(hidden)。",
  "followUps": [
    {
      "question": "TP 和 DP 区别？",
      "answer": "DP 是数据维度复制多份模型各吃不同 batch，梯度需同步；TP 是把单层矩阵拆开，单样本的计算也跨卡，通信在层内。"
    },
    {
      "question": "为什么 TP 依赖高带宽？",
      "answer": "每层都 all-reduce，通信频繁且量不小；低带宽互联(如跨机以太网)会让通信盖过计算收益，故 TP 多用于单机 NVLink。"
    }
  ],
  "followUpAnswers": [
    "TP 适合单机高带宽。",
    "DP 适合跨机扩样本并行。"
  ],
  "pitfalls": [
    "以为切分后结果不同——TP 数学等价于单卡。",
    "忽视每层 all-reduce 的通信成本。"
  ],
  "beginnerSummary": "一个人算大乘法太慢也记不下，就把算式拆给几个人：每人只算其中几列，最后把大家的半成品加起来。TP 就是这样把一层神经网络的大矩阵拆到多张显卡，每卡只扛一部分，算完再汇总的。",
  "prerequisites": [
    "大模型单层矩阵巨大、单卡装不下。",
    "矩阵乘法可沿行/列拆分。",
    "卡间可通信(all-reduce)。"
  ],
  "workedExample": [
    "隐藏维 4096 切 2 卡，每卡持 2048 维权重。",
    "各卡算一半再 all-reduce，结果 = 单卡。"
  ],
  "lineByLine": [
    "按列或行切分权重。",
    "各卡持部分权重与(或)部分输入。",
    "本卡算局部结果。",
    "all-reduce 汇总成完整输出。"
  ],
  "diagram": "Y = X·W, W=[W1|W2]\n卡0: X·W1 ─┐\n卡1: X·W2 ─┴─concat → Y   (列切)\n或: 行切各算→ all-reduce 求和"
};
