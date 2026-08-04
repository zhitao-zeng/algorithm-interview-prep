export default {
  "id": "ev-agent-bench",
  "category": "评测与对齐安全",
  "difficulty": "Hard",
  "title": "Agent 能力基准",
  "prompt": "评测一个自主 Agent 的能力时，应该设计哪些任务维度，又该用什么指标衡量成败？",
  "quickAnswer": "Agent 基准通常覆盖工具调用、网页浏览、代码执行、多步规划与记忆等维度，用任务成功率、步数效率、工具调用正确率与人工/LLM 轨迹评审综合衡量，并关注分布外与安全风险。",
  "approach": "从\"任务域、交互环境、成功判据、效率与安全的评测\"四方面设计：明确可观测环境状态、可验证的最终目标，再用成功率加轨迹质量双指标评估。",
  "explanationFocus": "是什么：Agent 能力基准用于评测能自主调用工具、规划多步并和环境交互的智能体，典型如 WebArena、AgentBench，强调在真实或仿真环境中完成端到端任务。",
  "bruteForce": "朴素做法是用静态问答题近似 Agent 能力，但 Agent 的核心是\"在环境里行动并观察反馈\"，静态题完全丢失了交互与状态变更，无法反映真实水平。",
  "invariant": "任务成败必须由环境可验证的最终状态判定（如网页 DOM、数据库记录），而非依赖 Agent 自评是否\"完成了\"。",
  "walkthrough": "先定义环境与可验证目标；给 Agent 初始指令；Agent 循环\"思考-调用工具-观察\"直到终止；评测器检查最终状态是否达标，并记录步数、调用准确率与是否触发安全违规。",
  "complexity": "以交互轨迹执行为主：每个任务含多轮工具调用与环境响应，单次评测可能是数十步推理加外部调用，整体成本与延迟都远高于单轮问答。",
  "beginnerSummary": "Agent 基准考的是\"会自己动手办事的 AI\"：给它一个目标，看它能不能用搜索、写代码、点网页等工具把事办成，并且步子别太啰嗦。",
  "diagram": "goal --> Agent loop:\n          think -> tool -> observe\n                     |\n                 env state\n                     |\n              success? (verified)",
  "code": "def run_agent_task(agent, env, goal, max_steps=30):\n    state = env.reset(goal)\n    for _ in range(max_steps):\n        act = agent.step(state)\n        state = env.apply(act)\n        if env.solved(state):\n            return True\n    return False",
  "derivation": [
    "为什么需要：单轮问答测不出\"规划-执行-反馈\"的闭环能力，而真实助手常需多步自主完成任务。",
    "怎么实现：搭建可交互环境（网页、终端、数据库），定义可验证目标，让 Agent 在循环里行动并判定终态。",
    "有什么代价：环境搭建与状态校验工程量大；多步轨迹算力高；跨站点评测有合规与稳定性风险。",
    "怎么评测：以可验证成功率为主指标，辅以步数效率、工具准确率与人工轨迹质量评审。"
  ],
  "edgeCases": [
    "环境非确定性（如网页动态内容）会让同策略两次运行结果不同。",
    "Agent 陷入重复调用同一工具的死循环，需步数上限兜底。",
    "任务目标存在歧义，终态判定边界含糊导致误判。",
    "工具返回敏感信息，评测需加安全护栏避免泄露。"
  ],
  "pitfalls": [
    "用 Agent 自报\"我完成了\"当成功判据，极易被幻觉式自满骗过。",
    "只看成功率不看步数，鼓励又慢又啰嗦的低效策略。"
  ],
  "prerequisites": [
    "理解 Agent 的\"感知-规划-行动\"循环与工具调用机制。",
    "了解可验证环境状态与终态判定的基本思路。"
  ],
  "workedExample": [
    "场景一：Agent 用 12 步在仿真商城下单成功，终态校验订单存在，记成功。",
    "场景二：Agent 在第 8 步后反复刷新页面，触步数上限返回失败，暴露规划缺陷。"
  ],
  "lineByLine": [
    "def run_agent_task(agent, env, goal, max_steps=30): 定义单任务运行器。",
    "state = env.reset(goal) 用目标初始化环境。",
    "for _ in range(max_steps): 限制最大步数防死循环。",
    "act = agent.step(state) Agent 依据当前状态决策动作。",
    "state = env.apply(act) 环境执行动作并返回新状态。",
    "if env.solved(state): return True 终态达标即成功。",
    "return False 步数耗尽未达标判失败。"
  ],
  "codeNotes": [
    "env.solved(state) 用环境可验证状态而非 Agent 自述判定成败，是 Agent 评测防幻觉的关键。"
  ],
  "followUps": [
    {
      "question": "Agent 基准为什么不能用静态题代替？",
      "answer": "因为 Agent 的难点在交互闭环：需依环境反馈动态调整，静态题丢失了状态变更与工具调用，无法衡量真实自主能力。"
    },
    {
      "question": "成功率之外还应报哪些指标？",
      "answer": "应同时报步数效率、工具调用准确率、轨迹人工/LLM 质量评审以及安全违规率，避免只优化结果忽视过程与风险。"
    }
  ],
  "followUpAnswers": [
    "因为 Agent 的难点在交互闭环：需依环境反馈动态调整，静态题丢失了状态变更与工具调用，无法衡量真实自主能力。",
    "应同时报步数效率、工具调用准确率、轨迹人工/LLM 质量评审以及安全违规率，避免只优化结果忽视过程与风险。"
  ],
  "kind": "concept"
};
