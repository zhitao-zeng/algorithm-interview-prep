export default {
  "kind": "code",
  "id": "146",
  "category": "链表",
  "difficulty": "Medium",
  "title": "LRU Cache",
  "prompt": "设计并实现一个 LRU（最近最少使用）缓存：支持 get(key) 返回值（不存在返回 -1）与 put(key, value)，两种操作均 O(1)；当容量满时，自动淘汰最久未使用（最久未被 get/put 访问）的键。capacity ≥ 1。",
  "diagram": "容量=2\nput(1,1):  [H]⇄1⇄[T]          (1 最近)\nput(2,2):  [H]⇄2⇄1⇄[T]        (2 最近, 1 最久)\nget(1):    访问1 → 移到头  [H]⇄1⇄2⇄[T]\nput(3,3):  超容量, 淘汰最久(2)  [H]⇄3⇄1⇄[T]\nget(2):    -1 (2 已被淘汰)",
  "quickAnswer": "哈希表定位节点，双向链表维护新旧顺序；访问即移到头部，满时弹出尾部。",
  "approach": "哈希表定位节点，双向链表维护新旧顺序；访问即移到头部，满时弹出尾部。",
  "explanationFocus": "LRU Cache：哈希表定位节点，双向链表维护新旧顺序；访问即移到头部，满时弹出尾部。",
  "bruteForce": "《LRU Cache》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "head 后是最近使用节点，tail 前是最久未使用节点，cache 中每个键都有对应链表节点。",
  "walkthrough": "演练《LRU Cache》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "只用字典能快速 get，却丢失了「谁最久未用」的信息；只用链表又能记录顺序，却不能快速按键找到对应节点。",
    "组合二者：get 命中后把节点移到头部（表示刚被使用）；put 时若存在则更新并移到头部，不存在则新建并加到头部，若超过容量则删除 tail 前的节点并同步字典。",
    "因为移动/删除都发生在「已知节点」上，借助双向链表和哨兵是 O(1)；字典查找也是 O(1)，所以两个操作都是 O(1)。"
  ],
  "edgeCases": [
    "容量为 0：放入第一个节点后长度立刻超过 0，会被立即淘汰，get 永远返回 -1。",
    "重复 put 同一个 key：应更新值并当作一次使用移到头部，不应重复占用容量。",
    "get 不存在的 key：返回 -1，且不改变任何使用顺序。"
  ],
  "code": "# Python\nclass Node:\n    def __init__(self, key=0, value=0):\n        self.key, self.value = key, value\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity, self.cache = capacity, {}\n        self.head, self.tail = Node(), Node()\n        self.head.next, self.tail.prev = self.tail, self.head\n\n    def _remove(self, node):\n        node.prev.next, node.next.prev = node.next, node.prev\n\n    def _add_front(self, node):\n        node.next, node.prev = self.head.next, self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_front(node)\n        return node.value\n\n    def put(self, key, value):\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_front(node)\n        if len(self.cache) > self.capacity:\n            least = self.tail.prev\n            self._remove(least)\n            del self.cache[least.key]",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "get/put 均 O(1)。字典提供 O(1) 查找，双向链表+哨兵提供 O(1) 的删除与头插，容量限制只影响偶尔的一次淘汰。",
  "followUps": [
    {
      "question": "为什么更新已有 key 时也要移动它？",
      "answer": "写入本身也是一次使用；如果不移动，它可能刚更新就仍被当成最久未使用而错误淘汰，违背 LRU 语义。"
    },
    {
      "question": "容量为 0 会怎样？",
      "answer": "放入一个节点后长度立刻超过 0，代码会把它淘汰；因此 get 永远返回 -1，符合「没有可存空间」的含义。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "只用单链表，导致删除已知节点仍需 O(n) 遍历找前驱。",
    "忘记同步字典（删除链表节点却没 del cache[key]，或更新时没改 cache 映射），造成数据不一致。"
  ],
  "beginnerSummary": "LRU（Least Recently Used）缓存需要在 O(1) 时间内完成 get 和 put，并在容量满时淘汰「最久没被使用」的键。单一数据结构做不到：哈希表能 O(1) 按键找值，却不知道谁最久未用；双向链表能记录使用顺序，却不能 O(1) 按键定位节点。把两者组合起来——哈希表存「键→链表节点」、双向链表维护新旧顺序——就同时满足这两个要求。",
  "prerequisites": [
    "字典 cache 把 key 映射到链表节点，使得 get/put 时按键查找是 O(1)。",
    "双向链表的每个节点有 prev/next，配合哨兵头尾节点，可以在「已知节点」时 O(1) 完成删除和插到头部。",
    "约定：head 之后是「最近使用」的节点，tail 之前是「最久未使用」的节点。"
  ],
  "workedExample": [
    "容量为 2：依次 put(1,1)、put(2,2)，链表顺序变为 2（最近）→ 1（最久）。再 get(1) 命中，把 1 移到头部，顺序变成 1 → 2。",
    "接着 put(3,3) 超过容量，删除 tail 前的 2（最久未用），链表变成 3 → 1；此时再 get(2) 返回 -1，因为它已被淘汰。"
  ],
  "lineByLine": [
    "两个哨兵节点 head/tail 永远不存数据，避免在最前/最后插入删除时写一堆空指针分支。",
    "_remove 直接让 node 的前后邻居相连，因为节点已知，所以是 O(1) 删除。",
    "get 命中后调用 _add_front 把节点移到头部，表示它刚刚被使用过。",
    "put 超过容量时，tail.prev 正是最久未使用的真实节点，删除它并同步从字典里 del 掉对应键。"
  ]
};
