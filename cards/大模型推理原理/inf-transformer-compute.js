export default {
  "id": "inf-transformer-compute",
  "kind": "concept",
  "category": "大模型推理原理",
  "difficulty": "Medium",
  "title": "Transformer 一次推理的计算",
  "prompt": "Transformer 一次推理包含哪些计算？",
  "code": "# Python\ndef transformer_flops(n, d, layers, vocab):\n    # 近似: 每层 ~ 12*n*d^2 (attn+ffn) + 2*n*n*d (attn score)\n    per_tok = layers * (12 * n * d * d + 2 * n * n * d)\n    head = 2 * n * d * vocab             # LM Head: [n,d] × [d,V]\n    return per_tok + head              # FLOPs/token",
  "diagram": "输入 token → Embedding\n  → [Layer: Attn(QKV投影, Score, 输出投影) + FFN + Norm] × N\n  → LM Head → 词表概率",
  "explanationFocus": "是什么：Transformer 一次前向推理是『Embedding 查表 + N 层（Self-Attention + FFN + Norm）+ LM Head』的矩阵乘法堆叠。每层核心计算有两块：注意力（让每个 token 看上下文，QKᵀV）与前馈网络（逐位置加工，两层线性夹激活）。所有计算本质都是大矩阵乘，复杂度由序列长 n 与隐维 d 决定。",
  "quickAnswer": "一次前向含：Embedding 查表 → 多层 Self-Attention（Q/K/V 投影、Attention 打分、输出投影）→ FFN（两层线性+激活）→ LayerNorm/RMSNorm → 最后 LM Head 投影到词表。Prefill 对所有输入 token 并行做这些；Decode 只对 1 个新 token 做，但要读全部历史 KV。每层计算量约 O(n²d + nd²)。",
  "beginnerSummary": "Transformer 一次『思考』就是让输入依次流过很多层。每层有两块核心计算：注意力（让每个字看上下文）和前馈网络（逐字加工）。所有计算本质都是大矩阵乘法。理解『每次推理=一堆矩阵乘』是后续谈 KV Cache、批处理、量化的基础——这些优化都是在『少做/少用矩阵乘』或『让矩阵乘更便宜』。",
  "walkthrough": "画出单层数据流：x[d] → QKV 投影（3 个 d×d 矩阵，各 n·d² FLOPs）→ 切分多头 → Attention 分数 QKᵀ（O(n²d)）→ 加权 V（O(n²d)）→ 输出投影（d×d，n·d²）→ 加残差 → FFN（升维 4d：n·d·4d 与 n·4d·d，共 8·n·d²）→ RMSNorm。整层约 12·n·d² + 2·n²·d FLOPs/token；32 层、d=4096、n=512 时单层注意力约 2.1G、FFN 约 68.7G。",
  "approach": "推理=把输入 token 过一遍 Transformer 层栈；每层以矩阵乘为主，注意力是 token 间交互（O(n²)）、FFN 是逐 token 变换（O(d²)）。Prefill 时 batch 维=n 并行；Decode 时 batch 维=1，但仍要读全部历史 KV 做一步注意力。",
  "bruteForce": "逐 token 独立重算整段历史注意力（不缓存 KV）——每生成一个新 token 都把前面所有 token 重新过一遍注意力，复杂度 O(n²) 每步、总 O(n³)，随序列爆炸，完全不可接受。KV Cache 正是为消除这个冗余而生。",
  "invariant": "参数固定时，单 token 前向 FLOPs 与序列长度 n 近似线性（线性层随 n 增长），注意力项与 n² 相关（token 两两交互）。Decode 步 n 含历史，但本步只算 1 个新 token 的 QKV，历史 KV 从缓存读。",
  "complexity": "每层 O(n²d + nd²)：注意力分数 QKᵀ 是 O(n²d)，FFN 是 O(nd²)（两个线性层夹 4d 升维），LM Head 是 O(n·d·V)（V 为词表，常 10万~20万）。整模型 O(L·(n²d + nd²))。Decode 时 n 缓慢增长（KV 累积），每步线性层计算与 n 无关（只算新 token）但访存随 n 增（读 KV）。MoE 把 FFN 换成专家路由，计算随激活专家数变化。",
  "derivation": [
    "为什么需要：要拿到下一个 token 的概率分布，必须让输入过完所有层——每一层都在做不同的特征变换（注意力建模依赖、FFN 做非线性变换），缺任一层都无法得到正确 logits。",
    "怎么实现：层堆叠 + 残差连接：x → Attention(x) + x → FFN(·) + · → Norm。Attention 内 Q=XW_Q, K=XW_K, V=XW_V，scores=QKᵀ/√d，ctx=softmax(scores)V，再经输出投影。FFN 通常 d→4d→d 夹 GELU/ReLU。最后 RMSNorm + LM Head 投影到词表。",
    "有什么代价：每层 O(n²d)（注意力）+ O(nd²)（线性层），当 n 很大时注意力 O(n²) 主导，成为长上下文的主要成本；词表 V 很大时 LM Head（O(n·d·V)）在 Decode 占比不小。这些代价决定了 KV Cache、量化、候选集采样等优化的必要性。",
    "怎么评测：统计每 token FLOPs、用 Nsight 看各层时间占比，确认热点是注意力还是 FFN 还是 LM Head；对长序列重点看注意力 O(n²) 是否成为主导，决定是否需要稀疏/窗口注意力或 FlashAttention。"
  ],
  "edgeCases": [
    "长序列时注意力 O(n²) 成为主导，n=32K 时注意力分数矩阵 32K×32K 巨大，必须 FlashAttention/分块或稀疏化。",
    "词表很大（V=128K）时 LM Head（d×V 投影）代价高，Decode 时占比可达 10%~20%，故有候选集/投机解码优化。",
    "MoE 模型 FFN 换成专家路由，每 token 只激活少数专家，计算随激活专家数变化，总 FLOPs 不再是固定 O(nd²)。",
    "GQA/MQA：KV 头数减少，KV Cache 与 KV 投影成本下降，缓解长序列显存。"
  ],
  "pitfalls": [
    "把注意力 O(n²) 当成唯一成本，忽略 FFN（常占 2/3 计算）与 LM Head（大词表时显著）。",
    "以为 Decode 也在并行算所有 token：Decode 每步只算 1 个新 token 的 QKV，历史靠 KV 缓存，计算量与 Prefill 完全不同。",
    "混淆参数量与计算量：参数量决定显存（权重字节），FLOPs 决定算力，二者通过带宽/算力比值关联到延迟。"
  ],
  "prerequisites": [
    "模型由很多层堆叠而成，每层结构相同（Pre/Post Norm 变体）。",
    "核心运算是矩阵乘法（投影、打分、FFN）。",
    "注意力让 token 之间互相看（QKᵀV），FFN 逐位置变换。",
    "残差连接使信息跨层直连，Norm 稳定训练/推理数值。"
  ],
  "workedExample": [
    "例 1（单层注意力）：d=4096, n=512, L=32，单层注意力分数 QKᵀ ~ 2·512²·4096 ≈ 2.1G FLOPs；FFN（4d 升维）~ 8·512·4096² ≈ 68.7G FLOPs，FFN 才是大头。",
    "例 2（LM Head）：n=1(Decode), d=4096, V=128000，LM Head ~ 2·1·4096·128000 ≈ 1.05G FLOPs/token，Decode 时占可观比例。",
    "例 3（长序列注意力爆炸）：n=32K，注意力分数矩阵 ~ 2·(32K)²·4096 ≈ 8.6T FLOPs/层，32 层 ~275T，必须 FlashAttention 分块。"
  ],
  "lineByLine": [
    "Embedding 把 token id 查表变 d 维向量（无矩阵乘，仅查表）。",
    "每层：QKV 投影（3 个 d×d）→ split 多头 → Attention(QKᵀV) → 输出投影(d×d) → 加残差。",
    "FFN：d→4d 线性 + 激活 + 4d→d 线性，逐位置独立。",
    "RMSNorm/LayerNorm 归一化稳定数值。",
    "LM Head：d→V 投影得 vocab 上 logits，softmax 得下一 token 概率。"
  ],
  "codeNotes": [
    "注意力分数 QKᵀ 是 O(n²d)，FFN 是 O(nd²)；当 n≫d 时注意力主导，n≪d 时 FFN 主导——这是长/短序列优化重点不同的原因。",
    "Decode 时 n 含历史，但本步只算 1 个新 token 的 QKV，历史 KV 从缓存读，所以计算量不随 n 线性涨，访存才随 n 涨。",
    "LM Head 成本容易低估：大词表下它是 Decode 词表投影的大头，候选集采样可绕过完整 V 投影。"
  ],
  "followUps": [
    {
      "question": "Prefill 和 Decode 在计算上有何不同？",
      "answer": "Prefill 对全部输入 token 并行做矩阵乘，batch 维=n，矩阵『胖』，算力利用率高（compute-bound）；Decode 只对 1 个新 token 计算，矩阵极『瘦』（batch 维=1），算力严重闲置、访存主导（memory-bound）。两者同一套层结构，但张量形状不同，硬件利用率天差地别。"
    },
    {
      "question": "LM Head 为什么贵？",
      "answer": "LM Head 要把 d 维隐状态投影到词表 V（常 10万~20万），是 O(n·d·V) 的大矩阵乘。Decode 时 n=1 但仍要做 d×V 的整行投影，常占 Decode 可观比例（10%~20%）；故有候选集（先小模型筛 top-k 再对全 V 算）、投机解码（草稿模型先出词省去部分 LM Head）等优化。"
    },
    {
      "question": "GQA/MQA 如何影响计算与显存？",
      "answer": "标准 MHA 每注意力头各有一对 K/V，KV Cache 与 KV 投影随头数线性增长；MQA 所有头共享一组 K/V、GQA 分组共享，把 KV 头数从 h 降到 1 或 g≪h，KV Cache 显存与读取字节降 h 倍，Decode 带宽瓶颈显著缓解，代价是少量质量损失，是长上下文推理的标配。"
    }
  ],
  "followUpAnswers": [
    "Prefill 对全部输入 token 并行做矩阵乘，batch 维=n，矩阵『胖』，算力利用率高（compute-bound）；Decode 只对 1 个新 token 计算，矩阵极『瘦』（batch 维=1），算力严重闲置、访存主导（memory-bound）。两者同一套层结构，但张量形状不同，硬件利用率天差地别。",
    "LM Head 要把 d 维隐状态投影到词表 V（常 10万~20万），是 O(n·d·V) 的大矩阵乘。Decode 时 n=1 但仍要做 d×V 的整行投影，常占 Decode 可观比例（10%~20%）；故有候选集（先小模型筛 top-k 再对全 V 算）、投机解码（草稿模型先出词省去部分 LM Head）等优化。",
    "标准 MHA 每注意力头各有一对 K/V，KV Cache 与 KV 投影随头数线性增长；MQA 所有头共享一组 K/V、GQA 分组共享，把 KV 头数从 h 降到 1 或 g≪h，KV Cache 显存与读取字节降 h 倍，Decode 带宽瓶颈显著缓解，代价是少量质量损失，是长上下文推理的标配。"
  ]
};
