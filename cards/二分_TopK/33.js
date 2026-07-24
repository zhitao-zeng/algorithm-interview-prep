export default {
  "kind": "code",
  "id": "33",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "搜索旋转排序数组",
  "prompt": "在无重复旋转数组中找 target。",
  "quickAnswer": "每轮至少一侧有序；若 target 落在有序侧就收缩到该侧，否则搜索另一侧。",
  "approach": "每轮至少一侧有序；若 target 落在有序侧就收缩到该侧，否则搜索另一侧。",
  "explanationFocus": "搜索旋转排序数组：每轮至少一侧有序；若 target 落在有序侧就收缩到该侧，否则搜索另一侧。",
  "bruteForce": "《搜索旋转排序数组》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。",
  "derivation": [
    "线性扫描是 O(n)，但旋转数组仍「几乎有序」，理应能用二分降到 O(log n)。",
    "关键观察：mid 把数组分成两半，由于只有一个断崖，至少有一半是完全升序的。",
    "先判断哪一半有序，再判断 target 是否落在该有序半的范围内：是则在该半继续二分，否则必在另一半。每轮排除一半，复杂度 O(log n)。"
  ],
  "invariant": "答案始终位于当前搜索区间或 TopK 候选集合中，搜索旋转排序数组：每轮至少一侧有序；若 target 落在有序侧就收缩到该侧，否则搜索另一侧。 没有被错误排除。",
  "walkthrough": "演练《搜索旋转排序数组》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。",
  "edgeCases": [
    "数组未旋转（本就升序）：算法仍成立，左半始终有序，正常二分。",
    "target 不存在：left > right 退出，返回 -1。",
    "长度为 1 或 2：循环与边界判断都正常处理。"
  ],
  "code": "# Python\ndef search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1",
  "codeNotes": [
    "统一区间语义并在循环后验证候选。",
    "TopK 的堆大小应严格受 k 限制。"
  ],
  "complexity": "时间 O(log n)，空间 O(1)。每轮排除一半，只用到左右指针。",
  "followUps": [
    {
      "question": "数组允许重复值时还成立吗？",
      "answer": "重复会让两端和中点相等，无法判断哪半有序；可在相等时收缩 left、right，但最坏复杂度退化为 O(n)。"
    },
    {
      "question": "为什么用 <= 判断左侧有序？",
      "answer": "无重复且闭区间下，left 与 mid 相等代表左侧仍是正常非降序，单元素区间也能被处理。"
    }
  ],
  "followUpAnswers": [
    "重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。",
    "维护大小受限的堆或平衡树。"
  ],
  "pitfalls": [
    "判断左半有序用 nums[left] <= nums[mid] 时等号不能漏（mid==left 的退化情形）。",
    "在「有序半」内判断 target 范围时边界用闭区间 [nums[left], nums[mid]]，别误写成开区间导致漏掉端点。"
  ],
  "beginnerSummary": "在「先升序后断崖」的旋转排序数组里找 target。普通二分依赖全局有序，而旋转数组「至少有一半是完全升序的」：每次用 mid 把区间分成两半，必有一半连续升序。只要判断 mid 落在哪一半、以及 target 是否落在该有序半的范围内，就能决定砍向哪一侧，每轮稳定排除一半。",
  "prerequisites": [
    "旋转排序数组 = 一个升序数组在某个断点被「切两半交换」，形如 [4,5,6,7,0,1,2]，特征是有且仅有一个「下降断崖」。",
    "二分核心：用 mid 把当前区间分成两半，由于断崖至多一个，至少有一半是连续升序的。",
    "判断 mid 属于哪一半，只需比较 nums[mid] 与 nums[left]：若 nums[left] <= nums[mid]，说明 [left,mid] 整段有序。"
  ],
  "workedExample": [
    "nums=[4,5,6,7,0,1,2], target=0。left=0,right=6,mid=3（值7）。nums[left]=4 <= 7，说明 [left,mid] 升序；target=0 不在 [4,7] 内 → 目标在另一半，令 left=mid+1=4。",
    "新区间 [0,1,2]，mid=5（值1）。nums[left]=0 <= 1，[0,1] 升序；0 不在 [0,1] 内 → left=6；mid=6 命中 0，返回 6。",
    "若 target=5：第一轮 [4,7] 升序且 5∈[4,7]，令 right=mid-1 砍左半，继续二分最终命中索引 1。"
  ],
  "lineByLine": [
    "while left <= right: 标准二分闭区间循环。",
    "mid = (left + right) // 2 取下标中点。",
    "if nums[mid] == target: 直接返回 mid。",
    "if nums[left] <= nums[mid]: 说明左半 [left,mid] 升序；再判断 target 是否在 [nums[left], nums[mid]] 内决定砍左或右（注意闭合区间）。",
    "else: 右半有序，同理判断 target 是否落在右半范围内。"
  ],
  "diagram": "nums=[4,5,6,7,0,1,2], target=0\n      l       m       r\nmid=7 > nums[0] → 左半有序\ntarget<nums[0]  → 在右半 [0,1,2]\n→ 收缩右半, 找到 0\n每轮靠\"有序侧\"判断 target 归属, 砍半"
};
