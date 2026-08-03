export default {
  "id": "cb-find-peak",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "寻找峰值/局部最小",
  "prompt": "给定数组 nums，其中 nums[-1]=nums[n]=负无穷，请找出任意一个\"峰值\"元素（满足 nums[i] > nums[i-1] 且 nums[i] > nums[i+1]）的下标。例如 nums = [1,2,3,1] 的峰值是下标 2（值 3）？",
  "quickAnswer": "二分：看 mid 与 mid+1，若 nums[mid]<nums[mid+1] 说明右侧必有峰（向右上坡），令 left=mid+1；否则峰在左侧，right=mid。循环结束 left 即为峰值下标。时间 O(log n)。",
  "approach": "left<right 循环，mid=(left+right)//2。若 nums[mid]<nums[mid+1] 则 left=mid+1，否则 right=mid。退出时 left==right 为峰值。",
  "explanationFocus": "是什么：峰值问题是\"利用单调性指引搜索方向\"的二分——虽数组不全局有序，但任意上升坡都保证坡顶方向存在峰值，从而把线性扫描降到对数。",
  "bruteForce": "线性扫描找第一个比左右都大的位置，时间 O(n)。",
  "invariant": "区间 [left,right] 内一定存在至少一个峰值（由边界负无穷保证）；每轮排除不含峰的一侧。",
  "walkthrough": "nums=[1,2,3,1]。left=0,right=3,mid=1 nums[1]=2<nums[2]=3 -> left=2。mid=2 nums[2]=3>nums[3]=1 不满足 < -> right=2。left==right=2 返回 2（值3为峰）。",
  "code": "def find_peak(nums):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[mid + 1]:\n            right = mid\n        else:\n            left = mid + 1\n    return left",
  "complexity": "O(log n) / O(1)",
  "beginnerSummary": "像在山坡上闭眼找山顶：脚下一脚比前一脚高，就朝高的方向走，迟早会到坡顶；反之往回走。",
  "diagram": "nums: 1 2 3 1\n         ^   (mid=1 < mid+1=2) -> 向右走\n           3 是峰",
  "derivation": [
    "为什么需要：线性找峰在大数据上慢，且\"存在峰\"由边界保证可用二分。",
    "怎么实现：比较 mid 与 mid+1，上升则去右半，否则留左半。",
    "有什么代价：O(log n)；要求能访问 mid+1，故循环用 left<right。",
    "怎么评测：验证返回下标满足比左右邻居都大（边界视为负无穷）。"
  ],
  "edgeCases": [
    "严格递增数组峰在最后一个元素；",
    "严格递减数组峰在第一个元素；",
    "单元素即为峰；",
    "平台（相等）需按题意处理，本模板把 <= 归为向右。"
  ],
  "pitfalls": [
    "循环条件用 left<right（而非 <=），并令 mid+1，避免越界；",
    "比较对象是 mid 与 mid+1，不是 mid 与 mid-1。"
  ],
  "prerequisites": [
    "二分查找",
    "峰值/局部极值的存在性"
  ],
  "workedExample": [
    "输入 [1,2,3,1] -> 输出 2",
    "输入 [1,2,1,3,5,6,4] -> 输出 5（或 1，任一峰皆可）"
  ],
  "lineByLine": [
    "left<right 保证还能二分且 mid+1 不越界；",
    "若 nums[mid] > nums[mid+1] 说明峰在左（含 mid），right=mid；",
    "否则上坡在右，left=mid+1；",
    "退出时 left==right 即一个峰值下标。"
  ],
  "codeNotes": [
    "边界视为负无穷，确保区间首尾方向总有一侧上坡；",
    "返回任一峰值即可，不必是全局最大。"
  ],
  "followUps": [
    {
      "question": "如果要找全局最大值而非任一峰值？",
      "answer": "全局最大值一定是峰值，但二分只能找一个峰；要全局最大需线性扫描或保证数组有单峰形状才能二分。"
    },
    {
      "question": "二维峰值怎么求？",
      "answer": "先对列用一维峰值法找一行最大值，再在该行用二分向更大邻居方向下降，可 O(n log m) 找到。"
    }
  ],
  "followUpAnswers": [
    "全局最大值一定是峰值，但二分只能找一个峰；要全局最大需线性扫描或保证数组有单峰形状才能二分。",
    "先对列用一维峰值法找一行最大值，再在该行用二分向更大邻居方向下降，可 O(n log m) 找到。"
  ],
  "kind": "code"
};
