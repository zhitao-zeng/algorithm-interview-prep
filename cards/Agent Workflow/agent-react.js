export default {
  "kind": "concept",
  "id": "agent-react",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "ReAct 范式",
  "prompt": "Agent 里的 ReAct 范式是什么？",
  "quickAnswer": "ReAct（Reason+Act）让 LLM 交替进行\"思考（Thought）\"与\"行动（Action）\"：模型先推理下一步，再决定调用哪个工具/API，观察返回结果后继续推理，直到得出最终答案。它把链式推理与外部工具执行交错，使 Agent 能基于真实反馈而非凭空猜测来推进任务，显著减少幻觉。",
  "approach": "循环结构：推理 → 决策工具 → 观察结果 → 再推理，直到完成。工程上用 prompt 约束模型输出 \"Thought/Action/Observation\" 三段式；解析出 Action 后调用真实工具，把结果作为 Observation 追加回轨迹（trace），再让模型基于\"扩展后的轨迹\"产出下一步。设 max_steps 防失控。",
  "explanationFocus": "是什么：ReAct（Reason + Act）是一种 Agent 范式，让 LLM 在\"思考（Thought）\"与\"调用工具行动（Action）\"之间交替进行——模型先推理下一步该做什么，再决定调用哪个工具/API，把返回结果作为 Observation 拼回上下文，继续推理，直到得出最终答案。它把链式推理（CoT）与外部工具的真实反馈交错，使 Agent 能基于\"环境实际情况\"而非\"凭空猜测\"推进任务。",
  "bruteForce": "纯 CoT 无工具：模型完全靠记忆生成答案，遇实时信息（天气、股价、数据库）必幻觉，且无法执行任何动作（发邮件、改数据库）。ReAct 正是为补上\"行动能力\"与\"真实反馈\"而生。",
  "derivation": [
    "为什么需要：复杂任务需外部信息/计算，单纯生成答案会幻觉；必须让推理与真实环境反馈结合，才能可靠推进。",
    "怎么实现：prompt 要求模型输出 Thought/Action/Observation 三段；解析 Action 调用工具，把结果作为 Observation 拼回上下文，再进入下一轮推理。",
    "有什么代价：多轮调用增加延迟与 token 成本；工具失败/解析错误会打断循环；需设最大步数防死循环，且解析需容错。",
    "怎么评测：看任务成功率、平均步数、token 成本，以及出错时能否自我纠正（如换工具重试）。"
  ],
  "invariant": "每轮都基于上一轮的 Observation 决策，绝不允许脱离环境空想（否则退化成 CoT）。核心不变量是\"Observation 必须真实回灌上下文\"，模型看到的轨迹始终包含已发生的事实，从而保证推理有据可依。",
  "walkthrough": "具体跑一轮：用户问\"北京今天天气如何？\"。第 1 步 Thought：\"我需要查北京实时天气\" → Action：get_weather(北京) → 环境返回 Observation：\"晴，25°C，湿度 40%\" → 第 2 步 Thought：\"已拿到天气，可直接作答\" → 不再有 Action，输出 Final Answer。全程仅 1 次工具调用、2 轮 Thought，模型基于真实 Observation 而非记忆作答。",
  "edgeCases": [
    "工具返回错误/超时：需重试、换工具，或把错误作为 Observation 让模型自我纠正。",
    "模型输出格式不合法：Action 解析失败，需容错解析或回退（如要求重输格式）。",
    "无限循环：模型反复调用同一工具无进展，需 max_steps 截断或\"重复检测\"终止。",
    "Observation 过长：工具返回大文本淹没上下文，需截断/摘要后再回灌。"
  ],
  "code": "def react_loop(llm, tools, question, max_steps=8):\n    trace = f\"Question: {question}\\n\"\n    for step in range(max_steps):\n        out = llm(trace + \"Thought/Action:\")\n        action = parse_action(out)\n        if action is None:                      # 无工具=>最终答案\n            return parse_answer(out)\n        obs = call_tool(tools, action)          # 真实环境反馈\n        trace += out + f\"\\nObservation: {obs}\\n\"\n    return \"max steps exceeded\"",
  "codeNotes": [
    "Observation 必须真实回灌上下文，这是 ReAct 与 CoT 的根本区别。",
    "解析 Action 需容错：模型输出未必严格 JSON，应做宽松解析与重试。",
    "草图 max_steps=8 是防失控底线；真实可加\"重复 Action 检测\"提前终止。"
  ],
  "complexity": "耗时与成本 ≈ 步数 × 单步延迟；token 成本随调用次数与轨迹增长线性上升。每多一步就多一次模型往返 + 一次工具执行，因此要在\"够用\"与\"省钱\"间设步数上限。",
  "followUps": [
    {
      "question": "ReAct 和纯 CoT 区别？",
      "answer": "CoT 只在脑内推理、不采取任何行动，答案全靠模型记忆，遇实时/私有信息必幻觉；ReAct 把推理与工具调用交错，每步都可用真实 Observation 纠正推理方向，因此更可靠、更能处理需外部信息的任务。"
    },
    {
      "question": "怎么防止死循环？",
      "answer": "三道防线：① 设最大步数上限（如 8~10 步）截断；② 检测\"重复 Action/重复 Observation\"提前终止；③ 加启发式\"若连续 N 步无新信息则终止并作答\"。三者结合可把失控概率降到很低。"
    },
    {
      "question": "ReAct 为什么更贵？",
      "answer": "因为它多轮调用 LLM（每步一次往返）且轨迹越滚越长，token 消耗与延迟随步数线性增长；相比单次直答，成本来自\"步数 × 单步\"。优化方向是减少不必要步数、压缩 Observation、或升级为更高效的 Agent 架构（如 Plan-and-Execute）。"
    }
  ],
  "followUpAnswers": [
    "CoT 只在脑内推理、不采取任何行动，答案全靠模型记忆，遇实时/私有信息必幻觉；ReAct 把推理与工具调用交错，每步都可用真实 Observation 纠正推理方向，因此更可靠、更能处理需外部信息的任务。",
    "三道防线：① 设最大步数上限（如 8~10 步）截断；② 检测\"重复 Action/重复 Observation\"提前终止；③ 加启发式\"若连续 N 步无新信息则终止并作答\"。三者结合可把失控概率降到很低。",
    "因为它多轮调用 LLM（每步一次往返）且轨迹越滚越长，token 消耗与延迟随步数线性增长；相比单次直答，成本来自\"步数 × 单步\"。优化方向是减少不必要步数、压缩 Observation、或升级为更高效的 Agent 架构（如 Plan-and-Execute）。"
  ],
  "pitfalls": [
    "让模型脱离 Observation 空想（退化为 CoT）：一旦不把工具结果真实回灌，模型就回到凭记忆猜，幻觉复发。",
    "无步数上限导致无限循环烧 token：必须设 max_steps 与重复 Action 检测。",
    "解析 Action 不鲁棒：格式稍变就崩溃，应在解析层做宽松匹配与兜底。"
  ],
  "beginnerSummary": "ReAct 像边查资料边做题：先想\"这一步该查什么\"（Thought），去翻书查一下（Action），看到结果（Observation）再想下一步，而不是直接凭记忆乱猜。查到的真实信息让答案更靠谱——就像你做研究不是闷头瞎写，而是查到证据再下结论。",
  "prerequisites": [
    "LLM 能输出结构化推理：理解 prompt 工程如何让模型吐出 Thought/Action 格式。",
    "有可调用的工具/API：真实环境反馈的来源（搜索、数据库、代码执行等）。",
    "需把工具结果回灌上下文：Observation 拼接回轨迹是 ReAct 成立的关键。"
  ],
  "workedExample": [
    "查天气：1 次 Action 调用 get_weather 得 Observation\"晴 25°C\"，模型据此作答，避免凭记忆编温度。",
    "超 8 步未结束则截断返回，防止模型无限循环烧 token；实践中多数任务 2~4 步完成。",
    "失败自愈：若 get_weather 超时，把错误作为 Observation 回灌，模型可改调 get_weather_forecast 或向用户澄清。"
  ],
  "lineByLine": [
    "把问题写入轨迹 trace：作为推理起点，后续 Observation 不断追加其后。",
    "让模型输出 Thought/Action：模型先想后做，Action 含工具名与参数。",
    "解析并调用工具得 Observation：真正执行（搜索/查库/计算），拿到环境真实反馈。",
    "回灌后再循环，无 Action 则终止：模型见到 Observation 后决定继续或给最终答案。"
  ],
  "diagram": "Thought -> Action -> Observation -> Thought -> ... -> Answer\n(推理与真实反馈交错)"
};
