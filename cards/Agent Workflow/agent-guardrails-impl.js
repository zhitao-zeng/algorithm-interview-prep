export default {
  "id": "agent-guardrails-impl",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Guardrails 工程落地：给 Agent 套上安全护栏",
  "prompt": "如何给生产环境的 Agent 套上一套可落地的 Guardrails（安全护栏）？",
  "quickAnswer": "Guardrails 是一套位于 Agent 与外部环境之间的\"过滤+约束\"层：输入侧做内容审核、敏感词与注入检测、PII 识别；输出侧做格式校验、违规拦截与脱敏；工具侧用沙箱与最小权限隔离副作用；再用 red-teaming 持续攻击发现漏网，用熔断/降级在异常时保底。目标是把\"聪明但不可控\"的模型，约束进\"有用且安全\"的运行边界。",
  "approach": "输入过滤→PII 脱敏→输出校验→tool 沙箱/最小权限→注入防护→red-teaming→熔断降级。",
  "explanationFocus": "是什么：Guardrails 是围绕 Agent 的纵深防御体系，通过输入/输出过滤、PII 脱敏、工具沙箱与最小权限、注入防护、红队演练和熔断降级，把不可控的模型推理约束在安全的执行边界内。",
  "bruteForce": "直接把用户原话喂给 LLM 并允许它任意调用工具：一次注入就能窃取隐私、越权操作或把机密写进对外回复。",
  "invariant": "任何越过 Agent 边界的\"输入解析\"与\"工具执行\"都必须先经过一层显式、可审计的校验与授权，绝不能直接透传。",
  "walkthrough": "以客服 Agent 为例，峰值并发 100 路会话：输入 1000 条/分钟消息先过审核模型（p99 延迟 80ms），命中 PII 自动掩码（如把 138****1234 替换）；模型生成回复后，输出护栏校验是否泄露原始手机号（漏检率目标<0.1%）；工具调用走沙箱，删单/退款类高危动作需人工 gate。一次异常流量打满审核服务时，熔断降级为\"仅关键字黑名单+最小工具集\"，保证可用性。",
  "derivation": [
    "为什么需要：Agent 能读写数据、调用工具、对外发声，错误或恶意指令会造成隐私泄露与真实损失，需要把风险关进可控边界。",
    "怎么实现：输入侧接内容审核与注入检测、PII 识别脱敏；输出侧接格式校验与泄露扫描；工具侧用沙箱+最小权限+高危人工 gate；配套 red-teaming 持续发现漏洞；异常时熔断降级。",
    "有什么代价：每层都增加 p99 延迟（累计 100~300ms）与成本；过度拦截损害体验；规则维护与误杀需要平衡。",
    "怎么评测：用红队数据集测拦截率/误拦率；压测看护栏本身的开销与熔断是否生效；线上观测 PII 泄露事件数与越权调用数。"
  ],
  "edgeCases": [
    "注入指令藏在检索文档或用户附件里，需内容/指令隔离。",
    "PII 以变体呈现（如\"手机 138 0013 1234\"带空格），脱敏正则需覆盖。",
    "护栏服务自身故障，需熔断降级而非整体不可用。"
  ],
  "code": "def guardrails_pipeline(message, model_reply, tool_call):\n    # 输入：审核 + PII 脱敏\n    risk = content_moderation(message)\n    safe_in = mask_pii(message)                 # 138****1234\n    if risk == \"block\":\n        raise Blocked(\"input policy violation\")\n    # 输出：泄露扫描\n    if leaks_pii(model_reply):\n        model_reply = redact(model_reply)       # 改写后再发\n    # 工具：最小权限 + 高危人工 gate\n    if tool_call.risk == \"high\" and not human_confirmed(tool_call):\n        raise NeedApproval(tool_call)\n    return sandbox_exec(tool_call, scoped_creds(tool_call))",
  "codeNotes": [
    "护栏应作为可插拔中间件，串联在 Agent 的输入/输出与 tool 边界。",
    "熔断降级策略要可配置，避免护栏自身成为单点故障。"
  ],
  "complexity": "每层护栏为 O(1) 推理或正则开销，主要成本在附加的审核/分类模型调用（单条 p99 约 50~150ms），可通过批处理与缓存摊薄。",
  "followUps": [
    {
      "question": "输入护栏和输出护栏为什么要都做？",
      "answer": "只做输入防护，机密仍可能从模型生成的回复里\"绕出来\"；输出护栏专门拦截回复中的明文 PII 与违规内容，形成闭环，二者缺一不可。"
    },
    {
      "question": "怎么平衡安全与体验？",
      "answer": "按风险分级施加摩擦：低风险自动过、中风险轻提示、高风险才强确认；并把护栏做成可降级的中间件，异常时退到最小规则集而非整体不可用。"
    }
  ],
  "followUpAnswers": [
    "输出护栏堵住回复泄露，与输入防护形成闭环。",
    "风险分级+可降级，把摩擦集中在真正危险处。"
  ],
  "pitfalls": [
    "把不可信检索内容当系统指令执行，导致间接提示注入。",
    "只在输入做防护、忽略输出泄露，机密仍可从回复流出。"
  ],
  "beginnerSummary": "Guardrails 像小区门禁+快递柜：进门先刷脸登记（输入审核），包裹里的身份证号先打码（PII 脱敏），外卖小哥只能放柜子不能进家（工具沙箱），遇到可疑人员保安先拦下（熔断降级）。既方便住户，又防坏人。",
  "prerequisites": [
    "了解提示注入与最小权限原则。",
    "具备内容审核/分类模型与 PII 识别能力。",
    "工具调用走沙箱与凭证代理。"
  ],
  "workedExample": [
    "用户消息含身份证号，护栏识别并掩码为 ****，模型全程只看到脱敏值。",
    "回复草稿误带客户手机号，输出护栏拦截并改写后再发出。"
  ],
  "lineByLine": [
    "入站消息先送审核管线，标记风险等级与 PII 位置。",
    "命中 PII 按策略脱敏（掩码/替换）后再进 LLM 上下文。",
    "模型输出回程再过泄露扫描，发现明文敏感信息则拦截或改写。",
    "工具调用按风险分级执行，高危动作路由到人工确认 gate。"
  ],
  "diagram": "User ─▶ [Input Guard: 审核+脱敏] ─▶ LLM ─▶ [Output Guard: 泄露扫描] ─▶ User\n                                      │\n                                      ▼\n                              [Tool Guard: 沙箱+gate] ─▶ 外部API"
};
