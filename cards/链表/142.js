export default {
  "kind": "code",
  "id": "142",
  "category": "链表",
  "difficulty": "Medium",
  "title": "环形链表 II",
  "prompt": "给定可能有环的单链表，若有环则返回「环的入口节点」，否则返回 null；要求空间 O(1)。",
  "diagram": "3 → 2 → 0 → -4 ↩(指向2)\n        入口=2\n\n阶段1: 快慢指针在环内相遇\n阶段2: seeker从head, slow从相遇点, 同速各走一步\n       → 第一次重合处 = 入口(2), 返回它\n无环: 阶段1未相遇 ⇒ 返回 null",
  "quickAnswer": "相遇后一个指针回头，两指针每次一步，再次相遇即入口。",
  "approach": "相遇后一个指针回头，两指针每次一步，再次相遇即入口。",
  "explanationFocus": "环形链表 II：相遇后一个指针回头，两指针每次一步，再次相遇即入口。",
  "bruteForce": "《环形链表 II》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 环形链表 II：相遇后一个指针回头，两指针每次一步，再次相遇即入口。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《环形链表 II》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "用集合记录第一个重复访问的节点能找到入口，但需要 O(n) 额外空间。",
    "设头到入口距离为 a，入口到相遇点为 b，环剩余为 c。快慢相遇时 fast 比 slow 多走整数圈，可推出 a = c（模环长），即「头到入口」等于「相遇点再走 c 到入口」。",
    "于是让一个指针从 head、一个从相遇点同速前进，它们会在入口处重合——这就是第二阶段的依据。"
  ],
  "edgeCases": [
    "无环：第一阶段不会 break，else 返回 None。",
    "单节点自环：第一轮就相遇，seeker 和 slow 都在头节点，立即返回该节点。",
    "环很大或很小：第二阶段路程关系依然成立，结果正确。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef detect_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast: break\n    else:\n        return None\n    seeker = head\n    while seeker is not slow:\n        seeker, slow = seeker.next, slow.next\n    return seeker",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。两个阶段各自最多遍历链表常数遍，只用到两个指针。",
  "followUps": [
    {
      "question": "为什么无环时一定要先返回 None？",
      "answer": "无环就没有相遇点可供第二阶段使用；继续走既不符合题意，也可能对 None 取 .next 而报错。"
    },
    {
      "question": "自环（节点指向自己）是否适用？",
      "answer": "适用。首次循环就相遇，seeker 和 slow 都停在头节点，立即返回该节点，无需特殊分支。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "忘记处理无环情况，导致对 None 继续取 .next。",
    "第二阶段让两个指针都从 head 出发，或速度不一致，无法在入口重合。"
  ],
  "beginnerSummary": "环形链表 II 在「判断是否有环」的基础上进一步要求返回环的入口节点。Floyd 算法分两阶段：第一阶段用快慢指针确认有环并找到一个相遇点；第二阶段让一个指针从表头、另一个从相遇点同时每次走一步，它们再次相遇的位置正是环的入口。",
  "prerequisites": [
    "Python 中 while…else 的 else 只在循环「没有被 break 打断」时执行，这里用它处理「无环」的情况。",
    "seeker 从 head 出发，slow 从「第一阶段相遇点」出发，两者同速前进。",
    "利用快慢指针相遇时路程上的数学关系，可以证明「头到入口的距离」等于「相遇点绕环到入口的距离」。"
  ],
  "workedExample": [
    "以 3→2→0→-4（且 -4 指向 2）为例。第一阶段快慢指针在环内某处相遇。",
    "第二阶段 seeker 从头、slow 从相遇点同速走，第一次重合处就是值为 2 的入口节点，返回它。"
  ],
  "lineByLine": [
    "while fast and fast.next: 保护 fast 走两步不会访问 None.next。",
    "if slow is fast: break 只在首次相遇时跳出，进入第二阶段。",
    "若循环正常结束（未 break）则 else 分支返回 None，明确处理无环。",
    "seeker 与 slow 同速各走一步，第二次相遇的节点就是环的入口。"
  ]
};
