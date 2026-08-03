export default {
  "id": "cz-trap-rain",
  "category": "数组/窗口",
  "difficulty": "Hard",
  "title": "接雨水",
  "prompt": "给定 n 个非负整数表示柱状图的每个柱子高度，求下雨之后这些柱子之间能接多少雨水。例如 height = [0,1,0,2,1,0,1,3,2,1,2,1] 能接 6 单位雨水？",
  "quickAnswer": "双指针法：左、右指针从两端向中间夹，维护左右已见的最大高度 left_max/right_max。哪边矮就处理哪边，当前格能接的雨水 = 该边最大值 - 当前高度（为正才接）。时间 O(n)，空间 O(1)。",
  "approach": "left=0,right=n-1，left_max=right_max=0。当 left<right：若 height[left]<height[right]，更新 left_max 并累加 left_max-height[left]，left++；否则对称处理右指针。",
  "explanationFocus": "是什么：对于位置 i，它能接的雨水量由\"左右两侧最高柱子的较小值\"决定，即 min(leftMax,rightMax)-height[i]，双指针在 O(1) 空间内动态逼近这个约束。",
  "bruteForce": "对每个位置 i，分别向左、向右扫描找最大值 lMax、rMax，雨水加 min(lMax,rMax)-height[i]，时间 O(n^2)。",
  "invariant": "left_max 是 [0,left] 的最高柱，right_max 是 [right,n-1] 的最高柱；已处理的格子雨水已正确累计，且 left<right。",
  "walkthrough": "height=[0,1,0,2,1,0,1,3,2,1,2,1]。left=0,right=11。height[0]=0<height[11]=1：left_max=0,水+=0,left=1；height[1]=1<1：left_max=1,水+=0,left=2；height[2]=0<1：水+=1-0=1,left=3... 继续直到左右汇合，累计得 6。",
  "code": "def trap(height):\n    if not height:\n        return 0\n    left, right = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water",
  "complexity": "O(n) / O(1)",
  "beginnerSummary": "想象两边是墙往中间合拢，哪边矮就先填哪边脚下：当前格子能存的水取决于\"矮墙那边已经出现的最高处\"减去自己的高度。",
  "diagram": "height: 0 1 0 2 1 0 1 3 2 1 2 1\n        ^L                       ^R\n矮侧先算: water += left_max - h[L]",
  "derivation": [
    "为什么需要：暴力对每个位置找左右最大值 O(n^2) 太慢。",
    "怎么实现：双指针，矮侧移动并用水位 max-当前高度累加。",
    "有什么代价：O(1) 空间；需要理解\"矮侧的最大值就是该侧真正瓶颈\"。",
    "怎么评测：与逐位置法结果比对，或人工小规模验算。"
  ],
  "edgeCases": [
    "空数组返回 0；",
    "严格递增或递减数组接不到水（返回 0）；",
    "全为 0 的高度返回 0；",
    "单元素无法接水返回 0。"
  ],
  "pitfalls": [
    "用错比较对象（应用 height 比较决定移动哪侧，而非直接用 max 比较）；",
    "忘记先更新 max 再加水，导致把当前柱自身高度也算成可接水量。"
  ],
  "prerequisites": [
    "双指针技巧",
    "对\"木桶短板\"约束的理解"
  ],
  "workedExample": [
    "输入 [0,1,0,2,1,0,1,3,2,1,2,1] -> 输出 6",
    "输入 [4,2,0,3,2,5] -> 输出 9"
  ],
  "lineByLine": [
    "空数组直接返回 0；",
    "while left<right 时，比较两端高度决定处理哪一侧；",
    "处理左侧时先刷新 left_max，再累加 left_max-height[left]（负数不计，因已取 max）；",
    "右指针对称处理，最后返回总水量。"
  ],
  "codeNotes": [
    "只移动较矮一侧，是因为该侧的最大值已确定其为瓶颈；",
    "left_max/right_max 用 max 更新保证非负，天然忽略\"自身高出水位\"的情况。"
  ],
  "followUps": [
    {
      "question": "能否用单调栈做？适用什么场景？",
      "answer": "可以，单调栈按\"凹型\"逐层计算每格上方雨水，思路更直观，空间 O(n)，适合需要中间过程或题目变体（如接雨水 II 三维）。"
    },
    {
      "question": "如果柱子宽度不为 1 怎么办？",
      "answer": "把每格宽度乘进水量即可，双指针法只需把 water += 改成 water += (left_max-h)*width。"
    }
  ],
  "followUpAnswers": [
    "可以，单调栈按\"凹型\"逐层计算每格上方雨水，思路更直观，空间 O(n)，适合需要中间过程或题目变体（如接雨水 II 三维）。",
    "把每格宽度乘进水量即可，双指针法只需把 water += 改成 water += (left_max-h)*width。"
  ],
  "kind": "code"
};
