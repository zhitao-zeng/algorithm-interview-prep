export default {
  "id": "ll-reverse",
  "category": "链表",
  "difficulty": "Easy",
  "title": "反转链表",
  "prompt": "给定单链表的头节点 head，将其反转并返回新的头节点。例如，输入 1→2→3→4→5，输出 5→4→3→2→1？",
  "quickAnswer": "迭代三指针（prev、cur、nxt）逐个把 cur.next 指向 prev；时间 O(n)，空间 O(1)。",
  "approach": "遍历时暂存下一个节点，反转当前指针方向，prev、cur 各前进一步。",
  "explanationFocus": "是什么：反转链表是把每个节点的 next 指针从指向后一个改为指向前一个；用 prev/cur/nxt 三指针在遍历中就地改写方向，最后 prev 成为新头。",
  "bruteForce": "把链表值收集到列表再反向重建一个新链表。",
  "invariant": "遍历到 cur 时，prev 始终是“已反转部分”的新头，cur 指向“尚未反转部分”的头，nxt 保存 cur 的下一个以免断链。",
  "walkthrough": "1→2→3。初始 prev=None,cur=1：nxt=2, 1.next=None, prev=1,cur=2；nxt=3,2.next=1,prev=2,cur=3；nxt=None,3.next=2,prev=3。返回 3→2→1。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return prev",
  "complexity": "时间 O(n)，空间 O(1)。",
  "beginnerSummary": "像把一列人手拉手的人逐个转身，每人转身后抓住前面那个人，最后队尾变成队首。",
  "diagram": "1 -> 2 -> 3 -> None\nprev=None cur=1\n1) 1.next=None, prev=1\n2) 2.next=1, prev=2\n3) 3.next=2, prev=3\n结果: 3->2->1",
  "derivation": [
    "为什么需要：单链表只能单向访问，反向需改写每个 next。",
    "怎么实现：三指针暂存下一个，反转并前移。",
    "有什么代价：O(1) 额外空间，原地完成。",
    "怎么评测：空表、单节点、多节点、两节点用例。"
  ],
  "edgeCases": [
    "head 为空返回 None。",
    "单节点反转后仍是自身。",
    "两节点 1→2 反转为 2→1。",
    "长链不溢出（O(1) 空间）。"
  ],
  "pitfalls": [
    "反转前未保存 cur.next 导致断链丢失后继。",
    "循环结束返回 cur（已为 None）而非 prev（新头）。"
  ],
  "prerequisites": [
    "单链表与 next 指针",
    "多变量交换/暂存",
    "迭代遍历"
  ],
  "workedExample": [
    "1→2→3→None 反转得 3→2→1→None。",
    "空链表返回 None，单节点返回自身。"
  ],
  "lineByLine": [
    "prev=None, cur=head 初始化。",
    "nxt=cur.next 暂存后继防断链。",
    "cur.next=prev 反转当前指针。",
    "prev=cur, cur=nxt 两指针前移。",
    "循环结束 prev 即新头返回。"
  ],
  "codeNotes": [
    "核心是先存 nxt 再改 cur.next，顺序不能反。"
  ],
  "followUps": [
    {
      "question": "如何用递归反转？",
      "answer": "递归到尾节点作为新头，回溯时令 head.next.next=head 并置 head.next=None。"
    },
    {
      "question": "如何反转前 k 个节点？",
      "answer": "在 k 处断开，对前 k 个做反转，再把反转段尾接回剩余链表。"
    }
  ],
  "followUpAnswers": [
    "递归到尾节点作为新头，回溯时令 head.next.next=head 并置 head.next=None。",
    "在 k 处断开，对前 k 个做反转，再把反转段尾接回剩余链表。"
  ],
  "kind": "code"
};
