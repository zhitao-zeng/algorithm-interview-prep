export default {
  "id": "dt-ring-attention",
  "kind": "concept",
  "category": "分布式训练",
  "title": "Ring Attention 与序列并行",
  "difficulty": "Hard",
  "prompt": "请讲讲 Ring Attention / 序列并行是如何把序列维度切到多卡的，blockwise 注意力加环形 all-gather/reduce-scatter 如何突破单卡序列长度上限？",
  "quickAnswer": "Ring Attention 把长序列沿长度维切成块分布到不同设备，每块只持有一部分 Q/K/V。计算注意力时用环形通信：按块 all-gather K/V 依次传入邻居，并在本地做 blockwise 注意力（在线 softmax 跨块合并），同时 reduce-scatter 输出，使任意设备的单卡显存只与本地序列块成正比，从而突破单卡序列上限且近线性扩展。",
  "beginnerSummary": "序列太长单卡放不下时，把序列切成几段分到不同卡上，卡与卡像接力赛一样传递 Key/Value 块，边传边算注意力，这样整体能处理超长文本而每张卡只存一小段。",
  "explanationFocus": "是什么：Ring Attention（序列并行的一种）把序列维度沿长度切分到多张设备，每张卡只保存本地 Q/K/V 块；通过环形拓扑在各卡间依次传递 K/V 块并做 blockwise 注意力，使单卡显存与本地块长成正比，从而能训练远超单卡容量的超长序列。",
  "approach": "把序列切成 S/P 块分布到 P 张卡。以环形传递：每轮每张卡把当前 K/V 块发给下家、从上家收一块，本地对所有见过的 K/V 与本地 Q 做注意力并更新在线 softmax 统计量；输出经 reduce-scatter 汇总。P 轮后每个 Q 块都见到了全部 K/V，且仅需 O(S/P) 显存。",
  "code": "import torch\nfrom ring_attention_pytorch import RingAttention\n\ndef long_attn(q, k, v, ring_size):\n    # q/k/v 已沿序列维切块分布到各卡\n    out = RingAttention(dim=64, inner_ring_parallel=True)(q, k, v)\n    return out",
  "complexity": "通信 O(S/P * P)=O(S) 总量；显存 O(S/P)，可扩展至任意长序列",
  "derivation": [
    "为什么需要：即使 FlashAttention 把显存降到 O(N)，单卡 N 仍受限于显存上限，百万级 token 序列必须跨卡切序列。",
    "怎么实现：序列切块 + 环形 all-gather(K/V) + 本地 blockwise 注意力(在线 softmax) + reduce-scatter(输出)。",
    "有什么代价：每轮一次点对点通信，总通信量 O(S) 且延迟随环长增加；需与 FlashAttention 块内实现结合才有收益。",
    "怎么评测：固定总序列长，测不同 P 下的单卡显存（应随 P 线性下降）与端到端吞吐。"
  ],
  "edgeCases": [
    "非 2 的幂的设备数或非均匀切块需处理边界块长度不一致。",
    "因果注意力下环形传递需保证 K/V 传递顺序与掩码一致，否则看到未来 token。",
    "与 TP 叠加时，序列并行通信与 TP all-reduce 需错开以免带宽争用。"
  ],
  "pitfalls": [
    "误以为 Ring Attention 减少总计算——总 FLOPs 仍是 O(S²) 全局，只是把显存分布开，提速靠通信/计算重叠。",
    "环形通信未与计算重叠（先全收再算），会退化成纯通信等待，bubble 巨大。"
  ],
  "prerequisites": [
    "FlashAttention 的 tiling 与在线 softmax",
    "Ring/All-gather/Reduce-scatter 集合通信"
  ],
  "workedExample": [
    "例：序列 1M token 分到 8 卡，每卡仅 125K token 的 Q/K/V，单卡显存不再随总长平方增长，可训超长文档。",
    "例：环上第 i 卡初始持 K_i/V_i，第 1 轮发给 i+1 并接收 i-1 的块，本地计算 Q_i 与新到 K/V 的注意力，累计统计量；P 轮后覆盖全部。"
  ],
  "lineByLine": [
    "`from ring_attention_pytorch import RingAttention`：引入环形注意力实现。",
    "`def long_attn(q, k, v, ring_size)`：q/k/v 已沿序列维分布到各 ring 设备。",
    "`RingAttention(dim=64, inner_ring_parallel=True)`：开启环内序列并行，内部做块传递。",
    "`(q, k, v)`：在 ring 上逐块 all-gather K/V、本地算注意力并 reduce-scatter 输出。"
  ],
  "followUps": [
    {
      "question": "Ring Attention 和单纯把 batch 切到多卡有什么区别？",
      "answer": "切 batch 是数据并行，单卡仍须容纳整条序列；Ring Attention 切的是序列维度本身，单卡只放序列的一个分块，因此能突破单卡序列长度上限，而不是仅增加样本数。"
    },
    {
      "question": "它和 Megatron 的序列并行是一回事吗？",
      "answer": "思想一致：都是沿序列维切分。Megatron 的 SP 常配合 TP 在层内把激活按序列切，Ring Attention 用环形通信做跨设备注意力；二者可叠加，Ring 更侧重超长序列的注意力扩展。"
    }
  ],
  "followUpAnswers": [
    "切 batch 是数据并行，单卡仍须容纳整条序列；Ring Attention 切的是序列维度本身，单卡只放序列的一个分块，因此能突破单卡序列长度上限，而不是仅增加样本数。",
    "思想一致：都是沿序列维切分。Megatron 的 SP 常配合 TP 在层内把激活按序列切，Ring Attention 用环形通信做跨设备注意力；二者可叠加，Ring 更侧重超长序列的注意力扩展。"
  ]
};
