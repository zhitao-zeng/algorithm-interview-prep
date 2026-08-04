export default {
  "id": "me-upcycling",
  "category": "MoE 架构",
  "difficulty": "Hard",
  "title": "稠密转 MoE 升级",
  "prompt": "Upcycling（把稠密模型升级为 MoE）是怎么做的，为什么比从头训更省？",
  "quickAnswer": "Upcycling 先训练一个稠密模型，再把其 FFN 复制成多个专家（常配合一个共享专家），用原稠密权重初始化专家后继续训练。相比从随机初始化训练 MoE，它复用了已学到的知识，收敛更快、同算力下精度更高、训练更稳。",
  "approach": "核心思路是“先稠密、后稀疏”：用成熟的稠密训练流程得到强初始化，再通过复制 FFN 权重构造专家、加入路由与（可选）负载均衡/共享专家，做第二阶段稀疏微调，避免 MoE 从零开始的路由不稳定。",
  "explanationFocus": "是什么：Upcycling（升级回收）指把已训练的稠密 Transformer 转换/扩展为 MoE 模型的过程，通过复制稠密 FFN 权重初始化多个专家，再继续训练以在近似算力下获得更大容量。",
  "bruteForce": "朴素做法：随机初始化一整个 MoE 并从头训练，需要大量算力与调参来稳定路由，且最终精度常不如“稠密预训练+upcycle”的路线。",
  "invariant": "初始化不变式：upcycle 后若路由退化为“所有 token 恒定选专家 0”，则专家输出应近似等于原稠密 FFN 输出（因专家由该权重复制），保证起点不差于稠密模型。",
  "walkthrough": "流程：1) 训练稠密基座；2) 取每层 FFN 权重复制 N 份作专家，可选加共享专家；3) 加 router 与负载均衡/z-loss；4) 用较小 lr 继续训练；5) 监控路由熵与精度，逐步释放容量。",
  "complexity": "说明：第二阶段计算量约等于原稠密训练的延续，但因起点好、步数少，总算力常低于“同规模 MoE 从头训”；参数量因复制专家而增大，但单步计算仍稀疏。",
  "beginnerSummary": "入门概览：与其白手起家训练一个巨大的稀疏模型，不如先训练一个普通的“小专家”模型，再把它的本领复制给多个“分身”专家，稍加训练就得到一个更强大又高效的 MoE。",
  "diagram": "   dense model (trained)\n          |\n   copy FFN weights -> N experts (+shared)\n          |\n   add router + balancers\n          |\n   continue training (small lr)\n          |\n       MoE model",
  "code": "import torch\nimport torch.nn as nn\n\ndef upcycle_ffn(dense_ffn, num_experts):\n    # 把稠密 FFN 的权重复制成 num_experts 个专家\n    experts = nn.ModuleList()\n    for _ in range(num_experts):\n        e = nn.Linear(dense_ffn.in_features, dense_ffn.out_features)\n        e.weight.data.copy_(dense_ffn.weight.data)   # 复制初始化\n        if dense_ffn.bias is not None:\n            e.bias.data.copy_(dense_ffn.bias.data)\n        experts.append(e)\n    return experts",
  "derivation": [
    "为什么需要：从零训练大模型 MoE 算力贵且路由不稳；已有大量稠密训练经验，想低成本获得稀疏容量。",
    "怎么实现：复用稠密基座 FFN 权重复制为多个专家（配 router 与均衡项），以低 lr 继续训练，让专家逐步分化。",
    "有什么代价：复制初始化使初期专家高度相似，需足够训练步数与均衡损失促使分化；容量增大带来额外显存与通信。",
    "怎么评测：对比 upcycle 与从头训 MoE 在同算力下的 loss/精度曲线，以及 upcycle 是否更快达到目标、更稳定。"
  ],
  "edgeCases": [
    "专家数过多而继续训练步数不足，专家未充分分化、近似冗余。",
    "复制时漏复制 bias，导致初始化偏离稠密行为、起点变差。",
    "第二阶段 lr 过大，破坏稠密初始化、精度回退。",
    "原稠密模型容量过小，upcycle 后专家无足够知识可分化。"
  ],
  "pitfalls": [
    "以为 upcycle 后无需继续训练，直接部署导致专家未分化、等价于单专家。",
    "忘记加负载均衡/路由正则，复制初始化的专家迅速塌缩。"
  ],
  "prerequisites": [
    "稠密 Transformer 预训练流程",
    "MoE 专家与路由初始化"
  ],
  "workedExample": [
    "先训一个 1.4B 稠密模型，将其每层 FFN 复制 8 份得到 8 专家 MoE（约 14B 参数），以 1/5 lr 继续训，同等算力下精度超过从零 14B MoE。",
    "复制后第 0 步若路由恒定选专家 0，则 MoE 输出≈原稠密 FFN 输出，保证起点不劣于稠密基线。"
  ],
  "lineByLine": [
    "nn.ModuleList()：容纳复制出的多个专家模块。",
    "e.weight.data.copy_(dense_ffn.weight.data)：把稠密 FFN 权重复制到新专家，保证初始化一致。",
    "复制 bias（若存在）：保持仿射变换的偏置也一致，避免初始化偏移。",
    "返回 experts：供上层替换为 MoE 层并接入 router 继续训练。"
  ],
  "codeNotes": [
    "复制初始化是 upcycle 的核心：它让 MoE 训练起点位于稠密流形上，避免了稀疏训练早期的路由震荡。"
  ],
  "followUps": [
    {
      "question": "upcycle 和从头训 MoE 哪个更省算力？",
      "answer": "同目标精度下 upcycle 通常更省：稠密阶段已提供强初始化，稀疏阶段步数远少于从零训 MoE，总 FLOPs 更低且更稳。"
    },
    {
      "question": "专家会不会一直雷同不分化？",
      "answer": "若均衡损失/路由信号足够且继续训练步数充足，专家会逐渐分化；步数不足或均衡缺失时确实会近似冗余，需要监控路由熵。"
    }
  ],
  "followUpAnswers": [
    "同目标精度下 upcycle 通常更省：稠密阶段已提供强初始化，稀疏阶段步数远少于从零训 MoE，总 FLOPs 更低且更稳。",
    "若均衡损失/路由信号足够且继续训练步数充足，专家会逐渐分化；步数不足或均衡缺失时确实会近似冗余，需要监控路由熵。"
  ],
  "kind": "concept"
};
