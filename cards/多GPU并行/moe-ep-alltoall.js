export default {
  "kind": "concept",
  "id": "moe-ep-alltoall",
  "category": "多GPU并行",
  "difficulty": "Hard",
  "title": "什么是 Expert Parallel？为什么 MoE 推理容易被 All-to-All 通信限制？",
  "prompt": "什么是 Expert Parallel（专家并行）？为什么 MoE 推理容易被 All-to-All 通信限制？",
  "quickAnswer": "Expert Parallel 把不同 Expert 分布到不同 GPU，每个 token 先被 Dispatch（按路由发到持有对应专家的卡）计算，再 Combine（把结果收回原卡聚合）。由于每个 token 的路由目标分散在各卡，需要一次 All-to-All 把 token 发给专家、另一次 All-to-All 把结果发回，通信量随专家数与 token 数增长；当专家分布不均或网络带宽不足时，部分 GPU 等数据、造成气泡，推理被通信而非算力限制。",
  "approach": "专家跨卡放置 + Dispatch/Combine 两次 All-to-All；瓶颈在跨卡 token 搬运而非矩阵乘。",
  "explanationFocus": "是什么：EP 是 MoE 专属的并行维度；其特征是 All-to-All 通信（与 TP 的点对点/All-Reduce 不同）。",
  "bruteForce": "所有专家放一张卡（无 EP），显存/算力放不下大模型时不可行；或只用 TP/PP 不做 EP，导致每卡持有全部专家。",
  "derivation": [
    "为什么需要：专家总数多、单卡放不下全部，且每 token 只激活少数专家，适合按专家切分。",
    "怎么实现：各卡持一部分专家；Router 分数算出后，把 token 按目标专家发到对应卡（Dispatch），各卡算完再把输出发回原卡（Combine）。",
    "为什么受 All-to-All 限制：token 路由目标分散，需全局交换；通信量 ∝ token 数 × 专家分布跨度。",
    "怎么评测：看 All-to-All 带宽占用、各卡计算时间方差（气泡）、端到端 TPOT 与吞吐。"
  ],
  "invariant": "EP 的通信模式是 All-to-All（Dispatch+Combine 各一次），不是 TP 的 All-Reduce；瓶颈在跨卡 token 搬运。",
  "walkthrough": "一个 token 被路由到卡 A 的专家2 与卡 C 的专家5：Dispatch 阶段该 token 被发往 A、C，其余卡收到别的 token；各卡算完，Combine 阶段把结果发回原卡聚合。",
  "edgeCases": [
    "负载不均：热门专家集中某几卡，这些卡算得久、他卡空等（气泡）。",
    "小 Batch：Dispatch/Combine 的通信启动开销占比高，MoE 不一定比稠密快。",
    "与 TP 混用：EP×TP 组合时 All-to-All 与 All-Reduce 交织，调度更复杂。"
  ],
  "code": "# Python\n# 概念示意: EP 的 Dispatch/Combine (All-to-All)\ndef expert_parallel_dispatch(tokens, route_gpu, num_gpus):\n    # route_gpu[i]: token i 选中的专家所在卡\n    buckets = [[] for _ in range(num_gpus)]\n    for t, g in zip(tokens, route_gpu):\n        buckets[g].append(t)         # Dispatch: 按目标卡分组发送\n    return buckets                   # 各卡算完后再 Combine 发回\n# 真实为 All-to-All 集合通信, 非简单分组",
  "codeNotes": [
    "真实用 NCCL All-to-All 跨卡交换, 含元数据与梯度同步。",
    "负载均衡直接决定气泡大小。"
  ],
  "complexity": "计算 O(K·d²) 每 token（同单卡 MoE）；通信 O(token数 × 路由跨度) 的 All-to-All，两次（Dispatch+Combine）。",
  "followUps": [
    {
      "question": "Expert 如何分布到不同 GPU？",
      "answer": "按专家编号或负载把 N 个专家切分到各卡，每卡持一部分；常配合 TP 在卡内再切单个专家。"
    },
    {
      "question": "Token 为什么需要 Dispatch？",
      "answer": "路由决定某 token 该去哪个专家的卡，必须把它发到持有该专家的卡才能计算。"
    },
    {
      "question": "Expert 输出为什么还要 Combine？",
      "answer": "Dispatch 后 token 散落各卡，计算结果需发回原卡（或原序列位置）按路由权重聚合，恢复完整表示。"
    },
    {
      "question": "为什么负载不均会让部分 GPU 等待？",
      "answer": "热门专家所在的卡算得久，All-to-All 要等最慢的卡完成才能进入下一步，形成气泡。"
    },
    {
      "question": "TP 和 EP 有什么区别？",
      "answer": "TP 沿张量维度切分同一层、用 All-Reduce 求和；EP 沿专家维度切分、用 All-to-All 交换 token，二者切分对象与通信原语都不同。"
    },
    {
      "question": "小 Batch 下为什么 MoE 不一定快？",
      "answer": "小 Batch 时 Dispatch/Combine 的通信与 kernel 启动开销占比高，掩盖了稀疏激活的算力优势。"
    }
  ],
  "followUpAnswers": [
    "按专家编号/负载切卡。",
    "路由决定 token 去哪张卡。",
    "结果需发回聚合。",
    "热门专家卡成瓶颈, 形成气泡。",
    "TP 切张量(All-Reduce), EP 切专家(All-to-All)。",
    "小 Batch 通信开销占比高。"
  ],
  "pitfalls": [
    "把 EP 的 All-to-All 与 TP 的 All-Reduce 混为一谈。",
    "忽视负载均衡导致的气泡。",
    "以为 MoE 任何规模都更快（小 Batch/不均时不成立）。",
    "（事实核查·2025）EP 的通信核心是 all-to-all 交换 token：把每个 token 发给持有目标专家的 GPU，算完再 all-to-all 收回。DeepSeek 用 group-limited routing 限制每 token 最多发往少数节点以压通信量；vLLM 的 MoE 同样走 all-to-all。别以为 MoE 只是“矩阵乘换大一点”。"
  ],
  "beginnerSummary": "当 MoE 的专家多到一张显卡装不下，就得分摊到多张卡，这就是“专家并行（EP）”。麻烦在于：每个字该找的专家散落在不同卡上，所以系统得先把这批字按“该去哪”分发给对应卡（Dispatch），各卡算完再把结果寄回来合并（Combine）。这一步“全体互相寄信”叫 All-to-All，通信量很大。如果调度员偏心、某些专家特别忙，对应卡就一直算、别的卡干等（气泡），这时候卡瓶颈的不是算力而是网卡。批次太小时，寄信的固定开销都够喝一壶，MoE 反而可能不比普通模型快。",
  "prerequisites": [
    "MoE 专家可跨卡放置。",
    "All-to-All 是全体两两交换。",
    "负载不均会产生计算气泡。"
  ],
  "workedExample": [
    "token 路由到卡A专家2、卡C专家5 → Dispatch 发往 A/C。",
    "热门专家挤一卡 → 该卡算久, 他卡空等(气泡)。"
  ],
  "lineByLine": [
    "各卡持有部分专家。",
    "按路由把 token Dispatch 到目标卡。",
    "各卡算被选专家。",
    "Combine 把结果发回聚合。",
    "All-to-All 通信成潜在瓶颈。"
  ],
  "diagram": "Expert Parallel:\n卡0:[E0,E1]  卡1:[E2,E3]  卡2:[E4,E5]\ntoken-+-Dispatch(All-to-All)-+-> 各卡算对应专家\n     |                      |\n     +------Combine--------+-> 原卡聚合\n瓶颈: All-to-All 带宽 + 负载不均气泡"
};
