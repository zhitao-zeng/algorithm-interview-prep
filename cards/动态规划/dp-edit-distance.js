export default {
  "id": "dp-edit-distance",
  "category": "动态规划",
  "difficulty": "Hard",
  "title": "编辑距离",
  "prompt": "给定两字符串 a 和 b，允许插入、删除、替换字符，求把 a 变成 b 的最少操作次数？例如 a=\"horse\", b=\"ros\" 最少需要 3 次（horse→rorse→rose→ros）？",
  "quickAnswer": "二维 DP：dp[i][j] 为 a 前 i 字符变到 b 前 j 字符的最小代价；字符相等则继承 dp[i-1][j-1]，否则取插入/删除/替换的最小值 +1。时间 O(|a|*|b|)，空间 O(|a|*|b|)。",
  "approach": "初始化首行首列为 0..n/0..m；双循环：a[i-1]==b[j-1] 时 dp[i][j]=dp[i-1][j-1]，否则 dp[i][j]=1+min(删 dp[i-1][j], 插 dp[i][j-1], 替 dp[i-1][j-1])。",
  "explanationFocus": "是什么：编辑距离（Levenshtein）衡量两字符串的相似度，定义为从一字符串变到另一所需的最少单字符编辑（插入/删除/替换）次数，用二维 DP 描述\"前缀到前缀\"的最小代价。",
  "bruteForce": "枚举所有编辑操作序列尝试把 a 变成 b，组合爆炸不可行。",
  "invariant": "填到 dp[i][j] 时，其值为 a[0:i] 与 b[0:j] 的最小编辑代价，且每个状态只依赖左、上、左上三格。",
  "walkthrough": "a=\"horse\", b=\"ros\"：初始化后，h≠r 使 dp[1][1]=1；逐格松弛，最终 dp[5][3]=3，对应 horse→rorse(替)→rose(替)→ros(删)。",
  "code": "def edit_distance(a, b):\n    m, n = len(a), len(b)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    for i in range(m):\n        for j in range(n):\n            if a[i] == b[j]:\n                dp[i+1][j+1] = dp[i][j]\n            else:\n                dp[i+1][j+1] = 1 + min(dp[i][j+1], dp[i+1][j], dp[i][j])\n    return dp[m][n]",
  "complexity": "时间 O(|a|*|b|)，空间 O(|a|*|b|)（可压一维）。",
  "beginnerSummary": "像把一篇草稿改成定稿：可以加一个字、删一个字、或把一个字改成另一个，每改一次记一分，目标是用最少次数改完。",
  "diagram": "    '' r o s\n''   0 1 2 3\nh    1 1 2 3\no    2 2 1 2\nr    3 2 2 2\ns    4 3 3 2\ne    5 4 4 3",
  "derivation": [
    "为什么需要：拼写纠错、模糊搜索、DNA 比对都依赖编辑距离。",
    "怎么实现：二维 DP，三操作取最小 +1，匹配则继承。",
    "有什么代价：长串内存大，可滚动成一维数组。",
    "怎么评测：相同串返回 0；一为空返回另一长度。"
  ],
  "edgeCases": [
    "a 或 b 为空时返回另一串长度。",
    "两串相等返回 0。",
    "仅插入/仅删除对称一致。"
  ],
  "pitfalls": [
    "初始化首行首列漏掉，导致基准错。",
    "替换代价写成 min 不含 dp[i][j] 而漏掉替换分支。"
  ],
  "prerequisites": [
    "二维DP",
    "LCS思想"
  ],
  "workedExample": [
    "a=\"horse\", b=\"ros\"。",
    "dp 表填完得最小代价 3。"
  ],
  "lineByLine": [
    "首行首列初始化为对应长度（纯插入/删除代价）。",
    "双循环比较字符。",
    "相等继承左上，否则三操作取最小加一。"
  ],
  "codeNotes": [
    "dp[i][0]=i 表示把长 i 的串删空需 i 次；这是递推的\"边界地基\"。"
  ],
  "followUps": [
    {
      "question": "如何输出具体编辑操作序列？",
      "answer": "从 dp[m][n] 回溯，按\"左上(匹配/替换)、上(删除)、左(插入)\"选择最小来源并记操作。"
    },
    {
      "question": "若替换代价不同怎么办？",
      "answer": "把替换的 +1 换成具体替换代价 cost(a[i],b[j])，插入删除也可设不同权。"
    }
  ],
  "followUpAnswers": [
    "从 dp[m][n] 回溯，按\"左上(匹配/替换)、上(删除)、左(插入)\"选择最小来源并记操作。",
    "把替换的 +1 换成具体替换代价 cost(a[i],b[j])，插入删除也可设不同权。"
  ],
  "kind": "code"
};
