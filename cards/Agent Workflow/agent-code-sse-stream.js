export default {
  "id": "agent-code-sse-stream",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "手写 Agent 流式转发(SSE)",
  "prompt": "如何手写一个 Agent 流式接口，用 SSE 把 LLM 的 token 与工具事件实时推送给前端，并带心跳和错误帧？",
  "quickAnswer": "用 FastAPI 的 StreamingResponse 配合 media_type=\"text/event-stream\"，在异步生成器里逐 token 产出 \"event:/data:\" 帧；工具调用、结果、心跳、错误都封装成独立事件帧推送，前端按 event 类型渲染，错误用 error 帧而不是断流。",
  "explanationFocus": "是什么：SSE（Server-Sent Events）是一种基于 HTTP 的单向流式推送协议。Agent 流式转发指后端把 LLM 生成的 token 流和工具事件（调用/结果/错误）实时以 SSE 帧推给浏览器，提升体感速度并支持过程可视化。",
  "approach": "核心思路：定义一个异步生成器 event_gen，先后 yield start 帧、逐 token 的 token 帧、tool_call/tool_result 帧，并用注释行 \": heartbeat\" 保活；异常时 yield error 帧而非抛出让连接断开；端点返回 StreamingResponse。",
  "bruteForce": "朴素做法：等 Agent 全部跑完再一次性返回 JSON，用户面对长时间空白；或用 WebSocket 实现双向通信，协议更重、前端处理更复杂，而本场景只需服务端单向推送。",
  "invariant": "循环不变量：只要连接未断开，每个逻辑事件都对应一个完整 SSE 帧（以空行结尾）；即便工具或 LLM 出错，也通过 error 帧通知前端，连接不会因异常而静默断开。",
  "walkthrough": "客户端 GET /stream?question=北京温度。后端依次推送：event:start → event:token(\"北\")→token(\"京\")→... → event:tool_call{get_weather} → event:tool_result{\"25℃\"} → 每隔若干秒 \": heartbeat\" → event:done{ok:true}。前端实时显示打字机效果与工具调用卡片。",
  "code": "from fastapi import FastAPI\nfrom fastapi.responses import StreamingResponse\nimport json, asyncio\n\napp = FastAPI()\n\ndef sse(event, data):\n    # 把事件包成 SSE 帧: \"event: x\\ndata: y\\n\\n\"\n    return f\"event: {event}\\ndata: {json.dumps(data, ensure_ascii=False)}\\n\\n\"\n\nasync def event_gen(llm, tools, question):\n    yield sse(\"start\", {\"question\": question})  # 开场帧\n    try:\n        async for token in llm.stream(question):  # 逐 token 产出\n            yield sse(\"token\", {\"text\": token})\n        tool = select_tool(question, tools)  # 路由到工具\n        result = call_with_retry(tool[\"fn\"], {})  # 带重试调用\n        yield sse(\"tool_call\", {\"tool\": tool[\"name\"]})  # 工具调用帧\n        yield sse(\"tool_result\", {\"result\": str(result)})  # 结果帧\n    except Exception as e:\n        yield sse(\"error\", {\"msg\": str(e)})  # 错误帧而非断流\n    yield \": heartbeat\\n\\n\"  # 注释行=心跳保活\n    yield sse(\"done\", {\"ok\": True})  # 结束帧\n\n@app.get(\"/stream\")\nasync def stream(question: str):\n    return StreamingResponse(\n        event_gen(llm, tools, question),\n        media_type=\"text/event-stream\",\n    )",
  "complexity": "时间复杂度：与生成长度线性相关，O(生成token数 + 工具调用次数)。空间复杂度：O(单帧)，流式逐帧发送不缓存全量，内存恒定；仅 SSE 帧头开销为常数。",
  "beginnerSummary": "就像看直播弹幕：后端一边生成一边把\"字\"和\"系统提示\"（调用了哪个工具、返回了啥）实时飘到屏幕上，中间还会偶尔发个\"我还在线\"的心跳，即使出错了也先发条错误通知而不是突然关播。",
  "diagram": "Browser --GET /stream--> FastAPI\n                         |\n                         v\n                  [event_gen 异步生成器]\n   start --> token --> token --> ... --> tool_call\n                                         |\n                                      tool_result\n                                         |\n                                    (error?)--> error\n                                         |\n                                    heartbeat --> done\n                         |\n                         v\n                  StreamingResponse (text/event-stream)",
  "derivation": [
    "为什么需要：Agent 多步推理常耗时数秒到数十秒，等全部完成再返回会让用户面对空白、体感差；流式可实时展示思考与工具过程，提升可信度与交互体验。",
    "怎么实现：FastAPI 的 StreamingResponse 接收异步生成器，按 SSE 格式（event:/data:/空行）持续 yield 帧；token、工具事件、心跳、错误各自成帧，前端用 EventSource 监听。",
    "有什么代价：长连接占用服务端资源，需要心跳防代理超时断开；错误必须用帧而非异常，否则连接中断前端无法区分\"完成\"与\"崩溃\"；需处理客户端中途断开。",
    "怎么评测：量首 token 延迟、帧率稳定性、心跳间隔、断连恢复；前端考核打字机流畅度与错误帧展示正确性。"
  ],
  "edgeCases": [
    "客户端中途关闭连接：生成器应在 asyncio 取消时捕获 CancelledError 优雅退出，避免服务端报错堆积。",
    "LLM 单次返回极长无 token 流：心跳帧保活，防止 nginx/代理因静默超时断开。",
    "工具调用抛出异常：被 try/except 捕获并 yield error 帧，连接不中断，前端可提示后继续或结束。"
  ],
  "pitfalls": [
    "忘记设置 media_type=\"text/event-stream\" 或帧末尾缺空行，浏览器 EventSource 无法解析分帧。",
    "用普通 return 字符串而非生成器，导致一次性返回而非流式，失去实时性。",
    "把异常直接抛出而不是转成 error 帧，连接瞬间断开且前端拿不到任何错误信息。"
  ],
  "prerequisites": [
    "理解 HTTP 流式响应与 SSE 帧格式（event:/data:/空行）。",
    "了解 FastAPI 异步生成器与 async for 基础。"
  ],
  "workedExample": [
    "前端 EventSource(\"/stream?question=北京温度\")。后端 event_gen 依次 yield：sse(\"start\",{question})、sse(\"token\",{text:\"北\"})、sse(\"token\",{text:\"京\"})、sse(\"tool_call\",{tool:\"get_weather\"})、sse(\"tool_result\",{result:\"25℃\"})、\": heartbeat\\n\\n\"、sse(\"done\",{ok:True})。",
    "前端收到 token 帧时把 text 追加到对话框实现打字机；收到 tool_call/tool_result 时渲染\"调用了 get_weather → 25℃\"卡片；收到 error 帧则显示红色提示但连接保持。"
  ],
  "lineByLine": [
    "from fastapi ... import StreamingResponse：引入流式响应类，用于持续推送而非一次性返回。",
    "def sse(event, data)：把事件名与数据序列化为标准 SSE 帧，json.dumps(ensure_ascii=False) 保证中文不乱码，结尾双换行分隔帧。",
    "async def event_gen(...)：异步生成器，是整个流的核心，用 yield 逐个推送帧。",
    "yield sse(\"start\", {...})：首帧告知前端任务开始与问题内容。",
    "async for token in llm.stream(question)：逐 token 迭代模型输出，每个 token 立即 yield 成 token 帧，实现打字机效果。",
    "tool = select_tool(...) 与 result = call_with_retry(...)：路由并带重试调用工具，复用前两张卡的逻辑。",
    "yield sse(\"tool_call\"/\"tool_result\", ...)：把工具调用与结果作为独立事件推给前端做过程可视化。",
    "except Exception as e: yield sse(\"error\", ...)：关键容错——错误转成 error 帧，连接不断开。",
    "yield \": heartbeat\\n\\n\" 与 sse(\"done\",...）：心跳保活 + 结束帧，标记流正常终结。",
    "@app.get(\"/stream\") 返回 StreamingResponse(event_gen(...), media_type=\"text/event-stream\")：把生成器挂到路由并声明 SSE 媒体类型。"
  ],
  "codeNotes": [
    "生产应把 select_tool/call_with_retry 来自前两张卡；心跳间隔可按时间触发而非仅在末尾发一次。"
  ],
  "followUps": [
    {
      "question": "SSE 和 WebSocket 该怎么选？",
      "answer": "本场景是服务端单向推送、前端只需接收，SSE 更轻量、基于标准 HTTP、自带重连；若需要前端反向发指令（如中途打断、修改参数）则用 WebSocket 双向更合适。"
    },
    {
      "question": "前端用 EventSource 如何正确处理错误帧？",
      "answer": "EventSource 的 onmessage/onerror 区分网络错误与业务错误；业务错误应放在自定义 event 帧（如 event:error）里，前端用 addEventListener(\"error\",...) 处理，而不依赖连接级 onerror，避免误判断连。"
    }
  ],
  "followUpAnswers": [
    "本场景是服务端单向推送、前端只需接收，SSE 更轻量、基于标准 HTTP、自带重连；若需要前端反向发指令（如中途打断、修改参数）则用 WebSocket 双向更合适。",
    "EventSource 的 onmessage/onerror 区分网络错误与业务错误；业务错误应放在自定义 event 帧（如 event:error）里，前端用 addEventListener(\"error\",...) 处理，而不依赖连接级 onerror，避免误判断连。"
  ]
};
