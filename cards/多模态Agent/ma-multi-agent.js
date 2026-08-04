export default {
  "id": "ma-multi-agent",
  "category": "多模态Agent",
  "difficulty": "Hard",
  "title": "多智能体协作",
  "prompt": "多个多模态 Agent 协作时，如何设计角色分工与通信协议来避免重复劳动和冲突？",
  "quickAnswer": "通过明确角色职责（如感知者、规划者、执行者、校验者）、定义结构化消息（含意图、观测、请求）与共享黑板/消息总线，并引入仲裁或投票机制解决冲突，让各 Agent 各司其职、可并行又可控。",
  "approach": "把单 Agent 的\"思考-行动\"循环拆给 specialist：用共享状态做信息中枢，用角色契约约束每类 Agent 的输入输出，冲突由协调者按目标一致性裁决。",
  "explanationFocus": "是什么：多智能体协作是指让多个各有所长的多模态 Agent（如负责\"看\"的感知 Agent、负责\"想\"的规划 Agent、负责\"做\"的执行 Agent、负责\"查\"的校验 Agent）通过约定好的消息传递共同完成单 Agent 难以搞定的复杂任务，类似一个分工明确的团队。",
  "bruteForce": "把所有能力塞进一个超长提示的单体 Agent，上下文很快爆掉，且规划、执行、检查互相干扰，出错后难定位是谁的责任。",
  "invariant": "共享黑板中的任务状态在任何时刻有唯一权威版本，消息传递后各 Agent 的局部视图最终与黑板一致（收敛）。",
  "walkthrough": "①用户给总目标；②规划 Agent 拆子任务并派单；③感知 Agent 看界面产出观测；④执行 Agent 操作；⑤校验 Agent 复核；⑥仲裁汇总或重派。",
  "complexity": "通信轮次约为 O(子任务数×角色数)，并行角色可降低墙钟时间，但协调与一致性检查带来额外消息开销。",
  "beginnerSummary": "别让一个人又看又想又做又查，容易乱；分成\"眼睛\"\"大脑\"\"手\"\"质检\"几个专人，用一块公共白板传话，效率高也更可控。",
  "diagram": "[planner] --task--> [actor]\n    ^                  |\n    |  [board]         v\n[checker] <--obs-- [perceiver]",
  "code": "def run_team(goal, agents, board):\n    plan = agents['planner'].decompose(goal, board)\n    for task in plan:\n        obs = agents['perceiver'].see(task, board)\n        act = agents['actor'].act(obs, board)\n        if not agents['checker'].verify(act, board):\n            board.flag(task, 'retry')\n    return board.result()",
  "derivation": [
    "为什么需要：复杂多模态任务超出单体 Agent 上下文与单角色能力，分工可并行、易维护、易追责。",
    "怎么实现：定义角色契约与共享黑板/消息总线，规划者派单、执行者操作、校验者复核，冲突由协调者仲裁。",
    "有什么代价：多 Agent 增加通信与协调开销，角色间信息丢失或指令歧义会放大错误，调试更难。",
    "怎么评测：对比单体与多体在复杂任务上的成功率、耗时与可解释性，看是否\"1+1>2\"。"
  ],
  "edgeCases": [
    "两个 Agent 同时改同一状态产生写冲突，需要锁或版本号。",
    "消息含歧义导致执行者误解意图，需结构化而非自由文本通信。",
    "某角色 Agent 卡死使整队停摆，需超时与替补机制。"
  ],
  "pitfalls": [
    "角色边界模糊导致重复劳动（都去感知）或真空（无人校验）。",
    "自由自然语言通信引入噪声，应优先用带 schema 的结构化消息。"
  ],
  "prerequisites": [
    "单 Agent 的感知-规划-执行闭环",
    "消息传递与共享状态（黑板）设计"
  ],
  "workedExample": [
    "网页调研：感知 Agent 抓页面、规划 Agent 列问题、执行 Agent 点击、校验 Agent 核对答案完整。",
    "多模态创作：脚本 Agent 写分镜、绘 Agent 出图、审 Agent 挑错后回修。"
  ],
  "lineByLine": [
    "decompose 把目标拆成可被单方认领的子任务，是分工起点。",
    "perceiver.see 产出结构化观测写入黑板，供下游消费。",
    "checker.verify 形成闭环，失败则 flag 重派而非静默继续。"
  ],
  "codeNotes": [
    "board 作为唯一事实源，所有 Agent 读写它而非互相私聊，降低耦合。"
  ],
  "followUps": [
    {
      "question": "什么时候不该用多 Agent？",
      "answer": "任务简单、延迟敏感或预算有限时，单体加好提示往往更划算，多 Agent 的协调成本会反噬。"
    },
    {
      "question": "如何防止错误在团队里放大？",
      "answer": "用结构化消息、校验者独立复核、关键决策留痕与可回滚，避免一个误判被下游当事实传播。"
    }
  ],
  "followUpAnswers": [
    "任务简单、延迟敏感或预算有限时，单体加好提示往往更划算，多 Agent 的协调成本会反噬。",
    "用结构化消息、校验者独立复核、关键决策留痕与可回滚，避免一个误判被下游当事实传播。"
  ],
  "kind": "concept"
};
