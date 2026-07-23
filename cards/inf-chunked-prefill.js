export default {
  "kind": "concept",
  "id": "inf-chunked-prefill",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "什么是 Chunked Prefill？为什么能缓解 Prefill 对 Decode 的干扰？",
  "prompt": "什么是 Chunked Prefill？它为什么能缓解长 Prefill 对 Decode 的干扰？",
  "quickAnswer": "把很长的 Prefill 请求切成多个较小的 token chunk，在调度时与 Decode 请求混合进同一个 batch 逐步处理；这样单个长 Prefill 不会长时间独占 GPU、把 Decode 请求“饿死”。Chunk 大小在 TTFT、ITL 和吞吐之间权衡：小 chunk 通常改善 ITL（Decode 更及时），但可能延长 TTFT（同一请求要分多批完成）。",
  "approach": "Prefill 切块 + 与 Decode 混合调度 + 连续批处理，让长 Prompt 的算力消耗被摊薄到多个迭代里。",
  "explanationFocus": "是什么：长 Prefill 算力密集，会在一个调度步内占满 GPU，使 Decode 请求尾延迟飙升；Chunked Prefill 把长 Prefill 拆块并和 Decode 穿插。",
  "bruteForce": "整个长 Prompt 作为一个 Prefill 批次一次性算完；长 Prompt 期间所有 Decode 请求被阻塞。",
  "derivation": [
    "为什么需要：Prefill 是算力密集、Decode 是带宽密集；一个超长 Prefill 会在一个 step 占满 GPU，拉长同批 Decode 的 ITL。",
    "怎么实现：调度器把长 Prefill 切成固定大小的 chunk（如 512 token），每个迭代只处理一个 chunk，并把剩余算力/显存让给 Decode 请求。",
    "与 Continuous Batching 的关系：CB 负责请求的动态进出，Chunked Prefill 负责单请求内部的拆分，两者互补。",
    "怎么评测：看 TTFT、ITL/TPOT 的 P99、吞吐；小 chunk 通常 ITL 更好但 TTFT 略升。"
  ],
  "invariant": "总计算量不变；Chunked Prefill 只改变“计算在哪些迭代发生”，不减少总 FLOPs，收益来自更均衡的调度。",
  "walkthrough": "一个 8k token 的 Prefill，chunk=512，则分 16 个迭代完成；每个迭代之间可插入若干 Decode 请求的步进，Decode 的 ITL 不再被一次长 Prefill 拖垮。",
  "edgeCases": [
    "Chunk 过小：Prefill 被拆太碎，每 chunk 的 kernel 启动/调度开销占比上升，TTFT 反而变差。",
    "Chunk 过大：又回到“长 Prefill 独占 GPU”的老问题，Decode ITL 抖动。",
    "与 PD 分离共存：PD 分离把 Prefill/Decode 放不同节点，Chunked Prefill 主要在同节点内缓解干扰，二者正交。"
  ],
  "code": "# Python\ndef chunked_prefill(tokens, chunk_size=512):\n    # 把长 prefill 切成 chunk, 由调度器逐迭代与 decode 混合\n    n = len(tokens)\n    chunks = [tokens[i:i+chunk_size] for i in range(0, n, chunk_size)]\n    return chunks  # 每个 chunk 在单独迭代处理, 中间穿插 decode",
  "codeNotes": [
    "真实调度更复杂: 需维护部分 KV、跨迭代拼接、并和 Decode 请求竞争 batch 槽位。",
    "收益是调度层面的, 不是算术层面的——总 FLOPs 不变。"
  ],
  "complexity": "Prefill 总 FLOPs = O(n²·d)（n 为 prompt 长度）不变；Chunked 只把其分散到 ceil(n/chunk) 个迭代，每迭代算力下降、ITL 更平稳。",
  "followUps": [
    {
      "question": "Chunk 越小越好吗？",
      "answer": "不是。过小会增加 kernel 启动与调度开销、拖慢 TTFT；需在 TTFT 与 ITL 间取平衡。"
    },
    {
      "question": "为什么小 Chunk 通常利于 ITL 却可能损害 TTFT？",
      "answer": "小 chunk 让 Decode 请求更频繁得到 GPU 时间（ITL 好），但同一 Prefill 要分更多批完成、首尾间隔变长（TTFT 升）。"
    },
    {
      "question": "与 Continuous Batching 什么关系？",
      "answer": "CB 管“哪些请求在本迭代组批”，Chunked Prefill 管“单个长 Prefill 如何拆分”；CB 是请求级动态调度，Chunked 是请求内拆分，二者互补。"
    },
    {
      "question": "与 PD 分离有什么区别？",
      "answer": "PD 分离把 Prefill 和 Decode 放到不同 GPU 池/节点，从物理上隔离；Chunked Prefill 在同池内通过拆分缓解干扰，二者可叠加。"
    }
  ],
  "followUpAnswers": [
    "过小增开销、损 TTFT。",
    "小 chunk 利 ITL、可能损 TTFT。",
    "CB 管请求进出, Chunked 管请求内拆分。",
    "PD 是节点级隔离, Chunked 是同池拆分, 可叠加。"
  ],
  "pitfalls": [
    "以为 Chunked Prefill 减少了总计算（错：只改变发生时机）。",
    "把 Chunked Prefill 和 Continuous Batching 混为一谈。",
    "盲目选最小 chunk，反而抬高 TTFT 与调度开销。"
  ],
  "beginnerSummary": "生成式模型处理一个超长问题（比如几千字）时，第一步“读题”（Prefill）非常吃算力，会一口气占满显卡，导致正在一个字一个字吐答案的其他请求被卡住。Chunked Prefill 的做法是：把这道长题切成好几小段，每处理一小段就腾出时间让别的请求也走一步。这样大家都不用久等，整体更顺。代价是：那道长题本身要分好几批才能读完，首字延迟可能略增。",
  "prerequisites": [
    "Prefill 算力密集、Decode 带宽密集。",
    "Continuous Batching 让请求动态进出 batch。",
    "长 Prefill 会在一个调度步占满 GPU。"
  ],
  "workedExample": [
    "8k token Prefill, chunk=512 → 分 16 迭代；每迭代间可插入 Decode 步进。",
    "chunk 从 512 降到 64：ITL 更稳，但 TTFT 因拆太碎而上升。"
  ],
  "lineByLine": [
    "长 Prefill 切成固定大小 chunk。",
    "每个迭代只处理一个 chunk。",
    "剩余算力让给 Decode 请求。",
    "总 FLOPs 不变, 只是更均衡。",
    "chunk 大小权衡 TTFT 与 ITL。"
  ],
  "diagram": "Chunked Prefill:\n长 Prefill --切分--> [chunk1][chunk2]...[chunkK]\n   每个迭代处理 1 chunk\n   迭代间隙插入 Decode 请求\n   => Decode 的 ITL 不被长 Prefill 独占拖垮"
};
