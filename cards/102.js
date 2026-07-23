export default {
  "kind": "code",
  "id": "102",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "二叉树层序遍历",
  "prompt": "按层返回二叉树节点值。",
  "diagram": "       3\n     /   \\\n    9     20\n         /  \\\n        15   7\n\n队列演化(每层先固定 len(q)):\n  q=[3]        → 出3, 入9,20   → 层 [3]\n  q=[9,20]     → 出9,20, 入15,7 → 层 [9,20]\n  q=[15,7]     → 出15,7         → 层 [15,7]\n输出: [[3],[9,20],[15,7]]",
  "quickAnswer": "BFS 每轮先固定队列长度，恰好弹出这一层。",
  "approach": "BFS 每轮先固定队列长度，恰好弹出这一层。",
  "explanationFocus": "二叉树层序遍历：BFS 每轮先固定队列长度，恰好弹出这一层。",
  "bruteForce": "《二叉树层序遍历》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 二叉树层序遍历：BFS 每轮先固定队列长度，恰好弹出这一层。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《二叉树层序遍历》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "递归按深度收集（DFS）也能分层，但要额外维护深度或在每层新建列表。",
    "BFS 的队列天然按层排列：只要「在出队前先记录当前层大小」，就能精确地把这一层的节点归为一组，下一层另起一组。",
    "每出队一个节点就把它的孩子入队，保证下一轮处理的正是这一层的下一层。"
  ],
  "edgeCases": [
    "空树：直接返回空列表。",
    "只有根节点：输出 [[root.val]]。",
    "树退化为链表（只有左或只有右）：每层只有一个节点，结果为 [[v0],[v1],...]。"
  ],
  "code": "# Python\nfrom collections import deque\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef level_order(root):\n    if not root: return []\n    q, answer = deque([root]), []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft(); level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        answer.append(level)\n    return answer",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(w)。每个节点入队出队各一次（n 为节点数），队列最多同时保存最宽一层的节点 w，因此额外空间 O(w)。",
  "followUps": [
    {
      "question": "为什么不能直接遍历当前 q？",
      "answer": "遍历过程中会不断加入孩子，边遍历边增长会把下一层的节点误算到当前层；先取长度 len(q) 能固定本层边界。"
    },
    {
      "question": "w 是什么？",
      "answer": "w 是树最宽一层的节点数；队列最多同时保存这一层及其刚入队的部分孩子，故空间为 O(w)。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "在入队孩子之后再取 len(q)，导致层边界错位、把下一层混入当前层。",
    "忘记处理空树，对 None 的 left/right 取值报错。"
  ],
  "beginnerSummary": "层序遍历（BFS）按「从上到下、从左到右」逐层访问树的节点，输出每一层的节点值列表。它依赖一个队列：每次把当前层的所有节点出队并记录它们的值，同时把它们的左右孩子入队，供下一层使用。与先序/中序/后序（DFS）不同，层序天然按层分组。",
  "prerequisites": [
    "TreeNode 由 val、left、right 组成，left/right 为 None 表示没有对应子树。",
    "deque（双端队列）支持 O(1) 的 popleft，比用 list.pop(0) 的 O(n) 高效。",
    "关键技巧：在每层开始时先固定当前队列长度 len(q)，这样本层出队时不会把下一层刚入队的孩子也算进来。"
  ],
  "workedExample": [
    "以根 3、左 9、右 20（20 的左右为 15、7）为例。初始队列只有 [3]，第一轮：固定长度 1，弹出 3，记录 [3]，并把 9、20 入队。",
    "第二轮：固定长度 2，依次弹出 9、20，记录 [9,20]，并把 15、7 入队；第三轮弹出 15、7 得到 [15,7]。最终 [[3],[9,20],[15,7]]。"
  ],
  "lineByLine": [
    "空树 if not root: return []，避免对 None 取孩子。",
    "队列从根节点开始，answer 收集结果。",
    "for _ in range(len(q)): 在入队孩子「之前」固定本层长度，避免把下一层混入。",
    "本层所有节点收集完再 append 到 answer，然后循环处理下一层。"
  ]
};
