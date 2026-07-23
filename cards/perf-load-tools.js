export default {
  "kind": "concept",
  "id": "perf-load-tools",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "常用负载测试工具（locust / 自写 benchmark）",
  "prompt": "做 LLM 服务压测时，locust 这类通用工具和自写 benchmark 脚本各有什么取舍？",
  "quickAnswer": "通用工具(locust/k6/wrk)易上手、可分布式、带Web报告，但难精确控制流式逐 token 计时；自写 benchmark(基于 async httpx/gRPC)能精确埋点 TTFT/TPOT、构造真实对话分布。实践常以自写脚本为主、locust 做分布式流量。",
  "approach": "按需求选：要快速分布式加压用 locust；要精确 token 级指标与真实分布用自写 async 脚本。",
  "explanationFocus": "是什么：负载测试工具分通用压测框架(易扩展但粗粒度)与自写脚本(精确但需维护)，用于向服务施加可控负载并采集指标。",
  "bruteForce": "用 curl 手点：无法控制并发与统计，不可复现也不可扩展。",
  "derivation": [
    "为什么需要：人工或单请求无法模拟并发与长时运行，需要可重复、可量化的加压手段。",
    "怎么实现：locust 用 Python 写 user 行为分布式发压；自写脚本用 asyncio+httpx 流式读取 SSE 逐 token 计时。",
    "有什么代价：locust 默认按请求粒度，需自定义才能测流式 token 间隔；自写脚本要自己处理错误/重试/统计。",
    "怎么评测：用同一脚本固定 seed 与并发，多次运行取稳定分位数。"
  ],
  "invariant": "加压结果可复现：相同配置(并发/输入/输出/seed)多次跑指标应一致。",
  "walkthrough": "locust 起 200 并发 user 循环发问；自写脚本统计 1 万次请求 TTFT p95=350ms、TPS=120。",
  "edgeCases": [
    "流式 SSE 在 locust 中需解析 event。",
    "客户端机器自身成瓶颈，误判服务端。",
    "重试风暴放大真实负载。"
  ],
  "code": "# Python (async 自写草图)\nasync def one_req(client, prompt):\n    t0 = time.time(); first = None; n = 0\n    async for chunk in client.stream(prompt):\n        if first is None: first = time.time() - t0\n        n += 1\n    return first, n, time.time() - t0",
  "codeNotes": [
    "客户端机器要够强，避免自己成瓶颈。",
    "流式需解析 SSE/分块逐 token。"
  ],
  "complexity": "O(并发×请求数) 客户端并发。",
  "followUps": [
    {
      "question": "为什么不直接用 ab/wrk？",
      "answer": "它们面向短 HTTP 请求，难表达流式逐 token 与多轮对话状态，token 级指标测不了。"
    },
    {
      "question": "分布式压测要注意什么？",
      "answer": "统一时钟/打点、聚合多 worker 结果、确保总加压量等于目标而非每 worker 量。"
    }
  ],
  "followUpAnswers": [
    "ab/wrk 测不了流式 token 级指标。",
    "分布式需聚合与防重复计数。"
  ],
  "pitfalls": [
    "客户端成瓶颈导致数据失真。",
    "locust 默认粒度粗，漏测 TTFT。"
  ],
  "beginnerSummary": "测水管：通用工具像一群人同时开水龙头看总流量(locust)，方便但只看总量；自写脚本像在每个水龙头装水表，能精确看到\"第一滴水多久来、之后每滴间隔\"。两者配合最好。",
  "prerequisites": [
    "并发与异步 IO。",
    "流式 SSE 响应格式。",
    "统计分位数。"
  ],
  "workedExample": [
    "locust 200 并发发问做分布式流量。",
    "自写 async 脚本逐 token 测 TTFT/TPOT。"
  ],
  "lineByLine": [
    "选工具(通用 or 自写)。",
    "定义 user 行为与负载分布。",
    "发压并流式埋点。",
    "聚合分位数输出报告。"
  ],
  "diagram": "locust(分布式流量)\n    │\n    ├──▶ 服务端\n    │\n自写脚本(精确 token 埋点)"
};
