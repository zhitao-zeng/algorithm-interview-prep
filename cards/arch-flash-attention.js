export default {
  "kind": "concept",
  "id": "arch-flash-attention",
  "category": "Transformer 架构",
  "difficulty": "Hard",
  "title": "FlashAttention 原理",
  "prompt": "FlashAttention 是如何通过 IO-aware 与 tiling 加速注意力并省显存的？",
  "quickAnswer": "把 Q/K/V 切块在 SRAM 内做局部注意力+在线 softmax，避免物化 N×N 矩阵，显存 O(N²)→O(N)。",
  "approach": "用分块（tiling）让每个 (Q块,K/V块) 在 SRAM 内算分数与加权，借在线 softmax 维护运行最大/分母/输出累加器。",
  "explanationFocus": "是什么：FlashAttention 是 IO 感知的精确注意力算法，不把完整 N×N 分数矩阵写入 HBM，而是把 Q/K/V 切成能放入 SRAM 的块，在片上增量计算 softmax，结果与标准注意力数学等价。",
  "bruteForce": "标准注意力：先算 S=QKᵀ 写 HBM（N²），softmax 再读写 HBM，最后 PV；全程 HBM 带宽受限且 O(N²) 显存。",
  "derivation": [
    "为什么需要：长序列下瓶颈是 HBM↔SRAM 带宽而非 FLOPs，O(N²) 中间矩阵撑爆显存。",
    "怎么实现：Q 按行切块、K/V 按列切块；每块算 S_ij，用在线 softmax 更新运行 (m,ℓ,O)，永不写回整个 S/P。",
    "有什么代价：FLOPs 与标准相同（仍 O(N²d)）；但 HBM 访问从 ~4N² 降到 O(N²/B+Nd)，显存 O(N) 级，speedup 2–4×。",
    "怎么评测：同输入下输出与标准 softmax(QKᵀ/√d)V 数值一致（至多舍入差）；实测 A100 长序列加速 2–4×。"
  ],
  "invariant": "不变量：在线 softmax 的运行统计量 (m,ℓ,O) 保证分块累加结果与一次性 softmax 完全等价；输出精确非近似。",
  "walkthrough": "N=8192,d=64：标准注意力 S 需 8192²×2B≈128MB/头；FlashAttention 只在 SRAM 留块，显存降为 O(N)，长序列可训练。",
  "edgeCases": [
    "因果掩码下可跳过上三角块，约再快 2×。",
    "块大小 Br=Bc 由 SRAM 容量决定（典型 128）。",
    "需重写 kernel（CUDA），框架层不易直接 numpy 复现全部收益。"
  ],
  "code": "def flash_step(Qi, Kj, Vj, m, l, O, Br, Bc):\n    # Qi:(Br,d) Kj:(Bc,d) Vj:(Bc,d); m,l,O 为运行统计量\n    S = (Qi @ Kj.T)                # (Br,Bc) 留在 SRAM\n    m_new = torch.maximum(m, S.max(1).values)\n    p = torch.exp(S - m_new[:, None])\n    l = l * torch.exp(m - m_new) + p.sum(1)\n    O = (l_old_exp * O + p @ Vj) / l[:, None]\n    return m_new, l, O",
  "codeNotes": [
    "真实实现用在线 softmax 的 rescale 因子 e^{m−m_new} 校正已累加项。",
    "块循环需对 K/V 的所有块流式扫描同一 Q 块。"
  ],
  "complexity": "FLOPs O(N²d) 同标准；HBM 访问 O(N²/B + N·d)，显存 O(N)（不存 N×N 矩阵），长序列 2–4× 加速。",
  "followUps": [
    {
      "question": "FlashAttention 是近似吗？",
      "answer": "不是，输出与标准注意力数学等价，只是重排计算顺序避免物化大矩阵。"
    },
    {
      "question": "在线 softmax 为什么数值稳定？",
      "answer": "维护运行最大值 m 与分母 ℓ，新块到来时用 e^{m_old−m_new} 校正历史累加，等价于先见全局最大值再归一。"
    }
  ],
  "followUpAnswers": [
    "不是，输出与标准注意力数学等价，只是重排计算顺序避免物化大矩阵。",
    "维护运行最大值 m 与分母 ℓ，新块用 e^{m_old−m_new} 校正历史累加，等价于先见全局最大值再归一。"
  ],
  "pitfalls": [
    "误以为 FlashAttention 省了计算量——它只省 IO 与显存，FLOPs 不变。",
    "把『显存 O(N)』误解为序列可无限长——受 SRAM 块大小与地址位宽限制。"
  ],
  "beginnerSummary": "标准注意力把整张巨大的分数表写进慢速显存再读；FlashAttention 把表切成小块在高速缓存里边算边丢，永远不全表落地，又快又省显存。",
  "prerequisites": [
    "GPU 内存层级 HBM/SRAM",
    "softmax 数值稳定",
    "自注意力计算流程"
  ],
  "workedExample": [
    "标准：S(N×N) 写 HBM→softmax→读→PV，访问 ~4N²。",
    "Flash：Q/K/V 切块进 SRAM，逐块更新 (m,ℓ,O)，只写回 O。"
  ],
  "lineByLine": [
    "S=Qi@Kj.T：块内分数，留在 SRAM 不落 HBM。",
    "m_new=max(m, S.max)：更新运行最大值保稳定。",
    "rescale+l 与 O：用 e^{m−m_new} 校正并累加加权值。"
  ],
  "diagram": "HBM: Q K V  ──load块──> SRAM\n  SRAM: S=QiKj^T → 在线softmax → 更新 O\n  只把最终 O 写回 HBM（S/P 从不落盘）"
};
