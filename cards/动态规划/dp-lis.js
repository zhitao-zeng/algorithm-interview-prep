export default {
  "id": "dp-lis",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "最长递增子序列",
  "prompt": "给定一个整数数组 nums，求其中最长严格递增子序列的长度（子序列不要求连续）？例如 nums=[10,9,2,5,3,7,101,18] 的最长递增子序列为 [2,3,7,101] 或 [2,5,7,101]，长度 4？",
  "quickAnswer": "O(n^2) 解法：dp[i] 以 nums[i] 结尾的 LIS 长度，枚举 j<i 且 nums[j]<nums[i] 取最大加一。更优可用二分贪心做到 O(n log n)。时间 O(n^2)，空间 O(n)。",
  "approach": "dp[i]=1 初值；对每个 i 遍历之前所有 j，若 nums[j]<nums[i] 则 dp[i]=max(dp[i], dp[j]+1)；答案为 max(dp)。",
  "explanationFocus": "是什么：最长递增子序列（LIS）是在原序列中挑出尽量长且保持递增顺序的子序列；dp[i] 表示\"必须以第 i 个元素结尾\"的 LIS 长度。",
  "bruteForce": "枚举所有 2^n 个子序列并检查是否递增，指数级。",
  "invariant": "处理完前 i 个后，dp[i] 恰为以 nums[i] 结尾的 LIS 长度，全局答案取 dp 最大值。",
  "walkthrough": "nums=[10,9,2,5,3,7]：dp 依次为 1,1,1,2,2,3（5 接 2 得2；3 接 2 得2；7 接 5/3 得3），答案 3。",
  "code": "def length_lis(nums):\n    if not nums:\n        return 0\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[j] < nums[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)",
  "complexity": "时间 O(n^2)，空间 O(n)。（二分贪心可优化到 O(n log n)）",
  "beginnerSummary": "像从一排高矮不一的人里挑出尽量多且从左到右越来越高的队列，可以跳过某些人，只要剩下的人身高递增即可。",
  "diagram": "nums: 10 9 2 5 3 7\ndp  :  1 1 1 2 2 3\nLIS: 2,3,7 (len 3)",
  "derivation": [
    "为什么需要：股票买卖、序列比对常需最长递增/公共趋势。",
    "怎么实现：以每个位置结尾的 dp，向前找更小者转移。",
    "有什么代价：O(n^2) 对长序列偏慢，可换 tails 二分法。",
    "怎么评测：空数组返回 0；全递减返回 1；与手算一致。"
  ],
  "edgeCases": [
    "空数组返回 0。",
    "全递减序列 LIS 长度为 1。",
    "相等元素不算严格递增，应排除。"
  ],
  "pitfalls": [
    "用 <= 而不是 < ，把相等也算进递增。",
    "只返回 dp[-1] 而非 max(dp)，当最长不在末尾时出错。"
  ],
  "prerequisites": [
    "子序列 vs 子数组",
    "DP状态定义"
  ],
  "workedExample": [
    "nums=[10,9,2,5,3,7]。",
    "dp 最大值 3，对应 [2,3,7] 或 [2,5,7]。"
  ],
  "lineByLine": [
    "空数组返回 0。",
    "dp 全 1 表示单元素自身长度 1。",
    "双循环向前找更小者更新 dp[i]，返回 max(dp)。"
  ],
  "codeNotes": [
    "关键返回 max(dp) 而不是 dp[n-1]，因为最长 LIS 不一定以末元素结尾。"
  ],
  "followUps": [
    {
      "question": "O(n log n) 怎么做？",
      "answer": "维护 tails 数组存各长度最小结尾，用二分插入，tails 长度即 LIS 长度。"
    },
    {
      "question": "如何还原一条 LIS？",
      "answer": "在二分法或 dp 中记录每个元素的前驱索引，回溯得到序列。"
    }
  ],
  "followUpAnswers": [
    "维护 tails 数组存各长度最小结尾，用二分插入，tails 长度即 LIS 长度。",
    "在二分法或 dp 中记录每个元素的前驱索引，回溯得到序列。"
  ],
  "kind": "code"
};
