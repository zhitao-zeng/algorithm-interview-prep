export default {
  "kind": "code",
  "id": "103",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "二叉树锯齿层序遍历",
  "prompt": "按层交替从左到右和从右到左输出。",
  "diagram": "       3\n     /   \\\n    9     20\n         /  \\\n        15   7\n\n层0: [3]      (左→右)\n层1: [20,9]   (右→左, 整层反转)\n层2: [15,7]   (左→右)\n输出: [[3],[20,9],[15,7]]\n\nleft_to_right 标志每层翻转, 孩子入队顺序不变",
  "quickAnswer": "普通 BFS，奇数层把当前层结果反转。",
  "approach": "普通 BFS，奇数层把当前层结果反转。",
  "explanationFocus": "二叉树锯齿层序遍历：普通 BFS，奇数层把当前层结果反转。",
  "bruteForce": "《二叉树锯齿层序遍历》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 二叉树锯齿层序遍历：普通 BFS，奇数层把当前层结果反转。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《二叉树锯齿层序遍历》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "可以用双端队列按不同方向插值（奇数层尾插、偶数层头插），但逻辑分散。",
    "更简洁：先做普通层序收集 level，输出时依方向选择原数组或倒序数组；孩子入队规则始终简单一致，不易出错。",
    "每层结束时翻转布尔值，保证下一层改变方向。"
  ],
  "edgeCases": [
    "空树返回 []。",
    "只有一层：不受反转影响，输出 [[root.val]]。",
    "某层只有一个节点：反转后不变。"
  ],
  "code": "# Python\nfrom collections import deque\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef zigzag_level_order(root):\n    if not root: return []\n    q, answer, left_to_right = deque([root]), [], True\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft(); level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        answer.append(level if left_to_right else level[::-1])\n        left_to_right = not left_to_right\n    return answer",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(w)。与层序相同，只是每层多一个 O(层宽) 的倒序（可忽略），主要额外空间仍是 BFS 队列宽度。",
  "followUps": [
    {
      "question": "反转会改变下一层的顺序吗？",
      "answer": "不会。反转的是已收集的 level 副本；孩子始终按 left、right 入队，下一层顺序不受影响。"
    },
    {
      "question": "空间会更多吗？",
      "answer": "除了每层结果外只多一个布尔变量，主要空间仍是 BFS 队列的宽度 O(w)。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "在入队孩子前就反转，导致孩子顺序也跟着乱。",
    "忘记翻转方向布尔值，所有层都同向输出。"
  ],
  "beginnerSummary": "锯齿层序（之字形）仍然按层 BFS，但每隔一层把收集到的节点值顺序反过来：第一层从左到右，第二层从右到左，第三层再从左到右，依次交替。实现上最省事的做法是「正常 BFS + 在输出时按层反转」，孩子的入队顺序始终一致，避免维护两个方向的复杂逻辑。",
  "prerequisites": [
    "left_to_right 记录当前层应按什么方向输出（True 为从左到右）。",
    "level[::-1] 会生成该列表的倒序副本，用于反向层。",
    "BFS 的孩子始终按 left、right 顺序入队，保证节点访问顺序稳定。"
  ],
  "workedExample": [
    "根 3 出队，本层 [3]，方向为左→右，输出 [3]，随后切换方向。",
    "第二层按队列取到 [9,20]，因为方向已反向，输出 [20,9]；第三层 [15,7] 方向又切回，输出 [15,7]。结果 [[3],[20,9],[15,7]]。"
  ],
  "lineByLine": [
    "空树直接返回 []。",
    "队列始终按正常左→右扩展孩子，与输出方向解耦。",
    "每层结束时依 left_to_right 选择 level 或 level[::-1] 加入答案。",
    "布尔值 not 翻转，保证相邻层方向相反。"
  ]
};
