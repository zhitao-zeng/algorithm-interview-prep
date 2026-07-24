export default {
  "kind": "code",
  "id": "23",
  "category": "链表",
  "difficulty": "Hard",
  "title": "合并 K 个升序链表",
  "prompt": "给定 k 条各自升序的单链表（ListNode 数组），合并为一条仍升序的链表并返回其头节点。k 可能为 0；要求尽量 O(N log k)。示例：[[1→4],[1→3],[2]] → 1→1→2→3→4。",
  "diagram": "三条链:  [1→4]   [1→3]   [2]\n\n小根堆(存 值,链表序号,节点):\n  初始:  (1,0) (1,1) (2,2)\n  弹(1,0)→接1, 把其后继4入堆:  堆=(1,1)(2,2)(4,0)\n  弹(1,1)→接1, 把3入堆:       堆=(2,2)(3,1)(4,0)\n  弹(2,2)→接2 ... 直到堆空\n结果: 1 → 1 → 2 → 3 → 4",
  "quickAnswer": "小根堆保存每条链表当前头；弹出最小节点后把它的 next 入堆。",
  "approach": "小根堆保存每条链表当前头；弹出最小节点后把它的 next 入堆。",
  "explanationFocus": "合并 K 个升序链表：小根堆保存每条链表当前头；弹出最小节点后把它的 next 入堆。",
  "bruteForce": "《合并 K 个升序链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 合并 K 个升序链表：小根堆保存每条链表当前头；弹出最小节点后把它的 next 入堆。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《合并 K 个升序链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "逐一把 k 条链表两两合并（先合并前两条，再和第三条合并…）虽然是 O(总节点数×k) 的直观做法，但每次合并都要重新扫描已合并结果，效率差。",
    "关键观察：任意时刻，所有链表「还没合并的部分」里最小的那个，一定出现在各条链表当前的头节点中。所以只要用堆维护这些头节点，每次取最小即可。",
    "弹出一个节点后，只把它自己的后继入堆，因此堆的大小始终不超过 k，时间复杂度降为 O(N log k)（N 为总节点数）。"
  ],
  "edgeCases": [
    "某条链表为空：初始化时过滤掉，不进堆，不影响结果。",
    "lists 整体为空：堆始终为空，循环不执行，返回 dummy.next（即 None）。",
    "多条链表头值相等：靠 index 打破平手，不会因比较 ListNode 而报错。"
  ],
  "code": "# Python\nfrom heapq import heappop, heappush\n\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef merge_k_lists(lists):\n    heap = []\n    for index, node in enumerate(lists):\n        if node:\n            heappush(heap, (node.val, index, node))\n    dummy = tail = ListNode()\n    while heap:\n        _, index, node = heappop(heap)\n        tail.next, tail = node, node\n        if node.next:\n            heappush(heap, (node.next.val, index, node.next))\n    tail.next = None\n    return dummy.next",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(N log k)，空间 O(k)。N 为总节点数，每个节点入堆出堆各一次（log k），堆最多同时存 k 个节点。",
  "followUps": [
    {
      "question": "为什么堆元素要带 index？",
      "answer": "若两个节点值相等，Python 会继续比较元组下一项。index 是可比较的整数，用来打破平手，避免它尝试比较两个没有定义大小关系的节点对象而抛错。"
    },
    {
      "question": "分治合并和堆法怎么选？",
      "answer": "两者时间都是 O(N log k)。分治的额外空间主要来自递归栈/队列，堆法更直观地表达「每次选最小头」，代码也更好写，面试通常优先堆法。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "堆里直接放节点对象而不带 index，遇到相等值时比较节点会抛 TypeError。",
    "弹出节点后忘记把其后继入堆，导致结果链表缺失后续节点。"
  ],
  "beginnerSummary": "合并 K 个升序链表要求把 k 条各自有序的链表合成一条仍升序的链表。暴力地两两合并可行但会反复扫描已合并结果；更优的做法是用一个小根堆（优先队列）随时给出「所有链表当前头里最小的那个」，每次只弹出最小值并把它的后继补进堆里。",
  "prerequisites": [
    "小根堆的 heappop 总是取出堆中最小元素；这里堆里放的是 (节点值, 链表序号, 节点)，按值从小到大出队。",
    "元组里的 index 是「平手时的比较标记」：当两条链表头值相等时，Python 会继续比较元组下一项，用整数 index 避免去比较没有大小关系的 ListNode 对象。",
    "dummy 和 tail 两个指针用来拼接结果链表：tail 始终指向已合并部分的末尾，新节点一律接到 tail 之后。"
  ],
  "workedExample": [
    "以三条链 [1→4]、[1→3]、[2] 为例。初始化把三个头 1、1、2 连同各自 index 入堆，堆顶是两个值为 1 的节点。",
    "弹出第一条的 1，接到 tail 后，并把它的后继 4 入堆；此时堆里有 (1,idx2,节点)、(2,…)、(4,…)。",
    "依次弹出另一条 1、2、3、4，接到 tail 后，最终得到 1 → 1 → 2 → 3 → 4。"
  ],
  "lineByLine": [
    "导入 heappush 和 heappop，确保使用标准堆操作，不依赖任何未定义的函数。",
    "初始化时跳过空链表（if node:），堆中只放真正可用的节点，避免把 None 推进堆里。",
    "dummy 和 tail 让「第一个输出节点」也能用和后续节点完全相同的连接逻辑，省去头节点特判。",
    "弹出节点后只把它的后继入堆（if node.next），保证每条链在堆里最多只有一个候选，堆大小受 k 限制。"
  ]
};
