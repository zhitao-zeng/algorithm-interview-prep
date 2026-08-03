export default {
  "id": "gr-dijkstra",
  "category": "搜索/图",
  "difficulty": "Hard",
  "title": "Dijkstra最短路",
  "prompt": "给定带非负权边的图（edges 为 [u,v,w]）和起点 start，求到所有节点的最短距离（不可达为 inf）？例如 n=3, edges=[[0,1,4],[0,2,1],[2,1,2]], start=0 时返回 [0,3,1]？",
  "quickAnswer": "用优先队列的 Dijkstra：每次取当前距离最小的节点，用其松弛邻居；边权非负保证首次出队的距离即为最终最短。时间 O((V+E)logV)，空间 O(V+E)。",
  "approach": "建邻接表存 (邻居,权)；dist 初 inf、起点 0；最小堆存 (距离,节点)，出队若距离已过期则跳过，否则用每条出边尝试松弛。",
  "explanationFocus": "是什么：Dijkstra 是在非负权图上求单源最短路的贪心算法，核心思想是\"已经确定最短的节点不会再被更新\"，所以不断锁定当前最近的未确定节点。",
  "bruteForce": "枚举所有路径取最短为指数级；或不加堆每次线性扫描最小距离，整体 O(V^2)。",
  "invariant": "一旦节点 u 被从堆中弹出（且距离非过期），dist[u] 即为最终最短距离，不再变化。",
  "walkthrough": "n=3, edges=[[0,1,4],[0,2,1],[2,1,2]], start=0：弹 0(dist0)松弛得 d1=4,d2=1；弹 2(dist1)松弛得 d1=min(4,1+2)=3；弹 1 结束，结果 [0,3,1]。",
  "code": "import heapq\n\ndef dijkstra(n, edges, start):\n    adj = [[] for _ in range(n)]\n    for u, v, w in edges:\n        adj[u].append((v, w))\n        adj[v].append((u, w))\n    dist = [float('inf')] * n\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue\n        for v, w in adj[u]:\n            if d + w < dist[v]:\n                dist[v] = d + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist",
  "complexity": "时间 O((V+E)logV)（堆操作），空间 O(V+E)。",
  "beginnerSummary": "像规划从家出发到各个城市的最低油费：每次都先去当前花费最少的城市，到了再看看能不能用更便宜的路更新别的目的地。",
  "diagram": "0 --4-- 1\n \\      /\n  1 --2\ndist: 0:0  2:1  1:3",
  "derivation": [
    "为什么需要：地图导航、网络路由都依赖非负权单源最短路。",
    "怎么实现：最小堆维护\"待确定\"节点，弹出即锁定，用出边松弛邻居。",
    "有什么代价：边权必须非负，负权需用 Bellman-Ford；堆中可能存在过期副本。",
    "怎么评测：不可达为 inf；起点 0；小图手算应一致。"
  ],
  "edgeCases": [
    "边权非负是前提，出现负权会得到错误结果。",
    "不可达节点距离为 inf。",
    "平行边/自环应被正确忽略或取最小。"
  ],
  "pitfalls": [
    "忘记写 if d>dist[u]: continue 导致用过期副本重复处理。",
    "把有向边写成无向，引入本不存在的路径。"
  ],
  "prerequisites": [
    "优先队列/堆",
    "贪心与松弛思想"
  ],
  "workedExample": [
    "n=3, edges=[[0,1,4],[0,2,1],[2,1,2]], start=0。",
    "锁定顺序 0→2→1，最终 [0,3,1]。"
  ],
  "lineByLine": [
    "建带权邻接表。",
    "dist 初 inf，起点 0 入堆。",
    "弹最小距离，过期则跳过，否则松弛邻居并入堆。"
  ],
  "codeNotes": [
    "用 (d,u) 元组入堆，d 在前保证按距离排序；过期副本靠 d>dist[u] 跳过。"
  ],
  "followUps": [
    {
      "question": "有负权边怎么办？",
      "answer": "改用 Bellman-Ford 或 SPFA，Dijkstra 在负权下不再正确。"
    },
    {
      "question": "如何还原最短路径？",
      "answer": "松弛成功时记录 parent[v]=u，结束后回溯。"
    }
  ],
  "followUpAnswers": [
    "改用 Bellman-Ford 或 SPFA，Dijkstra 在负权下不再正确。",
    "松弛成功时记录 parent[v]=u，结束后回溯。"
  ],
  "kind": "code"
};
