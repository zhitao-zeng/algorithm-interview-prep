export default {
  "kind": "concept",
  "id": "mgpu-sp",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "序列并行 SP 原理",
  "prompt": "序列并行（Sequence Parallelism）解决了张量并行的哪个短板？",
  "quickAnswer": "TP 沿隐藏维切时，LayerNorm 和 Dropout 这类操作仍需完整输入、会在每张卡复制一份激活，显存随序列长度线性膨胀。序列并行把输入序列也沿长度维切到各卡，让这些\"不能切\"的层在序列维并行，配合 TP 的 all-gather/reduce-scatter 只在边界通信，从而把激活显存从 O(seq×hidden) 降到 O(seq/tp×hidden)。",
  "approach": "在 TP 基础上，把序列维也切分，使 LayerNorm/Dropout 沿序列并行。",
  "explanationFocus": "是什么：SP 是把输入序列长度维切到多卡，专门处理 TP 中无法沿隐藏维切的操作(如 LayerNorm、Dropout)，让激活显存随序列长度也得到分摊。",
  "bruteForce": "长序列下即使 TP，LayerNorm 仍复制完整激活 → 显存爆。",
  "derivation": [
    "为什么需要：TP 按隐藏维切后，LayerNorm/Softmax/Dropout 需要完整隐藏向量，被迫在每卡保留完整激活副本，长序列时显存爆炸。",
    "怎么实现：把序列维 s 切到 tp 卡；在这些层前用 all-gather 拼回完整序列、算完用 reduce-scatter 再切回，使每层输入/输出都沿序列分片。",
    "有什么代价：相对纯 TP 多了 all-gather/reduce-scatter 通信，但换来了激活显存的显著下降，长序列场景净收益大。",
    "怎么评测：固定序列长下峰值显存、可支持的最大序列长度、吞吐变化。"
  ],
  "invariant": "SP 与 TP 组合后，单卡激活显存 ≈ O(s/tp × h)，数学结果不变。",
  "walkthrough": "序列长 8192、tp=8：每层激活从 8192×h 降到 1024×h，显存省约 8 倍。",
  "edgeCases": [
    "注意力计算本身仍需序列维交互，SP 主要靠切分前后处理层获益。",
    "通信与 TP 的 all-reduce 叠加，需仔细排布。",
    "只在序列很长时收益明显。"
  ],
  "code": "# Python (概念)\ndef sp_layernorm(x_shard, tp_group):\n    x_full = all_gather(x_shard, tp_group)   # 拼回完整序列\n    y = layernorm(x_full)\n    return reduce_scatter(y, tp_group)        # 再按序列切回",
  "codeNotes": [
    "all_gather 在层前、reduce_scatter 在层后。",
    "SP 通常套在 TP 之外形成 TP+SP。"
  ],
  "complexity": "激活显存 O(s/tp·h)；新增 all-gather+reduce-scatter 各一次。",
  "followUps": [
    {
      "question": "SP 和 TP 必须一起用吗？",
      "answer": "实践中 SP 是 TP 的互补扩展：TP 切隐藏维，SP 切序列维，二者共用通信组，单独 SP 没有意义。"
    },
    {
      "question": "SP 主要省哪部分显存？",
      "answer": "省 LayerNorm/激活/Dropout 等无法被 TP 切分的层的激活显存，随序列长度线性下降。"
    }
  ],
  "followUpAnswers": [
    "SP 是 TP 的序列维补充，常一起用。",
    "SP 主要省长序列激活显存。"
  ],
  "pitfalls": [
    "以为 TP 已解决所有显存问题——忽略了 LayerNorm 副本。",
    "以为 SP 零通信——其实多了 gather/scatter。"
  ],
  "beginnerSummary": "TP 把\"宽度\"切开分摊了，但有些步骤(像量身高前要先看全队)还得看完整的一排人。序列并行就是把这\"一排人\"也按人头分给几张卡，谁看哪几号，需要完整信息时大家先凑一下、算完再分回去，从而少存很多重复名单。",
  "prerequisites": [
    "已理解 TP 沿隐藏维切分。",
    "LayerNorm/Softmax 需完整向量。",
    "长序列使激活显存成为瓶颈。"
  ],
  "workedExample": [
    "序列长 8192、tp=8。",
    "每层激活从 8192×h 降到 1024×h。"
  ],
  "lineByLine": [
    "把序列长度维切到各卡。",
    "需完整信息时 all-gather。",
    "在本地算 LayerNorm 等层。",
    "算完 reduce-scatter 再切回序列分片。"
  ],
  "diagram": "TP 切隐藏维 h → 仍有完整序列 s 副本\nSP 再切序列维 s/tp → 激活 O(s/tp·h)\n边界: all-gather ↔ reduce-scatter"
};
