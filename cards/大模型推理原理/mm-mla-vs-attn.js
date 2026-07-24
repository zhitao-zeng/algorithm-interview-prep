export default {
  "kind": "concept",
  "id": "mm-mla-vs-attn",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "MLA 与 MHA、MQA、GQA 有什么区别？为什么不能当成更激进的 GQA？",
  "prompt": "MLA（Multi-head Latent Attention）与 MHA、MQA、GQA 有什么区别？为什么不能把 MLA 简单理解成“更激进的 GQA”？",
  "quickAnswer": "MHA 为每个头缓存独立 K/V（KV 最大）；MQA 所有头共享一份 K/V（KV 最小但表达受限）；GQA 把头分组、每组共享一份 K/V（KV 介于二者）；MLA 则把 K/V 压缩成低维 Latent 向量缓存，推理时再上投影还原，KV 体积最小且不完全等价于“减少 KV 头数”。MLA 减 KV 的代价是需要额外的上投影计算与更讲究的矩阵融合实现；它对算力与带宽的影响和 GQA 不同，不能简单视为更激进的 GQA。",
  "approach": "比较四种注意力的“KV 缓存形态”：MHA(每头独立) → MQA(全共享) → GQA(分组共享) → MLA(低维潜变量)。",
  "explanationFocus": "是什么：四者都是为控制 KV Cache 或提升效率的注意力变体；MLA 走“压缩成潜变量”的路线，与 GQA 的“共享头”路线本质不同。",
  "bruteForce": "全用 MHA（每头独立 K/V），KV 显存随头数线性膨胀。",
  "derivation": [
    "为什么需要：长上下文下 KV Cache 占显存、限 batch；需要压缩 KV。",
    "MHA/MQA/GQA 怎么做：分别通过“每头独立 / 全共享 / 分组共享”减少 KV 头数。",
    "MLA 怎么做：把 K/V 投影到低维 Latent（下投影），只缓存 Latent；推理时上投影还原再算注意力。",
    "怎么评测：看 KV 体积、重建误差、注意力质量、端到端吞吐与显存。"
  ],
  "invariant": "MLA 缓存的是低维 Latent 而非 KV 头；减 KV 的机理是“维度压缩+上投影还原”，与 GQA 的“头共享”不同。",
  "walkthrough": "DeepSeek-V2 引入 MLA：把每层的 K/V 压成很小的 Latent 向量缓存，显存随序列长度增长最慢；还原时需一次上投影，单步算力略增但带宽压力大幅下降。",
  "edgeCases": [
    "把 MLA 当成 GQA 的极端（1 组）：错，MLA 压缩的是维度而非头数。",
    "忽视上投影算力成本：MLA 减带宽但单步多一次投影。",
    "与 RoPE 兼容性：MLA 需特殊处理位置编码（如解耦 q 的 RoPE）。"
  ],
  "code": "# Python\n# 概念示意: MLA 缓存低维 Latent 而非 KV\ndef mla_kv_ratio(h, d, latent_d):\n    # h: 头数, d: 每头维, latent_d: 潜变量维(远小于 h*d)\n    kv_full = h * d * 2          # MHA 的 KV 体积\n    kv_mla = latent_d * 2        # MLA 只缓存 Latent\n    return kv_mla / kv_full       # MLA 压缩比(远小于1)",
  "codeNotes": [
    "真实 MLA 还含解耦 RoPE 与矩阵吸收技巧, 进一步省算。",
    "压缩比取决于 latent_d 与 h*d 的比值。"
  ],
  "complexity": "KV 体积：MHA O(h·d·L)、MQA O(d·L)、GQA O(g·d·L)、MLA O(latent_d·L)；MLA 单步多一次上投影 O(latent_d·d)。",
  "followUps": [
    {
      "question": "MHA 缓存什么？",
      "answer": "每个注意力头各自缓存独立的 K 与 V，KV 体积随头数线性增长，长上下文下最占显存。"
    },
    {
      "question": "GQA 减少的是什么？",
      "answer": "GQA 把多个 Query 头分组、每组共享一份 K/V，减少的是 KV 头数（不是维度），KV 体积随组数下降。"
    },
    {
      "question": "MLA 为什么缓存低维 Latent？",
      "answer": "MLA 把 K/V 下投影到远小于原始维度的 Latent 并只缓存它，推理时上投影还原，从而把 KV 体积压到最小。"
    },
    {
      "question": "MLA 减少 KV 的代价是什么？",
      "answer": "还原 KV 需要一次上投影（额外算力），且实现上要做矩阵融合/吸收技巧才能真的省；单步算力略增、带宽压力大降。"
    },
    {
      "question": "为什么不能把 MLA 简单当成更激进的 GQA？",
      "answer": "GQA 减的是 KV 头数（共享头），MLA 减的是 KV 维度（压成潜变量），二者机理不同，对算力/带宽影响也不同。"
    },
    {
      "question": "MLA 对算力和显存带宽有什么不同影响？",
      "answer": "MLA 显著降 KV 显存与带宽需求，但单步多一次上投影算力；整体更偏“用一点算力换大量带宽”，与 GQA 权衡不同。"
    }
  ],
  "followUpAnswers": [
    "MHA 每头独立 KV。",
    "GQA 减 KV 头数。",
    "MLA 压 KV 成低维 Latent。",
    "MLA 多一次上投影算力。",
    "MLA 压维度非压头数。",
    "MLA 用算力换带宽, 权衡异于 GQA。"
  ],
  "pitfalls": [
    "把 MLA 等同于 GQA 极端版（忽略维度压缩路线）。",
    "忽视 MLA 的上投影算力成本。",
    "混淆 KV 头数与 KV 维度的减少方式。",
    "（事实核查·2025）MLA（DeepSeek）用低秩投影压缩 K/V，KV 缓存可降到 MHA 的约 1/10~1/20，是长上下文 KV 压缩的 SOTA 路线；区别于 MQA（单 KV 头）和 GQA（分组 KV 头）。被问“怎么减 KV”优先答 MLA/量化/GQA 三档。"
  ],
  "beginnerSummary": "注意力机制每读一个字都要记下“笔记”（KV Cache），字越多笔记越厚。MHA 是每个人（头）都记自己一份笔记，最占地方；MQA 是大家共用一份笔记，最省但容易记不全；GQA 是几个人合一份笔记，折中。MLA（多头潜在注意力）换了思路：不让人少记，而是把笔记“压缩”成一小团高度概括的潜变量存着，用的时候再展开。所以 MLA 省的是“笔记的体积（维度）”，GQA 省的是“笔记的份数（头数）”——不是一回事。代价是展开笔记要多算一步。",
  "prerequisites": [
    "KV Cache 随序列长度与头数增长。",
    "MHA/MQA/GQA 通过共享 KV 头省显存。",
    "维度压缩是另一条路线。"
  ],
  "workedExample": [
    "MHA: KV∝h·d·L; GQA: KV∝g·d·L; MLA: KV∝latent_d·L。",
    "DeepSeek-V2 用 MLA, 长上下文 KV 增长最慢, 但单步多上投影。"
  ],
  "lineByLine": [
    "MHA: 每头独立 KV(最大)。",
    "MQA: 全共享(最小, 受限)。",
    "GQA: 分组共享(折中)。",
    "MLA: 压成 Latent 缓存, 用时还原。",
    "MLA 减维度, GQA 减头数, 路线不同。"
  ],
  "diagram": "KV 缓存形态:\nMHA : [K1V1][K2V2]...[KhVh]   (最大)\nMQA : [KV] 共享            (最小)\nGQA : [KV]g1 [KV]g2 ...     (分组)\nMLA : [Latent] 低维, 用时上投影还原 (体积最小, 机理不同)"
};
