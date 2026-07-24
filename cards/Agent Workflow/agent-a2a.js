export default {
  "id": "agent-a2a",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 间互操作(A2A)：多智能体如何协作",
  "prompt": "什么是 A2A 协议，多智能体之间如何通过标准接口发现彼此并协作完成复杂任务？",
  "quickAnswer": "A2A（Agent-to-Agent）是一套让不同厂商/框架的 Agent 互相发现、委派与交换结果的开放协议，核心是统一的 Task、Artifact、Message 数据模型与能力发现机制。一个 Agent 通过 Agent Card 公布自己能做什么，另一个 Agent 据此发起 Task、流式收 Message、最终拿到 Artifact 结果，从而把“端到端编排”交给多智能体协作。它与 MCP 互补：MCP 解决“Agent 怎么接工具/数据”，A2A 解决“Agent 怎么接另一个 Agent”。",
  "approach": "核心思路是把“调用另一个智能体”标准化成一次有状态的任务交互：客户端 Agent 先读取对方 Agent Card（能力清单），创建 Task 并附带输入，服务端以 Message 流式回报进度、以 Artifact 交付产出；双方用统一 schema 通信，无需关心对方内部实现，从而实现跨组织、跨框架的多智能体编排。",
  "explanationFocus": "是什么：A2A（Agent-to-Agent）协议是面向“智能体对智能体”的互操作标准，定义了 Agent 如何自描述能力（Agent Card）、如何发起与跟踪任务（Task）、如何交换过程消息（Message）与最终产物（Artifact），让异构 Agent 像微服务一样彼此调用与编排。",
  "bruteForce": "朴素做法——两个 Agent 之间用私有的 HTTP + 自定义 JSON 直接硬编码对接，或干脆把对方逻辑复制进自己进程里串行调用；优点是上手最快、调试直观，缺点是每对组合都要写适配层、无法动态发现，扩到 N 个 Agent 时集成成本呈 O(N²) 爆炸。",
  "invariant": "不变量——每次跨 Agent 调用都必须通过显式的 Task 生命周期（创建→进行→完成/失败）来追踪，不能把对方的产出当作无状态函数返回值来隐式假设；只要任务未完成，客户端就必须能查询状态，而不能凭本地缓存判断对方已结束。",
  "walkthrough": "以“旅行规划”为例（涉及 3 个 Agent：航班、酒店、行程编排）：(1) 编排 Agent 读取航班/酒店 Agent 的 Agent Card，得知前者接受 (出发地,目的地,日期) 返回报价、后者接受 (城市,日期,预算) 返回房源；(2) 编排 Agent 创建 Task 给航班 Agent，拿到 Artifact（3 个航班选项）；(3) 并行创建 Task 给酒店 Agent，拿到 Artifact（5 个房源）；(4) 编排 Agent 综合两者产出生成行程。若航班 Agent 超时，编排方依据 Task 状态做降级（用缓存报价或改派其他 Agent），而不是卡死。",
  "code": "def discover(card_url):\n    # GET 对方 Agent Card 并解析能力清单, 零代码对接前先\"看清对方能干什么\"\n    return http.get(card_url).json()\n\ndef create_task(agent, input):\n    # 按协议 POST 一个 Task 并返回 task_id, 建立可追踪状态\n    resp = http.post(agent.endpoint + \"/tasks\", json={\"input\": input})\n    return resp.json()[\"task_id\"]\n\ndef poll(task_id):\n    # 查询 Task 当前状态与已到 Message, 支持流式/异步结果, 避免阻塞等待\n    return http.get(f\"/tasks/{task_id}\").json()\n\ndef get_artifact(task_id):\n    # 取回最终 Artifact 产出, 供上层继续编排\n    return http.get(f\"/tasks/{task_id}/artifact\").json()",
  "complexity": "说明——发现与单次调用为 O(1)（读 Card + 一次 Task），但端到端编排随参与 Agent 数 A 与依赖深度 D 增长为 O(A × D) 次交互；瓶颈在网络往返与对方推理延迟，而非本地计算，因此重试、超时与并行扇出是主要优化点。",
  "beginnerSummary": "大白话——A2A 就像给每个 AI 助手发一张“名片”，上面写清楚它能干啥、怎么联系。当主 AI 遇到自己不会的活儿，就照着名片把任务派给对应的专家 AI，专家干完把成果回传；大家不用知道彼此内部怎么想，只要按统一格式交接就行，像公司里不同部门按流程协作。",
  "diagram": " Agent A(编排方)\n    │\n    │ Task\n    ▼\n Agent B ──Artifact(结果)──► A\n    │\n    │ (发现 registry: 读 Card)\n    ▼\n Agent C ──Message(进度)──► A",
  "derivation": [
    "为什么需要：单个 Agent 能力与知识有限，复杂任务需多专家协作；但各 Agent 由不同团队用不同框架构建，若每对都私有对接，集成成本随数量平方爆炸，亟需统一“Agent 怎么找彼此、怎么交任务”的标准。",
    "怎么实现：定义 Agent Card（能力自描述）、Task（有状态任务）、Message（过程消息）、Artifact（最终产物）四件套；客户端读 Card 发现能力，建 Task 派活，服务端以 Message 流式回报、以 Artifact 交付，全程用 JSON/HTTP 或流式传输。",
    "有什么代价：引入协议层后增加序列化、鉴权、状态跟踪开销；跨组织调用带来网络延迟与可用性问题；需要治理 Agent 的身份、权限与信任边界，否则易被滥用或形成环路调用放大成本。",
    "怎么评测：看任务完成率、端到端时延、跨 Agent 调用成功率与降级率；并发压测下关注扇出吞吐与故障传播范围，验证协议在真实多智能体拓扑下的鲁棒性。"
  ],
  "edgeCases": [
    "Agent Card 过期/不可达：发现阶段需缓存失效与重试，否则编排方拿着旧能力清单派活会失败。",
    "长任务流式中断：网络抖动导致 Message 丢失，需断点续传或任务状态查询而非从头重来。",
    "循环委派（A 调 B、B 又调 A）：需调用深度上限或环路检测，防止无限递归与成本失控。",
    "Artifact 格式不一致：双方对“产物”schema 理解不同，需显式 schema 协商或结果校验。"
  ],
  "pitfalls": [
    "把 A2A 当无状态函数调用：忽略 Task 生命周期与失败状态，导致客户端误以为成功而继续下游。",
    "与 MCP 混淆使用场景：用 A2A 去接一个数据库工具（应走 MCP），或用 MCP 去做 Agent 间编排（应走 A2A），职责错位。",
    "不做鉴权与速率限制：开放 Agent 易被刷任务、形成放大攻击，需在协议边缘加网关防护。"
  ],
  "prerequisites": [
    "Agent 基础与工具调用：理解单个 Agent 的规划-执行循环。",
    "HTTP/JSON 与 RPC 基础：理解请求-响应与流式通信。",
    "微服务/分布式编排概念：理解服务发现、扇出与降级。"
  ],
  "workedExample": [
    "场景一（跨团队客服）：客服 Agent 接到“查物流”请求，读物流 Agent 的 Card 后建 Task 传入订单号，物流 Agent 回 Artifact（轨迹），客服 Agent 汇总成话术；两个 Agent 分属不同团队却零定制对接。",
    "场景二（旅行规划）：编排方并行派 Task 给航班/酒店两个 Agent，各返回 Artifact（3 个航班/5 个房源），再综合；航班超时时依据 Task 状态降级用缓存，体现有状态任务与容错。"
  ],
  "lineByLine": [
    "def discover(card_url): GET 对方 Agent Card 并解析能力清单；作用是零代码对接前先“看清对方能干什么”，避免盲调。",
    "def create_task(agent, input): 按协议 POST 一个 Task 并返回 task_id；这是跨 Agent 调用的起点，建立可追踪的状态机。",
    "def poll(task_id): 查询 Task 当前状态与已到 Message；为什么：支持流式/异步结果，避免客户端阻塞等待慢任务。",
    "def get_artifact(task_id): 取回最终 Artifact 产出；闭合一次 A2A 协作，供上层继续编排或返回用户。"
  ],
  "codeNotes": [
    "真实 A2A 还需鉴权头、超时与退避重试、以及环路深度限制；Agent Card 最好带版本号以便灰度与向后兼容。"
  ],
  "followUps": [
    {
      "question": "A2A 和 MCP 到底怎么分工，会不会重叠？",
      "answer": "不重叠、互补：MCP（Model Context Protocol）解决“Agent 如何接入工具、数据源、外部系统”，是 Agent 对资源的接口；A2A 解决“Agent 如何对接另一个 Agent”，是 Agent 对 Agent 的编排接口。简单说 MCP 接工具、A2A 接同事，一个 Agent 可以既用 MCP 接数据库、又用 A2A 调别的 Agent。"
    },
    {
      "question": "Agent Card 里一般要写哪些关键信息？",
      "answer": "至少包含 Agent 名称与描述、可提供的能力/技能列表、每个 Task 的输入输出 schema、通信端点与支持的传输方式（如 HTTP/SSE）、鉴权要求与版本号；消费方据此决定是否调用以及如何构造合法 Task。"
    }
  ],
  "followUpAnswers": [
    "不重叠、互补：MCP（Model Context Protocol）解决“Agent 如何接入工具、数据源、外部系统”，是 Agent 对资源的接口；A2A 解决“Agent 如何对接另一个 Agent”，是 Agent 对 Agent 的编排接口。简单说 MCP 接工具、A2A 接同事，一个 Agent 可以既用 MCP 接数据库、又用 A2A 调别的 Agent。",
    "至少包含 Agent 名称与描述、可提供的能力/技能列表、每个 Task 的输入输出 schema、通信端点与支持的传输方式（如 HTTP/SSE）、鉴权要求与版本号；消费方据此决定是否调用以及如何构造合法 Task。"
  ]
};
