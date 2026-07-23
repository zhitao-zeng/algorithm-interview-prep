export default {
  "kind": "code",
  "id": "139",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "单词拆分",
  "prompt": "判断字符串能否由词典词拼出。",
  "quickAnswer": "dp[i] 表示前 i 个字符可拆；枚举末词起点 j。",
  "approach": "dp[i] 表示前 i 个字符可拆；枚举末词起点 j。",
  "explanationFocus": "单词拆分：dp[i] 表示前 i 个字符可拆；枚举末词起点 j。",
  "bruteForce": "《单词拆分》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "回溯暴力会重复计算子问题。",
    "以「结尾位置」为状态做 DP，每个位置只需看「前面哪些位置已可拆分 + 当前段是否是单词」，复用子结果。",
    "加入 max_word_len 剪枝，避免对超长后缀做无谓字典查询。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 单词拆分：dp[i] 表示前 i 个字符可拆；枚举末词起点 j。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《单词拆分》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "s 为空：按约定通常返回 True（空串可拆）。",
    "字典为空或不含任何可用词：返回 False。",
    "单词可重复使用（题目允许）。"
  ],
  "code": "# Python\ndef word_break(s, word_dict):\n    words = set(word_dict)\n    max_word_len = max((len(word) for word in words), default=0)\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for end in range(1, len(s) + 1):\n        start_min = max(0, end - max_word_len)\n        for start in range(start_min, end):\n            if dp[start] and s[start:end] in words:\n                dp[end] = True\n                break\n    return dp[-1]",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n·L²)（L 为词典最大词长，含切片复制成本），空间 O(n)",
  "followUps": [
    {
      "question": "如何返回一种拆分方案？",
      "answer": "dp[end] 变为保存前驱 start；命中时记录 parent[end]=start，最后从 n 反向切片。"
    },
    {
      "question": "如何优化长词典？",
      "answer": "按最大词长限制 start 范围，或使用 Trie 从每个可达位置向前匹配。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "忘记 dp[0]=True 的「空串基准」，导致所有后续判断缺乏起点。",
    "未限制枚举长度，对很长的后缀反复查字典，效率骤降（用 max_word_len 剪枝）。"
  ],
  "beginnerSummary": "给定字符串 s 和单词字典，判断能否把 s 拆成字典里的单词首尾拼接。DP：dp[i] 表示「s 的前 i 个字符能否被拆分」。转移时，枚举以 i 结尾的一个单词（长度不超过 max_word_len），若该单词在字典里且它前面的部分 dp[j] 为 True，则 dp[i]=True。只要 dp[len(s)] 为 True 即可拆分。",
  "prerequisites": [
    "dp[i] = s[0:i] 是否可被字典单词拼接。",
    "转移：存在某个 j<i 使得 dp[j] 为真且 s[j:i] 是字典单词 → dp[i]=True。",
    "预存 max_word_len 可限制枚举的单词长度，避免无谓尝试超长后缀。"
  ],
  "workedExample": [
    "s=\"leetcode\", wordDict=[\"leet\",\"code\"]。dp[0]=True（空串）；dp[4]=True（\"leet\" 在字典）；dp[8]=True（\"code\" 在字典且 dp[4] 真）→ 可拆分。",
    "s=\"applepenapple\", dict=[\"apple\",\"pen\"]：dp[5]=T, dp[8]=T(\"pen\"接apple), dp[13]=T → 可拆分。"
  ],
  "lineByLine": [
    "dp=[False]*(n+1)；dp[0]=True。",
    "遍历 i 从 1 到 n；遍历长度 L 从 1 到 min(i, max_word_len)：若 dp[i-L] 且 s[i-L:i] 在 wordSet，则 dp[i]=True 并 break。",
    "返回 dp[n]。"
  ],
  "diagram": "s=\"leetcode\", wordDict=[\"leet\",\"code\"]\ndp[i]=s[0:i] 可否拆分\ndp[0]=T\ndp[4]=T(leet)  dp[8]=T(leet+code)\ndp[0]=T → dp[4]=T → dp[8]=T ✓"
};
