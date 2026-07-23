export default {
  "kind": "concept",
  "id": "arch-rope-multidim",
  "category": "Transformer 架构",
  "difficulty": "Hard",
  "title": "RoPE 在 2D/多维的推广",
  "prompt": "RoPE 的旋转思想如何推广到 2D（视觉）或多维序列？",
  "quickAnswer": "把 (x,y) 等多维坐标拆成多个 1D 位置，对每个维度分别施加对应频率的旋转并乘积，使内积依赖多维相对坐标。",
  "approach": "将绝对位置从标量 m 扩展为向量 (m_x,m_y,...)，对每个坐标维度做独立 1D RoPE 再组合。",
  "explanationFocus": "是什么：在图像/视频等结构化输入中，位置是多维的（如 (row,col) 或 (t,row,col)）。多维 RoPE 对每个坐标维度分别构造 1D 旋转矩阵（各自基频），组合后让注意力分数同时依赖各维的相对位移 (Δx,Δy,...)。",
  "bruteForce": "朴素把 2D 坐标展平成一维再套 1D RoPE，会丢失行列方向的独立相对关系，近邻结构被扭曲。",
  "derivation": [
    "为什么需要：视觉/视频的局部性在 2D/3D 网格上，需分别编码每个轴的相对位移。",
    "怎么实现：对每个轴 α 用其位置分量 p_α 构造 R_α，最终旋转为各轴旋转的组合（可分解为维度专属频率块）。",
    "有什么代价：频率设计与轴向解耦需仔细，避免不同轴频率混叠；实现比 1D 复杂。",
    "怎么评测：在图像/视频长序列任务上对比展平 1D RoPE，验证轴间相对位置被正确建模。"
  ],
  "invariant": "不变量：旋转的可分性——各坐标轴旋转相互独立，内积同时依赖 (Δx,Δy,...)，保持正交与范数不变。",
  "walkthrough": "2D 位置 (r,c)：对行轴用频率组 θ^row、列轴用 θ^col，分别旋转对应维度块，使 q^⊤k 依赖 (Δr,Δc)。",
  "edgeCases": [
    "频率组需在行/列轴分配不重叠的维度区间，防混叠。",
    "视频需额外时间轴旋转，3D 位置更要小心频率预算。",
    "部分工作用『轴向分解 RoPE』而非全耦合。"
  ],
  "code": "def rope_2d(x_rc, r, c, dim, base=10000.0):\n    # x_rc: (dim,) 按前半维给行、后半维给列\n    half = dim // 2\n    inv = [base ** (-2*i/dim) for i in range(half)]\n    ang_r = [r * inv[i] for i in range(half//2)]\n    ang_c = [c * inv[i] for i in range(half//2, half)]\n    # 对对应维度块分别旋转（示意）\n    return 'rotate row-block by ang_r, col-block by ang_c'",
  "codeNotes": [
    "真实实现把维度切成行/列专属频率块。",
    "需保证行/列频率区间不重叠以免混叠。"
  ],
  "complexity": "仍是 O(Nd) 前处理（N 为 token 数）；不增加注意力 O(N²d)。视觉 token 数常因 patch 化而很大。",
  "followUps": [
    {
      "question": "多维 RoPE 与展平 1D RoPE 差在哪？",
      "answer": "展平丢失轴间独立相对关系，多维 RoPE 分别编码每轴位移，保留 2D/3D 局部结构。"
    },
    {
      "question": "频率怎么在轴上分配？",
      "answer": "通常把维度均分给各轴、各自用一组基频，避免不同轴频率混叠导致相对关系模糊。"
    }
  ],
  "followUpAnswers": [
    "展平丢失轴间独立相对关系，多维 RoPE 分别编码每轴位移，保留 2D/3D 局部结构。",
    "通常把维度均分给各轴、各自用一组基频，避免不同轴频率混叠导致相对关系模糊。"
  ],
  "pitfalls": [
    "把 2D 坐标直接拼成标量再套 1D RoPE——会扭曲网格局部性。",
    "行/列频率区间重叠造成混叠，模型难分辨轴间位移。"
  ],
  "beginnerSummary": "1D RoPE 像沿一条线拧；2D RoPE 像在『横』和『竖』两个方向各拧各的，于是图片里上下左右的距离都被分别记下来。",
  "prerequisites": [
    "RoPE 原理",
    "多维坐标",
    "视觉 Transformer"
  ],
  "workedExample": [
    "1D：位置 m 单轴旋转。",
    "2D：位置 (r,c) 行轴、列轴分别旋转，分数依赖 (Δr,Δc)。"
  ],
  "lineByLine": [
    "inv 生成基频。",
    "ang_r/ang_c 分别用行/列位置。",
    "对维度块分别旋转实现轴解耦。"
  ],
  "diagram": "1D RoPE:  rot(m)\n2D RoPE:  rot_row(r) ⊗ rot_col(c)\n内积依赖 (Δr, Δc)"
};
