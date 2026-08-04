export default {
  "id": "se-guardrail",
  "category": "安全红队",
  "difficulty": "Medium",
  "title": "安全护栏设计",
  "prompt": "如何为生产环境设计一套分层的安全护栏体系？",
  "quickAnswer": "采用输入过滤、模型对齐、输出校验与持续监控的分层护栏，结合规则与模型判定，对越界内容分级处置。",
  "approach": "先梳理风险目录与处置策略，输入侧做注入与违规检测，模型侧用对齐与系统提示约束，输出侧做毒性/泄露/事实校验，最后以监控与回灌闭环持续迭代。",
  "explanationFocus": "是什么：安全护栏是一组部署在模型输入与输出通道上的检测、约束与处置机制，用于在内容触达用户前拦截或改写违规与有害响应。",
  "bruteForce": "最朴素护栏是单条关键词黑名单加输出截断，命中即返回固定拒答，简单但易被绕过且误杀高。",
  "invariant": "不变式：任何响应在离开系统前都必须通过全部启用的护栏层，任一层判定为阻断则不会透出给用户。",
  "walkthrough": "先定义风险等级与对应动作，输入经分类器初筛，模型在对齐约束下生成，输出再经多道校验，命中则改写或拦截，事件入监控用于复盘与再训练。",
  "complexity": "每层为 O(L) 或 O(n) 推理，可流水线并行，端到端增加常数级延迟，主要由最慢的分类器决定。",
  "beginnerSummary": "护栏像机场多层次安检：值机查证件、安检查物品、登机查机票，任一层不放行就走不了，层层兜底更安全。",
  "diagram": "input --> classifiers --> policy --> allow / rewrite / block\n                                 ^-- monitor",
  "code": "def guardrail(text, image_feat, policy):\n    if policy.input_check(text, image_feat) == \"block\":\n        return \"block\"\n    out = policy.model(text, image_feat)\n    return policy.output_check(out)",
  "derivation": [
    "为什么需要：单一防护易被绕过，分层护栏以纵深防御降低漏放，满足合规与用户体验的双重要求。",
    "怎么实现：定义风险目录与分级动作，串联输入检测、对齐生成与输出校验，并用监控回灌闭环优化。",
    "有什么代价：多层带来延迟与成本，严格的拦截会误伤正常请求，需要精细策略与可观测性。",
    "怎么评测：用红队攻防集测漏放率与误杀率，并以 p99 延迟与可用性 SLA 约束上线。"
  ],
  "edgeCases": [
    "多语言混合输入绕过单语检测器。",
    "合法内容因敏感词误杀需人工申诉。",
    "护栏自身被提示注入绕过。"
  ],
  "pitfalls": [
    "把护栏当作一次性规则，忽视持续演化。",
    "只拦输出不拦输入，浪费算力且留痕风险。"
  ],
  "prerequisites": [
    "风险建模与处置策略设计。",
    "内容安全分类与对齐方法。"
  ],
  "workedExample": [
    "输入含越狱指令，输入层命中注入标记返回拒答，模型未被执行。",
    "输出含疑似隐私片段，输出层脱敏后放行，事件计入监控看板。"
  ],
  "lineByLine": [
    "def guardrail(text, image_feat, policy)：定义护栏主函数。",
    "if policy.input_check(...) == \"block\"：输入初筛命中即阻断。",
    "out = policy.model(text, image_feat)：通过输入层后调用模型生成。",
    "return policy.output_check(out)：对输出再做校验后返回处置结果。"
  ],
  "codeNotes": [
    "policy 应支持热更新策略与灰度，便于快速响应新型攻击。"
  ],
  "followUps": [
    {
      "question": "护栏与模型对齐如何分工？",
      "answer": "对齐负责让模型\"本意安全\"，护栏负责\"兜底拦截\"，二者互补，护栏处理对齐未覆盖的长尾与对抗情形。"
    },
    {
      "question": "如何衡量护栏效果？",
      "answer": "用红队持续对抗测漏放率，用线上抽样测误杀率，并以延迟与转化率监控可用性影响。"
    }
  ],
  "followUpAnswers": [
    "对齐负责让模型\"本意安全\"，护栏负责\"兜底拦截\"，二者互补，护栏处理对齐未覆盖的长尾与对抗情形。",
    "用红队持续对抗测漏放率，用线上抽样测误杀率，并以延迟与转化率监控可用性影响。"
  ],
  "kind": "concept"
};
