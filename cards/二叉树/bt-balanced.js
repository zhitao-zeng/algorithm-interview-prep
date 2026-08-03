export default {
  "id": "bt-balanced",
  "category": "二叉树",
  "difficulty": "Easy",
  "title": "平衡二叉树",
  "prompt": "给定二叉树，判断它是否是平衡二叉树——即每个节点的左右子树高度差不超过 1。例如，树 [3,9,20,null,null,15,7] 是平衡的；树 [1,2,2,3,3,null,null,4,4] 不是？",
  "quickAnswer": "后序递归返回子树高度，若某节点左右高度差>1 则标记不平衡；用 -1 表示失衡可提前返回；时间 O(n)，空间 O(h)。",
  "approach": "自底向上算高度，遇高度差超 1 立即返回 -1 表示无效。",
  "explanationFocus": "是什么：平衡二叉树要求每个节点的左右子树高度差绝对值 ≤1；后序遍历同时计算高度并就地检查平衡性，一旦发现失衡即可整体判负。",
  "bruteForce": "对每个节点分别调用求高度函数，逐个比较左右高度差。",
  "invariant": "辅助函数对平衡子树返回其真实高度；一旦某节点左右高度差>1，向上返回 -1，最终根返回 -1 即整体不平衡。",
  "walkthrough": "树 1(2(3(4,4),3),2)。左子树高度 3，右子树高度 1，差 2>1 → 返回 -1 整体失衡。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef isBalanced(root):\n    def height(node):\n        if node is None:\n            return 0\n        left = height(node.left)\n        if left == -1:\n            return -1\n        right = height(node.right)\n        if right == -1:\n            return -1\n        if abs(left - right) > 1:\n            return -1\n        return max(left, right) + 1\n    return height(root) != -1",
  "complexity": "时间 O(n)（每个节点访问一次），空间 O(h)。",
  "beginnerSummary": "像检查一棵树长得是否“对称匀称”，任何一根枝杈比另一根长太多就歪了不算平衡。",
  "diagram": "      1\n     / \\\n    2   2\n   / \\\n  3   3\n /\n4\n左高3 右高1 -> 失衡",
  "derivation": [
    "为什么需要：分别求高度会重复遍历，O(n^2) 太慢。",
    "怎么实现：后序返回高度，差>1 返回 -1 提前终止。",
    "有什么代价：一次遍历 O(n)，用 -1 编码状态。",
    "怎么评测：满平衡树、单侧深枝、渐进失衡等用例。"
  ],
  "edgeCases": [
    "空树是平衡的。",
    "单节点平衡。",
    "左右高度差恰好为 1 仍平衡。",
    "深层左链、浅右链导致失衡。"
  ],
  "pitfalls": [
    "用重复求高度函数导致 O(n^2)。",
    "把高度差判定写成 >=1 而非 >1，把差为 1 误判失衡。"
  ],
  "prerequisites": [
    "树的高度定义",
    "后序遍历",
    "递归返回值编码"
  ],
  "workedExample": [
    "[3,9,20,null,null,15,7]：各节点左右高度差均 ≤1 → True。",
    "[1,2,2,3,3,null,null,4,4]：左子树高度 3、右子树高度 1，差 2 → False。"
  ],
  "lineByLine": [
    "height 空节点返回 0。",
    "先递归左，若左返回 -1 立即上抛。",
    "再递归右，同样提前返回 -1。",
    "abs(left-right)>1 则标记失衡返回 -1。",
    "否则返回 max(left,right)+1 真实高度。",
    "isBalanced 看最终高度是否非 -1。"
  ],
  "codeNotes": [
    "用 -1 作为“失衡”哨兵，避免额外布尔字段，且能提前剪枝。"
  ],
  "followUps": [
    {
      "question": "如何在返回是否平衡的同时给出高度？",
      "answer": "让辅助函数返回 (balanced, height) 元组，失衡时 balanced=False 直接上抛。"
    },
    {
      "question": "如何自顶向下优化可读性？",
      "answer": "可读但较慢：对每个节点调用 height 比较；如需效率仍推荐后序 -1 编码。"
    }
  ],
  "followUpAnswers": [
    "让辅助函数返回 (balanced, height) 元组，失衡时 balanced=False 直接上抛。",
    "可读但较慢：对每个节点调用 height 比较；如需效率仍推荐后序 -1 编码。"
  ],
  "kind": "code"
};
