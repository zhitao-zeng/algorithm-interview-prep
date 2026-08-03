export default {
  "id": "dp-lcs",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "最长公共子序列",
  "prompt": "给定两个字符串 a 和 b，求它们的最长公共子序列长度（子序列可不连续）？例如 a=\"abcde\", b=\"ace\" 的 LCS 为 \"ace\"，长度 3？",
  "quickAnswer": "二维 DP：dp[i][j] 为 a 前 i 个字符与 b 前 j 个字符的 LCS 长度；字符相等则 +1，否则取左/上最大值。时间 O(|a|*|b|)，空间 O(|a|*|b|)（可压一维）。",
  "approach": "建 (m+1)x(n+1) 表，dp[0][*]=dp[*][0]=0；双循环：a[i-1]==b[j-1] 时 dp[i][j]=dp[i-1][j-1]+1，否则 dp[i][j]=max(dp[i-1][j], dp[i][j-1])。",
  "explanationFocus": "是什么：最长公共子序列（LCS）是两字符串中都出现、顺序一致但不必连续的字符序列；dp[i][j] 表示两前缀的 LCS 长度，靠\"匹配则延伸、否则继承较大前缀\"递推。",
  "bruteForce": "枚举 a 的所有子序列（2^|a|）并在 b 中查是否出现，指数级。",
  "invariant": "填完第 i 行后，dp[i][j] 恰为 a[0:i] 与 b[0:j] 的 LCS 长度。",
  "walkthrough": "a=\"abcde\", b=\"ace\"：当 a[0]='a' 配 b[0]='a' 时 dp[1][1]=1；'c' 配 'c' dp[3][2]=2；'e' 配 'e' dp[5][3]=3；最终返回 3。",
  "code": "def lcs(a, b):\n    m, n = len(a), len(b)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m):\n        for j in range(n):\n            if a[i] == b[j]:\n                dp[i+1][j+1] = dp[i][j] + 1\n            else:\n                dp[i+1][j+1] = max(dp[i][j+1], dp[i+1][j])\n    return dp[m][n]",
  "complexity": "时间 O(|a|*|b|)，空间 O(|a|*|b|)（可优化到 O(min(|a|,|b|))）。",
  "beginnerSummary": "像两个人各写一句话，找出两句话里都出现且先后顺序一致的字，越长越好；遇到相同字就一起往后走，否则各自试试哪边能接上。",
  "diagram": "    '' a b c d e\n''  0  0 0 0 0 0\na   0  1 1 1 1 1\nc   0  1 1 2 2 2\ne   0  1 1 2 2 3",
  "derivation": [
    "为什么需要：文本差异对比（diff）、DNA 比对都基于 LCS。",
    "怎么实现：二维表，匹配则对角线 +1，否则取上/左最大。",
    "有什么代价：两串都很长时内存大，可滚动数组压一维。",
    "怎么评测：空串返回 0；完全相同返回长度；与手算一致。"
  ],
  "edgeCases": [
    "任一字符串为空返回 0。",
    "两串完全相同返回其长度。",
    "无公共字符返回 0。"
  ],
  "pitfalls": [
    "用 < 而非 <= 比较下标，搞混 0-based 与 1-based 偏移。",
    "匹配时误写成 dp[i][j]+1 而非 dp[i-1][j-1]+1。"
  ],
  "prerequisites": [
    "二维DP",
    "前缀子序列概念"
  ],
  "workedExample": [
    "a=\"abcde\", b=\"ace\"。",
    "匹配 a、c、e 得 LCS 长度 3。"
  ],
  "lineByLine": [
    "建 (m+1)x(n+1) 全 0 表。",
    "双循环遍历字符。",
    "相等走对角线 +1，否则取上/左较大值。"
  ],
  "codeNotes": [
    "用 i+1/j+1 索引对齐\"前缀长度\"，避免繁琐的 -1 偏移；首行首列为空前缀基准。"
  ],
  "followUps": [
    {
      "question": "如何输出一条具体 LCS？",
      "answer": "从 dp[m][n] 反向追溯：相等则收该字符并走左上，否则走向较大的一侧。"
    },
    {
      "question": "空间怎么优化？",
      "answer": "只用两行滚动即可，因为每行只依赖上一行和本行左侧。"
    }
  ],
  "followUpAnswers": [
    "从 dp[m][n] 反向追溯：相等则收该字符并走左上，否则走向较大的一侧。",
    "只用两行滚动即可，因为每行只依赖上一行和本行左侧。"
  ],
  "kind": "code"
};
