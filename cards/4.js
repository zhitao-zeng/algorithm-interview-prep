export default {
  "kind": "code",
  "id": "4",
  "category": "二分/TopK",
  "difficulty": "Hard",
  "title": "两个正序数组中位数",
  "prompt": "要求 O(log(min(m,n))) 求中位数。",
  "quickAnswer": "在较短数组上二分切分点，使左半所有元素不大于右半；用哨兵处理切在数组边界的情况。",
  "approach": "在较短数组上二分切分点，使左半所有元素不大于右半；用哨兵处理切在数组边界的情况。",
  "explanationFocus": "两个正序数组中位数：在较短数组上二分切分点，使左半所有元素不大于右半；用哨兵处理切在数组边界的情况。",
  "bruteForce": "《两个正序数组中位数》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。",
  "derivation": [
    "归并后取中位数 O(m+n)，不够快。",
    "观察：两数组都升序，中位数只取决于「一个切分点」。二分较短数组的 i，j 由长度关系唯一确定。",
    "合法切分满足 L_max <= R_min；用二分在 i 上查找，每次比较 L_max 与 R_min 决定 i 往哪走，复杂度 O(log min(m,n))。"
  ],
  "invariant": "答案始终位于当前搜索区间或 TopK 候选集合中，两个正序数组中位数：在较短数组上二分切分点，使左半所有元素不大于右半；用哨兵处理切在数组边界的情况。 没有被错误排除。",
  "walkthrough": "演练《两个正序数组中位数》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。",
  "edgeCases": [
    "某数组为空：退化成在另一数组取中位数（i=0 或 i=m 的边界处理）。",
    "总长度奇数/偶数分别取一个/两个边界平均。",
    "切分在数组端点时 L/R 用无穷大占位，避免越界访问。"
  ],
  "code": "# Python\ndef find_median_sorted_arrays(a, b):\n    if len(a) > len(b):\n        a, b = b, a\n    total = len(a) + len(b)\n    if total == 0:\n        return None\n    left, right = 0, len(a)\n    half = (total + 1) // 2\n    while left <= right:\n        cut_a = (left + right) // 2\n        cut_b = half - cut_a\n        left_a = a[cut_a - 1] if cut_a else float(\"-inf\")\n        right_a = a[cut_a] if cut_a < len(a) else float(\"inf\")\n        left_b = b[cut_b - 1] if cut_b else float(\"-inf\")\n        right_b = b[cut_b] if cut_b < len(b) else float(\"inf\")\n        if left_a > right_b:\n            right = cut_a - 1\n        elif left_b > right_a:\n            left = cut_a + 1\n        else:\n            left_max = max(left_a, left_b)\n            if total % 2:\n                return left_max\n            return (left_max + min(right_a, right_b)) / 2\n    raise ValueError(\"输入数组必须有序\")",
  "codeNotes": [
    "统一区间语义并在循环后验证候选。",
    "TopK 的堆大小应严格受 k 限制。"
  ],
  "complexity": "时间 O(log min(m,n))，空间 O(1)。只二分较短数组。",
  "followUps": [
    {
      "question": "为什么必须二分较短数组？",
      "answer": "cut_b=half-cut_a 必须落在 b 的合法范围；在较短数组上二分可保证范围小且更容易满足边界。"
    },
    {
      "question": "输入未排序会怎样？",
      "answer": "交叉边界不再代表整体顺序，算法结果不可靠；应先排序或明确要求正序输入。"
    }
  ],
  "followUpAnswers": [
    "重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。",
    "维护大小受限的堆或平衡树。"
  ],
  "pitfalls": [
    "没保证二分较短数组，导致 j 可能为负或越界。",
    "边界 i=0 或 i=m 时直接访问 A[i-1]/A[i] 会越界，必须用无穷大兜底。"
  ],
  "beginnerSummary": "求两个升序数组合并后的中位数，要求 O(log(m+n))。核心技巧是「二分较短数组的切分点 i」：在 nums1 上切一刀分成左右，nums2 上的切分 j 由「左右数量均衡」决定（j = (m+n+1)//2 - i）。只要满足「左半所有数 ≤ 右半所有数」（即左半最大值 ≤ 右半最小值），这个切分就是合并后的中点，中位数由左右边界值算出。",
  "prerequisites": [
    "中位数 = 合并后排在中间的数（偶数取中间俩平均）。等价于把两数组各切一刀，使「左半所有数 ≤ 右半所有数」且左右数量均衡。",
    "只二分较短数组（设其长度 m <= n），保证另一数组的切分 j 不会越界。",
    "i 表示 nums1 左半个数，则 j = (m+n+1)//2 - i 表示 nums2 左半个数，由长度关系唯一确定。"
  ],
  "workedExample": [
    "A=[1,2], B=[3,4]，m=2,n=2。二分 i∈[0,2]：试 i=1 → j=(4+1)//2-1=1。A左[1]/A右[2]；B左[3]/B右[4]。左max=max(1,3)=3，右min=min(2,4)=2。左max>右min 不合法。",
    "调整 i 使左max 变小：最终收敛到合法切分，左max=2、右min=3。总长为偶，中位=(2+3)/2=2.5。",
    "若 A=[1,3], B=[2]：二分 i 可得左半 [1,2]、右半 [3]，中位=2。"
  ],
  "lineByLine": [
    "保证 A 是较短数组（否则交换），长度 m、B 长度 n。",
    "二分 i∈[0,m]：j = (m+n+1)//2 - i。",
    "取 L1=A[i-1]（i>0）、R1=A[i]（i<m）、L2、R2 同理；端点用 ±∞ 兜底。",
    "若 L1 > R2：i 太大，right=i-1；若 L2 > R1：i 太小，left=i+1；否则已合法，计算中位数。",
    "总长奇数取 max(L1,L2)，偶数取 (max(L1,L2)+min(R1,R2))/2。"
  ],
  "diagram": "A=[1,2]   B=[3,4]\n划分线: 左半全 ≤ 右半\nA切i=1: [1 | 2]   B切j=1: [3 | 4]\n左max=max(1,3)=3  右min=min(2,4)=2  不合法\n调 i → 直至 左max≤右min 且 右min≥左max\n中位=(2+3)/2=2.5   (二分较短数组的切分i)"
};
