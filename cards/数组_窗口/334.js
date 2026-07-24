export default {
  "kind": "code",
  "id": "334",
  "category": "数组/窗口",
  "difficulty": "Medium",
  "title": "递增三元子序列",
  "prompt": "判断是否存在 i<j<k 且 nums[i]<nums[j]<nums[k]。",
  "diagram": "nums=[2,1,5,0,4,6]\nfirst=2 → 遇1更小 → first=1\n遇5>first且<∞ → second=5\n遇0 → first=0; 遇4 → second=4\n遇6>second → True (三元组 0,4,6)\nfirst<second<third 成立",
  "quickAnswer": "维护历史扫描中仍可证明存在的递增前缀阈值 first、second；遇到大于 second 的数即组成三元组。",
  "approach": "维护历史扫描中仍可证明存在的递增前缀阈值 first、second；遇到大于 second 的数即组成三元组。",
  "explanationFocus": "递增三元子序列：维护历史扫描中仍可证明存在的递增前缀阈值 first、second；遇到大于 second 的数即组成三元组。",
  "bruteForce": "《递增三元子序列》可枚举所有子数组或窗口再计算指标，复杂度常为 O(n²) 或更高。",
  "invariant": "first、second 表示历史扫描中仍可证明存在的递增前缀阈值；即使 first 更新，已有 first<second 的证据仍保留，后续更大值可作为第三项。",
  "walkthrough": "演练《递增三元子序列》时逐项移动左右边界，并记录哈希表、队列或计数器变化。",
  "derivation": [
    "枚举三元组组合需要 O(n³)；维护所有前缀候选也会浪费空间。",
    "只保留最小的 first 和 second 阈值是安全的：更小的阈值不会减少未来可行的第三个数，而一旦遇到大于 second 的数，就与 first<second<第三数 构成合法三元组。",
    "这是一个贪心思想：用最小代价保留「还可能存在解」的证据。"
  ],
  "edgeCases": [
    "长度小于 3 直接返回 False。",
    "要求严格递增（用 <），相等值不能充当下一项。",
    "全相等或严格递减数组没有三元组，返回 False。"
  ],
  "code": "# Python\ndef increasing_triplet(nums):\n    first = second = float(\"inf\")\n    for value in nums:\n        if value <= first:\n            first = value\n        elif value <= second:\n            second = value\n        else:\n            return True\n    return False",
  "codeNotes": [
    "left 指针只能右移，避免重复扫描。",
    "队列中优先保存下标以便淘汰过期元素。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。只扫描一次数组，只用两个变量。",
  "followUps": [
    {
      "question": "为什么更新 first 不会破坏已经找到的递增关系？",
      "answer": "first、second 表示的是历史扫描中仍可证明存在的递增前缀阈值；把 first 更新得更小并不会丢掉已有的 first<second 证据，因为 second 仍大于旧的 first，后续只要出现大于 second 的数就能作为第三项，下标顺序始终成立。"
    },
    {
      "question": "如何返回一组具体的下标？",
      "answer": "额外保存 first_index 和 second_index；当发现第三个值大于 second 时，返回 [first_index, second_index, 当前下标] 即可。"
    }
  ],
  "followUpAnswers": [
    "更新最优答案时同时保存左右端点。",
    "维护固定大小窗口和可淘汰的增量统计。"
  ],
  "pitfalls": [
    "用 >= 而非 <= 更新 first，导致无法把 first 降到更小、错过更优起点。",
    "误以为需要三个独立指针同时前进，其实先定 first 再定 second 最后等 third 即可。"
  ],
  "beginnerSummary": "判断数组中是否存在下标递增、值也严格递增的三元组（i<j<k 且 nums[i]<nums[j]<nums[k]）。只需「判断是否存在」而不必返回具体三元组。巧妙做法是维护历史扫描中「仍可证明存在的」两个递增阈值 first、second：first 是迄今最小的候选起点，second 是「已找到一个比 first 大的数」后的较小阈值；遇到比 second 还大的数，就说明三元组成立。",
  "prerequisites": [
    "子序列只要求下标递增，中间允许跳过元素；不要求连续。",
    "用无穷大 float(\"inf\") 表示「还没有找到可证明的 first / second 阈值」。",
    "阈值越小越好：更小的 first / second 意味着后面越容易找到第三个更大的数。"
  ],
  "workedExample": [
    "nums=[2,1,5,0,4,6]：先把 first 更新为 1（比初始 2 更小）；读到 5 时 5>first 且 5<second(inf)，于是 second=5。",
    "继续读到 0 把 first 降为 0，读到 4 把 second 降为 4，最后读到 6>second(4)，直接返回 True（三元组如 0,4,6）。"
  ],
  "lineByLine": [
    "value <= first 时把可证明前缀的 first 阈值降得更小，给后面留更大空间。",
    "否则若不超过 second，更新 second 阈值；已有 first<second 的递增证据仍保留。",
    "当 value 既大于 first 又大于 second 时，三元组已按扫描顺序成立，直接返回 True。",
    "循环结束仍无第三值则返回 False。"
  ]
};
