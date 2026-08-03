export default {
  "id": "dp-knapsack-01",
  "category": "动态规划",
  "difficulty": "Medium",
  "title": "0-1背包",
  "prompt": "有 n 件物品，第 i 件重量 weights[i]、价值 values[i]，背包容量 capacity，每件最多选一次，求能装下的物品最大总价值？例如 weights=[1,3,4], values=[15,20,30], capacity=4 时选物品0和1（重1+3=4），价值 35？",
  "quickAnswer": "一维 DP：dp[w] 表示容量 w 下的最大价值，逆序遍历容量并做 dp[w]=max(dp[w], dp[w-wt]+val)。时间 O(n*C)，空间 O(C)。",
  "approach": "定义 dp[w] 为容量不超过 w 的最大价值；对每件物品从 C 到 wt 逆序更新，保证每件只被考虑一次。",
  "explanationFocus": "是什么：0-1 背包是资源受限下的最优选型问题，状态 dp[w] 表示\"在容量 w 内所能获得的最大价值\"，转移时对每件物品决定\"放或不放\"。",
  "bruteForce": "枚举所有 2^n 种选物组合逐一算重量与价值，指数级不可扩展。",
  "invariant": "外层处理完前 i 件后，dp[w] 恰为只用前 i 件、容量 w 内的最优值；逆序更新保证每件只用一次。",
  "walkthrough": "weights=[1,3,4], values=[15,20,30], C=4：初 dp 全 0；放物品0(重1)后 dp[1..4]=15；放物品1(重3)后 w=4 时 dp[4]=max(15,dp[1]+20=35)=35，w=3 时 dp[3]=max(15,20)=20；放物品2(重4)后 dp[4]=max(35,dp[0]+30=30)=35；最终返回 35（选物品0+1）。",
  "code": "def knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [0] * (capacity + 1)\n    for i in range(n):\n        for w in range(capacity, weights[i] - 1, -1):\n            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])\n    return dp[capacity]",
  "complexity": "时间 O(n*C)，空间 O(C)（一维数组）。",
  "beginnerSummary": "像整理行李箱：每件东西只能带或不带，从容量大的格子往小格递推，每考虑一件就问\"带上它会不会比现在更值钱\"，最后箱子的总价值最大。",
  "diagram": "容量w: 0 1 2 3 4\n初    : 0 0 0 0 0\n物0(1,15): 0 15 15 15 15\n物1(3,20): 0 15 15 20 35\n物2(4,30): 0 15 15 20 35",
  "derivation": [
    "为什么需要：预算分配、装箱、投资组合都归约为带权选物最大化。",
    "怎么实现：一维 dp 逆序遍历，转移取放/不放较大值。",
    "有什么代价：容量 C 极大时 O(nC) 过慢，可改价值维度或近似。",
    "怎么评测：容量为 0 返回 0；物品超重应被跳过；与穷举一致。"
  ],
  "edgeCases": [
    "capacity=0 时返回 0。",
    "存在重量超过容量的物品应被自然跳过。",
    "价值可为 0，不影响转移。"
  ],
  "pitfalls": [
    "把内循环写成正序导致同一物品被重复使用（变成完全背包）。",
    "忘记把 dp 数组大小设为 capacity+1。"
  ],
  "prerequisites": [
    "DP状态定义",
    "一维数组空间优化"
  ],
  "workedExample": [
    "weights=[1,3,4], values=[15,20,30], capacity=4。",
    "逆序更新后 dp[4]=35（物品0+1）。"
  ],
  "lineByLine": [
    "dp 长度 capacity+1 初 0。",
    "遍历每件物品。",
    "容量从大到小更新 dp[w]=max(不放, 放)。"
  ],
  "codeNotes": [
    "逆序是关键：保证 dp[w-wt] 仍是\"未考虑当前物品\"的旧值，从而每件仅用一次。"
  ],
  "followUps": [
    {
      "question": "如何输出选了哪些物品？",
      "answer": "用二维 dp 或在更新时记录 choice[i][w]，回溯看第 i 件是否被选。"
    },
    {
      "question": "完全背包（可重复选）怎么改？",
      "answer": "把内循环改为正序遍历，使同一物品可被多次装入。"
    }
  ],
  "followUpAnswers": [
    "用二维 dp 或在更新时记录 choice[i][w]，回溯看第 i 件是否被选。",
    "把内循环改为正序遍历，使同一物品可被多次装入。"
  ],
  "kind": "code"
};
