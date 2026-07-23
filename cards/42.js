export default {
  "kind": "code",
  "id": "42",
  "category": "数组/窗口",
  "difficulty": "Hard",
  "title": "接雨水",
  "prompt": "计算柱状图能接住的雨水。",
  "diagram": "柱高 [0,1,0,2]\n     ▕▏\n   ▕▏▕▏      ← 凹槽 1~2 间可蓄水\nleft=0, right=3; 较矮一侧先结算\nleft_max=0 → 0 格; right_max 接管...\n总水量 = 1",
  "quickAnswer": "双指针维护两侧最高柱；处理较矮的一侧时，水位已经由该侧最高柱和对侧当前柱保证。",
  "approach": "双指针维护两侧最高柱；处理较矮的一侧时，水位已经由该侧最高柱和对侧当前柱保证。",
  "explanationFocus": "接雨水：双指针维护两侧最高柱；处理较矮的一侧时，水位已经由该侧最高柱和对侧当前柱保证。",
  "bruteForce": "《接雨水》可枚举所有子数组或窗口再计算指标，复杂度常为 O(n²) 或更高。",
  "invariant": "当前窗口始终满足 接雨水：双指针维护两侧最高柱；处理较矮的一侧时，水位已经由该侧最高柱和对侧当前柱保证。 的约束，辅助结构准确反映窗口内元素。",
  "walkthrough": "演练《接雨水》时逐项移动左右边界，并记录哈希表、队列或计数器变化。",
  "derivation": [
    "为每个位置预存「左边最大值」和「右边最大值」数组，能 O(n) 时间 O(n) 空间求解。",
    "优化：当处理左侧时，只要右端当前高度不低于左端，就说明右侧至少存在一个不低于 left_max 的挡板，左侧水位由 left_max 决定，无需知道右侧完整最大值。右侧对称。",
    "因此从两端向中间扫描，每次结算较矮的一侧，就能在 O(1) 空间内完成。"
  ],
  "edgeCases": [
    "空数组或长度 1 无法蓄水，返回 0。",
    "单调递增/递减柱形没有能蓄水的凹槽，返回 0。",
    "全是相同高度时，每根柱子的左右短板都等于自身，水量为 0。"
  ],
  "code": "# Python\ndef trap(height):\n    if not height:\n        return 0\n    left, right = 0, len(height) - 1\n    left_max = right_max = 0\n    water = 0\n    while left < right:\n        if height[left] <= height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water",
  "codeNotes": [
    "left 指针只能右移，避免重复扫描。",
    "队列中优先保存下标以便淘汰过期元素。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。双指针各最多走一遍数组，只用到几个变量。",
  "followUps": [
    {
      "question": "为什么只维护一侧的 max 就够？",
      "answer": "当处理左侧时，右端当前高度不低于左端，说明右侧至少提供足够高的挡板；因此左侧这一格的水位由 left_max 决定，无需右侧完整最大值。"
    },
    {
      "question": "能否用单调栈？",
      "answer": "可以。按「凹槽」计算，时间仍 O(n) 但需要 O(n) 栈空间；双指针更省内存，是更优解。"
    }
  ],
  "followUpAnswers": [
    "更新最优答案时同时保存左右端点。",
    "维护固定大小窗口和可淘汰的增量统计。"
  ],
  "pitfalls": [
    "没有先判断左右高低就结算，导致使用了错误的（较高的）那一侧最大值。",
    "累加时没用 max(0, ...) 保护，在凹陷处可能加上负水量。"
  ],
  "beginnerSummary": "接雨水问题：给定每根柱子的高度，计算下雨后能蓄多少水。关键直觉是「每根柱子上的水量 = 它左右两侧最高柱子中的较小值 - 自身高度」（若为正）。直接对每个位置找左右最大值需要 O(n) 额外空间；更优的双指针法利用「哪一侧更矮，哪一侧的水位就由该侧决定」这一性质，从两端向中间结算，只需 O(1) 空间。",
  "prerequisites": [
    "某位置的积水高度由「左最高」和「右最高」中的较小者（即「木桶短板」）决定，再减去自身高度。",
    "left、right 是两个指针，分别指向尚未结算的两端；left_max / right_max 保存各自已见过的最高值。",
    "当左侧柱子不高于右侧时，左侧水位一定由 left_max 决定（因为右侧至少提供了一个不低于它的挡板）。"
  ],
  "workedExample": [
    "以 [0,1,0,2] 为例，指针从两端开始。left=0、right=3；height[left]=0 <= height[right]=2，结算左端：left_max=0，积水 0，left 右移到 1。",
    "left=1 时 left_max 更新为 1，下一根 height[2]=0 可接 1-0=1 格水；遇到 height[3]=2 后，右侧已无更高挡板需求，总水量为 1。"
  ],
  "lineByLine": [
    "空列表直接返回 0，避免访问首尾元素越界。",
    "比较两端高度决定本轮结算哪一侧（先处理较矮的一侧）。",
    "更新最高值后累加 max(0, 最高值 - 当前高度)，用 max 保证不会加负水量。",
    "每轮只移动一个指针，因此总扫描为线性。"
  ]
};
