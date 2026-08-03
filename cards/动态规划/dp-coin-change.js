export default {
  "id": "dp-coin-change",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "零钱兑换",
  "prompt": "给定不同面额的硬币 coins 和总金额 amount，求凑成 amount 所需的最少硬币个数；若无法凑出则返回 -1？例如 coins=[1,2,5], amount=11 时最少用 5+5+1=3 枚，返回 3？",
  "quickAnswer": "完全背包变体：dp[a] 表示凑出金额 a 的最少硬币数，对每个硬币正序更新 dp[a]=min(dp[a], dp[a-coin]+1)。时间 O(amount*len(coins))，空间 O(amount)。",
  "approach": "dp 初值 inf、dp[0]=0；遍历每个硬币，对金额从 coin 到 amount 正序松弛，取\"不用该币/用一枚该币\"的最小值。",
  "explanationFocus": "是什么：零钱兑换是\"求组合最小个数\"的完全背包问题，状态 dp[a] 为凑出金额 a 的最少硬币数，每种硬币可重复使用。",
  "bruteForce": "递归枚举每种硬币用多少枚，组合爆炸；或 DFS 暴力搜索所有凑法取最小，指数级。",
  "invariant": "处理完前几种硬币后，dp[a] 为用这些硬币能凑出 a 的最少枚数；最终 dp[amount] 即答案。",
  "walkthrough": "coins=[1,2,5], amount=11：dp[0]=0；用 1 后所有 dp[a]=a；用 2 后 dp[2]=1,dp[3]=2...；用 5 后 dp[5]=1,dp[10]=2,dp[11]=dp[6]+1=min(6,2+1)=3，返回 3。",
  "code": "def coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
  "complexity": "时间 O(amount * |coins|)，空间 O(amount)。",
  "beginnerSummary": "像用最少硬币凑出零钱：从 0 元开始，每加入一种面值就看看\"用它换掉一部分金额\"是不是比原来的换法更省硬币。",
  "diagram": "dp: 0 1 2 3 4 5 ... 11\n币1: 0 1 2 3 4 5 ... 11\n币2: 0 1 1 2 2 3 ... 6\n币5: 0 1 1 2 2 1 ... 3",
  "derivation": [
    "为什么需要：最小张数找零、最少步数类问题都可归约为完全背包取最小。",
    "怎么实现：dp 初 inf，正序对每个硬币松弛。",
    "有什么代价：amount 极大时 O(amount*k) 偏慢；无可行解返回 -1。",
    "怎么评测：amount=0 返回 0；无解返回 -1；coins 含 1 必可行。"
  ],
  "edgeCases": [
    "amount=0 直接返回 0。",
    "无法凑出（如无 1 且 amount 非组合）返回 -1。",
    "硬币含重复面值时不影响结果。"
  ],
  "pitfalls": [
    "初始 dp 全 0 而非 inf，导致 min 永远取 0。",
    "忘记判断最终是否为 inf 而错误返回大数。"
  ],
  "prerequisites": [
    "完全背包",
    "min 松弛转移"
  ],
  "workedExample": [
    "coins=[1,2,5], amount=11。",
    "正序更新后 dp[11]=3（5+5+1）。"
  ],
  "lineByLine": [
    "dp 初 inf，dp[0]=0 为基准。",
    "遍历每种硬币。",
    "金额正序松弛 dp[a]=min(dp[a], dp[a-c]+1)。"
  ],
  "codeNotes": [
    "初始 inf 表示\"不可达\"，dp[0]=0 是递推地基；返回前检查 inf。"
  ],
  "followUps": [
    {
      "question": "如何输出具体用了哪些硬币？",
      "answer": "记录 used[a] 为凑 a 时最后用掉的硬币，回溯 amount 逐步减。"
    },
    {
      "question": "若求组合数（多少种凑法）怎么改？",
      "answer": "dp[a]+=dp[a-c] 且外层循环金额、内层循环硬币，避免顺序重复计数。"
    }
  ],
  "followUpAnswers": [
    "记录 used[a] 为凑 a 时最后用掉的硬币，回溯 amount 逐步减。",
    "dp[a]+=dp[a-c] 且外层循环金额、内层循环硬币，避免顺序重复计数。"
  ],
  "kind": "code"
};
