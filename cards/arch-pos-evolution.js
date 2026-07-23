export default {
  "kind": "concept",
  "id": "arch-pos-evolution",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "位置编码演进：Sinusoidal→RoPE→ALiBi",
  "prompt": "从 Sinusoidal 到 RoPE 再到 ALiBi，位置编码是如何演进的？",
  "quickAnswer": "Sinusoidal 加法绝对编码；RoPE 乘性旋转注入相对位置；ALiBi 直接在分数上加与距离线性成比例的偏置、天然外推。",
  "approach": "按『注入位置』（输入/分数）与『相对感知方式』（乘性/加性）梳理三条主线。",
  "explanationFocus": "是什么：Sinusoidal 把固定频率正弦向量加到输入嵌入（加法式绝对编码）；RoPE 用旋转矩阵把相对位置写进 Q/K 内积；ALiBi 在注意力分数上叠加一个随相对距离线性衰减的偏置（不加任何位置嵌入），从而无需位置向量即可外推。",
  "bruteForce": "可学习绝对位置向量最简单，但无相对距离建模且不能外推。",
  "derivation": [
    "为什么需要：要让模型感知顺序与距离，并尽量支持长序列外推。",
    "怎么实现：Sinusoidal 用 sin/cos 预定义；RoPE 旋转 Q/K；ALiBi 加 bias=m·(i−j)。",
    "有什么代价：Sinusoidal/RoPE 需位置计算；ALiBi 不编码绝对位置、靠偏置表达距离，外推好但丢弃绝对线索。",
    "怎么评测：长上下文困惑度与长程任务；ALiBi 在长外推上突出，RoPE 综合最强。"
  ],
  "invariant": "不变量：三者最终都让『距离越远注意力越弱』；RoPE/ALiBi 显式依赖相对距离，Sinusoidal 仅隐式。",
  "walkthrough": "BERT 用 Sinusoidal/可学习；LLaMA/Qwen 用 RoPE；ALiBi（GLM 部分变体、MPT）用分数偏置，训练 2k 可推 8k+。",
  "edgeCases": [
    "ALiBi 无绝对位置信息，某些需绝对顺序的任务略吃亏。",
    "RoPE 与 ALiBi 都需额外处理因果掩码。",
    "Sinusoidal 在现代 decoder LLM 中已基本被 RoPE 取代。"
  ],
  "code": "def alibi_bias(n, heads, slopes):\n    # 在分数矩阵上加 m*(i-j) 偏置\n    import torch\n    idx = torch.arange(n)\n    rel = idx[:, None] - idx[None, :]      # (i-j)\n    bias = torch.stack([s * rel for s in slopes])  # (h, n, n)\n    return bias",
  "codeNotes": [
    "slopes 为每头不同斜率，通常几何递减。",
    "ALiBi 偏置加到 QKᵀ/√d 之后、softmax 之前。"
  ],
  "complexity": "三者均 O(Nd) 级别额外开销；不增加注意力 O(N²d) 主复杂度。ALiBi 偏置可预计算缓存。",
  "followUps": [
    {
      "question": "ALiBi 为什么能外推？",
      "answer": "偏置只依赖相对距离 i−j 且线性，未训练长度处仍按同规律衰减，无周期性溢出问题。"
    },
    {
      "question": "RoPE 与 ALiBi 能结合吗？",
      "answer": "一般不叠加，二者都服务相对位置；部分工作尝试混合但非主流。"
    }
  ],
  "followUpAnswers": [
    "偏置只依赖相对距离 i−j 且线性，未训练长度处仍按同规律衰减，无周期性溢出问题。",
    "一般不叠加，二者都服务相对位置；部分工作尝试混合但非主流。"
  ],
  "pitfalls": [
    "以为 Sinusoidal 能像 RoPE 一样精确相对感知——它只是加法式绝对编码。",
    "把 ALiBi 的偏置当成『位置嵌入』——它从不出现在输入上。"
  ],
  "beginnerSummary": "Sinusoidal 像给每个位置贴固定坐标；RoPE 把坐标转成旋转角度写进注意力；ALiBi 干脆在注意力分数上按距离扣分，越远的越压低。",
  "prerequisites": [
    "Sinusoidal 编码",
    "RoPE 原理",
    "注意力偏置"
  ],
  "workedExample": [
    "Sinusoidal：embed += sin/cos(pos)。",
    "RoPE：Q/K 按位置旋转。",
    "ALiBi：score += slope·(i−j)。"
  ],
  "lineByLine": [
    "idx 生成位置序列。",
    "rel=i−j 得到相对距离矩阵。",
    "bias=slope*rel 每头不同斜率施加距离惩罚。"
  ],
  "diagram": "Sinusoidal: 加在输入\nRoPE: 旋转 Q/K\nALiBi: score += m*(i-j)  偏置\n趋势: 绝对 -> 相对乘性 -> 相对加性偏置"
};
