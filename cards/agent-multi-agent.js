export default {
  "kind": "concept",
  "id": "agent-multi-agent",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "多 Agent 协作（角色分工）",
  "prompt": "多 Agent 协作（角色分工）是怎么工作的？",
  "quickAnswer": "多 Agent 把复杂任务分给专长不同的角色(如规划者/执行者/审查者)，通过共享黑板或消息总线通信，各自维护子目标并交接产物。它用\"分工+协作\"替代单体 Agent 的万能推理，适合跨领域、需多重把关的任务；核心是清晰的接口协议与冲突仲裁。",
  "approach": "角色定义→任务分派→并行/串行协作→汇总仲裁。",
  "explanationFocus": "是什么：多 Agent 协作是多个专长化 Agent 通过约定协议分工、通信、交接产物以共同完成任务的架构。",
  "bruteForce": "单 Agent 包揽全部：上下文混杂、易顾此失彼、难并行。",
  "derivation": [
    "为什么需要：任务跨多领域、需并行与多重校验，单体难兼顾深度与广度。",
    "怎么实现：定义角色 prompt 与接口(输入输出 schema)；用 orchestrator 或黑板模式分发；产物经 critic/merger 仲裁合并。",
    "有什么代价：通信开销大、角色间易冲突/重复、调试困难、成本倍增。",
    "怎么评测：看整体完成率、角色利用率、通信轮数与冲突率。"
  ],
  "invariant": "任一 Agent 的输出必须带角色标识与版本，便于下游追溯与仲裁。",
  "walkthrough": "做产品：Planner 拆任务→Researcher 检索、Writer 起草、Reviewer 审→Merger 汇总。共 3 个工人 Agent、1 个协调者、2 轮交接。",
  "edgeCases": [
    "两 Agent 结论冲突：需仲裁者裁决。",
    "某角色卡死：需超时与替补。",
    "消息环路：需防重复广播。"
  ],
  "code": "def multi_agent(roles, task):\n    bus = Blackboard()\n    bus.post(\"task\", task)\n    for role in roles:\n        msg = bus.subscribe(role.in_topics)\n        out = role.act(msg)                    # 角色专长出力\n        bus.post(role.name, out)               # 交接产物\n    return arbitrate(bus)",
  "codeNotes": [
    "黑板模式降低耦合。",
    "仲裁逻辑要可解释。"
  ],
  "complexity": "≈ 角色数×单角色开销 + 通信轮数；并行可降本但增协调复杂度。",
  "followUps": [
    {
      "question": "何时该用多 Agent 而非单 Agent？",
      "answer": "任务跨领域、需并行或强把关(如生成+审查分离)时收益明显；简单任务反而增开销。"
    },
    {
      "question": "多 Agent 最大风险？",
      "answer": "通信混乱与责任不清，需严格接口协议与可观测的仲裁日志。"
    }
  ],
  "followUpAnswers": [
    "跨领域/需把关才上多 Agent。",
    "接口协议+可观测仲裁。"
  ],
  "pitfalls": [
    "角色职责重叠导致重复劳动。",
    "无仲裁机制致结论互相矛盾。"
  ],
  "beginnerSummary": "多 Agent 像项目组：有人负责查资料、有人写、有人审稿，大家把成果放到公共白板上互相接力，最后由组长整合。比一个人又查又写又审更专业。",
  "prerequisites": [
    "能定义清晰角色与接口。",
    "有通信/黑板机制。",
    "需仲裁与冲突解决。"
  ],
  "workedExample": [
    "Planner/Researcher/Writer/Reviewer 分工。",
    "Merger 汇总多角色产物。"
  ],
  "lineByLine": [
    "在黑板上发布总任务。",
    "各角色订阅相关主题并行动。",
    "把产物回贴黑板交接。",
    "仲裁者汇总成最终产出。"
  ],
  "diagram": "Planner -> Researcher\nPlanner -> Writer -> Reviewer -> Merger"
};
