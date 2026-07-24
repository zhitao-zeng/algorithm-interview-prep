export default {
  "kind": "concept",
  "id": "arch-rope-vs-abs-rel",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "RoPE 与绝对/相对位置编码对比",
  "prompt": "RoPE、绝对位置编码、相对位置偏置三者有什么区别和取舍？",
  "quickAnswer": "绝对编码加在输入上、只给绝对位置；相对偏置改注意力分数矩阵；RoPE 用乘性旋转让分数天然依赖相对位置且无额外参数。",
  "approach": "从「信息注入位置」「是否相对感知」「是否引入可学习偏置」三个维度对比。",
  "explanationFocus": "是什么：绝对位置编码（Sinusoidal/可学习）把位置信息加在 token 嵌入上；相对位置编码（如 T5 bias、偏置项）在注意力分数矩阵上叠加相对位置项；RoPE 则通过旋转 Q/K 把相对位置嵌入分数本身，不需要额外可学习位置参数。",
  "bruteForce": "最简单是加可学习绝对位置向量到每个 embedding，但这样分数 q^⊤k 无法直接表达相对距离，长序列外推也差。",
  "derivation": [
    "为什么需要：要让模型区分顺序并感知距离关系，否则自注意力对排列不变。",
    "怎么实现：绝对编码做 x_m+p_m；相对偏置做 a_mn+q_m^⊤k_n+b(n−m)；RoPE 做 R_m q 与 R_n k 的内积。",
    "有什么代价：绝对编码不显式建模相对距离；相对偏置需存储/学习偏置表；RoPE 几乎零额外参数但需旋转计算。",
    "怎么评测：在翻译、长文本、外推基准上对比困惑度与长程依赖准确率。"
  ],
  "invariant": "RoPE 与相对偏置都满足「分数只依赖 n−m」这一不变量；绝对编码不满足（依赖绝对位置）。",
  "walkthrough": "BERT 用可学习绝对位置（加到 embedding）；T5 用 bucket 化的相对位置偏置加到 logits；LLaMA 用 RoPE 旋转 Q/K。三者都能让模型用上顺序，但只有后两者显式得到相对距离。",
  "edgeCases": [
    "可学习绝对编码在超过训练长度时无法外推。",
    "相对偏置的 bucket 划分对长序列需谨慎设计。",
    "RoPE 在 d 为奇数或 base 设置不当会退化。"
  ],
  "code": "def compare_schemes():\n    # 仅示意三类的分数构成\n    abs_score = 'q^T k + (p_m + p_n)  # 含绝对项'\n    rel_bias = 'q^T k + bias[n-m]      # 相对偏置'\n    rope_score = 'R(m)q ^T R(n)k = q^T R(n-m) k  # 相对旋转'\n    return [abs_score, rel_bias, rope_score]",
  "codeNotes": [
    "代码仅展示三类分数公式差异，非可运行算法。"
  ],
  "complexity": "三类均不改变注意力 O(N²d) 主复杂度；绝对/相对编码额外 O(Nd) 或 O(N²) 偏置存储。",
  "followUps": [
    {
      "question": "为什么现代 LLM 多放弃绝对编码？",
      "answer": "绝对编码无法让注意力分数直接表达相对距离，且长度外推差；RoPE/相对偏置在长上下文与长程依赖上更强。"
    },
    {
      "question": "相对偏置与 RoPE 能共存吗？",
      "answer": "可以，但多数现代模型选其一即可；二者都服务于「分数依赖相对位置」这一共同目标。"
    }
  ],
  "followUpAnswers": [
    "绝对编码无法让注意力分数直接表达相对距离，且长度外推差；RoPE/相对偏置在长上下文与长程依赖上更强。",
    "可以共存但多数模型只选一种；二者服务同一目标——让分数依赖相对位置。"
  ],
  "pitfalls": [
    "把「可学习绝对位置」误认为能感知相对距离。",
    "以为 RoPE 属于「相对位置偏置」一类——它其实是乘性旋转而非加性偏置。"
  ],
  "beginnerSummary": "绝对编码像给每个位置贴门牌号；相对偏置像在两人之间贴「距离标签」；RoPE 像把向量按位置转动，使远近直接体现在对齐程度上。",
  "prerequisites": [
    "位置编码基础",
    "自注意力分数计算",
    "RoPE 原理"
  ],
  "workedExample": [
    "绝对编码：embed + 位置向量，位置 5 与位置 8 仅在各自向量里含 5、8。",
    "RoPE：位置 5 与 8 的 Q/K 旋转后，其内积只由 8−5=3 决定。"
  ],
  "lineByLine": [
    "abs_score 显示绝对项 p_m+p_n 仍含绝对位置。",
    "rel_bias 用 bias[n-m] 直接建模相对距离。",
    "rope_score 用旋转矩阵把相对位置写进内积。"
  ],
  "diagram": "绝对: x + p_m  ─┐\n相对: score + bias[n-m]\nRoPE: R(m)q · R(n)k = (相对角度)"
};
