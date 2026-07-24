export default {
  "kind": "code",
  "id": "55",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "跳跃游戏",
  "prompt": "判断能否到达最后下标。",
  "quickAnswer": "贪心维护最远可达位置，遍历到不可达位置立即失败。",
  "approach": "贪心维护最远可达位置，遍历到不可达位置立即失败。",
  "explanationFocus": "跳跃游戏：贪心维护最远可达位置，遍历到不可达位置立即失败。",
  "bruteForce": "《跳跃游戏》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "模拟所有跳法是指数级且不必要。",
    "只需关心「最远能到哪」：能到达的区域内任一位置都能作为跳板，取它们跳跃能力的最大值即可。",
    "一旦 reach>=末位，提前返回 True；遇到 i>reach 提前 False。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 跳跃游戏：贪心维护最远可达位置，遍历到不可达位置立即失败。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《跳跃游戏》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "长度为 1：起点即终点，返回 True。",
    "中间出现 0 但 reach 已覆盖更后方：仍可越过 0。",
    "首元素为 0 且长度>1：直接 False。"
  ],
  "code": "# Python\ndef can_jump(nums):\n    if not nums:\n        return False\n    far = 0\n    for i, jump in enumerate(nums):\n        if i > far:\n            return False\n        far = max(far, i + jump)\n        if far >= len(nums) - 1:\n            return True\n    return True",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。",
  "followUps": [
    {
      "question": "为什么不需要选择具体跳跃长度？",
      "answer": "只要某个已达位置能覆盖更远边界，其他较短跳法不会增加可达范围；far 已概括全部可能性。"
    },
    {
      "question": "如何求最少跳跃次数？",
      "answer": "按 far 和当前层边界做 BFS 式贪心，每次扩展一层并计数。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "只判断 nums[i]==0 就认为卡住，忽略 reach 可能已越过该 0。",
    "用 i+step 更新 reach 前没先判 i<=reach，导致用了「不可达位置」的跳跃能力。"
  ],
  "beginnerSummary": "每个元素 nums[i] 表示「从位置 i 最远能跳 nums[i] 步」。问能否跳到最后一个位置。贪心：维护「当前能到达的最远下标 reach」，从左到右扫描，只要 i <= reach 就尝试用 nums[i] 更新 reach；一旦 reach 覆盖到最后一个下标就成功；若 i 超过了 reach 说明中间断了，无法继续。",
  "prerequisites": [
    "reach = 到目前为止，依靠前面的跳跃能覆盖到的最远下标。",
    "只有 i <= reach 时，位置 i 才是「可达的」，才能用它的跳跃能力扩展 reach。",
    "若扫描到某个 i > reach，说明从起点到 i 之间出现了断层，永远到不了 i 及之后。"
  ],
  "workedExample": [
    "nums=[2,3,1,1,4]。reach=0；i=0: reach=max(0,0+2)=2；i=1(<=2): reach=max(2,1+3)=4 ≥ 末(4) → 可达。",
    "nums=[3,2,1,0,4]。reach 依次 3,3,3,3；i=4 时 4>reach=3 → 断层，返回 False（虽然末位值是4但到不了）。"
  ],
  "lineByLine": [
    "reach = 0。",
    "for i, step in enumerate(nums)：若 i > reach 返回 False。",
    "reach = max(reach, i + step)。",
    "循环结束返回 True（期间未被断层拦截）。"
  ],
  "diagram": "[2,3,1,1,4]\nreach=0\ni0: reach=max(0,0+2)=2\ni1: reach=max(2,1+3)=4 ≥ 末(4) → 可达\n维护\"最远可达下标\""
};
