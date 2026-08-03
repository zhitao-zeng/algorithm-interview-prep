export default {
  "id": "ll-remove-nth",
  "category": "链表",
  "difficulty": "Medium",
  "title": "删除链表的倒数第 N 个节点",
  "prompt": "给定一个链表，删除倒数第 n 个节点并返回头节点。例如，链表 1→2→3→4→5，n=2，删除倒数第 2 个（即 4），得到 1→2→3→5？",
  "quickAnswer": "快慢指针：快指针先走 n 步，再快慢同速，快到尾时慢指针恰在待删节点前一位置；时间 O(L)，空间 O(1)。",
  "approach": "哑节点 + 双指针，fast 先走 n 步，然后 fast/slow 同速，slow 停在待删前驱。",
  "explanationFocus": "是什么：删除倒数第 n 个等价于保留前 L-n 个、跳过第 L-n+1 个；用快指针先走 n 步制造 n 的间距，快慢同速时快到尾、慢正好停在待删节点的前驱，便于删除。",
  "bruteForce": "两遍遍历：先求长度 L，再走 L-n 步删除（或不设哑节点特判头删）。",
  "invariant": "fast 与 slow 始终相距 n 个节点；当 fast 到达末节点时，slow 指向待删节点的前驱。",
  "walkthrough": "1→2→3→4→5，n=2。fast 先走 2 步到 2；slow=哑，slow 与 fast 同速：fast→3 slow→1；fast→4 slow→2；fast→5 slow→3；slow.next=4 待删，slow.next=slow.next.next 删除 4。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef removeNthFromEnd(head, n):\n    dummy = ListNode(0, head)\n    fast = slow = dummy\n    for _ in range(n):\n        fast = fast.next\n    while fast.next:\n        fast = fast.next\n        slow = slow.next\n    slow.next = slow.next.next\n    return dummy.next",
  "complexity": "时间 O(L)，空间 O(1)。",
  "beginnerSummary": "像两个人绳距 n 步并排走，前面的人到终点时，后面的人正好站在要删的那个人的前一位，伸手就能摘掉它。",
  "diagram": "1->2->3->4->5  n=2\nfast先走2步到2\n同速: fast到5时 slow在3 -> 删slow.next(4)\n结果:1->2->3->5",
  "derivation": [
    "为什么需要：单链表不能反向，需一次遍历定位倒数第 n。",
    "怎么实现：快慢间距 n，同速到尾定位前驱。",
    "有什么代价：O(1) 空间，一遍扫描。",
    "怎么评测：删头、删尾、n=1、n=长度。"
  ],
  "edgeCases": [
    "n=1 删除尾节点。",
    "n=链表长度，删除头节点（哑节点避免特判）。",
    "链表仅一个节点，删除后为空。",
    "保证 1≤n≤长度。"
  ],
  "pitfalls": [
    "未用哑节点，删除头节点时需额外分支。",
    "fast 先走 n 步后循环条件用 fast 而非 fast.next，导致 slow 停在待删节点而非前驱。"
  ],
  "prerequisites": [
    "链表遍历",
    "快慢双指针",
    "哑节点删除技巧"
  ],
  "workedExample": [
    "1→2→3→4→5,n=2：删 4 → 1→2→3→5。",
    "n=5（等于长度）：删头 1 → 2→3→4→5。"
  ],
  "lineByLine": [
    "dummy 指向 head，避免删头特判。",
    "fast 先走 n 步建立间距。",
    "while fast.next 同速前进直到 fast 到尾。",
    "slow 此时在待删节点前驱。",
    "slow.next=slow.next.next 跳过目标节点。",
    "返回 dummy.next。"
  ],
  "codeNotes": [
    "用 dummy 前驱统一删除逻辑；循环用 fast.next 使 slow 停在待删前驱而非待删本身。"
  ],
  "followUps": [
    {
      "question": "如何一遍扫描且不用哑节点？",
      "answer": "仍可用双指针，但需在 fast 到尾时单独处理 slow 为头（即删头）的情况。"
    },
    {
      "question": "如何删除正数第 n 个？",
      "answer": "slow 从 dummy 出发直接走 n-1 步到前驱，再删除 slow.next。"
    }
  ],
  "followUpAnswers": [
    "仍可用双指针，但需在 fast 到尾时单独处理 slow 为头（即删头）的情况。",
    "slow 从 dummy 出发直接走 n-1 步到前驱，再删除 slow.next。"
  ],
  "kind": "code"
};
