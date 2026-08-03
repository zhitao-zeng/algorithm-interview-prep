export default {
  "id": "cz-subarray-sum-k",
  "category": "数组/窗口",
  "difficulty": "Medium",
  "title": "子数组和为K",
  "prompt": "给定一个整数数组 nums 和整数 k，请统计和为 k 的连续子数组的个数。例如 nums = [1,1,1]，k = 2 时，有 [1,1]（前两）和 [1,1]（后两）共 2 个？",
  "quickAnswer": "用前缀和 + 哈希表。记 prefix 为当前前缀和，若之前出现过前缀和 prefix-k，则中间这段子数组和为 k。用字典统计各前缀和出现次数，累加 count += freq[prefix-k]。时间 O(n)，空间 O(n)。",
  "approach": "维护前缀和 prefix 与频率表 freq（初始 freq[0]=1 表示空前缀）。遍历每个 x：prefix+=x；把 freq[prefix-k] 加入答案；再把 freq[prefix] 加一。",
  "explanationFocus": "是什么：前缀和 prefix[i] 表示前 i 个元素之和；子数组 nums[l..r] 的和等于 prefix[r+1]-prefix[l]，于是\"和为 k\"等价于\"存在此前缀和等于当前 prefix-k\"。",
  "bruteForce": "枚举所有起点 l 和终点 r，累加求子数组和并与 k 比较，三层嵌套（或内层求和），时间 O(n^2) 甚至 O(n^3)。",
  "invariant": "freq 中保存了下标 0..i-1 对应所有前缀和的出现次数；ans 累计了到当前位置为止满足条件的子数组个数。",
  "walkthrough": "nums=[1,1,1], k=2。freq{0:1}, ans=0。x=1: prefix=1, ans+=freq[-1]=0, freq{1:1}；x=1: prefix=2, ans+=freq[0]=1, freq{2:1}；x=1: prefix=3, ans+=freq[1]=1 -> ans=2。",
  "code": "def subarray_sum_k(nums, k):\n    prefix = 0\n    count = 0\n    freq = {0: 1}\n    for x in nums:\n        prefix += x\n        count += freq.get(prefix - k, 0)\n        freq[prefix] = freq.get(prefix, 0) + 1\n    return count",
  "complexity": "O(n) / O(n)",
  "beginnerSummary": "像记账：prefix 是当前累计金额，想知道\"哪一段净赚 k\"，只要看之前有没有一个时刻金额比现在少 k 即可，那段差额就是答案。",
  "diagram": "nums : [1, 1, 1]   k=2\npref :  0  1  2  3\nfreq0->遇到pref=2时, pref-k=0已出现1次 -> +1\nfreq1->遇到pref=3时, pref-k=1已出现1次 -> +1",
  "derivation": [
    "为什么需要：暴力枚举子数组 O(n^2) 太慢，需要把\"和为 k\"转成前缀和查表。",
    "怎么实现：遍历时维护前缀和与频率字典，每步查 prefix-k 的历史出现次数并累加。",
    "有什么代价：空间 O(n) 存频率；k 较大或前缀和溢出时仍安全（Python 大整数）。",
    "怎么评测：与暴力枚举全部子数组的统计结果逐一对比。"
  ],
  "edgeCases": [
    "k=0 时统计和为 0 的子数组（含空前缀 freq[0]=1 很关键）；",
    "数组含负数时前缀和会回退，频率表必须保留所有历史；",
    "整个数组和正好等于 k；",
    "单个元素等于 k。"
  ],
  "pitfalls": [
    "忘记初始化 freq[0]=1，会漏掉\"从前缀 0 到当前\"的整段；",
    "先查后更新频率，否则会把当前前缀也算进 prefix-k 造成自计数。"
  ],
  "prerequisites": [
    "前缀和概念",
    "哈希表计数"
  ],
  "workedExample": [
    "输入 nums=[1,1,1], k=2 -> 输出 2",
    "输入 nums=[1,2,3], k=3 -> 输出 2（[1,2] 与 [3]）"
  ],
  "lineByLine": [
    "prefix 累加当前元素，表示到 i 为止的前缀和；",
    "count += freq.get(prefix-k, 0) 把\"之前和为 prefix-k 的位置数\"计入答案；",
    "freq[prefix] 自增，记录当前前缀和又出现了一次；",
    "最终 count 即为和为 k 的子数组总数。"
  ],
  "codeNotes": [
    "freq.get(prefix-k, 0) 用默认值 0 避免 KeyError；",
    "初始化 freq={0:1} 是处理\"子数组从下标 0 开始\"的关键。"
  ],
  "followUps": [
    {
      "question": "如果要求返回具体的子数组（而不仅是计数）怎么办？",
      "answer": "把频率表的值从\"次数\"改为\"前缀和下标列表\"，查到 prefix-k 时枚举所有对应起点构造区间即可。"
    },
    {
      "question": "数组全是正数时还能更优吗？",
      "answer": "可以，正数时前缀和单调递增，可用双指针滑动窗口在 O(n) 时间 O(1) 空间内解决。"
    }
  ],
  "followUpAnswers": [
    "把频率表的值从\"次数\"改为\"前缀和下标列表\"，查到 prefix-k 时枚举所有对应起点构造区间即可。",
    "可以，正数时前缀和单调递增，可用双指针滑动窗口在 O(n) 时间 O(1) 空间内解决。"
  ],
  "kind": "code"
};
