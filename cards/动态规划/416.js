export default {
  "kind": "code",
  "id": "416",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "分割等和子集",
  "prompt": "是否可分成和相等的两组。",
  "quickAnswer": "总和为奇数直接否；0/1 背包倒序更新能否凑到 sum/2。",
  "approach": "总和为奇数直接否；0/1 背包倒序更新能否凑到 sum/2。",
  "explanationFocus": "分割等和子集：总和为奇数直接否；0/1 背包倒序更新能否凑到 sum/2。",
  "bruteForce": "《分割等和子集》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "暴力枚举所有子集指数级。",
    "转为 0/1 背包：dp[j] 由「不选当前数 dp[j]」与「选当前数 dp[j-num]」合并；逆序遍历容量避免同一数用多次。",
    "只关心可行性（布尔），比求最大价值更简单。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 分割等和子集：总和为奇数直接否；0/1 背包倒序更新能否凑到 sum/2。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《分割等和子集》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "总和为奇数：直接 False。",
    "有元素大于 target：该元素无法被选入任一部分，dp 自然不会标记（若它恰等于 target 则可行）。",
    "空数组：sum=0，target=0，dp[0]=True → 返回 True（依题意）。"
  ],
  "code": "# Python\ndef can_partition(nums):\n    total = sum(nums)\n    if total % 2:\n        return False\n    target = total // 2\n    dp = [False] * (target + 1)\n    dp[0] = True\n    for value in nums:\n        for current in range(target, value - 1, -1):\n            dp[current] = dp[current] or dp[current - value]\n    return dp[target]",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n·target)，空间 O(target)。",
  "followUps": [
    {
      "question": "为什么不能正序更新？",
      "answer": "正序会让刚写入的 dp[current] 在同一轮再次被使用，相当于重复选择同一个数字。"
    },
    {
      "question": "如何恢复具体子集？",
      "answer": "保存每个和第一次变真的 value 和前驱和，最后从 target 反向追踪选择。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "容量 j 正序遍历会导致同一数字被重复使用（变成完全背包），必须逆序。",
    "没先判 sum 为奇数，浪费后续计算且可能漏掉「不可能」情形。"
  ],
  "beginnerSummary": "能否把数组分成和相等的两部分？等价于「能否从数组中选出一些数，使其和恰好等于总和的一半」。这是 0/1 背包：背包容量 target=sum/2，每个数要么选要么不选，问能否恰好装满。若总和为奇数直接不可能；否则做布尔型背包 DP。",
  "prerequisites": [
    "总和 sum 为奇数 → 无法平分，直接返回 False。",
    "目标 target = sum/2；问题变成「子集和能否等于 target」（0/1 背包可行性）。",
    "dp[j] 表示「能否凑出和 j」，每个数只能使用一次。"
  ],
  "workedExample": [
    "nums=[1,5,11,5]，sum=22，target=11。能否凑出 11？11 本身就在数组里 → True。或 1+5+5=11 → True。",
    "nums=[1,2,3,5]，sum=11 奇数 → 直接 False。"
  ],
  "lineByLine": [
    "算 sum；若奇数返回 False；target=sum//2。",
    "dp=[False]*(target+1)；dp[0]=True（和为 0 总能凑出）。",
    "对每个 num，j 从 target 逆序到 num：dp[j] = dp[j] or dp[j-num]。",
    "返回 dp[target]。"
  ],
  "diagram": "nums=[1,5,11,5] sum=22, target=11\n0/1 背包: 能否凑出 11?\n11 = 11 ✓ (单个)  或 1+5+5 = 11\ndp[容量] 布尔可达 → True"
};
