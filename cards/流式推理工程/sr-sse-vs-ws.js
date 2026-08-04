export default {
  "id": "sr-sse-vs-ws",
  "category": "流式推理工程",
  "difficulty": "Easy",
  "title": "SSE 与 WebSocket 流式",
  "prompt": "在大模型流式输出场景里，服务端推送应该用 SSE 还是 WebSocket？两者在鉴权、断线、方向性上各有什么取舍？",
  "quickAnswer": "多数只读生成流用 SSE 更简：基于 HTTP、天然可走 CDN/网关、单向 server→client、断线用 Last-Event-ID 续传。需要双向交互（如中途改参数、函数调用回传）才上 WebSocket。",
  "approach": "按“是否只需服务端单向推送”判断：是则选 SSE（EventSource + text/event-stream）；否则选 WebSocket。SSE 复用现有 HTTP 鉴权与缓存，WebSocket 需额外握手与心跳。",
  "explanationFocus": "是什么：SSE（Server-Sent Events）是基于 HTTP 的单向服务器推送协议，WebSocket 是独立的全双工协议；大模型输出多为单向流，故 SSE 常是默认选择。",
  "bruteForce": "朴素做法：每次生成都用普通 HTTP 请求，等模型吐完整段再返回，客户端长时间挂起，无法逐字显示且易超时。",
  "invariant": "无论选哪种，断线后都必须能基于已收到偏移（event id / token 序号）续传，保证客户端不重复、不遗漏已生成内容。",
  "walkthrough": "1) 客户端用 EventSource 连 /stream；2) 服务端设 text/event-stream 与 X-Accel-Buffering: no；3) 每生成一个 token 以 data: 块 flush；4) 断线后浏览器自动带 Last-Event-ID 重连；5) 服务端据 id 续推。",
  "complexity": "SSE 实现成本 O(1)（复用 HTTP 栈）；WebSocket 需管理连接生命周期、心跳与多路复用，工程复杂度更高，但带来双向能力。",
  "beginnerSummary": "SSE 像“服务器一直往你这发短信”，简单、单向、好断线续传；WebSocket 像“双方随时打电话”，能双向但更重。大模型吐字一般单向，用 SSE 够。",
  "diagram": "Client === HTTP GET /stream ===> Server\n  <=== text/event-stream (data: tok) ===\n  [断线] -- Last-Event-ID --> 续传",
  "code": "from fastapi.responses import StreamingResponse\n\ndef sse_stream(prompt):\n    for tok in generate(prompt):\n        yield f'id: {tok.seq}\\ndata: {tok.text}\\n\\n'\n\nasync def handle(req):\n    return StreamingResponse(sse_stream(req.prompt),\n                              media_type='text/event-stream')",
  "derivation": [
    "为什么需要：模型逐 token 生成，若等整句再返回，体验差且易超时，必须用长连接把中间结果推给客户端。",
    "怎么实现：单向场景用 SSE——HTTP 头声明 event-stream、逐块 flush、EventSource 自动重连；双向场景用 WebSocket——额外握手与帧协议。",
    "有什么代价：SSE 只能单向，无法让客户端中途回传指令；WebSocket 双向但需自己处理鉴权中间件、心跳、横向扩展的连接迁移。",
    "怎么评测：以首包延迟、断线重连续传成功率、单连接吞吐衡量；SSE 重点看网关是否关闭缓冲，WebSocket 重点看心跳与掉线率。"
  ],
  "edgeCases": [
    "网关或代理缓冲：Nginx 默认缓冲 SSE，需 X-Accel-Buffering: no 并禁用 gzip 缓冲，否则客户端收不到逐字流。",
    "客户端不支持 EventSource（如某些小程序）：需降级为 fetch + ReadableStream 手动解析 text/event-stream。",
    "连接中途切后台：移动端会挂起 TCP，需重连并带 Last-Event-ID 续传而非从头。",
    "超大单条 data 超过代理行限制：应分块或限制单事件大小。"
  ],
  "pitfalls": [
    "把 SSE 当双向用：SSE 规范是单向，硬要客户端发指令会退化成再开一个 HTTP 请求，反而复杂，该用 WebSocket。",
    "忘记关缓冲导致“攒一批才显示”：未设置无缓冲头时，浏览器要等缓冲区满才刷新，流式效果全无。"
  ],
  "prerequisites": [
    "理解 HTTP 长连接与分块传输（chunked transfer）",
    "了解 EventSource / WebSocket 的浏览器 API 与重连机制"
  ],
  "workedExample": [
    "示例A：纯生成问答用 SSE，前端 new EventSource(\"/chat\") 监听 message 即逐字渲染，部署成本最低。",
    "示例B：Agent 中途需用户确认工具调用，用 WebSocket，服务端可主动发“待确认”事件并接收用户回传指令。"
  ],
  "lineByLine": [
    "sse_stream：用生成器逐 token 产出，每个事件带 id 与 data，便于客户端续传定位。",
    "yield 的 f-string 遵循 SSE 规范：空行分隔事件，便于解析。",
    "StreamingResponse 设 media_type 为 text/event-stream，FastAPI 会逐块 flush 而非缓存整段。"
  ],
  "codeNotes": [
    "生产环境还需设置 Cache-Control: no-cache 与 X-Accel-Buffering: no，关键在“不缓冲”。"
  ],
  "followUps": [
    {
      "question": "SSE 如何做鉴权？",
      "answer": "直接复用 HTTP 头部（Authorization bearer）或签名 query，网关与现有鉴权中间件无需改造；WebSocket 也走类似升级握手但需手动透传。"
    },
    {
      "question": "移动端断线频繁怎么保证不重复？",
      "answer": "每个事件带单调递增 id，客户端记录最后收到的 id，重连时在 Last-Event-ID 或 query 带上，服务端从该偏移续推。"
    }
  ],
  "followUpAnswers": [
    "直接复用 HTTP 头部（Authorization bearer）或签名 query，网关与现有鉴权中间件无需改造；WebSocket 也走类似升级握手但需手动透传。",
    "每个事件带单调递增 id，客户端记录最后收到的 id，重连时在 Last-Event-ID 或 query 带上，服务端从该偏移续推。"
  ],
  "kind": "concept"
};
