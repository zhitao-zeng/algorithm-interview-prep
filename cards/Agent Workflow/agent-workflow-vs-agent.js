export default {
  "kind": "concept",
  "id": "agent-workflow-vs-agent",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Workflow 和 Agent 有什么区别？什么场景不应该使用自主 Agent？",
  "prompt": "Workflow（工作流）和 Agent（自主智能体）有什么区别？什么场景不应该使用自主 Agent？",
  "quickAnswer": "Workflow 是路径预定义、每步确定性、易测试、适合固定业务；Agent 由模型动态决定下一步、灵活但状态空间大、不稳定、难测试。不应盲目用自主 Agent 的场景：路径固定的批量任务、对正确性/可审计要求高、成本敏感、延迟敏感、或失败代价高的写操作。应把确定性节点（校验、入库、支付）交给代码，只在真正开放/不确定的决策点用模型。还要限制最大步数、防循环、保证写操作幂等。",
  "approach": "按“确定性 vs 开放性”选择；能用 Workflow 就用 Workflow，Agent 只用于开放决策点。",
  "explanationFocus": "是什么：Workflow=预定义路径，Agent=模型动态规划；不是越自主越好，要按任务性质选型。",
  "bruteForce": "把所有任务都套 Agent 自主循环（成本高、难控、易跑偏）。",
  "derivation": [
    "为什么需要：不是所有任务都该让模型自由发挥；固定流程用代码更稳更省。",
    "怎么实现：Workflow 用 DAG/状态机串起确定步骤；Agent 用规划+工具循环，模型自行选下一步。",
    "怎么约束：限制 max_steps、检测循环、Tool 失败走 Replan 而非无限 Retry、写操作幂等。",
    "怎么评测：看成功率、步骤数、延迟、成本，以及“错误工具/错误参数”的发生。"
  ],
  "invariant": "选型原则：能用确定性 Workflow 解决的，就不应上自主 Agent；Agent 只用在开放性决策点。",
  "walkthrough": "固定报表生成用 Workflow（取数→模板→发送）；开放的研究问答用 Agent（检索→读→再检索→写）。写库/支付节点在两种里都应是确定性代码，不受模型随意调用。",
  "edgeCases": [
    "高合规/可审计：自主 Agent 难解释每步，Workflow 更合适。",
    "成本敏感：Agent 多步调用贵，固定流程更省。",
    "失败代价高：自主写操作易出错，需强约束与人工确认。"
  ],
  "code": "# Python\ndef route(task):\n    if task.type in ('report', 'etl'):\n        return run_workflow(task)          # 确定性路径\n    if task.type == 'open_research':\n        return run_agent(task, max_steps=8) # 开放决策\n    raise ValueError('unknown task')\n# 写操作节点应始终由确定性代码执行",
  "codeNotes": [
    "真实含步数限制、循环检测、幂等写。",
    "工具失败优先 Replan 而非无限 Retry。"
  ],
  "complexity": "Workflow 成本随步骤固定；Agent 成本随步数与工具调用数增长，需上限保护。",
  "followUps": [
    {
      "question": "Agent 是否越自主越好？",
      "answer": "不是。自主带来不确定性与成本，固定任务用 Workflow 更稳更省；Agent 只用于开放决策点。"
    },
    {
      "question": "如何限制最大步数？",
      "answer": "设 max_steps，超过即终止并交回确定逻辑或人工；防止无限循环烧钱。"
    },
    {
      "question": "如何防止循环调用？",
      "answer": "记录已访问状态/动作序列，检测重复或回环则截断，或加衰减避免原地打转。"
    },
    {
      "question": "Tool 失败后 Retry 还是 Replan？",
      "answer": "简单瞬时错误可有限 Retry；语义/策略失败应 Replan（换思路），避免同错反复。"
    },
    {
      "question": "如何保证写操作幂等？",
      "answer": "写操作带唯一键/版本号/状态机，重复调用不产生重复副作用；关键写加人工确认。"
    },
    {
      "question": "哪些节点应由确定性代码完成？",
      "answer": "校验、入库、支付、发送等正确性与安全攸关的节点，应由确定性代码执行，不交给模型自由调用。"
    }
  ],
  "followUpAnswers": [
    "不是, 固定任务用 Workflow。",
    "设 max_steps 防失控。",
    "检测状态回环截断。",
    "语义失败 Replan。",
    "写操作幂等+人工确认。",
    "校验/支付等用确定代码。"
  ],
  "pitfalls": [
    "以为 Agent 越自主越好。",
    "把高合规任务交给不可审计的自主 Agent。",
    "写操作不幂等，重试产生副作用。"
  ],
  "beginnerSummary": "Workflow 像一条流水线：第一步干啥、第二步干啥都提前定好，稳、快、好测试，适合固定业务（比如每天自动出报表）。Agent 像一个能自己想办法的员工：每一步干什么由它看着办，灵活但“想法”可能飘、成本高、还难复现。所以不是越自主越好——能走流水线的就别派自由人。尤其是要付钱、要写数据库、要发消息这些“后果严重”的节点，必须交给写死的代码，不能让模型随意点按钮；还要给 Agent 设步数上限、防它绕圈、保证重复执行不出事。",
  "prerequisites": [
    "Workflow 路径预定义、确定性。",
    "Agent 由模型动态决策。",
    "写操作需安全与可审计。"
  ],
  "workedExample": [
    "报表生成=Workflow; 开放研究=Agent。",
    "支付/入库节点在两者中都是确定性代码。"
  ],
  "lineByLine": [
    "Workflow: 预定义路径, 易测。",
    "Agent: 模型动态决策, 灵活但不稳。",
    "固定任务用 Workflow。",
    "开放决策点才用 Agent。",
    "写操作确定性+幂等+限步数。"
  ],
  "diagram": "Workflow vs Agent:\nWorkflow: 固定路径 -> 可预测/易测/省成本\nAgent:    模型动态规划 -> 灵活/状态大/不稳/贵\n原则: 能 Workflow 就别 Agent\n写操作/支付: 永远确定性代码"
};
