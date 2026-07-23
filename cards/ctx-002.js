export default {
  "kind": "concept",
  "id": "ctx-002",
  "category": "长上下文与位置编码",
  "difficulty": "Medium",
  "title": "Position Interpolation (PI) 的位置索引缩放",
  "prompt": "Position Interpolation (PI) 如何用缩放因子 s=L_train/L_target 扩展 RoPE 上下文？",
  "quickAnswer": "PI 在套用 RoPE 前把每个位置索引 m 乘以 s=L_train/L_target（或等价把 inv_freq 除以 s），让所有旋转角度落回训练区间，再用约 1000 步微调适配。",
  "approach": "线性压缩位置：m → m·s，s<1，把超长序列『挤』回训练时见过的角度范围。",
  "explanationFocus": "是什么：Position Interpolation（Chen et al., 2023, arXiv:2306.15595）是最简单的 RoPE 扩窗法，它不做外推，而是把位置索引整体线性缩放，使新序列的每个角度都落在训练分布内。",
  "bruteForce": "不加处理地直接把序列拉到 L_target，位置角度远超训练范围，模型输出立刻乱码（PPL 爆炸）。PI 用线性插值替代这种 OOD 外推。",
  "derivation": [
    "为什么需要：RoPE 在训练长度外的角度从未被学习，直接外推必崩，需要一个把新坐标『翻译』回熟悉区间的办法。",
    "怎么实现：设 s = L_train / L_target，将位置 m 改为 m·s 后再算 RoPE（等价于 inv_freq /= s）。4x 扩展时 s=0.25，四个真实 token 挤进一个『虚拟位置』。",
    "有什么代价：所有维度被统一压缩，高频维度（编码近邻顺序）分辨率也被压，2–4x 后局部区分力下降；通常需 ~1000 步微调把 PPL 拉回基线，更大倍数无法靠微调救回。",
    "怎么评测：在 L_target 上测 PPL 与 retrieval，并对比短上下文基准确认未退化；与 NTK/YaRN 同条件下比 PPL 曲线。"
  ],
  "invariant": "PI 的缩放是『全局均匀』的：高频与低频维度被一视同仁地压缩，这是它局部失真的根源。",
  "walkthrough": "例：LLaMA-2 7B 训于 4096，目标 16384（4x）。位置 5000 经 PI 变为 5000×0.25=1250，落回训练区间；但相邻 token 的角度差只剩 1/4，需微调适应。",
  "edgeCases": [
    "4x 以上扩展时高频维度分辨率不足，近邻 token 难以区分（红曲线失效）。",
    "纯 zero-shot 用 PI，PPL 会变差，必须微调。",
    "部分实现用 inv_freq/=scale（scale=L_target/L_train>1）等价实现，注意别把 scale 与 s 搞反。"
  ],
  "code": "def precompute_rope_cache_pi(seq_len, dim, base=10000.0, scale=1.0):\n    # PI 关键: inv_freq 除以 scale (scale = L_target/L_train)\n    half = dim // 2\n    inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))\n    inv_freq = inv_freq / scale\n    pos = torch.arange(seq_len).float()\n    freqs = torch.outer(pos, inv_freq)\n    return freqs.cos(), freqs.sin()",
  "codeNotes": [
    "scale = L_target/L_train（>1）；等效于位置乘 s=1/scale。",
    "此实现直接改 inv_freq，避免改位置索引，数值等价。"
  ],
  "complexity": "预计算 O(seq_len·dim)，推理无额外开销；成本在约 1000 步长上下文微调。",
  "followUps": [
    {
      "question": "PI 的 scale 和 ctx-001 里的 s 是什么关系？",
      "answer": "互为倒数：s=L_train/L_target，scale=L_target/L_train，一个压位置一个压频率，数学等价。"
    },
    {
      "question": "PI 最大能扩多少倍？",
      "answer": "经验上约 4x 靠微调可达近基线；更大倍数信息被压没，质量不可逆下降。"
    }
  ],
  "followUpAnswers": [
    "互为倒数：s=L_train/L_target，scale=L_target/L_train，一个压位置一个压频率，数学等价。",
    "经验上约 4x 靠微调可达近基线；更大倍数信息被压没，质量不可逆下降。"
  ],
  "pitfalls": [
    "把 scale（>1）和 s（<1）混淆，导致方向反了。",
    "以为 PI 免训练，其实 zero-shot 下 PPL 明显变差。"
  ],
  "beginnerSummary": "PI 是『把长尺子上的刻度整体压扁』：原本 0~8192 的位置被乘 0.25 压成 0~2048，模型看到的全是它熟悉的刻度，只是变密了，需要稍微重新适应一下。",
  "prerequisites": [
    "RoPE 旋转位置编码",
    "长度外推与插值概念"
  ],
  "workedExample": [
    "L_train=2048, L_target=8192, s=0.25。",
    "位置 8191 → 8191×0.25=2047.75，角度回到训练末端；1000 步微调后 PPL 接近基线。"
  ],
  "lineByLine": [
    "inv_freq = 1/(base**(...))：标准 RoPE 逆频率。",
    "inv_freq = inv_freq / scale：PI 核心，整体压低频率即整体压缩位置。",
    "torch.outer(pos, inv_freq)：生成各位置旋转角，角度范围被压回训练区间。"
  ],
  "diagram": "位置: 0 ... 8191\nPI:  0 ... 2047.75   (×0.25)\n角度全部落在训练 [0,2048] 区间 ✓"
};
