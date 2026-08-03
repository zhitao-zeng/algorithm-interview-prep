export default {
  "id": "ll-detect-cycle",
  "category": "链表",
  "difficulty": "Medium",
  "title": "环形链表 II（环的入口）",
  "prompt": "给定链表，判断是否有环；若有，返回环的起始节点，否则返回 None。例如，链表 3→2→0→-4，其中 -4 指向 2，则环入口为节点 2？",
  "quickAnswer": "快慢指针判环，相遇后令一个指针回到头，两指针同速前进再次相遇点即入口；时间 O(n)，空间 O(1)。",
  "approach": "Floyd 判圈：快指针走两步、慢指针走一步；相遇后头指针与慢指针同速走，相交处为环入口。",
  "explanationFocus": "是什么：用快慢指针检测环，并借“头到入口距离 = 相遇点绕环到入口距离”的几何关系，在相遇后让一头指针同速回跑，二者相交点正是环的起始节点。",
  "bruteForce": "用哈希集合记录访问过的节点，第一个重复出现的即入口。",
  "invariant": "快指针始终比慢指针多走整数圈；相遇后，从头出发的指针与慢指针以相同步长前进，因距离差恰为环长度整数倍而必在入口相遇。",
  "walkthrough": "3→2→0→-4→(2)。快慢从 3 出发同速差：快 0、慢 2 相遇于 0（示意）。令 p=head=3、q=慢指针，同速走：p:3→2，q:0→-4→2，相交于 2，即入口。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef detectCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            break\n    else:\n        return None\n    p = head\n    while p is not slow:\n        p = p.next\n        slow = slow.next\n    return p",
  "complexity": "时间 O(n)，空间 O(1)。",
  "beginnerSummary": "像操场跑步，快的人套圈追上慢的人后，再让一人从起点、一人从相遇点同速走，两人会在环的入口碰头。",
  "diagram": "3 -> 2 -> 0 -> -4\n     ^          |\n     |__________|\n相遇后 p从头、slow从相遇点同速 -> 入口=2",
  "derivation": [
    "为什么需要：哈希法 O(n) 空间，快慢指针可 O(1)。",
    "怎么实现：Floyd 判圈 + 二次同速相遇到入口。",
    "有什么代价：O(1) 空间，需理解相遇几何。",
    "怎么评测：无环、环在头、环在中段等用例。"
  ],
  "edgeCases": [
    "无环返回 None。",
    "整个链表成环（头即入口）。",
    "环入口在中间节点。",
    "单节点自环。"
  ],
  "pitfalls": [
    "用 == 比较节点值而非 is 身份，值相同会误判。",
    "未处理无环时直接进二次循环导致死循环，需用 else 返回 None。"
  ],
  "prerequisites": [
    "链表遍历",
    "Floyd 判圈算法",
    "指针身份比较"
  ],
  "workedExample": [
    "3→2→0→-4→2 成环：快慢相遇后同速得入口 2。",
    "无环链表：fast 触底，while-else 返回 None。"
  ],
  "lineByLine": [
    "slow=fast=head 同起点。",
    "fast 走两步、slow 走一步。",
    "相遇则 break 跳出检测环。",
    "while-else 未 break 说明无环返回 None。",
    "p=head 与 slow 同速前进直到相遇即入口。"
  ],
  "codeNotes": [
    "必须用 is 比较节点身份；while...else 在无 break 时执行返回 None。"
  ],
  "followUps": [
    {
      "question": "只判断有无环（不找入口）怎么做？",
      "answer": "快慢指针相遇即有环，无需第二阶段，返回布尔即可。"
    },
    {
      "question": "如何求环的长度？",
      "answer": "相遇后固定一个指针、另一个继续走直到再次相遇，所走步数即环长。"
    }
  ],
  "followUpAnswers": [
    "快慢指针相遇即有环，无需第二阶段，返回布尔即可。",
    "相遇后固定一个指针、另一个继续走直到再次相遇，所走步数即环长。"
  ],
  "kind": "code"
};
