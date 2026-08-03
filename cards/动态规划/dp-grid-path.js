export default {
  "id": "dp-grid-path",
  "category": "动态规划",
  "difficulty": "Easy",
  "title": "不同路径(网格DP)",
  "prompt": "一个 m 行 n 列的网格，机器人从左上角只能向右或向下走，求到达右下角共有多少条不同路径？例如 m=3, n=2 时有 3 条路径？",
  "quickAnswer": "二维 DP：dp[i][j] 到 (i,j) 的路径数，dp[i][j]=dp[i-1][j]+dp[i][j-1]，首行首列均为 1。时间 O(m*n)，空间可优化到 O(n)。",
  "approach": "建 m x n 表，dp[0][*] 与 dp[*][0] 全 1（只有一条直走路径）；其余每格等于上方格 + 左方格之和。",
  "explanationFocus": "是什么：不同路径是网格上的计数 DP，状态 dp[i][j] 表示从左上到格子 (i,j) 的路径数，由于只能右/下，到一格只能来自它的上边或左边，故两者相加。",
  "bruteForce": "递归枚举每一步向右或向下的所有走法，指数级且不记忆。",
  "invariant": "填完第 i 行后，dp[i][j] 恰为到 (i,j) 的路径数，且只依赖其上格与左格。",
  "walkthrough": "m=3,n=2 网格：首行 [1,1]，第二行 [1,2]（2=1+1），第三行 [1,3]（3=1+2）；右下角 dp[2][1]=3。",
  "code": "def unique_paths(m, n):\n    dp = [[0] * n for _ in range(m)]\n    for i in range(m):\n        for j in range(n):\n            if i == 0 or j == 0:\n                dp[i][j] = 1\n            else:\n                dp[i][j] = dp[i-1][j] + dp[i][j-1]\n    return dp[m-1][n-1]",
  "complexity": "时间 O(m*n)，空间 O(m*n)（可优化到 O(n) 一维）。",
  "beginnerSummary": "像走迷宫只能向右或向下：到每个路口的办法数 = 从上方来的办法 + 从左边来的办法，第一排和第一列都只有直走一条路。",
  "diagram": "1 1\n1 2\n1 3\n右下角 = 3 条",
  "derivation": [
    "为什么需要：组合计数、路径规划常归约为网格走法数。",
    "怎么实现：首行首列置 1，其余格等于上+左。",
    "有什么代价：可观察其等于 C(m+n-2, m-1) 用组合数 O(m) 算。",
    "怎么评测：m=n=1 返回 1；含障碍需另行处理（变 0）。"
  ],
  "edgeCases": [
    "m=1 或 n=1 时只有 1 条直路。",
    "m=n=1 返回 1。",
    "若有障碍格应把该格 dp 置 0（本题未含）。"
  ],
  "pitfalls": [
    "首行首列没初始化为 1 而留 0，导致全 0。",
    "索引写反把 m、n 弄混，行列对调。"
  ],
  "prerequisites": [
    "二维DP",
    "组合计数直觉"
  ],
  "workedExample": [
    "m=3, n=2。",
    "填表得 dp[2][1]=3 条路径。"
  ],
  "lineByLine": [
    "建 m x n 全 0 表。",
    "首行首列置 1（边缘只有一条路）。",
    "内部格 dp[i][j]=上+左，返回右下角。"
  ],
  "codeNotes": [
    "边界 if i==0 or j==0 同时覆盖了首行与首列初始化，简洁且正确。"
  ],
  "followUps": [
    {
      "question": "若有障碍物怎么办？",
      "answer": "初始化时障碍格保持 0，转移时正常加，障碍格永远不会贡献路径。"
    },
    {
      "question": "能用组合数直接算吗？",
      "answer": "能，总共走 m+n-2 步选 m-1 步向下，答案为 C(m+n-2, m-1)。"
    }
  ],
  "followUpAnswers": [
    "初始化时障碍格保持 0，转移时正常加，障碍格永远不会贡献路径。",
    "能，总共走 m+n-2 步选 m-1 步向下，答案为 C(m+n-2, m-1)。"
  ],
  "kind": "code"
};
