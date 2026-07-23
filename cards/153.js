export default {
  "kind": "code",
  "id": "153",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "寻找旋转排序数组最小值",
  "prompt": "数组无重复，找旋转点最小值。",
  "quickAnswer": "比较中点和右端：中点较大说明最小值在右边，否则保留中点并收缩右边界。",
  "approach": "比较中点和右端：中点较大说明最小值在右边，否则保留中点并收缩右边界。",
  "explanationFocus": "寻找旋转排序数组最小值：比较中点和右端：中点较大说明最小值在右边，否则保留中点并收缩右边界。",
  "bruteForce": "《寻找旋转排序数组最小值》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。",
  "derivation": [
    "线性扫描找断崖是 O(n)；利用「旋转数组可二分」可降到 O(log n)。",
    "比较 nums[mid] 与 nums[right]：若 mid 处更大，断崖（最小值）在 mid 右侧；否则最小在 [left,mid]。",
    "循环不把 mid==right 当作答案，而是收缩到「一个点」，避免漏掉最小值本身恰好是 mid 的情形。"
  ],
  "invariant": "答案始终位于当前搜索区间或 TopK 候选集合中，寻找旋转排序数组最小值：比较中点和右端：中点较大说明最小值在右边，否则保留中点并收缩右边界。 没有被错误排除。",
  "walkthrough": "演练《寻找旋转排序数组最小值》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。",
  "edgeCases": [
    "未旋转（升序）：nums[mid] 始终 <= nums[right]，right 不断左移到 0，返回 nums[0]。",
    "全相同元素：比较用 >，相等时不右移，安全不会死循环。",
    "长度为 1：直接返回该元素。"
  ],
  "code": "# Python\ndef find_min_rotated(nums):\n    if not nums:\n        return None\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[right]:\n            left = mid + 1\n        else:\n            right = mid\n    return nums[left]",
  "codeNotes": [
    "统一区间语义并在循环后验证候选。",
    "TopK 的堆大小应严格受 k 限制。"
  ],
  "complexity": "时间 O(log n)，空间 O(1)。每轮把区间砍半，只用左右指针。",
  "followUps": [
    {
      "question": "有重复值时如何修改？",
      "answer": "若 nums[mid]==nums[right]，无法排除右端，可令 right-=1；正确但最坏会退化为 O(n)。"
    },
    {
      "question": "为什么不能写 right=mid-1？",
      "answer": "当 mid 恰好是最小值时会把答案删掉；right=mid 才能保留它。"
    }
  ],
  "followUpAnswers": [
    "重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。",
    "维护大小受限的堆或平衡树。"
  ],
  "pitfalls": [
    "用 nums[mid] 与 nums[left] 比较在「部分旋转」时易错；与 right 比较更稳。",
    "else 分支写成 right = mid - 1 会漏掉「mid 本身就是最小值」的情况。"
  ],
  "beginnerSummary": "找旋转排序数组里的最小元素。最小元素恰好位于「断崖」右侧（某处 nums[i] > nums[i+1]，断崖紧挨着的右边那个就是最小）。二分时比较 mid 与右端 right：若 nums[mid] > nums[right]，说明 mid 在断崖左侧（较大半），最小值一定在 mid 右边；否则最小值在 [left,mid]（含 mid）。循环收敛到 left==right 即最小值。",
  "prerequisites": [
    "旋转数组只有一个「下降断崖」，最小值就在断崖紧挨着的右边那个元素。",
    "用 mid 与右端 right 比较，能稳定判断最小值在左还是右；右端是「已知存在的元素」，比用左端更稳妥。",
    "当 nums[mid] > nums[right]，mid 位于断崖左侧（较大半），最小值一定在 mid 右侧。"
  ],
  "workedExample": [
    "nums=[4,5,6,7,0,1,2]。left=0,right=6,mid=3（值7）。nums[mid]=7 > nums[right]=2 → 最小值在右，left=4。",
    "区间 [0,1,2]，mid=5（值1）。nums[5]=1 > nums[right]=2? 否 → 最小值在左（含 mid），right=5。",
    "mid=4（值0），nums[4]=0 > nums[5]=2? 否 → right=4。left==right=4，返回 nums[4]=0。"
  ],
  "lineByLine": [
    "left, right = 0, len(nums) - 1。",
    "while left < right（找「点」而非「值」，故用小于而非小于等于）。",
    "mid = left + (right - left) // 2 防溢出写法。",
    "if nums[mid] > nums[right]: left = mid + 1（最小在右半）。",
    "else: right = mid（最小可能在 mid 本身，故 right 不取 mid-1）。",
    "退出时 left == right，nums[left] 即最小值。"
  ],
  "diagram": "nums=[4,5,6,7,0,1,2]\n最小值在\"断崖\"(右<左)处\nmid=7 > right=2 → 最小值在右半 [0,1,2]\nmid=1 > right=2? 否 → 左半含最小\n→ 左指针右移, 最终 left=最小值 0"
};
