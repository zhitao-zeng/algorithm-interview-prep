export default {
  "id": "gr-dfs-cc",
  "category": "搜索/图",
  "difficulty": "Easy",
  "title": "DFS与连通分量",
  "prompt": "给定一个 n 个节点、edges 条无向边的图，请用深度优先搜索统计其中连通分量的个数？例如 n=5, edges=[[0,1],[1,2],[3,4]] 时应返回 2 个连通分量？",
  "quickAnswer": "对每个未访问节点发起一次 DFS，每发起一次就代表发现一个新的连通分量，最终发起次数即为分量数。时间复杂度 O(V+E)，空间复杂度 O(V+E)（邻接表加访问标记）。",
  "approach": "建邻接表，维护 visited 数组；遍历所有节点，遇到未访问者就以它为根做 DFS 把整块连通区域标为已访问，计数器加一。",
  "explanationFocus": "是什么：连通分量是图中\"互相可达\"的极大节点集合；DFS 通过一次遍历把整块连通区域全部标记，从而把图切成若干独立分量。",
  "bruteForce": "对每个节点都尝试和其余所有节点做可达性判断（如反复 BFS），总体退化为 O(V*(V+E))，且重复计算严重。",
  "invariant": "任何时候 visited 为 True 的节点恰好是已经被某个 DFS 树覆盖的连通分量节点，且每个分量只被进入一次。",
  "walkthrough": "图 n=5, edges=[[0,1],[1,2],[3,4]]：从 0 起 DFS 访问 0→1→2，分量计数=1；再从 3 起 DFS 访问 3→4，计数=2；节点 4 已访问跳过，最终返回 2。",
  "code": "def count_components(n, edges):\n    adj = [[] for _ in range(n)]\n    for u, v in edges:\n        adj[u].append(v)\n        adj[v].append(u)\n    visited = [False] * n\n\n    def dfs(u):\n        visited[u] = True\n        for w in adj[u]:\n            if not visited[w]:\n                dfs(w)\n\n    comps = 0\n    for i in range(n):\n        if not visited[i]:\n            dfs(i)\n            comps += 1\n    return comps",
  "complexity": "时间 O(V+E)，空间 O(V+E)（邻接表 O(E)、递归栈与 visited 各 O(V)）。",
  "beginnerSummary": "想象一张散落的点和线，DFS 像顺着线一路走到底并把踩过的点涂色，每次换一个没涂色的点重新走，走了几轮就有几团连在一起的点。",
  "diagram": "0---1---2     3---4\n\n[0,1,2] 一团\n[3,4]   一团  => 2 个连通分量",
  "derivation": [
    "为什么需要：很多图问题（网络连通性、岛屿统计）必须先知道图被分成了几块互不相连的区域。",
    "怎么实现：用邻接表存储，逐节点检查 visited，未访问就 DFS 把它所在整块标记，计数器加一。",
    "有什么代价：DFS 用递归可能遇深图爆栈，可改显式栈；空间与边数线性相关。",
    "怎么评测：对空图返回点数；单点无边返回 n；环、自环、重边都应正确计数且只计一次。"
  ],
  "edgeCases": [
    "n=0 或 edges 为空时返回 n（每个孤立点是一个分量）。",
    "存在自环或重边时不能与正常边重复计数。",
    "图完全连通时应返回 1。"
  ],
  "pitfalls": [
    "忘记建反向边导致有向式遍历漏掉无向边。",
    "DFS 用递归在链式大图上可能爆栈，需改迭代或增大限制。"
  ],
  "prerequisites": [
    "图与邻接表表示",
    "DFS/递归基础"
  ],
  "workedExample": [
    "输入 n=5, edges=[[0,1],[1,2],[3,4]]。",
    "DFS(0) 标记 0,1,2；DFS(3) 标记 3,4；返回 2。"
  ],
  "lineByLine": [
    "建 adj 邻接表并把每条无向边双向加入。",
    "visited 记录已访问节点，dfs 递归标记连通块。",
    "主循环遇到未访问节点就 dfs 一次并 comps+=1。"
  ],
  "codeNotes": [
    "dfs 为闭包，直接复用外层 adj/visited，递归出口是\"邻居已访问\"。"
  ],
  "followUps": [
    {
      "question": "如何同时返回每个分量包含哪些节点？",
      "answer": "在 dfs 内收集节点到列表，每发现新分量就新建一个列表并把该块节点 append 进去。"
    },
    {
      "question": "DFS 和并查集哪种更适合动态加边？",
      "answer": "并查集支持高效动态合并与查询连通性，DFS 更适合一次性静态统计。"
    }
  ],
  "followUpAnswers": [
    "在 dfs 内收集节点到列表，每发现新分量就新建一个列表并把该块节点 append 进去。",
    "并查集支持高效动态合并与查询连通性，DFS 更适合一次性静态统计。"
  ],
  "kind": "code"
};
