export default {
  "id": "dp-interval-schedule",
  "category": "动态规划",
  "difficulty": "Easy",
  "title": "区间调度(最多不重叠)",
  "prompt": "给定若干区间 intervals（每个为 [开始,结束]），求最多能选出多少个互不重叠的区间？例如 [[1,2],[2,3],[3,4],[1,3]] 中最多选 3 个（如 [1,2],[2,3],[3,4]）？",
  "quickAnswer": "贪心即可：按结束时间升序排序，每次选结束最早且与已选不冲突的区间。时间 O(n log n)（排序），空间 O(1)。这其实是经典贪心而非必须 DP。",
  "approach": "区间按 end 排序；维护 last_end，初始 -inf；遍历区间，若 start>=last_end 则选中、更新 last_end=end、计数加一。",
  "explanationFocus": "是什么：区间调度是在一组带起止时间的区间里挑选尽量多且两两不重叠的区间；贪心策略\"每次选结束最早的\"能留下最多剩余时间给后面，从而最优。",
  "bruteForce": "枚举所有 2^n 个子集并检查是否两两不重叠，取最大可行集，指数级。",
  "invariant": "已选区间按结束时间递增且互不重叠；每次选择都保证在\"当前可选\"里结束最早，留下最大余量。",
  "walkthrough": "intervals=[[1,2],[2,3],[3,4],[1,3]] 按 end 排得 [1,2],[1,3],[2,3],[3,4]：选 [1,2](last=2)；[1,3] 冲突跳过；[2,3] start=2>=2 选(last=3)；[3,4] 选；共 3 个。",
  "code": "def max_intervals(intervals):\n    intervals = sorted(intervals, key=lambda x: x[1])\n    count = 0\n    last_end = -1\n    for s, e in intervals:\n        if s >= last_end:\n            count += 1\n            last_end = e\n    return count",
  "complexity": "时间 O(n log n)（排序主导），空间 O(1)（原地/忽略排序栈）。",
  "beginnerSummary": "像安排开会：会议室同一时间只能开一场，你总先接\"最早结束\"的会，腾出时间再接下一场，这样一天能排最多场。",
  "diagram": "按结束排序:\n[1,2] [1,3] [2,3] [3,4]\n 选    跳过   选    选\n=> 3 场",
  "derivation": [
    "为什么需要：会议室安排、CPU 任务调度都归约为最多不重叠区间。",
    "怎么实现：按 end 排序后贪心选最早结束且不冲突者。",
    "有什么代价：若要求\"权重最大\"则变成加权区间调度需用 DP。",
    "怎么评测：无区间返回 0；全重叠只选 1；与手算一致。"
  ],
  "edgeCases": [
    "区间列表为空返回 0。",
    "所有区间互相重叠时只能选 1 个。",
    "首尾相接（end==start）视为不重叠可同选。"
  ],
  "pitfalls": [
    "按开始时间而非结束时间排序，贪心不再最优。",
    "把不重叠条件写成 > 而非 >=，漏掉首尾相接区间。"
  ],
  "prerequisites": [
    "贪心算法",
    "按关键字排序"
  ],
  "workedExample": [
    "intervals=[[1,2],[2,3],[3,4],[1,3]]。",
    "按 end 排序贪心选 [1,2],[2,3],[3,4]，共 3。"
  ],
  "lineByLine": [
    "按结束时间升序排序。",
    "last_end 初 -1 表示尚未选。",
    "遍历区间，start>=last_end 则选中并更新 last_end。"
  ],
  "codeNotes": [
    "用 s>=last_end 允许首尾相接（end==start）算不重叠；这是常见约定差异点。"
  ],
  "followUps": [
    {
      "question": "若区间有权重怎么求最大权？",
      "answer": "按 end 排序后 DP：dp[i]=max(dp[i-1], dp[prev]+w)，prev 为不冲突的最近区间。"
    },
    {
      "question": "这题算 DP 还是贪心？",
      "answer": "标准最多不重叠是贪心即可最优；只有加权重才必须用 DP。"
    }
  ],
  "followUpAnswers": [
    "按 end 排序后 DP：dp[i]=max(dp[i-1], dp[prev]+w)，prev 为不冲突的最近区间。",
    "标准最多不重叠是贪心即可最优；只有加权重才必须用 DP。"
  ],
  "kind": "code"
};
