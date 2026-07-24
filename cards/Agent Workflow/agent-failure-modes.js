export default {
  "kind": "concept",
  "id": "agent-failure-modes",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 失败模式与缓解",
  "prompt": "Agent 有哪些典型失败模式，怎么缓解？",
  "quickAnswer": "典型失败包括：循环空转(重复同动作)、工具误用(选错/参数错)、幻觉作答(脱离观察)、上下文溢出(丢关键)、提示注入劫持、目标漂移(忘了初衷)、成本爆炸。缓解靠步数上限、观察回灌、格式校验、沙箱与授权、预算护栏、可观测回放与 HITL 兜底——即把\"容错+约束+可恢复\"织进全流程。",
  "approach": "识别模式→加约束护栏→可观测→兜底恢复。",
  "explanationFocus": "是什么：Agent 失败模式指其在运行中常见的系统性错误形态，缓解是用约束、校验、护栏与兜底使其具备韧性的工程集合。",
  "bruteForce": "出问题再看：缺乏预设防护，每种失败都造成用户可感事故。",
  "derivation": [
    "为什么需要：LLM 非确定且能执行动作，失败代价高，需系统性防护而非补救。",
    "怎么实现：对每类失败设对应护栏(步数上限防循环、schema 校验防误用、grounding 防幻觉、预算防爆炸、注入检测防劫持)。",
    "有什么代价：护栏叠加增复杂度与少量延迟；过度约束抑能力。",
    "怎么评测：红队测试各失败模式拦截率与误伤率。"
  ],
  "invariant": "每种已知失败模式都应有对应的可触发护栏，而非依赖模型\"自觉\"。",
  "walkthrough": "失败复盘：曾循环调同一搜索 12 次→加重复检测+步数上限；曾凭空答\"已查\"→加 grounding 校验。两类事故归零。",
  "edgeCases": [
    "护栏间相互冲突需优先级。",
    "新失败模式未被覆盖。",
    "误伤正常多样行为。"
  ],
  "code": "def guard(trace, action, budget):\n    if action in last_k(trace, 3): raise LoopDetected()   # 防循环\n    if not schema_ok(action):   raise BadAction()         # 防误用\n    if budget.exceeded():       raise BudgetExceeded()    # 防爆炸\n    return True",
  "codeNotes": [
    "护栏要可组合且有权重。",
    "新失败模式需持续补护栏。"
  ],
  "complexity": "每步附加若干 O(1) 护栏检查，成本可忽略。",
  "followUps": [
    {
      "question": "怎么发现未知失败模式？",
      "answer": "靠生产 trace 回放、用户反馈与红队演练，把新形态沉淀为对应护栏。"
    },
    {
      "question": "护栏会误伤吗？",
      "answer": "会，需用误伤率指标调阈值，并对边界case加 HITL 而非硬拒。"
    }
  ],
  "followUpAnswers": [
    "回放+红队沉淀护栏。",
    "调阈值+边界走 HITL。"
  ],
  "pitfalls": [
    "依赖模型自觉而非硬护栏。",
    "护栏堆砌致正常行为被误伤。"
  ],
  "beginnerSummary": "Agent 失败像小孩常犯的错：绕圈重复(循环)、用错工具、瞎编(幻觉)、忘事(溢出)、被人骗(注入)。大人(护栏)提前定规矩——\"同一件事不许做第三遍\"\"没查过不许说查了\"——才稳当。",
  "prerequisites": [
    "能枚举常见失败模式。",
    "有可加的护栏钩子。",
    "有 trace 用于复盘。"
  ],
  "workedExample": [
    "重复动作检测+步数上限。",
    "grounding 校验防凭空作答。"
  ],
  "lineByLine": [
    "识别循环/误用/幻觉等模式。",
    "为每类加对应护栏。",
    "超阈值即拦截或升级。",
    "新失败持续沉淀护栏。"
  ],
  "diagram": "Action -> [Loop?][Schema?][Budget?] -> allow/block"
};
