export default {
  "kind": "concept",
  "id": "arch-attn-complexity",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "Attention 计算复杂度 O(N²d) 含义",
  "prompt": "注意力复杂度 O(N²d) 具体指什么，瓶颈来自哪里？",
  "quickAnswer": "O(N²d) = N 个 query 各与 N 个 key 做 d 维点积并加权求和；瓶颈在 N² 的成对交互与 N×N 中间矩阵。",
  "approach": "从单头公式展开：QKᵀ 是 N×N、每元素 d 维点积，PV 再 N×N 乘 d，得 O(N²d)。",
  "explanationFocus": "是什么：标准自注意力对每个 query 与所有 N 个 key 计算 d 维点积（O(N²d)），再对 N 个 value 加权求和（又 O(N²d)），故总复杂度 O(N²d)。瓶颈在于 query-key 的成对比较随序列长度平方增长。",
  "bruteForce": "朴素循环：对每个 i 遍历所有 j 做点积，显式 O(N²d)，且在长序列下内存需存 N×N 分数。",
  "derivation": [
    "为什么需要：注意力本质是『全连接』的成对比较，N 翻倍计算与显存约翻 4 倍。",
    "怎么实现：矩阵化 QKᵀ（O(N²d)）+ softmax + PV（O(N²d)）。",
    "有什么代价：长序列 N 大时 N² 主导，显存与带宽成瓶颈（见 FlashAttention）。",
    "怎么评测：测不同 N 下的 FLOPs/显存，验证随 N² 增长；长上下文需稀疏/线性注意力或 Flash。"
  ],
  "invariant": "不变量：注意力对序列长度 N 是平方复杂度，对头维度 d 线性；这是自注意力的固有性质，不随实现改变。",
  "walkthrough": "N=1024,d=64：QKᵀ 约 1024²×64≈6.7×10⁷ 次乘加/头；N 增到 4096 则约 16 倍。",
  "edgeCases": [
    "因果掩码不降低渐近 O(N²)，只省常数（约一半）。",
    "线性/稀疏注意力旨在把 N² 降为 O(N) 或 O(N√N)。",
    "d 固定时瓶颈完全在 N²。"
  ],
  "code": "def attn_flops(N, d, h=1):\n    # 单头 QK^T: N*N*d ; PV: N*N*d\n    per_head = 2 * N * N * d\n    return per_head * h",
  "codeNotes": [
    "仅估乘加次数，忽略 softmax 的 N² 指数运算。"
  ],
  "complexity": "时间/空间均与 N² 成正比（O(N²d) 计算、O(N²) 分数矩阵）；FlashAttention 将显存降到 O(N) 但不改 FLOPs。",
  "followUps": [
    {
      "question": "想把 N² 降下来有哪些路线？",
      "answer": "稀疏注意力（局部窗口/稀疏模式）、线性注意力（核技巧近似）、或 FlashAttention 仅降显存不降 FLOPs。"
    },
    {
      "question": "多头会乘以 h 吗？",
      "answer": "多头下总 FLOPs 约乘 h，但 h·d_k=d_model，故整体仍是 O(N²·d_model)。"
    }
  ],
  "followUpAnswers": [
    "稀疏注意力（局部窗口/稀疏模式）、线性注意力（核技巧近似）、或 FlashAttention 仅降显存不降 FLOPs。",
    "多头下总 FLOPs 约乘 h，但 h·d_k=d_model，故整体仍是 O(N²·d_model)。"
  ],
  "pitfalls": [
    "以为 FlashAttention 把 O(N²d) 变成 O(N)——它只降显存，FLOPs 仍是 O(N²d)。",
    "把 d 与 N 的瓶颈混淆：长序列时 N² 主导。"
  ],
  "beginnerSummary": "注意力让每个词和所有词两两打分，词数翻倍，『两两组合』就翻四倍，所以复杂度随长度平方增长，这就是它处理超长文本费力的根源。",
  "prerequisites": [
    "自注意力公式",
    "大 O 复杂度",
    "FlashAttention 动机"
  ],
  "workedExample": [
    "N=1024：分数矩阵 1024×1024。",
    "N=4096：约 16 倍计算与显存。"
  ],
  "lineByLine": [
    "2*N*N*d：QKᵀ 与 PV 各一次 N²d。",
    "乘 h：多头叠加。",
    "瓶颈在 N² 项随序列平方增长。"
  ],
  "diagram": "复杂度来源:\nQK^T : (N,N,d) -> N*N*d\nsoftmax: (N,N)\nPV    : (N,N,d) -> N*N*d\n总计 O(N^2 d)，瓶颈 N^2"
};
