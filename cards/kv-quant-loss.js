export default {
  "kind": "concept",
  "id": "kv-quant-loss",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "KV Cache 量化的精度损失",
  "prompt": "KV Cache 量化可能造成什么精度损失？",
  "quickAnswer": "KV 量化把浮点 K/V 映射到低精度整数，引入舍入与截断误差，会轻微扰动注意力分数分布。主要风险点：异常值(outlier)被压扁导致关键 token 注意力偏移、长上下文累积误差、以及不同层/头敏感度不一。实践中 INT8/FP8 在合理粒度与 outlier 处理下通常接近无损，但非绝对——极端长上下文、敏感任务或缩放不当时仍可能掉点；INT4 更敏感，需 per-token/per-head 缩放与异常值处理。",
  "approach": "损失来自舍入/截断；风险在 outlier、长上下文累积、层间敏感度差异。",
  "explanationFocus": "是什么：KV 量化引入舍入误差，可能扰动注意力分布；风险集中在 outlier、长程累积与敏感头。",
  "bruteForce": "无脑 INT4 全局缩放 → outlier 被压扁，重要 token 注意力错位。",
  "derivation": [
    "为什么需要：要知道量化的边界，才能选精度与缩放策略。",
    "怎么实现（控损）：用 per-token/per-head 对称缩放、对 outlier 单独处理、分层选择精度。",
    "有什么代价：越激进（INT4）缩放越敏感；额外缩放元数据与反量化开销。",
    "怎么评测：长上下文基准 + 敏感任务上对比困惑度/准确率，看 P99 是否劣化。"
  ],
  "invariant": "误差随量化比特数下降而上升；per-token 缩放通常显著优于 per-tensor。",
  "walkthrough": "某层 K 含一个超大值：全局缩放把它压到接近 0，该 token 注意力被错误抑制；改用 per-token 缩放后恢复。",
  "edgeCases": [
    "不同层敏感度差异大，可混合精度（敏感层留 FP16）。",
    "长上下文误差逐 token 累积。",
    "某些头（如检索相关）对 KV 精度更敏感。"
  ],
  "code": "# Python\ndef per_token_scale(tensor):\n    # 比全局缩放更稳: 每个 token 独立缩放\n    scale = tensor.abs().amax(dim=-1, keepdim=True) / 127\n    return torch.round(tensor / scale).to(torch.int8), scale\n\ndef mse(a, b):\n    return ((a - b)**2).mean()",
  "codeNotes": [
    "per-token 缩放能压制 outlier 伤害。",
    "可分层混合精度保敏感层。"
  ],
  "complexity": "量化 O(元素)；误差评估 O(元素)；INT4 需更细缩放才有可比质量。",
  "followUps": [
    {
      "question": "怎么判断某层 KV 能不能量化？",
      "answer": "看该层 K/V 的数值范围与 outlier 程度；范围集中、无极端值的可放心 INT8/INT4，范围宽或 outlier 多的层用 per-token 缩放或保留高精度。"
    },
    {
      "question": "INT4 KV 还有救吗？",
      "answer": "有，配合 per-head 缩放、异常值裁剪/单独处理、甚至分层混合精度，可在多数任务保持可用，但工程复杂度上升。"
    }
  ],
  "followUpAnswers": [
    "分层混合精度。",
    "per-token/per-head 缩放。"
  ],
  "pitfalls": [
    "全局缩放被 outlier 拖垮。",
    "假定所有层同样耐量化。"
  ],
  "beginnerSummary": "速记缩写偶尔会写错一两个字，多数时候无碍，但若是人名、术语这种关键信息写错，整句意思就偏了。KV 量化同理：大部分 token 误差无害，可一旦把“关键句”的笔记记歪，模型对该句的注意力就错位。用“逐句单独校对”（per-token 缩放）能大幅避免。",
  "prerequisites": [
    "量化引入舍入误差。",
    "注意力对 K/V 敏感。",
    "outlier 会放大误差。"
  ],
  "workedExample": [
    "全局缩放下某 outlier K 被压平 → 该 token 注意力被错误抑制。",
    "per-token 缩放后恢复；INT8 通常 P99 无损。"
  ],
  "lineByLine": [
    "量化=浮点映射整数, 有舍入。",
    "误差扰动注意力分布。",
    "风险: outlier/长程累积/敏感头。",
    "per-token缩放+混合精度可控损。"
  ],
  "diagram": "损失来源:\n 舍入/截断误差\n outlier 被压扁 → 关键token注意力错位\n 长上下文误差累积\n 层/头敏感度不一\n对策: per-token缩放, 混合精度, outlier处理"
};
