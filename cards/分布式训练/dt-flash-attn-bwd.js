export default {
  "id": "dt-flash-attn-bwd",
  "kind": "concept",
  "category": "分布式训练",
  "title": "FlashAttention 前向与反向",
  "difficulty": "Hard",
  "prompt": "请讲讲 FlashAttention 的前向与反向是如何做到 IO-aware 的，tiling、在线 softmax、反向的似然重算如何把显存从 O(N²) 降到 O(N)？",
  "quickAnswer": "FlashAttention 把 Q、K、V 分块(tiling)装入 SRAM，在块内增量计算 softmax 与注意力，避免把 N×N 的注意力矩阵写回 HBM，从而显存从 O(N²) 降到 O(N)。前向用在线 softmax（running max/sum）合并各块的局部统计量；反向时因前向未存大矩阵，需重算每块似然并复用 SRAM 内中间量求 dQ/dK/dV。整体减少 HBM 读写是提速主因。",
  "beginnerSummary": "普通注意力要把巨大的“谁看谁”矩阵存到慢速显存里，又占空间又慢。FlashAttention 把数据切成小块在高速缓存里算，边算边合并，不存那个大矩阵，所以又快又省。",
  "explanationFocus": "是什么：FlashAttention 是一种 IO-aware 的精确注意力算法，通过 tiling 把 Q/K/V 分块放入快速 SRAM 计算，并借助在线 softmax 在块间增量归约，避免 materialize 完整的 N×N 注意力矩阵，将显存从 O(N²) 降到 O(N)，同时因 HBM 访问大幅减少而显著加速。",
  "approach": "前向：把 Q、K、V 沿序列维切块，外层遍历 K/V 块、内层遍历 Q 块，在 SRAM 内算局部 softmax 并用 running m（最大值）和 l（指数和）在线更新全局统计量，逐步累加输出。反向：因未存 N² 矩阵，按相同 tiling 重算每块 softmax 似然，结合保存的 O(N) 统计量在 SRAM 内求 dQ/dK/dV。",
  "code": "import torch\nfrom flash_attn import flash_attn_func\n\ndef attn(q, k, v):\n    # q,k,v: [b, s, h, d]; 内部自动 tiling + 在线 softmax\n    out = flash_attn_func(q, k, v, causal=True)\n    return out",
  "complexity": "计算 O(N²) FLOPs 但 HBM 访问 O(N²/M)（M 为 SRAM 块大小）；显存 O(N)",
  "derivation": [
    "为什么需要：标准注意力需把 N×N 分值矩阵与 softmax 中间结果写入 HBM，显存 O(N²)、带宽成为瓶颈，长序列下不可行。",
    "怎么实现：tiling 把矩阵切块进 SRAM；在线 softmax 用 m、l 两个统计量增量合并分块结果；反向重算局部似然。",
    "有什么代价：实现复杂（需手写 CUDA 核、处理因果掩码与不同 head 布局）；反向重算增加少量计算但远小于省下的 IO。",
    "怎么评测：对比标准 attention 的显存峰值与 step 时间，随序列长度 N 看是否呈线性而非平方增长。"
  ],
  "edgeCases": [
    "变长序列/padding 需配合 cu_seqlens 与 varlen 接口，否则跨样本注意力泄漏。",
    "因果掩码下，最后一块 Q 只能看到部分 K，在线 softmax 需正确截断累积。",
    "head 维度 d 不是 2 的幂或对齐不佳时，tiling 效率下降，需 padding。"
  ],
  "pitfalls": [
    "误以为 FlashAttention 减少了 FLOPs——它 FLOPs 不变，加速来自减少 HBM 读写，不是更少计算。",
    "反向未实现重算而直接依赖前向存大矩阵，会破坏 O(N) 显存优势。"
  ],
  "prerequisites": [
    "注意力公式与 softmax 归一化",
    "GPU 内存层级（SRAM/HBM 带宽差异）与 tiling 思想"
  ],
  "workedExample": [
    "例：N=8192，标准注意力需 8192²≈67M 元素矩阵 ×fp16≈134MB 仅单 head，多层多头下迅速爆显存；FlashAttention 只存 O(N) 的中间统计量。",
    "例：在线 softmax 合并两块：第一块得 m1,l1,acc1；第二块得 m2,l2，更新 m=max(m1,m2)，l=l1*e^(m1-m)+l2*e^(m2-m)，acc 按系数 rescale 后累加。"
  ],
  "lineByLine": [
    "`from flash_attn import flash_attn_func`：引入融合注意力核。",
    "`def attn(q, k, v)`：输入为 [b, s, h, d] 的四维张量。",
    "`flash_attn_func(q, k, v, causal=True)`：内部做 tiling、在线 softmax，不写出 N² 矩阵。",
    "`return out`：输出 O(N) 显存，反向在 SRAM 内重算似然求梯度。"
  ],
  "followUps": [
    {
      "question": "FlashAttention 真把计算量降下来了吗？",
      "answer": "没有，注意力数学上的 FLOPs 仍是 O(N²)，它降的是 HBM 访问次数（IO），因 SRAM 比 HBM 快一个数量级，减少搬数据才是提速关键；显存从 O(N²) 降到 O(N) 是附带收益。"
    },
    {
      "question": "反向为什么必须重算而不是存前向结果？",
      "answer": "若存完整 softmax 概率矩阵，显存回到 O(N²)，违背初衷；而重算每块似然只需 O(N) 统计量，在 SRAM 内代价很小，所以反向选择重算以保住线性显存。"
    }
  ],
  "followUpAnswers": [
    "没有，注意力数学上的 FLOPs 仍是 O(N²)，它降的是 HBM 访问次数（IO），因 SRAM 比 HBM 快一个数量级，减少搬数据才是提速关键；显存从 O(N²) 降到 O(N) 是附带收益。",
    "若存完整 softmax 概率矩阵，显存回到 O(N²)，违背初衷；而重算每块似然只需 O(N) 统计量，在 SRAM 内代价很小，所以反向选择重算以保住线性显存。"
  ]
};
