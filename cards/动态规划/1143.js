export default {
  "kind": "code",
  "id": "1143",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "最长公共子序列",
  "prompt": "求两个字符串的 LCS 长度。",
  "quickAnswer": "字符相等取左上加一，否则取上方和左方较大值。",
  "approach": "字符相等取左上加一，否则取上方和左方较大值。",
  "explanationFocus": "最长公共子序列：字符相等取左上加一，否则取上方和左方较大值。",
  "bruteForce": "《最长公共子序列》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "暴力枚举子序列是指数级。",
    "最优子结构：最后字符若相同则一起收缩，否则分别尝试去掉一侧，取最优 → 自然导出 DP 转移。",
    "二维表自底向上填，每个格子 O(1)，总 O(mn)。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 最长公共子序列：字符相等取左上加一，否则取上方和左方较大值。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《最长公共子序列》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "任一字符串为空：LCS 长度为 0。",
    "两串完全相同：LCS = 串长。",
    "无任何公共字符：返回 0。"
  ],
  "code": "# Python\ndef longest_common_subsequence(a, b):\n    rows, cols = len(a), len(b)\n    dp = [[0] * (cols + 1) for _ in range(rows + 1)]\n    for i in range(1, rows + 1):\n        for j in range(1, cols + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[rows][cols]",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(m·n)，空间 O(m·n)（可优化到 O(min(m,n)) 滚动数组）。",
  "followUps": [
    {
      "question": "如何恢复具体 LCS 字符串？",
      "answer": "从右下角回溯：相等就记录字符并走左上，不等就走 dp 较大的上方或左方。"
    },
    {
      "question": "空间能否压缩？",
      "answer": "只求长度时保留一维 dp 并从左到右更新，同时用 prev_diag 保存左上旧值。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "把「子序列」误当成「子串」，错误地要求连续（应允许跳过字符）。",
    "索引错位：dp 用 i-1/j-1 对应字符，循环边界没对齐导致越界或漏算。"
  ],
  "beginnerSummary": "给定两字符串，求它们的最长公共子序列（不要求连续，但顺序一致）。经典二维 DP：dp[i][j] 表示 text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度。若两字符相等，dp[i][j]=dp[i-1][j-1]+1；否则取「去掉 text1 末字符」与「去掉 text2 末字符」两种情况的最大值。",
  "prerequisites": [
    "子序列不要求连续，只要求下标递增、字符相同。",
    "dp[i][j] 依赖左上（两字符都退一格）、上、左三个方向。",
    "字符相等时一定可以「把这个字符接在公共子序列末尾」，长度 +1。"
  ],
  "workedExample": [
    "text1=\"abcde\", text2=\"ace\"。DP 表（行列匹配）：a 行对 a 列得 1，c 行对 c 列得 2，e 行对 e 列得 3。LCS=\"ace\" 长度 3。",
    "若遇不等（如 b 对 c），取上/左较大者延续之前的最优。"
  ],
  "lineByLine": [
    "建 (m+1)×(n+1) 的 dp，首行首列全 0（空串 LCS 为 0）。",
    "双重循环 i,j：若 text1[i-1]==text2[j-1]，dp[i][j]=dp[i-1][j-1]+1；else dp[i][j]=max(dp[i-1][j], dp[i][j-1])。",
    "返回 dp[m][n]。"
  ],
  "diagram": "text1=\"abcde\" text2=\"ace\"  LCS\n  a c e\na 1 1 1\nb 1 1 1\nc 1 2 2\nd 1 2 2\ne 1 2 3\nLCS=\"ace\" 长3  (DP对角线递推)"
};
