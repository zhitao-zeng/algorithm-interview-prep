export default {
  "id": "bt-lca",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "二叉树的最近公共祖先",
  "prompt": "给定一个二叉树和两个节点 p、q，返回它们的最近公共祖先（LCA）——即同时是 p、q 祖先且深度最大的节点。例如，树 [3,5,1,6,2,0,8]，p=5,q=1，LCA 为 3；p=5,q=4，LCA 为 5？",
  "quickAnswer": "后序递归：若当前节点为空或命中 p/q 则返回当前节点；左右子树返回值都非空说明当前节点即 LCA，否则返回非空的那一侧；时间 O(n)，空间 O(h)。",
  "approach": "递归后序遍历，若某节点的左右子树分别包含 p、q，则它必为 LCA。",
  "explanationFocus": "是什么：最近公共祖先是“离 p、q 最近且同时是二者祖先”的节点；利用后序遍历自底向上返回“本子树是否找到目标”，一旦左右两边各找到一个目标，根节点即为最近公共祖先。",
  "bruteForce": "对每个节点都向上爬到根标记祖先集合，再求两个集合的交集取最深者。",
  "invariant": "递归函数返回“以 node 为根的子树中所含的目标节点（p 或 q）”，若左右均非空则 node 为 LCA。",
  "walkthrough": "树 3(5,1)，5(6,2)，2(7,4)。求 p=5,q=4：递归到 5 子树，左 6 返回 None，右 2 左右返回 7、4，2 返回 2，5 左 None 右 2 返回 5；3 左得 5，右找 1 子树得 None，3 返回 5，即 LCA=5。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef lowestCommonAncestor(root, p, q):\n    def dfs(node):\n        if node is None or node is p or node is q:\n            return node\n        left = dfs(node.left)\n        right = dfs(node.right)\n        if left and right:\n            return node\n        return left or right\n    return dfs(root)",
  "complexity": "时间 O(n)，最坏遍历全树；空间 O(h)，递归栈高度。",
  "beginnerSummary": "像一个家族往上查“共同的祖宗”，两人各自往上走，第一次碰面的那个就是最近的共祖。",
  "diagram": "      3\n     / \\\n    5   1\n   / \\ / \\\n  6  2 0  8\n     / \\\n    7   4\np=5, q=4 -> LCA=5",
  "derivation": [
    "为什么需要：LCA 是树上的高频问题，也是很多树题的基石。",
    "怎么实现：后序递归，左右子树各返回找到的目标，左右都非空说明当前节点是分叉点。",
    "有什么代价：一次遍历 O(n)，递归栈 O(h)。",
    "怎么评测：p/q 在不同子树、p 是 q 祖先、p==q、空树等用例。"
  ],
  "edgeCases": [
    "p 或 q 等于 root，root 即为 LCA。",
    "p 是 q 的祖先，LCA 为 p。",
    "树只有一个节点且 p==q==root。",
    "p、q 不在同一子树，LCA 为分叉点。"
  ],
  "pitfalls": [
    "用值相等判断而非 is 身份判断，会误命中值相同但不同的节点。",
    "递归未在找到左右均非空时把 node 作为结果，导致返回值被覆盖。"
  ],
  "prerequisites": [
    "二叉树后序遍历",
    "递归返回值传递",
    "祖先与子树的关系"
  ],
  "workedExample": [
    "p=5,q=1：左子树 5 含 5、右子树 1 含 1，3 左右均非空 → LCA=3。",
    "p=5,q=4：递归在 5 子树内已同时找到两侧 → LCA=5。"
  ],
  "lineByLine": [
    "dfs 中若 node is p/q 或空则直接返回（命中或空）。",
    "left=dfs(left) 左子树返回找到的目标。",
    "right=dfs(right) 右子树返回找到的目标。",
    "若 left 和 right 都非空，node 即分叉点 LCA。",
    "否则返回 left or right 把找到的一侧向上传递。"
  ],
  "codeNotes": [
    "用 node is p 身份比较，避免值相等的歧义。"
  ],
  "followUps": [
    {
      "question": "若节点有指向父节点的指针，怎么做？",
      "answer": "分别从 p、q 沿 parent 向上走，用集合或双指针求第一个公共节点。"
    },
    {
      "question": "如何扩展到多叉树/多个节点的 LCA？",
      "answer": "多叉树同样后序返回；多个节点则统计子树命中个数，命中数等于总数时该节点为 LCA。"
    }
  ],
  "followUpAnswers": [
    "分别从 p、q 沿 parent 向上走，用集合或双指针求第一个公共节点。",
    "多叉树同样后序返回；多个节点则统计子树命中个数，命中数等于总数时该节点为 LCA。"
  ],
  "kind": "code"
};
