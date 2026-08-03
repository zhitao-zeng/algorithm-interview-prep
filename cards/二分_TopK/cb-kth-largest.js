export default {
  "id": "cb-kth-largest",
  "category": "二分/TopK",
  "difficulty": "Medium",
  "title": "第K大(快排划分)",
  "prompt": "给定整数数组 nums 和 k（1 基于），请返回数组中第 k 大的元素。例如 nums = [3,2,1,5,6,4]，k = 2 时，第 2 大是 5？",
  "quickAnswer": "用快速选择（quickselect）：随机/固定选基准 pivot，把数组按\"大于等于 pivot 的在左\"划分，若 pivot 位置恰为 k-1 则返回，否则只在含目标的那一半递归。平均 O(n)，最坏 O(n^2)。",
  "approach": "在 [left,right] 内以最右元素为 pivot，把 >=pivot 的移到左、<pivot 的移到右，得到 pivot 最终位置 i。若 i==k-1 返回 nums[i]；i>k-1 去左半；否则去右半。",
  "explanationFocus": "是什么：快速选择是快速排序的\"只走一边\"变体——它不需要完全排序，只根据 pivot 的最终排名决定继续搜索哪一半，从而把期望复杂度从 O(n log n) 降到 O(n)。",
  "bruteForce": "全排序取第 k 个，时间 O(n log n)。",
  "invariant": "目标第 k 大元素始终位于当前子区间 [left,right] 内；pivot 归位后其排名已确定，可据此丢弃一半。",
  "walkthrough": "nums=[3,2,1,5,6,4], k=2 找第2大(排名下标 k-1=1，按降序)。pivot=4(末)，划分：>=4 留左 -> [6,5,4] 在左，<4 在右 [3,2,1]，pivot 位置 i=2。目标位1<2 去左半 [6,5]。pivot=5, 划分 [6,5] -> i=1 ==1 返回 5。",
  "code": "def kth_largest(nums, k):\n    def quickselect(left, right, target):\n        pivot = nums[right]\n        i = left\n        for j in range(left, right):\n            if nums[j] >= pivot:\n                nums[i], nums[j] = nums[j], nums[i]\n                i += 1\n        nums[i], nums[right] = nums[right], nums[i]\n        if i == target:\n            return nums[i]\n        elif i > target:\n            return quickselect(left, i - 1, target)\n        else:\n            return quickselect(i + 1, right, target)\n    return quickselect(0, len(nums) - 1, k - 1)",
  "complexity": "平均 O(n) / O(1)",
  "beginnerSummary": "像选第 k 名：随便抓个人当擂台，比他强的站左边、弱的站右边；看擂台排第几，直接抛弃不含目标的那半边，重复到擂台正好是第 k 名为止。",
  "diagram": "nums: [3,2,1,5,6,4]  pivot=4\n划分: [6,5,4 | 3,2,1]  pivot位=2, 目标位1 -> 进左[6,5]",
  "derivation": [
    "为什么需要：全排序取第 k 个浪费，quickselect 只搜一半。",
    "怎么实现：Lomuto 划分按 >=pivot 聚集，递归目标侧。",
    "有什么代价：平均 O(n) 但最坏 O(n^2)；可随机化 pivot 规避。",
    "怎么评测：结果与排序后倒数第 k 个比较。"
  ],
  "edgeCases": [
    "k=1 即最大值；",
    "k=n 即最小值；",
    "数组有重复值不影响排名；",
    "单元素直接返回。"
  ],
  "pitfalls": [
    "划分按 >= 聚集是为了\"第 k 大\"（降序排名），别用成升序；",
    "基准取最右且 for 循环到 right-1，最后交换归位，越界会错。"
  ],
  "prerequisites": [
    "快速排序与 Lomuto 划分",
    "排名与下标映射(k-1)"
  ],
  "workedExample": [
    "输入 nums=[3,2,1,5,6,4], k=2 -> 输出 5",
    "输入 nums=[3,2,3,1,2,4,5,5,6], k=4 -> 输出 4"
  ],
  "lineByLine": [
    "以最右元素为 pivot；",
    "for 把 >=pivot 的元素交换到左侧，i 标记分界；",
    "循环结束把 pivot 换到分界位置 i；",
    "比较 i 与目标位，命中返回，否则递归左/右半。"
  ],
  "codeNotes": [
    "就地划分，空间 O(1)（递归栈最坏 O(n)）；",
    "用 >= 而非 > 使重复元素稳定落在左侧，排名正确。"
  ],
  "followUps": [
    {
      "question": "最坏 O(n^2) 如何避免？",
      "answer": "随机选取 pivot（随机交换到末尾）可使期望 O(n)，几乎不会触发最坏；或采用中位数的中位数算法保证 O(n)。"
    },
    {
      "question": "TopK 与第 k 大有何联系？",
      "answer": "第 k 大是 TopK 的边界值；quickselect 找到第 k 大后，左半（>=它）恰为最大的 k 个。"
    }
  ],
  "followUpAnswers": [
    "随机选取 pivot（随机交换到末尾）可使期望 O(n)，几乎不会触发最坏；或采用中位数的中位数算法保证 O(n)。",
    "第 k 大是 TopK 的边界值；quickselect 找到第 k 大后，左半（>=它）恰为最大的 k 个。"
  ],
  "kind": "code"
};
