export default {
  "id": "bt-kth-bst",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "二叉搜索树中第 K 小的元素",
  "prompt": "给定一棵二叉搜索树（BST）的根节点和正整数 k，返回其中第 k 小的元素（1-based）。例如，BST [3,1,4,null,2] 中，第 1 小是 1，第 2 小是 2，第 3 小是 3？",
  "quickAnswer": "BST 中序遍历天然升序，计数到第 k 个即停止；时间 O(k+h)（平均 O(h)），空间 O(h)。",
  "approach": "中序遍历（左-根-右），用计数器，命中第 k 个立即返回。",
  "explanationFocus": "是什么：BST 的中序遍历产生严格递增序列，因此第 k 小就是中序序列的第 k 个元素；用计数提前终止可省去遍历整棵树。",
  "bruteForce": "中序遍历收集全部值到列表，再取下标 k-1。",
  "invariant": "中序遍历已访问节点数 count；当 count==k 时当前节点值即答案，可立即结束搜索。",
  "walkthrough": "BST 3(1(null,2),4)。中序：访问 1→count1，访问 2→count2（k=2 命中返回 2），不必再访问 3、4。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef kthSmallest(root, k):\n    count = 0\n    answer = None\n    def inorder(node):\n        nonlocal count, answer\n        if not node or answer is not None:\n            return\n        inorder(node.left)\n        count += 1\n        if count == k:\n            answer = node.val\n            return\n        inorder(node.right)\n    inorder(root)\n    return answer",
  "complexity": "时间 O(k+h)（最坏 O(n)），空间 O(h) 递归栈。",
  "beginnerSummary": "像按从小到大排队点名，点到第 k 个人就报出他的名字，不必把后面的人都叫完。",
  "diagram": "    3\n   / \\\n  1   4\n   \\\n    2\n中序: 1,2,3,4  -> 第2小=2",
  "derivation": [
    "为什么需要：BST 无序数组但中序有序，利用该性质可免排序。",
    "怎么实现：递归中序，count 计数到 k 即记录并返回。",
    "有什么代价：平均 O(h)，最坏需遍历整树 O(n)。",
    "怎么评测：k=1（最小）、k=size（最大）、中间值用例。"
  ],
  "edgeCases": [
    "k=1 返回最左节点。",
    "k=n 返回最右节点。",
    "树只有一个节点。",
    "k 保证合法（1≤k≤节点数）。"
  ],
  "pitfalls": [
    "用先序/层序误当有序序列取第 k 个。",
    "未用 nonlocal 导致 count/answer 无法在闭包内更新。"
  ],
  "prerequisites": [
    "BST 中序遍历有序性",
    "递归与闭包变量",
    "计数器终止"
  ],
  "workedExample": [
    "[3,1,4,null,2], k=1：中序首个为 1 → 返回 1。",
    "k=3：中序 1,2,3 → 返回 3。"
  ],
  "lineByLine": [
    "count 记录已访问个数，answer 存结果。",
    "先递归左子树（最小侧）。",
    "count+=1 处理当前（中序根）。",
    "count==k 时记下 node.val 并提前返回。",
    "再递归右子树。"
  ],
  "codeNotes": [
    "用 nonlocal 让内部函数修改外层 count/answer；命中后可借 answer is not None 剪枝。"
  ],
  "followUps": [
    {
      "question": "如何频繁多次查询第 k 小？",
      "answer": "给每个节点维护子树大小，沿路径用左子树大小决定走左还是右，O(h) 单次查询。"
    },
    {
      "question": "第 k 大怎么做？",
      "answer": "改为逆中序（右-根-左）计数，或直接用 size-k+1 作为第 k 小。"
    }
  ],
  "followUpAnswers": [
    "给每个节点维护子树大小，沿路径用左子树大小决定走左还是右，O(h) 单次查询。",
    "改为逆中序（右-根-左）计数，或直接用 size-k+1 作为第 k 小。"
  ],
  "kind": "code"
};
