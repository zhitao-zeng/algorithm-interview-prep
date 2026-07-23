export default {
  "kind": "concept",
  "id": "agent-error-retry",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "错误处理与重试",
  "prompt": "Agent 里怎么做错误处理与重试？",
  "quickAnswer": "Agent 的失败分三类：模型输出非法、工具执行异常、外部超时。处理策略是分类捕获→把错误作为 Observation 回传模型让其自我纠正，配合有限重试与退避；不可恢复则升级到 human-in-the-loop 或安全终止。关键是让错误成为可学习信号而非直接崩溃。",
  "approach": "分类捕获→回传观察→限次重试→退避/升级。",
  "explanationFocus": "是什么：错误处理与重试是 Agent 对模型/工具/外部异常进行分类捕获、反馈纠正与受限重试的机制，保证任务韧性。",
  "bruteForce": "异常直接抛崩：一次工具超时整轮任务失败。",
  "derivation": [
    "为什么需要：LLM 与工具都不稳定，无容错则任务极其脆弱。",
    "怎么实现：try/except 包裹工具调用；把错误文本回灌 prompt；设最大重试与指数退避；连续失败转人工或终止。",
    "有什么代价：重试增加延迟与成本；过度重试掩盖根因；需区分可重试与不可重试错误。",
    "怎么评测：看任务成功率提升、平均重试次数、误重试率。"
  ],
  "invariant": "回传给模型的错误必须真实且附带上下文，模型才能有效改进行动。",
  "walkthrough": "调支付 API 超时：catch→回传\"timeout\"→模型改小超时重试→仍失败→转人工。共 2 次重试、1 次升级。",
  "edgeCases": [
    "区分 4xx(不改重试)与 5xx(可重试)。",
    "模型持续产出非法 JSON：需格式修复或换模型。",
    "重试风暴：需全局限流。"
  ],
  "code": "def safe_call(tool, args, max_retry=3):\n    for i in range(max_retry):\n        try:\n            return tool(**args)\n        except TransientError as e:\n            backoff(i)                         # 指数退避\n            obs = f\"error:{e}; retry {i+1}\"\n            args = llm_fix(args, obs)          # 让模型纠正\n    raise EscalateToHuman(\"persistent failure\")",
  "codeNotes": [
    "只重试瞬时错误，4xx 不重试。",
    "把错误回灌让模型自我修。"
  ],
  "complexity": "最坏 = max_retry×单调用；退避使延迟呈指数。",
  "followUps": [
    {
      "question": "哪些错误不该重试？",
      "answer": "参数非法/权限拒绝(4xx)等确定性失败，重试无意义，应直接纠正或升级。"
    },
    {
      "question": "重试和反思怎么配合？",
      "answer": "重试是执行层兜底，反思是决策层改进；重试前可先让模型分析错误原因再行动。"
    }
  ],
  "followUpAnswers": [
    "4xx 确定性失败不重试。",
    "重试兜底，反思改进。"
  ],
  "pitfalls": [
    "无差别重试导致重试风暴。",
    "吞掉错误不回传，模型无法学习。"
  ],
  "beginnerSummary": "错误处理像教小孩：第一次拧瓶盖失败(超时)，你告诉她\"用力点再试\"(回传错误)，试两次还不行就找大人(人工)。不让一次失误变成全盘崩溃。",
  "prerequisites": [
    "能区分错误类型。",
    "工具有可捕获异常。",
    "模型能根据错误改进行动。"
  ],
  "workedExample": [
    "超时回传后模型改参数重试。",
    "连续失败升级人工。"
  ],
  "lineByLine": [
    "用 try/except 包裹调用。",
    "瞬时错误则退避重试。",
    "把错误回传给模型纠正。",
    "超限则升级或终止。"
  ],
  "diagram": "call -> ok? -> yes:return / no:backoff+retry -> human"
};
