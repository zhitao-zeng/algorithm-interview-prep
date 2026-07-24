export default {
  "kind": "code",
  "id": "21",
  "category": "链表",
  "difficulty": "Easy",
  "title": "合并两个有序链表",
  "prompt": "给定两条升序单链表 l1、l2，将它们合并为一条升序链表（复用原有节点，不新建），返回头节点。任一条可为空。示例：1→2 与 1→3 → 1→1→2→3。",
  "diagram": "a: 1 → 2      b: 1 → 3\ntail→dummy\n比头: 1 vs 1 → 接 a 的头(1), a 前进\n比头: 2 vs 1 → 接 b 的头(1), b 前进\n比头: 2 vs 3 → 接 2\n接剩余 3\n结果: dummy → 1 → 1 → 2 → 3",
  "quickAnswer": "dummy 尾指针每次接较小头，最后接上未耗尽的一条。",
  "approach": "dummy 尾指针每次接较小头，最后接上未耗尽的一条。",
  "explanationFocus": "合并两个有序链表：dummy 尾指针每次接较小头，最后接上未耗尽的一条。",
  "bruteForce": "《合并两个有序链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 合并两个有序链表：dummy 尾指针每次接较小头，最后接上未耗尽的一条。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《合并两个有序链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "把两条链的值收集起来排序也可以，但那样会丢失「已经有序」这个前提，并且新建节点浪费空间。",
    "因为两条链本身有序，重复地「选两个当前头里较小的」一定保持整体有序，且每个节点只被访问一次。",
    "当某一条链先耗尽时，另一条剩下的一段本身就有序，直接接到尾部即可，无需再比较。"
  ],
  "edgeCases": [
    "其中一条为空：while 不进入，最后 a or b 直接返回另一条链或 None。",
    "两条都为空：返回 dummy.next 即 None。",
    "两条链头值相等：用 <= 固定优先取第一条，结果稳定且仍升序。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef merge_two_lists(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val: tail.next, a = a, a.next\n        else: tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(m+n)，空间 O(1)。每个节点最多被比较并接上一次，只用到常数个指针（原地合并，不新建节点）。",
  "followUps": [
    {
      "question": "为什么相等时任选一条不会破坏升序？",
      "answer": "两个值相等时先接哪一个都不破坏升序；代码用 <= 固定优先第一条，结果更稳定、可复现。"
    },
    {
      "question": "空链表需要单独判断吗？",
      "answer": "不需要。while 不会进入，最后 a or b 会自然返回另一条链或 None，覆盖了空输入。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "接到 tail 后忘记让 tail 前进，导致所有节点都堆在同一个位置。",
    "循环条件只用 while a 或 while b，漏掉另一条非空的情况。"
  ],
  "beginnerSummary": "合并两个有序链表是把两条各自升序的链表合成一条升序链表，且要复用原有节点（不新建）。思路非常自然：两条链的头节点分别是各自剩余部分的最小值，每次只要比较这两个头，把较小的接到结果尾部，然后该链指针前进一步即可。",
  "prerequisites": [
    "由于两条链都已升序，当前的头节点 a、b 必然是各自「还没合并部分」的最小值。",
    "tail 指向已经合并好的部分末尾；新节点一律接到 tail 之后，再让 tail 前进。",
    "dummy 是一个固定的虚拟头，用来统一「第一个节点」的接入逻辑。"
  ],
  "workedExample": [
    "以 1→2 与 1→3 为例。初始 tail 指向 dummy。比较头 1 和 1，按 <= 取左链的头 1，tail 接到它，a 前进到 2。",
    "再比较 2 和 1，取右链的 1；再比较 2 和 3，取 2；最后左链耗尽，把右链剩余的 3 一次性接上，得到 1→1→2→3。"
  ],
  "lineByLine": [
    "dummy 提供固定返回入口，让第一个节点也走同一套「接到 tail 后」的逻辑。",
    "while a and b: 同时比较两个未耗尽链的头节点，决定接哪一个。",
    "tail = tail.next 在接好一个节点后前进，始终指向已合并部分末尾。",
    "循环结束后 a or b 自然返回另一条链（或 None），把剩余有序段一次性接上。"
  ]
};
