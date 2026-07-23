export default {
  "kind": "code",
  "id": "200",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "岛屿数量",
  "prompt": "统计网格中四连通岛屿数量。",
  "quickAnswer": "扫描到陆地就计数并 DFS/BFS 淹没整个连通块。",
  "approach": "扫描到陆地就计数并 DFS/BFS 淹没整个连通块。",
  "explanationFocus": "岛屿数量：扫描到陆地就计数并 DFS/BFS 淹没整个连通块。",
  "bruteForce": "《岛屿数量》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。",
  "derivation": [
    "直接数 1 的个数会重复计算同一座岛里的多个格子。",
    "经典「染色/淹没」思想：遇到未访问的 1 → 岛数+1 → 立刻把该岛全部连通陆地标记为已访问。",
    "遍历完网格，触发淹没的次数 = 岛屿数。"
  ],
  "invariant": "搜索前沿只包含 岛屿数量：扫描到陆地就计数并 DFS/BFS 淹没整个连通块。 下尚未扩展且状态合法的候选。",
  "walkthrough": "演练《岛屿数量》时画出一层搜索树或队列，标记访问和回溯恢复的位置。",
  "edgeCases": [
    "全 0：返回 0。",
    "全 1 且相连：返回 1。",
    "网格为空：返回 0。"
  ],
  "code": "# Python\nfrom collections import deque\n\ndef num_islands(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    islands = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] != '1':\n                continue\n            islands += 1\n            grid[r][c] = '0'\n            queue = deque([(r, c)])\n            while queue:\n                cr, cc = queue.popleft()\n                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                    nr, nc = cr + dr, cc + dc\n                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':\n                        grid[nr][nc] = '0'\n                        queue.append((nr, nc))\n    return islands",
  "codeNotes": [
    "BFS 入队时标记访问，避免重复入队。",
    "回溯函数退出前恢复现场。"
  ],
  "complexity": "时间 O(m·n)（每格访问一次），空间 O(m·n)（visited/递归栈）。",
  "followUps": [
    {
      "question": "可以用 DFS 吗？",
      "answer": "可以，递归或显式栈都能淹没连通块；显式队列更不容易触发 Python 递归深度限制。"
    },
    {
      "question": "为什么入队时就改成 0？",
      "answer": "若等出队才标记，同一陆地可能被多个邻居重复发现，队列会膨胀。"
    }
  ],
  "followUpAnswers": [
    "无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。",
    "保存 parent 或在 path 中记录选择。"
  ],
  "pitfalls": [
    "淹没时只改 visited 不递归四邻，导致同一岛被多次计数。",
    "递归未判越界，访问 board[nr][nc] 下标越界。"
  ],
  "beginnerSummary": "二维网格里 1=陆地、0=水。岛屿是被水包围、由上下左右相连的陆地组成的连通块。求岛屿个数。每遇到一个 1，就说明发现了一座新岛，立刻用 DFS/BFS 把它连同的所有相连陆地「淹掉」（标记为已访问/改成 0），避免之后重复计数；遍历完整张网格，计数被触发的次数就是岛屿数。",
  "prerequisites": [
    "连通性只看上下左右四个方向（斜向不算相连）。",
    "每找到陆地就「淹没整座岛」：从该格出发递归/队列把所有相连陆地标记为已访问。",
    "淹没操作保证同一座岛只被计数一次。"
  ],
  "workedExample": [
    "网格 [[\"1\",\"1\",\"0\"],[\"0\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]：左上陆地触发一次 flood，淹没三个相连格。",
    "最后右下孤立的 \"1\" 再触发一次，答案为 2；代码约定网格元素是字符串。"
  ],
  "lineByLine": [
    "双重循环遍历每个格子。",
    "若 grid[r][c]==\"1\"（且未访问）：islands+=1，调用 dfs/bfs 把相连陆地全部标记。",
    "dfs：越界或不是 \"1\" 返回；否则标记 visited 并朝四邻递归。",
    "返回 islands。"
  ],
  "diagram": "1 1 0\n0 1 0\n1 0 1\n遇1 → 岛+1, 淹掉相连所有1(上下左右)\n岛1: 左上3格; 岛2: 右下1格\n共 2 个岛"
};
