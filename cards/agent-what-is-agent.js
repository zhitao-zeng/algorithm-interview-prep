export default {
  "kind": "concept",
  "id": "agent-what-is-agent",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "什么是 Agent / Agent Workflow",
  "prompt": "什么是 Agent / Agent Workflow，它和常规的机器学习 pipeline 有什么区别？",
  "quickAnswer": "Agent 是以 LLM 为\"大脑\"、能自主感知环境、调用工具并采取行动来完成目标的系统；Agent Workflow 则是把\"规划→行动→观察→反思\"串成可循环的流程。与常规 pipeline（数据→模型→固定输出，无自主决策）相比，Agent 强调运行中动态决策、使用外部工具、并根据反馈迭代。",
  "approach": "目标拆解→模型决策→工具执行→观察反馈→循环直至完成。",
  "explanationFocus": "是什么：Agent 是以 LLM 为决策核心、能调用工具并与环境交互来自主达成目标的系统；Agent Workflow 是把感知-决策-行动-反馈组织成循环流程的方法。",
  "bruteForce": "固定 pipeline：数据进模型、模型出结果，链路写死，遇到意外输入即失败，无法借助外部信息。",
  "derivation": [
    "为什么需要：真实任务跨系统、需实时信息、需多步与纠错，单步模型产出无法胜任。",
    "怎么实现：以 LLM 作控制器，维护目标/历史/记忆状态，每轮决定\"思考/调工具/返回\"，把结果回灌再进入下一轮。",
    "有什么代价：延迟与 token 成本高、易出错，需工程化控制循环与失败恢复。",
    "怎么评测：看任务完成率、平均步数、成本与可恢复性。"
  ],
  "invariant": "每一步决策都基于当前真实状态（目标+观察+记忆），而非凭空生成。",
  "walkthrough": "订机票：1) 规划\"查价→比价→下单\" 2) 调 search 工具 3) 观察结果 4) 再决策。共 3 类子任务、约 5 次工具调用。",
  "edgeCases": [
    "需用户确认时应在 human-in-the-loop 处暂停而非擅自动作。",
    "工具不可用时需降级或换工具，不能死等。",
    "目标含糊时需先澄清再执行。"
  ],
  "code": "def run_agent(goal, tools, max_steps=10):\n    state = {\"goal\": goal, \"history\": []}\n    for step in range(max_steps):\n        action = llm_decide(state, tools)      # 基于真实状态决策\n        if action is None:\n            return finalize(state)\n        obs = execute(tools, action)           # 与环境交互\n        state[\"history\"].append((action, obs)) # 回灌状态\n    return None",
  "codeNotes": [
    "状态回灌是 Agent 与 pipeline 的本质区别。",
    "决策必须读取 history，避免重复动作。"
  ],
  "complexity": "随步数×工具调用线性增长；受上下文窗口约束。",
  "followUps": [
    {
      "question": "Agent 一定需要 LLM 吗？",
      "answer": "核心是\"自主决策+环境交互\"，LLM 是当前最通用的控制器，但规则/RL 控制器也算 Agent 的范畴。"
    },
    {
      "question": "Workflow 和 Agent 是一回事吗？",
      "answer": "Workflow 偏固定编排（图/状态机），Agent 偏运行时自主决策；现代系统常混合两者。"
    }
  ],
  "followUpAnswers": [
    "控制器可以是 LLM 也可是规则。",
    "Workflow 固定，Agent 自主，二者常结合。"
  ],
  "pitfalls": [
    "把写死的固定 pipeline 当成 Agent。",
    "不回灌状态导致模型\"失忆\"式重复或空想。"
  ],
  "beginnerSummary": "Agent 像一个会自己想办法的小助手：你给个目标，它自己拆步骤、遇到不懂的去查工具、看到结果再决定下一步，而不是按一条写死的流水线机械执行。",
  "prerequisites": [
    "LLM 可作决策控制器。",
    "有可调用的外部工具/API。",
    "需要维护运行时的状态。"
  ],
  "workedExample": [
    "查机票需要多步工具调用与比价决策。",
    "目标模糊时先向用户澄清再执行。"
  ],
  "lineByLine": [
    "初始化目标与空历史状态。",
    "每轮让 LLM 基于状态决策下一步动作。",
    "执行动作并把观察写入历史。",
    "无动作时收尾返回，超步数则截断。"
  ],
  "diagram": "Goal -> Decide -> Act -> Observe -> Decide -> ... -> Done\n(状态在每轮被回灌)"
};
