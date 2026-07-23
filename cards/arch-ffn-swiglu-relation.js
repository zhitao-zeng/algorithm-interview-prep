export default {
  "kind": "concept",
  "id": "arch-ffn-swiglu-relation",
  "category": "Transformer 架构",
  "difficulty": "Easy",
  "title": "Transformer 前馈层 FFN 与 SwiGLU 的关系",
  "prompt": "标准 FFN 与 SwiGLU 是什么关系，SwiGLU 改了哪部分？",
  "quickAnswer": "SwiGLU 是 FFN 的一种激活/结构升级：把单矩阵+固定激活换成『门控双路（W1/W3）+SiLU』再 W2 投影。",
  "approach": "把 FFN 写成『升维→非线性→降维』，对比标准 ReLU/GELU 与 SwiGLU 在中间结构上的差异。",
  "explanationFocus": "是什么：FFN 是 Transformer 块里对每个位置独立作用的双层 MLP（升维激活再降维）；SwiGLU 是 FFN 的一种具体实现，用门控线性单元替换传统的单路激活，引入第三个矩阵 W3 作为门控。",
  "bruteForce": "原始 FFN=W2·ReLU(W1·x) 只有两个矩阵和单一固定非线性。",
  "derivation": [
    "为什么需要：标准激活表达力有限，门控结构在同等参数下质量更好。",
    "怎么实现：SwiGLU 在升维后分两路（W1 候选、W3 门），逐元素乘后经 W2 降维。",
    "有什么代价：多一个 W3 矩阵，但靠缩小中间维（≈8/3 d）与标准 FFN 参数持平。",
    "怎么评测：同参数困惑度对比，SwiGLU 优于 ReLU/GELU FFN。"
  ],
  "invariant": "不变量：FFN 始终为『逐位置 MLP』，输入/输出维度均为 d_model；SwiGLU 只改变中间非线性与矩阵数。",
  "walkthrough": "标准 FFN 两矩阵；SwiGLU 三矩阵（W1,W3,W2），其中 W3 生成门控与 W1 候选逐元素相乘。",
  "edgeCases": [
    "GeGLU/ReGLU 是同族变体，仅激活不同。",
    "部分模型 FFN 带 bias，LLaMA 风格无 bias。",
    "中间维度公式因模型而异（4d / 8/3 d / multiplier）。"
  ],
  "code": "import torch.nn.functional as F\n\ndef ffn_swiglu(x, w1, w3, w2):\n    return (F.silu(x @ w1.T) * (x @ w3.T)) @ w2.T",
  "codeNotes": [
    "W1/W3 升维，W2 降维；门控来自 W3 分支。"
  ],
  "complexity": "FFN/SwiGLU 均为 O(N·d·d_ff)；SwiGLU 因 3 矩阵略多 FLOPs，但 d_ff 更小使其整体接近标准 FFN。",
  "followUps": [
    {
      "question": "FFN 为什么对每个位置独立？",
      "answer": "FFN 是 position-wise，不含跨 token 交互，跨 token 信息交换由注意力完成，二者分工。"
    },
    {
      "question": "SwiGLU 能换回 GELU 吗？",
      "answer": "可以（即 GeGLU），质量相近，SwiGLU 因 LLaMA 惯例更常见。"
    }
  ],
  "followUpAnswers": [
    "FFN 是 position-wise，不含跨 token 交互，跨 token 信息交换由注意力完成，二者分工。",
    "可以（即 GeGLU），质量相近，SwiGLU 因 LLaMA 惯例更常见。"
  ],
  "pitfalls": [
    "误以为 SwiGLU 改变了 FFN 的逐位置性质——它只改内部激活结构。",
    "把 W3 当成输出投影——W2 才是降维输出。"
  ],
  "beginnerSummary": "FFN 是每个词各自过的一道『全连接小网络』；SwiGLU 给这道网络加了个门：一份算内容、一份算开关，相乘后再压缩回去。",
  "prerequisites": [
    "Transformer FFN",
    "SwiGLU 激活",
    "逐位置前馈"
  ],
  "workedExample": [
    "标准: h=ReLU(xW1)W2。",
    "SwiGLU: h=(SiLU(xW1)⊙xW3)W2。"
  ],
  "lineByLine": [
    "x@w1.T：候选分支升维。",
    "x@w3.T：门控分支升维。",
    "(silu*up)@w2.T：门控相乘后降维。"
  ],
  "diagram": "FFN: x -> W1 -> act -> W2 -> out\nSwiGLU: x->W1->SiLU ┐\n        x->W3 ----->⊙->W2->out"
};
