export default {
  "id": "bt-serialize",
  "category": "二叉树",
  "difficulty": "Hard",
  "title": "二叉树的序列化与反序列化",
  "prompt": "设计一个算法，将二叉树序列化为字符串（以便存储/传输），并能从字符串反序列化为原树。例如，树 [1,2,3,null,null,4,5] 可序列化为 \"1,2,3,null,null,4,5\"？",
  "quickAnswer": "层序（BFS）用特殊标记（如 \"null\"）表示空节点，反序列化时按同一顺序用队列重建；时间 O(n)，空间 O(n)。",
  "approach": "序列化用 BFS 层序输出含空位；反序列化用队列按索引把左右孩子接到父节点。",
  "explanationFocus": "是什么：序列化是把树转成可存储的字符串、反序列化是还原；采用层序 + 占位符可完整保留空节点位置，从而无歧义地重建结构。",
  "bruteForce": "用先序遍历并在每个空子树输出占位符，反序列化时按先序递归读取。",
  "invariant": "序列化串中节点的出现顺序与反序列化时读取顺序一致；遇到占位符创建空指针，否则建节点并接好左右。",
  "walkthrough": "树 1(2,3(4,5))。序列化 BFS：1,2,3,null,null,4,5,null,null,null,null。反序列化：建 1，队列[1]；取 1 接左 2、右 3；取 2 左右 null；取 3 接左 4 右 5。",
  "code": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef serialize(root):\n    if not root:\n        return ''\n    vals = []\n    queue = [root]\n    while queue:\n        node = queue.pop(0)\n        if node:\n            vals.append(str(node.val))\n            queue.append(node.left)\n            queue.append(node.right)\n        else:\n            vals.append('null')\n    while vals and vals[-1] == 'null':\n        vals.pop()\n    return ','.join(vals)\n\ndef deserialize(data):\n    if not data:\n        return None\n    tokens = data.split(',')\n    root = TreeNode(int(tokens[0]))\n    queue = [root]\n    i = 1\n    while queue and i < len(tokens):\n        node = queue.pop(0)\n        if tokens[i] != 'null':\n            node.left = TreeNode(int(tokens[i]))\n            queue.append(node.left)\n        i += 1\n        if i < len(tokens) and tokens[i] != 'null':\n            node.right = TreeNode(int(tokens[i]))\n            queue.append(node.right)\n        i += 1\n    return root",
  "complexity": "时间 O(n)（每个节点处理一次），空间 O(n)（队列与字符串）。",
  "beginnerSummary": "像把一棵家谱按层拍照编号，照片里空位也标出来，后人按编号就能原样把人摆回去。",
  "diagram": "    1\n   / \\\n  2   3\n     / \\\n    4   5\nBFS: 1,2,3,null,null,4,5",
  "derivation": [
    "为什么需要：只记录非空值会丢失结构（左右谁空），必须保留空位。",
    "怎么实现：BFS 输出含 null 占位符，反序列化用队列按父索引接孩子。",
    "有什么代价：字符串较长、含占位符，但唯一且可逆。",
    "怎么评测：Round-trip 测试，序列化后再反序列化与原始树等同（先序比对）。"
  ],
  "edgeCases": [
    "空树序列化为 空串。",
    "只有右链时大量左 null 占位。",
    "节点值为负数、多位数。",
    "末尾连续 null 可裁剪但不影响重建。"
  ],
  "pitfalls": [
    "层序序列化不保留空占位符，反序列化无法判断左右位置。",
    "反序列化索引 i 推进错误导致左右孩子错位。"
  ],
  "prerequisites": [
    "二叉树层序遍历（BFS）",
    "队列操作",
    "字符串 split/join"
  ],
  "workedExample": [
    "序列化 [1,2,3,null,null,4,5] → \"1,2,3,null,null,4,5\"。",
    "反序列化时 queue 依次把 2、3 接为 1 的左右，再把 4、5 接为 3 的左右。"
  ],
  "lineByLine": [
    "serialize 用 BFS 把节点值或 \"null\" 依次加入 vals。",
    "末尾多余 null 裁剪以缩短字符串。",
    "deserialize 先建根并入队。",
    "每取出一个父节点，按 i、i+1 读左右孩子并接入。",
    "非空 token 才建节点并入队，空则留 None。"
  ],
  "codeNotes": [
    "用 list 当队列、pop(0) 仅为示意，生产用 collections.deque。"
  ],
  "followUps": [
    {
      "question": "用先序递归如何实现？",
      "answer": "序列化时先序输出 根,左,右 且空也输出占位符；反序列化按相同顺序递归读取并构造。"
    },
    {
      "question": "如何压缩体积？",
      "answer": "用先序+仅记录非空路径的编码（如括号表示法），或采用位压缩/稀疏表示。"
    }
  ],
  "followUpAnswers": [
    "序列化时先序输出 根,左,右 且空也输出占位符；反序列化按相同顺序递归读取并构造。",
    "用先序+仅记录非空路径的编码（如括号表示法），或采用位压缩/稀疏表示。"
  ],
  "kind": "code"
};
