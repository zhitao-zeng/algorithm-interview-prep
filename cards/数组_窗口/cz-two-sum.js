export default {
  "id": "cz-two-sum",
  "category": "数组/窗口",
  "difficulty": "Easy",
  "title": "两数之和(哈希)",
  "prompt": "给定一个整数数组 nums 和一个目标值 target，请在数组中找出和为 target 的两个整数，并返回它们的下标。例如 nums = [2,7,11,15]，target = 9 时，输出 [0,1]？",
  "quickAnswer": "用哈希表记录\"已遍历过的值 -> 下标\"。每遍历到一个新数 x，检查 target-x 是否已在表中：在则返回两数下标，否则把 x 存入表。只需一遍遍历，时间 O(n)，空间 O(n)。",
  "approach": "从左到右扫描数组，维护一个字典 seen 映射 值->下标。对当前元素 x，若 target-x 在 seen 中，说明之前见过互补数，直接返回 [seen[target-x], i]；否则把 x 及其下标写入 seen。",
  "explanationFocus": "是什么：哈希表（散列表）以平均 O(1) 的查询/插入代价建立\"值到位置\"的映射，把\"找互补数\"从线性查找变成常数查找。",
  "bruteForce": "两层 for 循环枚举所有数对 (i,j)，检查 nums[i]+nums[j]==target，时间 O(n^2)，空间 O(1)。",
  "invariant": "集合 seen 恰好保存了下标 0..i-1 中已遍历过的元素值到其下标的映射；尚未存在一对和为 target 的数。",
  "walkthrough": "nums=[2,7,11,15], target=9。i=0,x=2：9-2=7 不在 seen，存{2:0}。i=1,x=7：9-7=2 在 seen，返回 [seen[2]=0, 1] = [0,1]。",
  "code": "def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n    return []",
  "complexity": "O(n) / O(n)",
  "beginnerSummary": "就像你手里有补数清单，每遇到一个数就先看清单里有没有能和它凑成目标的伙伴，有就配对，没有就把它自己也记进清单。",
  "diagram": "nums: [2, 7, 11, 15]   target=9\nseen: {}  -> 遇2 记{2:0}\n      遇7 查 9-7=2 命中 -> [0,1]",
  "derivation": [
    "为什么需要：暴力 O(n^2) 在大规模数组上超时，需要把\"找补数\"加速到 O(1)。",
    "怎么实现：一遍遍历，用哈希表存\"值->下标\"，边走边查 target-x 是否出现过。",
    "有什么代价：额外 O(n) 空间换时间；且只能处理\"恰好一对\"的假设（题目保证有解）。",
    "怎么评测：返回下标对，验证 nums[a]+nums[b]==target 且 a!=b。"
  ],
  "edgeCases": [
    "同一个元素不能使用两次（即不能返回 [i,i]）；",
    "数组中有重复值时以首次出现的下标为准；",
    "无解时应返回空（题目一般保证有唯一解）；",
    "元素可能为负或零。"
  ],
  "pitfalls": [
    "先查后存，避免把当前元素当成自己的补数；",
    "用 enumerate 同时拿值与下标，别只用值丢了位置。"
  ],
  "prerequisites": [
    "哈希表/字典的平均 O(1) 查找",
    "一遍扫描的枚举技巧"
  ],
  "workedExample": [
    "输入 nums=[2,7,11,15], target=9 -> 输出 [0,1]",
    "输入 nums=[3,2,4], target=6 -> 输出 [1,2]"
  ],
  "lineByLine": [
    "seen = {} 初始化空字典；",
    "enumerate 同时取得下标 i 和值 x；",
    "判断 target-x 是否已在 seen 中，在则立即返回两下标；",
    "否则把当前值 x 与下标 i 写入 seen 供后续查询。"
  ],
  "codeNotes": [
    "先查询后插入，保证不会用同一元素两次；",
    "题目保证有解时无需处理无解分支，但保留 return [] 更健壮。"
  ],
  "followUps": [
    {
      "question": "如果要返回所有满足条件的数对（可重复元素、可多对）怎么办？",
      "answer": "先统计每个值的频率，再用双指针或哈希枚举补数，并按频率控制每个值的使用次数，注意去重。"
    },
    {
      "question": "如果要求返回的是数值而不是下标？",
      "answer": "直接返回 [target-x, x] 即可，但要注意重复元素与去重，可用集合记录已输出的数对。"
    }
  ],
  "followUpAnswers": [
    "先统计每个值的频率，再用双指针或哈希枚举补数，并按频率控制每个值的使用次数，注意去重。",
    "直接返回 [target-x, x] 即可，但要注意重复元素与去重，可用集合记录已输出的数对。"
  ],
  "kind": "code"
};
