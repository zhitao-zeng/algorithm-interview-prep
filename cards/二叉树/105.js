export default {
  "kind": "code",
  "id": "105",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "前序与中序构造二叉树",
  "prompt": "由 preorder 和 inorder 重建树。",
  "diagram": "pre = [3,9,20,15,7]   (根, 左, 右)\nin  = [9,3,15,20,7]   (左, 根, 右)\n\n根=3 → 中序中: 左[9] | 3 | 右[15,20,7]\n         3\n        / \\\n       9   20\n          /  \\\n         15   7\n  pre左=[9]       pre右=[20,15,7]\n  递归左建9, 右建20(15,7为其左右)",
  "quickAnswer": "前序首元素为根；哈希表定位中序根，递归切分左右子树区间。",
  "approach": "前序首元素为根；哈希表定位中序根，递归切分左右子树区间。",
  "explanationFocus": "前序与中序构造二叉树：前序首元素为根；哈希表定位中序根，递归切分左右子树区间。",
  "bruteForce": "《前序与中序构造二叉树》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 前序与中序构造二叉树：前序首元素为根；哈希表定位中序根，递归切分左右子树区间。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《前序与中序构造二叉树》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "每次在线性 inorder 里找根需要 O(n)，整棵树会达 O(n²)。",
    "预先建立 pos 哈希表，根位置 O(1) 获得；用下标 + 长度表示左右子树的区间，递归时不复制数组，复杂度降到 O(n)。",
    "左子树大小 = pos[root] - in_left；右子树的前序起点 = pre_left + 1 + left_size。"
  ],
  "edgeCases": [
    "空输入（前序为空）：返回 None。",
    "树只有左链或只有右链：某一侧递归始终为空。",
    "值保证唯一；若有重复值，单个位置哈希表不足以唯一划分。"
  ],
  "code": "# Python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef build_tree(preorder, inorder):\n    pos = {value: i for i, value in enumerate(inorder)}\n    def build(pre_left, in_left, size):\n        if size == 0: return None\n        root = TreeNode(preorder[pre_left])\n        left_size = pos[root.val] - in_left\n        root.left = build(pre_left + 1, in_left, left_size)\n        root.right = build(pre_left + 1 + left_size, in_left + left_size + 1, size - left_size - 1)\n        return root\n    return build(0, 0, len(preorder))",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(n)。每个节点被构造一次，哈希表 O(n)；递归栈深度为树高 O(h)，最坏（退化链）O(n)。",
  "followUps": [
    {
      "question": "值能重复吗？",
      "answer": "经典题通常保证值唯一；有重复值时单个位置哈希表无法唯一划分树，需要额外信息（如前序中的左右边界）来消歧。"
    },
    {
      "question": "为什么不切片复制数组？",
      "answer": "切片会复制子数组，代码直观但额外耗时和空间；用下标加长度复用原数组，空间更优。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "在线性 inorder 里反复查找根，导致 O(n²)。",
    "左右子树的前序/中序区间算错，把不属于该侧的节点划进去。"
  ],
  "beginnerSummary": "给定二叉树的前序（根→左→右）和中序（左→根→右）遍历数组，要求重建原树。核心规律是：前序的第一个元素永远是「当前子树的根」；在中序里，这个根左边全是它的左子树、右边全是右子树。借助一个哈希表记录每个值在中序的位置，就能 O(1) 找到根并递归切分左右区间。",
  "prerequisites": [
    "前序顺序：根、左子树、右子树；中序顺序：左子树、根、右子树。",
    "中序里根的位置把数组分成「左子树部分」和「右子树部分」，两边长度就是左右子树的大小。",
    "用哈希表 pos 把「值→中序下标」建立映射，避免每次线性查找根。"
  ],
  "workedExample": [
    "pre=[3,9,20,15,7]，inorder=[9,3,15,20,7]。前序首元素 3 是整棵树根；在 inorder 中 3 左边 [9] 是左子树、右边 [15,20,7] 是右子树。",
    "递归：左子树用 pre 的 [9] 与 inorder 的 [9] 构出节点 9；右子树用 pre 的 [20,15,7] 与 inorder 的 [15,20,7] 构出 20 为根、15 和 7 为其左右。"
  ],
  "lineByLine": [
    "TreeNode 明确题目约定的节点类型。",
    "pos = {值: 中序下标} 供 O(1) 查根。",
    "build 的 size==0 是空子树的终止条件。",
    "left_size 划分左右两段，并据此确定右子树的前序起点，递归构造左右。"
  ]
};
