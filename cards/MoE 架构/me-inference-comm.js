export default {
  "id": "me-inference-comm",
  "category": "MoE 架构",
  "difficulty": "Hard",
  "title": "MoE 推理通信（All-to-All）",
  "prompt": "MoE 在分布式推理时为什么会产生 all-to-all 通信？它瓶颈在哪，怎么缓解？",
  "quickAnswer": "MoE 把专家分布到不同设备，token 经门控后可能路由到任意设备的专家，因此需要一个 all-to-all 把 token 按目标专家重排到对应设备，计算完再 all-to-all 送回。瓶颈是通信量大且不规则（依赖路由分布），缓解手段有 expert parallelism 布局优化、通信-计算重叠、容量限制与分组路由。",
  "approach": "把它当作“分发-计算-回收”的流水线：先分析路由矩阵得到通信量，再用 all-to-all 重排，并尽量让后续专家计算与回传重叠以掩盖延迟。",
  "explanationFocus": "是什么：MoE 分布式推理中，由于专家被切到不同设备，token 需要先按门控结果跨设备聚到目标专家所在卡（dispatch all-to-all），算完再把结果送回原设备（combine all-to-all），这就是 all-to-all 通信。",
  "bruteForce": "把所有专家复制（replicate）到每张卡，token 本地算完不通信。显存随专家数爆增，无法扩展到成百上千专家，纯靠堆显存不可行。",
  "invariant": "核心不变量：dispatch 与 combine 两次 all-to-all 互为逆操作，任一 token 在“被哪些专家处理、按何权重组合”上输入与最终输出保持一致。",
  "walkthrough": "设 4 卡、每卡 2 专家（共 8 专家），一批 4096 token。门控使卡0 的 1024 个 token 中 600 个要送到卡2 的专家；all-to-all 把 600 个 token 传到卡2，卡2 算完再回传，单步通信量正比于跨卡 token 数。",
  "code": "def all_to_all(tokens_by_device, routing):\n    # tokens_by_device: [D][n_d, d]; routing: 每个 token 的目标设备索引\n    received = [[] for _ in range(len(tokens_by_device))]\n    for dev, toks in enumerate(tokens_by_device):\n        for tok, dst in zip(toks, routing[dev]):\n            received[dst].append(tok)   # 跨设备分发\n    return received",
  "complexity": "通信量 O(T·d·cross_rate)，与跨设备路由比例成正比；计算 O(T·k·d/E_per_device)，瓶颈通常在网络带宽而非算力。",
  "beginnerSummary": "专家分散在各地分公司，客户（token）要被快递寄到对应分公司处理，再寄回来。快递（网络）慢了，整体就卡在寄件上，而不是处理上。",
  "diagram": "卡0 ──┐      ┌── 专家在卡2\n卡1 ──┼─all2all─┼─▶ 计算 ─▶ all2all 回传\n卡2 ──┘      └── 结果归位\n   (token 按目标专家跨卡重排)",
  "derivation": [
    "为什么需要：专家并行把专家分布到多卡，token 经门控后目标专家通常在别卡，必须把数据搬到对应卡才能计算，否则只能复制全部专家。",
    "怎么实现：先用门控得到每个 token 的目标专家→所在设备，发起 all-to-all 把 token 按目标设备聚拢；各卡算完本机专家后再一次 all-to-all 把结果送回原设备。",
    "有什么代价：通信量随跨设备路由比例与 hidden dim 线性增长，且路由不均会造成部分卡成为通信热点，延迟掩盖困难。",
    "怎么评测：测端到端延迟拆解（compute vs comm）、网络带宽利用率，以及不同 batch/路由分布下的吞吐与负载均衡。"
  ],
  "edgeCases": [
    "路由极度不均时某设备收到远超平均的 token，all-to-all 出现长尾卡，整体被最慢卡拖住。",
    "小 batch 下通信固定开销占比高，all-to-all 延迟掩盖不住，吞吐骤降。",
    "专家数不是设备数的整数倍时，专家到设备的映射需显式规划，避免空卡。",
    "变长序列使每卡 token 数不同，all-to-all 需先交换个数元信息再传数据。"
  ],
  "pitfalls": [
    "把 dispatch 和 combine 的 all-to-all 串行化、不重叠，浪费可隐藏的通信时间。",
    "忽略容量限制，使某卡 token 暴增超出显存，触发 OOM。"
  ],
  "prerequisites": [
    "专家并行（Expert Parallelism）与设备放置",
    "集合通信原语 all-to-all / all-reduce",
    "Top-k 路由与容量机制"
  ],
  "workedExample": [
    "4 卡每卡 2 专家共 8 专家；卡0 有 1024 token，其中 600 个目标专家在卡2 → all-to-all 把 600 个向量传到卡2。",
    "卡2 算完这 600 个 token 的专家结果后，再次 all-to-all 按来源设备回传，卡0 才拿到自己 token 的最终表示。"
  ],
  "lineByLine": [
    "received = [[] for _ in range(D)]：为每张目标设备准备一个接收缓冲列表。",
    "for dev, toks in enumerate(tokens_by_device)：遍历每张源设备上的 token。",
    "for tok, dst in zip(toks, routing[dev])：逐 token 看它被路由到哪台设备 dst。",
    "received[dst].append(tok)：把 token 放进目标设备的接收缓冲，模拟跨设备分发。"
  ],
  "codeNotes": [
    "真实框架里 all_to_all 是集合通信而非 Python 循环；这里用循环表达“按目标设备重排”的语义，帮助理解数据如何搬家。"
  ],
  "followUps": [
    {
      "question": "为什么不能用 all-reduce 代替 all-to-all？",
      "answer": "all-reduce 是各卡贡献后求和得到同一份结果，而 MoE 需要的是“每个 token 去它目标专家那张卡”，是点对点多对多的重排，语义完全不同，必须用 all-to-all。"
    },
    {
      "question": "怎么减少 all-to-all 的开销？",
      "answer": "常用手段：通信与专家计算重叠（双流）、限制 expert capacity 压通信量、用分组/局部门控减少跨卡比例、以及用更高带宽互联或专家共置优化拓扑。"
    }
  ],
  "followUpAnswers": [
    "all-reduce 是各卡贡献后求和得到同一份结果，而 MoE 需要的是“每个 token 去它目标专家那张卡”，是点对点多对多的重排，语义完全不同，必须用 all-to-all。",
    "常用手段：通信与专家计算重叠（双流）、限制 expert capacity 压通信量、用分组/局部门控减少跨卡比例、以及用更高带宽互联或专家共置优化拓扑。"
  ],
  "kind": "concept"
};
