export default {
  "kind": "code",
  "id": "198",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "打家劫舍",
  "prompt": "不能抢相邻房屋时的最大金额。",
  "quickAnswer": "dp[i]=前 i 间最大值，转移为不抢 i 或抢 i 加 dp[i-2]。",
  "approach": "dp[i]=前 i 间最大值，转移为不抢 i 或抢 i 加 dp[i-2]。",
  "explanationFocus": "打家劫舍：dp[i]=前 i 间最大值，转移为不抢 i 或抢 i 加 dp[i-2]。",
  "bruteForce": "《打家劫舍》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "暴力枚举抢/不抢所有组合是指数级。",
    "每栋房只有两种互斥选择，且只与「前一栋、前两栋」有关，符合最优子结构 → DP。",
    "滚动变量把空间从 O(n) 降到 O(1)。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 打家劫舍：dp[i]=前 i 间最大值，转移为不抢 i 或抢 i 加 dp[i-2]。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《打家劫舍》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "空数组：返回 0。",
    "单元素：返回该元素。",
    "两元素：返回较大者（不能抢相邻）。"
  ],
  "code": "# Python\ndef rob(nums):\n    two_back = one_back = 0\n    for amount in nums:\n        two_back, one_back = one_back, max(one_back, two_back + amount)\n    return one_back",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n)，空间 O(1)（滚动变量）。",
  "followUps": [
    {
      "question": "如何恢复抢了哪些房屋？",
      "answer": "保留完整 dp 后从末尾比较 dp[i-1] 与 dp[i-2]+nums[i-1]，沿较优转移反向走。"
    },
    {
      "question": "房屋首尾相邻（环形）怎么办？",
      "answer": "分别求不抢第一间和不抢最后一间的线性结果，取较大值。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "递推式写成 dp[i]=max(dp[i-1], dp[i-2]+nums[i]) 漏掉「抢当前且用 i-2」的正确接法。",
    "滚动变量更新顺序错，导致 prev2 没跟上，用到过期的 dp[i-2]。"
  ],
  "beginnerSummary": "一排房子，每个有金额，不能抢相邻两户，求能抢到的最大总金额。动态规划：走到第 i 户时，最优 = max(「抢第 i 户 + 前 i-2 户的最优」，「不抢第 i 户，沿用前 i-1 户的最优」)。只需两个滚动变量即可 O(1) 空间实现。",
  "prerequisites": [
    "不能抢相邻户 → 抢第 i 户时，第 i-1 户必不能抢，只能接 dp[i-2]。",
    "dp[i] = max(nums[i] + dp[i-2], dp[i-1])。",
    "状态只依赖前两项，可用 prev2、prev1 两个变量滚动，省去数组。"
  ],
  "workedExample": [
    "nums=[2,7,9,3,1]。dp: dp[0]=2；dp[1]=max(7,2)=7；dp[2]=max(9+2,7)=11；dp[3]=max(3+7,11)=11；dp[4]=max(1+11,11)=12。答案 12。",
    "用滚动变量：prev2=2,prev1=7；i=2 cur=max(9+2,7)=11→prev2=7,prev1=11；i=3 cur=max(3+7,11)=11；i=4 cur=max(1+11,11)=12。"
  ],
  "lineByLine": [
    "若空返回 0；若只有一户返回它。",
    "prev2 = nums[0]，prev1 = max(nums[0], nums[1])。",
    "从 i=2 起：cur = max(nums[i] + prev2, prev1)；然后 prev2, prev1 = prev1, cur。",
    "返回 prev1。"
  ],
  "diagram": "[2,7,9,3,1]\ndp[i]=max(抢i+dp[i-2], 不抢+dp[i-1])\ndp: 2, 7, 11, 11, 12\n抢 2→9→1 = 12   (跳过7和3)"
};
