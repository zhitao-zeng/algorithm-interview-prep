export default {
  "id": "agent-code-tool-router",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "手写 tool 路由 + 带重试的 function caller",
  "prompt": "如何手写一个 tool 路由器把用户问题匹配到最合适的工具，并实现一个带超时与重试、失败可降级的 function caller？",
  "quickAnswer": "路由阶段用关键词/描述重叠为候选工具打分，选出分数最高的工具；调用阶段用\"重试 + 超时 + 降级\"三件套保证健壮性：多次尝试、单次超时中断、全部失败返回一个兜底字符串而不是抛异常。",
  "explanationFocus": "是什么：tool 路由负责\"选哪个工具\"，function caller 负责\"安全地调这个工具\"。两者共同把自然语言意图映射到可执行函数，并在网络/计算不稳定时通过重试和超时保护 Agent 不崩。",
  "approach": "核心思路：select_tool 把 query 与每个工具的 keywords/description 做词重叠打分，取最高分；call_with_retry 在 retries+1 次尝试内用信号/线程实现超时，成功即返回，全部失败返回 FALLBACK 兜底串，便于上层继续推理。",
  "bruteForce": "朴素做法：硬编码 if \"天气\" in query: call_weather()，工具一多就维护爆炸；或只调一次不重试，遇到瞬时网络抖动就直接让整个 Agent 崩溃。",
  "invariant": "循环不变量：call_with_retry 要么返回工具的真实结果，要么在耗尽 retries 次后返回以 \"FALLBACK:\" 开头的降级字符串；调用方永远拿到一个可放入 Observation 的值，不会向上抛异常。",
  "walkthrough": "假设工具集含 get_weather/calc，query=\"北京温度\"。select_tool 给 get_weather 命中关键词\"温度\"得 1 分、calc 0 分，选 get_weather。call_with_retry 第1次超时（5s），第2次成功返回 \"25℃\"，仅用 2 次尝试即返回结果。",
  "code": "import signal\n\ndef select_tool(query, tools):\n    # tools: list[dict]，每项含 name/description/keywords\n    best, best_score = None, -1.0\n    q = query.lower()\n    for t in tools:  # 遍历候选工具打分\n        score = sum(1 for k in t.get(\"keywords\", []) if k in q)\n        score += sum(0.5 for w in q.split() if w in t.get(\"description\", \"\").lower())\n        if score > best_score:  # 贪心取最高分\n            best, best_score = t, score\n    return best  # 返回分数最高的工具描述\n\nclass TimeoutError(Exception):\n    pass\n\ndef call_with_retry(tool, args, retries=3, timeout=5):\n    last_err = None\n    for attempt in range(retries + 1):  # 含首次共 retries+1 次\n        try:\n            return _run_with_timeout(tool, args, timeout)  # 成功即返回\n        except Exception as e:\n            last_err = e  # 记录错误，准备退避重试\n    return f\"FALLBACK: tool failed after {retries} retries: {last_err}\"\n\ndef _run_with_timeout(fn, args, timeout):\n    def _handler(signum, frame):\n        raise TimeoutError(\"tool timed out\")\n    old = signal.signal(signal.SIGALRM, _handler)  # 注册超时信号\n    signal.alarm(timeout)  # 启动倒计时\n    try:\n        return fn(**args)  # 执行工具\n    finally:\n        signal.alarm(0)  # 关闭闹钟\n        signal.signal(signal.SIGALRM, old)  # 还原原 handler",
  "complexity": "时间复杂度：select_tool 为 O(T×L)（T 工具数、L 文本长度）；call_with_retry 最坏 O((retries+1) × timeout) 当每次都超时。空间复杂度：O(T) 存工具描述，额外信号状态为常数。",
  "beginnerSummary": "给用户的问题找\"最合适的工具\"就像给任务挑\"最对口的人\"：看关键词谁最匹配就派谁。真正去办事时，这个人可能卡住（超时）或出错，所以我们规定\"最多试几次、每次最多等几秒，全失败了就回一句\"这活没干成\"而不是让整个系统瘫痪。",
  "diagram": "query \"北京温度\"\n      |\n      v\n[select_tool 打分]\n  get_weather(1)  calc(0)\n      |\n      v 选最高分\n[call_with_retry]\n  try1 --timeout--> try2 --ok--> return result\n                        |\n                    全失败 --> \"FALLBACK: ...\"",
  "derivation": [
    "为什么需要：Agent 往往有几十个工具，靠关键词 if-else 不可维护；且外部工具会超时、抖动、偶发报错，直接调用会让整个链路雪崩。",
    "怎么实现：路由用轻量词重叠打分（也可换 embedding 相似度）；调用用\"retries 次循环 + 单次超时 + 异常转降级串\"保证每次调用都有确定返回值。",
    "有什么代价：重试会放大延迟（最坏 retries×timeout），信号超时仅在主线程有效，多线程需换成线程池/asyncio.wait_for；打分是启发式，可能选错工具。",
    "怎么评测：路由用 top-1 准确率与召回，调用用成功率/平均重试次数/降级率，压测下观察 P99 延迟与降级占比是否在可接受区间。"
  ],
  "edgeCases": [
    "所有工具打分都为 0（query 与描述无重叠）：select_tool 返回带负分的 best（首个工具），上层需有\"无合适工具\"的兜底分支。",
    "工具每次都超时：call_with_retry 耗尽 retries 次后返回 FALLBACK 串，Agent 应把这个观察反馈给 LLM 让其换工具。",
    "tool 参数 kwargs 不合法触发 TypeError：被 except 捕获计入重试，仍失败则降级，不会穿透到 Agent 主循环。"
  ],
  "pitfalls": [
    "signal.alarm 只在主线程有效，放到多线程/异步环境会失效，应改用 threading.Timer 或 asyncio.wait_for。",
    "重试不设退避（如指数退避）且对\"参数错误\"也重试，会浪费 attempts 且永远失败；应区分可重试（超时/5xx）与不可重试（4xx/类型错）。",
    "忘记把异常转成可返回字符串，导致 caller 向上抛，破坏 Agent 循环的稳定性。"
  ],
  "prerequisites": [
    "了解函数一等公民与 dict/list 的基本操作。",
    "理解异常捕获（try/except）与超时（信号或线程）的基础机制。"
  ],
  "workedExample": [
    "tools=[{\"name\":\"get_weather\",\"keywords\":[\"温度\",\"天气\"],\"description\":\"查城市气温\"},{\"name\":\"calc\",\"keywords\":[\"算\"],\"description\":\"计算器\"}]；query=\"北京温度\"。select_tool 给 get_weather 命中\"温度\"得 1 分，返回该工具。",
    "call_with_retry(get_weather, {\"city\":\"北京\"}, retries=3, timeout=5)：第1次模拟超时抛 TimeoutError，第2次返回 \"25℃\"。最终返回 \"25℃\"，仅消耗 2 次尝试。"
  ],
  "lineByLine": [
    "import signal：引入信号模块，用于实现单线程超时（SIGALRM 闹钟）。",
    "def select_tool(query, tools)：遍历工具列表，对 query 与每个工具的 keywords/description 做词重叠打分。",
    "best, best_score = None, -1.0 与 if score > best_score：贪心保留当前最高分工具，初始化 -1 保证至少选一个。",
    "def call_with_retry(tool, args, retries=3, timeout=5)：入口签名，默认重试3次、单次超时5秒。",
    "for attempt in range(retries + 1)：循环 retries+1 次（首次 + 数次重试），成功即 return 退出。",
    "return _run_with_timeout(tool, args, timeout)：真正执行，超时/异常被外层 except 捕获。",
    "last_err = e：记录最后一次错误，供耗尽后拼进 FALLBACK 信息，便于排查。",
    "return f\"FALLBACK: ...\"：全部失败的统一降级返回值，保证调用方永不拿不到结果。",
    "_run_with_timeout 内 signal.alarm(timeout) 与 finally 中 signal.alarm(0)：启动/关闭闹钟，finally 还原原 handler 避免污染后续代码。"
  ],
  "codeNotes": [
    "生产可把 select_tool 换成 embedding 余弦相似度或让 LLM 做路由（router model），精度更高但更慢更贵。"
  ],
  "followUps": [
    {
      "question": "信号超时在多线程/异步里为什么不行，该怎么改？",
      "answer": "signal.alarm 只在主线程有效。多线程可用 concurrent.futures.ThreadPoolExecutor 提交任务并对 future 设 timeout；异步环境用 asyncio.wait_for(coro, timeout=5) 即可实现等效超时。"
    },
    {
      "question": "重试时应该如何区分\"该重试\"和\"不该重试\"的错误？",
      "answer": "对超时、网络抖动、5xx 等瞬时错误做指数退避重试；对参数类型错误、权限错误、4xx 等确定性错误应立即失败并降级，避免无谓消耗 attempts 与延迟。"
    }
  ],
  "followUpAnswers": [
    "signal.alarm 只在主线程有效。多线程可用 concurrent.futures.ThreadPoolExecutor 提交任务并对 future 设 timeout；异步环境用 asyncio.wait_for(coro, timeout=5) 即可实现等效超时。",
    "对超时、网络抖动、5xx 等瞬时错误做指数退避重试；对参数类型错误、权限错误、4xx 等确定性错误应立即失败并降级，避免无谓消耗 attempts 与延迟。"
  ]
};
