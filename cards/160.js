export default {
  "kind": "code",
  "id": "160",
  "category": "链表",
  "difficulty": "Easy",
  "title": "相交链表",
  "prompt": "给定两条单链表 headA、headB，找出它们「第一个公共节点」（同一节点对象，之后共享后缀），不存在则返回 null；要求空间 O(1)。注意：比较的是节点身份而非值。",
  "diagram": "A: 4 → 1 → 8 → null\n             ↗\nB: 5 → 6 → 1 → 8 → null     (8 是同一节点)\n\n指针交换法: a走A+B, b走B+A\n  a: 4,1,8,5,6,1,8\n  b: 5,6,1,8,4,1,8\n  → 同时在节点8相遇, 返回8\n不相交: 最终同时为null",
  "quickAnswer": "a 走完接 b，b 走完接 a；总路程相同，最多第二轮相遇。",
  "approach": "a 走完接 b，b 走完接 a；总路程相同，最多第二轮相遇。",
  "explanationFocus": "相交链表：a 走完接 b，b 走完接 a；总路程相同，最多第二轮相遇。",
  "bruteForce": "《相交链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 相交链表：a 走完接 b，b 走完接 a；总路程相同，最多第二轮相遇。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《相交链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "先算出两条链长度、让长链先走「长度差」再同步前进，能对齐交点，但需要两遍扫描和额外长度计算。",
    "交换起点法自动抵消长度差：a 走 A+B、b 走 B+A，总步数相同，所以如果存在交点，第二轮一定在同一点相遇。",
    "若两条链不相交，两指针都走完 A+B 后会同时为 None，None is None 使循环结束并返回 None。"
  ],
  "edgeCases": [
    "两条链不相交：两指针都走完 A+B 后同时为 None，循环自然结束返回 None。",
    "一条链是另一条的前缀（交点就在某条链的头）：会在第一轮就相遇。",
    "两条链都为空或其一为空：直接返回 None。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef get_intersection_node(head_a, head_b):\n    a, b = head_a, head_b\n    while a is not b:\n        a = a.next if a else head_b\n        b = b.next if b else head_a\n    return a",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(m+n)，空间 O(1)。每个指针最多走 m+n 步，只用到两个指针，无需额外结构。",
  "followUps": [
    {
      "question": "值相同就等于相交吗？",
      "answer": "不是。不同节点可以存同一个值；必须是内存中同一个节点对象（is 为 True），才会共享之后的 next 路径。"
    },
    {
      "question": "不相交时为什么不会死循环？",
      "answer": "两指针都走完 A+B 后会同时为 None；None is None 成立，循环自然结束，返回 None。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "用 == 比较值而非 is 比较节点身份，把「值相同的不同节点」误判为交点。",
    "交换链表时把 a、b 都指向同一条链，导致永远无法对齐。"
  ],
  "beginnerSummary": "相交链表要求找出两条单链表「第一个公共节点」，注意是节点对象相同（之后共享同一段后缀），而不是值相同。",
  "prerequisites": [
    "用 is 比较节点身份（是否同一对象），而不是 == 比较值；相交后两条链共享同一个后缀。",
    "两个指针 a、b 分别从 head_a、head_b 出发，未相遇时就各走一步，到尾部则改走另一条链。",
    "由于「A 全长 + B 全长」对两个指针相同，它们在第二轮会对齐到同一位置。"
  ],
  "workedExample": [
    "以 A=4→1→8，B=5→6→1→8 为例，其中 8 是同一个节点对象（之后 8→None 共享）。",
    "a 走完 A 后改走 B，b 走完 B 后改走 A；二者最终在节点 8 同时到达，返回 8 这个公共节点。"
  ],
  "lineByLine": [
    "a, b = head_a, head_b，两个指针从各自头节点开始。",
    "while a is not b: 只要还没相遇（或都为 None）就继续。",
    "未相遇时各走一步；到尾部（a 为 None）则改走 head_b，实现「交换链表」。",
    "退出循环时，a 要么是两个链的交点的第一个公共节点，要么都是 None（不相交），直接 return a。"
  ]
};
