export default {
  "kind": "concept",
  "id": "agent-planning",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "规划（planning）与任务分解",
  "prompt": "Agent 的规划（planning）与任务分解是怎么做的？",
  "quickAnswer": "规划是把高层目标拆成有序、可执行的子任务，并在执行中按需调整。常见做法：让 LLM 一次性生成步骤清单(plan-then-act)，或每步动态重规划；复杂任务可用层级分解（子目标递归拆分）。关键点在于可验证的子目标边界与失败时的回滚/改路。",
  "approach": "生成计划→逐步执行→观察偏差→重规划或回退。",
  "explanationFocus": "是什么：规划是 Agent 把抽象目标分解为有依赖关系的子任务序列，并在执行中根据观察动态调整的过程。",
  "bruteForce": "无计划直接开干：遇到长任务易中途迷失、漏步骤、无法回溯。",
  "derivation": [
    "为什么需要：长任务跨度大、需依赖管理，单步贪心易走入歧路。",
    "怎么实现：用 LLM 产出带依赖的步骤图；执行每步后评估进度，偏差超阈值则重规划；也可用监督式 planner 或搜索。",
    "有什么代价：规划本身消耗 token；计划过细则僵化、过粗则无效；需检测\"计划已完成/卡死\"。",
    "怎么评测：看计划质量、任务完成率、重规划频率与最终步数。"
  ],
  "invariant": "已完成的子目标状态必须被记录，后续步骤依赖它而非重新猜测。",
  "walkthrough": "写调研报告：1)列提纲 2)检索各节资料 3)撰写 4)汇总。执行第 2 步发现缺数据→重规划\"先补数据再写\"。共 4 步、1 次重规划。",
  "edgeCases": [
    "子任务间循环依赖：需检测并告警。",
    "某步反复失败：需换策略或标记阻塞。",
    "目标在中途变化：需部分丢弃旧计划。"
  ],
  "code": "def plan_and_execute(llm, goal, tools):\n    plan = llm_make_plan(goal)                 # 有序子任务\n    done = []\n    while not plan.empty():\n        step = plan.next()\n        ok, obs = execute_step(step, tools)\n        done.append(step)\n        if not ok:\n            plan = llm_replan(goal, done, obs)  # 动态重规划\n    return summarize(done)",
  "codeNotes": [
    "重规划要带上已完成步骤，避免重复。",
    "计划应可序列化以便恢复。"
  ],
  "complexity": "规划开销 ≈ 任务复杂度；重规划每次追加一次模型调用。",
  "followUps": [
    {
      "question": "plan-then-act 与 ReAct 区别？",
      "answer": "前者先定全局计划再执行，后者边走边想；可结合：用计划提供骨架、用 ReAct 填细节。"
    },
    {
      "question": "计划太细怎么办？",
      "answer": "采用层级规划，只展开当前子目标，避免过度约束导致僵化。"
    }
  ],
  "followUpAnswers": [
    "计划给骨架，ReAct 填细节。",
    "层级展开，避免过细。"
  ],
  "pitfalls": [
    "计划写死不参与反馈，遇偏差即失败。",
    "不记录已完成步骤导致重复劳动。"
  ],
  "beginnerSummary": "规划像做菜前先列步骤：洗菜→切菜→下锅→装盘；做到一半发现没盐，就临时改计划\"先去买盐\"。把大目标拆小并随时调整，才不会手忙脚乱。",
  "prerequisites": [
    "LLM 能产出结构化步骤。",
    "能执行并观察每步结果。",
    "需机制记录进度与重规划。"
  ],
  "workedExample": [
    "把\"写报告\"拆成 4 个子任务。",
    "某步失败触发一次重规划。"
  ],
  "lineByLine": [
    "用 LLM 生成有序计划。",
    "逐条执行子任务。",
    "记录已完成步骤与观察。",
    "失败则带上下文重规划。"
  ],
  "diagram": "Goal -> [Plan] -> step1 -> step2 -> (replan?) -> ... -> Done"
};
