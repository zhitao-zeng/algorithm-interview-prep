export default {
  "kind": "code",
  "id": "53",
  "category": "动态规划",
  "difficulty": "Easy",
  "title": "最大子数组和",
  "prompt": "求连续子数组最大和。",
  "quickAnswer": "Kadane：以当前位置结尾的最好和，要么从当前数重启要么接前缀。",
  "approach": "Kadane：以当前位置结尾的最好和，要么从当前数重启要么接前缀。",
  "explanationFocus": "最大子数组和：Kadane：以当前位置结尾的最好和，要么从当前数重启要么接前缀。",
  "bruteForce": "《最大子数组和》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "枚举所有子数组 O(n²) 太慢。",
    "动态规划：以 i 结尾的最优 = max(nums[i], cur + nums[i])；cur 一旦为负就舍去重来。",
    "全局最大值在遍历中持续刷新，一次扫描 O(n) 解决。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 最大子数组和：Kadane：以当前位置结尾的最好和，要么从当前数重启要么接前缀。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《最大子数组和》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "全负数：返回最大的那个负数（cur 归零逻辑需配 -inf 初值才正确）。",
    "单元素：直接返回它。",
    "全为正数：返回整个数组和。"
  ],
  "code": "# Python\ndef max_sub_array(nums):\n    if not nums:\n        return 0\n    values = iter(nums)\n    cur = best = next(values)\n    for value in values:\n        cur = max(value, cur + value)\n        best = max(best, cur)\n    return best",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。",
  "followUps": [
    {
      "question": "如何返回子数组边界？",
      "answer": "记录 start；当 value 大于 cur+value 时把 start 设为当前位置，并在刷新 best 时保存 start、end。"
    },
    {
      "question": "为什么丢弃负 cur 是安全的？",
      "answer": "任何后缀接上负数都会比从后一个位置重新开始更小，不可能成为更优前缀。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "max_so_far 初值设 0 会让全负数组错误返回 0 而非最大负值。",
    "cur 归零时误把当前元素也丢掉（应为 cur=max(num, cur+num)，正元素会自然承接）。"
  ],
  "beginnerSummary": "在整数数组中找一个「连续」子数组，使其和最大（Kadane 算法）。核心直觉：走到某个位置 i 时，以 i 结尾的最大子数组和，要么「接在前面的最优子数组后面」，要么「从 i 自己重新开始」——取两者较大者。由于负的累计和只会拖累后面，一旦当前累计和变负就归零重起。",
  "prerequisites": [
    "子数组必须连续，不能跳过元素。",
    "维护 cur = 以当前元素结尾的最大子数组和；max_so_far = 全局见过的最大。",
    "关键：若 cur < 0，继续接它会让后面更小，不如从当前元素重新起步（cur 归零）。"
  ],
  "workedExample": [
    "[-2,1,-3,4]：cur 从 -2 开始，读到 1 时重启为 1。",
    "读到 -3 后 cur=-2，读到 4 时比较 4 与 -2+4=2，重启得到 4；全程 best 记录最大值。"
  ],
  "lineByLine": [
    "cur = 0，max_so_far = -inf（兼容全负数组）。",
    "遍历每个数：cur = max(num, cur + num)；max_so_far = max(max_so_far, cur)。",
    "返回 max_so_far。"
  ],
  "diagram": "nums=[-2,1,-3,4,-1,2,1,-5,4]\ncur:  -2 → 1 → -2 → 4 → 3 → 5 → 6 → 1 → 5\nmax = 6   (子数组 [4,-1,2,1])\ncur<0 则归零重起"
};
