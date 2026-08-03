export default {
  "id": "bt-zigzag",
  "category": "二叉树",
  "difficulty": "Medium",
  "title": "二叉树的锯齿形层序遍历",
  "prompt": "给定二叉树，返回其锯齿形（之字形）层序遍历：第 0 层从左到右，第 1 层从右到左，交替进行。例如，树 [3,9,20,null,null,15,7] 输出 [[3],[20,9],[15,7]]？",
  "quickAnswer": "BFS 层序遍历，用层级奇偶性决定本层结果是否反转；时间 O(n)，空间 O(n)。",
  "approach": "队列层序，偶数层正序、奇数层反序收集。",
  "explanationFocus": "是什么：锯齿形层序是在普通层序基础上，让相邻层输出方向相反；先正常收集本层节点值，再根据层号奇偶决定是否 reverse。",
  "bruteForce": "先正常层序得到各层列表，再按层号对奇数层做反转。",
  "invariant": "层级 depth 从 0 开始；depth 为偶数时本层正序入结果，为奇数时反序入结果，反转只作用于本层内部顺序。",
  "walkthrough": "树 3(9,20(15,7))。depth0 收集 [3] 正序；depth1 收集 [9,20] 反序→[20,9]；depth2 收集 [15,7] 正序。结果 [[3],[20,9],[15,7]]。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef zigzagLevelOrder(root):\n    if not root:\n        return []\n    result = []\n    queue = [root]\n    depth = 0\n    while queue:\n        level = []\n        size = len(queue)\n        for _ in range(size):\n            node = queue.pop(0)\n            level.append(node.val)\n            if node.left:\n                queue.append(node.left)\n            if node.right:\n                queue.append(node.right)\n        if depth % 2 == 1:\n            level.reverse()\n        result.append(level)\n        depth += 1\n    return result",
  "complexity": "时间 O(n)，空间 O(n)。",
  "beginnerSummary": "像蛇一样在树的各层间左右摆动，一层往右走、下一层往左走。",
  "diagram": "    3\n   / \\\n  9  20\n     / \\\n   15   7\n行0:3  行1:20,9  行2:15,7",
  "derivation": [
    "为什么需要：普通层序只单向，锯齿需交替方向。",
    "怎么实现：记录 depth，按奇偶对 level 反转。",
    "有什么代价：每层一次 reverse O(k)，总 O(n)。",
    "怎么评测：覆盖空树、单节点、满树、偏斜树。"
  ],
  "edgeCases": [
    "空树返回 []。",
    "单节点返回 [[val]]。",
    "奇数层仅一个节点，反转无影响。",
    "偏斜树每层长度 1，方向交替但结果不变。"
  ],
  "pitfalls": [
    "反转了整个 result 而非仅当前层 level。",
    "depth 从 1 而非 0 开始导致奇偶错位、方向反了。"
  ],
  "prerequisites": [
    "层序遍历（BFS）",
    "队列",
    "列表反转"
  ],
  "workedExample": [
    "[3,9,20,null,null,15,7] 输出 [[3],[20,9],[15,7]]。",
    "depth=1 时 level=[9,20]，reverse 成 [20,9]。"
  ],
  "lineByLine": [
    "BFS 初始化队列为 [root]。",
    "size=len(queue) 锁定本层节点数。",
    "收集节点值并把子节点入队。",
    "depth%2==1 时 level.reverse() 实现反向。",
    "result.append(level) 后 depth+=1。"
  ],
  "codeNotes": [
    "仅对当前层 level 反转，不要误反转已完成的 result。"
  ],
  "followUps": [
    {
      "question": "能否不用 reverse 直接按方向插入？",
      "answer": "可以：奇数层用 insert(0,val) 或双端队列从左端加入，避免一次反转开销。"
    },
    {
      "question": "如何改成按之字形输出节点引用而非值？",
      "answer": "同样逻辑，把 level 收集 node 本身而非 node.val 即可。"
    }
  ],
  "followUpAnswers": [
    "可以：奇数层用 insert(0,val) 或双端队列从左端加入，避免一次反转开销。",
    "同样逻辑，把 level 收集 node 本身而非 node.val 即可。"
  ],
  "kind": "code"
};
