export default {
  "kind": "concept",
  "id": "arch-rope",
  "category": "Transformer 架构",
  "difficulty": "Hard",
  "title": "RoPE 旋转位置编码原理",
  "prompt": "RoPE 旋转位置编码是怎么把绝对位置信息变成相对位置感知的？",
  "quickAnswer": "对 Q/K 乘上位置相关的旋转矩阵 R_θ,m（块对角 2D 旋转），使 q^⊤k 只依赖相对位置 n−m。",
  "approach": "用正交旋转矩阵对投影后的 Q/K 做旋转，利用 R_θ,m^⊤R_θ,n=R_θ,n−m 让内积退化为相对位置函数。",
  "explanationFocus": "是什么：RoPE（Rotary Position Embedding）是一种乘性位置编码，把每个 token 的 Q/K 向量按绝对位置 m 旋转一个角度，使得旋转后两向量的内积只与它们位置差 n−m 有关，从而在无额外偏置参数的情况下注入相对位置信息。",
  "bruteForce": "朴素做法是在 token 表示上直接加绝对/相对位置向量（加法式），但加法式难以让注意力分数精确只依赖相对位置，且相对位置偏置往往需要额外可学习参数表。",
  "derivation": [
    "为什么需要：Transformer 本身对输入顺序不变，必须显式注入位置；加法式编码无法让 q^⊤k 精确只依赖相对距离。",
    "怎么实现：把 d 维拆成 d/2 个 2D 子空间，第 i 个子空间按角度 m·θ_i 旋转，θ_i=10000^{−2(i−1)/d}，形成块对角旋转矩阵 R_Θ,m，计算 q'=R_Θ,m W_q x。",
    "有什么代价：需对每个位置、每个 head 计算 sin/cos 并配对乘加，但只是 O(Nd) 的前处理，不增加注意力 O(N²d) 主复杂度；远场（大 n−m）注意力有内置衰减。",
    "怎么评测：在长文本困惑度、外推长度、长程依赖任务上对比；验证注意力分数随距离衰减、且在未训练长度上的泛化。"
  ],
  "invariant": "旋转矩阵正交 → 不变量是「内积只依赖相对位置 n−m」，且范数保持不变；高频维度编码近距、低频维度编码远距。",
  "walkthrough": "设 d=2，位置 m=1，θ=0.1，则 R_θ,1=[[cos0.1,−sin0.1],[sin0.1,cos0.1]]≈[[0.995,−0.0998],[0.0998,0.995]]，把 W_q x 旋转约 5.7°；位置 n=4 的 k 旋转约 22.9°，二者内积只由角度差 3·θ 决定。",
  "edgeCases": [
    "d 为奇数时最后一个维度无法成对旋转，需特殊处理或 padding 到偶数维。",
    "θ_i 基频 base（默认 10000）的选择影响外推；base 过小高频过早饱和、过大低频区分度差。",
    "相对位置很大时旋转角度大幅重叠，远距位置区分度下降（长度外推问题）。"
  ],
  "code": "import math\n\ndef rope(x, pos, dim, base=10000.0):\n    # x: (dim,) 某 head 的 query/key 向量\n    half = dim // 2\n    inv_freq = [base ** (-2 * i / dim) for i in range(half)]\n    angles = [pos * inv_freq[i] for i in range(half)]\n    out = [0.0] * dim\n    for i in range(half):\n        a, b = x[2*i], x[2*i+1]\n        c, s = math.cos(angles[i]), math.sin(angles[i])\n        out[2*i] = a*c - b*s\n        out[2*i+1] = a*s + b*c\n    return out",
  "codeNotes": [
    "inv_freq 只与维度有关，可预先计算并缓存，训练/推理时按位置查表。",
    "实际框架用复数乘法或奇偶交错 gather 做向量化，避免 Python 循环。"
  ],
  "complexity": "位置旋转为 O(N·d) 前处理；不增加注意力主体的 O(N²d) 计算复杂度，显存 O(Nd)。",
  "followUps": [
    {
      "question": "RoPE 为什么能长度外推？",
      "answer": "旋转角是位置的连续函数，未见过的位置也能算出角度，因此可在更长序列上泛化，但需配合 base 调整或 NTK-aware 缩放。"
    },
    {
      "question": "RoPE 和 Sinusoidal 编码的本质区别？",
      "answer": "Sinusoidal 是加法式且只加在输入嵌入上、只在绝对位置；RoPE 是乘性（旋转），直接作用在 Q/K 上并让注意力分数精确依赖相对位置。"
    }
  ],
  "followUpAnswers": [
    "旋转角是位置的连续函数，未见过的位置也能算出角度，因此可在更长序列上泛化，但需配合 base 调整或 NTK-aware 缩放。",
    "Sinusoidal 是加法式且只在输入嵌入上、仅绝对位置；RoPE 乘性旋转作用在 Q/K 上，使注意力分数精确依赖相对位置。"
  ],
  "pitfalls": [
    "误以为 RoPE 在 value 上也编码了位置——实际 v_n=W_v x_n 不带旋转。",
    "把 θ_i 的底数 10000 当作可调超参却忽略其对长序列外推的影响。"
  ],
  "beginnerSummary": "RoPE 就像给每个位置的 Q/K 向量按位置角度「拧一下」，拧的角度只和位置差有关，于是两个 token 越接近，它们「对齐」得越好，远了就自然疏远。",
  "prerequisites": [
    "自注意力机制",
    "正交矩阵与旋转",
    "正弦位置编码"
  ],
  "workedExample": [
    "取维度 d=2，第 i 个 2D 子空间旋转角 m·θ_i。",
    "token m=1 的 q 旋转 5.7°，token n=4 的 k 旋转 22.9°，内积由角度差 17.2°=3·θ 决定，与 1、4 本身无关。"
  ],
  "lineByLine": [
    "inv_freq 计算每个 2D 子空间的基频 θ_i。",
    "angles 用当前位置 pos 乘基频得到旋转角。",
    "对每个 (a,b) 配对用 2D 旋转公式更新，得到旋转后的向量分量。"
  ],
  "diagram": "q_m --R(m)--> q'_m       k_n --R(n)--> k'_n\n   q'_m · k'_n = x_m W_q^T R(n-m) W_k x_n\n   (只与 n-m 有关，与绝对位置无关)"
};
