export default {
  "kind": "code",
  "id": "25",
  "category": "链表",
  "difficulty": "Hard",
  "title": "K 个一组翻转链表",
  "prompt": "给定单链表 head 与正整数 k，每凑够 k 个节点就原地反转这一段，最后不足 k 个的尾巴保持原样，返回头节点。1 ≤ k ≤ 链表长度；要求空间 O(1)。示例：1→2→3→4→5, k=2 → 2→1→4→3→5。",
  "diagram": "k=2:  1 → 2 → 3 → 4 → 5\n组1 [1,2] 反转 → 2 → 1 → 3 → 4 → 5\n组2 [3,4] 反转 → 2 → 1 → 4 → 3 → 5\n残组 [5] 不足k, 保留\n结果: 2 → 1 → 4 → 3 → 5",
  "quickAnswer": "先探测是否够 k 个，再把 [groupPrev.next, kth] 原地反转并接回。",
  "approach": "先探测是否够 k 个，再把 [groupPrev.next, kth] 原地反转并接回。",
  "explanationFocus": "K 个一组翻转链表：先探测是否够 k 个，再把 [groupPrev.next, kth] 原地反转并接回。",
  "bruteForce": "《K 个一组翻转链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 K 个一组翻转链表：先探测是否够 k 个，再把 [groupPrev.next, kth] 原地反转并接回。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《K 个一组翻转链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "如果不先数够 k 个就盲目反转，遇到末尾残组会把它也翻转，违背题意。",
    "每轮先用 kth 向前探 k 步；一旦 kth 为 None 立即返回，保留剩余节点。确认够 k 个后，把「组后节点」作为反转初始 prev，整组原地反转。",
    "反转结束后，原组的首节点变成组尾，原组的尾节点（kth）变成组头；用 old_start 记住原首节点，把它接到 before 之后作为下一组的前驱。"
  ],
  "edgeCases": [
    "k=1：每组只有一个节点，反转不改变任何顺序，等价于原链表。",
    "链表长度不是 k 的整数倍：末尾不足 k 个的残组保持不变。",
    "k 大于链表长度：第一轮探测就发现不足，直接原样返回。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef reverse_k_group(head, k):\n    dummy = ListNode(0, head); before = dummy\n    while True:\n        kth = before\n        for _ in range(k):\n            kth = kth.next\n            if not kth: return dummy.next\n        after, prev, cur = kth.next, kth.next, before.next\n        while cur is not after:\n            nxt = cur.next; cur.next = prev; prev, cur = cur, nxt\n        old_start = before.next\n        before.next, before = kth, old_start",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。每个节点最多被访问两次（探路一次、反转一次），只用到常数指针。",
  "followUps": [
    {
      "question": "k=1 时会怎样？",
      "answer": "每一组只有一个节点，反转不会改变任何顺序，因此返回原链表，逻辑自然成立无需特判。"
    },
    {
      "question": "为什么必须保存 after？",
      "answer": "反转会改写 kth.next；提前保存组后的入口 after，才能知道内层循环的停止位置，并正确地把整组接回后半段。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "反转前没有先探测够 k 个，把末尾残组也翻转了。",
    "忘记保存 after，导致不知道反转何时停止、也无法接回后续链表。"
  ],
  "beginnerSummary": "K 个一组翻转链表是「反转链表 II」的进阶版：每凑够 k 个节点才把这一组原地反转，最后不足 k 个的尾巴保持原样。关键是先用一个探路指针确认「当前这 k 个节点确实存在」，再对这一组做反转并接回原链，避免把不足 k 个的残组也错误翻转。",
  "prerequisites": [
    "before 指向「当前组之前的节点」，作为把反转后的小组接回原链时的锚点。",
    "kth 用来向前探 k 步，确认当前组确实还有 k 个节点；若中途遇到 None 说明剩余不足 k 个。",
    "把「组后的第一个节点」当作这一组反转的「初始 prev」，反转结束后组的尾节点会自然接到它上面。"
  ],
  "workedExample": [
    "以 1→2→3→4→5，k=2 为例。第一组：before 在 dummy，探到 kth=2 后反转 [1,2]，得到 2→1→3→4→5。",
    "第二组：before 前进到 1（上一组尾），反转 [3,4] 得到 2→1→4→3→5。剩余只有 5，不足一组，直接保留，最终 2→1→4→3→5。"
  ],
  "lineByLine": [
    "dummy 让第一组也有稳定的前驱，返回统一用 dummy.next。",
    "for 循环先找 kth，若中途 kth 变成 None，说明剩余不足 k 个，直接返回 dummy.next 保留残组。",
    "内层 while 在 cur is not after 的边界内反转这一整组（after 是组后第一个节点）。",
    "old_start = before.next 是反转前的组首，反转后它变成组尾；把它接到 before 之后，before 再前移到 old_start，准备下一组。"
  ]
};
