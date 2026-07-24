export default {
  "kind": "concept",
  "id": "arch-gqa-tradeoff",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "GQA 如何折中 MHA 与 MQA",
  "prompt": "GQA 具体是怎样在 MHA 的质量与 MQA 的速度之间做折中的？",
  "quickAnswer": "GQA 把 Q 头分组，每组共享一个 KV 头，既大幅缩减 KV 缓存又比 MQA 保留更多头间差异。",
  "approach": "将 n_kv_heads 设为介于 1（MQA）与 n_q_heads（MHA）之间，按组映射复用 KV。",
  "explanationFocus": "是什么：Grouped-Query Attention 让多个查询头组成一组，共享同一个 K/V 头；组数 g 决定折中程度：g=1 退化为 MQA，g=h 退化为 MHA。",
  "bruteForce": "直接在 MHA（质量好但慢/费显存）与 MQA（快但质量掉）两极选，难兼顾。",
  "derivation": [
    "为什么需要：MQA 解码快但质量明显下降，MHA 质量好却受 KV 缓存限制，需中间方案。",
    "怎么实现：设 n_kv_heads=g，把 h 个 Q 头均分 g 组，每组重复用对应 KV 头（推理时通过 repeat 对齐）。",
    "有什么代价：g 越小越快越省显存但越接近 MQA 的质量损失；g 越大越接近 MHA。",
    "怎么评测：在困惑度与解码 tokens/s 上扫 g，选帕累托最优；LLaMA2/3、Qwen 用 GQA。"
  ],
  "invariant": "不变量：KV 缓存缩减倍数 = h/g；质量随 g 增大单调趋近 MHA，速度与显存随 g 减小单调改善。",
  "walkthrough": "h=32,g=8：缓存缩 4×，每 4 个 Q 头共享 1 个 KV 头；相比 MQA(1 组) 保留更多头专门化，相比 MHA 省 4× 缓存。",
  "edgeCases": [
    "g 必须整除 h（常见取 2 的幂）。",
    "训练时 GQA 与 MHA 前向计算几乎一致，折中只在推理体现。",
    "个别模型用非整除近似（如 PaLM 8:1 需插值）。"
  ],
  "code": "import torch\n\ndef gqa_repeat(k, v, n_q, n_kv):\n    # 把 n_kv 个 KV 头 repeat 成 n_q 个以对齐 Q\n    group = n_q // n_kv\n    k_r = k.repeat_interleave(group, dim=0)  # (n_q, ...)\n    v_r = v.repeat_interleave(group, dim=0)\n    return k_r, v_r",
  "codeNotes": [
    "repeat_interleave 保证第 i 组 Q 头对应同一个 KV 头。",
    "训练时可不 repeat，直接按组索引以省计算。"
  ],
  "complexity": "KV 缓存 O(g·N·d_head)，介于 MHA(O(h·) )与 MQA(O(1·))之间；训练 FLOPs≈MHA。",
  "followUps": [
    {
      "question": "GQA 训练时怎么算？",
      "answer": "训练时按组索引共享 KV，计算量与 MHA 相近；repeat 主要服务于推理实现对齐。"
    },
    {
      "question": "选 g 的经验法则？",
      "answer": "常见 g∈{2,4,8}，需整除 h，并据目标硬件显存与质量预算选帕累托点。"
    }
  ],
  "followUpAnswers": [
    "训练时按组索引共享 KV，计算量与 MHA 相近；repeat 主要服务推理对齐。",
    "常见 g∈{2,4,8}，需整除 h，并据目标硬件显存与质量预算选帕累托点。"
  ],
  "pitfalls": [
    "把 GQA 当成全新注意力机制——它只是 MHA 的 KV 共享变体。",
    "忽略 g 整除约束导致实现需插值、引入额外复杂度。"
  ],
  "beginnerSummary": "GQA 像把读者分成几个小组，每组共用一本笔记：比每人一本省，比全组一本细，卡在中间最实用。",
  "prerequisites": [
    "MHA/MQA/GQA 对比",
    "KV 缓存",
    "推理吞吐"
  ],
  "workedExample": [
    "h=32,g=4：缓存缩 8×，每 8 个 Q 头共用 1 KV 头。",
    "随 g 从 1→32，逐步从 MQA 过渡到 MHA。"
  ],
  "lineByLine": [
    "group=h//g：每组 Q 头数。",
    "repeat_interleave：把 KV 头复制 group 次对齐 Q。",
    "对齐后可直接用标准 MHA 代码路径。"
  ],
  "diagram": "MHA h:h | MQA h:1 | GQA h:g(1<g<h)\nGQA = 多组共享，缓存缩 h/g 倍"
};
