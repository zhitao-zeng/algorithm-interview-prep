export default {
  "kind": "code",
  "id": "206",
  "category": "链表",
  "difficulty": "Easy",
  "title": "反转链表",
  "prompt": "给定单链表头节点 head，将其原地反转（只修改节点的 next 指针，不新建链表），返回反转后的新头节点。链表长度可为 0，节点值为任意整数；要求空间 O(1)。示例：输入 1→2→3→null，输出 3→2→1→null。",
  "diagram": "反转前:  head → [1]→[2]→[3]→[4]→ null\n\n每轮(以第1轮为例):\n  nxt = cur.next        # 先暂存后继, 否则断链\n  cur.next = prev       # 掉头\n  prev, cur = cur, nxt  # 两指针前进\n\n指针演化:\n  prev=null   cur=1→2→3→4→null\n  → prev=1→null        cur=2→3→4→null\n  → prev=2→1→null      cur=3→4→null\n  → prev=3→2→1→null    cur=4→null\n  → prev=4→3→2→1→null  cur=null  (返回 prev)",
  "quickAnswer": "维护 prev、cur、nxt；先保存 nxt 再反转 cur.next。",
  "approach": "维护 prev、cur、nxt；先保存 nxt 再反转 cur.next。",
  "explanationFocus": "反转链表：维护 prev、cur、nxt；先保存 nxt 再反转 cur.next。",
  "bruteForce": "《反转链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "prev 始终是已经反转好的前缀头结点。",
  "walkthrough": "演练《反转链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "最直观的做法是把所有值读进数组再倒序重建，但那样没有练习到指针操作，也没有做到原地修改，面试通常不认可。",
    "核心观察是：只要在处理 cur 之前保存它的后继 nxt，就能安全地把 cur.next 接到 prev 上，而不会因为改了指针而丢失后半段链表。",
    "每轮把 cur 接到 prev 前面，然后 prev、cur 一起向前走一步；当 cur 走到 None，prev 恰好停在原本的最后一个节点，也就是反转后的新头。"
  ],
  "edgeCases": [
    "空链表：head 为 None，循环不执行，直接返回 None，调用方需要处理。",
    "单节点链表：循环执行一次后 cur 变为 None，prev 指向该节点本身，正确。",
    "头节点或尾节点参与操作：反转后原头变尾（next 为 None），原尾变头，指针逻辑无需特判。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef reverse_list(head):\n    prev, cur = None, head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev, cur = cur, nxt\n    return prev",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。每个节点只被访问一次，且只用到 prev、cur、nxt 三个指针，额外空间是常数。",
  "followUps": [
    {
      "question": "为什么必须先保存 nxt？",
      "answer": "改写 cur.next 后，原来通往剩余节点的箭头会断开。把它保存到 nxt，才能在本轮结束后继续走到原链表的下一个节点，否则后面的节点就访问不到了。"
    },
    {
      "question": "能否用递归实现？",
      "answer": "可以，递归先翻转后半段再把当前节点接到末尾；但递归会占用 O(n) 的调用栈空间，而迭代版本只需要三个指针，空间为 O(1)，实际面试更推荐迭代。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "覆盖 next 前没有暂存后继节点，导致后续节点全部丢失、链表断裂。",
    "头节点变化却没有用 prev 或新头变量承接，最后返回了错误的节点（如返回 None 或原 head）。"
  ],
  "beginnerSummary": "反转链表就是把一条单向链表的指向全部掉头：原本 head → … → tail 变成 tail → … → head。面试里通常要求「原地」完成，也就是不新建一整条链表，只通过修改每个节点的 next 指针来实现。理解它的关键只有一句话：在改动某个节点的 next 之前，必须先记住它原本指向的下一个节点，否则从它通往后面节点的路就断了，链表也就跟着断链。",
  "prerequisites": [
    "单链表每个节点由 val（存值）和 next（指向下一个节点，末尾为 None）组成，只能顺着 next 单向前进。",
    "我们需要两个游标：prev 指向「已经反转好的那段链表的头部」，cur 指向「当前正在处理的节点」。",
    "一旦把 cur.next 改指 prev，原来从 cur 通往后方节点的箭头就消失了，所以改之前必须先暂存 cur.next。"
  ],
  "workedExample": [
    "以 1 → 2 → 3 为例，初始 prev=None、cur=1。第一轮：暂存 nxt=2，把 1.next 指向 None（它变成新链尾），再令 prev=1、cur=2。",
    "第二轮：暂存 nxt=3，把 2.next 指向 1，prev=2、cur=3。第三轮：暂存 nxt=None，把 3.next 指向 2，prev=3、cur=None，循环结束。",
    "此时 prev 指向 3，从 3 出发是 3 → 2 → 1 → None，整条链已反转，返回 prev 即为新头节点。"
  ],
  "lineByLine": [
    "ListNode 类定义了题目约定的节点结构，包含值和下一跳，方便我们构造与返回链表。",
    "while cur: 保证即使链表为空（cur 一开始就是 None）也会直接返回 prev（也就是 None），不会进入循环。",
    "nxt = cur.next 必须在改写 cur.next 之前执行，这是「暂存后继」的关键，避免断链。",
    "cur.next = prev 完成一次「掉头」；prev, cur = cur, nxt 让两个游标同时前进，最终 prev 成为新头节点并返回。"
  ]
};
