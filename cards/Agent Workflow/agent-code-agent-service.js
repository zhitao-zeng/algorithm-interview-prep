export default {
  "id": "agent-code-agent-service",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "最小可上线 Agent 服务骨架",
  "prompt": "如何手写一个最小可上线的 Agent 服务骨架：提供 /chat 接口、维护 session 状态、对请求做简单鉴权，并把 Agent 循环结果流式返回？",
  "quickAnswer": "用 FastAPI 起服务：check_auth 从 Authorization 头取 api_key 做占位校验；/chat 按 session_id 在 SESSIONS 字典里取或建 ConversationBuffer；把用户消息写入记忆后调用 agent_loop 跑 ReAct，结果用 StreamingResponse 流式回传，并回写助手消息。",
  "explanationFocus": "是什么：最小可上线 Agent 服务是把前面所有组件（路由、记忆、ReAct 循环、流式）封装成一个有状态 HTTP 服务的骨架。它具备鉴权、会话隔离、记忆持久（进程内）与流式响应，足以作为生产原型的起点。",
  "approach": "核心思路：全局 SESSIONS 字典按 session_id 隔离对话记忆；每个 /chat 请求先鉴权，再取/建会话 buffer 并 add 用户消息，调 agent_loop 得到答案后 add 助手消息并流式返回；鉴权用 api_key 集合占位便于后续接真实网关。",
  "bruteForce": "朴素做法：把所有用户塞进同一个全局对话、不做鉴权、用普通 JSON 响应等 agent 跑完再回——既串台又无安全边界，且体感差，无法支撑多用户并发。",
  "invariant": "循环不变量：任意 session_id 在 SESSIONS 中对应唯一 ConversationBuffer；鉴权失败一定抛 401 且不进入 agent 逻辑；每个请求处理后 buffer 同时含有本轮 user 与 assistant 消息，保证后续轮次上下文完整。",
  "walkthrough": "请求 POST /chat，头 Authorization: Bearer sk-demo，体 {session_id:\"u1\", message:\"北京温度？\"}。check_auth 通过；SESSIONS 无 \"u1\" 则新建 buffer；add 用户消息→agent_loop 调 get_weather 得 \"25℃\"→add 助手消息→流式返回 \"25℃\"。第二次同 session 请求能带上前文。",
  "code": "from fastapi import FastAPI, Request, HTTPException\nfrom fastapi.responses import StreamingResponse\n\napp = FastAPI()\nSESSIONS = {}  # session_id -> ConversationBuffer（进程内状态）\nVALID_KEYS = {\"sk-demo\"}  # 占位：真实应查 DB/网关\n\ndef check_auth(request: Request):\n    key = request.headers.get(\"Authorization\", \"\").replace(\"Bearer \", \"\")\n    if key not in VALID_KEYS:  # 鉴权占位\n        raise HTTPException(status_code=401, detail=\"invalid api_key\")\n\n@app.post(\"/chat\")\nasync def chat(request: Request):\n    check_auth(request)  # 先鉴权，失败直接 401\n    body = await request.json()\n    sid = body.get(\"session_id\", \"default\")\n    if sid not in SESSIONS:  # 首次建会话\n        SESSIONS[sid] = ConversationBuffer(summary_model)\n    buf = SESSIONS[sid]\n    buf.add(\"user\", body[\"message\"])  # 写入用户消息\n    async def gen():\n        answer = agent_loop(llm, tools, buf.context())  # 复用 ReAct 循环\n        buf.add(\"assistant\", answer)  # 回写助手消息，维持上下文\n        yield answer\n    return StreamingResponse(gen(), media_type=\"text/event-stream\")",
  "complexity": "时间复杂度：单次 /chat 为 O(agent_loop 步数 × (LLM+工具))，与对话历史长度相关（受记忆窗口约束）。空间复杂度：O(活跃会话数 × 单会话 token)，SESSIONS 常驻内存，需配淘汰策略防泄漏。",
  "beginnerSummary": "这就像开一家\"AI 前台\"小店：进门先查工牌（鉴权），每人发一个专属文件夹（session）记着聊过什么；你说话它写进文件夹，跑去查完资料再把答案边说边写回文件夹，下次你来它还记得上次的事。",
  "diagram": "HTTP POST /chat\n   | Authorization: Bearer sk-xxx\n   v\n[check_auth] --401?--> 拒绝\n   | 通过\n   v\n[SESSIONS 字典] --sid--> 取/建 ConversationBuffer\n   |\n   v\nbuf.add(user) --> [agent_loop(ReAct)] --> buf.add(assistant)\n                                        |\n                                        v\n                                StreamingResponse(answer)",
  "derivation": [
    "为什么需要：单脚本 Demo 无法服务多用户，需要 HTTP 入口、会话隔离与基本安全边界，才能从笔记本走向可部署原型。",
    "怎么实现：FastAPI 提供路由；SESSIONS 字典按 session_id 存缓冲实现隔离；check_auth 用 api_key 集合占位；/chat 内组合记忆与 agent_loop，并以流式返回。",
    "有什么代价：进程内 SESSIONS 不跨实例、重启即丢，需换 Redis 等外部存储；api_key 占位不安全，需接真实鉴权；缺少限流/超时会被滥用。",
    "怎么评测：用并发多 session 压测验证隔离正确性与无串台；鉴权用例验证 401；记忆连续性用例验证多轮上下文不丢。"
  ],
  "edgeCases": [
    "缺 Authorization 头或 key 错误：check_auth 抛 401，绝不进入 agent 逻辑，避免未授权调用产生成本。",
    "session_id 不存在：自动新建 ConversationBuffer，首次对话也能正常工作。",
    "body 缺 message 字段：body[\"message\"] 抛 KeyError，应改为 .get 并校验非空，这里作为骨架留给接入层处理。"
  ],
  "pitfalls": [
    "把状态存在进程内存（SESSIONS），多副本部署会串台/丢失，生产必须外置到 Redis 等共享存储。",
    "api_key 硬编码在代码里且无轮换，泄露即失守；应读环境变量或接鉴权网关。",
    "agent_loop 无总超时，恶意长会话会占满资源；应加请求级 timeout 与并发限制。"
  ],
  "prerequisites": [
    "了解 HTTP 请求/响应与 REST 接口基本概念。",
    "掌握前几张卡：agent_loop、ConversationBuffer、流式响应。"
  ],
  "workedExample": [
    "POST /chat，headers={Authorization:\"Bearer sk-demo\"}，json={session_id:\"u1\", message:\"北京温度？\"}。check_auth 通过；SESSIONS 无 \"u1\" 新建 buffer；agent_loop 调 get_weather 得 \"25℃\"，流式返回该串并写入助手消息。",
    "同一 session 再发 {session_id:\"u1\", message:\"那上海呢？\"}：buf 已含上文，agent_loop 基于完整上下文调用 get_weather(上海)，返回 \"上海当前30℃\"，验证记忆连续性与会话隔离。"
  ],
  "lineByLine": [
    "from fastapi import ... HTTPException / StreamingResponse：引入路由、异常与流式响应依赖。",
    "SESSIONS = {} 与 VALID_KEYS = {\"sk-demo\"}：进程内会话状态与占位合法密钥集合。",
    "def check_auth(request)：从 Authorization 头剥离 \"Bearer \" 取 key，不在白名单则抛 401。",
    "@app.post(\"/chat\") async def chat(request)：定义聊天端点，先 await 取请求对象。",
    "check_auth(request)：入口即鉴权，失败直接 401，防止未授权消耗 LLM。",
    "body = await request.json() 与 sid = body.get(\"session_id\",\"default\")：解析体并取会话 ID，缺省 \"default\"。",
    "if sid not in SESSIONS: SESSIONS[sid] = ConversationBuffer(...)：按会话取或建记忆缓冲，实现隔离。",
    "buf.add(\"user\", body[\"message\"])：把本轮用户消息写入记忆，供 agent_loop 看见历史。",
    "async def gen()：流式生成器，内部跑 agent_loop 并把答案 add 为助手消息后 yield。",
    "return StreamingResponse(gen(), media_type=\"text/event-stream\")：以 SSE 流式把答案推回前端。"
  ],
  "codeNotes": [
    "SESSIONS 应替换为 Redis 等外部存储以支持多实例；check_auth 应接真实网关/JWT 校验而非硬编码集合。"
  ],
  "followUps": [
    {
      "question": "进程内 SESSIONS 有哪些生产隐患，怎么改？",
      "answer": "隐患：重启丢失、多副本不共享、内存无限增长。应改用 Redis 等外部 KV 存会话，设 TTL 自动淘汰；多实例下 agent_loop 保持无状态、状态全在存储层，便于水平扩容。"
    },
    {
      "question": "如何给这个骨架加请求级超时与限流？",
      "answer": "在 /chat 包一层 asyncio.wait_for(agent_loop(...), timeout=N) 防长占；用中间件（如 slowapi）按 api_key 做令牌桶限流，并对并发会话数设上限，避免资源被单用户打满。"
    }
  ],
  "followUpAnswers": [
    "隐患：重启丢失、多副本不共享、内存无限增长。应改用 Redis 等外部 KV 存会话，设 TTL 自动淘汰；多实例下 agent_loop 保持无状态、状态全在存储层，便于水平扩容。",
    "在 /chat 包一层 asyncio.wait_for(agent_loop(...), timeout=N) 防长占；用中间件（如 slowapi）按 api_key 做令牌桶限流，并对并发会话数设上限，避免资源被单用户打满。"
  ]
};
