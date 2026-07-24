export default {
  "kind": "concept",
  "id": "agent-orchestration",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 编排框架（LangChain / LlamaIndex 等）",
  "prompt": "LangChain / LlamaIndex 这类 Agent 编排框架解决了什么问题？",
  "quickAnswer": "编排框架把\"模型调用、工具、记忆、检索、链路\"封装成可组合的原语，让开发者用声明式图/链拼装 Agent，而不必手写所有胶水代码。它们提供统一抽象(LLM/Retriever/Tool/VectorStore)、内置常见模式(ReAct、RAG)与可观测钩子，降低工程门槛也便于维护。",
  "approach": "选抽象原语→声明式拼装链路→接工具/记忆→运行与观测。",
  "explanationFocus": "是什么：编排框架是提供 LLM、工具、记忆、检索等可组合抽象与常见 Agent 模式的工程库，用来快速搭建与维护 Agent 系统。",
  "bruteForce": "从零手写 HTTP 调用、解析、状态管理：重复劳动多、易出 bug、难扩展。",
  "derivation": [
    "为什么需要：Agent 由大量重复胶水代码组成，框架标准化这些模式提升效率与一致性。",
    "怎么实现：用 Chain/Graph 表达步骤，Tool/Retriever 对接外部能力，Memory 管理状态，Callback 做日志与中断。",
    "有什么代价：抽象泄漏时难调试、版本易碎、过度封装掩盖性能问题；引入额外依赖。",
    "怎么评测：看开发速度、可维护性、运行时开销与可观测性。"
  ],
  "invariant": "框架只是编排外壳，核心决策仍由模型与外部工具完成，框架不替代它们。",
  "walkthrough": "用 LangChain 搭 RAG Agent：VectorStoreRetriever + Tool + ReAct agent + CallbackHandler。约 30 行声明式代码替代数百行手写胶水。",
  "edgeCases": [
    "框架升级破坏旧 API：需锁版本与测试。",
    "抽象过厚难定位性能瓶颈。",
    "自定义逻辑与框架约定冲突。"
  ],
  "code": "def build_agent(retriever, llm):\n    tool = RetrieverTool(retriever)            # 把检索包成工具\n    agent = create_react_agent(llm, [tool])    # 复用框架模式\n    return AgentExecutor(agent, callbacks=[Logger()])",
  "codeNotes": [
    "优先用框架内置模式而非自造。",
    "Callback 是观测关键入口。"
  ],
  "complexity": "框架带来少量运行时开销；主要成本仍在模型与工具调用。",
  "followUps": [
    {
      "question": "框架会让性能变差吗？",
      "answer": "有轻微封装开销，但瓶颈通常是模型/检索；真正的坑是抽象泄漏导致难优化。"
    },
    {
      "question": "何时不该用框架？",
      "answer": "需求极简或需极致控制/低延迟时，轻量自研反而更可控。"
    }
  ],
  "followUpAnswers": [
    "瓶颈在模型，框架开销小。",
    "极简/极致控制可自研。"
  ],
  "pitfalls": [
    "被框架抽象绑架，出问题难调试。",
    "无脑堆链导致可维护性崩坏。"
  ],
  "beginnerSummary": "编排框架像乐高套装：它把\"马达(模型)、轮子(工具)、积木(记忆)\"做成标准件，你照图纸拼起来就成小车(Agent)，不用从削木头开始。",
  "prerequisites": [
    "理解 Agent 基本组成。",
    "有要接入的工具/检索。",
    "接受框架的抽象约定。"
  ],
  "workedExample": [
    "Retriever 包装为 Tool 接入 Agent。",
    "用框架内置 ReAct 少写胶水。"
  ],
  "lineByLine": [
    "把检索器封装成工具。",
    "用框架创建 ReAct Agent。",
    "挂上日志回调。",
    "由 Executor 驱动运行。"
  ],
  "diagram": "[LLM] <-> [Agent] <-> [Tools]\n              <-> [Memory]/[Retriever]"
};
