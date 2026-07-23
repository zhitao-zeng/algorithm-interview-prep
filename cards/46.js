export default {
  "kind": "code",
  "id": "46",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "全排列",
  "prompt": "返回无重复数组的所有排列。",
  "quickAnswer": "回溯维护 path 和 used；长度到 n 时复制答案。",
  "approach": "回溯维护 path 和 used；长度到 n 时复制答案。",
  "explanationFocus": "全排列：回溯维护 path 和 used；长度到 n 时复制答案。",
  "bruteForce": "《全排列》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。",
  "derivation": [
    "暴力穷举要先生成所有顺序再筛重，低效且难写。",
    "回溯边构建边剪枝：只要「维护已用集合」，每个位置只从没用过的数字里选，天然不重复。",
    "每填满一层就递归下一层，填满全部长度即记录；返回时撤销最后选择，复用同一数组继续下一个分支，空间只 O(n)。"
  ],
  "invariant": "搜索前沿只包含 全排列：回溯维护 path 和 used；长度到 n 时复制答案。 下尚未扩展且状态合法的候选。",
  "walkthrough": "演练《全排列》时画出一层搜索树或队列，标记访问和回溯恢复的位置。",
  "edgeCases": [
    "空数组：通常返回空列表的列表（一个空集）。",
    "数组含重复数字：本实现会产出重复排列，需用「同层同值跳过」或排序去重（进阶）。",
    "单元素：只有一种排列 [ [x] ]。"
  ],
  "code": "# Python\ndef permute(nums):\n    result = []\n    path = []\n    used = [False] * len(nums)\n\n    def dfs():\n        if len(path) == len(nums):\n            result.append(path[:])\n            return\n        for i, value in enumerate(nums):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(value)\n            dfs()\n            path.pop()\n            used[i] = False\n\n    dfs()\n    return result",
  "codeNotes": [
    "BFS 入队时标记访问，避免重复入队。",
    "回溯函数退出前恢复现场。"
  ],
  "complexity": "时间 O(n·n!)（n! 个排列，每个构造 O(n)），空间 O(n)（递归栈与路径）。",
  "followUps": [
    {
      "question": "为什么要标记下标而不是值？",
      "answer": "这样即使输入出现相同值也能区分两个位置；无重复题目中两者都可行，但下标更稳健。"
    },
    {
      "question": "如何只求排列数量？",
      "answer": "无需保存 path 和 result，返回 n! 或在回溯叶子处累加计数即可，从 O(n·n!) 的输出空间降为 O(n)。"
    }
  ],
  "followUpAnswers": [
    "无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。",
    "保存 parent 或在 path 中记录选择。"
  ],
  "pitfalls": [
    "加入结果时直接 append(path) 而非副本，后续回溯会改动已加入的列表 → 必须 append(path[:])。",
    "忘记在递归后撤销 used 标记和 path，导致状态错乱、分支混淆。"
  ],
  "beginnerSummary": "给定无重复数字数组，输出所有可能的排列。用回溯（DFS）：维护一个「当前已选路径」和「哪些数字还没用过」的标记，每一步从剩余未用的数字里挑一个接在路径末尾，选满长度等于数组长度时就得到一个完整排列；然后撤销最后一步（回溯），换下一个未用数字继续。这样不重不漏地穷举所有排列。",
  "prerequisites": [
    "排列要求顺序不同算不同结果，且每个数字恰好用一次。",
    "用一个 used 布尔数组（或集合）记录哪些位置的数字已经被选入当前路径。",
    "回溯 = 递归选数 + 递归返回后「撤销选择」，从而让同一层能尝试其他分支。"
  ],
  "workedExample": [
    "nums=[1,2,3]。第一层选 1 → 路径[1]，used[0]=True；第二层从剩余 {2,3} 选 2 → [1,2]；第三层剩 {3} → [1,2,3] 完成，加入结果。",
    "回溯到 [1,2] 撤销 3，无剩余；再回溯到 [1] 撤销 2，选 3 → [1,3]，再选 2 → [1,3,2]。同理得到以 2、3 开头的排列，共 6 个。"
  ],
  "lineByLine": [
    "result=[] 收集所有排列，path=[] 当前路径，used=[False]*n 标记。",
    "递归 dfs()：若 len(path)==n，把 path 副本加入 result 并返回。",
    "遍历每个位置 i：若未用过，标记 used[i]=True，把 nums[i] 加入 path，递归，再撤销（path.pop()、used[i]=False）。",
    "从 dfs() 起始，最终 result 即全部排列。"
  ],
  "diagram": "[1,2,3] 全排列 (回溯)\n路径=[] → 选1 → [1] → 选2 → [1,2] → 选3 → [1,2,3] ✓\n回溯, 换分支:\n[1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]\n每层选一个未用元素, used 标记防重复"
};
