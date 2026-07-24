export default {
  "kind": "code",
  "id": "215",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "数组第 K 大元素",
  "prompt": "在无序数组找第 k 大。",
  "quickAnswer": "把第 k 大转换为升序下标 n-k，用原地 partition 把目标放到正确一侧，重复缩小范围。",
  "approach": "把第 k 大转换为升序下标 n-k，用原地 partition 把目标放到正确一侧，重复缩小范围。",
  "explanationFocus": "数组第 K 大元素：把第 k 大转换为升序下标 n-k，用原地 partition 把目标放到正确一侧，重复缩小范围。",
  "bruteForce": "《数组第 K 大元素》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。",
  "derivation": [
    "全排序浪费：我们只关心第 k 个，不需要完全有序。",
    "快排 partition：pivot 落定位置 p（从大到小排），若 p==k-1 即答案；p>k-1 在左递归；否则右递归。平均每次砍半，O(n)。",
    "堆法更简单稳妥：扫一遍，堆大小恒 k，O(n log k)，适合「数据流」场景。"
  ],
  "invariant": "答案始终位于当前搜索区间或 TopK 候选集合中，数组第 K 大元素：把第 k 大转换为升序下标 n-k，用原地 partition 把目标放到正确一侧，重复缩小范围。 没有被错误排除。",
  "walkthrough": "演练《数组第 K 大元素》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。",
  "edgeCases": [
    "k=1：最大值；k=n：最小值。",
    "有重复元素：排名按「第 k 个位置」计，重复值不影响逻辑。",
    "空数组：返回 None（测试断言 find_kth_largest([], 1) is None）。"
  ],
  "code": "# Python\nimport random\n\ndef find_kth_largest(nums, k):\n    if not 1 <= k <= len(nums):\n        return None\n    target = len(nums) - k\n\n    def partition(left, right):\n        pivot_index = random.randint(left, right)\n        nums[pivot_index], nums[right] = nums[right], nums[pivot_index]\n        pivot = nums[right]\n        store = left\n        for i in range(left, right):\n            if nums[i] <= pivot:\n                nums[store], nums[i] = nums[i], nums[store]\n                store += 1\n        nums[store], nums[right] = nums[right], nums[store]\n        return store\n\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        pivot_index = partition(left, right)\n        if pivot_index == target:\n            return nums[pivot_index]\n        if pivot_index < target:\n            left = pivot_index + 1\n        else:\n            right = pivot_index - 1\n    return None",
  "codeNotes": [
    "统一区间语义并在循环后验证候选。",
    "TopK 的堆大小应严格受 k 限制。"
  ],
  "complexity": "快排法平均 O(n)/最坏 O(n²)；堆法 O(n log k)。",
  "followUps": [
    {
      "question": "如何降低最坏 O(n²) 风险？",
      "answer": "随机选择 pivot 后与 right 交换再分区，或使用 median-of-medians；平均性能更稳定。"
    },
    {
      "question": "为什么代码会修改 nums？",
      "answer": "原地 partition 通过交换元素节省空间；若调用者需保留原数组，可先传入 nums[:] 的副本。"
    }
  ],
  "followUpAnswers": [
    "重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。",
    "维护大小受限的堆或平衡树。"
  ],
  "pitfalls": [
    "快排法最坏 O(n²)（已排序且总选端点 pivot），用随机 pivot 规避。",
    "堆法把「第 k 大」误当成「第 k 小」；小根堆容量 k 的堆顶恰是第 k 大。"
  ],
  "beginnerSummary": "求数组中第 k 大的元素。最直观是排序取倒数第 k 个（O(n log n)）；更优的是借快速排序的 partition：随机选 pivot 把数组分成「大于/小于」两堆，看第 k 大落在哪堆，只在那堆递归，平均 O(n)。面试也常接受「维护大小为 k 的小根堆」的 O(n log k) 写法，实现更稳。",
  "prerequisites": [
    "partition 思想：选一个基准值，把比它大的放一边、小的放另一边，基准的最终位置就确定了。",
    "第 k 大 = 从大到小排第 k 个；等价于「恰有 k-1 个元素比它大」。",
    "小根堆容量 k：堆顶是堆里最小的，也就是当前见过的最大 k 个里最小的那个 = 第 k 大候选。"
  ],
  "workedExample": [
    "nums=[3,2,1,5,6,4], k=2。快排法：pivot=4，分成 >4:[5,6] 和 <4:[3,2,1]。k=2 <= 右堆长度 2，说明第2大在右堆，递归右堆找第2大=5。",
    "堆法：遍历，维护大小 2 的小根堆，依次压入并超出则弹出最小；最终堆顶=5（最大两数是 6,5，其中最小的 5 即第2大）。"
  ],
  "lineByLine": [
    "快排法 quickselect(nums, k)：pivot=随机或首元素，partition 成两半。",
    "若 pivot 排名 == k 返回；否则只在对应半边递归。",
    "堆法：heap=[]；for x in nums: push(x)；若 len(heap) > k: pop 最小；返回堆顶。"
  ],
  "diagram": "nums=[3,2,1,5,6,4], k=2\n快排 partition: 选 pivot=4\n  <4: [3,2,1]   >4: [5,6]\nk=2 落在右半(长度2≥k) → 递归右半找第2大=5\n(或维护大小k的小根堆, 堆顶=第k大)"
};
