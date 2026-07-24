export default {
  "kind": "code",
  "id": "72",
  "category": "动态规划",
  "difficulty": "Hard",
  "title": "编辑距离与 WER 回溯",
  "prompt": "求编辑距离，并解释 WER 的 S/D/I 回溯。",
  "quickAnswer": "dp 记录最少编辑；从右下沿取得最优的前驱反向走即可累计替换、删除、插入。",
  "approach": "dp 记录最少编辑；从右下沿取得最优的前驱反向走即可累计替换、删除、插入。",
  "explanationFocus": "编辑距离与 WER 回溯：dp 记录最少编辑；从右下沿取得最优的前驱反向走即可累计替换、删除、插入。",
  "bruteForce": "《编辑距离与 WER 回溯》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "暴力枚举操作序列不可行。",
    "最优子结构：最后一字符要么匹配（继承），要么通过一次操作对齐，取最小；由此导出 DP 转移。",
    "二维表自底向上，每格 O(1)，总 O(mn)。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 编辑距离与 WER 回溯：dp 记录最少编辑；从右下沿取得最优的前驱反向走即可累计替换、删除、插入。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《编辑距离与 WER 回溯》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "任一为空：距离为另一串长度（全插入/删除）。",
    "两串相同：距离 0。",
    "长度差很大：DP 仍能正确处理。"
  ],
  "code": "# Python\ndef edit_distance_with_ops(ref, hyp):\n    m, n = len(ref), len(hyp)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            same = ref[i - 1] == hyp[j - 1]\n            dp[i][j] = dp[i - 1][j - 1] if same else 1 + min(\n                dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\n    i, j = m, n\n    substitutions = deletions = insertions = 0\n    while i or j:\n        if i and j and ref[i - 1] == hyp[j - 1] and dp[i][j] == dp[i - 1][j - 1]:\n            i, j = i - 1, j - 1\n        elif i and j and dp[i][j] == dp[i - 1][j - 1] + 1:\n            substitutions += 1\n            i, j = i - 1, j - 1\n        elif i and dp[i][j] == dp[i - 1][j] + 1:\n            deletions += 1\n            i -= 1\n        else:\n            insertions += 1\n            j -= 1\n    return {'distance': dp[m][n], 'S': substitutions, 'D': deletions, 'I': insertions,\n            'wer': (substitutions + deletions + insertions) / m if m else 0.0}",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(m·n)，空间 O(m·n)（可优化到 O(min(m,n)) 滚动）。",
  "followUps": [
    {
      "question": "为什么不能只看距离就得到 WER？",
      "answer": "同一个最短距离可能由不同数量的替换、删除、插入组成；WER 需要沿具体前驱回溯并分类。"
    },
    {
      "question": "如何压缩空间？",
      "answer": "只要距离可用两行；若仍需操作序列，可保存父指针，或用 Hirschberg 等分治方法。"
    }
  ],
  "followUpAnswers": [
    "只需距离时保留两行；需要操作序列则保留父指针或重算。",
    "回溯才能区分相同距离中的替换、删除和插入。"
  ],
  "pitfalls": [
    "误把「替换」当成删除+插入两步（实际替换一步即可，转移里用左上+1 而非上+左+2）。",
    "初始化只填了 dp[0][0]，漏掉首行首列的基准（删光/插满的代价）。"
  ],
  "beginnerSummary": "把 word1 变成 word2 的最少操作数（插入、删除、替换各计 1 步）。二维 DP：dp[i][j] 表示 word1 前 i 个字符变到 word2 前 j 个字符的最小代价。若当前字符相同，直接沿用 dp[i-1][j-1]；否则取「插入/删除/替换」三种操作的最小值 +1。",
  "prerequisites": [
    "三种操作：插入（在 word1 加一个字符，对应 dp[i][j-1]+1）、删除（去掉 word1 末字符，dp[i-1][j]+1）、替换（dp[i-1][j-1]+1）。",
    "dp[i][j] 依赖左、上、左上三个方向。",
    "两字符相等时无需操作，代价等于「都去掉末字符」的 dp[i-1][j-1]。"
  ],
  "workedExample": [
    "word1=\"horse\", word2=\"ros\"。DP 表填出：h→r 行、o→o 列等，最终 dp[5][3]=3（如 horse→rorse→rose→ros，3 步）。",
    "若末字符相同（如 \"kitten\" vs \"sitting\" 的末位 n/n），该格直接取左上值不 +1。"
  ],
  "lineByLine": [
    "建 (m+1)×(n+1) dp；dp[i][0]=i（删光 word1），dp[0][j]=j（插入 j 个）。",
    "双重循环：若 word1[i-1]==word2[j-1]，dp[i][j]=dp[i-1][j-1]；否则 dp[i][j]=1+min(左,上,左上)。",
    "返回 dp[m][n]。"
  ],
  "diagram": "word1=\"horse\" word2=\"ros\"  编辑距离\n    r o s\nh   1 2 3\no   2 1 2\nr   3 2 1\ns   4 3 2\ne   5 4 3\n距离 = 3  (插入/删除/替换取最小+1)"
};
