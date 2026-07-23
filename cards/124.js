export default {
  "kind": "code",
  "id": "124",
  "category": "二叉树",
  "difficulty": "Hard",
  "title": "二叉树最大路径和",
  "prompt": "路径可从任意节点开始结束，求最大节点和。",
  "diagram": "       1\n      / \\\n     2   3\n    / \\\n  -4  -5\n\n路径可\"拐弯\"(以某节点为顶, 汇合左右):\n  2为顶: (-4)→2→(-5) = -7\n  1为顶:  2 → 1 → 3  = 6   ← 全局最优\n单臂贡献(向上汇报): 只能选左或右一条支路",
  "quickAnswer": "后序返回向下单臂贡献。",
  "approach": "后序返回向下单臂贡献。",
  "explanationFocus": "二叉树最大路径和：后序返回向下单臂贡献。",
  "bruteForce": "《二叉树最大路径和》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 二叉树最大路径和：后序返回向下单臂贡献。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《二叉树最大路径和》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "枚举所有路径再比较会重复计算子问题，复杂度爆炸。",
    "每个节点只做一次「单臂贡献返回」和一次「左右汇合更新答案」，子树结果被复用，整体 O(n)。",
    "返回时只能选一条支路向上，否则父节点会接到一个分叉，不再是简单路径。"
  ],
  "edgeCases": [
    "全负树：best 选中值最大的单个节点（不会是 0）。",
    "单节点：best 就是该节点值。",
    "只有单边子树：另一边贡献为 0。"
  ],
  "code": "# Python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef max_path_sum(root):\n    if not root:\n        return 0\n    best = float(\"-inf\")\n    def dfs(node):\n        nonlocal best\n        if not node: return 0\n        left, right = max(0, dfs(node.left)), max(0, dfs(node.right))\n        best = max(best, node.val + left + right)\n        return node.val + max(left, right)\n    dfs(root)\n    return best",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(h)。每个节点访问一次，递归栈深度为树高 h，最坏 O(n)。",
  "followUps": [
    {
      "question": "为何返回时不能返回左右和？",
      "answer": "父节点若接上「左右和」会形成分叉，不是一条简单路径；返回只能选一条支路，保证向上仍是单臂。"
    },
    {
      "question": "全负树怎么办？",
      "answer": "best 初始化为负无穷，任何节点值都会比它大，最终答案就是值最大的单个节点，不会错误地返回 0。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "返回时把左右两条支路都带上，导致父节点接到分叉路径。",
    "best 初值设为 0，使全负树错误地返回 0 而非最大负值节点。"
  ],
  "beginnerSummary": "二叉树中的「路径」可以从任意节点开始、到任意节点结束，只要是一条不分支的简单路径。难点是：当我们计算某个节点向下能提供的最大贡献时，只能选「左支或右支中的一条」往上走；但「以该节点为最高点」时，却可以把左右两条支路的贡献都加起来更新全局最大值。",
  "prerequisites": [
    "后序遍历（DFS）能先拿到左右子树的贡献，再处理当前节点。",
    "每条支路若为负贡献，用 0 舍弃（因为宁可只取当前节点本身）。",
    "递归函数返回的是「从 node 向下、不分支、到达某个叶子方向的最大单臂贡献」。"
  ],
  "workedExample": [
    "以根为 1、左 -2、右 3 为例（简化）。若某节点 20 的左右孩子贡献分别为 15 和 7，则「经过 20 并汇合左右」的路径和为 15+20+7=42。",
    "全局 best 初始化为负无穷，保证全负树也能选中最大的单个节点。"
  ],
  "lineByLine": [
    "best 用 float(\"-inf\") 初始化，兼容全负树（答案应为单个最大节点）。",
    "空节点返回 0 贡献，让父节点可正常计算。",
    "left/right 用 max(0, dfs(...)) 把负贡献截断为 0。",
    "返回 node.val + max(left, right)，即「带当前节点向下的最大单臂」；同时用 node.val+left+right 更新 best。"
  ]
};
