export default {
  "id": "gr-bfs-shortest",
  "category": "搜索/图",
  "difficulty": "Easy",
  "title": "BFS最短路(无权图)",
  "prompt": "在一个无权无向图中，给定起点 start，求它到其余每个节点的最短边数距离（不可达记为 -1）？例如 n=4, edges=[[0,1],[1,2],[2,3]], start=0 时返回 [0,1,2,3]？",
  "quickAnswer": "从起点入队，按层扩散：第一次访问某节点时的距离就是最短距离。时间 O(V+E)，空间 O(V)（队列与距离数组）。",
  "approach": "建邻接表，dist 数组初始化为 -1（表示未达），起点 dist=0 入队；每弹出节点 u，对其未访问邻居 w 设 dist=dist[u]+1 并入队。",
  "explanationFocus": "是什么：在边权均为 1 的图上，BFS 天然按\"距离起点层数\"逐层扩展，因此第一次碰到节点即最短路径。",
  "bruteForce": "对每个目标点各跑一次 DFS/BFS 求距离，总体 O(V*(V+E))；或枚举所有路径取最短，指数级。",
  "invariant": "队中节点按距离非递减排列；任意时刻 dist[w] 一旦被赋值即为全局最短距离，不再更新。",
  "walkthrough": "n=4, edges=[[0,1],[1,2],[2,3]], start=0：dist[0]=0 入队；出 0 入 1(dist=1)；出 1 入 2(dist=2)；出 2 入 3(dist=3)；得 [0,1,2,3]。",
  "code": "from collections import deque\n\ndef bfs_shortest(n, edges, start):\n    adj = [[] for _ in range(n)]\n    for u, v in edges:\n        adj[u].append(v)\n        adj[v].append(u)\n    dist = [-1] * n\n    dist[start] = 0\n    q = deque([start])\n    while q:\n        u = q.popleft()\n        for w in adj[u]:\n            if dist[w] == -1:\n                dist[w] = dist[u] + 1\n                q.append(w)\n    return dist",
  "complexity": "时间 O(V+E)，空间 O(V)（队列与 dist 各 O(V)，邻接表 O(E)）。",
  "beginnerSummary": "像往平静水面丢一颗石子，波纹一圈圈向外扩散，第一圈到的点就是离你最近的点，第二圈更远，依次类推。",
  "diagram": "0 - 1 - 2 - 3\n层0  层1  层2  层3\ndist:0  1   2   3",
  "derivation": [
    "为什么需要：最短路径在无权图上是最基础问题，社交距离、迷宫步数都归约于此。",
    "怎么实现：队列分层扩展，邻居首次访问即记录距离并入队。",
    "有什么代价：无权前提，若边带权必须用 Dijkstra；空间随点数线性增长。",
    "怎么评测：不可达点返回 -1；起点自身为 0；与手算层数一致。"
  ],
  "edgeCases": [
    "起点到某些节点不可达，对应距离应为 -1。",
    "起点等于终点时距离为 0。",
    "存在自环/重边不影响首次访问距离。"
  ],
  "pitfalls": [
    "把\"未访问\"判断写成 != -1 之外条件导致重复入队。",
    "误用于带权图，得到错误距离。"
  ],
  "prerequisites": [
    "队列数据结构",
    "图的邻接表"
  ],
  "workedExample": [
    "n=4, edges=[[0,1],[1,2],[2,3]], start=0。",
    "分层扩散得 dist=[0,1,2,3]。"
  ],
  "lineByLine": [
    "建双向邻接表。",
    "dist 初 -1，起点置 0 入队。",
    "出队节点 u，未访问邻居 w 设距 dist[u]+1 并入队。"
  ],
  "codeNotes": [
    "用 dist==-1 兼作\"未访问\"标记，省去单独 visited 数组。"
  ],
  "followUps": [
    {
      "question": "如何还原具体最短路径？",
      "answer": "在设置 dist[w]=dist[u]+1 时记录 parent[w]=u，回溯 parent 即可还原路径。"
    },
    {
      "question": "BFS 与 DFS 求最短路有何区别？",
      "answer": "BFS 在无权图保证最短，DFS 不保证，仅能做连通性判定。"
    }
  ],
  "followUpAnswers": [
    "在设置 dist[w]=dist[u]+1 时记录 parent[w]=u，回溯 parent 即可还原路径。",
    "BFS 在无权图保证最短，DFS 不保证，仅能做连通性判定。"
  ],
  "kind": "code"
};
