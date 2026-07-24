export default {
  "kind": "code",
  "id": "1",
  "category": "数组/窗口",
  "difficulty": "Easy",
  "title": "两数之和",
  "prompt": "返回和为 target 的两个下标。",
  "diagram": "nums=[2,7,11,15], target=9\nseen={}\n\n读2: need=7 不在 seen → seen{2:0}\n读7: need=2 命中 seen[2]=0 → 返回 [0,1]\n        └ 补数查表法",
  "quickAnswer": "遍历时查找 target-x 是否已出现；查不到再记录当前值和下标。",
  "approach": "遍历时查找 target-x 是否已出现；查不到再记录当前值和下标。",
  "explanationFocus": "两数之和：遍历时查找 target-x 是否已出现；查不到再记录当前值和下标。",
  "bruteForce": "《两数之和》可枚举所有子数组或窗口再计算指标，复杂度常为 O(n²) 或更高。",
  "invariant": "当前窗口始终满足 两数之和：遍历时查找 target-x 是否已出现；查不到再记录当前值和下标。 的约束，辅助结构准确反映窗口内元素。",
  "walkthrough": "演练《两数之和》时逐项移动左右边界，并记录哈希表、队列或计数器变化。",
  "derivation": [
    "双重循环枚举所有配对需要 O(n²)。",
    "把已经扫描的值放进字典，每个新值只查一次补数：若补数已存在就立刻得到两个下标，否则记录当前值。整体降到 O(n)，且只扫一遍。",
    "先查后存很关键：若先存当前值再查，可能把当前值自己当成补数（例如 target=6 且遇到两个 3 时）。"
  ],
  "edgeCases": [
    "空数组或只有一个元素：无法凑成一对，返回空列表。",
    "重复值如 [3,3]、target=6：先记录第一个 3（下标 0），读到第二个 3 时命中第一个，返回 [0,1]，正确。",
    "负数和 target 为负数同样按补数计算，逻辑不变。"
  ],
  "code": "# Python\ndef two_sum(nums, target):\n    seen = {}\n    for i, value in enumerate(nums):\n        need = target - value\n        if need in seen:\n            return [seen[need], i]\n        seen[value] = i\n    return []",
  "codeNotes": [
    "left 指针只能右移，避免重复扫描。",
    "队列中优先保存下标以便淘汰过期元素。"
  ],
  "complexity": "时间 O(n)，空间 O(n)。每个元素被访问一次，字典最多存 n 个条目。",
  "followUps": [
    {
      "question": "为什么不能先把所有值都放进字典再查？",
      "answer": "如果当前值与自己互补（如 target=6、数组含 3），先存完会让代码误把同一个下标使用两次；边扫描边先查再存能自然避免该问题。"
    },
    {
      "question": "题目保证恰好一组时还需返回空列表吗？",
      "answer": "可以保留空列表作为健壮兜底；若题目明确保证有解，调用方也可以直接使用返回的两个下标，不必处理空列表分支。"
    }
  ],
  "followUpAnswers": [
    "更新最优答案时同时保存左右端点。",
    "维护固定大小窗口和可淘汰的增量统计。"
  ],
  "pitfalls": [
    "先存当前值再查补数，导致同一个元素被使用两次（自匹配）。",
    "返回了值而非下标，或返回的两个下标指向同一位置。"
  ],
  "beginnerSummary": "两数之和要求从数组里找出「两个不同位置」的数，使它们的和等于 target，返回它们的下标。最直观的思路是：扫描到当前值 value 时，看它的补数（target - value）之前有没有出现过；用哈希表记录「值 → 下标」，每个新值只查一次补数，整体一次扫描即可。",
  "prerequisites": [
    "字典 seen 把「已经扫描过的值」映射到它的下标，查找和插入平均为 O(1)。",
    "必须先查补数再记录当前值，避免同一个元素被自己当作补数使用两次。",
    "要求返回的是下标（位置），而不是值本身。"
  ],
  "workedExample": [
    "nums=[2,7,11,15]，target=9。读到 2 时记录 seen={2:0}；need=9-2=7，不在 seen 里。",
    "读到 7 时 need=9-7=2，命中 seen[2]=0，于是返回 [0,1]。"
  ],
  "lineByLine": [
    "seen = {} 记录值到下标的映射。",
    "need = target - value 是让当前值凑成 target 的唯一补数。",
    "命中时返回 [seen[need], i]，保证是两个不同的位置。",
    "完整扫描仍无配对时返回空列表作为兜底。"
  ]
};
