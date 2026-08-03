export default {
  "id": "gr-union-find",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "并查集",
  "prompt": "给定 n 个孤立节点和一系列等价关系 edges，请实现并查集（Disjoint Set Union）支持判断任意两节点是否连通？例如 n=5, edges=[[0,1],[2,3],[3,4]] 时 0 与 1 连通、0 与 2 不连通？",
  "quickAnswer": "用\"带路径压缩的按秩合并\"并查集：find 时把节点直接挂到根上，union 时把矮树并入高树，使单次操作接近 O(1)，整体近乎 O(E·α(V))。",
  "approach": "维护 parent 与 rank 数组；find 用迭代并路径压缩，union 比较两树秩，小秩挂大秩下，秩相等时选一个为根并自增秩。",
  "explanationFocus": "是什么：并查集是一种维护\"等价类/连通块\"的数据结构，支持把两个集合合并（union）和查询两元素是否同属一类（find），本质是森林中每棵树代表一个集合。",
  "bruteForce": "每次查询都沿边做 BFS 判断连通性，单次 O(V+E)，m 次查询退化为 O(m(V+E))。",
  "invariant": "每棵树的根唯一代表该集合；路径压缩后从任意节点到根的每一步都必须指向更浅层节点。",
  "walkthrough": "n=5：union(0,1) 使 parent[1]=0；union(2,3) 再 union(3,4) 使 2,3,4 同根；find(0)==find(1) 为 True，find(0)==find(2) 为 False。",
  "code": "def make_uf(n):\n    parent = list(range(n))\n    rank = [0] * n\n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n\n    def union(a, b):\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return False\n        if rank[ra] < rank[rb]:\n            parent[ra] = rb\n        elif rank[ra] > rank[rb]:\n            parent[rb] = ra\n        else:\n            parent[rb] = ra\n            rank[ra] += 1\n        return True\n\n    return find, union",
  "complexity": "时间近 O(E·α(V))（α 为反阿克曼函数，实际常数级），空间 O(V)。",
  "beginnerSummary": "像给朋友分帮派：每人先认自己当老大，合并两帮时让小帮派认大帮派老大，查找时一路把小弟直接挂到真正老大名下，以后查询飞快。",
  "diagram": "0←1      2←3←4\n帮派A     帮派B(rank 1)\nfind(3)=2, find(4)=2 -> 连通",
  "derivation": [
    "为什么需要：动态连通性（网络、最小生成树、连通块计数）需要高效的合并与查询。",
    "怎么实现：parent 指向代表元，find 路径压缩、union 按秩合并。",
    "有什么代价：递归 find 可改迭代防爆栈；需要额外 rank 数组维持平衡。",
    "怎么评测：union 已连通返回 False；多次合并后 find 应反映真实等价类。"
  ],
  "edgeCases": [
    "union 同一对已连通节点应返回 False 且不改变结构。",
    "n=1 时 find 直接返回自身。",
    "链式大量 union 必须靠路径压缩避免退化成链。"
  ],
  "pitfalls": [
    "只压缩路径却忘记按秩合并，最坏退化 O(V)。",
    "union 时直接 parent[a]=b 而不比较根，可能拼错树。"
  ],
  "prerequisites": [
    "树与森林基础",
    "递归/迭代"
  ],
  "workedExample": [
    "n=5, union(0,1), union(2,3), union(3,4)。",
    "find(0)==find(1) 为 True；find(0)==find(2) 为 False。"
  ],
  "lineByLine": [
    "parent 初值各指自己，rank 全 0。",
    "find 迭代上溯并路径压缩。",
    "union 比较根秩，小挂大、等秩时一树自增秩。"
  ],
  "codeNotes": [
    "path compression 写 parent[x]=parent[parent[x]] 再 x=parent[x]，迭代安全不爆栈。"
  ],
  "followUps": [
    {
      "question": "如何统计当前连通块个数？",
      "answer": "维护一个计数器，初始为 n，每次成功 union 时减一。"
    },
    {
      "question": "并查集能支持删除吗？",
      "answer": "标准并查集不支持高效删除，通常用\"虚点\"技巧或改用动态连通结构。"
    }
  ],
  "followUpAnswers": [
    "维护一个计数器，初始为 n，每次成功 union 时减一。",
    "标准并查集不支持高效删除，通常用\"虚点\"技巧或改用动态连通结构。"
  ],
  "kind": "code"
};
