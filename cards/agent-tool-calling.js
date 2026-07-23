export default {
  "kind": "concept",
  "id": "agent-tool-calling",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Tool / Function Calling 原理",
  "prompt": "Agent 里的 Tool / Function Calling 是怎么实现的？",
  "quickAnswer": "Function Calling 由模型厂商在训练时学会\"按 JSON Schema 生成结构化调用请求\"；运行时先把工具清单(名称/描述/参数 schema)放进 system prompt，模型输出含函数名与参数的 tool_call，应用层负责校验参数、真正执行并把结果回传。它把\"自然语言意图\"映射为\"可执行的 API 调用\"。",
  "approach": "声明工具 schema→模型选工具并填参→应用校验执行→结果回传模型。",
  "explanationFocus": "是什么：Function Calling 是让 LLM 按给定 JSON Schema 输出\"调用哪个函数+参数\"的结构化请求，由外部执行后再把结果喂回模型的机制。",
  "bruteForce": "用正则从自由文本里抠\"调用意图\"，脆弱且易错，参数难以约束。",
  "derivation": [
    "为什么需要：模型本身不能执行代码/查数据库/发请求，需把意图转成可靠的结构化动作。",
    "怎么实现：在请求里带 tools 数组(每个含 name/description/parameters JSON Schema)；模型返回 tool_calls；本地用 pydantic/校验器检查参数后执行。",
    "有什么代价：schema 设计影响命中率；多工具选择易出错；参数校验与执行权限需管控。",
    "怎么评测：看工具选择准确率、参数填充正确率、端到端任务成功率。"
  ],
  "invariant": "模型只决定\"调什么+填什么\"，真正执行永远在沙箱/受控环境完成。",
  "walkthrough": "查汇率：模型见 tools=[get_rate]→输出 tool_call{get_rate,{\"from\":\"USD\",\"to\":\"CNY\"}}→应用调用 API 得 7.2→作为 observation 回传。共 1 次调用、2 个参数。",
  "edgeCases": [
    "参数类型/范围非法：需 schema 校验与纠正。",
    "多个工具语义相近：需清晰描述区分。",
    "工具执行异常：需捕获并以 observation 形式回传错误。"
  ],
  "code": "def call_tool(model_out, registry):\n    for tc in model_out.tool_calls:\n        fn = registry.get(tc.name)             # 受控查找\n        args = schema_validate(fn.schema, tc.args)\n        if args is None:\n            yield f\"error: bad args for {tc.name}\"\n            continue\n        yield fn(**args)                        # 真正执行",
  "codeNotes": [
    "注册表白名单防止任意代码执行。",
    "参数先校验再执行，避免注入。"
  ],
  "complexity": "每次工具调用 = 1 次模型往返 + 1 次外部执行；与工具数量近似对数相关（选择难度）。",
  "followUps": [
    {
      "question": "Function Calling 和 RAG 关系？",
      "answer": "RAG 常作为其中一个 tool（检索工具）被调用；Calling 是通用动作机制，RAG 是具体能力。"
    },
    {
      "question": "如何防工具被滥用？",
      "answer": "用白名单注册表、参数 schema 校验、最小权限与执行沙箱，敏感动作加 human-in-the-loop。"
    }
  ],
  "followUpAnswers": [
    "RAG 可包装成一个 tool。",
    "白名单+沙箱+权限管控。"
  ],
  "pitfalls": [
    "让模型直接执行任意代码而非经注册表。",
    "工具描述不清导致选错工具或参数错误。"
  ],
  "beginnerSummary": "Function Calling 像服务员点单：你(模型)看菜单(工具清单)决定点哪道菜、要什么口味(参数)，后厨(应用)按单做菜并把菜(结果)端回来，你再决定下一步。",
  "prerequisites": [
    "工具需有清晰的 JSON Schema 描述。",
    "应用层能安全执行函数。",
    "需把执行结果回传给模型。"
  ],
  "workedExample": [
    "模型输出 tool_call 而非自然语言。",
    "参数先用 schema 校验再执行。"
  ],
  "lineByLine": [
    "把工具清单交给模型。",
    "模型返回 tool_calls(名称+参数)。",
    "按注册表查函数并校验参数。",
    "执行并把结果回传模型。"
  ],
  "diagram": "Model <-> tools[schema] -> app executes -> Observation -> Model"
};
