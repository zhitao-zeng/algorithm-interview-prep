export default {
  "kind": "concept",
  "id": "agent-tool-calling",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Tool / Function Calling 原理",
  "prompt": "Agent 里的 Tool / Function Calling 是怎么实现的？",
  "quickAnswer": "Function Calling 由模型厂商在训练时学会\"按 JSON Schema 生成结构化调用请求\"；运行时先把工具清单（名称/描述/参数 schema）放进 system prompt，模型输出含函数名与参数的 tool_call，应用层负责校验参数、真正执行并把结果回传。它把\"自然语言意图\"映射为\"可执行的 API 调用\"，且执行始终在受控环境完成。",
  "approach": "四步流水线：① 声明工具 schema（name/description/parameters JSON Schema）；② 模型选工具并填参，输出 tool_calls；③ 应用按注册表白名单查函数、用 schema 校验参数后执行（沙箱内）；④ 把结果作为 observation 回传模型，模型决定下一步或作答。核心是\"模型只决定调什么+填什么，执行永远在受控层\"。",
  "explanationFocus": "是什么：Function / Tool Calling 是让 LLM 按给定 JSON Schema 输出\"调用哪个函数 + 填什么参数\"的结构化请求的机制；真正执行由应用层（受控环境）完成，再把结果回传给模型。它把\"自然语言意图\"可靠地映射为\"可执行的 API 调用\"，是 Agent 调用外部能力的通用底座（RAG、查库、发消息等都包装成 tool）。",
  "bruteForce": "用正则从自由文本里抠\"调用意图\"：脆弱、参数难以约束、格式稍变就失败，且无法保证类型/范围合法。相比之下 Function Calling 由模型原生支持、输出可机器校验，可靠性天差地别。",
  "derivation": [
    "为什么需要：模型本身不能执行代码/查数据库/发请求，需把意图转成可靠的结构化动作，且参数要受约束。",
    "怎么实现：在请求里带 tools 数组（每个含 name/description/parameters JSON Schema）；模型返回 tool_calls；本地用 pydantic/校验器检查参数后执行。",
    "有什么代价：schema 设计影响命中率（描述不清→选错工具/填错参）；多工具选择易出错；参数校验与执行权限需严格管控。",
    "怎么评测：看工具选择准确率、参数填充正确率、端到端任务成功率，以及异常时能否优雅回传错误。"
  ],
  "invariant": "铁律：模型只决定\"调什么 + 填什么\"，真正执行永远在沙箱/受控环境完成（绝不让模型直接执行任意代码）。参数先校验再执行，是防注入与越权的安全底线。",
  "walkthrough": "具体跑一次：用户问\"1 美元换多少人民币？\"。运行时把 tools=[get_rate]（含参数 schema {from:string, to:string}）放进请求；模型输出 tool_call = {get_rate, {\"from\":\"USD\",\"to\":\"CNY\"}} → 应用按注册表查到 get_rate、用 schema 校验参数合法 → 调用汇率 API 得 7.2 → 把\"7.2\"作为 Observation 回传模型 → 模型据此组织自然语言回答。全程 1 次调用、2 个参数。",
  "edgeCases": [
    "参数类型/范围非法：如 to 字段给了数字而非币种字符串，需 schema 校验并纠正或回传错误 Observation。",
    "多个工具语义相近：描述区分度不足时模型易选错，需把 description 写清适用场景与差异。",
    "工具执行异常：超时/报错需捕获，并以 Observation 形式把错误回传，让模型决定重试或换工具。",
    "无合适工具：模型不应强行调用，应学会\"无 tool_call\"直接作答或向用户澄清。"
  ],
  "code": "def call_tool(model_out, registry):\n    for tc in model_out.tool_calls:\n        fn = registry.get(tc.name)             # 受控查找\n        args = schema_validate(fn.schema, tc.args)\n        if args is None:\n            yield f\"error: bad args for {tc.name}\"\n            continue\n        yield fn(**args)                        # 真正执行",
  "codeNotes": [
    "注册表白名单防止任意代码执行：模型只能调注册过的函数，杜绝 prompt 注入越权。",
    "参数先校验再执行，避免注入：schema_validate 是安全闸门。",
    "草图用 generator yield 逐个回传结果；真实还应捕获异常并以 Observation 形式回传错误。"
  ],
  "complexity": "每次工具调用 = 1 次模型往返 + 1 次外部执行；与工具数量近似对数相关（选择难度随工具数缓增）。整体成本是\"调用轮数 × 单轮开销\"，优化重点是减少轮数与精准选对工具。",
  "followUps": [
    {
      "question": "Function Calling 和 RAG 关系？",
      "answer": "RAG 常作为其中一个 tool（检索工具）被调用——模型决定\"是否需要检索、检索什么\"，应用执行检索并把文档作为 Observation 回传。Calling 是通用的\"动作机制\"，RAG 是跑在它之上的具体能力；二者是\"机制 vs 能力\"的包含关系。"
    },
    {
      "question": "如何防工具被滥用？",
      "answer": "四层防护：① 白名单注册表，模型只能调列出来的函数；② 参数 schema 校验，拦截类型/范围非法输入；③ 最小权限与执行沙箱，工具本身不接触敏感资源；④ 敏感动作（发邮件、扣款）加 human-in-the-loop 确认。这样即便 prompt 被注入，危害也被框死在白名单内。"
    },
    {
      "question": "模型选错工具怎么办？",
      "answer": "主要靠把 description 写精确（含适用场景、参数示例、与其他工具的差别）；其次可在应用层做一层\"工具路由\"校验，对明显不匹配的调用返回引导性错误 Observation 让模型重试；多工具时也可先做一轮\"选工具\"的显式分类再填参，提升准确率。"
    }
  ],
  "followUpAnswers": [
    "RAG 常作为其中一个 tool（检索工具）被调用——模型决定\"是否需要检索、检索什么\"，应用执行检索并把文档作为 Observation 回传。Calling 是通用的\"动作机制\"，RAG 是跑在它之上的具体能力；二者是\"机制 vs 能力\"的包含关系。",
    "四层防护：① 白名单注册表，模型只能调列出来的函数；② 参数 schema 校验，拦截类型/范围非法输入；③ 最小权限与执行沙箱，工具本身不接触敏感资源；④ 敏感动作（发邮件、扣款）加 human-in-the-loop 确认。这样即便 prompt 被注入，危害也被框死在白名单内。",
    "主要靠把 description 写精确（含适用场景、参数示例、与其他工具的差别）；其次可在应用层做一层\"工具路由\"校验，对明显不匹配的调用返回引导性错误 Observation 让模型重试；多工具时也可先做一轮\"选工具\"的显式分类再填参，提升准确率。"
  ],
  "pitfalls": [
    "让模型直接执行任意代码而非经注册表：等于把命令执行权交给模型，极易被 prompt 注入劫持，必须走白名单注册表。",
    "工具描述不清导致选错工具或参数错误：description 是模型的\"说明书\"，潦草必翻车。",
    "参数未校验就执行：恶意/畸形输入可能触发注入或越权，先 schema 校验再执行是底线。"
  ],
  "beginnerSummary": "Function Calling 像服务员点单：你（模型）看菜单（工具清单）决定点哪道菜、要什么口味（参数），后厨（应用）按单做菜并把菜（结果）端回来，你再决定下一步。关键是所有\"做菜\"都在后厨（沙箱）进行，模型只负责\"点单\"，绝不直接进厨房动火。",
  "prerequisites": [
    "工具需有清晰的 JSON Schema 描述：name/description/parameters 越精确，模型命中率越高。",
    "应用层能安全执行函数：有注册表、沙箱与权限管控，而非任意执行。",
    "需把执行结果回传给模型：observation 回灌让模型基于真实结果继续。"
  ],
  "workedExample": [
    "模型输出 tool_call 而非自然语言：如 {get_rate,{\"from\":\"USD\",\"to\":\"CNY\"}}，结构可被代码直接解析。",
    "参数先用 schema 校验再执行：若 from 缺失或类型错，立即返回错误 Observation，模型可补填。",
    "错误自愈：若 API 超时，Observation=\"error: timeout\"，模型改调备用源或告知用户，而非卡死。"
  ],
  "lineByLine": [
    "把工具清单交给模型：tools 数组含每个工具的 schema，模型据此决策。",
    "模型返回 tool_calls（名称+参数）：这是结构化的\"点单\"，可被程序解析。",
    "按注册表查函数并校验参数：白名单防任意执行，schema 校验防畸形输入。",
    "执行并把结果回传模型：在沙箱内运行，observation 回灌驱动下一轮。"
  ],
  "diagram": "Model <-> tools[schema] -> app executes -> Observation -> Model"
};
