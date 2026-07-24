export default {
  "kind": "concept",
  "id": "agent-state-machine",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "任务调度与状态机",
  "prompt": "Agent 的任务调度与状态机是怎么设计的？",
  "quickAnswer": "把 Agent 运行抽象为有限状态机(如 IDLE→PLANNING→ACTING→OBSERVING→REFLECTING→DONE/ERROR)，由调度器按事件驱动迁移；状态持久化使任务可暂停、恢复、重试。它把\"不确定的 LLM 行为\"约束进可控、可观测、可恢复的执行框架。",
  "approach": "定义状态与迁移→事件驱动调度→持久化→异常回边。",
  "explanationFocus": "是什么：任务调度与状态机用显式状态(规划/行动/观察/反思/完成/错误)与迁移规则来组织 Agent 运行，使其可控可恢复。",
  "bruteForce": "用一个大 while 循环硬写流程：状态隐式、难暂停、出错难恢复。",
  "derivation": [
    "为什么需要：生产环境需可恢复、可观测、可限流，隐式流程无法满足。",
    "怎么实现：定义状态枚举与迁移条件；调度器消费事件(用户/工具回调)推进；状态落库以支持断点续跑。",
    "有什么代价：状态设计需完备，迁移条件易漏；持久化增加复杂度。",
    "怎么评测：看状态覆盖度、恢复成功率、平均迁移步数。"
  ],
  "invariant": "任一时刻 Agent 处于唯一确定状态，迁移必须幂等以防重复执行。",
  "walkthrough": "下单任务：IDLE→PLANNING(生成计划)→ACTING(调支付)→OBSERVING(回执)→DONE。支付超时则迁移到 RETRY 而非 DONE。共 5 态、1 次重试边。",
  "edgeCases": [
    "进程重启需从持久化状态恢复。",
    "重复事件触发需幂等。",
    "非法迁移需拒绝并记录。"
  ],
  "code": "def step(sm, event):\n    nxt = sm.transitions.get((sm.state, event))\n    if nxt is None:\n        raise IllegalTransition(sm.state, event)\n    sm.state = nxt                            # 唯一确定态\n    persist(sm)                               # 落库可恢复\n    return dispatch(nxt, event)",
  "codeNotes": [
    "迁移表驱动，逻辑集中可控。",
    "持久化放在状态变更后。"
  ],
  "complexity": "迁移 O(1)，主要成本在每状态的模型/工具调用。",
  "followUps": [
    {
      "question": "状态机和 ReAct 冲突吗？",
      "answer": "不冲突：状态机管宏观阶段，ReAct 管 ACTING 内部的思考-行动循环。"
    },
    {
      "question": "如何保证幂等？",
      "answer": "给每个动作带唯一 id，执行前查重；副作用操作走事务或补偿。"
    }
  ],
  "followUpAnswers": [
    "状态机宏观，ReAct 微观。",
    "动作带 id+查重保幂等。"
  ],
  "pitfalls": [
    "状态设计遗漏导致卡死。",
    "迁移非幂等造成重复副作用。"
  ],
  "beginnerSummary": "状态机像红绿灯流程：车(任务)只能在\"停/走/等\"几种确定状态间按规定变，不会同时既停又走；万一断电，记录卡在哪一灯，恢复后接着走。",
  "prerequisites": [
    "能枚举任务阶段。",
    "有持久化存储。",
    "需事件/回调驱动。"
  ],
  "workedExample": [
    "下单走 5 态含重试边。",
    "进程重启从库恢复状态。"
  ],
  "lineByLine": [
    "查迁移表得下一状态。",
    "非法迁移直接拒绝。",
    "更新当前唯一状态。",
    "持久化并分发处理。"
  ],
  "diagram": "IDLE->PLAN->ACT->OBSERVE->(RETRY?)->DONE/ERROR"
};
