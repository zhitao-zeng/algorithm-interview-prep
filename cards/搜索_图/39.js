export default {
  "kind": "code",
  "id": "39",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "组合总和",
  "prompt": "元素可重复使用，找和为 target 的组合。",
  "quickAnswer": "递归从 start 开始，允许下一层仍使用当前下标以避免排列重复。",
  "approach": "递归从 start 开始，允许下一层仍使用当前下标以避免排列重复。",
  "explanationFocus": "组合总和：递归从 start 开始，允许下一层仍使用当前下标以避免排列重复。",
  "bruteForce": "《组合总和》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。",
  "derivation": [
    "暴力枚举所有可能的重复次数极多。",
    "回溯 + 「只向后选」把搜索空间组织成树：每条从根到叶的路径是一个候选组合，且因顺序固定而不会重复。",
    "剩余目标为负时整条分支不可能凑出 target，立即剪枝，大幅减少搜索。"
  ],
  "invariant": "搜索前沿只包含 组合总和：递归从 start 开始，允许下一层仍使用当前下标以避免排列重复。 下尚未扩展且状态合法的候选。",
  "walkthrough": "演练《组合总和》时画出一层搜索树或队列，标记访问和回溯恢复的位置。",
  "edgeCases": [
    "target=0：通常返回包含一个空组合的列表（依题意）。",
    "候选含 0：可无限使用 0 导致死循环，题目一般不含 0 或需特判。",
    "无可行组合：返回空列表。"
  ],
  "code": "# Python\ndef combination_sum(candidates, target):\n    candidates = sorted(set(candidates))\n    result = []\n    path = []\n\n    def dfs(start, remain):\n        if remain == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            value = candidates[i]\n            if value > remain:\n                break\n            path.append(value)\n            dfs(i, remain - value)\n            path.pop()\n\n    dfs(0, target)\n    return result",
  "codeNotes": [
    "BFS 入队时标记访问，避免重复入队。",
    "回溯函数退出前恢复现场。"
  ],
  "complexity": "时间取决于候选与目标，最坏指数级；靠剪枝收敛。空间 O(target/min)（递归深度）。",
  "followUps": [
    {
      "question": "为什么不会生成 [3,2]？",
      "answer": "下一层 start 不小于当前 i，只允许下标不下降，因此组合按非降序构造。"
    },
    {
      "question": "每个候选只能用一次怎么办？",
      "answer": "把递归参数改为 i+1；若同层去重，还要排序并跳过 candidates[i]==candidates[i-1]。"
    }
  ],
  "followUpAnswers": [
    "无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。",
    "保存 parent 或在 path 中记录选择。"
  ],
  "pitfalls": [
    "递归下一层用 i+1 而不是 i，会禁止重复使用同一数字，变成「每个数最多用一次」的错误语义。",
    "不限制「只向后选」而允许回头，会产出 [2,3] 与 [3,2] 这种重复组合。"
  ],
  "beginnerSummary": "给定无重复候选数组和一个目标值，找出所有「和等于 target」的组合，候选数字可无限次重复使用。用回溯：按数组顺序逐个考虑候选，决定「用几个当前数」，每用一次就把剩余目标减去它，直到剩余为 0（找到一个组合）或小于 0（剪枝）。为免产出重复组合（如 [2,3] 与 [3,2]），规定每一层只从「当前下标及之后」选，不允许回头选更小的。",
  "prerequisites": [
    "可重复使用 → 递归时下一层仍从「当前下标」开始（不往前退），保证同一数能用多次。",
    "为避免顺序不同造成的重复组合，强制「只向后选」：dfs(start) 只遍历 i>=start 的候选。",
    "剩余目标 = target - 已选之和；为 0 即成一组合，<0 直接剪枝返回。"
  ],
  "workedExample": [
    "candidates=[2,3,6,7], target=7。选 2：剩 5；再选 2：剩 3；再选 2：剩 1；再选 2：剩 -1 <0 剪枝。",
    "回溯换分支：2,2,3 = 7 → 记 [2,2,3]；另路 7 = 7 → 记 [7]。结果 [[2,2,3],[7]]。"
  ],
  "lineByLine": [
    "result=[]，path=[]。",
    "dfs(start, remain)：若 remain==0，加入 path 副本；若 remain<0，直接返回。",
    "for i in range(start, n)：path.append(candidates[i])，dfs(i, remain-candidates[i])，path.pop() 回溯。",
    "起始 dfs(0, target)。"
  ],
  "diagram": "candidates=[2,3,6,7], target=7\n2→2→2→1(超) 回溯\n2→2→3 = 7  ✓ [2,2,3]\n      7 = 7  ✓ [7]\n指针不前进 → 同一数可重复选"
};
