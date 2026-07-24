export default {
  "id": "agent-code-react-loop",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "手写 ReAct 循环",
  "prompt": "如何手写一个 ReAct（推理+行动）循环，让大模型在思考、调工具、观察之间往复，并自主决定何时终止？",
  "quickAnswer": "ReAct 把 LLM 的\"下一步\"显式拆成 Thought（推理）、Action（选工具）、Action Input（参数）三段，通过解析模型输出驱动工具调用。循环把每次的观察 Observation 拼回上下文，直到模型输出 Finish 或到达 max_steps。核心是\"提示构造 + 输出解析 + 上下文回灌\"三段式，使模型能在多步中自我纠正。",
  "explanationFocus": "是什么：ReAct（Reason + Act）是一种让大模型交替进行\"语言推理\"和\"外部动作\"的 Agent 范式。它在一次回答里同时产出思考链（Thought）和可执行动作（Action），并根据工具返回的观察（Observation）决定下一步，直到得出最终答案。",
  "approach": "核心思路：用一个 for 循环限制最大步数；每步把\"问题 + 历史\"喂给 LLM，解析出 Thought/Action/Action Input；若 Action 是 Finish 就返回答案，否则调用对应工具并把 Observation 追加回历史；循环靠\"历史回灌\"让模型看到前面所有推理与结果。",
  "bruteForce": "朴素做法：直接让 LLM 一次性生成最终答案，或每轮只问\"下一步做什么\"但不把观察回灌，导致模型看不到工具结果、无法多跳推理。更原始的方式是为每个任务写死 if-else 调工具，完全失去自主性。",
  "invariant": "循环不变量：history 始终包含截至当前步所有 Thought/Action/Observation，且任一时刻若 action==Finish 则立即返回答案；循环退出后 history 一定完整记录了推理轨迹。",
  "walkthrough": "以 max_steps=5 为例：第1步 LLM 输出 Action=get_weather{city:北京}，得到 Observation=25℃；第2步 LLM 看到历史后输出 Action=Finish{北京当前25℃}。实际只用了 2 步（< 5）即终止。若工具一直报错或模型不输出 Finish，则第5步后兜底返回提示。",
  "code": "def agent_loop(llm, tools, question, max_steps=5):\n    # tools: dict[str, callable]，工具名 -> 可执行函数\n    history = []  # 累积的全部 Thought/Action/Observation 文本\n    for step in range(max_steps):  # 步数护栏，防止模型永不终止\n        prompt = build_prompt(question, history)  # 拼装带 few-shot 的 ReAct 提示\n        raw = llm(prompt)  # 调 LLM，返回含 Thought/Action/Action Input 的文本\n        thought, action, action_input = parse_react(raw)  # 解析出三段\n        history.append(f\"Thought: {thought}\")\n        if action == \"Finish\":  # 模型决定终止\n            history.append(f\"Answer: {action_input}\")\n            return action_input\n        if action not in tools:  # 未知工具，给安全反馈而非崩溃\n            obs = f\"Error: unknown tool '{action}'\"\n        else:\n            try:\n                obs = str(tools[action](**action_input))  # 真正调用工具\n            except Exception as e:\n                obs = f\"Error: {e}\"  # 工具异常转成观察文本\n        history.append(f\"Action: {action}\")  # 记录动作\n        history.append(f\"Observation: {obs}\")  # 回灌观察，形成闭环\n    return \"Reached max_steps without Finish\"  # 兜底返回",
  "complexity": "时间复杂度：O(max_steps × (LLM调用 + 工具调用))，每步一次 LLM 推理加至多一次工具调用；空间复杂度：O(max_steps × 单步文本长度)，history 随步数线性增长，需配合记忆压缩避免超窗口。",
  "beginnerSummary": "把 AI 想象成一个边查资料边碎碎念的解题人：它先小声说\"我该干嘛\"（Thought），然后决定\"去翻词典\"（Action），拿到词典解释（Observation）后再决定下一步，直到说\"我懂了，答案是这个\"（Finish）。我们写的循环就是反复逼它走这套流程，并给它设个最多走几步的刹车。",
  "diagram": "Question\n   |\n   v\n[Build Prompt + History] --> [LLM]\n                                 |\n                                 v\n                        parse Thought/Action/Input\n                                 |\n                    +------------+------------+\n                    |                         |\n              Action==Finish?           Action!=Finish\n                    |                         |\n                 return answer        call tools[action]\n                                          |\n                                          v\n                                   Observation\n                                          |\n                                          +--> append to history --> loop",
  "derivation": [
    "为什么需要：单轮 LLM 无法直接获取实时/私有信息，且复杂任务需要多步推理；ReAct 把\"想\"和\"做\"显式分离，让模型能基于工具反馈动态修正路径，而不是一次性蒙一个答案。",
    "怎么实现：维护 history 列表，每轮用 build_prompt 把问题与历史拼成提示，调用 llm 后用 parse_react 正则/结构化抽取三段；Finish 直接返回，否则执行工具并把 Observation 追加回 history，进入下一轮。",
    "有什么代价：每步都有 LLM 延迟与 token 成本，步数越多越慢越贵；解析失败、工具超时、模型不收敛都会放大开销；history 无限增长还会撑爆上下文窗口。",
    "怎么评测：用多跳问答（HotpotQA）、工具调用准确率、步数效率（平均多少步 Finish）、以及终止正确率衡量；同时统计 fallback/超时占比以评估鲁棒性。"
  ],
  "edgeCases": [
    "LLM 输出格式不合法，parse_react 抽不出 Action：应容错成 Observation=解析错误并继续，而非抛异常中断整个循环。",
    "工具抛异常或超时：用 try/except 把异常转成 Error 文本回灌，让模型有机会换工具或换参数重试。",
    "模型始终不输出 Finish：靠 max_steps 兜底返回提示，避免无限循环与成本失控。",
    "Action 指向不存在的工具名：检查 action not in tools，返回 unknown tool 错误而不是 KeyError。"
  ],
  "pitfalls": [
    "忘记把 Observation 回灌 history，导致模型看不到工具结果，无法多跳推理——这是 ReAct 失效最常见原因。",
    "max_steps 设太大既烧钱又易跑偏，设太小又答不完；应结合任务复杂度调参并加早停。",
    "parse_react 用脆弱正则，遇到模型自由发挥就抽空，需要兜底与更稳的结构化解析（如 JSON/函数调用）。"
  ],
  "prerequisites": [
    "了解大模型函数调用（function calling）与提示词工程基础。",
    "理解\"思维链（CoT）\"推理，以及为何多步推理需要外部工具补充知识。"
  ],
  "workedExample": [
    "输入 question=\"北京现在气温多少？\"，tools={\"get_weather\": lambda city: \"25℃\"}，max_steps=5。第1步 LLM 输出 Thought=要查天气, Action=get_weather, Action Input={city:北京}。",
    "调用 get_weather 得到 Observation=\"25℃\" 拼回 history；第2步 LLM 输出 Action=Finish, Action Input=\"北京当前25℃\"。循环在第2步返回 \"北京当前25℃\"，仅用 2 步 < 5。"
  ],
  "lineByLine": [
    "def agent_loop(llm, tools, question, max_steps=5)：定义循环入口；tools 是\"名字->函数\"的映射，max_steps 是防不终止的安全护栏。",
    "history = []：累积每轮的 Thought/Action/Observation，充当模型的短期记忆，下一轮提示会包含它。",
    "for step in range(max_steps)：用固定上限限制步数，这是成本与安全的硬边界，避免模型永不 Finish。",
    "prompt = build_prompt(question, history)：把原始问题与历史拼成带 few-shot 示例的 ReAct 提示，引导模型输出规范三段。",
    "raw = llm(prompt) 与 parse_react(raw)：调用模型并解析出 thought/action/action_input，是连接\"语言\"与\"动作\"的关键。",
    "if action == \"Finish\": return action_input：模型认为已得出答案，直接返回，循环正常结束。",
    "obs = str(tools[action](**action_input))：真正执行工具，try/except 把异常转成 Error 文本，保证循环不崩。",
    "history.append(Action/Observation)：把动作与观察回灌上下文，使下一轮 LLM 能看到前面结果，形成推理闭环。",
    "return \"Reached max_steps...\"：兜底分支，步数耗尽仍未 Finish 时返回提示而非抛错，保证调用方总有返回值。"
  ],
  "codeNotes": [
    "build_prompt 与 parse_react 是可替换组件：生产环境更推荐用模型原生 function calling 代替脆弱的正则解析。"
  ],
  "followUps": [
    {
      "question": "ReAct 和纯 CoT（思维链）有什么区别？",
      "answer": "CoT 只产出推理文本不触发动作，无法获取外部实时信息；ReAct 在推理中插入 Action/Observation，让模型能调用工具并基于真实反馈继续推理，适合需要检索、计算或多步工具协作的任务。"
    },
    {
      "question": "如果 LLM 一直不输出 Finish 怎么办？",
      "answer": "靠 max_steps 强制终止并兜底返回；同时可在提示里强调\"尽快 Finish\"、对无效循环做早停检测，或改用强结构化的 function calling 让模型以特定信令结束。"
    }
  ],
  "followUpAnswers": [
    "CoT 只产出推理文本不触发动作，无法获取外部实时信息；ReAct 在推理中插入 Action/Observation，让模型能调用工具并基于真实反馈继续推理，适合需要检索、计算或多步工具协作的任务。",
    "靠 max_steps 强制终止并兜底返回；同时可在提示里强调\"尽快 Finish\"、对无效循环做早停检测，或改用强结构化的 function calling 让模型以特定信令结束。"
  ]
};
