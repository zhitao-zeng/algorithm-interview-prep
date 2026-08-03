export default {
  "id": "gr-mst-kruskal",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "最小生成树(Kruskal)",
  "prompt": "给定连通无向图的边集 edges（每条 [u,v,w] 带权），求权值和最小且能连通所有节点的生成树边集合？例如 edges=[[0,1,1],[1,2,2],[0,2,2]] 时最优取前两条权值和 3？",
  "quickAnswer": "Kruskal 把所有边按权升序排序，依次加入并用并查集判断是否成环，不成环就保留；最终选中的 n-1 条边即最小生成树。时间 O(E logE)，空间 O(V)。",
  "approach": "边按权重排序；遍历边，用并查集查两端是否同根，不同根则合并并把该边加入 MST。",
  "explanationFocus": "是什么：最小生成树是用最小的边权总和把图中所有节点连通且不含环的子图；Kruskal 用\"贪心加边 + 并查集避环\"实现。",
  "bruteForce": "枚举所有 C(E, V-1) 种选边组合判断是否连通且最小，组合数爆炸不可行。",
  "invariant": "已选边集合始终是无环森林；每加入一条边都使连通块数减一。",
  "walkthrough": "edges=[[0,1,1],[1,2,2],[0,2,2]]：排序后取 (0,1,1) 合并；再取 (1,2,2) 与 1 不同根合并；取 (0,2,2) 时 0、2 已同根跳过；MST 权值和=3。",
  "code": "def kruskal(n, edges):\n    parent = list(range(n))\n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    edges = sorted(edges, key=lambda e: e[2])\n    mst = []\n    for u, v, w in edges:\n        pu, pv = find(u), find(v)\n        if pu != pv:\n            parent[pu] = pv\n            mst.append((u, v, w))\n    return mst",
  "complexity": "时间 O(E logE)（排序主导），空间 O(V)（并查集）。",
  "beginnerSummary": "像用最省的预算把若干村庄用路连起来：先把最便宜的路一条条修，但若某条路会把已经连通的村庄再连成圈就舍弃，直到全通。",
  "diagram": "0 -1- 1\n \\   /\n  2-2-  (0,2,2 成环跳过)\nMST: (0,1,1)(1,2,2) 和=3",
  "derivation": [
    "为什么需要：布线、管网、聚类等场景要在连通前提下最小化总成本。",
    "怎么实现：边升序 + 并查集，跨越不同连通块就保留。",
    "有什么代价：依赖并查集效率；图不连通时得到的是最小生成森林。",
    "怎么评测：返回边权之和应等于理论最小；含 n-1 条边且无环。"
  ],
  "edgeCases": [
    "图不连通时得到的是最小生成森林而非树。",
    "边权相等时多种 MST 都正确。",
    "自环应直接跳过不影响结果。"
  ],
  "pitfalls": [
    "忘记先按权排序而按输入顺序加边，得到非最小。",
    "并查集合并写反根方向导致连通性判断出错。"
  ],
  "prerequisites": [
    "并查集",
    "贪心算法"
  ],
  "workedExample": [
    "edges=[[0,1,1],[1,2,2],[0,2,2]]。",
    "排序后贪心加 (0,1,1)、(1,2,2)，跳过成环边，和=3。"
  ],
  "lineByLine": [
    "边按权升序排序。",
    "遍历边，find 两端根。",
    "根不同则合并并把边加入 mst。"
  ],
  "codeNotes": [
    "排序后贪心是正确性关键；用并查集 O(1) 判环。"
  ],
  "followUps": [
    {
      "question": "与 Prim 算法有何取舍？",
      "answer": "Prim 适合稠密图（O(E logV) 用堆），Kruskal 适合稀疏图且实现简单。"
    },
    {
      "question": "如何求次小生成树？",
      "answer": "枚举删除 MST 中每条边后再求最小生成树，取最小，或换一条最小非树边。"
    }
  ],
  "followUpAnswers": [
    "Prim 适合稠密图（O(E logV) 用堆），Kruskal 适合稀疏图且实现简单。",
    "枚举删除 MST 中每条边后再求最小生成树，取最小，或换一条最小非树边。"
  ],
  "kind": "code"
};
