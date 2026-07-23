export default {
  "kind": "concept",
  "id": "ctx-003",
  "category": "长上下文与位置编码",
  "difficulty": "Medium",
  "title": "NTK-aware 插值：调整基频而非线性缩放位置",
  "prompt": "NTK-aware 插值与 PI 有何不同，为什么改的是 RoPE 的基频 b 而不是位置索引？",
  "quickAnswer": "NTK-aware 通过抬高基频 b'=b·s^(d/(d-2))（s=L_target/L_train）来拉伸频率，使高频维度几乎不动、低频维度多插值，从而保住局部分辨率，比 PI 退化更平缓（源自 bloc97 的 Reddit，后被 YaRN 形式化）。",
  "approach": "缩放基频而非位置：高频保真、低频插值，把『失真』集中到对局部最不敏感的维度。",
  "explanationFocus": "是什么：NTK-aware Scaled RoPE（bloc97, 2023，非论文，reddit 帖）是一种 RoPE 扩窗法：它不改位置索引，而是抬高 RoPE 的基频 base，使高维（高频、短波长）几乎不变，低维（低频、长波长）被充分插值。",
  "bruteForce": "PI 把所有维度统一压缩，高频维度（负责近邻区分）也被压，局部顺序感丧失。NTK-aware 针对此改进：按维度频率有差别地缩放。",
  "derivation": [
    "为什么需要：PI 均匀压缩毁掉高频维度的局部分辨率；NTK 理论指出高频成分被挤压后最难泛化，应少动高频、多动低频。",
    "怎么实现：把基频由 b=10000 改为 b' = b · s^(d/(d−2))，s=L_target/L_train，d 为 head_dim。等价于每维 inv_freq 用新基频计算；高频维（大指数）几乎不变，低频维（小指数）被明显拉伸。",
    "有什么代价：相比 PI 退得更优雅、可 zero-shot 用一阵，但中频维度仍可能轻度 OOD；超大倍数仍需微调，且实际扩展比常要设得比目标更高。",
    "怎么评测：与 PI 在相同 s 下比 PPL/检索曲线；看『lost in middle』与短任务保留度；dynamic NTK 可在免微调下随长度自适应。"
  ],
  "invariant": "NTK-aware 的不变式：最高频维度缩放≈1（保局部），最低频维度缩放≈s（全插值），中间平滑过渡。",
  "walkthrough": "例：head_dim=128, s=4，b'=10000·4^(128/126)≈40970；高频维波长不变保局部，低频维被拉到覆盖 32K。",
  "edgeCases": [
    "基频公式指数 d/(d−2) 对 d 敏感，换 head_dim 要重算。",
    "仍属『部分维度外推』，超大 s 时中频维会轻微 OOD。",
    "Dynamic NTK 按当前长度 l' 设 s=max(1,l'/L_train)，需推理时动态改。"
  ],
  "code": "def ntk_aware_base(base, scale, dim):\n    # scale = L_target / L_train (>1)\n    return base * (scale ** (dim / (dim - 2)))\n\ndef ntk_freqs(dim, scale, base=10000.0):\n    new_base = ntk_aware_base(base, scale, dim)\n    i = torch.arange(0, dim, 2).float()\n    return 1.0 / (new_base ** (i / dim))",
  "codeNotes": [
    "关键在于换 base 而非除 inv_freq，频率被『拉伸』而非『平移』。",
    "scale>1；dim/(dim−2) 接近 1，使高频几乎不动。"
  ],
  "complexity": "仅改 base 的 O(dim) 预计算，零推理开销；可免微调（质量次优）或短微调。",
  "followUps": [
    {
      "question": "NTK-aware 为什么比 PI 更能 zero-shot？",
      "answer": "因为它保住了高频维度的局部分辨率，只有低频被插值，模型在未见长度上衰减更平滑。"
    },
    {
      "question": "b'=b·s^(d/(d−2)) 这指数为什么长这样？",
      "answer": "由『最高频维缩放为 1、最低频维缩放为 s』两个边界条件反解得出，保证两端行为受控。"
    }
  ],
  "followUpAnswers": [
    "因为它保住了高频维度的局部分辨率，只有低频被插值，模型在未见长度上衰减更平滑。",
    "由『最高频维缩放为 1、最低频维缩放为 s』两个边界条件反解得出，保证两端行为受控。"
  ],
  "pitfalls": [
    "误以为 NTK 完全免微调就能到目标长度（实际大倍数仍需微调）。",
    "把 s 的方向搞反（这里 scale=L_target/L_train>1）。"
  ],
  "beginnerSummary": "PI 像把所有刻度一样压扁，近邻也糊了；NTK-aware 则聪明地只拉伸『大尺度』那部分频率、保留『小尺度』高频的清晰，所以局部顺序仍分得清。",
  "prerequisites": [
    "RoPE 逆频率与波长概念",
    "PI 位置插值"
  ],
  "workedExample": [
    "d=128, s=4, base=10000。",
    "b'=10000·4^(128/126)≈40970；高频维波长不变，低频维被拉到覆盖 32K，局部不糊。"
  ],
  "lineByLine": [
    "def ntk_aware_base：按 d/(d−2) 抬高基频。",
    "new_base = base * scale**(dim/(dim-2))：核心缩放，scale>1。",
    "1.0/(new_base**(i/dim))：用新基频算逆频率，高频几乎不变、低频明显拉伸。"
  ],
  "diagram": "维 i: 高(局部) ──── 低(全局)\nPI:   全压 ×1/s\nNTK:  几乎不动 ──── 拉 ×s"
};
