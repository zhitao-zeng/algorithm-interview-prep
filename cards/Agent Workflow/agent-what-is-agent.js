export default {
  "kind": "concept",
  "id": "agent-what-is-agent",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "什么是 Agent / Agent Workflow",
  "prompt": "什么是 Agent / Agent Workflow，它和常规的机器学习 pipeline 有什么区别？",
  "quickAnswer": "Agent 是以 LLM 为「大脑」、能自主感知环境、调用工具并采取行动来完成目标的系统；Agent Workflow 则是把「规划→行动→观察→反思」串成可循环的流程。与常规 pipeline（数据→模型→固定输出，链路写死、无自主决策）相比，Agent 强调运行时动态决策、使用外部工具、并根据反馈迭代。典型如订机票 Agent：自己拆步骤、查工具、看结果、再决策，而非机械执行写死流水线。",
  "approach": "运行时循环：目标拆解 → 模型决策下一步动作（思考/调工具/返回）→ 执行动作并观察环境反馈 → 把结果回灌状态 → 再进入下一轮决策，直到目标完成或步数上限。工程上需维护「目标 + 历史 + 记忆」的状态，并支持 human-in-the-loop 在关键处暂停确认。",
  "explanationFocus": "是什么：Agent（智能体）是以 LLM 为「决策大脑」、能够自主感知环境、调用外部工具（搜索、代码执行、数据库、API）并采取行动来逐步达成目标的系统；Agent Workflow（智能体工作流）则是把「规划 → 行动 → 观察 → 反思」组织成可循环、可编排的流程的方法。与常规机器学习 pipeline（数据→模型→固定输出，无自主决策）相比，Agent 强调运行时的动态决策、工具使用与基于反馈的迭代。",
  "bruteForce": "固定 pipeline：数据进模型、模型出结果，链路写死，遇到意外输入即失败，无法借助外部实时信息（如查最新股价、查天气），也不能根据中间结果调整策略。它本质是「单次前向」，没有「感知—行动」闭环，难以胜任跨系统、多步、需纠错的真实任务。",
  "derivation": [
    "为什么需要：真实任务常跨多个系统、需要实时外部信息、需多步推理与纠错，单步模型产出（一次前向）无法胜任；固定 pipeline 又缺乏应对意外的灵活性。",
    "怎么实现：以 LLM 作控制器，维护「目标/历史/记忆」状态；每轮让模型决定「思考 / 调哪个工具 / 是否返回」，执行动作并把观察（observation）回灌状态，再进入下一轮；可插入反思（reflection）步骤复盘已做决策。",
    "有什么代价：每轮都要 LLM 推理 + 工具执行，延迟与 token 成本高；易出错（工具调用格式错、结果解析错）、易陷入循环；需要工程化控制循环上限、失败恢复与可观测性（日志/trace）。",
    "怎么评测：看任务完成率（success rate）、平均步数（efficiency）、成本（token/＄）与可恢复性（遇错能否重试）；常用 Agent 基准（如 WebArena、ToolBench）与人工轨迹评审结合。"
  ],
  "invariant": "核心不变式：每一步决策都基于「当前真实状态」（目标 + 观察 + 记忆），而非凭空生成；且动作执行后的观察必须回灌状态，使下一轮决策建立在事实之上。一旦脱离真实状态（如模型开始「空想」工具结果），Agent 就会失效。",
  "walkthrough": "例：订机票 Agent。1) 规划：把目标拆成「查价 → 比价 → 下单」三步；2) 调用 search 工具查航班；3) 观察返回的价格列表；4) 模型基于观察再决策（选最便宜且时间合适的）；5) 调 booking 工具下单。共涉及 3 类子任务、约 5 次工具调用，期间若工具返回「无票」则自动换方案，体现动态决策。",
  "edgeCases": [
    "需用户确认时（如付款、发邮件）：应在 human-in-the-loop 处暂停，而非擅自动作，避免不可逆操作。",
    "工具不可用/超时：需降级或换工具（如 search 挂了换另一个检索源），不能死等或崩溃。",
    "目标含糊：应先向用户澄清再执行，避免南辕北辙地空转多步。",
    "上下文溢出：长任务历史撑爆窗口，需摘要压缩或外部记忆（vector store）兜底。"
  ],
  "code": "def run_agent(goal, tools, max_steps=10):\n    state = {\"goal\": goal, \"history\": []}\n    for step in range(max_steps):\n        action = llm_decide(state, tools)      # 基于真实状态决策\n        if action is None:\n            return finalize(state)\n        obs = execute(tools, action)           # 与环境交互\n        state[\"history\"].append((action, obs)) # 回灌状态\n    return None",
  "codeNotes": [
    "状态回灌（history.append）是 Agent 与 pipeline 的本质区别：没有它模型就「失忆」且可能编造观察。",
    "决策必须读取 history：防止重复调用同一工具或基于过时信息决策；可加反思步骤复盘。",
    "max_steps 截断是安全阀：防止工具持续报错或模型循环导致无限烧 token。"
  ],
  "complexity": "运行开销随「步数 × 工具调用数」线性增长，且受上下文窗口约束（历史越长越占 token）。每轮需一次 LLM 推理 + 一次工具执行，延迟与成本显著高于单次预测；长任务还需摘要/记忆压缩来对抗上下文溢出。工程上还要处理并发、重试、失败恢复与防循环（max_steps 截断）。",
  "followUps": [
    {
      "question": "Agent 一定需要 LLM 吗？",
      "answer": "核心是「自主决策 + 环境交互 + 基于反馈迭代」的闭环，LLM 是当前最通用、最灵活的控制器，但并非唯一选择。规则引擎、强化学习策略网络、甚至经典规划器（planner）都可以作为控制器，只要它能根据状态选择动作并感知结果。LLM 的优势在于能处理自然语言目标、调用非结构化工具、做开放域推理，所以现代 Agent 大多以 LLM 为核心，但严格说「Agent」这个概念早于 LLM。"
    },
    {
      "question": "Workflow 和 Agent 是一回事吗？",
      "answer": "不是。Workflow 偏向固定编排——用图/状态机把若干步骤写死（如「先 A 再 B，B 失败走 C」），可控、可预测但灵活性低。Agent 偏向运行时自主决策——下一步做什么由模型根据观察动态决定，灵活但更难预测与调试。现代生产系统常混合两者：用 Workflow 框定大流程、在需要灵活判断的节点嵌入 Agent 自主决策，兼顾可控与智能。"
    },
    {
      "question": "为什么 Agent 容易「编造工具结果」？",
      "answer": "因为 Agent 在「决策 → 执行 → 观察」闭环中，若观察没有被正确回灌到 state（history），或工具返回解析失败被忽略，模型下一轮就缺乏真实反馈，倾向于「脑补」一个看起来合理的工具结果来推进任务，这就是经典的 hallucinated observation。防范办法是强制 observation 回灌、对工具返回做校验、失败即重试而非绕过，并在循环里加反思步骤核对事实。"
    }
  ],
  "followUpAnswers": [
    "核心是「自主决策 + 环境交互 + 基于反馈迭代」的闭环，LLM 是当前最通用、最灵活的控制器，但并非唯一选择。规则引擎、强化学习策略网络、甚至经典规划器（planner）都可以作为控制器，只要它能根据状态选择动作并感知结果。LLM 的优势在于能处理自然语言目标、调用非结构化工具、做开放域推理，所以现代 Agent 大多以 LLM 为核心，但严格说「Agent」这个概念早于 LLM。",
    "不是。Workflow 偏向固定编排——用图/状态机把若干步骤写死（如「先 A 再 B，B 失败走 C」），可控、可预测但灵活性低。Agent 偏向运行时自主决策——下一步做什么由模型根据观察动态决定，灵活但更难预测与调试。现代生产系统常混合两者：用 Workflow 框定大流程、在需要灵活判断的节点嵌入 Agent 自主决策，兼顾可控与智能。",
    "因为 Agent 在「决策 → 执行 → 观察」闭环中，若观察没有被正确回灌到 state（history），或工具返回解析失败被忽略，模型下一轮就缺乏真实反馈，倾向于「脑补」一个看起来合理的工具结果来推进任务，这就是经典的 hallucinated observation。防范办法是强制 observation 回灌、对工具返回做校验、失败即重试而非绕过，并在循环里加反思步骤核对事实。"
  ],
  "pitfalls": [
    "把写死的固定 pipeline 当成 Agent：没有「感知—行动—反馈」闭环与运行时决策，遇意外即失败，并不具备 Agent 特性。",
    "不回灌状态导致模型「失忆」式重复或空想：若观察不写回历史，模型会重复调同一工具或编造工具结果（hallucinated observation），是 Agent 最常见的失效模式。",
    "缺乏步数上限与失败恢复：一旦陷入循环或工具持续报错，会无限烧 token 且不产出。"
  ],
  "beginnerSummary": "Agent 像一个会自己想办法的小助手：你给个目标，它自己拆步骤、遇到不懂的去查工具、看到结果再决定下一步，而不是按一条写死的流水线机械执行。普通 pipeline 像自动售货机（投币出饮料，坏了就卡住），Agent 像真客服（会变通、会求助、会纠错）。",
  "prerequisites": [
    "LLM 可作决策控制器：理解模型能输出「结构化动作」（如 JSON 指定工具与参数）而不仅是自然语言。",
    "有可调用的外部工具/API：理解 Agent 通过工具突破模型静态知识边界（查实时信息、执行代码）。",
    "需要维护运行时的状态（目标/历史/记忆）：理解闭环依赖状态回灌。",
    "循环与终止条件：理解 Agent 需 max_steps 等机制防止无限循环。"
  ],
  "workedExample": [
    "查机票：需多步工具调用（search→比价→booking）与基于返回结果的动态决策，遇「无票」自动换方案。",
    "目标模糊（「帮我安排周末」）：Agent 先向用户澄清偏好（城市/预算）再执行，避免空转。",
    "代码 Agent：调 code interpreter 执行、观察报错、再改代码重跑，形成「写→跑→改」闭环。"
  ],
  "lineByLine": [
    "初始化目标与空历史状态：state 保存 goal 与 history，是 Agent 闭环的「记忆基底」。",
    "每轮让 LLM 基于 state 决策下一步动作（action）：决策必须读取 history，避免使用幻觉或重复动作。",
    "执行动作并把观察写入 history：obs = execute(tools, action)，state['history'].append((action, obs)) 是关键回灌。",
    "无动作（action is None）时收尾返回；超 max_steps 则截断：保证循环必然终止、成本可控。"
  ],
  "diagram": "Goal -> Decide -> Act -> Observe -> Decide -> ... -> Done\n(状态在每轮被回灌)"
};
