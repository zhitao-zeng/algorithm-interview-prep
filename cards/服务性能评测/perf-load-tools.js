export default {
  "kind": "concept",
  "id": "perf-load-tools",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "常用负载测试工具（locust / 自写 benchmark）",
  "prompt": "做 LLM 服务压测时，locust 这类通用工具和自写 benchmark 脚本各有什么取舍？",
  "quickAnswer": "通用工具（locust/k6/wrk）易上手、可分布式、带 Web 报告，但难精确控制流式逐 token 计时；自写 benchmark（基于 async httpx/gRPC）能精确埋点 TTFT/TPOT、构造真实对话分布。实践常以自写脚本为主、locust 做分布式流量，两者按「要精确指标 vs 要快速加压」分工。",
  "approach": "按需求选：要快速分布式加压、看总 QPS 用 locust/k6；要精确 token 级指标（TTFT/TPOT/流式间隔）与真实多轮对话分布，用自写 async 脚本。生产常见组合：locust 发分布式流量探容量上限，自写脚本做精细化指标回归。",
  "explanationFocus": "是什么：负载测试工具分通用压测框架（locust/k6/wrk，易扩展、可分布式、带 Web 报告，但粒度粗）与自写脚本（基于 asyncio+httpx/gRPC，能精确埋点 TTFT/TPOT、构造真实对话分布，但需自己维护）两类。它们用于向 LLM 服务施加可控负载并采集指标，选型取决于要不要 token 级精度与分布式流量。",
  "bruteForce": "用 curl 手点：既无法控制并发量、也无法统计分位数，不可复现、不可扩展，看不到 p95/p99。",
  "derivation": [
    "为什么需要：人工或单请求无法模拟高并发与长时稳定运行，需要可重复、可量化、可对比的加压手段来定位服务的容量与瓶颈。",
    "怎么实现：locust 用 Python 写 user 行为类、可多 worker 分布式发压；自写脚本用 asyncio + httpx 流式读取 SSE，逐 token 记录时间戳算 TTFT/TPOT。",
    "有什么代价：locust 默认按「请求」粒度，需自定义才能测流式 token 间隔，否则漏掉首 token 延迟；自写脚本要自己处理错误、重试、统计聚合，维护成本高。",
    "怎么评测：用同一脚本固定 seed 与并发，多次运行取稳定分位数（p50/p95/p99），并与历史基线 diff 发现回归。"
  ],
  "invariant": "加压结果可复现：相同配置（并发数、输入分布、输出长度、随机 seed）多次运行，关键指标（TTFT p95、TPS）应落在稳定区间。",
  "walkthrough": "用 locust 起 200 并发 user 循环发相同问题，探出服务端在 p99<2s 下的最大 QPS≈800；再用自写 async 脚本对 1 万次真实对话请求逐 token 埋点，统计 TTFT p95=350ms、TPOT 均值 28ms、TPS=120、首字到末字总耗时 p99=4.1s。两者口径不同但互补：locust 看容量、自写看体验。",
  "edgeCases": [
    "流式 SSE 在 locust 中需自己解析 event 流，否则只能拿到整响应耗时，测不到 TTFT。",
    "客户端机器自身成瓶颈（CPU/端口耗尽），会误判服务端能力差，压测机要独立且够强。",
    "重试风暴：网络抖动触发客户端重试，真实负载被放大数倍，指标失真。",
    "长输出请求：输出 2k token 与 200 token 的负载差一个量级，必须按真实输出长度分布发压。"
  ],
  "code": "# Python (async 自写草图)\nasync def one_req(client, prompt):\n    t0 = time.time(); first = None; n = 0\n    async for chunk in client.stream(prompt):\n        if first is None: first = time.time() - t0\n        n += 1\n    return first, n, time.time() - t0",
  "codeNotes": [
    "客户端机器要够强（多核、提高文件描述符上限），避免自己成为瓶颈，最好用独立压测机。",
    "流式需解析 SSE/分块逐 token：记录 first（首块到达）与总耗时，才能算 TTFT 与 TPOT。"
  ],
  "complexity": "客户端并发成本 O(并发数 × 请求数)；自写脚本需维护事件循环与流式解析，复杂度高于 locust 配置，但指标精度高一个量级。",
  "followUps": [
    {
      "question": "为什么不直接用 ab/wrk 这类经典 HTTP 压测工具？",
      "answer": "ab/wrk 面向短平快的 HTTP 请求，难表达流式逐 token 输出与多轮对话状态：它们通常等整响应返回才计时，测不到首 token 延迟（TTFT），也难构造「上一轮回答作为下一轮输入」的多轮会话。LLM 服务最关键的体验指标恰恰是 TTFT 和 TPOT，所以要用能解析 SSE 流的自写脚本或专门适配的工具。"
    },
    {
      "question": "分布式压测要注意什么，怎么保证数字可信？",
      "answer": "统一各 worker 的时钟与打点逻辑，在聚合层合并多 worker 结果并去重计数（避免每 worker 各算一遍导致总量翻倍误会）；确保「总加压量=目标并发」而非「每 worker 并发=目标」；压测机要独立且性能足够，否则测到的是压测机而非服务端的上限。"
    }
  ],
  "followUpAnswers": [
    "ab/wrk 面向短平快的 HTTP 请求，难表达流式逐 token 输出与多轮对话状态：它们通常等整响应返回才计时，测不到首 token 延迟（TTFT），也难构造「上一轮回答作为下一轮输入」的多轮会话。LLM 服务最关键的体验指标恰恰是 TTFT 和 TPOT，所以要用能解析 SSE 流的自写脚本或专门适配的工具。",
    "统一各 worker 的时钟与打点逻辑，在聚合层合并多 worker 结果并去重计数（避免每 worker 各算一遍导致总量翻倍误会）；确保「总加压量=目标并发」而非「每 worker 并发=目标」；压测机要独立且性能足够，否则测到的是压测机而非服务端的上限。"
  ],
  "pitfalls": [
    "客户端成瓶颈导致数据失真：压测机 CPU 跑满或端口耗尽，测出的 QPS 是客户端上限而非服务端。",
    "locust 默认粒度粗漏测 TTFT：不自定义流式解析就看不到首 token 延迟，而 LLM 服务最关键的恰恰是 TTFT。"
  ],
  "beginnerSummary": "测水管：通用工具像一群人同时开水龙头看总流量（locust），方便但只看总量；自写脚本像在每个水龙头装水表，能精确看到「第一滴水多久来（TTFT）、之后每滴间隔（TPOT）」。两者配合最好——locust 看能扛多少水，自写脚本看每一滴体验。",
  "prerequisites": [
    "并发与异步 IO：理解 asyncio/线程池，才能模拟成百上千并发而不被单机串行拖垮。",
    "流式 SSE 响应格式：LLM 输出是 text/event-stream，需会逐块读并解析 data: 帧。",
    "统计分位数：p95/p99 比平均值更能反映长尾用户体验，要会用分位数而非只看均值。"
  ],
  "workedExample": [
    "locust 200 并发循环发问，探出服务在 p99<2s 下最大 QPS≈800，用于容量规划。",
    "自写 async 脚本对 1 万次真实对话逐 token 埋点：TTFT p95=350ms、TPOT 均值 28ms、TPS=120。"
  ],
  "lineByLine": [
    "选工具（通用 or 自写）：按要容量探测还是要 token 级精度分工，或两者组合。",
    "定义 user 行为与负载分布：包括输入长度、输出长度、对话轮数，越接近真实越好。",
    "发压并流式埋点：自写脚本 async for chunk 记录每个 token 时间戳。",
    "聚合分位数输出报告：算 p50/p95/p99 的 TTFT、TPS、错误率，与基线对比。"
  ],
  "diagram": "locust(分布式流量)\n    │\n    ├──▶ 服务端\n    │\n自写脚本(精确 token 埋点)"
};
