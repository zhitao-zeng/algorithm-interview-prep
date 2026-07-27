export default {
  "id": "mmd-efficient-mllm",
  "kind": "concept",
  "category": "多模态模型",
  "title": "高效多模态大模型",
  "difficulty": "Medium",
  "prompt": "如何在保持多模态能力的同时压缩模型？轻量 VLM、token 压缩进阶与蒸馏/量化的关键手段有哪些？",
  "quickAnswer": "三类手段：轻量 VLM（小 VIT+小 LLM、Mobile 架构）、token 压缩（按语义合并/下采样视觉 token，进阶如 Q-Former、token pruning）、蒸馏与量化（用大模型教小模型、INT8/INT4 与 LoRA 适配）。目标是降显存与时延同时尽量保住基准分数。",
  "code": "import torch\n\ndef token_compress(tokens, keep_ratio=0.5):\n    scores = tokens.norm(dim=-1)                 # 粗略重要性\n    k = int(tokens.size(0) * keep_ratio)\n    idx = scores.topk(k).indices                 # 保留最显著 token\n    return tokens[idx.sort().values]             # 压缩后的视觉 token",
  "complexity": "O(N·log N)",
  "beginnerSummary": "大模型能力强但太重、跑得慢、费显存。高效多模态就像给模型“减肥”：要么用更小的模型，要么把不重要的图像小块丢掉，要么把数字精度降低，让它在手机和实时场景也能跑。",
  "explanationFocus": "是什么：高效多模态大模型指在不显著损失多模态理解与生成能力前提下，通过轻量架构、视觉 token 压缩、知识蒸馏与低比特量化，降低参数量、显存与推理时延的技术体系。",
  "approach": "架构上用小 VIT+紧凑 LLM；token 压缩用下采样、聚类合并或注意力重要性剪枝（如 token pruning）；训练上用大模型蒸馏小模型、用适配器迁移；推理上做 INT8/INT4 量化与 KV-cache 优化。进阶压缩结合可学习 query（Q-Former）做瓶颈表征。",
  "derivation": [
    "为什么需要：原生 VLM 视觉 token 动辄上千，部署成本高，难上边缘设备。",
    "怎么实现：架构瘦身 + token 压缩 + 蒸馏/量化三级组合，逐层压成本。",
    "有什么代价：过度压缩损细粒度能力（小字、细节计数），量化引入舍入误差。",
    "怎么评测：在 MMBench 等榜测精度掉点，并报告时延/显存/参数量 Pareto。"
  ],
  "edgeCases": [
    "文档小字/密集计数对 token 压缩极敏感。",
    "低比特量化在激活异常值上误差放大。",
    "蒸馏时大模型自身幻觉被小模型继承。",
    "移动端算子不支持某些量化格式。"
  ],
  "pitfalls": [
    "只压 LLM 不压视觉 token，视觉序列仍是时延瓶颈。",
    "为保精度过度保留 token，压缩收益归零。"
  ],
  "prerequisites": [
    "模型量化与蒸馏基础",
    "视觉 token 化与注意力机制"
  ],
  "workedExample": [
    "Token pruning：按注意力权重丢弃低信息图像 patch，序列减半而 VQA 掉点很小。",
    "Q-Former：用少量可学 query 从图像抽瓶颈表征，替代上千原始视觉 token。"
  ],
  "lineByLine": [
    "token_compress 用 token 范数近似重要性，按 keep_ratio 保留最显著者。",
    "返回排序后的压缩 token，序列变短，直接降低后续 LLM 计算量。"
  ],
  "followUps": [
    {
      "question": "Token 压缩和量化哪个对精度影响更大？",
      "answer": "通常激进 token 压缩更易伤细粒度任务（OCR、计数），量化对语义问答影响较小但需处理激活离群点；实践常先量化再适度压缩 token。"
    },
    {
      "question": "蒸馏小模型如何避免继承大模型的幻觉？",
      "answer": "在蒸馏数据中加入负样本/事实一致性过滤，并对齐到更可靠的教师（或集成），而非盲目模仿；可结合 RLHF 式对齐减小编造。"
    }
  ],
  "followUpAnswers": [
    "通常激进 token 压缩更易伤细粒度任务（OCR、计数），量化对语义问答影响较小但需处理激活离群点；实践常先量化再适度压缩 token。",
    "在蒸馏数据中加入负样本/事实一致性过滤，并对齐到更可靠的教师（或集成），而非盲目模仿；可结合 RLHF 式对齐减小编造。"
  ]
};
