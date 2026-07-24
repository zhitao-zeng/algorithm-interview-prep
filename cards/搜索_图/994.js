export default {
  "kind": "code",
  "id": "994",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "腐烂的橘子",
  "prompt": "求所有新鲜橘子腐烂的最少分钟。",
  "quickAnswer": "多源 BFS：所有腐烂橘子同时入队，每层代表一分钟。",
  "approach": "多源 BFS：所有腐烂橘子同时入队，每层代表一分钟。",
  "explanationFocus": "腐烂的橘子：多源 BFS：所有腐烂橘子同时入队，每层代表一分钟。",
  "bruteForce": "《腐烂的橘子》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。",
  "derivation": [
    "单源 BFS 只能从一格出发，无法表达「同时腐烂」；多源 BFS 把所有初始腐烂格作为同层起点，等价「同时开始」。",
    "每轮把当前层全部弹出、把它们的邻居（新鲜）标记腐烂并入队，层数 +1 即分钟数 +1。",
    "结束后若仍剩值为 1 的格子，说明有橘子与外界隔离，返回 -1。"
  ],
  "invariant": "搜索前沿只包含 腐烂的橘子：多源 BFS：所有腐烂橘子同时入队，每层代表一分钟。 下尚未扩展且状态合法的候选。",
  "walkthrough": "演练《腐烂的橘子》时画出一层搜索树或队列，标记访问和回溯恢复的位置。",
  "edgeCases": [
    "没有新鲜橘子：直接返回 0。",
    "有新鲜橘子但完全孤立（四周都是空或边界）：最终 fresh>0，返回 -1。",
    "网格为空：按约定返回 0 或 -1。"
  ],
  "code": "# Python\nfrom collections import deque\n\ndef oranges_rotting(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    queue = deque()\n    fresh = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 2:\n                queue.append((r, c))\n            elif grid[r][c] == 1:\n                fresh += 1\n    minutes = 0\n    while queue and fresh:\n        for _ in range(len(queue)):\n            r, c = queue.popleft()\n            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:\n                    grid[nr][nc] = 2\n                    fresh -= 1\n                    queue.append((nr, nc))\n        minutes += 1\n    return minutes if fresh == 0 else -1",
  "codeNotes": [
    "BFS 入队时标记访问，避免重复入队。",
    "回溯函数退出前恢复现场。"
  ],
  "complexity": "时间 O(m·n)（每格最多入队出队一次），空间 O(m·n)（队列最坏存全部格子）。",
  "followUps": [
    {
      "question": "为什么必须多源同时入队？",
      "answer": "多个腐烂源在同一分钟并行传播；统一初始层才能得到每个橘子的最短腐烂时间。"
    },
    {
      "question": "如何不修改输入？",
      "answer": "复制 grid 或额外维护 visited/状态矩阵，代价是 O(mn) 额外空间。"
    }
  ],
  "followUpAnswers": [
    "无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。",
    "保存 parent 或在 path 中记录选择。"
  ],
  "pitfalls": [
    "分钟数多算一分钟：最后一层处理完才 +1，需在返回时减去多余的那一分钟（或初始化 minutes=-1，首层不计时）。",
    "忘记统计/更新 fresh 计数，导致无法判断「是否还有没烂的橘子」而错误返回 0。"
  ],
  "beginnerSummary": "网格里 0=空、1=新鲜橘子、2=腐烂橘子。每分钟，每个腐烂橘子会把它上下左右相邻的新鲜橘子也变腐烂。求多少分钟后所有橘子都腐烂；若有新鲜橘子永远无法被传染则返回 -1。这是「多源 BFS」：一开始把所有腐烂橘子同时入队，按层扩散，每扩散一层代表过一分钟。",
  "prerequisites": [
    "多源 BFS：初始把所有腐烂橘子（值为 2）的坐标一起入队，作为第 0 层。",
    "队列按「层」扩展，每完整处理一层 = 过去一分钟，新感染的橘子入下一层。",
    "扩散只朝向上下左右四个相邻格，且只感染值为 1 的新鲜橘子。"
  ],
  "workedExample": [
    "网格 [[2,1,1],[0,1,1]]：初始队列只有 (0,0)，第一层只感染右侧一个邻居（下方是 0）。",
    "按层继续传播，fresh 变成 0 时返回经过的分钟数；若被 0 隔断则返回 -1。"
  ],
  "lineByLine": [
    "扫描网格，把所有 2 的坐标入队，同时统计新鲜橘子（1）的个数 fresh。",
    "若 fresh==0 直接返回 0（无需时间）。",
    "BFS：记录当前层大小，逐格弹出，对四邻若值为 1 则置 2、fresh-1、入队。",
    "每处理完一层 minutes+=1；最后若 fresh>0 返回 -1，否则返回 minutes（注意末尾多余一分钟的处理）。"
  ],
  "diagram": "grid:\n  2 1 1\n  1 1 0\n  0 1 1\n初始坏橘(2)入队, 每轮扩散1分钟\nt=1: 感染相邻新鲜(1)\nt=2: ...\n直到无新鲜(1)剩余 → 返回分钟数"
};
