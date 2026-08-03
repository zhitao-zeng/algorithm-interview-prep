export default {
  "id": "gr-num-islands",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "岛屿数量(矩阵DFS)",
  "prompt": "给定一个由 \"1\"（陆地）和 \"0\"（水）组成的二维网格，请计算岛屿的个数（岛屿是被水包围、由上下左右相连的陆地组成）？例如网格含两块独立陆地时返回 2？",
  "quickAnswer": "遍历矩阵，每遇到一个未访问的 \"1\" 就用 DFS/BFS 把整块相连陆地标记为已访问，发起次数即岛屿数。时间 O(R*C)，空间 O(R*C)（递归栈）。",
  "approach": "双重循环扫描；发现 grid[r][c]==\"1\" 且未访问即计数加一，并 DFS 把四连通的陆地全部标记为已访问。",
  "explanationFocus": "是什么：把二维网格看成图，每个陆地格是节点、四邻是边；岛屿数量就是该图上\"由 1 构成的连通分量\"个数。",
  "bruteForce": "对每个 \"1\" 都做全图可达性搜索而不标记，重复遍历同一岛屿，退化为 O((RC)^2)。",
  "invariant": "已访问的陆地格恰好属于已被计数过的岛屿，且每个岛屿只被进入一次。",
  "walkthrough": "网格 3x3：第0行 \"1 1 0\"、第1行 \"0 0 0\"、第2行 \"0 0 1\"。扫描到 (0,0) 触发 DFS 标记 (0,0)(0,1)，计数1；继续到 (2,2) 触发 DFS 标记它，计数2；返回 2。",
  "code": "def num_islands(grid):\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    visited = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        visited[r][c] = True\n        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc] and grid[nr][nc] == '1':\n                dfs(nr, nc)\n\n    count = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not visited[i][j]:\n                dfs(i, j)\n                count += 1\n    return count",
  "complexity": "时间 O(R*C)，空间 O(R*C)（visited 矩阵 + 最坏全陆地递归栈）。",
  "beginnerSummary": "像在卫星图上数湖泊：从一个陆地块出发顺岸边走一圈把所有相连的陆地都涂色，再找下一个没涂色的块，数了几块就有几座岛。",
  "diagram": "1 1 0\n0 0 0\n0 0 1\n岛A:(0,0)(0,1)  岛B:(2,2) -> 2",
  "derivation": [
    "为什么需要：图像连通域、地域统计都可归约为网格连通块计数。",
    "怎么实现：矩阵当图，四连通 DFS 标记整块陆地。",
    "有什么代价：递归在长条陆地可能爆栈，可改 BFS/显式栈。",
    "怎么评测：全 0 返回 0；全 1 返回 1；斜对角不算相连。"
  ],
  "edgeCases": [
    "空网格或首行空时返回 0。",
    "全为 \"0\" 返回 0，全为 \"1\" 返回 1。",
    "斜向相邻的 \"1\" 不算同一岛屿（仅四连通）。"
  ],
  "pitfalls": [
    "忘记边界检查 0<=nr<m 导致越界。",
    "误把对角线当作相连，应使用四邻而非八邻。"
  ],
  "prerequisites": [
    "二维数组遍历",
    "DFS/矩阵图"
  ],
  "workedExample": [
    "网格 3x3 含左上两块相连陆地与右下一块孤立陆地。",
    "DFS 标记两块独立区域，计数得 2。"
  ],
  "lineByLine": [
    "空网格直接返回 0，否则取行列数。",
    "dfs 标记当前陆地并向四邻递归。",
    "主循环遇未访问 \"1\" 即 dfs 并 count+=1。"
  ],
  "codeNotes": [
    "visited 与 grid 双数组避免破坏原输入；也可直接把 grid 改为 \"0\" 就地标记。"
  ],
  "followUps": [
    {
      "question": "能否不用额外 visited 数组？",
      "answer": "可以就地把访问过的 grid[r][c] 改为 \"0\"，省去 visited 空间。"
    },
    {
      "question": "用 BFS 还是 DFS 更好？",
      "answer": "两者等价，BFS 用队列不会爆栈，DFS 代码更短。"
    }
  ],
  "followUpAnswers": [
    "可以就地把访问过的 grid[r][c] 改为 \"0\"，省去 visited 空间。",
    "两者等价，BFS 用队列不会爆栈，DFS 代码更短。"
  ],
  "kind": "code"
};
