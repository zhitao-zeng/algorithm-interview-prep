export default {
  "id": "bt-level-order",
  "category": "二叉树",
  "difficulty": "Easy",
  "title": "二叉树的层序遍历",
  "prompt": "给定一个二叉树，返回其按层序遍历（从根节点开始，逐层从左到右）得到的节点值列表。例如，输入二叉树 [3,9,20,null,null,15,7]，输出 [[3],[9,20],[15,7]]？",
  "quickAnswer": "使用队列进行广度优先搜索（BFS），每次处理完当前层所有节点后将下一层节点入队；时间复杂度 O(n)，空间复杂度 O(n)。",
  "approach": "BFS + 队列：每次取出当前层 size 个节点，记录值并把子节点入队。",
  "explanationFocus": "是什么：层序遍历是按“层”从上到下、每层从左到右访问节点，本质是广度优先遍历（BFS），借助队列先进先出保证同层节点按顺序出队。",
  "bruteForce": "用递归先序遍历收集 (节点, 深度) 二元组，再按深度分组排序。",
  "invariant": "队列中始终保存“当前待访问层”的所有节点，且处理完一层后队列恰好变为下一层。",
  "walkthrough": "树：3 -> 9,20。队列初始 [3]；第1层取出 3，压入 9、20，得到 [3]；第2层取出 9、20，压入 15、7，得到 [9,20]；第3层取出 15、7，得到 [15,7]。结果 [[3],[9,20],[15,7]]。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef levelOrder(root):\n    if not root:\n        return []\n    result = []\n    queue = [root]\n    while queue:\n        level = []\n        size = len(queue)\n        for _ in range(size):\n            node = queue.pop(0)\n            level.append(node.val)\n            if node.left:\n                queue.append(node.left)\n            if node.right:\n                queue.append(node.right)\n        result.append(level)\n    return result",
  "complexity": "时间 O(n)，每个节点访问一次；空间 O(n)，队列最多存一层节点。",
  "beginnerSummary": "像水波一样从石头落点（根）一圈圈向外扩散，先处理完同一圈的节点再处理下一圈。",
  "diagram": "    3\n   / \\\n  9  20\n     / \\\n   15   7\n层1:[3] 层2:[9,20] 层3:[15,7]",
  "derivation": [
    "为什么需要：按层输出是打印树、求树宽、求最短路径等的基础，普通递归只能先序/中序/后序。",
    "怎么实现：用队列保存待访问节点，每轮先记下本层节点数 size，再循环 size 次出队并把子节点入队。",
    "有什么代价：需要额外的队列空间 O(n)，但换来了“逐层”的访问顺序。",
    "怎么评测：用例覆盖空树、单节点、满二叉树、偏斜树，核对各层数组顺序与数量。"
  ],
  "edgeCases": [
    "root 为空，返回空列表 []。",
    "只有根节点，返回 [[root.val]]。",
    "完全偏斜的链表状树，每层只有一个节点。",
    "节点值存在重复时仍需按位置分层。"
  ],
  "pitfalls": [
    "用 pop(0) 在 list 上是 O(n)，海量数据应改用 collections.deque。",
    "忘记先记录 size 就边遍历边入队，会把下一层也算进当前层。"
  ],
  "prerequisites": [
    "队列（FIFO）先进先出特性",
    "二叉树与广度优先搜索基本概念",
    "递归与迭代的区别"
  ],
  "workedExample": [
    "输入 [3,9,20,null,null,15,7]，队列依次处理得到三层 [[3],[9,20],[15,7]]。",
    "第2层处理时 size=2，连续取出 9 和 20 再加入 15、7。"
  ],
  "lineByLine": [
    "if not root: 处理空树边界。",
    "queue=[root] 初始化队列，BFS 起点为根。",
    "size=len(queue) 锁定当前层节点数，避免混入下一层。",
    "node=queue.pop(0) 取出队首节点并收集其值。",
    "若子节点存在则 append 入队，供下一层使用。",
    "result.append(level) 本层全部收集完后再整体入结果。"
  ],
  "codeNotes": [
    "队列用 list + pop(0) 仅为示意，生产环境用 deque 更高效。"
  ],
  "followUps": [
    {
      "question": "如何只返回最后一层的节点值？",
      "answer": "在 while 循环结束后返回 result[-1]，或每层覆盖一个变量最后返回该变量。"
    },
    {
      "question": "如何自底向上层序输出？",
      "answer": "用 collections.deque 并在每层 result.appendleft(level)，或在最后 result[::-1] 反转。"
    }
  ],
  "followUpAnswers": [
    "在 while 循环结束后返回 result[-1]，或每层覆盖一个变量最后返回该变量。",
    "用 collections.deque 并在每层 result.appendleft(level)，或在最后 result[::-1] 反转。"
  ],
  "kind": "code"
};
