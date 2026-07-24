export default {
  "kind": "concept",
  "id": "arch-preln-rmsnorm-combo",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "为何大模型普遍用 Pre-LN + RMSNorm",
  "prompt": "为什么现代大模型几乎都同时采用 Pre-LN 和 RMSNorm 这个组合？",
  "quickAnswer": "Pre-LN 保残差路径稳定可训深，RMSNorm 省一次规约更快且质量持平，二者正交叠加出稳定+高效。",
  "approach": "分别说明 Pre-LN（梯度路径）与 RMSNorm（计算效率）的独立收益，再说明二者正交可叠加。",
  "explanationFocus": "是什么：Pre-LN 指归一化放在子层之前、残差路径保持恒等直通；RMSNorm 指去掉均值中心化的轻量归一化。二者是正交选择，现代 LLM 同时采用以获得『深层可稳定训练』+『每层更快』的叠加收益。",
  "bruteForce": "原始 Transformer 用 Post-LN+LayerNorm，需 warmup 且仅适合浅层；直接放大到百层会发散。",
  "derivation": [
    "为什么需要：百层模型既要梯度稳定（Pre-LN），又要每层省算力（RMSNorm 快 10–15%）。",
    "怎么实现：块内 x=x+Sub(RMSNorm(x))，注意力和 FFN 前各放一个 RMSNorm。",
    "有什么代价：几乎无代价；Pre-LN 可能最终质量略逊同设置 Post-LN，但稳定优势压倒；RMSNorm 精度与 LN 持平。",
    "怎么评测：LLaMA/Qwen/Mistral/DeepSeek/Gemma 均采用此组合，是事实标准。"
  ],
  "invariant": "不变量：Pre-LN 保证残差恒等路径（梯度不随深度被压缩）；RMSNorm 保证每层归一化开销最小；二者独立成立可叠加。",
  "walkthrough": "一个 32 层 LLaMA 块：RMSNorm→Attn→+残差→RMSNorm→SwiGLU→+残差；若换成 Post-LN+LN 在同等 recipe 下深层易不稳且更慢。",
  "edgeCases": [
    "个别模型（如部分 encoder）仍用 Post-LN+LayerNorm。",
    "RMSNorm 的 γ 在深度训练中可能增长过大（gamma 爆炸），需监控。",
    "Pre-LN 与归一化类型完全独立，也可 Pre-LN+LayerNorm。"
  ],
  "code": "def block(x, attn, ffn, norm):\n    x = x + attn(norm(x))   # Pre-LN + 任意 norm\n    x = x + ffn(norm(x))\n    return x",
  "codeNotes": [
    "norm 可为 RMSNorm 或 LayerNorm；两个 norm 实例独立。"
  ],
  "complexity": "每层 O(N·d²+N²·d)；RMSNorm 比 LayerNorm 少一次规约，百层累计省约 10–15% 归一化时间。",
  "followUps": [
    {
      "question": "Pre-LN 与 RMSNorm 必须一起用吗？",
      "answer": "不必，二者正交；但组合最常见，因为分别解决稳定与效率，叠加收益最大。"
    },
    {
      "question": "RMSNorm 会不会影响 Pre-LN 的梯度？",
      "answer": "不会，RMSNorm 只替代归一化计算，Pre-LN 的残差恒等路径保持不变。"
    }
  ],
  "followUpAnswers": [
    "不必，二者正交；但组合最常见，因为分别解决稳定与效率，叠加收益最大。",
    "不会，RMSNorm 只替代归一化计算，Pre-LN 的残差恒等路径保持不变。"
  ],
  "pitfalls": [
    "把『Pre-LN』与『RMSNorm』当成同一件事——前者是位置、后者是计算式。",
    "以为 RMSNorm 是为了稳定而存在——它主要为效率，稳定靠 Pre-LN 位置。"
  ],
  "beginnerSummary": "Pre-LN 像保证主干管道畅通（梯度稳），RMSNorm 像把每个阀门做得更轻巧（算得快），两个改进互不冲突，于是大模型一起用。",
  "prerequisites": [
    "Pre-LN vs Post-LN",
    "RMSNorm vs LayerNorm",
    "残差连接"
  ],
  "workedExample": [
    "Pre-LN：先归一化再子层，残差直连。",
    "RMSNorm：归一化时省去均值步骤更快。"
  ],
  "lineByLine": [
    "x+attn(norm(x))：注意力子层 Pre-LN。",
    "x+ffn(norm(x))：FFN 子层 Pre-LN。",
    "norm 用 RMSNorm 实现轻量化。"
  ],
  "diagram": "x -> RMSNorm -> Attn ->+ x\nx -> RMSNorm -> FFN  ->+ x\n(残差流不被归一化)"
};
