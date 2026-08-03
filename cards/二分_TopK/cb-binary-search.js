export default {
  "id": "cb-binary-search",
  "category": "二分/TopK",
  "difficulty": "Easy",
  "title": "二分查找模板(左右边界)",
  "prompt": "给定一个升序整数数组 nums 和目标值 target，请写出能返回 target 下标的二分查找；若不存在返回 -1。例如 nums = [-1,0,3,5,9,12]，target = 9 时返回 4？",
  "quickAnswer": "标准二分：left=0,right=n-1，循环条件 left<=right，mid=(left+right)//2；等于则返回，小于则 left=mid+1，大于则 right=mid-1。时间 O(log n)，空间 O(1)。",
  "approach": "维护闭区间 [left,right]。每次取中点 mid，比较 nums[mid] 与 target：相等即命中；target 更大说明在右半，left=mid+1；否则 right=mid-1。",
  "explanationFocus": "是什么：二分查找在\"已排序且可随机访问\"的序列上，通过每次把搜索区间砍掉一半，将查找从线性降到对数级。",
  "bruteForce": "从头到尾线性扫描比较，时间 O(n)。",
  "invariant": "若 target 存在，则其下标必在闭区间 [left,right] 内；每次循环后区间严格缩小且仍包含解（若存在）。",
  "walkthrough": "nums=[-1,0,3,5,9,12], target=9。left=0,right=5,mid=2 nums[2]=3<9 -> left=3。mid=4 nums[4]=9==9 返回 4。",
  "code": "def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
  "complexity": "O(log n) / O(1)",
  "beginnerSummary": "像在字典里查单词，每次翻到正中那页，根据字母大小决定往前半或后半翻，越翻越薄直到找到。",
  "diagram": "nums: -1  0  3  5  9 12\n      L        M        R\ntarget=9 > 3 -> L=M+1",
  "derivation": [
    "为什么需要：有序数据上线性查找太慢，可借\"一半必错\"砍区间。",
    "怎么实现：闭区间 + mid 三路比较，命中即返，否则收缩边界。",
    "有什么代价：要求数据有序且支持随机访问；写错边界易死循环或漏解。",
    "怎么评测：对存在/不存在的元素分别测试，验证返回下标或 -1。"
  ],
  "edgeCases": [
    "target 小于最小或大于最大元素，返回 -1；",
    "数组为空返回 -1；",
    "单元素等于 target 返回 0；",
    "多个相同 target 时返回其中任意一个（模板不保证最左）。"
  ],
  "pitfalls": [
    "循环条件用 left<right 会漏掉最后一次 mid；用 left<=right 才正确；",
    "mid 计算用 (left+right)//2 防溢出（Python 无碍但好习惯）。"
  ],
  "prerequisites": [
    "数组随机访问",
    "单调递增性质"
  ],
  "workedExample": [
    "输入 nums=[-1,0,3,5,9,12], target=9 -> 输出 4",
    "输入 nums=[-1,0,3,5,9,12], target=2 -> 输出 -1"
  ],
  "lineByLine": [
    "left,right 初始化为闭区间两端；",
    "循环条件 left<=right 保证区间非空才继续；",
    "mid 取中点，三路比较决定命中或收缩哪侧；",
    "未命中返回 -1。"
  ],
  "codeNotes": [
    "left=mid+1 / right=mid-1 因为 mid 已排除；",
    "闭区间写法最直观，适合初学者。"
  ],
  "followUps": [
    {
      "question": "如何返回 target 第一次出现的位置（下界）？",
      "answer": "命中时不立即返回，而是 right=mid-1 继续向左逼，最后 left 即为最左位置。"
    },
    {
      "question": "如果数组极大，mid=(left+right)//2 会溢出吗？",
      "answer": "Python 整数无上限不会溢出；在 C/Java 中建议用 left+(right-left)//2 避免溢出。"
    }
  ],
  "followUpAnswers": [
    "命中时不立即返回，而是 right=mid-1 继续向左逼，最后 left 即为最左位置。",
    "Python 整数无上限不会溢出；在 C/Java 中建议用 left+(right-left)//2 避免溢出。"
  ],
  "kind": "code"
};
