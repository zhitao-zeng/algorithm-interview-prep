export default {
  "kind": "code",
  "id": "141",
  "category": "链表",
  "difficulty": "Easy",
  "title": "环形链表",
  "prompt": "判断单链表是否有环（某节点的 next 最终指向之前的某个节点）。有则返回 true，否则 false；要求空间 O(1)。",
  "diagram": "无环:  1 → 2 → 3 → null\n       slow:1,2,3   fast:1,3,null → fast先到null ⇒ False\n\n有环:  1 → 2 → 3 → 4 ↩(指回2)\n       slow:1,2,3,4,2,...\n       fast:1,3,2,4,3,...  (环内追上slow) ⇒ True",
  "quickAnswer": "Floyd 快慢指针：有环时快指针最终追上慢指针。",
  "approach": "Floyd 快慢指针：有环时快指针最终追上慢指针。",
  "explanationFocus": "环形链表：Floyd 快慢指针：有环时快指针最终追上慢指针。",
  "bruteForce": "《环形链表》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。",
  "invariant": "链表处理中始终保留 环形链表：Floyd 快慢指针：有环时快指针最终追上慢指针。 所需的已处理链段入口和未处理链段入口。",
  "walkthrough": "演练《环形链表》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。",
  "derivation": [
    "用集合记录访问过的节点能判断环，但需要 O(n) 额外空间。",
    "关键观察：若链表有环，fast 比 slow 快一步，二者在环内的距离每轮减少 1，因此 fast 必然在有限轮内追上 slow。",
    "若没有环，fast（或 fast.next）会先变成 None，循环结束返回 False，不会无限进行。"
  ],
  "edgeCases": [
    "空链表：直接返回 False。",
    "单节点自环（head.next = head）：第一轮就相遇，返回 True。",
    "无环但较长：fast 先到 None，正确返回 False。"
  ],
  "code": "# Python\nclass ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast: return True\n    return False",
  "codeNotes": [
    "节点重连前先保存 next，避免断链。",
    "dummy 节点能统一头部变化的分支。"
  ],
  "complexity": "时间 O(n)，空间 O(1)。若有环，fast 最多绕环不到一圈就会追上 slow；若无环，fast 先到末尾。只用到两个指针。",
  "followUps": [
    {
      "question": "相遇为什么一定发生在环里？",
      "answer": "无环链表不会重复访问节点，fast 只会一路走向 None，不可能回头碰到 slow；只有存在环时两者才会在环内相遇。"
    },
    {
      "question": "能不能顺便算出环长？",
      "answer": "可以。在首次相遇点固定一个指针，让另一个继续走，到再次相遇所走的步数就是环长。"
    }
  ],
  "followUpAnswers": [
    "多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。",
    "只保留后续操作需要的边界节点或缓存窗口。"
  ],
  "pitfalls": [
    "循环条件写成 while fast，fast 走两步时可能访问 None.next 而报错。",
    "用 slow == fast（比较值）而非 slow is fast（比较节点身份）来判断相遇。"
  ],
  "beginnerSummary": "环形链表要求判断一条单链表是否含环（即某个节点的 next 最终指回之前的某个节点）。最经典且省空间的做法是 Floyd 快慢指针：slow 每次走一步，fast 每次走两步。如果无环，fast 会先到达末尾；如果有环，fast 终会在环内追上 slow。",
  "prerequisites": [
    "slow 每轮走一步，fast 每轮走两步，两者从同一头节点出发。",
    "循环条件 while fast and fast.next 保证 fast 走两步时不会访问空节点的 next，避免空指针。",
    "「相遇」指的是 slow is fast（同一节点对象），而不是值相等。"
  ],
  "workedExample": [
    "以 1→2→3→2（3 指向 2 形成环）为例。slow、fast 都从 1 出发，进入环后两者相对距离每轮缩小 1。",
    "若干轮后 fast 在环内追上 slow，函数返回 True。若是 1→2→None，fast 会先到 None，返回 False。"
  ],
  "lineByLine": [
    "slow = fast = head，空表时循环不进入，直接返回 False，安全。",
    "while fast and fast.next: 确保 fast 能安全地走两步，不会在 None 上取 .next。",
    "slow 走一步、fast 走两步；if slow is fast: return True 表示在环内相遇。",
    "循环正常结束（fast 到末尾）则返回 False，说明路径无环。"
  ]
};
