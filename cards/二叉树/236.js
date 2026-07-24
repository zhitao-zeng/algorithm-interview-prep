export default {
  "kind": "code",
  "id": "236",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "最近公共祖先",
  "prompt": "普通二叉树中求 p、q 的最近公共祖先。",
  "diagram": "       3\n      / \\\n     5   1\n    / \\    \\\n   6   2    8\n          / \\\n         7   4\n求 5 与 1 的 LCA:\n  左子树递归找到 5, 右子树递归找到 1\n  → 两侧结果都非 None, 当前根 3 即 LCA",
  "quickAnswer": "后序汇报左右是否找到目标。",
  "approach": "后序汇报左右是否找到目标。",
  "explanationFocus": "最近公共祖先：后序汇报左右是否找到目标。",
  "bruteForce": "《最近公共祖先》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 最近公共祖先：后序汇报左右是否找到目标。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《最近公共祖先》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "可以分别保存 root 到 p、q 的两条路径再找最后一个公共节点，但需要额外空间且要回溯。",
    "一次后序递归即可：左右各汇报是否找到目标；当某一节点左右都非空（或自身就是目标且另一侧找到），它就是 LCA。",
    "若只有一侧非空，说明 p、q 都在那一侧（或其中一个就是祖先），直接把非空结果向上传递。"
  ],
  "edgeCases": [
    "p 是 q 的祖先：递归先命中 p 并返回，p 成为答案。",
    "p、q 在同一侧子树：结果在那一侧内部确定。",
    "经典题保证 p、q 都存在；若不保证需额外记录是否两目标都找到。"
  ],
  "code": "# Python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef lowest_common_ancestor(root, p, q):\n    if not root or root is p or root is q: return root\n    left = lowest_common_ancestor(root.left, p, q)\n    right = lowest_common_ancestor(root.right, p, q)\n    if left and right: return root\n    return left or right",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(h)。每个节点最多访问一次，递归栈深度为树高 h。",
  "followUps": [
    {
      "question": "如果 p 正好是 q 的祖先呢？",
      "answer": "递归会在 p 处命中（root is p）并直接返回 p，于是 p 成为最终答案，符合「最近公共祖先」的定义。"
    },
    {
      "question": "题目不保证 p、q 都存在怎么办？",
      "answer": "经典题保证存在；若不保证，需要额外记录两个目标是否都被找到，否则可能返回一个错误的单侧结果。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "用 == 比较值而非 is 比较节点，把值相同的不同节点误判。",
    "只判断 left and right 却忘记向上传递单侧结果，导致漏掉祖先情形。"
  ],
  "beginnerSummary": "最近公共祖先（LCA）是「同时包含 p 和 q 的最低的那个节点」。在普通二叉树（无父指针）里，通过后序遍历：递归地在左右子树中查找 p、q；当「左子树找到一个、右子树找到另一个」时，当前节点就是答案；若某一侧同时包含了 p 和 q（比如 p 是 q 的祖先），则那一侧返回的就是 LCA。",
  "prerequisites": [
    "用 is 比较节点身份，而不是值；因为题目给的是节点对象 p、q。",
    "后序遍历先递归查左右子树，再在「当前节点」汇总两侧结果。",
    "递归返回的是「在当前子树里找到的 p 或 q（或其 LCA）」。"
  ],
  "workedExample": [
    "以根 3、左子树含 5、右子树含 1（1 的左右为 0、8）为例，求 5 和 1 的 LCA。左子树递归找到 5，右子树递归找到 1。",
    "根 3 收到「左右都非空」的结果，说明 p、q 分居两侧，于是 3 就是最近公共祖先，返回 3。"
  ],
  "lineByLine": [
    "if not root or root is p or root is q: return root —— 空或命中目标直接返回。",
    "递归查左右子树，得到 left、right 两个结果。",
    "if left and right: return root —— 两侧各有一个目标，当前节点即 LCA。",
    "return left or right —— 只一侧有结果时继续向上传递。"
  ]
};
