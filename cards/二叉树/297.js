export default {
  "kind": "code",
  "id": "297",
  "category": "二叉树",
  "difficulty": "Hard",
  "title": "二叉树序列化与反序列化",
  "prompt": "把任意二叉树编码并可无歧义恢复。",
  "diagram": "       1\n      / \\\n     2   3\n        / \\\n       4   5\n\n前序(遇空写#): 1,2,#,#,3,4,#,#,5,#,#\n反序列化: 迭代器逐个取token建节点, # 表空孩子",
  "quickAnswer": "前序值加 # 空标记。",
  "approach": "前序值加 # 空标记。",
  "explanationFocus": "二叉树序列化与反序列化：前序值加 # 空标记。",
  "bruteForce": "《二叉树序列化与反序列化》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。",
  "invariant": "树遍历时，每个已完成子树都已产出 二叉树序列化与反序列化：前序值加 # 空标记。 所需的正确摘要。",
  "walkthrough": "用三层小树演练《二叉树序列化与反序列化》，逐次写出递归返回值或队列内容。",
  "derivation": [
    "只记录值会丢失形状信息，无法唯一还原。",
    "同一前序规则「先写值、遇空写 #」，读写都按 根-左-右 递归，token 序列与树结构一一对应，得以无歧义恢复。",
    "反序列化时用一个迭代器让递归函数按顺序消费下一个 token，不需要手动维护索引。"
  ],
  "edgeCases": [
    "空树：序列为单个 #，反序列化返回 None。",
    "只有左链/只有右链：会连续出现多个 # 表示缺失的另一侧。",
    "节点值为负数：str 写出负号，int 还原为整数，不受影响。"
  ],
  "code": "# Python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\nclass Codec:\n    def serialize(self, root):\n        parts = []\n        def visit(node):\n            if not node:\n                parts.append(\"#\")\n                return\n            parts.append(str(node.val))\n            visit(node.left)\n            visit(node.right)\n        visit(root)\n        return \",\".join(parts)\n    def deserialize(self, data):\n        tokens = iter(data.split(\",\"))\n        def build():\n            value = next(tokens)\n            if value == \"#\": return None\n            node = TreeNode(int(value))\n            node.left, node.right = build(), build()\n            return node\n        return build()",
  "codeNotes": [
    "递归终止条件先处理空节点。",
    "BFS 每层开始前固定当前队列长度。"
  ],
  "complexity": "时间 O(n)，空间 O(n)。每个节点访问一次，序列长度 O(n)；递归栈/迭代器额外 O(h)（或 O(n) 当退化为链）。",
  "followUps": [
    {
      "question": "为什么必须写 #？",
      "answer": "没有空标记时，同一组值序列可以对应多种树形（无法区分「某节点没有左孩子」还是「左孩子是另一个值」），还原会产生歧义。"
    },
    {
      "question": "负数也能处理吗？",
      "answer": "能。序列化用 str 写出（含负号），反序列化用 int 还原为整数，负号被正常保留。"
    }
  ],
  "followUpAnswers": [
    "可改为显式栈或迭代遍历以规避调用栈限制。",
    "在递归/回溯中维护父指针或路径数组。"
  ],
  "pitfalls": [
    "只序列化值而不写空标记，导致无法区分不同形状的树。",
    "反序列化时手动维护索引容易越界或错位，用迭代器更稳妥。"
  ],
  "beginnerSummary": "序列化要把一棵任意形状的二叉树编码成字符串并能无歧义地还原。仅靠「节点值」无法区分形状（同一组值可对应多种树），所以必须显式写出「空孩子」标记（这里用 #）。采用前序（根→左→右）遍历，每个节点先写值、再递归写左、再写右；空节点写 #。反序列化按同一规则逐个消费 token 即可重建。",
  "prerequisites": [
    "前序顺序是根、左子树、右子树，和我们的读写规则一致。",
    "# 表示空节点（null），是还原时判断「此处没有孩子」的依据。",
    "序列化与反序列化必须使用同一套前序约定，才能一一对应。"
  ],
  "workedExample": [
    "以根 1、左 2、右 3（3 的左右为 4、5）为例。前序写出：1, 然后递归左子树 2（2 无孩子 → 2,#,#），再递归右子树 3,4,#,#,5,#,#。完整串：1,2,#,#,3,4,#,#,5,#,#。",
    "反序列化时用迭代器逐个取 token：读到 1 建根，读到 2 建左子树，两个 # 结束它；再读 3 建右子树，依此类推。"
  ],
  "lineByLine": [
    "TreeNode 定义题目约定的节点类型。",
    "serialize 的 walk 为每个节点写值，遇到空写 #，并先左后右递归。",
    "deserialize 用 iter(tokens) 生成迭代器，build 每次 next 取下一个 token。",
    "build 遇到 # 返回 None；否则建节点并递归填充左右孩子。"
  ]
};
