export default {
  "id": "cb-topk-heap",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "TopK大元素(堆)",
  "prompt": "给定整数数组 nums 和 k，请返回数组中最大的 k 个元素（不必有序）。例如 nums = [3,2,1,5,6,4]，k = 2 时，返回 [5,6]（顺序不限）？",
  "quickAnswer": "维护一个大小为 k 的最小堆：遍历 nums，堆未满就入堆，否则若当前元素比堆顶大就弹出堆顶再压入。遍历完堆中即最大的 k 个，时间 O(n log k)，空间 O(k)。",
  "approach": "用 heapq 最小堆。对每个 x：若堆长<k 则 heappush；否则若 x>堆顶则 heappushpop。最后堆内元素为 TopK，reverse 排序后返回。",
  "explanationFocus": "是什么：用一个\"容量为 k 的最小堆\"充当滑动门槛——堆顶是 k 个候选里最小的，新元素比它还大就替换它，从而始终留住全局最大的 k 个。",
  "bruteForce": "全排序后取后 k 个，时间 O(n log n)；或每轮找最大并删除，O(n*k)。",
  "invariant": "堆中始终保存\"目前已遍历元素中最大的 k 个\"，堆顶是这 k 个里的最小值。",
  "walkthrough": "nums=[3,2,1,5,6,4], k=2。压3,2 -> 堆[2,3]。x=1<2 跳过。x=5>2 -> 堆变[3,5]。x=6>3 -> 堆变[5,6]。x=4<5 跳过。堆[5,6] 即 Top2。",
  "code": "import heapq\n\ndef top_k(nums, k):\n    heap = []\n    for x in nums:\n        heapq.heappush(heap, x)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return sorted(heap, reverse=True)",
  "complexity": "O(n log k) / O(k)",
  "beginnerSummary": "像选秀留前 k 名：门口放一个\"最小分数\"的榜单，新来的人比榜单最低分高就顶掉最低的，最后榜单上就是最强 k 人。",
  "diagram": "nums: 3 2 1 5 6 4   k=2\nheap: [2,3] -> 5进3出 -> [3,5] -> 6进5出 -> [5,6]",
  "derivation": [
    "为什么需要：全排序 O(n log n) 当 n 很大而 k 很小时浪费。",
    "怎么实现：最小堆容量为 k，遍历时按需替换堆顶。",
    "有什么代价：时间降到 O(n log k)，空间 O(k)；结果无序需再排。",
    "怎么评测：把返回集合与\"排序后最大 k 个\"的集合比对。"
  ],
  "edgeCases": [
    "k==n 时返回全部元素；",
    "k==1 退化为找最大值；",
    "数组有重复大值（如多个 6）都可入选；",
    "元素个数小于 k（按题意一般 k<=n）。"
  ],
  "pitfalls": [
    "用最小堆而非最大堆，堆顶才代表\"候选门槛\"；",
    "heappush 后再判断长度弹出，等价于 heappushpop 但语义更清晰。"
  ],
  "prerequisites": [
    "堆/优先队列",
    "heapq 模块基本操作"
  ],
  "workedExample": [
    "输入 nums=[3,2,1,5,6,4], k=2 -> 输出 [5,6]（顺序不限）",
    "输入 nums=[3,2,3,1,2,4,5,5,6], k=4 -> 输出 [4,5,5,6]"
  ],
  "lineByLine": [
    "heap 初始为空最小堆；",
    "heappush 把当前元素加入堆；",
    "若堆超容量 k 则弹出堆顶（当前最小候选）；",
    "遍历结束后堆内即为最大的 k 个元素。"
  ],
  "codeNotes": [
    "最小堆保证堆顶是 k 个候选里最小，方便比较替换；",
    "返回前 sorted(reverse=True) 仅为输出有序，非算法必需。"
  ],
  "followUps": [
    {
      "question": "如果要求第 k 大（只要一个值）？",
      "answer": "可继续用该最小堆，最终返回堆顶即可，O(n log k)；或当 k 接近 n 时改用最大堆弹 k-1 次。"
    },
    {
      "question": "数据流且 k 动态变化怎么办？",
      "answer": "维护最小堆并用单调结构或平衡树，插入 O(log k)，查询 O(1)；k 变化时按需扩容或缩容。"
    }
  ],
  "followUpAnswers": [
    "可继续用该最小堆，最终返回堆顶即可，O(n log k)；或当 k 接近 n 时改用最大堆弹 k-1 次。",
    "维护最小堆并用单调结构或平衡树，插入 O(log k)，查询 O(1)；k 变化时按需扩容或缩容。"
  ],
  "kind": "code"
};
