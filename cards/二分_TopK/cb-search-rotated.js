export default {
  "id": "cb-search-rotated",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "旋转有序数组查找",
  "prompt": "给定在未知下标处旋转过一次的升序数组 nums（无重复元素）和目标 target，请在 O(log n) 内查找 target 的下标，不存在返回 -1。例如 nums = [4,5,6,7,0,1,2]，target = 0 时返回 4？",
  "quickAnswer": "虽然整体无序，但每次二分后必有一半是有序的。判断 target 是否落在该有序半边：在则把搜索区间缩到那半边，否则去另一半。时间 O(log n)，空间 O(1)。",
  "approach": "left<=right 循环，mid=(left+right)//2。若命中返回；若 nums[left]<=nums[mid] 说明左半有序，判断 target 是否在 [left,mid) 内决定收缩；否则右半有序，判断 target 是否在 (mid,right] 内。",
  "explanationFocus": "是什么：旋转数组的二分利用\"任意二分点都会把数组切出至少一段完全有序\"的性质，借此确定 target 可能所在的半边，从而保持对数复杂度。",
  "bruteForce": "线性扫描比较，时间 O(n)，但未利用有序性。",
  "invariant": "若 target 存在，其下标仍在 [left,right] 内；每轮排除不含 target 的那半边。",
  "walkthrough": "nums=[4,5,6,7,0,1,2], target=0。mid=3 nums[3]=7, nums[left]=4<=7 左半有序，target=0 不在[4,7]内 -> left=4。mid=5 nums[5]=1, nums[4]=0<=1 左半有序，target 在[0,1]内 -> right=5。mid=4 nums[4]=0 命中返回 4。",
  "code": "def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1",
  "complexity": "O(log n) / O(1)",
  "beginnerSummary": "像在折断成两截仍各自排好序的尺子上找数：先看清哪半截是完整的，再看目标是否落在那段里，是就进那段，否则去另一段。",
  "diagram": "nums: 4 5 6 7 | 0 1 2\n     左半有序 -> target=0 不在[4,7] -> 去右半",
  "derivation": [
    "为什么需要：直接二分会失败，因整体非单调；但局部有序可利用。",
    "怎么实现：每轮判断哪半边有序，再判断 target 是否在该半边来收缩。",
    "有什么代价：仍 O(log n)；需小心等号与边界的开闭。",
    "怎么评测：对旋转 0~n-1 次的各种情况测试命中与未命中。"
  ],
  "edgeCases": [
    "未旋转（普通有序数组）同样适用；",
    "target 是最小/最大元素；",
    "数组长度 1；",
    "含重复元素时需退化为左右都搜（本题假设无重复）。"
  ],
  "pitfalls": [
    "判断有序半边用 nums[left]<=nums[mid]，漏等号会在 left==mid 时出错；",
    "target 与边界比较要用半开区间语义，避免把 mid 重复计入。"
  ],
  "prerequisites": [
    "二分查找",
    "旋转数组的结构性质"
  ],
  "workedExample": [
    "输入 nums=[4,5,6,7,0,1,2], target=0 -> 输出 4",
    "输入 nums=[4,5,6,7,0,1,2], target=3 -> 输出 -1"
  ],
  "lineByLine": [
    "mid 命中直接返回；",
    "nums[left]<=nums[mid] 说明左半 [left,mid] 有序；",
    "若 target 落在左半有序区间内则收缩到右半之外，否则去右半；",
    "else 处理右半有序的对称逻辑。"
  ],
  "codeNotes": [
    "用 <= nums[mid] 而非 <，覆盖左半恰为一个元素的情况；",
    "比较 target 与边界用半开区间避免重复判断 mid。"
  ],
  "followUps": [
    {
      "question": "如果有重复元素，还能 O(log n) 吗？",
      "answer": "不能保证，最坏退化到 O(n)；需当 nums[left]==nums[mid]==nums[right] 时左右各缩一格再二分。"
    },
    {
      "question": "如何找旋转数组的最小值？",
      "answer": "同样利用有序半边性质，最小值必在无序半边或 mid，收缩到 left==right 即得。"
    }
  ],
  "followUpAnswers": [
    "不能保证，最坏退化到 O(n)；需当 nums[left]==nums[mid]==nums[right] 时左右各缩一格再二分。",
    "同样利用有序半边性质，最小值必在无序半边或 mid，收缩到 left==right 即得。"
  ],
  "kind": "code"
};
