export default {
  "kind": "concept",
  "id": "agent-mcp-vs-fc",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "MCP 与普通 Function Calling 有什么区别？",
  "prompt": "MCP（Model Context Protocol）与普通 Function Calling 有什么区别？Host、Client、Server 各自负责什么？",
  "quickAnswer": "Function Calling 是“模型调用某个具体函数”的机制（模型输出函数名+参数，由应用执行）；MCP 是一套开放协议，规定应用（Host）如何通过统一接口（Client）连接各类能力服务（Server，暴露 Tools/Resources/Prompts），让模型可插拔地接入文件、数据库、API 等。MCP 解决的是“能力如何被标准化发现与连接”，并不负责 Agent 的规划/决策。本地 STDIO 与远程 HTTP 是两种传输；权限控制在 Client/Server 侧按工具粒度做。",
  "approach": "FC 是调用机制，MCP 是连接协议；MCP 管“能力如何暴露与连接”，不管“怎么规划”。",
  "explanationFocus": "是什么：FC 是模型侧调用原语，MCP 是宿主侧的互操作协议，二者层级不同、可共存。",
  "bruteForce": "把每个工具都硬编码进 prompt（无协议、无标准化发现）。",
  "derivation": [
    "为什么需要：工具越来越多，硬编码集成成本高；需要统一方式让模型发现并调用外部能力。",
    "MCP 怎么实现：Host 起 Client 连 Server；Server 声明 Tools/Resources/Prompts；Client 按协议做发现、调用、取结果。",
    "FC 怎么用：模型在推理中输出 function_call（名+参），由应用执行并返回。",
    "怎么评测：看接入新工具的成本、权限边界、以及协议带来的可组合性。"
  ],
  "invariant": "MCP 是传输/能力协议，不等于 Agent Framework；它不规定模型怎么规划，只规定能力如何被发现与连接。",
  "walkthrough": "Host(如 IDE/客户端) 启动 MCP Client 连多个 MCP Server（文件系统、数据库、API）；Server 各自声明 Tools；模型经 FC 决定调用哪个 Tool，Host 通过 Client 把请求发给对应 Server 执行。",
  "edgeCases": [
    "把 MCP 当成 Agent 框架（错：它不管规划/记忆/循环）。",
    "STDIO 与 HTTP 混淆：本地进程用 STDIO，跨机用 HTTP/SSE，权限模型不同。",
    "权限过宽：所有 Tool 全授权，带来安全风险。"
  ],
  "code": "# Python\ndef handle_function_call(call, mcp_clients):\n    # call: {name, arguments} 由模型产出\n    server = mcp_clients.route(call['name'])   # Client 找到对应 Server\n    return server.invoke_tool(call['name'], call['arguments'])  # Server 执行\n# MCP 负责连接与发现, FC 负责模型侧决策",
  "codeNotes": [
    "真实 MCP 含握手、能力声明、权限与作用域。",
    "MCP 不规定 Agent 如何规划。"
  ],
  "complexity": "调用开销 = FC 解析 + Client 路由 + Server 执行；协议本身引入一次发现/握手，换来可插拔。",
  "followUps": [
    {
      "question": "MCP 解决了什么问题？",
      "answer": "把“模型如何连外部能力”标准化：统一发现、调用、取结果，避免每个工具硬编码集成。"
    },
    {
      "question": "Host、Client、Server 各自负责什么？",
      "answer": "Host 是运行模型的应用（如 IDE），起 Client；Client 负责与 Server 通信、路由；Server 暴露 Tools/Resources/Prompts 并执行调用。"
    },
    {
      "question": "Tool、Resource、Prompt 有什么区别？",
      "answer": "Tool 是可执行动作（带副作用），Resource 是可读数据/上下文，Prompt 是预置提示模板；三者是 MCP 的不同原语。"
    },
    {
      "question": "本地 STDIO 和远程 HTTP 有什么区别？",
      "answer": "STDIO 用于同机子进程（低延迟、本机权限），HTTP/SSE 用于跨网络 Server；传输与安全边界不同。"
    },
    {
      "question": "MCP 是否负责 Agent 的规划？",
      "answer": "不负责。MCP 只管能力的暴露与连接；规划/决策仍是模型或 Agent 框架的事。"
    },
    {
      "question": "如何控制 Tool 权限？",
      "answer": "在 Client/Server 侧按工具粒度做授权与作用域限制，避免全量开放带来安全风险。"
    }
  ],
  "followUpAnswers": [
    "标准化能力发现与连接。",
    "Host起Client, Client路由, Server执行。",
    "Tool可执行/Resource可读/Prompt模板。",
    "STDIO本机, HTTP跨网。",
    "MCP不管规划。",
    "按工具粒度授权。"
  ],
  "pitfalls": [
    "把 MCP 当成 Agent 框架（它不管规划）。",
    "混淆 STDIO 与 HTTP 的权限模型。",
    "Tool 全量授权，安全风险。"
  ],
  "beginnerSummary": "Function Calling 是模型“伸手去按一个具体按钮”的能力：它输出“我要调用函数A、参数是x”，你的程序去执行。MCP 是一套“插座标准”：它规定你的应用（Host）怎么用统一接口（Client）去连接各种能力服务（Server，比如文件系统、数据库、API），这些服务声明自己有哪些“按钮”（Tools）、哪些“资料”（Resources）、哪些“话术”（Prompts）。所以 FC 是模型侧的“怎么按按钮”，MCP 是宿主侧的“按钮怎么被标准化接进来”——它俩不冲突，还能一起用。但要分清：MCP 只管“能力怎么连”，不管“模型下一步想干啥”（那是 Agent 框架的事），也别把所有按钮权限一把梭给开满。",
  "prerequisites": [
    "FC 是模型调用函数的机制。",
    "MCP 是能力连接协议。",
    "协议不管规划/决策。"
  ],
  "workedExample": [
    "Host 起 Client 连多个 Server; Server 声明 Tools。",
    "模型经 FC 选型, Host 经 Client 路由到 Server 执行。"
  ],
  "lineByLine": [
    "FC: 模型输出函数名+参数。",
    "MCP: Host-Client-Server 架构。",
    "Server 暴露 Tools/Resources/Prompts。",
    "Client 发现+路由+调用。",
    "MCP 不管规划, 只管连接。"
  ],
  "diagram": "MCP 架构:\nHost(应用)\n  +- Client -- 连接 --> Server\n                     |- Tools(可执行)\n                     |- Resources(可读)\n                     +- Prompts(模板)\nFC: 模型决定调用哪个 Tool\nMCP!=Agent框架(不管规划)"
};
