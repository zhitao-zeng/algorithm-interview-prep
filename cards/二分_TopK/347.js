export default {
  "kind": "code",
  "id": "347",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "前 K 个高频元素",
  "prompt": "返回出现频率最高的 k 个元素。",
  "quickAnswer": "Counter 统计频率后维护大小为 k 的小根堆；频率相同的元素按数值作稳定的并列规则。",
  "approach": "Counter 统计频率后维护大小为 k 的小根堆；频率相同的元素按数值作稳定的并列规则。",
  "explanationFocus": "前 K 个高频元素：Counter 统计频率后维护大小为 k 的小根堆；频率相同的元素按数值作稳定的并列规则。",
  "bruteForce": "《前 K 个高频元素》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。",
  "derivation": [
    "对全部频率排序取前 k 是 O(n log n)，但没必要全排。",
    "小根堆法：堆大小恒为 k，每次比较/插入 O(log k)，总 O(n log k)，优于全排。",
    "也可用快速选择（类快排 partition）做到平均 O(n)，但堆法实现更直观、不易错。"
  ],
  "invariant": "答案始终位于当前搜索区间或 TopK 候选集合中，前 K 个高频元素：Counter 统计频率后维护大小为 k 的小根堆；频率相同的元素按数值作稳定的并列规则。 没有被错误排除。",
  "walkthrough": "演练《前 K 个高频元素》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。",
  "edgeCases": [
    "k == n：返回所有不同元素。",
    "k == 1：返回频率最高的单个元素。",
    "多个值频率并列第 k：题目通常保证答案唯一或允许任取其一。"
  ],
  "code": "# Python\nfrom collections import Counter\nfrom heapq import heappush, heappop\n\ndef top_k_frequent(nums, k):\n    if k <= 0:\n        return []\n    counts = Counter(nums)\n    heap = []\n    for value, frequency in counts.items():\n        heappush(heap, (frequency, value))\n        if len(heap) > k:\n            heappop(heap)\n    return [value for _, value in heap]",
  "codeNotes": [
    "统一区间语义并在循环后验证候选。",
    "TopK 的堆大小应严格受 k 限制。"
  ],
  "complexity": "时间 O(n log k)，空间 O(n)（计数表）+ O(k)（堆）。",
  "followUps": [
    {
      "question": "为什么并列频率可以任意选？",
      "answer": "题目只要求频率最高的 k 个；若第 k 名存在并列，任取其中 k 个都满足条件。代码用数值比较只是让结果可复现。"
    },
    {
      "question": "如何按频率降序输出？",
      "answer": "对堆结果再执行 sorted(result, key=lambda x: counts[x], reverse=True)；这会增加 O(k log k)。"
    }
  ],
  "followUpAnswers": [
    "重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。",
    "维护大小受限的堆或平衡树。"
  ],
  "pitfalls": [
    "小根堆应存 (freq, val)；若只存 freq 会丢失对应的值。",
    "堆满时只在「当前频率 > 堆顶」才替换，写成无条件替换会错误淘汰高频项。"
  ],
  "beginnerSummary": "找出出现频率最高的 k 个元素。两步：先用哈希表统计每个值的频率，再取频率前 k 大。取前 k 大可用「大小为 k 的小根堆」：遍历频率表，堆满且当前频率大于堆顶时就替换堆顶，这样堆里始终留着最大的 k 个；最后弹出即得结果，时间 O(n log k)。",
  "prerequisites": [
    "字典 counts 统计频率：值→出现次数，平均 O(1) 读写。",
    "小根堆（heapq）堆顶是最小元素；维护「容量为 k 的小根堆」恰好能保留最大的 k 个频率。",
    "只关心「哪 k 个值频率最高」，不要求这 k 个之间有序。"
  ],
  "workedExample": [
    "nums=[1,1,1,2,2,3], k=2。counts = {1:3, 2:2, 3:1}。",
    "堆容量 2：入 (3,1)、(2,2) → 堆顶 (2,2)；遇到 (1,3) 频率 1 < 堆顶 2，不入。堆中 {1:3, 2:2} → 取键 [1,2]。",
    "若用排序也行，但小根堆在 n 很大时只需 O(n log k)，比全排 O(n log n) 更省。"
  ],
  "lineByLine": [
    "counts = Counter(nums) 或手写字典累加每个值的出现次数。",
    "heap = []；for val, freq in counts.items(): 维护小根堆。",
    "if len(heap) < k: heappush(heap, (freq, val))。",
    "else: if freq > heap[0][0]: heapreplace(heap, (freq, val)) 替换堆顶。",
    "最后 [val for freq, val in heap] 得到答案（顺序不保证）。"
  ],
  "diagram": "nums=[1,1,1,2,2,3], k=2\n计数: 1→3, 2→2, 3→1\n小根堆(容量k=2)保频率前2:\n  (3,1) 入, (2,2) 入 → 堆顶1被挤出? 否(2<3留)\n堆中: 1(3),2(2) → 取 [1,2]"
};
