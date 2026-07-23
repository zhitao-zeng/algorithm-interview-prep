export default {
  "kind": "concept",
  "id": "arch-mha-mqa-gqa-deep",
  "category": "Transformer 架构",
  "difficulty": "Hard",
  "title": "MHA/MQA/GQA 深化对比",
  "prompt": "从 KV 复用与解码吞吐的角度，如何深化理解 MHA、MQA、GQA 的取舍？",
  "quickAnswer": "MHA 每头独立 KV（质量高、KV 缓存大）；MQA 全共享 1 组 KV（省显存快但质量降）；GQA 折中分组共享。",
  "approach": "以「Q 头数 : KV 头数」比例为主线，分析 KV 缓存大小、访存带宽与质量三者权衡。",
  "explanationFocus": "是什么：MHA 中每个 Q 头有独立 K/V 头（比例 1:1）；MQA 所有 Q 头共享单一 K/V 头（比例 h:1）；GQA 把 Q 头分成若干组，每组共享一个 K/V 头（比例 h:g，1<g<h）。",
  "bruteForce": "MHA 在自回归解码时每 token 都要缓存 h 组 K/V，长序列+大 batch 下 KV 缓存成为显存与带宽瓶颈。",
  "derivation": [
    "为什么需要：解码受限于 KV 缓存的显存容量与每步从 HBM 读 KV 的带宽，而非算力。",
    "怎么实现：MQA 令 n_kv_heads=1；GQA 令 n_kv_heads=g，每组内 Q 头插值/复用同一 K/V 头。",
    "有什么代价：KV 缓存随 n_kv_heads 线性缩小（MQA 缩 h 倍）；MQA 质量常降，GQA 在质量与速度间折中。",
    "怎么评测：对比同参数下困惑度与解码吞吐；LLaMA2/3、Mistral、Qwen 均用 GQA。"
  ],
  "invariant": "不变量：KV 缓存大小 ∝ n_kv_heads × N × d_head；吞吐瓶颈在 KV 的 HBM 读取带宽，减少 KV 头数直接提升每步解码速度。",
  "walkthrough": "32 Q 头：MHA 需 32 组 KV；MQA 仅 1 组（省 32× 缓存）；GQA 取 4 组（省 8×），每组服务 8 个 Q 头。",
  "edgeCases": [
    "GQA 组数 g 需整除 h，否则要插值（如 PaLM 的 8:1 近似）。",
    "MQA 在强解码任务上质量损失明显，需更大模型补偿。",
    "训练时 GQA 与 MHA 计算量几乎相同，收益主要体现在推理。"
  ],
  "code": "def gqa_split(q, k, v, n_q, n_kv):\n    # q:(n_q,d) 按组映射到 n_kv 个 KV 头\n    group = n_q // n_kv\n    outs = []\n    for i in range(n_kv):\n        qi = q[i*group:(i+1)*group]      # 一组 Q 头\n        outs.append(qi @ k[i].T)          # 共享第 i 个 KV 头\n    return outs",
  "codeNotes": [
    "真实实现用 repeat_interleave 把 KV 头复制以对齐 Q 头数。",
    "GQA 训练计算量与 MHA 相近，推理才显缓存优势。"
  ],
  "complexity": "训练 FLOPs 三者相近（≈O(N²d)）；推理 KV 缓存 MHA:O(h·N·d)，MQA:O(1·N·d)，GQA:O(g·N·d)。",
  "followUps": [
    {
      "question": "为什么 KV 缓存比算力更限制解码？",
      "answer": "自回归每步只产 1 token，算力需求小，但需读全部历史 KV，受 HBM 带宽限制，读得越少越快。"
    },
    {
      "question": "GQA 怎么选组数 g？",
      "answer": "按硬件与质量权衡，常取 2 的幂且整除 h（如 32 头配 4 或 8 组），兼顾缓存节省与质量。"
    }
  ],
  "followUpAnswers": [
    "自回归每步只产 1 token，算力需求小，但需读全部历史 KV，受 HBM 带宽限制，读得越少越快。",
    "按硬件与质量权衡，常取 2 的幂且整除 h（如 32 头配 4 或 8 组），兼顾缓存节省与质量。"
  ],
  "pitfalls": [
    "以为 GQA 省的是训练算力——实际主要省推理 KV 缓存与带宽。",
    "忽略 g 必须整除 h，否则需要插值会有质量/实现细节。"
  ],
  "beginnerSummary": "MHA 像每个读者都有自己的笔记本（贵但细）；MQA 全组共用一本（省但糙）；GQA 几个读者合看一本（折中）。",
  "prerequisites": [
    "多头注意力",
    "KV 缓存与自回归解码",
    "显存带宽瓶颈"
  ],
  "workedExample": [
    "MHA: 32 Q 头 ↔ 32 KV 头，缓存 32 份。",
    "GQA: 32 Q 头 ↔ 4 KV 头，缓存 4 份，每组 8 Q 头共享。"
  ],
  "lineByLine": [
    "group=n_q//n_kv：每组 Q 头数。",
    "qi 取该组 Q 头。",
    "qi@k[i].T：整组共享第 i 个 KV 头做注意力。"
  ],
  "diagram": "MHA: Q1..Q32 各用 K1..K32\nMQA: Q1..Q32 共用 K1\nGQA: {Q1..Q8}->K1 {Q9..Q16}->K2 ..."
};
