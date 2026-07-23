export default {
  "kind": "concept",
  "id": "mgpu-ep",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "专家并行 EP（MoE）",
  "prompt": "专家并行（Expert Parallelism）在 MoE 模型里是怎么做的？",
  "quickAnswer": "MoE 每层有多个前馈专家，每个 token 只经 top-k 个专家。专家并行把不同专家放到不同卡上，token 经路由后通过 all-to-all 把该送的专家输入发到对应卡、算完再 all-to-all 收回。它让专家参数跨卡扩展(显存降)，但 all-to-all 通信量大且对负载不均敏感，是 MoE 训练/推理的核心并行维度。",
  "approach": "专家分卡 + 路由 all-to-all 分发/收集 token。",
  "explanationFocus": "是什么：EP 是把 MoE 中多个专家网络分布到不同 GPU，token 经门控路由后通过 all-to-all 通信被送到对应专家计算，再收回结果。",
  "bruteForce": "所有专家放单卡 → 专家参数撑爆显存，且多数专家闲置。",
  "derivation": [
    "为什么需要：MoE 专家参数量巨大但每 token 只激活少数，单卡放不下全部专家，需要把专家分散到多卡。",
    "怎么实现：门控 g 选出 top-k 专家；用 all-to-all 把每个 token 的隐藏向量发到目标专家所在卡；各卡算本地专家；再 all-to-all 把结果发回原卡拼接。",
    "有什么代价：all-to-all 通信量随专家数/ token 数增长，且 token 分布不均会导致部分卡过载(掉队)；需辅助负载均衡损失。",
    "怎么评测：专家利用率、各卡计算均衡度、all-to-all 耗时占比、端到端吞吐。"
  ],
  "invariant": "每个 token 仍只被其选中的 top-k 专家处理，聚合结果与单卡 MoE 一致。",
  "walkthrough": "8 专家 4 卡，每卡 2 专家；1024 token 经路由，all-to-all 后每卡约处理 512 token 的专家计算。",
  "edgeCases": [
    "token 路由不均使部分卡过载。",
    "all-to-all 对网络拓扑极敏感。",
    "top-k 与专家数需匹配容量。"
  ],
  "code": "# Python (概念)\ndef expert_parallel(x, gates, experts, world):\n    dispatch = all_to_all(x, gates, world)   # 按路由发到专家卡\n    out = experts.local_forward(dispatch)\n    return all_to_all_back(out, world)        # 结果发回原卡",
  "codeNotes": [
    "all_to_all 是 EP 的核心通信。",
    "gates 决定 token→专家映射。"
  ],
  "complexity": "专家显存 1/E；通信两次 all-to-all，量 ∝ tokens×hidden。",
  "followUps": [
    {
      "question": "EP 和 TP 在 MoE 里怎么配合？",
      "answer": "常叠加：先跨卡做 EP 分专家，再对单个专家内部做 TP 切其权重，形成 EP×TP×DP 的组合，兼顾专家规模与单专家算力。"
    },
    {
      "question": "EP 最大痛点？",
      "answer": "all-to-all 通信量大且 token 分布不均导致负载倾斜，掉队卡拖慢整体，需要负载均衡与容量因子缓解。"
    }
  ],
  "followUpAnswers": [
    "EP 分专家 + TP 切专家内权重。",
    "痛点是 all-to-all 与负载不均。"
  ],
  "pitfalls": [
    "忽略 token 不均造成的掉队。",
    "以为 EP 只省显存——通信开销很大。",
    "（事实核查·2025）专家并行(EP)把专家切到多卡，token 经 all-to-all 重排；常与 DP/TP 组合（如 EP+DP）。DeepSeek 训练/推理用大规模 EP（跨数十卡）。代价是 all-to-all 通信与负载不均，需要 capacity factor 与 token dropping 兜底。"
  ],
  "beginnerSummary": "公司有 8 位专家分坐不同办公室(卡)，每个客户(token)只挑其中 2 位咨询。前台(路由)把客户资料通过内部快递(all-to-all)送到对应专家桌上，专家写完意见再快递回原处拼起来。好处是专家团队可以很大，坏处是快递往来很频繁、还怕某位专家被分配太多客户。",
  "prerequisites": [
    "了解 MoE 与 top-k 路由。",
    "知道 all-to-all 通信语义。",
    "专家参数远大于激活。"
  ],
  "workedExample": [
    "8 专家 4 卡，每卡 2 专家。",
    "1024 token 经 all-to-all 分发计算。"
  ],
  "lineByLine": [
    "门控选出每个 token 的 top-k 专家。",
    "all-to-all 把 token 发到专家卡。",
    "各卡算本地专家前向。",
    "all-to-all 把结果发回原卡拼接。"
  ],
  "diagram": "token ──门控──┐\n            all-to-all ↓\n卡0:[专家0,1] 卡1:[专家2,3] ...\n结果 all-to-all 回原卡 → 拼接"
};
