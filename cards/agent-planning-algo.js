export default {
  "kind": "concept",
  "id": "agent-planning-algo",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 的规划算法（tree / search / ToT）",
  "prompt": "Agent 的规划算法（tree / search / Tree-of-Thoughts）是怎样的？",
  "quickAnswer": "这类算法把推理/行动建模为搜索问题：ToT 让模型在每步生成多个候选\"思路\"(thought)，用模型自评估对每条打分/剪枝，沿有希望的分支继续展开，像树搜索(BFS/DFS/beam)找最优解。相比线性 CoT/ReAct，它支持探索、回溯与全局择优，适合需要多路径试错的难题。",
  "approach": "多候选展开→评估打分→剪枝/回溯→择优深入。",
  "explanationFocus": "是什么：ToT 等规划算法把 Agent 的推理建模成树状搜索，每步生成多个候选思路并自评，沿高分分支展开、可回溯，从而系统性探索解空间。",
  "bruteForce": "线性 ReAct 一条路走到黑：走错无法回退，易陷局部。",
  "derivation": [
    "为什么需要：很多任务有分支与死路，单链推理无回溯会一错到底。",
    "怎么实现：每节点让 LLM 产 k 个 thought；用 critic 给状态打分；按 beam/BFS 选 top；到达终态或死路则回溯。",
    "有什么代价：候选×评估导致调用数激增、成本高；需好的评估函数否则剪错。",
    "怎么评测：看难题成功率、探索效率(有效分支比)、成本。"
  ],
  "invariant": "只有被评估为\"有前景\"的分支才展开，死路必须可回溯而非硬撑。",
  "walkthrough": "24 点游戏：每步生成 3 种算式候选→评估可达性→选最佳 2 个深入；某分支卡住则回溯到上一节点换路。共展开约 9 节点。",
  "edgeCases": [
    "评估函数误判剪掉正解。",
    "分支爆炸需 beam 限制。",
    "回溯过深致成本飙升。"
  ],
  "code": "def tot(llm, root, beam=2, depth=4):\n    frontier = [root]\n    for d in range(depth):\n        cands = [t for n in frontier for t in llm.thoughts(n)]\n        scored = [(t, llm.score(t)) for t in cands]\n        frontier = topk(scored, beam)          # 仅留高分分支\n        if any(is_solved(n) for n in frontier):\n            return backtrack(frontier)\n    return None",
  "codeNotes": [
    "beam 控制分支爆炸。",
    "评估函数质量决定上限。"
  ],
  "complexity": "调用数 ≈ 节点数×候选数×评估数，呈树级增长，需 beam 剪枝。",
  "followUps": [
    {
      "question": "ToT 和 ReAct 怎么选？",
      "answer": "需回溯/多路径试错(谜题、规划)用 ToT；顺序执行任务用 ReAct 更省。"
    },
    {
      "question": "成本怎么压？",
      "answer": "用小模型做分支评估、beam 限宽、设最大展开节点数。"
    }
  ],
  "followUpAnswers": [
    "多路径试错上 ToT。",
    "小模型评估+beam 限宽。"
  ],
  "pitfalls": [
    "无剪枝致分支爆炸烧钱。",
    "评估函数差剪掉正解。"
  ],
  "beginnerSummary": "ToT 像走迷宫时同时在几个路口都探一步，记下哪条更有戏(打分)，死路就退回换边。比只认一条道走到死胡同聪明，但探得多也费时间。",
  "prerequisites": [
    "模型能生成多候选思路。",
    "有自评/打分能力。",
    "能维护与回溯搜索树。"
  ],
  "workedExample": [
    "每步 3 候选取 top2 深入。",
    "死路回溯换分支。"
  ],
  "lineByLine": [
    "每节点生成多候选思路。",
    "用 critic 给思路打分。",
    "保留高分分支展开。",
    "终局或死路则回溯。"
  ],
  "diagram": "root -> {a,b,c} -> score -> keep a,c -> expand ..."
};
