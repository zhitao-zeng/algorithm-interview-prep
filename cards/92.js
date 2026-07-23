export default {
  "kind": "code",
  "id": "92",
  "category": "链表",
  "difficulty": "Medium",
  "title": "反转链表 II",
  "prompt": "给定单链表头节点 head 与两个从 1 开始计数的位置 left、right，原地反转区间 [left, right] 内的节点，区间外顺序不变，返回头节点。1 ≤ left ≤ right ≤ 链表长度；要求空间 O(1)。示例：1→2→3→4→5, left=2, right=4 → 1→4→3→2→5。",
  "diagram": "原链:  1 → 2 → 3 → 4 → 5      left=2, right=4\n       before(指向1)\n\n头插(每次把 cur 下一个节点插到 before 后):\n  move=3 : 1 → 3 → 2 → 4 → 5\n  move=4 : 1 → 4 → 3 → 2 → 5\n结果:  1 → 4 → 3 → 2 → 5",
  "quickAnswer": "dummy 定位 left 前驱，反复把区间后续节点头插到该前驱之后。",
  "approach": "dummy 定位 left 前驱，反复把区间后续节点头插到该前驱之后。",
  "explanationFocus": "反转链表 II：dummy 定位 left 前驱，反复把区间后续节点头插到该前驱之后。",
  "bruteForce": "《反转链表 II》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 反转链表 II：dummy 定位 left 前驱，反复把区间后续节点头插到该前驱之后。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《反转链表 II》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "可以先把 [left,right] 这段切下来完整反转再接回去，但那样要额外保存多个边界指针，容易出错。",
    "更优雅的做法是固定 before 和 cur：每次把 cur 后面的节点「头插」到 before 之后。因为被头插的节点总在区间内，重复 right-left 次就能把整个区间原地翻过来。",
    "循环结束后 cur 自然停在区间的原首节点（现已变成区间尾），before.next 指向区间新头，区间前后的链接都不曾断裂。"
  ],
  "edgeCases": [
    "left 等于 right：right-left 为 0，内层循环不执行，链表完全不变，正好符合「区间长度为 1 无需反转」。",
    "left=1：有了 dummy，before 就是 dummy，无需对「没有前驱」做特判。",
    "right=n（反转到末尾）：cur.next 最终为 None，头插逻辑照常工作。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef reverse_between(head, left, right):\n    dummy = ListNode(0, head)\n    before = dummy\n    for _ in range(left - 1):\n        before = before.next\n    cur = before.next\n    for _ in range(right - left):\n        move = cur.next\n        cur.next = move.next\n        move.next = before.next\n        before.next = move\n    return dummy.next",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。最多扫描链表两遍，只用到常数个指针。",
  "followUps": [
    {
      "question": "left 等于 right 时为什么不用特别处理？",
      "answer": "因为 right-left 为 0，第二个循环一次都不执行，链表没有任何指针被修改，正好保留原样，不需要额外分支。"
    },
    {
      "question": "为什么不能直接从 head 开始操作？",
      "answer": "当 left 为 1 时，原头节点会改变；dummy 为它提供了一个稳定的前驱，最后统一返回 dummy.next，避免丢失新头节点。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "没有 dummy 时，left=1 会丢失新的头节点，导致返回错误。",
    "头插顺序写错（先改 cur.next 再摘 move），会破坏区间内的链接关系。"
  ],
  "beginnerSummary": "反转链表 II 是「反转链表」的局部版本：给定从 1 开始计数的位置 left 和 right，只把这两个位置之间的节点顺序反过来，区间外的节点保持原样。难点在于区间可能出现在链表中间，因此需要一个稳定的「前驱」来把反转后的小段重新接回原链。",
  "prerequisites": [
    "dummy 是头节点之前的一个虚拟节点（next 指向 head），保证即使 left=1（从头开始反转）也有一个统一的前驱可操作。",
    "before 始终指向「待反转区间前面的那个节点」，cur 是区间里「当前作为尾部的节点」，借助这两个锚点就能做头插。",
    "「头插」指的是：把区间里的下一个节点摘下来，插到 before 的后面，从而让它在反转段里排到最前面。"
  ],
  "workedExample": [
    "以 1 → 2 → 3 → 4 → 5，left=2、right=4 为例。先让 before 停在 1（pre 节点），cur 指向区间首节点 2。",
    "第一轮头插：把 3 从原处摘下，插到 before(1) 之后，得到 1 → 3 → 2 → 4 → 5。",
    "第二轮头插：把 4 摘下插到 before 之后，得到 1 → 4 → 3 → 2 → 5。此时区间处理完，cur 仍停在 2（区间新尾），返回 dummy.next 即整条链。"
  ],
  "lineByLine": [
    "dummy 统一了「从头反转」和「从中间反转」两种情况，最后统一返回 dummy.next，无需对 head 是否被改做特判。",
    "第一个 for 循环让 before 恰好停在 left 的前一个位置，作为头插的锚点。",
    "内层循环重复 right-left 次：每次 move=cur.next 先摘下，再把它接到 before 之后，实现头插。",
    "cur 始终留在反转区间的尾部，因此循环结束时整个区间已就位，直接返回 dummy.next。"
  ]
};
