export default {
  "kind": "concept",
  "id": "agent-mcp-vs-fc",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "MCP 与普通 Function Calling 有什么区别？",
  "prompt": "MCP（Model Context Protocol）与普通 Function Calling 有什么区别？Host、Client、Server 各自负责什么？",
  "quickAnswer": "Function Calling 是\"模型调用某个具体函数\"的机制：模型输出函数名+参数，由应用执行并返回结果，偏模型侧。MCP 是一套开放协议，规定应用（Host）如何通过统一接口（Client）连接各类能力服务（Server，暴露 Tools/Resources/Prompts），让模型可插拔地接入文件、数据库、API 等，偏宿主侧。MCP 解决的是\"能力如何被标准化发现与连接\"，并不负责 Agent 的规划/决策。本地 STDIO 与远程 HTTP/SSE 是两种传输；权限控制在 Client/Server 侧按工具粒度做授权与作用域隔离。落地时通常是 Host 通过 MCP Client 发现 Server 提供的 Tools，再由模型经 FC 决定调用哪一个。",
  "approach": "FC 是\"调用机制\"（模型→函数），MCP 是\"连接协议\"（应用→能力服务）；MCP 管\"能力如何暴露与连接\"，不管\"怎么规划\"。实际架构：Host 内运行模型与 MCP Client，Client 与若干 MCP Server 建连，Server 声明 Tools/Resources/Prompts；模型推理时用 FC 输出调用意图，Host 通过 Client 路由到对应 Server 执行并回传。",
  "explanationFocus": "是什么：Function Calling（FC）是模型侧的\"调用原语\"——模型在推理中输出\"函数名+参数\"，由应用负责执行并返回结果，它解决的是\"模型如何触发一个具体动作\"。MCP（Model Context Protocol）是宿主（Host）侧的\"互操作协议\"——它规定应用如何通过统一接口连接各类能力服务（Server，暴露 Tools/Resources/Prompts），解决的是\"外部能力如何被标准化地发现与连接\"。二者层级不同、可共存：FC 决定\"调哪个\"，MCP 决定\"怎么连到那个能力并执行\"。",
  "bruteForce": "把每个工具都硬编码进 prompt 与调用分支：每接一个新能力（新数据库、新 API）都要改代码、改 prompt、重新写解析逻辑，无法动态发现，能力越多集成成本线性爆炸，且无法统一做权限与错误处理。一旦工具接口变更，所有调用点都要跟着改，维护成本极高。",
  "derivation": [
    "为什么需要：外部工具/数据源越来越多，若每个都硬编码集成，接入成本高、难以复用，且模型无法在运行时\"发现\"可用能力；需要统一协议让能力可被标准化暴露、发现与调用，避免每接一个工具就改一次应用。",
    "MCP 怎么实现：Host 起一个 MCP Client 与 Server 建连；Server 在握手时声明自己提供的 Tools/Resources/Prompts 及 schema；Client 按协议做发现、调用、取结果，并用 JSON-RPC 承载消息。传输层支持本地 STDIO（同机子进程）与远程 HTTP/SSE（跨网络）。",
    "FC 怎么用：模型在推理中输出 function_call（函数名+参数），由应用（Host）执行——这一步与 MCP 解耦：FC 决定\"调谁\"，MCP 决定\"怎么连到那个能力并执行\"。两者组合即可让模型通过标准协议使用任意外部能力，而应用无需为每个工具写专用分支。",
    "怎么评测：看接入新工具的成本（是否只需起一个 Server）、权限边界是否清晰、协议带来的可组合性（能否在同一 Host 下混用多 Server），以及传输层在本地/远程下的延迟与安全性；好的 MCP 落地应让\"加能力\"接近零代码改动。"
  ],
  "invariant": "MCP 是传输/能力协议，不等于 Agent Framework；它不规定模型怎么规划、怎么记忆、怎么循环，只规定\"能力如何被发现与连接\"。因此换了 Agent 框架（LangChain、自研）只要支持 MCP Client，就能复用同一批 Server，能力层与编排层解耦。",
  "walkthrough": "以\"IDE 内置 AI 助手\"为例：Host 是 IDE 进程，它在启动时拉起一个 MCP Client，Client 分别与三个 MCP Server 建连——本地文件系统 Server（STDIO 传输）、公司内部数据库 Server（HTTP/SSE）、第三方搜索 API Server（HTTP）。每个 Server 启动时声明自己的 Tools（如 read_file、query_db、web_search）与 Resources（如当前打开的文件内容）。当用户提问\"总结我刚打开的那个文件\"，模型经 FC 输出 function_call={name:\"read_file\", args:{path:...}}，Host 通过 Client 路由到文件系统 Server 执行，结果回传后模型生成总结。整个过程模型不需要知道文件在哪台机器、用什么协议，全靠 MCP 解耦；若换成数据库查询，只需路由到 DB Server，Host 代码零改动。",
  "edgeCases": [
    "把 MCP 当成 Agent 框架（错：它不管规划/记忆/循环，只是能力连接层；把它当框架用会缺调度与状态管理）。",
    "STDIO 与 HTTP 混淆：本地进程用 STDIO（低延迟、本机权限、随 Host 进程启停），跨机用 HTTP/SSE（需鉴权、网络边界、超时处理），权限模型与运维方式不同。",
    "权限过宽：把所有 Tool 全量授权给模型，一旦模型 hallucinate 调了危险工具（如删库、发邮件）就出事故；应做工具粒度的授权与确认。",
    "Server 崩溃/超时：Client 需有重试、超时与降级（如标记该 Tool 不可用），否则单次失败拖垮整轮对话。"
  ],
  "code": "# Python\ndef handle_function_call(call, mcp_clients):\n    # call: {name, arguments} 由模型产出\n    server = mcp_clients.route(call['name'])   # Client 找到对应 Server\n    return server.invoke_tool(call['name'], call['arguments'])  # Server 执行\n# MCP 负责连接与发现, FC 负责模型侧决策",
  "codeNotes": [
    "真实 MCP 含握手、能力声明、JSON-RPC 消息、权限与作用域校验；示例只展示\"路由到 Server 执行\"，省略了鉴权与错误处理。",
    "MCP 不规定 Agent 如何规划，因此常与 Agent 框架（而非取代它）配合使用：框架做决策，MCP 做连接。",
    "route() 在生产中要处理多 Server 同名 Tool、版本冲突与超时，示例做了简化。"
  ],
  "complexity": "单次调用开销 = FC 解析（模型侧，几乎免费）+ Client 路由（本地查表 O(1)）+ Server 执行（取决于工具本身，可能含网络 RTT）。协议本身引入一次握手/能力发现，但只在连接建立时做一次，换来\"可插拔\"——新增能力只需起一个新 Server，无需改 Host 代码。对比硬编码集成，MCP 把\"接入成本\"从 O(工具数×改代码) 降到 O(起 Server)，规模越大收益越明显。",
  "followUps": [
    {
      "question": "MCP 解决了什么问题？",
      "answer": "把\"模型如何连外部能力\"标准化：统一发现（Server 声明能力）、调用（Client 路由执行）、取结果（回传模型）三步，避免每个工具硬编码集成。新增能力只需起一个 MCP Server，Host 无需改代码即可复用，把\"接入成本\"从 O(工具数×改代码) 降到 O(起 Server)。"
    },
    {
      "question": "Host、Client、Server 各自负责什么？",
      "answer": "Host 是运行模型的应用（如 IDE/客户端），它启动并持有 MCP Client；Client 负责与 Server 通信、做能力发现、请求路由与结果取回；Server 暴露 Tools/Resources/Prompts 并执行具体调用。三者分层：Host 管模型与编排，Client 管连接，Server 管能力。"
    },
    {
      "question": "Tool、Resource、Prompt 有什么区别？",
      "answer": "Tool 是可执行动作、带副作用（如读文件、调 API）；Resource 是可读的数据/上下文（如当前文件内容、配置），供模型作为背景；Prompt 是预置的提示模板，帮模型更规范地发起调用。三者是 MCP 的三类原语，用途不同，不能互相替代。"
    },
    {
      "question": "本地 STDIO 和远程 HTTP 有什么区别？",
      "answer": "STDIO 用于同机子进程（低延迟、随 Host 启停、本机权限、无需网络鉴权）；HTTP/SSE 用于跨网络的 Server（需 HTTPS 鉴权、处理超时与断线、权限边界在远端）。传输选择直接影响延迟与安全模型，二者不能混用。"
    },
    {
      "question": "MCP 是否负责 Agent 的规划？",
      "answer": "不负责。MCP 只管能力的暴露与连接，规划/决策/记忆/循环仍是模型或 Agent 框架的事；把 MCP 当 Agent 框架用会缺调度与状态管理，它只是连接层。"
    },
    {
      "question": "如何控制 Tool 权限？",
      "answer": "在 Client/Server 侧按工具粒度做授权与作用域限制（如只读账号、限定路径、危险操作需人工确认），避免全量开放带来安全风险；同时可对每次调用做审计日志，便于追溯与合规。"
    }
  ],
  "followUpAnswers": [
    "把\"模型如何连外部能力\"标准化：统一发现（Server 声明能力）、调用（Client 路由执行）、取结果（回传模型）三步，避免每个工具硬编码集成。新增能力只需起一个 MCP Server，Host 无需改代码即可复用，把\"接入成本\"从 O(工具数×改代码) 降到 O(起 Server)。",
    "Host 是运行模型的应用（如 IDE/客户端），它启动并持有 MCP Client；Client 负责与 Server 通信、做能力发现、请求路由与结果取回；Server 暴露 Tools/Resources/Prompts 并执行具体调用。三者分层：Host 管模型与编排，Client 管连接，Server 管能力。",
    "Tool 是可执行动作、带副作用（如读文件、调 API）；Resource 是可读的数据/上下文（如当前文件内容、配置），供模型作为背景；Prompt 是预置的提示模板，帮模型更规范地发起调用。三者是 MCP 的三类原语，用途不同，不能互相替代。",
    "STDIO 用于同机子进程（低延迟、随 Host 启停、本机权限、无需网络鉴权）；HTTP/SSE 用于跨网络的 Server（需 HTTPS 鉴权、处理超时与断线、权限边界在远端）。传输选择直接影响延迟与安全模型，二者不能混用。",
    "不负责。MCP 只管能力的暴露与连接，规划/决策/记忆/循环仍是模型或 Agent 框架的事；把 MCP 当 Agent 框架用会缺调度与状态管理，它只是连接层。",
    "在 Client/Server 侧按工具粒度做授权与作用域限制（如只读账号、限定路径、危险操作需人工确认），避免全量开放带来安全风险；同时可对每次调用做审计日志，便于追溯与合规。"
  ],
  "pitfalls": [
    "把 MCP 当成 Agent 框架（它不管规划、记忆、工具编排，只是连接协议）。",
    "混淆 STDIO 与 HTTP 的权限/安全模型，导致本地误用远程鉴权或反之。",
    "Tool 全量授权不分级，模型一旦误调高危工具就造成不可逆副作用。"
  ],
  "beginnerSummary": "Function Calling 是模型\"伸手去按一个具体按钮\"的能力：它输出\"我要调用函数A、参数是x\"，你的程序去执行并把结果喂回给它。MCP 是一套\"插座标准\"：它规定你的应用（Host）怎么用统一接口（Client）去连接各种能力服务（Server，比如文件系统、数据库、API），这些服务声明自己有哪些\"按钮\"（Tools）、哪些\"资料\"（Resources）、哪些\"话术\"（Prompts）。所以 FC 是模型侧的\"怎么按按钮\"，MCP 是宿主侧的\"按钮怎么被标准化接进来\"——它俩不冲突，还能一起用：MCP 负责把按钮接到墙上，FC 负责模型决定按哪个。但要分清：MCP 只管\"能力怎么连\"，不管\"模型下一步想干啥\"（那是 Agent 框架的事），也别把所有按钮权限一把梭给开满，否则有安全风险。",
  "prerequisites": [
    "理解 Function Calling：模型输出\"函数名+参数\"、由应用执行并返回，这是模型侧触发动作的机制。",
    "理解客户端-服务器与协议分层：Host/Client/Server 角色分离，能力通过协议而非硬编码暴露。",
    "理解权限与作用域：工具可能带副作用，需要在 Client/Server 侧做按工具粒度的授权。",
    "了解 JSON-RPC 与两种传输（STDIO / HTTP-SSE）的基本差异。"
  ],
  "workedExample": [
    "例 1（本地 IDE）：Host 起 Client 连本地文件系统 Server(STDIO)，Server 声明 read_file/write_file；模型经 FC 调 read_file 读当前文件，全程本机、低延迟、权限限于工作区。",
    "例 2（跨网数据库）：Host 起 Client 连公司 DB Server(HTTP/SSE)，Server 声明 query_db 并配置了只读账号与作用域；模型调 query_db 时 Client 走 HTTPS 鉴权，避免把 DB 凭证暴露给模型。",
    "例 3（多 Server 混用）：同一 Host 同时连文件系统、搜索、日历三个 Server，模型一轮对话里先后用三个 Tool，体现 MCP 的可组合性，且 Host 无需为每个工具写专用分支。"
  ],
  "lineByLine": [
    "FC：模型在推理输出中给出 {name, arguments}，这是\"想调哪个能力、传什么参数\"，由应用执行——属于模型侧原语。",
    "MCP 架构：Host（运行模型的应用，如 IDE）持有 MCP Client，Client 与一个或多个 Server 建连。",
    "Server 在握手时声明 Tools（可执行、带副作用）、Resources（可读数据/上下文）、Prompts（预置提示模板）三类原语。",
    "Client 负责按协议发现可用能力、把 FC 的请求路由到对应 Server、执行并取回结果。",
    "MCP 只管\"能力的暴露与连接\"，不规定模型如何规划下一步——那是 Agent 框架的职责。"
  ],
  "diagram": "MCP 架构:\nHost(应用)\n  +- Client -- 连接 --> Server\n                     |- Tools(可执行)\n                     |- Resources(可读)\n                     +- Prompts(模板)\nFC: 模型决定调用哪个 Tool\nMCP!=Agent框架(不管规划)"
};
