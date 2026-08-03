export default {
  "id": "cb-sqrt-newton",
  "category": "二分/TopK",
  "difficulty": "Easy",
  "title": "牛顿法/二分求平方根",
  "prompt": "给定非负整数 x，请返回 floor(sqrt(x))，即不大于 x 平方根的最大整数。例如 x = 8 时，sqrt(8)≈2.828，返回 2？",
  "quickAnswer": "二分法：在 [0, x//2]（x<2 时特判）上二分，找满足 mid*mid<=x 的最大 mid，返回 right。时间 O(log x)，空间 O(1)。也可用牛顿迭代更快收敛。",
  "approach": "x<2 直接返回 x。否则 left=1,right=x//2，循环 left<=right：mid=(left+right)//2，若 mid*mid==x 返回 mid；若 <x 则记录候选并 left=mid+1；否则 right=mid-1。最后返回 right。",
  "explanationFocus": "是什么：整数平方根是\"在有序的平方序列上二分定位\"的问题，等价于求单调函数 f(m)=m*m 的逆；二分每次砍半搜索区间，牛顿迭代则用切线快速逼近。",
  "bruteForce": "从 0 到 x 逐个试乘比较，时间 O(x)。",
  "invariant": "若存在答案 ans，则 ans 在 [left,right] 内；right 始终是不超过 sqrt(x) 的最大已验证候选。",
  "walkthrough": "x=8。x//2=4，left=1,right=4。mid=2, 2*2=4<=8 -> ans候选2, left=3。mid=3, 9>8 -> right=2。left=3>right=2 退出，返回 right=2。",
  "code": "def my_sqrt(x):\n    if x < 2:\n        return x\n    left, right = 1, x // 2\n    while left <= right:\n        mid = (left + right) // 2\n        sq = mid * mid\n        if sq == x:\n            return mid\n        elif sq < x:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return right",
  "complexity": "O(log x) / O(1)",
  "beginnerSummary": "像猜一个数平方后不超过 x 的最大整数：每次猜中间值，平方小了就往大猜，大了往小猜，最后停在刚好不超过的那个数。",
  "diagram": "x=8: 区间 [1,4]\nmid=2 (4<=8) -> 可, 往大\nmid=3 (9>8)  -> 超, 往小 -> 答案 2",
  "derivation": [
    "为什么需要：线性试乘 O(x) 在 x 很大时不可行。",
    "怎么实现：在 [0, x//2] 二分找最大 mid 使 mid*mid<=x。",
    "有什么代价：O(log x)；注意 mid*mid 在强类型语言可能溢出需用长整型。",
    "怎么评测：返回 right，验证 right*right<=x < (right+1)^2。"
  ],
  "edgeCases": [
    "x=0 或 1 直接返回 x；",
    "x 为完全平方数（如 9）返回精确根 3；",
    "x 很大时 x//2 上界安全；",
    "负数不在本题范围（非负整数）。"
  ],
  "pitfalls": [
    "返回 right 而非 left，因为循环结束时 left 已越过可行区；",
    "上界用 x//2 而非 x，减少不必要搜索（x>=2 时 sqrt(x)<=x/2）。"
  ],
  "prerequisites": [
    "二分查找",
    "完全平方与整数下取整"
  ],
  "workedExample": [
    "输入 8 -> 输出 2",
    "输入 16 -> 输出 4",
    "输入 0 -> 输出 0"
  ],
  "lineByLine": [
    "x<2 时 sqrt 即自身，直接返回；",
    "否则在 [1, x//2] 二分；",
    "mid*mid==x 精确命中即返回；<x 则 left=mid+1 并记下 right 候选；>x 则 right=mid-1；",
    "退出返回 right（最大可行 mid）。"
  ],
  "codeNotes": [
    "循环条件 left<=right 保证不漏；",
    "right 是\"最后一个满足平方<=x\"的位置。"
  ],
  "followUps": [
    {
      "question": "如何用牛顿迭代法实现？",
      "answer": "令 r=x，重复 r=(r+x//r)//2 直到 r*r<=x<(r+1)^2，收敛更快，通常几次迭代即可。"
    },
    {
      "question": "要返回带小数的精确近似怎么办？",
      "answer": "用浮点牛顿法 r=(r+x/r)/2 迭代若干次逼近，或用二分在浮点精度内搜索。"
    }
  ],
  "followUpAnswers": [
    "令 r=x，重复 r=(r+x//r)//2 直到 r*r<=x<(r+1)^2，收敛更快，通常几次迭代即可。",
    "用浮点牛顿法 r=(r+x/r)/2 迭代若干次逼近，或用二分在浮点精度内搜索。"
  ],
  "kind": "code"
};
