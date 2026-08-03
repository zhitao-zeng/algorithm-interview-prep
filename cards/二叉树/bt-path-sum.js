export default {
  "id": "bt-path-sum",
  "category": "二叉树",
  "difficulty": "Easy",
  "title": "路径总和",
  "prompt": "给定二叉树与目标和 targetSum，判断是否存在从根到叶子节点的路径，其节点值之和等于 targetSum。例如，树 [5,4,8,11,null,13,4,7,2,null,null,null,1]，targetSum=22，存在路径 5→4→11→2 和为 22，返回 True？",
  "quickAnswer": "递归向下把 targetSum 减去当前节点值，到达叶子且剩余为 0 即找到；时间 O(n)，空间 O(h)。",
  "approach": "DFS 携带剩余目标和，到叶子时检查剩余是否为 0。",
  "explanationFocus": "是什么：路径总和要求“从根到某个叶子”连续路径的和等于目标；递归每次用剩余和减去当前节点值，递归到叶子时若剩余恰好为 0 即存在解。",
  "bruteForce": "收集所有根到叶子的路径值列表，再逐个求和比对。",
  "invariant": "进入以 node 为根的子树时，remain 表示“从根到 node 之前已累计，还需在余下（含 node）凑出”的目标；到叶子时 remain==node.val 即成功。",
  "walkthrough": "树 5(4(11(7,2)),8)。target=22：到 5 剩 17，到 4 剩 13，到 11 剩 2，到叶子 2 剩 0 → 命中 True。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef hasPathSum(root, targetSum):\n    def dfs(node, remain):\n        if node is None:\n            return False\n        if node.left is None and node.right is None:\n            return remain == node.val\n        return dfs(node.left, remain - node.val) or dfs(node.right, remain - node.val)\n    return dfs(root, targetSum)",
  "complexity": "时间 O(n)，空间 O(h)。",
  "beginnerSummary": "像从目标金额里一路扣钱，走到终点（叶子）时恰好把钱扣光就说明这条路走得通。",
  "diagram": "      5\n     / \\\n    4   8\n   /   / \\\n 11   13  4\n / \\       \\\n7   2       1\n5+4+11+2 = 22",
  "derivation": [
    "为什么需要：只比较子树和会忽略“必须是叶子结尾”这一约束。",
    "怎么实现：递归传剩余和，到叶子判 remain==val。",
    "有什么代价：O(h) 栈空间，且是短路或运算可提前结束。",
    "怎么评测：含正负数、恰好命中、只差一点、空树等用例。"
  ],
  "edgeCases": [
    "空树返回 False。",
    "单个节点值等于 targetSum 返回 True。",
    "存在等于 target 但不到叶子的路径，不算数。",
    "节点含负数时可能多条路径满足。"
  ],
  "pitfalls": [
    "把非叶子节点 remain==0 当作成功，忽略了“必须到叶子”。",
    "递归未对空子树返回 False 导致误判。"
  ],
  "prerequisites": [
    "二叉树与叶子节点定义",
    "DFS 递归",
    "减法传递剩余量"
  ],
  "workedExample": [
    "target=22：5→4→11→2 累计 22 且 2 是叶子 → True。",
    "若在某内部节点提前和为 22 但非叶子，不应返回 True。"
  ],
  "lineByLine": [
    "dfs 空节点返回 False（基线）。",
    "若左右均空即叶子，返回 remain==node.val。",
    "否则对左右子树递归，剩余量减去 node.val。",
    "用 or 短路：任一侧找到即返回 True。"
  ],
  "codeNotes": [
    "必须判断叶子（左右皆空）才检查剩余和，避免内部节点误判。"
  ],
  "followUps": [
    {
      "question": "如何返回所有和为 target 的路径？",
      "answer": "回溯收集路径节点，到叶子且剩余为 0 时把当前路径加入结果。"
    },
    {
      "question": "路径不必从根开始怎么改？",
      "answer": "两遍递归或前缀和：对每个节点当终点，再用哈希表统计前缀和出现次数。"
    }
  ],
  "followUpAnswers": [
    "回溯收集路径节点，到叶子且剩余为 0 时把当前路径加入结果。",
    "两遍递归或前缀和：对每个节点当终点，再用哈希表统计前缀和出现次数。"
  ],
  "kind": "code"
};
