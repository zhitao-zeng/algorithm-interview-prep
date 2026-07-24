export default {
  "id": "stream-backpressure-cancel",
  "kind": "concept",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "流式输出背压与取消",
  "prompt": "流式生成服务里，客户端中途断开(取消请求)或消费速度跟不上时，服务端如何处理 partial token、避免资源泄漏与背压堆积？",
  "quickAnswer": "流式生成中客户端断开或消费慢时，服务端必须在发送循环里感知 socket 关闭/取消信号，立即中断生成并释放 KV 与连接资源，否则会白烧算力且泄漏显存/连接。对消费慢用背压：写缓冲超阈值就暂停生成等 drain，防止内存堆积。关键工程点是让取消信号贯穿到推理内核支持可中断、并在断开后确定性清理。",
  "approach": "核心思路是“生成循环可中断 + 资源确定性回收”：把 cancel/backpressure 作为一等信号贯穿请求生命周期，每吐一个 token 前先问“还该继续吗”,不该继续就 break 并走统一的 cleanup(释放 KV、移出批、关连接)。背压则反向控制生成速度,使服务端不快于下游。",
  "explanationFocus": "是什么：流式输出背压与取消，指当服务端以 SSE/流式方式持续吐 token 时，下游(客户端/代理)消费慢或提前断开，服务端必须感知并停止无谓生成、释放 KV 与连接资源，防止“服务端还在拼命生成、客户端早已走人”造成的算力浪费与连接/显存泄漏。背压是上下游速率不匹配时的反压信号，取消是客户端显式 disconnect 事件。",
  "bruteForce": "最朴素实现：开一个 while 生成循环，每步 write(token) 不管客户端死活，跑完才结束。客户端断开后 write 抛 EPIPE 被吞掉或崩溃，GPU 仍跑完整序列，KV 占着不释放,连接挂起——典型资源泄漏与算力浪费。",
  "invariant": "不变量：任意时刻若检测到取消/不可写，生成循环必在有限步内退出且此前已发出的 partial token 要么被标记为不完整、要么在 cleanup 中丢弃，绝不能出现“已向客户端声明完成却仍在后台生成”或“KV 已释放但生成还在写”的矛盾状态。",
  "walkthrough": "假设服务端以 40ms/token 生成，客户端在第 10 个 token 后断开。朴素实现：服务端继续生成到第 N 个(如 200)，白做 190×40ms≈7.6s GPU 与占 KV。正确实现：第 11 次循环 write 前检测 res.writableEnded/close 事件已触发 → break，立即 free KV 槽、从 running batch 移除该序列；总浪费仅 <40ms。背压例子：客户端渲染慢,发送缓冲累计>64KB,服务端 await socket.drain 暂停生成约 200ms 再继续,缓冲不爆,但单请求总时长略增。",
  "code": "async def stream_with_cancel(generate, sink, signal):\n    buf = []\n    for token in generate():                 # 可中断的生成迭代器\n        if signal.cancelled:                 # 客户端取消\n            break\n        buf.append(token)\n        try:\n            await sink.write(token)\n        except ClosedError:                  # socket 已关\n            break\n        if sink.buffer_size > 65536:         # 背压：缓冲超阈值\n            await sink.drain()               # 等下游消费\n    cleanup(signal, buf)                     # 确定性回收 KV/连接\n    return buf",
  "complexity": "时间：每 token 增加 O(1) 的取消/背压检查，几乎无开销；中断使剩余生成提前停止,省下 O(剩余 token) 算力。空间：背压把发送缓冲限制在阈值内(如 64KB),否则会随生成无限增长。资源上每请求占用的 KV 在取消后 O(1) 释放,防止泄漏。",
  "beginnerSummary": "就像打印店老板不停地打印你已不想要的文件，你走人了他还打，纸墨白费。正确做法是：你一走(取消)老板立刻停手并把机器让给别人；你若看得慢(背压)，老板就先暂停打印等你消化，不让纸堆满屋。关键是“随时能喊停”和“停了就收拾干净”。",
  "diagram": "生成循环 ──► write(token)\n   ▲           │\n   │      socket 关闭? ──是──► break ──► cleanup(KV释放/移出批/关连接)\n   │           │否\n   └──── 背压: 缓冲>阈值 ── await drain ──┘",
  "derivation": [
    "为什么需要: 流式生成是“边算边发”，若客户端断网/点停止，服务端若不知情会继续跑完整个序列，白烧 GPU 与占着 KV 显存，还可能把 token 写向已关闭的 socket 报错。高并发下大量“孤儿生成”会拖垮整体吞吐。同时客户端慢(如前端渲染卡)会导致服务端发送缓冲堆积，需背压让生成节奏跟上下游。",
    "怎么实现: ① 在发送 token 的循环里检测底层 socket 是否可写/是否已关闭(如 Node 的 res.on(“close”)、gRPC cancelled)，一旦断开立即 break 生成循环并触发清理。② 取消信号(AbortSignal / context cancellation)贯穿到模型推理层，让 prefill/decode 步骤可中断。③ 背压：当写缓冲超过阈值(如 64KB)时，await drain 或暂停生成，等可写再继续，避免内存无限增长。④ 清理：释放该请求占用的 KV 缓存槽、从批中移除、关闭定时器。",
    "有什么代价: 取消检测与可中断推理增加代码复杂度，推理内核要支持提前退出(否则最小中断粒度是一个 step)。背压暂停生成会让该请求 TTFT/总时长变长(但省了系统资源)。过早清理若误判(如瞬时网络抖动)会丢弃本可完成的生成，需要去抖/重试策略。",
    "怎么评测: 评测“孤儿生成率”(客户端取消后服务端仍跑完的比例,目标≈0)、取消后资源释放时延(从 disconnect 到 KV 释放的 ms)、发送缓冲峰值内存、以及断流重连后的状态恢复(是否续生成/是否重复)。压测下模拟随机断开看 GPU 利用率是否回落、显存是否泄漏。"
  ],
  "edgeCases": [
    "瞬时网络抖动造成误断：需去抖/短重试,避免把本可完成的生成丢掉。",
    "取消发生在 prefill 阶段：要能中断 prefill 本身(不仅是 decode),否则仍白算整段输入。",
    "背压与取消同时发生：应优先响应取消,避免“还在等 drain 却已断开”的死等。",
    "多路复用连接(如单连接多流)：取消单流不能关整个连接,需按 stream id 清理。"
  ],
  "pitfalls": [
    "生成循环不检查取消,造成孤儿生成与 GPU 浪费,这是最常见的资源泄漏源。",
    "清理不彻底:只关连接却没释放 KV 槽,显存随时间泄漏最终 OOM。",
    "背压缺失导致发送缓冲无限增长,弱网下内存爆炸。",
    "cleanup 非幂等,重连/重试时 double-free 或重复释放引发崩溃。"
  ],
  "prerequisites": [
    "流式 HTTP(SSE)/gRPC 的客户端断开与取消语义",
    "异步 I/O 中背压(backpressure)与 drain 机制",
    "推理服务中 KV 缓存槽的分配与释放"
  ],
  "workedExample": [
    "场景：翻译接口,用户点“停止”。朴素实现继续生成完 300 token,浪费 12s GPU 且 KV 占 12s;正确实现在下一个 token 生成前检测到 AbortSignal,break 并 free KV,浪费 <40ms,GPU 立刻服务他人。监控显示孤儿生成率从 8% 降到 0.1%。",
    "场景：弱网手机客户端,每 token 渲染需 80ms 但生成仅 40ms,发送缓冲持续堆积至数百 KB 触发 OOM 风险。加背压后缓冲>64KB 即 await drain,服务端生成节奏被拉到与客户端 ~80ms 对齐,内存恒定,单请求变慢但系统稳定。"
  ],
  "lineByLine": [
    "async def stream_with_cancel: 用异步函数把生成与发送解耦,支持 await 检测与暂停。",
    "for token in generate(): 生成迭代器每步产一个 token,是可中断点。",
    "if signal.cancelled: break 每步先查取消信号,客户端断开即停,避免白生成。",
    "except ClosedError: break write 抛错说明 socket 已关,同样停止。",
    "if sink.buffer_size > 65536: await sink.drain() 背压:缓冲超阈值暂停,等下游消费再继续,防内存爆。",
    "cleanup(signal, buf) 统一回收 KV 槽、移出批、关连接,保证无泄漏。"
  ],
  "codeNotes": [
    "取消检查粒度=生成步,最小中断单位是一个 token step,无法在单步内更细;",
    "drain 是把背压“反向传导”到生成速度的关键,缺失则缓冲无限涨;",
    "cleanup 必须幂等,防止网络抖动重复触发释放导致 double-free。"
  ],
  "followUps": [
    {
      "question": "取消信号如何真正中断底层 GPU 推理,而不只是停止发送？",
      "answer": "需要在推理内核层面支持可中断:把 cancel flag 作为参数传入 prefill/decode step,在每层或每 step 开头检查;若用批推理,则把该序列从 running batch 中移除并释放其 KV 槽,后续 step 不再为其计算。纯靠“停止 write”只省了带宽,算力仍烧,必须贯穿到 batch 调度层。"
    },
    {
      "question": "断流后客户端重连,服务端应该续生成还是重来？",
      "answer": "取决于是否保留状态。若服务端在取消时已释放 KV 且未持久化前缀,重连只能重做 prefill 从头生成(可借 prefix cache 加速)。若业务要求续传,需把已生成前缀与 KV 暂存一段时间(带 TTL),重连后复用并继续 decode,但要处理“客户端已收到部分 token”的重复发送去重。"
    },
    {
      "question": "背压会不会反而让 TTFT 变长或吞吐下降？",
      "answer": "背压暂停的是“发送节奏”而非 prefill,所以首字 TTFT 基本不受影响;但单请求总时长会因等待 drain 而变长。系统层面吞吐反而更健康,因为避免了缓冲堆积导致的 OOM 与全局卡死。权衡点是背压阈值:设太小频繁 drain 增加上下文切换,设太大缓冲峰值高。"
    }
  ],
  "followUpAnswers": [
    "需要在推理内核层面支持可中断:把 cancel flag 作为参数传入 prefill/decode step,在每层或每 step 开头检查;若用批推理,则把该序列从 running batch 中移除并释放其 KV 槽,后续 step 不再为其计算。纯靠“停止 write”只省了带宽,算力仍烧,必须贯穿到 batch 调度层。",
    "取决于是否保留状态。若服务端在取消时已释放 KV 且未持久化前缀,重连只能重做 prefill 从头生成(可借 prefix cache 加速)。若业务要求续传,需把已生成前缀与 KV 暂存一段时间(带 TTL),重连后复用并继续 decode,但要处理“客户端已收到部分 token”的重复发送去重。",
    "背压暂停的是“发送节奏”而非 prefill,所以首字 TTFT 基本不受影响;但单请求总时长会因等待 drain 而变长。系统层面吞吐反而更健康,因为避免了缓冲堆积导致的 OOM 与全局卡死。权衡点是背压阈值:设太小频繁 drain 增加上下文切换,设太大缓冲峰值高。"
  ]
};
