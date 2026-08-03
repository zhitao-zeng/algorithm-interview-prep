export default {
  "id": "cb-median-stream",
  "category": "二分/TopK",
  "difficulty": "Hard",
  "title": "数据流中位数",
  "prompt": "设计一个结构，支持不断加入数字并随时返回当前已加入数字的中位数。例如依次加入 1,2,3 时，中位数依次为 1, 1.5, 2？",
  "quickAnswer": "用两个堆：大顶堆 lo 存较小一半，小顶堆 hi 存较大一半，并维持 len(lo) 等于 len(hi) 或恰好多 1。中位数即 lo 堆顶（奇数）或两堆顶平均（偶数）。每次插入 O(log n)。",
  "approach": "新数 x：若 lo 为空或 x<=lo 堆顶则压 lo，否则压 hi。然后平衡：若 len(lo)>len(hi)+1 则把 lo 顶移到 hi；若 len(hi)>len(lo) 则把 hi 顶移到 lo。",
  "explanationFocus": "是什么：中位数问题用\"双堆划分\"——两个堆把数据流切成上下两半，大顶堆守左半最大值、小顶堆守右半最小值，平衡后两堆顶即为中位数的直接来源。",
  "bruteForce": "每次插入后全排序取中，时间 O(n^2 log n) 或每步 O(n)。",
  "invariant": "lo 中所有元素 <= hi 中所有元素；且 |len(lo)-len(hi)|<=1，lo 至多比 hi 多一个；中位数可由两堆顶直接得出。",
  "walkthrough": "插入 1：lo=[1]。插入 2：2> -lo[0]=1 压 hi，hi=[2]，平衡后 lo=[1],hi=[2]，中位(1+2)/2=1.5。插入 3：3>1 压 hi=[2,3]，失衡 len(hi)=2>1，把 2 移到 lo，lo=[2,1](堆顶2),hi=[3]，中位=2。",
  "code": "import heapq\n\ndef running_medians(stream):\n    lo = []\n    hi = []\n    medians = []\n    for x in stream:\n        if not lo or x <= -lo[0]:\n            heapq.heappush(lo, -x)\n        else:\n            heapq.heappush(hi, x)\n        if len(lo) > len(hi) + 1:\n            heapq.heappush(hi, -heapq.heappop(lo))\n        elif len(hi) > len(lo):\n            heapq.heappush(lo, -heapq.heappop(hi))\n        medians.append(-lo[0] if len(lo) >= len(hi) else hi[0])\n    return medians",
  "complexity": "O(n log n) / O(n)",
  "beginnerSummary": "像把人群按身高分成两拨，左边一拨站着最矮里最高的，右边一拨站着最高里最矮的；两拨人数差不超过一人，中间那个人（或两人平均）就是中位数。",
  "diagram": "lo(大顶):  1 2      hi(小顶): 3\n       中位 = lo顶 = 2\n两堆人数差 <= 1",
  "derivation": [
    "为什么需要：每次重排序太慢，需要 O(log n) 增量维护中位。",
    "怎么实现：双堆划分+平衡，保证左半多一个或相等。",
    "有什么代价：空间 O(n)；平衡逻辑易错需仔细。",
    "怎么评测：与每次全排序求中位的序列逐一比对。"
  ],
  "edgeCases": [
    "第一个元素直接入 lo；",
    "元素全部相等时两堆顶相同；",
    "奇数个时取 lo 堆顶；",
    "偶数个时取两堆顶平均（注意浮点）。"
  ],
  "pitfalls": [
    "大顶堆用\"负数\"模拟，比较时勿忘取负；",
    "平衡顺序：先插入再平衡，且判断 len(lo)>len(hi)+1 与 len(hi)>len(lo) 互斥。"
  ],
  "prerequisites": [
    "堆/优先队列",
    "中位数定义与奇偶处理"
  ],
  "workedExample": [
    "输入 [1,2,3] -> 输出 [1,1.5,2]",
    "输入 [5,2,3,4,1] -> 输出 [5,3.5,3,3.5,3]"
  ],
  "lineByLine": [
    "lo 为大顶堆（存负数），hi 为小顶堆；",
    "x<=当前左半最大则入 lo，否则入 hi；",
    "若 lo 多两个则把其顶移给 hi；若 hi 更多则移回 lo；",
    "中位数取 lo 顶（奇数）或两堆顶平均（偶数）。"
  ],
  "codeNotes": [
    "Python 无内置大顶堆，用 min-heap 存负值实现；",
    "len(lo)>=len(hi) 保证奇数时中位数来自 lo 堆顶。"
  ],
  "followUps": [
    {
      "question": "如果数据量极大无法全存内存？",
      "answer": "可用近似算法（如直方图/蓄水池）或仅保留两堆但在元素过期时惰性删除，配合索引堆实现 O(log n) 删除。"
    },
    {
      "question": "如何支持删除已加入的元素？",
      "answer": "用\"延迟删除\"字典记录待删计数，弹出堆顶时跳过已标记删除的项即可。"
    }
  ],
  "followUpAnswers": [
    "可用近似算法（如直方图/蓄水池）或仅保留两堆但在元素过期时惰性删除，配合索引堆实现 O(log n) 删除。",
    "用\"延迟删除\"字典记录待删计数，弹出堆顶时跳过已标记删除的项即可。"
  ],
  "kind": "code"
};
