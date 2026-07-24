export default {
  "kind": "concept",
  "id": "arch-swiglu",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "SwiGLU 门控前馈激活",
  "prompt": "SwiGLU 的公式是什么，为什么它取代了 ReLU/GELU 成为主流 FFN 激活？",
  "quickAnswer": "FFN(x)=W2·(SiLU(W1·x)⊙W3·x)，用门控乘性交互提升表达力，且参数效率更高。",
  "approach": "把标准 FFN 的两矩阵结构扩展为「候选+门」三矩阵（W1 候选、W3 门、W2 下投影），门控做逐元素乘。",
  "explanationFocus": "是什么：SwiGLU 是 GLU 门控线性单元家族的一员，把 FFN 输出写成 (SiLU(W1·x) ⊙ W3·x) 再经 W2 投影；⊙ 是逐元素乘，W3·x 作为数据依赖的门控，决定哪些特征通过。",
  "bruteForce": "标准 FFN=W2·ReLU(W1·x) 只有一个固定非线性，缺乏输入依赖的「开关」，表达力受限。",
  "derivation": [
    "为什么需要：Shazeer(2020)发现门控线性单元在固定参数量下一致优于标准 FFN/ReLU/GELU。",
    "怎么实现：FFN(x)=W2·(SiLU(W1·x)⊙W3·x)，W1/W3 升维、W2 降维；为保参数量，中间维取约 8/3·d_model。",
    "有什么代价：比标准 FFN 多一个 W3 矩阵（+50% FFN 参数），但靠把中间维从 4d 降到 8/3 d 抵消，总参数接近。",
    "怎么评测：在同等参数量下对比困惑度，SwiGLU/GeGLU 通常更优；LLaMA/Qwen/Mistral 均采用。"
  ],
  "invariant": "门控的不变量：W3·x 是逐元素、依赖输入的「软开关」；中间维 ≈ 8/3·d 以保持与 4d 标准 FFN 参数预算相当（建议二次核对具体模型的 ffn_mult）。",
  "walkthrough": "设 d_model=1024，标准 FFN 中间维 4096（2 矩阵 ≈ 8.4M）；SwiGLU 取中间维 2752（3 矩阵 ≈ 8.5M），参数相当但多了一个门控通道。",
  "edgeCases": [
    "不同模型 ffn_dim_multiplier 不同（如 LLaMA 用 1.3 再对齐到 1024 倍数）。",
    "Gemma 用 GeGLU（把 SiLU 换 GELU），属同一家族。",
    "无 bias 的线性层（LLaMA 风格）与有 bias 实现并存。"
  ],
  "code": "import torch.nn.functional as F\n\ndef swiglu_ffn(x, w1, w3, w2):\n    # x:(B,T,d) w1,w3:(d_ff,d) w2:(d,d_ff)\n    gate = F.silu(x @ w1.T)   # 候选经 SiLU\n    up = x @ w3.T             # 门控信号\n    h = gate * up             # 逐元素乘\n    return h @ w2.T           # 下投影",
  "codeNotes": [
    "SiLU(x)=x·sigmoid(x)，比 ReLU 更平滑、处处可导。",
    "w3 即「up」投影，与 w1「gate」投影共享输入 x。"
  ],
  "complexity": "FFN 为 O(N·d·d_ff)；SwiGLU 因 3 矩阵略多于标准 2 矩阵，但中间维更小，整体参数与计算接近。",
  "followUps": [
    {
      "question": "SwiGLU 与 GeGLU 差别大吗？",
      "answer": "仅激活不同（SiLU vs GELU），经验表现接近，SwiGLU 因 LLaMA 惯例成默认，Gemma 用 GeGLU。"
    },
    {
      "question": "为何门控有效而标准激活不行？",
      "answer": "门控引入输入依赖的乘性交互，是「学出来的非线性开关」，比固定非线性更灵活。"
    }
  ],
  "followUpAnswers": [
    "仅激活不同（SiLU vs GELU），经验表现接近，SwiGLU 因 LLaMA 惯例成默认，Gemma 用 GeGLU。",
    "门控引入输入依赖的乘性交互，是学出来的非线性开关，比固定非线性更灵活。"
  ],
  "pitfalls": [
    "混淆 W1/W3 角色：W1 是 gate 候选、W3 是 up 门控，命名因实现而异。",
    "以为 SwiGLU 参数一定更多——靠缩小中间维可与标准 FFN 参数持平。"
  ],
  "beginnerSummary": "SwiGLU 像给 FFN 加了一个「水龙头」：一份数据算出一个开关量，逐元素决定另一份数据哪些放行，从而更精细地控制信息流。",
  "prerequisites": [
    "Transformer FFN",
    "激活函数 ReLU/GELU/SiLU",
    "矩阵乘法与参数预算"
  ],
  "workedExample": [
    "标准 FFN: h=ReLU(xW1)W2。",
    "SwiGLU: h=SiLU(xW1)⊙(xW3) 再乘 W2，多一路门控。"
  ],
  "lineByLine": [
    "F.silu(x@w1.T)：候选分支过 SiLU。",
    "x@w3.T：门控分支生成开关。",
    "gate*up 与 h@w2.T：逐元素乘后下投影。"
  ],
  "diagram": "x ──> W1 ─> SiLU ─┐\n   └─> W3 ─────────> ⊙ ─> W2 ─> out\n        (门控)      (乘)"
};
