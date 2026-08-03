export default {
  "id": "gr-topo",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "拓扑排序",
  "prompt": "给定 n 个节点和若干有向边 edges（表示任务依赖 u 必须先于 v），请给出一个满足所有依赖的拓扑顺序；若图中存在环则返回空列表？例如 n=4, edges=[[0,1],[1,2],[0,3]] 可返回 [0,1,3,2] 等？",
  "quickAnswer": "用 Kahn 算法：不断取出入度为 0 的节点排入结果，并删去其出边减邻居入度；若最终排序长度小于 n 则说明有环。时间 O(V+E)，空间 O(V+E)。",
  "approach": "建邻接表与入度数组，把所有入度为 0 的节点入队；每次出队节点加入答案，并对其每个邻居入度减一，减到 0 则入队。",
  "explanationFocus": "是什么：拓扑排序是把有向无环图(DAG)的节点排成一列，使所有边都从前指向后；本质是不断\"拿走没有前置依赖的节点\"。",
  "bruteForce": "枚举所有节点全排列并逐一检查是否满足全部边约束，复杂度 O(V!*E)，仅理论可行。",
  "invariant": "已输出节点集合的所有依赖都已满足；队列中始终只含\"当前入度为 0\"的节点。",
  "walkthrough": "n=4, edges=[[0,1],[1,2],[0,3]]：入度 [0,1,1,1]，入队 0；出 0 后 1、3 入度变 0 入队；出 1 后 2 入度变 0 入队；出 3、2，得 [0,1,3,2]。",
  "code": "from collections import deque\n\ndef topo_sort(n, edges):\n    adj = [[] for _ in range(n)]\n    indeg = [0] * n\n    for u, v in edges:\n        adj[u].append(v)\n        indeg[v] += 1\n    q = deque([i for i in range(n) if indeg[i] == 0])\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for w in adj[u]:\n            indeg[w] -= 1\n            if indeg[w] == 0:\n                q.append(w)\n    return order if len(order) == n else []",
  "complexity": "时间 O(V+E)，空间 O(V+E)（邻接表、入度、队列）。",
  "beginnerSummary": "像排课表：每门课可能要先修别的课，先把所有\"没有先修要求\"的课排上，上完一门就解锁它的后续课，循环下去。",
  "diagram": "0 --> 1 --> 2\n \\      /\n  --> 3\n入度: 0:0  1:1  2:1  3:1",
  "derivation": [
    "为什么需要：任务调度、编译依赖、课程排布都要求无环的线性顺序。",
    "怎么实现：Kahn 算法统计入度，反复取出入度 0 节点并消除其出边。",
    "有什么代价：只能用于 DAG，遇环需返回失败；可用 DFS 染色法替代。",
    "怎么评测：输出长度应为 n；随便一条合法顺序即可，多种答案都算对。"
  ],
  "edgeCases": [
    "图含环时应返回空列表而非部分顺序。",
    "多个入度 0 节点时顺序不唯一，任意合法即可。",
    "n=1 无边时直接返回 [0]。"
  ],
  "pitfalls": [
    "忘记判断 len(order)==n 而把有环图输出成部分序列。",
    "用 DFS 法时染色状态管理混乱导致误判环。"
  ],
  "prerequisites": [
    "有向图与入度概念",
    "队列/BFS"
  ],
  "workedExample": [
    "n=4, edges=[[0,1],[1,2],[0,3]]。",
    "Kahn 依次取 0、1、3、2，输出长度 4 即合法。"
  ],
  "lineByLine": [
    "建邻接表并统计每个节点入度。",
    "入度为 0 的节点全部入队作为起点。",
    "出队即入答案，邻居入度减一，归零则入队；最后比对长度判环。"
  ],
  "codeNotes": [
    "用 len(order)==n 检测环：若有环必有节点永远入度>0 进不了答案。"
  ],
  "followUps": [
    {
      "question": "如何输出字典序最小的拓扑序？",
      "answer": "把队列换成最小堆（优先队列），每次取出编号最小的入度 0 节点。"
    },
    {
      "question": "DFS 染色法如何实现？",
      "answer": "三色标记：白未访问、灰在栈中、黑已完成；遇到灰即发现回边成环。"
    }
  ],
  "followUpAnswers": [
    "把队列换成最小堆（优先队列），每次取出编号最小的入度 0 节点。",
    "三色标记：白未访问、灰在栈中、黑已完成；遇到灰即发现回边成环。"
  ],
  "kind": "code"
};
