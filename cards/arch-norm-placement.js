export default {
  "kind": "concept",
  "id": "arch-norm-placement",
  "category": "Transformer 架构",
  "difficulty": "Easy",
  "title": "归一化放在注意力与 FFN 的哪（norm 位置约定）",
  "prompt": "现代 Transformer 里 RMSNorm/LayerNorm 具体放在注意力和 FFN 的什么位置？",
  "quickAnswer": "Pre-LN 约定：每个子层『之前』各放一个归一化（attn 前、FFN 前），最后块末再放一个最终 norm。",
  "approach": "按现代 decoder 块顺序给出归一化位置：RMSNorm→Attn→+残差→RMSNorm→FFN→+残差→(可选)末 Norm。",
  "explanationFocus": "是什么：在 Pre-LN 约定下，每个 Transformer 块内有两处归一化——注意力子层输入前、FFN 子层输入前，各一个（RMSNorm 或 LayerNorm）；残差连接绕过归一化直接加回；部分模型在最后一块后再加一个最终归一化再接 LM head。",
  "bruteForce": "Post-LN 把归一化放在残差相加『之后』（x=Norm(x+Sub(x))），原始 Transformer 如此，但深层不稳。",
  "derivation": [
    "为什么需要：归一化位置决定梯度路径；Pre-LN 让残差流保持恒等直通，深层可训。",
    "怎么实现：x = x + Attn(Norm(x))；x = x + FFN(Norm(x))；末尾可选 Norm。",
    "有什么代价：几乎无；仅约定差异。Pre-LN 可能略损同设置质量但稳定压倒。",
    "怎么评测：对照 Post-LN 看深层训练曲线；现代 LLM 全部 Pre-LN 双 norm。"
  ],
  "invariant": "不变量：残差流本身不被归一化，仅子层『输入』被归一化——这是 Pre-LN 稳定训练的核心约定。",
  "walkthrough": "LLaMA 块：input_layernorm(RMSNorm)→Attn→残差；post_attention_layernorm(RMSNorm)→SwiGLU→残差；末尾 final_norm→LM head。",
  "edgeCases": [
    "个别架构把 FFN 的 norm 与注意力共用或省略其一（少见）。",
    "命名陷阱：LLaMA 变量名 *layernorm 实为 RMSNorm。",
    "编码器（BERT）常 Post-LN 双 LayerNorm。"
  ],
  "code": "def block(x, attn, ffn, n1, n2):\n    h = x + attn(n1(x))   # 注意力前归一化\n    h = h + ffn(n2(h))    # FFN 前归一化\n    return h",
  "codeNotes": [
    "n1,n2 为两个独立归一化层实例。"
  ],
  "complexity": "两个归一化每层 O(N·d)，与整体 O(N²d) 相比可忽略；位置改变不影响复杂度只影响稳定性。",
  "followUps": [
    {
      "question": "注意力后的 norm 在哪？",
      "answer": "在 FFN 子层『之前』（即注意力残差之后、FFN 输入前），称为 post_attention_layernorm。"
    },
    {
      "question": "为什么残差不加 norm？",
      "answer": "保持残差恒等路径，使梯度可无损回传，这是 Pre-LN 稳定的关键。"
    }
  ],
  "followUpAnswers": [
    "在 FFN 子层之前（注意力残差之后、FFN 输入前），称为 post_attention_layernorm。",
    "保持残差恒等路径，使梯度可无损回传，这是 Pre-LN 稳定的关键。"
  ],
  "pitfalls": [
    "把注意力后的 norm 误以为在注意力『之后』——实际在 FFN 之前、残差之外。",
    "被 LLaMA 的 *layernorm 命名误导以为用的是 LayerNorm。"
  ],
  "beginnerSummary": "现代块里归一化像『进门前的安检』：进注意力前要过一次，进 FFN 前再过一次，而残差那条主干道不设安检，保证信息畅通。",
  "prerequisites": [
    "Pre-LN vs Post-LN",
    "RMSNorm/LayerNorm",
    "Transformer 块结构"
  ],
  "workedExample": [
    "注意力前：RMSNorm(x)→Attn→+x。",
    "FFN 前：RMSNorm→FFN→+x；块末可选 final norm。"
  ],
  "lineByLine": [
    "n1(x)：注意力子层输入归一化。",
    "n2(h)：FFN 子层输入归一化。",
    "残差 x/h 不经归一化直接加回。"
  ],
  "diagram": "x ->[RMSNorm]-> Attn --\\\n                                 + -> x' ->[RMSNorm]-> FFN -->+ -> out\n(残差主干不经 norm)"
};
