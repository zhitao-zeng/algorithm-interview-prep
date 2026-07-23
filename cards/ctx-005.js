export default {
  "kind": "concept",
  "id": "ctx-005",
  "category": "长上下文与位置编码",
  "difficulty": "Hard",
  "title": "YaRN：NTK-by-parts + 注意力温度缩放的综合方案",
  "prompt": "YaRN 由哪三个核心组件构成，为什么比 PI/NTK 更高效？",
  "quickAnswer": "YaRN（Peng et al., 2023, arXiv:2309.00071）= NTK-by-parts 分频段插值 + 注意力温度缩放（1/√t=0.1·ln s+1，折叠进 RoPE）+ Dynamic Scaling；分频段保局部、温度修 softmax 熵，仅需 PI 约 1/10 训练 token 与 1/2.5 步数即可扩到 128K。",
  "approach": "按波长把维度分三段处理（高频不动/中频斜坡/低频插值），再用温度把注意力熵调回训练态。",
  "explanationFocus": "是什么：YaRN（Yet another RoPE extensioN）是当前开源扩窗主流方案，它把 RoPE 各维度按波长相对训练长度分段：高频（波长<<L）不插值、低频（波长>>L）全插值、中频用斜坡函数过渡，并额外在注意力 logits 乘温度 t 修正长上下文下 softmax 熵升高。",
  "bruteForce": "PI 均匀压、NTK-aware 全局换基都有局部失真或中频 OOD；YaRN 用分段 + 温度两步补上这两个漏洞。",
  "derivation": [
    "为什么需要：PI/NTK 要么毁高频、要么中频轻度 OOD，且长上下文下注意力 logits 被摊薄、softmax 过平导致『平均而非检索』。",
    "怎么实现：①NTK-by-parts：按 r=L/λ_d 分三段，阈值 α=1,β=32（LLaMA 最优），ramp γ(r)=(r−α)/(β−α)，频率 h(θ)=(1−γ)θ/s+γθ；②温度：1/√t=0.1·ln(s)+1，通过把 q,k 乘 √(1/t) 折叠进 RoPE，零开销；③Dynamic Scaling：s=max(1,l'/L_train) 随当前长度自适应。",
    "有什么代价：需少量微调（约 400 步、0.1% 数据，远少于 PI），但比纯 NTK 略需调 α/β/t；实现稍复杂但兼容 FlashAttention2。",
    "怎么评测：Passkey retrieval（YaRN 7B s=32 在 128K 达 99.4%）、PPL 沿长度滑动窗、短上下文基准几乎不掉点。"
  ],
  "invariant": "YaRN 的不变式：高频维绝不插值（保局部）、注意力温度保证 softmax 熵与训练时一致，因此『扩窗不丢短任务能力』。",
  "walkthrough": "例：s=16，1/√t=0.1·ln16+1≈1.277→t≈0.613；高频维（λ<<L）γ=0 原样保留，低频维（λ>>L）γ=1 全插值，中频平滑过渡。",
  "edgeCases": [
    "α/β 是经验值（LLaMA 用 1/32），换模型族需重调。",
    "温度公式 1/√t=0.1·ln(s)+1 是 LLaMA 拟合值，其他模型 a,b 略有不同（如 Mistral 128K 用 a=0.07,b=1.0）。",
    "Dynamic Scaling 在长度<L_train 时 s=1，避免短文本性能下降。"
  ],
  "code": "def yarn_freqs(dim, scale, base=10000.0, alpha=1.0, beta=32.0, L_train=4096):\n    i = torch.arange(0, dim, 2).float()\n    freqs = 1.0 / (base ** (i / dim))\n    wl = 2 * math.pi / freqs            # 各维波长\n    r = L_train / wl                    # 波长-上下文比\n    gamma = torch.clamp((r - alpha) / (beta - alpha), 0, 1)\n    ntk_base = base * (scale ** (dim / (dim - 2)))\n    ntk_freqs = 1.0 / (ntk_base ** (i / dim))\n    return (1 - gamma) * (freqs / scale) + gamma * ntk_freqs\n\ndef yarn_attn_scale(scale):\n    return 0.1 * math.log(scale) + 1.0   # 即 1/sqrt(t)",
  "codeNotes": [
    "γ=0→高频用 NTK 原频(几乎不动)；γ=1→低频用 PI(全插值)。",
    "注意力温度折叠进 q,k 缩放 √(1/t)，推理零额外开销。"
  ],
  "complexity": "预计算 O(dim)，注意力温度零开销；微调约 400 步/0.1% 数据，效率为 PI 的 10× token、2.5× 步数。",
  "followUps": [
    {
      "question": "YaRN 的温度缩放为什么能零开销？",
      "answer": "把 1/√t 乘进 q,k 向量等价于在 logits 除以 t，无需改 softmax，故推理零额外成本且兼容 FlashAttention2。"
    },
    {
      "question": "NTK-by-parts 和原始 NTK-aware 差在哪？",
      "answer": "NTK-aware 全局换一个基频；by-parts 按波长分段，高频不插值、中频斜坡、低频全插值，避免中频 OOD。"
    }
  ],
  "followUpAnswers": [
    "把 1/√t 乘进 q,k 向量等价于在 logits 除以 t，无需改 softmax，故推理零额外成本且兼容 FlashAttention2。",
    "NTK-aware 全局换一个基频；by-parts 按波长分段，高频不插值、中频斜坡、低频全插值，避免中频 OOD。"
  ],
  "pitfalls": [
    "把 YaRN 当成单纯『换基频』，漏掉温度缩放这一关键组件。",
    "直接套用 LLaMA 的 α/β/t 到其他模型族而不重调。"
  ],
  "beginnerSummary": "YaRN 是『三件套』：先把频率按波长分段（近邻的高频别动、超长的低频才插值、中间平滑过渡），再把注意力『聚焦度』调回训练时的温度，所以既能读超长文又不犯糊涂。",
  "prerequisites": [
    "NTK-aware 插值",
    "softmax 温度与注意力熵",
    "RoPE 波长概念"
  ],
  "workedExample": [
    "s=16, L_train=4096, α=1, β=32。",
    "高频维 λ<<L → γ=0 保留局部；低频维 λ>>L → γ=1 全插值；温度 1/√t=0.1·ln16+1≈1.277 修正 softmax。"
  ],
  "lineByLine": [
    "r = L_train/wl：按波长判断该维属于哪一段。",
    "gamma = clamp((r-α)/(β-α),0,1)：分段斜坡，避免突变。",
    "yarn_attn_scale：返回 1/√t，用于缩放 q,k 修正注意力熵。"
  ],
  "diagram": "波长 λ: 短(局部)──中──长(全局)\n处理:  不动 │斜坡γ│ 全插值(PI)\n+ 注意力温度 t 修正 softmax 熵"
};
