export default {
  "id": "stream-ttft-optimize",
  "kind": "concept",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "首字延迟 TTFT 工程优化",
  "prompt": "首字延迟(TTFT, Time To First Token)在流式对话服务里为什么重要，工程上有哪些可落地的优化手段？",
  "quickAnswer": "TTFT 是用户从发请求到看到第一个生成 token 的等待，主要由 prefill 阶段(一次性处理整段输入并建 KV)决定，而非逐 token 的 decode。工程优化集中在：prefix cache 复用系统提示词等公共前缀跳过重复 prefill、请求优先级与队列管理避免长尾、分块 prefill 与 decode 交错减少阻塞、以及对常用前缀做 KV 预热。代价是缓存显存与失效管理、调度复杂度，目标常把 P90 压到数百毫秒。",
  "approach": "核心思路是“把 prefill 做得更短、更不被阻塞”：用缓存把可复用的前缀计算提前/复用掉，用调度让宝贵算力优先给能快速出首字的请求，用分块把长 prefill 拆开避免拖垮整批。把 TTFT 从“一次重 prefill”变成“查缓存 + 一小段计算”。",
  "explanationFocus": "是什么：TTFT(Time To First Token)指用户提交请求到服务端返回第一个生成 token 所经历的时间，主要由“prefill(处理整段输入并算 KV 缓存)”阶段决定，而非 decode 阶段。它衡量“用户等多久才开始看到回应”，对对话/搜索类交互体验影响极大；优化重点是压缩 prefill 耗时、减少排队与调度开销、提升缓存命中。",
  "bruteForce": "最朴素部署：来一个请求就单独做一次完整 prefill 再开始 decode，所有请求 FIFO 排队、无缓存无优先级。长 prompt 一来就占满 GPU 数十秒，后面请求 TTFT 直接叠加排队，体验极差。",
  "invariant": "不变量：被复用的 prefix cache 所对应的 KV 必须与该前缀在目标模型当前权重/参数下独立计算得到的 KV 逐层逐位数值一致(或误差可忽略)，否则复用会污染后续生成、改变输出分布。即“缓存命中 ≡ 重新计算”这一等价性必须成立。",
  "walkthrough": "假设模型 prefill 速度为每 1k token 约 40ms。场景 A：无缓存，system prompt 200 token + 用户输入 800 token = 1000 token prefill，约 40ms 算力，但队列前还有 3 个各 2k token 请求，排队 240ms，TTFT≈280ms。场景 B：开启 prefix cache，system prompt 200 token 的 KV 已预热命中，prefill 只剩 800 token≈32ms 且因无排队(优先级+分块)，TTFT≈从 280ms 降到 60ms，约 4.6× 改进。可见命中公共前缀 + 调度对 TTFT 影响巨大。",
  "code": "def get_kv_with_cache(model, prefix_ids, cache):\n    key = hash(prefix_ids)                 # 前缀哈希\n    if key in cache:\n        return cache[key], True            # 命中：直接复用 KV\n    kv = model.prefill(prefix_ids)         # 未命中：计算\n    cache[key] = kv\n    return kv, False\n\ndef schedule(requests):\n    # 优先级：短输入/高优优先，限制 prefill 批大小\n    requests.sort(key=lambda r: (r.priority, len(r.prompt)))\n    return chunked_prefill(requests, max_prefill_tokens=2048)",
  "complexity": "时间：prefix cache 命中把 O(输入长度) 的 prefill 降到 O(未命中部分)，理想接近 O(新增 token)；分块 prefill 不减少总算力但平滑排队延迟。空间：prefix cache 常驻显存与命中前缀长度成正比，需设容量上限与 LRU 淘汰。调度为 O(N log N) 每批。",
  "beginnerSummary": "TTFT 就像你问问题后，对方“愣神多久才开始开口”。对方开口前其实在脑子里快速过一遍你写的整段话(这叫 prefill)，这段话越长他愣得越久。工程上就像：把常用的“开场白”提前背好(缓存)，让简短急迫的问题插队先答(优先级)，或者边听边想别卡住别人(分块)。目的是让他尽快“嗯”一声开始回应。",
  "diagram": "请求 ─► [队列] ─► prefill(全输入) ─► 首 token\n             │\n   优化: prefix cache 命中 ──跳过重复 prefill\n        分块 prefill ──与 decode 交错\n        优先级 ──短/高优插队",
  "derivation": [
    "为什么需要: 流式体验里用户最先感知的就是“多久出第一个字”。即便后续 decode 很快，若 TTFT 高达数秒，用户会以为卡死而流失。TTFT 与输入长度强相关(prefill 是 O(输入长度) 的一次前向)，长 prompt、并发排队、冷启动都会把它拉高，因此必须单独作为 SLO 优化。",
    "怎么实现: 工程手段包括：① 请求调度优先级与队列管理，短 prompt/高优请求插队、限制最大并发 prefill 批大小以防长尾；② prefix cache(KV 缓存复用系统提示词/历史前缀)，命中后跳过重复 prefill；③ 预计算/预热常用前缀(如 system prompt)的 KV；④ 分块 prefill(chunked prefill)把长输入拆批与 decode 交错，避免一次 prefill 阻塞其他请求；⑤ 模型层面用更短上下文或量化降低单步 prefill 算力。",
    "有什么代价: prefix cache 需额外显存常驻 KV，且要处理前缀哈希与失效(上下文变化即失效)；分块 prefill 增加调度复杂度，并与正在进行的 decode 争抢算力，若配比不当会抬升其他请求延迟；优先级调度可能饿死长请求。量化/蒸馏换来 TTFT 下降但可能损质量。",
    "怎么评测: 直接测 P50/P90/P99 的 TTFT(从请求进入到首个 token 离开服务端)，按输入长度分桶看随长度增长曲线；监控 prefix cache 命中率、prefill 队列等待时长、GPU 利用率。目标通常是 P90 TTFT 在数百毫秒级(取决于模型与硬件)。"
  ],
  "edgeCases": [
    "前缀部分变化(如用户历史只改了最后一句)：哈希不同导致整段失效，命中率骤降，需用“最长公共前缀”细粒度缓存而非整段哈希。",
    "权重热更新/量化切换：旧 KV 缓存立即全部失效，需清理避免复用错误 KV。",
    "超长输入超过显存：prefill 阶段 OOM，需截断或分层 offload，否则 TTFT 直接失败。",
    "并发突发：优先级调度可能饿死低优长请求，需设公平权重上限。"
  ],
  "pitfalls": [
    "把 TTFT 和 TPOT(每 token 延迟)混为一谈——TTFT 看首字、由 prefill 主导，优化手段不同，不能只压 decode。",
    "prefix cache 未处理失效(权重/前缀变化)就复用，导致生成内容基于错误 KV、分布漂移甚至乱答。",
    "分块 prefill 配比不当，prefill 块太大仍阻塞 decode、太小增加调度开销,需实测调参。",
    "只优化均值忽略 P99，长尾请求 TTFT 爆炸仍会触发用户流失。"
  ],
  "prerequisites": [
    "Transformer prefill 与 decode 两阶段的区别",
    "KV 缓存(Key/Value cache)的作用与生命周期",
    "请求调度与队列/优先级基本概念"
  ],
  "workedExample": [
    "场景：客服机器人每个会话都带 1500 token 的固定知识库 system prompt。无缓存时每轮都要重算这 1500 token 的 KV，TTFT≈60ms 纯算力仍叠加队列。开启 prefix cache 后首轮算一次常驻，后续每轮省掉 1500 token prefill，TTFT 从 ~300ms(含排队)降到 ~80ms，且并发 50 路时 GPU 显存多占约 50×1500×layers×2×hidden×2bytes，需控容量。",
    "场景：突发涌入 100 个长 4k token 请求，FIFO 下第 100 个 TTFT 可达 100×160ms=16s。引入分块 prefill(max 2k/步)并与 decode 交错 + 优先级，最长 TTFT 降到 ~2s 量级，长尾大幅收敛。"
  ],
  "lineByLine": [
    "def get_kv_with_cache: key = hash(prefix_ids) 用输入前缀算哈希作为缓存键，前提是该前缀确定唯一对应一段 KV。",
    "if key in cache: return cache[key], True 命中则直接返回已算好的 KV，跳过 prefill——这是 TTFT 下降的主来源。",
    "kv = model.prefill(prefix_ids) 未命中才做完整 prefill 计算并写入缓存。",
    "def schedule: requests.sort(key=(priority, len(prompt)) 按优先级与输入长度排序，短/高优先跑，缩短其 TTFT 同时避免长请求长期占队。",
    "chunked_prefill(..., max_prefill_tokens=2048) 把长 prefill 拆成 ≤2048 token 的块与 decode 交错，防止单请求阻塞整批。"
  ],
  "codeNotes": [
    "前缀哈希必须覆盖会改 KV 的所有因素(权重版本、精度、前缀内容)，否则缓存污染；",
    "缓存命中省的是 prefill 算力，对 decode 阶段无直接影响；",
    "分块 prefill 要与 decode 争抢算力，max_prefill_tokens 是平衡 TTFT 与他人 decode 延迟的旋钮。"
  ],
  "followUps": [
    {
      "question": "TTFT 和 TPOT(Time Per Output Token)分别该用什么指标监控？",
      "answer": "TTFT 关注“首字前”体验，用 P50/P90/P99 从请求进入到首个 token 的延迟，按输入长度分桶；TPOT 关注“生成流畅度”，用生成阶段相邻 token 间隔的均值与 P99。两者 SLO 不同：对话类 TTFT 通常要求数百毫秒内，TPOT 要求 <50ms 级别保证不卡顿。监控要分开设告警。"
    },
    {
      "question": "prefix cache 命中率上不去怎么办？",
      "answer": "先确认前缀是否真的公共：把 system prompt、few-shot、固定知识库放到最前面形成稳定最长公共前缀；用细粒度“前缀树”缓存而非整段哈希以容忍尾部变化；检查是否因权重/精度频繁变动导致整池失效。若业务前缀高度个性化(如每人不同历史)，命中率天然低，应考虑其他手段(分块 prefill、量化)。"
    },
    {
      "question": "分块 prefill 会不会拖慢正在进行的 decode？",
      "answer": "会，因为同一批算力既要算 prefill 块又要算 decode step，存在竞争。缓解靠限制每步 prefill token 数(max_prefill_tokens)、给 decode 预留算力配额、以及在调度上让 prefill 与 decode 分批错峰。配比不当确实会抬升 TPOT，所以要在 TTFT 与 TPOT 之间权衡调参。"
    }
  ],
  "followUpAnswers": [
    "TTFT 关注“首字前”体验，用 P50/P90/P99 从请求进入到首个 token 的延迟，按输入长度分桶；TPOT 关注“生成流畅度”，用生成阶段相邻 token 间隔的均值与 P99。两者 SLO 不同：对话类 TTFT 通常要求数百毫秒内，TPOT 要求 <50ms 级别保证不卡顿。监控要分开设告警。",
    "先确认前缀是否真的公共：把 system prompt、few-shot、固定知识库放到最前面形成稳定最长公共前缀；用细粒度“前缀树”缓存而非整段哈希以容忍尾部变化；检查是否因权重/精度频繁变动导致整池失效。若业务前缀高度个性化(如每人不同历史)，命中率天然低，应考虑其他手段(分块 prefill、量化)。",
    "会，因为同一批算力既要算 prefill 块又要算 decode step，存在竞争。缓解靠限制每步 prefill token 数(max_prefill_tokens)、给 decode 预留算力配额、以及在调度上让 prefill 与 decode 分批错峰。配比不当确实会抬升 TPOT，所以要在 TTFT 与 TPOT 之间权衡调参。"
  ]
};
