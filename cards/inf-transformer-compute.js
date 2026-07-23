export default {
  "kind": "concept",
  "id": "inf-transformer-compute",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Transformer 一次推理的计算",
  "prompt": "Transformer 一次推理包含哪些计算？",
  "quickAnswer": "一次前向含：Embedding 查表 → 多层 Self-Attention（Q/K/V 投影、Attention 打分、输出投影）→ FFN（两层线性+激活）→ LayerNorm/RMSNorm → 最后 LM Head 投影到词表。Prefill 对所有输入 token 并行做这些；Decode 只对 1 个新 token 做，但要读全部历史 KV。",
  "approach": "推理=把输入 token 过一遍 Transformer 层栈；每层以矩阵乘为主。",
  "explanationFocus": "是什么：Transformer 前向是“ Embedding + N 层(Attention+FFN+Norm) + LM Head”的矩阵乘堆叠。",
  "bruteForce": "逐 token 独立重算整段历史注意力 → 复杂度 O(n²) 每步，不可接受。",
  "derivation": [
    "为什么需要：要拿到下一个 token 的概率分布，必须让输入过完所有层。",
    "怎么实现：层堆叠 + 残差连接；Attention 用 QKᵀV，FFN 用两个线性层夹激活。",
    "有什么代价：每层 O(n²d)（注意力）+ O(nd²)（线性层），n 为序列长、d 为隐维。",
    "怎么评测：统计每 token FLOPs、各层时间占比、是否有算子成为热点。"
  ],
  "invariant": "参数固定时，单 token 前向 FLOPs 与序列长度 n 近似线性（线性层），注意力项与 n² 相关。",
  "walkthrough": "画层内数据流：x → QKV 投影(3 个 d×d) → split → Attention → 输出投影(d×d) → 加残差 → FFN(4d×d, d×4d) → Norm。",
  "edgeCases": [
    "长序列时注意力 O(n²) 成为主导。",
    "词表很大时 LM Head(d×V) 投影代价高。",
    "MoE 模型 FFN 换成专家路由，计算随激活专家数变化。"
  ],
  "code": "# Python\ndef transformer_flops(n, d, layers, vocab):\n    # 近似: 每层 ~ 12*n*d^2 (attn+ffn) + 2*n*n*d (attn score)\n    per_tok = layers * (12 * n * d * d + 2 * n * n * d)\n    head = 2 * n * d * vocab             # LM Head: [n,d] × [d,V]\n    return per_tok + head              # FLOPs/token",
  "codeNotes": [
    "注意力分数 QKᵀ 是 O(n²d)，FFN 是 O(nd²)。",
    "Decode 时 n 含历史，但本步只算 1 个新 token 的 QKV。"
  ],
  "complexity": "每层 O(n²d + nd²)；整模型 O(L·(n²d + nd²))。Decode 步 n 缓慢增长（KV 累积）。",
  "followUps": [
    {
      "question": "Prefill 和 Decode 在计算上有何不同？",
      "answer": "Prefill 对全部输入 token 并行做矩阵乘，batch 维=n，算力利用率高；Decode 只对 1 个新 token 计算，矩阵极“瘦”，算力闲置、访存主导。"
    },
    {
      "question": "LM Head 为什么贵？",
      "answer": "要把 d 维隐状态投影到词表 V（常 10万~20万），是 O(n·d·V) 的大矩阵乘，常占 Decode 可观比例，故有候选集/投机解码等优化。"
    }
  ],
  "followUpAnswers": [
    "用 GQA 减小 KV 投影成本。",
    "LM Head 可用采样候选集缩小。"
  ],
  "pitfalls": [
    "把注意力 O(n²) 当成唯一成本，忽略 FFN/LM Head。",
    "以为 Decode 也在并行算所有 token。"
  ],
  "beginnerSummary": "Transformer 一次“思考”就是让输入依次流过很多层。每层有两块核心计算：注意力（让每个字看上下文）和前馈网络（逐字加工）。所有计算本质都是大矩阵乘法。理解“每次推理=一堆矩阵乘”是后续谈 KV Cache、批处理、量化的基础。",
  "prerequisites": [
    "模型由很多层堆叠而成。",
    "核心运算是矩阵乘法。",
    "注意力让 token 之间互相看。"
  ],
  "workedExample": [
    "d=4096, n=512, L=32：单层注意力分数 ~ 2·512²·4096 ≈ 2.1G FLOPs。",
    "LM Head：512·4096·128000 ≈ 268G FLOPs，Decode 时占比不小。"
  ],
  "lineByLine": [
    "Embedding 把 token 变向量。",
    "每层：QKV 投影 → Attention → 输出投影 → FFN → Norm。",
    "残差把输入加到输出。",
    "LM Head 投影到词表得下一 token 概率。"
  ],
  "diagram": "输入 token → Embedding\n  → [Layer: Attn(QKV投影, Score, 输出投影) + FFN + Norm] × N\n  → LM Head → 词表概率"
};
