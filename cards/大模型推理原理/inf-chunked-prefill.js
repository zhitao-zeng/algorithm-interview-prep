export default {
  "kind": "concept",
  "id": "inf-chunked-prefill",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "什么是 Chunked Prefill？为什么能缓解 Prefill 对 Decode 的干扰？",
  "prompt": "什么是 Chunked Prefill？它为什么能缓解长 Prefill 对 Decode 的干扰？",
  "quickAnswer": "Chunked Prefill 把一个很长的 Prefill 请求切成多个较小的 token chunk（典型 chunk 大小 128~2048 token），在调度时与 Decode 请求混合进同一个 batch 逐步处理，使单个长 Prefill 不再长时间独占 GPU、把 Decode 请求饿死。它和 Continuous Batching 互补：CB 负责请求的动态进出，Chunked Prefill 负责单请求内部的拆分。Chunk 大小在 TTFT、ITL 和吞吐之间权衡——小 chunk 通常改善 ITL（Decode 更及时），但同一 Prefill 要分更多批完成、可能延长 TTFT 并增加调度开销。它并不减少总计算量，只改变计算发生在哪些迭代，收益来自更均衡的调度，而非算术层面的节省。",
  "approach": "Prefill 切块（按固定 chunk_size 拆分长 prompt 的 KV 计算）+ 与 Decode 混合调度（每个迭代只处理一个 chunk，并把剩余算力/显存让给 Decode 请求）+ 连续批处理（请求动态进出 batch）。本质是把\"长 Prefill 的一次性算力尖峰\"摊薄成\"多个迭代的小山峰\"，从而让 Decode 请求的步进更均匀、尾延迟更稳。",
  "explanationFocus": "是什么：Chunked Prefill（分块预填充）是 LLM 推理调度层的一种优化技术，专门解决\"长 Prompt 的 Prefill 阶段会在一个调度步内占满 GPU、导致同批 Decode 请求被长时间阻塞\"的问题。它的核心思想是把一个很长的 Prefill 请求切成多个较小的 token chunk，在连续批处理（Continuous Batching）的框架下，让这些 chunk 与 Decode 请求混合进同一个 batch、分摊到多个迭代里逐步完成。这样单个长 Prefill 就不会长时间独占算力，Decode 请求的尾延迟（ITL/TPOT）因此更平稳，整体服务在\"高吞吐\"与\"低尾延迟\"之间取得更好的平衡。",
  "bruteForce": "整个长 Prompt 作为一个 Prefill 批次一次性算完（即不切块、不与 Decode 混合）：长 Prompt 期间所有 Decode 请求被阻塞，直到 Prefill 结束。在 Prefill 算力密集的设定下，一个 8k token 的 Prefill 可能占满 GPU 数百毫秒，期间同批甚至全局的 Decode 尾延迟出现尖峰。这是最简单但最伤尾延迟的做法，只在\"Prompt 都很短、或完全不混跑 Decode\"的场景勉强可用，否则会严重恶化线上体验。",
  "derivation": [
    "为什么需要：Prefill 阶段对 prompt 所有位置做全注意力，是算力密集型（compute-bound），而 Decode 阶段每步只算 1 个 token、受显存带宽限制（memory-bound）。当一个超长 Prefill 进 batch，它会在单个调度步占满 GPU 算力，把同批 Decode 请求的执行往后推，导致 Decode 的 ITL/TPOT 出现明显尖峰。为了兼顾高吞吐与低尾延迟，必须把长 Prefill 的算力消耗从\"一次性尖峰\"摊成\"多步小峰\"。",
    "怎么实现：调度器把长 Prefill 切成固定大小的 chunk（如 512 token），每个迭代（step）只处理一个 chunk 的注意力与 KV 写入，并把该 step 剩余的计算/显存资源让给 Decode 请求。实现上需维护\"部分 KV\"状态，跨迭代拼接各 chunk 产出的 KV Cache，并在 chunk 边界重新做调度决策。vLLM、Triton 等推理引擎都支持这种\"prefill 分块 + 与 decode 同 batch\"的调度。",
    "有什么代价：由于总 FLOPs 不变，chunk 过碎会引入重复的 kernel 启动、调度与部分 KV 拼接开销，反而拖慢 TTFT；且每 chunk 都需重新加载部分权重上下文，有一定固定成本。同时实现复杂度上升：要正确维护跨迭代的 KV 拼接、chunk 级调度与 Decode 的 batch 槽位竞争。小 chunk 还意味着同一 Prefill 在更多迭代里占用调度器注意力，增加调度抖动。",
    "怎么评测：核心看四个指标——TTFT（首 token 延迟）、ITL/TPOT 的 P99/P50（Decode 尾延迟分布）、系统吞吐（token/s）与长尾叠加下的公平性。一般规律：chunk 越小，Decode ITL 越平稳（好），但 TTFT 因拆太碎而上升、吞吐略降；chunk 越大则反之。评测时要固定并发（如 100 会话）与请求混合比，画 TTFT-ITL 权衡曲线来选 chunk_size。"
  ],
  "invariant": "总计算量不变：Prefill 的总 FLOPs 是固定的（O(n²·d)），Chunked Prefill 只改变\"这些计算在哪些迭代发生、和谁共享 batch\"，绝不减少总 FLOPs。收益来自更均衡的调度，而不是算术层面的节省；因此在评估时必须看尾延迟分布（ITL 的 P99）而非单请求吞吐，否则会误以为\"切块能加速\"。",
  "walkthrough": "一个 8k token 的 Prefill 请求，设 chunk_size=512，则被切成 16 个 chunk，分 16 个迭代完成；在每两个 chunk 之间（即每个迭代的剩余算力）可插入若干 Decode 请求的步进，Decode 的 ITL 不再被一次长 Prefill 拖垮。假设集群并发 100 个 Decode 会话、p99 ITL 目标 <50ms：若不切块，长 Prefill 独占 GPU 的一个 step 可能耗时数百 ms，使 100 个 Decode 全部排队、p99 ITL 飙升到数百 ms；切块后每个 step 最多只算 512 token 的 Prefill，Decode 几乎每个 step 都能推进，p99 ITL 回落到接近目标。注意：batch=32 时若 chunk 太小（如 64），单 chunk 的 kernel 启动/调度开销占比上升，TTFT 反而变差，需要实测权衡。",
  "edgeCases": [
    "Chunk 过小（如 chunk_size=64）：Prefill 被拆成上百个 chunk，每 chunk 的 kernel 启动/调度/部分 KV 拼接开销占比上升，TTFT 反而变差，甚至吞吐低于不切块。",
    "Chunk 过大（如 chunk_size=8192）：又回到\"长 Prefill 独占 GPU\"的老问题，Decode ITL 出现尖峰、尾延迟抖动，失去切块意义。",
    "与 PD 分离共存：PD 分离把 Prefill/Decode 放到不同节点，Chunked Prefill 主要在同一节点内缓解干扰，二者正交、可叠加；但跨节点还要额外考虑 KV 传输，chunk 策略与传输批大小要协同。",
    "只有 Decode 没有长 Prefill 的负载：此时切块无意义，反而增加调度开销，应关闭或只在检测到长 Prompt 时启用。"
  ],
  "code": "# Python\ndef chunked_prefill(tokens, chunk_size=512):\n    # 把长 prefill 切成 chunk, 由调度器逐迭代与 decode 混合\n    n = len(tokens)\n    chunks = [tokens[i:i+chunk_size] for i in range(0, n, chunk_size)]\n    return chunks  # 每个 chunk 在单独迭代处理, 中间穿插 decode",
  "codeNotes": [
    "真实调度比示例复杂得多：需维护跨迭代的\"部分 KV\"状态、在 chunk 边界重新做调度决策，并和 Decode 请求竞争有限的 batch 槽位与显存。",
    "收益是调度层面的，不是算术层面的——总 FLOPs 不变；因此选 chunk_size 时要在 TTFT、ITL、吞吐三者间实测权衡，没有全局最优值。",
    "示例只展示\"如何切 chunk\"，省略了 KV 拼接、注意力 mask（避免 chunk 间信息泄漏）以及与 Continuous Batching 的集成细节。"
  ],
  "complexity": "Prefill 总 FLOPs = O(n²·d)（n 为 prompt 长度、d 为隐含维度）保持不变；Chunked Prefill 只把其分散到 ceil(n/chunk_size) 个迭代。每迭代算力从 O(n²·d) 降到近似 O(chunk²·d)（causal mask 下），从而 ITL 更平稳。代价是每 chunk 增加固定的调度/kernel 启动开销，且需存储跨迭代的部分 KV。在并发 100、batch=32 的设定下，切块主要改善的是 ITL 的 P99 而非峰值吞吐；若 chunk 过小，调度开销占比上升会反噬 TTFT。",
  "followUps": [
    {
      "question": "Chunk 越小越好吗？",
      "answer": "不是。chunk 过小会把 Prefill 拆太碎，每 chunk 的 kernel 启动、调度决策与部分 KV 拼接开销占比上升，TTFT 反而变差、吞吐下降；同时调度器要在更多迭代里处理同一请求，增加抖动。需要在 TTFT 与 ITL 之间画权衡曲线选一个合适的中间值（常见 512~2048），而不是一味取最小。"
    },
    {
      "question": "为什么小 Chunk 通常利于 ITL 却可能损害 TTFT？",
      "answer": "小 chunk 让 Decode 请求更频繁地得到 GPU 时间（每个 step 都能推进），所以 ITL/TPOT 更平稳、尾延迟更低；但同一个 Prefill 要分更多批才能完成，批次间调度与 KV 拼接 overhead 累积，且首 token 要等第一块算完，于是 TTFT 变长。二者本质是一件事的两面：把算力摊得越细，Decode 越不被饿，但 Prefill 自身完成得越慢。"
    },
    {
      "question": "与 Continuous Batching 什么关系？",
      "answer": "CB 管\"哪些请求在本迭代组批\"（请求级动态调度，请求可随时加入/离开 batch）；Chunked Prefill 管\"单个长 Prefill 如何拆成 chunk 并在多迭代完成\"（请求内拆分）。CB 是前提，Chunked Prefill 在其之上运行，二者互补而非替代——没有 CB，chunk 也无法与 Decode 混跑。"
    },
    {
      "question": "与 PD 分离有什么区别？",
      "answer": "PD 分离把 Prefill 和 Decode 放到不同 GPU 池/节点，从物理上隔离两类阶段、解耦 TTFT 与 ITL；Chunked Prefill 是在同一池内通过拆分缓解干扰。二者正交、可叠加：PD 分离负责节点级隔离，Chunked Prefill 负责节点内更细的调度均衡，经常一起使用。"
    }
  ],
  "followUpAnswers": [
    "不是。chunk 过小会把 Prefill 拆太碎，每 chunk 的 kernel 启动、调度决策与部分 KV 拼接开销占比上升，TTFT 反而变差、吞吐下降；同时调度器要在更多迭代里处理同一请求，增加抖动。需要在 TTFT 与 ITL 之间画权衡曲线选一个合适的中间值（常见 512~2048），而不是一味取最小。",
    "小 chunk 让 Decode 请求更频繁地得到 GPU 时间（每个 step 都能推进），所以 ITL/TPOT 更平稳、尾延迟更低；但同一个 Prefill 要分更多批才能完成，批次间调度与 KV 拼接 overhead 累积，且首 token 要等第一块算完，于是 TTFT 变长。二者本质是一件事的两面：把算力摊得越细，Decode 越不被饿，但 Prefill 自身完成得越慢。",
    "CB 管\"哪些请求在本迭代组批\"（请求级动态调度，请求可随时加入/离开 batch）；Chunked Prefill 管\"单个长 Prefill 如何拆成 chunk 并在多迭代完成\"（请求内拆分）。CB 是前提，Chunked Prefill 在其之上运行，二者互补而非替代——没有 CB，chunk 也无法与 Decode 混跑。",
    "PD 分离把 Prefill 和 Decode 放到不同 GPU 池/节点，从物理上隔离两类阶段、解耦 TTFT 与 ITL；Chunked Prefill 是在同一池内通过拆分缓解干扰。二者正交、可叠加：PD 分离负责节点级隔离，Chunked Prefill 负责节点内更细的调度均衡，经常一起使用。"
  ],
  "pitfalls": [
    "以为 Chunked Prefill 减少了总计算量（错：它只改变计算发生的时机与所在迭代，总 FLOPs 不变，收益来自更均衡调度）。",
    "把 Chunked Prefill 和 Continuous Batching 混为一谈（CB 管\"哪些请求在本迭代组批\"，Chunked Prefill 管\"单个长 Prefill 如何拆分\"，二者层级不同、互补不替代）。",
    "盲目选最小 chunk 追求 ITL，反而抬高 TTFT 与调度开销；不按负载画权衡曲线就定 chunk_size。"
  ],
  "beginnerSummary": "生成式模型处理一个超长问题（比如几千字）时，第一步\"读题\"（Prefill）非常吃算力，会一口气占满显卡，导致正在一个字一个字吐答案的其他请求被卡住，这种现象叫\"饿死 Decode\"。Chunked Prefill 的做法是：把这道长题切成好几小段，每处理一小段就腾出时间让别的请求也走一步。这样大家都不用久等，整体更顺。可以类比：原本是\"一个人霸着讲台念完整本书才让别人说话\"，改成\"每人每次只念一页，轮流转\"，互动就流畅了。代价是：那道长题本身要分好几批才能读完，首字延迟（TTFT）可能略增，且每切一次都有一点调度开销——并非越小越好。",
  "prerequisites": [
    "Prefill 是算力密集（对 prompt 全序列做注意力），Decode 是带宽密集（每步只读 1 token、但要搬全部权重/KV），二者瓶颈不同。",
    "Continuous Batching 让请求能在一个 batch 内动态进出，是 Chunked Prefill 能\"把 chunk 与 Decode 混跑\"的前提。",
    "长 Prefill 会在单个调度步占满 GPU，从而拉高同批 Decode 的 ITL——这是引入切块的直接动机。",
    "了解 KV Cache 的存储方式，因为切块需要跨迭代维护与拼接\"部分 KV\"。"
  ],
  "workedExample": [
    "场景 A（8k Prefill、chunk=512）：长 Prefill 被切成 16 个 chunk，分 16 个迭代完成；每个迭代之间可插入 Decode 步进。对比\"不切块\"：原本一次占满 GPU 约 300ms 使 100 个并发 Decode 全部排队，切块后每个 step 最多算 512 token 的 Prefill，Decode 几乎每个 step 都推进，p99 ITL 从 ~300ms 降到 ~45ms。",
    "场景 B（chunk 从 512 降到 64）：ITL 更稳，但因 Prefill 被拆成 128 个 chunk，kernel 启动与调度开销累积，TTFT 从 320ms 升到 410ms，吞吐下降约 8%——说明并非越小越好。",
    "场景 C（与 PD 分离叠加）：在 PD 分离架构下，Prefill 节点内部仍用 chunk=1024 切块，使该节点 TTFT 更稳，Decode 节点专注自回归，整体 ITL p99 进一步优化。"
  ],
  "lineByLine": [
    "把长 Prefill 请求按固定 chunk_size（如 512）切成若干 chunk，每个 chunk 是一个可独立做注意力的子序列。",
    "每个调度迭代（step）只处理其中一个 chunk：计算该 chunk 的注意力并写入\"部分 KV\"，然后跨迭代拼接成完整 KV Cache。",
    "该 step 剩余的计算与显存资源让给 Decode 请求，使 Decode 能在本 step 也推进一两个 token，从而压平 ITL 尖峰。",
    "总 FLOPs 不变，只是被摊到 ceil(n/chunk_size) 个迭代；chunk 越小分摊越细、ITL 越稳，但调度开销与 TTFT 上升。",
    "实际调度器需在 chunk 边界重新决策：决定下一个处理哪个 chunk、哪些 Decode 进 batch，按排队与优先级平衡 TTFT 与 ITL。"
  ],
  "diagram": "Chunked Prefill:\n长 Prefill --切分--> [chunk1][chunk2]...[chunkK]\n   每个迭代处理 1 chunk\n   迭代间隙插入 Decode 请求\n   => Decode 的 ITL 不被长 Prefill 独占拖垮"
};
