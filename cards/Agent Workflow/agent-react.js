export default {
  "kind": "concept",
  "id": "agent-react",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "ReAct 范式",
  "prompt": "Agent 里的 ReAct 范式是什么？",
  "quickAnswer": "ReAct(Reason+Act)让 LLM 交替进行\"思考(Thought)\"与\"行动(Action)\"：模型先推理下一步该做什么，再决定调用哪个工具/API，观察返回结果后继续推理，直到得出最终答案。它把链式推理与外部工具执行交错，使 Agent 能基于真实反馈而非凭空猜测来推进任务。",
  "approach": "推理→决策工具→观察结果→再推理，循环至完成。",
  "explanationFocus": "是什么：ReAct 让 LLM 在\"思考\"与\"调用工具行动\"之间交替，基于观察结果迭代推进任务。",
  "bruteForce": "纯 CoT 无工具：模型凭记忆作答，易出错且无实时信息。",
  "derivation": [
    "为什么需要：复杂任务需外部信息/计算，单纯生成答案会幻觉；需把推理与真实环境反馈结合。",
    "怎么实现：prompt 要求模型输出 Thought/Action/Observation 三段；解析 Action 调用工具，把结果作为 Observation 拼回上下文，再进入下一轮。",
    "有什么代价：多轮调用增加延迟与 token 成本；工具失败/解析错误会打断循环；需控制最大步数防死循环。",
    "怎么评测：看任务成功率、平均步数、token 成本，以及错误时能否自我纠正。"
  ],
  "invariant": "每轮都基于上一轮的 Observation 决策，避免脱离环境的空想。",
  "walkthrough": "查天气：Thought\"需查北京天气\"→Action[get_weather(北京)]→Observation\"晴 25°\"→Thought\"可作答\"→Final。共 1 次工具调用。",
  "edgeCases": [
    "工具返回错误/超时：需重试或换工具。",
    "模型输出格式不合法：需解析容错。",
    "无限循环：设最大步数截断。"
  ],
  "code": "def react_loop(llm, tools, question, max_steps=8):\n    trace = f\"Question: {question}\\n\"\n    for step in range(max_steps):\n        out = llm(trace + \"Thought/Action:\")\n        action = parse_action(out)\n        if action is None:                      # 无工具=>最终答案\n            return parse_answer(out)\n        obs = call_tool(tools, action)          # 真实环境反馈\n        trace += out + f\"\\nObservation: {obs}\\n\"\n    return \"max steps exceeded\"",
  "codeNotes": [
    "Observation 必须真实回灌上下文。",
    "解析 Action 需容错。"
  ],
  "complexity": "步数×单步延迟；成本随调用次数线性增长。",
  "followUps": [
    {
      "question": "ReAct 和纯 CoT 区别？",
      "answer": "CoT 只在脑内推理不行动；ReAct 把推理与工具调用交错，能用真实观察纠正推理，减少幻觉。"
    },
    {
      "question": "怎么防止死循环？",
      "answer": "设最大步数上限、检测重复 Action、以及\"无新信息则终止\"的启发式。"
    }
  ],
  "followUpAnswers": [
    "Observation 回灌是关键。",
    "步数上限防失控。"
  ],
  "pitfalls": [
    "让模型脱离 Observation 空想（退化为 CoT）。",
    "无步数上限导致无限循环烧 token。"
  ],
  "beginnerSummary": "ReAct 像边查资料边做题：先想\"这一步该查什么\"(Thought)，去翻书查一下(Action)，看到结果(Observation)再想下一步，而不是直接凭记忆乱猜。查到的真实信息让答案更靠谱。",
  "prerequisites": [
    "LLM 能输出结构化推理。",
    "有可调用的工具/API。",
    "需把工具结果回灌上下文。"
  ],
  "workedExample": [
    "查天气：1 次 Action 调用 get_weather 得 Observation。",
    "超 8 步未结束则截断返回。"
  ],
  "lineByLine": [
    "把问题写入轨迹。",
    "让模型输出 Thought/Action。",
    "解析并调用工具得 Observation。",
    "回灌后再循环，无 Action 则终止。"
  ],
  "diagram": "Thought -> Action -> Observation -> Thought -> ... -> Answer\n(推理与真实反馈交错)"
};
