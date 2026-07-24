export default {
  "kind": "concept",
  "id": "agent-prompt-eng",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "提示词工程 for Agents",
  "prompt": "面向 Agent 的提示词工程有什么特殊之处？",
  "quickAnswer": "Agent 提示词不只描述\"任务\"，还要定义\"角色、可用工具、输出格式、思考协议与停止条件\"，并把系统约束(安全边界、风格)常驻。它强调结构化与可解析——让模型产出机器可消费的 Thought/Action/工具调用，而非自由散文，从而保证控制力与可观测性。",
  "approach": "定角色→列工具→定格式→给约束→示样例。",
  "explanationFocus": "是什么：面向 Agent 的提示词工程是设计能引导模型按约定结构(角色/工具/格式/约束)产出可解析动作的 system 与 few-shot 内容。",
  "bruteForce": "只写\"帮我完成任务\"：模型自由发挥，无法控工具与格式。",
  "derivation": [
    "为什么需要：Agent 需机器解析动作，模糊提示会导致格式错、越权。",
    "怎么实现：system 中声明可用工具与 JSON/三段式格式，给 1-2 个 few-shot 示例，明确\"先想后做、无动作则结束\"。",
    "有什么代价：提示越长占窗口；过度约束限制灵活性；示例需与目标分布一致。",
    "怎么评测：看格式合规率、工具选择准确率、越权率。"
  ],
  "invariant": "提示中声明的工具必须与运行时注册表严格一致，否则模型会\"幻觉\"出不存在的工具。",
  "walkthrough": "客服 Agent：system 写\"你是客服，可用[查订单,退换货]，输出 Thought/Action\"；给 1 示例。格式合规率从 60% 升至 95%。",
  "edgeCases": [
    "提示声明的工具与实际不符→模型调空。",
    "few-shot 示例带偏见→行为偏移。",
    "约束过死致正常请求被拒。"
  ],
  "code": "def build_system_prompt(tools):\n    lines = [\"You are a helpful agent.\", \"Available tools:\"]\n    for t in tools:\n        lines.append(f\"- {t.name}: {t.desc}\")  # 与注册表一致\n    lines.append(\"Output: Thought then Action(JSON). Stop if done.\")\n    return \"\\n\".join(lines)",
  "codeNotes": [
    "工具描述必须来自注册表。",
    "few-shot 要贴近真实分布。"
  ],
  "complexity": "提示构建 O(tools)，主要成本在每轮携带 system 的 token。",
  "followUps": [
    {
      "question": "Agent 提示和普通对话提示区别？",
      "answer": "Agent 提示强调可解析结构与工具契约，普通提示只求自然语言回答。"
    },
    {
      "question": "few-shot 示例怎么选？",
      "answer": "选覆盖典型工具与边界case的少量示例，避免覆盖过窄或过宽导致偏移。"
    }
  ],
  "followUpAnswers": [
    "重结构与工具契约。",
    "少量覆盖典型与边界。"
  ],
  "pitfalls": [
    "提示工具清单与实际注册表不一致。",
    "约束过死扼杀合理灵活性。"
  ],
  "beginnerSummary": "Agent 提示词像给新员工的手册：写明\"你的岗位、你能用的系统、填表格式、啥时候停下\"。写得清楚，员工(模型)才不会瞎干或填错单。",
  "prerequisites": [
    "明确角色与目标。",
    "工具清单已就绪。",
    "定义可解析输出格式。"
  ],
  "workedExample": [
    "system 声明可用工具与格式。",
    "1 个 few-shot 拉高合规率。"
  ],
  "lineByLine": [
    "写角色与目标。",
    "列出与注册表一致的工具。",
    "规定输出结构与停止条件。",
    "附少量示例稳定行为。"
  ],
  "diagram": "System(role+tools+format) + few-shot -> Model"
};
