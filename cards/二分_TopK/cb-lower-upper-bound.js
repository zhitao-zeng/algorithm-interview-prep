export default {
  "id": "cb-lower-upper-bound",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "二分下界/上界",
  "prompt": "给定升序数组 nums 与目标 target，请返回 target 的\"下界\"（第一个 >= target 的下标）和\"上界\"（第一个 > target 的下标）。例如 nums = [1,2,2,2,3]，target = 2 时下界为 1、上界为 4？",
  "quickAnswer": "下界：在 [0,n] 上半开区间二分，nums[mid]<target 时 left=mid+1 否则 right=mid，最终 left 即第一个 >=target 的位置。上界把判断改成 nums[mid]<=target 时 left=mid+1，得到第一个 >target 的位置。时间 O(log n)。",
  "approach": "下界用模板：left<right，mid=(left+right)//2，若 nums[mid]<target 则 left=mid+1 否则 right=mid。上界仅将条件改为 nums[mid]<=target 时 left=mid+1。",
  "explanationFocus": "是什么：lower_bound/upper_bound 是二分的两个标准变体，用于在有序数组中定位\"插入位置\"与\"相等区间的左右端点\"，是很多 TopK/计数问题的基础。",
  "bruteForce": "线性扫描找第一个满足条件的位置，时间 O(n)。",
  "invariant": "下界：区间 [left,right) 中始终存在某个位置 >=target（即解在区内）；循环结束时 left==right 且为所求。",
  "walkthrough": "nums=[1,2,2,2,3], target=2 下界：left=0,right=5,mid=2 nums[2]=2 不<2 -> right=2；mid=1 nums[1]=2 不<2 -> right=1；mid=0 nums[0]=1<2 -> left=1；left==right=1 返回 1。上界同理返回 4。",
  "code": "def lower_bound(nums, target):\n    left, right = 0, len(nums)\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid\n    return left\n\ndef upper_bound(nums, target):\n    left, right = 0, len(nums)\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] <= target:\n            left = mid + 1\n        else:\n            right = mid\n    return left",
  "complexity": "O(log n) / O(1)",
  "beginnerSummary": "下界像找\"第一个不比目标矮的人\"的位置，上界找\"第一个比目标高的人\"的位置；二分不断把队伍对半砍。",
  "diagram": "nums: 1 2 2 2 3   target=2\n下界 -> 第一个 >=2 在 idx 1\n上界 -> 第一个 >2  在 idx 4",
  "derivation": [
    "为什么需要：很多题要先定位\"相等区间\"，线性扫描在大数组上太慢。",
    "怎么实现：半开区间 [0,n) 二分，用严格/非严格比较区分下界与上界。",
    "有什么代价：区间为 [0,n] 可正确处理\"全部小于/大于 target\"的插入位置；",
    "怎么评测：用上界-下界得到等于 target 的个数，与线性计数比对。"
  ],
  "edgeCases": [
    "target 小于所有元素：下界=0；",
    "target 大于所有元素：下界=上界=n；",
    "数组中无 target：下界==上界，且指向插入位置；",
    "全相同元素时区间退化为连续一段。"
  ],
  "pitfalls": [
    "上界用 <= 而非 <，否则会与下界相同；",
    "right 初值取 len(nums)（半开区间），不是 n-1，才能表示\"末尾之后\"。"
  ],
  "prerequisites": [
    "二分查找基础",
    "半开区间 [0,n) 表示法"
  ],
  "workedExample": [
    "输入 nums=[1,2,2,2,3], target=2 -> 下界 1，上界 4",
    "输入 nums=[1,2,2,2,3], target=4 -> 下界 5，上界 5"
  ],
  "lineByLine": [
    "下界：right 初值为 len(nums) 表示可落在末尾之后；",
    "nums[mid]<target 时解必在右半，left=mid+1；",
    "否则解在左半（含 mid），right=mid；",
    "上界仅把条件换成 <=，其余完全对称。"
  ],
  "codeNotes": [
    "半开区间写法保证循环终止且 left==right；",
    "上界-下界即\"等于 target 的元素个数\"。"
  ],
  "followUps": [
    {
      "question": "如何用上下界统计 target 出现次数？",
      "answer": "返回 upper_bound(nums,target)-lower_bound(nums,target) 即可，O(log n)。"
    },
    {
      "question": "lower_bound 能用于\"找最接近 target 的值\"吗？",
      "answer": "可以，得到 pos 后比较 nums[pos] 与 nums[pos-1]（若存在）谁离 target 更近。"
    }
  ],
  "followUpAnswers": [
    "返回 upper_bound(nums,target)-lower_bound(nums,target) 即可，O(log n)。",
    "可以，得到 pos 后比较 nums[pos] 与 nums[pos-1]（若存在）谁离 target 更近。"
  ],
  "kind": "code"
};
