export default {
  "kind": "concept",
  "id": "agent-eval-beyond-answer",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 应该如何评估？为什么只看最终答案不够？",
  "prompt": "给定一个能调用工具、多步规划的自主 Agent，你会如何系统性评估它的质量？为什么只对比“最终结果对不对”不够？",
  "quickAnswer": "Agent 评估要从“结果正确性 + 过程质量 + 资源成本 + 安全副作用”四个维度展开。只看最终答案会漏掉“答案对但过程错”（如调用了错误工具、走了危险路径），以及成本/延迟/可控性问题。",
  "approach": "建立分层指标体系：① 任务层（成功率、失败恢复率、副作用）；② 轨迹层（工具选择准确率、参数正确率、调用顺序正确率、无效调用次数）；③ 效率层（平均步骤数、延迟、Token 成本）。用可自动验证的 checker 替代纯 LLM-as-Judge，并支持把失败按阶段（规划/工具选择/参数/执行）归因。",
  "explanationFocus": "强调“最终答案 ≠ 好 Agent”：过程错误可能偶然得到正确结果，也可能带来不可逆副作用。评估要覆盖轨迹与成本，而不仅是输出。",
  "bruteForce": "最朴素：人工跑 N 个任务，看最终答案对不对再打分。问题：不可扩展、无法区分过程优劣、无法定位失败原因、主观且昂贵。",
  "derivation": [
    "任务成功率是必要条件但不是充分条件：结果正确可能来自错误路径的巧合。",
    "工具选择准确率 / 参数正确率 / 顺序正确率刻画“过程是否正确”，能把“答案对但过程错”暴露出来。",
    "无效调用次数与平均步骤数反映效率与规划质量；延迟与 Token 成本反映生产可用性。",
    "失败恢复率与副作用（如误删、越权写）刻画鲁棒性与安全，这是只看答案完全缺失的维度。"
  ],
  "invariant": "评估必须把“结果正确性”与“过程质量 + 成本 + 安全”解耦度量；最终答案正确不能推断 Agent 行为正确。",
  "walkthrough": "1) 先定义可自动验证的任务（有确定性 checker）。2) 跑 Agent 收集（最终答案, 工具调用轨迹, 成本）。3) 用 checker 判结果，用轨迹比对判工具/参数/顺序。4) 统计成功率、各过程指标、延迟与 Token。5) 对失败案例做阶段归因（规划/选择/参数/执行）。6) 报告“正确但危险/昂贵”的边界案例。",
  "edgeCases": [
    "结果正确但调用了错误工具或错误参数（如本应读 DB 却调了写接口）——按过程指标应判不达标。",
    "任务无确定性 checker（开放式任务），只能用 LLM-as-Judge，需警惕偏见与位置偏好。",
    "副作用不可逆（删除/外发），即使最终答案对也应记安全违规。",
    "成本爆炸：任务成功但 Token/步骤远超预算，生产不可用。"
  ],
  "code": "def score_agent(task, run):\n    # run: {answer, trajectory:[{tool,args,correct,ok}], cost, side_effect}\n    res_ok = task.checker(run['answer'])              # 结果正确性(可自动验证)\n    tool_acc = sum(st['correct'] for st in run['trajectory']) / len(run['trajectory'])\n    order_ok = task.order_checker([st['tool'] for st in run['trajectory']])\n    invalid = sum(1 for st in run['trajectory'] if not st['ok'])\n    return {\n        'success': res_ok and not run['side_effect'],\n        'tool_selection_acc': tool_acc,\n        'order_correct': order_ok,\n        'invalid_calls': invalid,\n        'tokens': run['cost']['tokens'],\n    }",
  "codeNotes": [
    "checker 必须是确定性的（如单元测试/字符串匹配），避免用 LLM 判结果导致噪声。",
    "side_effect 单独计，因为安全违规不应被“答案对”掩盖。"
  ],
  "complexity": "单次评估 O(轨迹长度)；聚合指标 O(任务数 × 轨迹长度)。LLM-as-Judge 额外 O(任务数) 推理成本。",
  "followUps": [
    {
      "question": "最终结果正确，但调用了错误工具，算成功吗？",
      "answer": "不算（按过程指标）。结果可能来自错误路径的巧合，且错误工具可能带来副作用；工具选择准确率等指标应判不达标。"
    },
    {
      "question": "如何评估 Agent 的执行轨迹？",
      "answer": "用轨迹级指标：工具选择准确率、参数正确率、调用顺序正确率；并把失败按阶段归因到规划/工具选择/参数/执行。"
    },
    {
      "question": "LLM-as-Judge 有什么问题？",
      "answer": "有位置偏见、自我偏好（偏爱同类模型输出）、评分漂移、对长轨迹不稳定；应仅作辅助，核心用确定性 checker。"
    },
    {
      "question": "如何构造可自动验证的任务？",
      "answer": "设计有确定性答案的任务：用单元测试/断言/字符串匹配做 checker，或让 Agent 产出可执行的验证脚本。"
    },
    {
      "question": "如何定位错误发生在哪个阶段？",
      "answer": "在轨迹上定位：规划错→改 prompt/重试；工具选错→增强工具描述；参数错→schema 校验；执行错→工具本身 bug。"
    }
  ],
  "followUpAnswers": [
    "不算；过程错且可能有副作用，工具选择准确率应判不达标。",
    "用工具/参数/顺序准确率 + 阶段归因（规划/选择/参数/执行）。",
    "位置与自我偏见、评分漂移、长轨迹不稳，应仅作辅助。",
    "用确定性 checker（单测/断言/字符串匹配）或可执行验证脚本。",
    "按轨迹定位：规划→prompt；选择→工具描述；参数→schema；执行→工具 bug。"
  ],
  "pitfalls": [
    "把“最终答案对”等同于“Agent 好”，忽略过程错误与副作用。",
    "过度依赖 LLM-as-Judge 而缺乏确定性 checker，导致评估噪声大。",
    "只报成功率，不报成本与步骤数，掩盖了生产不可用。",
    "忽略失败阶段归因，迭代时无从下手。"
  ],
  "beginnerSummary": "Agent 不能只看“答案对不对”。要同时看：任务成没成、用的是不是对的工具/参数/顺序、花了多少步和多少钱、有没有干危险的事。最好用能自动判对的任务来测。",
  "prerequisites": [
    "Agent 基本范式（ReAct / Workflow）",
    "工具调用与函数调用",
    "基础指标概念（准确率、召回）"
  ],
  "workedExample": [
    "任务：“查北京今天天气并写入备忘录”。Agent 调 get_weather 得到答案，但误调用 send_email 把天气发了出去。",
    "结果 checker 判天气答案正确，但 side_effect=True（外发邮件）→ success=False；过程指标也暴露工具选错。"
  ],
  "lineByLine": [
    "定义 checker：对任务产出做确定性判定。",
    "收集轨迹：每一步的工具名、参数、返回是否 ok。",
    "计算结果指标（成功率、副作用）。",
    "计算轨迹指标（工具/参数/顺序准确率、无效调用）。",
    "聚合成本（步骤、延迟、Token），做失败阶段归因。"
  ],
  "diagram": "评估维度\n├─ 结果层: 任务成功率 / 副作用\n├─ 轨迹层: 工具选择 / 参数 / 顺序 / 无效调用\n├─ 效率层: 步骤数 / 延迟 / Token 成本\n└─ 归因:   规划 → 选择 → 参数 → 执行"
};
