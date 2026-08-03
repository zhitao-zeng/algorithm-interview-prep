export default {
  "id": "cz-max-product-subarray",
  "category": "数组/窗口",
  "difficulty": "Medium",
  "title": "乘积最大子数组",
  "prompt": "给定一个整数数组 nums，请找出乘积最大的连续子数组（至少含一个元素），返回其乘积。例如 nums = [2,3,-2,4] 时，最大乘积子数组是 [2,3] 得 6？",
  "quickAnswer": "因为负数会让最小值变最大值，需同时维护当前最大 cur_max 与最小 cur_min。遍历时若遇到负数则交换二者，再分别用 x 与 x*极值取新极值。时间 O(n)，空间 O(1)。",
  "approach": "初始化 cur_max=cur_min=best=nums[0]。对后续每个 x：若 x<0 先交换 cur_max/cur_min；cur_max=max(x, cur_max*x)；cur_min=min(x, cur_min*x)；best=max(best,cur_max)。",
  "explanationFocus": "是什么：这是\"局部最优递推\"的动态规划思想——由于乘负数会反转大小关系，必须同时追踪\"到当前位置为止的最大乘积\"和\"最小乘积\"两条状态。",
  "bruteForce": "枚举所有子数组端点并累乘比较，时间 O(n^2)。",
  "invariant": "cur_max 是以 i 结尾的子数组的最大乘积，cur_min 是以 i 结尾的最小乘积；best 是全局最优。",
  "walkthrough": "nums=[2,3,-2,4]。i0: cur_max=cur_min=best=2。i1 x=3: cur_max=max(3,6)=6, cur_min=min(3,6)=3, best=6。i2 x=-2<0 交换(6,3)->(3,6): cur_max=max(-2,3*-2=-6)=-2, cur_min=min(-2,6*-2=-12)=-12, best=6。i3 x=4: cur_max=max(4,-8)=4, cur_min=min(4,-48)=-48, best=6。",
  "code": "def max_product(nums):\n    best = cur_max = cur_min = nums[0]\n    for x in nums[1:]:\n        if x < 0:\n            cur_max, cur_min = cur_min, cur_max\n        cur_max = max(x, cur_max * x)\n        cur_min = min(x, cur_min * x)\n        best = max(best, cur_max)\n    return best",
  "complexity": "O(n) / O(1)",
  "beginnerSummary": "乘积像温度，乘上负数会\"冷热颠倒\"，所以一手拿最高一手拿最低，遇到负号先把两手互换，再重新从\"只取自己\"或\"接上前面\"里挑。",
  "diagram": "nums: 2  3  -2   4\ncur_max: 2  6  -2   4\ncur_min: 2  3  -12 -48\nbest   : 2  6   6   6",
  "derivation": [
    "为什么需要：最大子段和的贪心在乘法下失效，因为负负得正。",
    "怎么实现：同时维护到 i 为止的最大/最小乘积，遇负交换后递推。",
    "有什么代价：O(1) 空间；需理解为何\"重开\" x 本身也是候选。",
    "怎么评测：与枚举所有子数组乘积的暴力结果对比。"
  ],
  "edgeCases": [
    "含 0 时乘积归零，但单个 0 也可能是答案；",
    "全负数（如 [-2,-3,-1]）最大为两个负数之积 6；",
    "单元素直接返回自身；",
    "元素含 1 不改变极值但可能被选中。"
  ],
  "pitfalls": [
    "只维护最大值会漏掉\"负×负\"翻正的情况；",
    "忘记用 x 自身重开子数组，导致被迫接上使乘积更小的历史。"
  ],
  "prerequisites": [
    "最大子段和( Kadane )思想",
    "负数翻转极值的直觉"
  ],
  "workedExample": [
    "输入 [2,3,-2,4] -> 输出 6",
    "输入 [-2,0,-1] -> 输出 0",
    "输入 [-2,-3,-1] -> 输出 6"
  ],
  "lineByLine": [
    "best/cur_max/cur_min 初始化为首元素；",
    "x<0 时交换 cur_max 与 cur_min，因为符号反转大小关系；",
    "cur_max 取 max(x, cur_max*x)，cur_min 取 min(x, cur_min*x)；",
    "best 始终记录出现过的最大 cur_max。"
  ],
  "codeNotes": [
    "用 x 自身作为候选，相当于\"在此处重新开始子数组\"；",
    "交换必须在更新极值之前完成。"
  ],
  "followUps": [
    {
      "question": "如果要求返回该子数组本身（区间）？",
      "answer": "在更新 cur_max 时同时记录起止下标，并在刷新 best 时保存全局最优区间即可。"
    },
    {
      "question": "乘积可能溢出吗？",
      "answer": "Python 整数无溢出；在 C++/Java 中可改用对数相加或限制范围，或检查是否越界。"
    }
  ],
  "followUpAnswers": [
    "在更新 cur_max 时同时记录起止下标，并在刷新 best 时保存全局最优区间即可。",
    "Python 整数无溢出；在 C++/Java 中可改用对数相加或限制范围，或检查是否越界。"
  ],
  "kind": "code"
};
