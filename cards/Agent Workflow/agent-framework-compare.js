export default {
  "id": "agent-framework-compare",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 框架选型：LangGraph / CrewAI / AutoGen / 自研",
  "prompt": "在 LangGraph、CrewAI、AutoGen 和自研之间，应该怎么为业务选型 Agent 框架？",
  "quickAnswer": "选型看\"控制流形态\"：需要显式、可持久化、可断点恢复的有向图流程选 LangGraph（状态机）；需要多角色分工协作、强调角色与任务委派选 CrewAI；需要多 Agent 自由对话/协商编排选 AutoGen。当你的流程高度定制、对延迟/可观测/合规有强约束且团队有工程能力时自研更划算。MCP 是\"工具接入标准\"，与框架正交——框架负责编排，MCP 负责把工具统一暴露。",
  "approach": "先定控制流形态(图/角色/对话) → 匹配框架 → 评估定制与合规需求 → 决定是否自研 → 用 MCP 接入工具。",
  "explanationFocus": "是什么：Agent 框架选型是根据任务的控制流形态（图式状态机、角色分工、对话协商）与团队的定制/合规诉求，在 LangGraph、CrewAI、AutoGen 与自研之间做权衡，并用 MCP 作为统一的工具接入层。",
  "bruteForce": "不管业务形态一律用通用 while 循环硬写多 Agent 协作：流程不可视、难恢复、难复用，迭代成本随规模爆炸。",
  "invariant": "框架只解决\"编排\"，工具/数据的接入应当走与框架解耦的标准协议（如 MCP），避免把业务逻辑焊死在某个框架的适配器里。",
  "walkthrough": "以\"周报生成\"业务为例：流程固定为 取数→汇总→润色→审核（4 节点、顺序+1 个条件分支），并发约 100 个用户任务/天，要求失败可断点续跑——选 LangGraph，把节点画成图、状态落库。另一个\"市场调研\"任务需要 研究员/写手/审校 三个角色循环互审——选 CrewAI 的 role/task 模型更顺手。若业务是客服多 Agent 自由协商（如退款 bot 与物流 bot 对话），AutoGen 的群聊编排更合适。当公司要求所有工具调用走自研审计网关且延迟 p99<200ms，现成框架适配成本高，则自研薄编排层 + MCP 接工具。",
  "derivation": [
    "为什么需要：手搓多 Agent 流程不可视、难恢复、难复用；框架把常见编排模式沉淀成可组合原语。",
    "怎么实现：按控制流选——图式用 LangGraph(节点+边+状态)、角色用 CrewAI(role/task/crew)、对话用 AutoGen(群聊/代理)；自研则抽 DAG/状态机 + 事件总线；工具统一经 MCP server 暴露。",
    "有什么代价：框架有学习曲线与抽象泄漏；重框架引入依赖与延迟；选错形态后期迁移成本高；自研要养维护成本。",
    "怎么评测：用真实业务流做 PoC，比开发速度、可观测性、断点恢复、p99 延迟与团队上手成本。"
  ],
  "edgeCases": [
    "流程需长时间挂起等人工，LangGraph 的 checkpoint 更关键，CrewAI 较弱。",
    "角色间循环依赖导致死锁，需在框架层设最大轮次。",
    "框架默认工具适配不满足内网合规，需自研 MCP 桥接。"
  ],
  "code": "def choose_framework(control_flow, needs):\n    if control_flow == \"graph\" and needs.resumable:\n        return \"LangGraph\"          # 状态机+checkpoint\n    if control_flow == \"roles\":\n        return \"CrewAI\"             # role/task 分工\n    if control_flow == \"dialogue\":\n        return \"AutoGen\"            # 多代理群聊\n    if needs.compliance and needs.low_latency:\n        return \"self-built + MCP\"   # 薄编排+标准工具层",
  "codeNotes": [
    "框架选型的核心是\"控制流形态匹配\"，而非功能清单长短。",
    "MCP 与编排框架正交，可作为统一工具层降低锁定风险。"
  ],
  "complexity": "框架本身运行开销小（图遍历/事件分发 O(节点数)）；主要成本在框架带来的抽象与依赖体积，以及 Agent 自身的 LLM/工具调用。",
  "followUps": [
    {
      "question": "MCP 和 Agent 框架是什么关系，能混用吗？",
      "answer": "MCP 是工具/数据接入的标准协议，与编排框架正交。任何框架（LangGraph/CrewAI/AutoGen）都能通过 MCP server 统一暴露工具，混用可降低对单一框架工具生态的锁定。"
    },
    {
      "question": "什么时候一定要自研而不是用现成框架？",
      "answer": "当控制流高度定制、对 p99 延迟/可观测/合规审计有强约束，且现成框架的抽象带来不可接受的适配成本时；或团队已有成熟编排/事件基础设施，自研薄层反而更快更可控。"
    }
  ],
  "followUpAnswers": [
    "MCP 是正交工具层，任意框架都能经它接工具，降锁定。",
    "强合规/低延迟/高度定制且团队有基建时自研更划算。"
  ],
  "pitfalls": [
    "为\"赶时髦\"用对话框架做本应确定图的流程，调试地狱。",
    "把业务强耦合进某框架专属 API，后续迁移被锁死。"
  ],
  "beginnerSummary": "选框架像选交通工具：固定路线通勤（确定性流程）骑共享单车画好路线最稳（LangGraph）；多人分工搬货（角色协作）用货运队（CrewAI）；几个人自由商量办事（多 Agent 对话）用微信群（AutoGen）。MCP 是统一的\"插座标准\"，不管开啥车都能接同一个充电桩。",
  "prerequisites": [
    "理解状态机/DAG 与事件驱动编排。",
    "了解 MCP 等工具接入标准。",
    "清楚业务的控制流形态与合规要求。"
  ],
  "workedExample": [
    "周报流水线（4 节点顺序图）选 LangGraph，状态落库支持断点续跑。",
    "三角色互审的调研任务选 CrewAI，少写大量协作样板。"
  ],
  "lineByLine": [
    "先抽象业务的控制流：是确定图、角色分工还是自由对话。",
    "对照三框架核心原语，选最贴合的那一个。",
    "把工具/数据经 MCP 暴露，使框架与后端解耦。",
    "用真实 PoC 验证断点恢复与 p99 延迟后再定。"
  ],
  "diagram": "控制流形态 ──▶ 图式 ──▶ LangGraph\n     │\n     ├──▶ 角色分工 ──▶ CrewAI\n     │\n     ├──▶ 对话协商 ──▶ AutoGen\n     │\n     └──▶ 强合规/低延迟 ──▶ 自研 + MCP\n工具层：任意框架 ──▶ MCP server ──▶ 统一工具/数据"
};
