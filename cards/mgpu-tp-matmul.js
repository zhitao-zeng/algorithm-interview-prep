export default {
  "kind": "concept",
  "id": "mgpu-tp-matmul",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "TP 如何切分矩阵乘法",
  "prompt": "张量并行中矩阵乘法是怎么按行切和列切的？",
  "quickAnswer": "对 Y = X·W：列切把 W 按列拆成 [W1|W2]，各卡用完整 X 算 X·Wi 再直接拼接成 Y(无通信)；行切把 W 按行拆、各卡持 Wi 与完整 X，输出需 all-reduce 求和。Megatron 把两者组合——列切层后接行切层，让中间结果恰好是各卡局部值、只需一次 all-reduce，最大化计算/通信重叠。",
  "approach": "列切免通信(拼接)，行切需 all-reduce(求和)；组合使用。",
  "explanationFocus": "是什么：TP 把大矩阵乘按列切(各卡算列块后拼接)或按行切(各卡算行块后 all-reduce 求和)分配到多卡，以分摊权重与显存。",
  "bruteForce": "单卡做完整 X·W → 显存/算力不足。",
  "derivation": [
    "为什么需要：单层权重矩阵巨大，单卡存不下也乘不动，需要把它拆开。",
    "怎么实现：列切 W=[W1 W2]，Y=[XW1 XW2] 各自独立可拼接；行切令 W=[W1;W2]，Y=XW1+XW2 需 all-reduce 求和；Megatron 让一个 GEMM 的列切输出正好喂给下一个 GEMM 的行切，中间只一次 all-reduce。",
    "有什么代价：行切引入 all-reduce 通信；列切虽免通信但需保证后续能衔接以减少通信次数。",
    "怎么评测：切分后单卡 GEMM 规模、通信次数与量、数值等价性。"
  ],
  "invariant": "无论行列切，聚合后的 Y 与单卡 X·W 完全相等。",
  "walkthrough": "W 为 h×h、tp=2：列切后每卡算 h×h/2 的 GEMM；行切后两卡结果 all-reduce 求和得完整 Y。",
  "edgeCases": [
    "列切适合升维(输出可拼)，行切适合降维(输出可加)。",
    "两 GEMM 串联时精心设计可省一次通信。",
    "切分维需整除。"
  ],
  "code": "# Python (概念)\ndef tp_gemm_col(x, W_col_shard):        # 列切: 免通信\n    return x @ W_col_shard              # 各卡结果直接 concat\ndef tp_gemm_row(x, W_row_shard, world): # 行切: 需 all-reduce\n    return all_reduce_sum(x @ W_row_shard, world)",
  "codeNotes": [
    "列切输出沿特征维拼接。",
    "行切输出沿 batch 维求和。"
  ],
  "complexity": "单卡 GEMM 规模 1/tp；行切额外一次 all-reduce。",
  "followUps": [
    {
      "question": "为什么 Megatron 要列切接行切？",
      "answer": "因为列切层输出是各卡独立块，正好可作为行切层的输入分片，两个 GEMM 之间只需一次 all-reduce 就能衔接，把通信次数压到每层一次。"
    },
    {
      "question": "行切和列切谁要通信？",
      "answer": "列切各卡结果直接拼接、不需通信；行切各卡结果需 all-reduce 求和，必须通信。"
    }
  ],
  "followUpAnswers": [
    "列切→行切只需一次 all-reduce 衔接。",
    "行切需通信，列切不需。"
  ],
  "pitfalls": [
    "混淆列切(拼)与行切(加)的合并方式。",
    "串联 GEMM 时多算一次不必要的 all-reduce。"
  ],
  "beginnerSummary": "把一张大乘法表横着撕成几列，每人算自己那几列再把纸条拼起来(列切，不用对答案)；或者竖着撕成几行，每人算几行最后把结果加起来(行切，需要对答案 all-reduce)。聪明做法是让上一刀竖撕的半成品正好接下一刀横撕，省一次对答案。",
  "prerequisites": [
    "矩阵乘法可沿行/列拆分。",
    "concat 与 sum 的合并语义。",
    "已了解 TP 整体动机。"
  ],
  "workedExample": [
    "W 为 h×h、tp=2，列切每卡算 h×h/2。",
    "行切两卡结果 all-reduce 得完整 Y。"
  ],
  "lineByLine": [
    "决定按列还是按行切权重。",
    "列切: 各卡独立算并拼接。",
    "行切: 各卡算并 all-reduce 求和。",
    "串联时让列切输出喂行切输入省通信。"
  ],
  "diagram": "列切: Y=[X·W1 | X·W2]  (拼, 无通信)\n行切: Y = (X·W1)+(X·W2) (all-reduce 求和)\nMegatron: 列切GEMM →(局部)→ 行切GEMM (+1 all-reduce)"
};
