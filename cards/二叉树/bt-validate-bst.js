export default {
  "id": "bt-validate-bst",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "验证二叉搜索树",
  "prompt": "给定一个二叉树，判断它是否是一棵有效的二叉搜索树（BST）：每个节点的左子树全部小于它，右子树全部大于它。例如，树 [2,1,3] 是 BST；树 [5,1,4,null,null,3,6] 不是，因为 4 的右子树 3 小于 5？",
  "quickAnswer": "递归时向下传递允许的取值区间 (low, high)，当前节点须在 (low, high) 内并把 (low,val) 与 (val,high) 传给左右子树；时间 O(n)，空间 O(h)。",
  "approach": "DFS 携带上下界，用 None 表示无界；若节点越界立即失败。",
  "explanationFocus": "是什么：BST 要求“不仅左孩子<根、右孩子>根，而且整棵左子树的所有值都<根、整棵右子树的所有值都>根”；因此递归必须携带整个允许的区间而不是只看父节点。",
  "bruteForce": "中序遍历收集所有值，再检查是否严格递增。",
  "invariant": "进入以 node 为根的子树时，node.val 必须落在 (low, high) 开区间内；向下传递时左子区间 (low, node.val)、右子区间 (node.val, high)。",
  "walkthrough": "树 5(1,4(3,6))。根 5 区间 (-inf,inf) 通过，左 1 区间 (-inf,5) 通过，右 4 区间 (5,inf) 失败：4<5 越界，直接返回 False。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef isValidBST(root):\n    def dfs(node, low, high):\n        if node is None:\n            return True\n        if (low is not None and node.val <= low) or (high is not None and node.val >= high):\n            return False\n        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)\n    return dfs(root, None, None)",
  "complexity": "时间 O(n)，空间 O(h)。",
  "beginnerSummary": "像设定一个“合理身高范围”，每下一层范围都会收窄，谁超出自己那一层的范围就说明这棵树不合格。",
  "diagram": "      5\n     / \\\n    1   4\n       / \\\n      3   6\n右子树 4 < 5 -> 越界, 非BST",
  "derivation": [
    "为什么需要：仅比较父子会漏掉“右子树的左孩子比根小”这类违例，必须整区间约束。",
    "怎么实现：递归传 low/high，初始为 None；命中越界即返回 False。",
    "有什么代价：空间 O(h) 递归栈，换来精确判断。",
    "怎么评测：用例含合法 BST、右子树含小值、相等值（不允许）、单节点。"
  ],
  "edgeCases": [
    "空树视为合法 BST。",
    "含相等值（如左子树出现等于根的值）不合法。",
    "INT_MIN/INT_MAX 边界节点，需用 None 表示无界。",
    "只有左链或只有右链但有序。"
  ],
  "pitfalls": [
    "只比较 node.left.val<node.val 而忽略整棵左子树范围。",
    "用 int 上/下界常量导致极值节点误判，应用 None 表示无界。"
  ],
  "prerequisites": [
    "二叉搜索树定义",
    "中序遍历与严格递增",
    "递归与区间传递"
  ],
  "workedExample": [
    "[2,1,3]：根 2 区间 (-∞,∞)，左 1∈(-∞,2)、右 3∈(2,∞) → True。",
    "[5,1,4,null,null,3,6]：右 4 区间应为 (5,∞)，但 4<5 → False。"
  ],
  "lineByLine": [
    "dfs 空节点返回 True（基线）。",
    "若 low 非空且 node.val<=low 或 high 非空且 node.val>=high，越界返回 False。",
    "dfs(left, low, node.val) 左子树上限收紧为 node.val。",
    "dfs(right, node.val, high) 右子树下限抬高到 node.val。",
    "两侧都通过才返回 True。"
  ],
  "codeNotes": [
    "用 None 表示无界比用 ±inf 更安全，避免极值节点边界 bug。"
  ],
  "followUps": [
    {
      "question": "如何用中序遍历迭代法判断？",
      "answer": "用栈中序遍历，记录前一个访问值 prev，若当前 val<=prev 即非法。"
    },
    {
      "question": "允许相等值时如何改？",
      "answer": "改为 node.val<low / node.val>high 并使用闭区间或把比较符号调成 < 与 >。"
    }
  ],
  "followUpAnswers": [
    "用栈中序遍历，记录前一个访问值 prev，若当前 val<=prev 即非法。",
    "改为 node.val<low / node.val>high 并使用闭区间或把比较符号调成 < 与 >。"
  ],
  "kind": "code"
};
