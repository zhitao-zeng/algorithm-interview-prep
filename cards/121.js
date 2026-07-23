export default {
  "kind": "code",
  "id": "121",
  "category": "动态规划",
  "difficulty": "Easy",
  "title": "买卖股票的最佳时机",
  "prompt": "最多一次交易的最大利润。",
  "quickAnswer": "扫描中维护历史最低买入价，用当天卖出更新利润。",
  "approach": "扫描中维护历史最低买入价，用当天卖出更新利润。",
  "explanationFocus": "买卖股票的最佳时机：扫描中维护历史最低买入价，用当天卖出更新利润。",
  "bruteForce": "《买卖股票的最佳时机》的递归基线会重复计算相同子问题，通常呈指数增长。",
  "derivation": [
    "枚举所有买卖对 O(n²) 可优化。",
    "任一合法卖出日 i，最佳买入是 [0,i] 的最低价；边扫描边维护 min_price，每天 O(1) 算潜在利润，整体 O(n)。",
    "只交易一次，故只需一个最小值变量，无需 DP 表。"
  ],
  "invariant": "计算到当前下标时，所有更小子问题的 买卖股票的最佳时机：扫描中维护历史最低买入价，用当天卖出更新利润。 状态已是最优值。",
  "walkthrough": "用最小输入填一张《买卖股票的最佳时机》的 DP 表，解释每个格子来自哪个前驱。",
  "edgeCases": [
    "价格单调递减：最大利润为 0（不买卖）。",
    "单日或空：返回 0。",
    "含负数价格（若允许）：逻辑仍成立，min_price 取最小。"
  ],
  "code": "# Python\ndef max_profit(prices):\n    lowest = float('inf')\n    profit = 0\n    for price in prices:\n        lowest = min(lowest, price)\n        profit = max(profit, price - lowest)\n    return profit",
  "codeNotes": [
    "转移依赖方向决定循环顺序。",
    "可压缩时只保留下一步真正依赖的状态。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。",
  "followUps": [
    {
      "question": "如何返回买卖日期？",
      "answer": "更新 lowest 时保存 low_day；刷新 profit 时同时保存 low_day 和当前 day。"
    },
    {
      "question": "允许多次交易时还能用这个状态吗？",
      "answer": "不能；需要持有/不持有状态 DP，或在无手续费时累加每天上涨。"
    }
  ],
  "followUpAnswers": [
    "记录选择或从最终状态按转移反向回溯。",
    "用滚动数组或有限个前驱变量替换整张表。"
  ],
  "pitfalls": [
    "用 max_profit 初值 0 会在全跌时正确返回 0；若初值设 -inf 反而会输出负利润，需按题意选。",
    "没先更新 min_price 再算利润，可能导致「同一天买卖」（买入价用了当天价）。"
  ],
  "beginnerSummary": "只允许「一次买入 + 一次卖出」（且先买后卖），求最大利润。只需维护「到目前为止见过的最低买入价」，每天用「当天价 - 最低价」更新最大利润即可。因为卖出必须在买入之后，而从左到右扫描时，当前最低价一定出现在当前天之前，天然满足先后关系。",
  "prerequisites": [
    "利润 = 卖出价 - 买入价，且卖出日索引 > 买入日索引。",
    "从左到右扫描，min_price 记录「历史最低」，保证它一定早于当前考察的卖出日。",
    "每天用 prices[i] - min_price 尝试刷新最大利润。"
  ],
  "workedExample": [
    "prices=[7,1,5,3,6,4]。min 初始 7；到 1 时 min=1；5-1=4→profit=4；3-1=2 不刷新；6-1=5→profit=5；4-1=3 不刷新。最终 5。",
    "若价格一直下跌（如 [7,6,4,3,1]），每天利润都为负，最大利润保持 0（不交易）。"
  ],
  "lineByLine": [
    "min_price = +inf，max_profit = 0。",
    "遍历 price：min_price = min(min_price, price)。",
    "max_profit = max(max_profit, price - min_price)。",
    "返回 max_profit。"
  ],
  "diagram": "价=[7,1,5,3,6,4]\nmin=7 → 1   profit=max(0,5-1)=4\n         min=1, 6-1=5 → profit=5\n一次买卖, 维护最低买入价"
};
