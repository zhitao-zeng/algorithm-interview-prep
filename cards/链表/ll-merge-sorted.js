export default {
  "id": "ll-merge-sorted",
  "category": "链表",
  "difficulty": "Easy",
  "title": "合并两个有序链表",
  "prompt": "给定两个升序单链表 l1、l2，将它们合并为一个新的升序链表并返回头节点。例如，l1=1→2→4，l2=1→3→4，合并为 1→1→2→3→4→4？",
  "quickAnswer": "双指针比较两表头，取较小者接到结果；或用递归；时间 O(n+m)，空间 O(1)（迭代）/O(n+m)（递归）。",
  "approach": "用哑节点 + 尾指针，循环比较两表当前节点，接较小的并前移。",
  "explanationFocus": "是什么：合并两个有序链表是每次从两个表头取最小值追加到结果尾部；用哑节点简化头处理，循环到某一表为空后直接接上另一表剩余。",
  "bruteForce": "把两个链表值都收集到数组，排序后重建链表。",
  "invariant": "tail 始终指向结果链表的尾；每次循环后 l1/l2 中至少一个前移，tail 指向已合并部分末尾。",
  "walkthrough": "l1=1→2→4,l2=1→3→4。比较 1 vs1 取 l1 的1；比较 2 vs1 取 l2 的1；比较 2 vs3 取2；比较 4 vs3 取3；比较 4 vs4 取4；接剩余 4。结果 1→1→2→3→4→4。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeTwoLists(l1, l2):\n    dummy = ListNode(0)\n    tail = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 if l1 else l2\n    return dummy.next",
  "complexity": "时间 O(n+m)，空间 O(1)（迭代，不计结果）。",
  "beginnerSummary": "像把两叠排好序的牌，每次翻两张最上面的小牌放到新的一叠，最后把剩下的整叠接上。",
  "diagram": "l1: 1->2->4\nl2: 1->3->4\n合并: dummy->1->1->2->3->4->4",
  "derivation": [
    "为什么需要：两表已序，可线性归并而非重排。",
    "怎么实现：双指针 + 哑节点尾插。",
    "有什么代价：O(1) 额外空间（迭代）。",
    "怎么评测：等长、一长一短、一空、含重复值。"
  ],
  "edgeCases": [
    "其中一个为空，直接返回另一个。",
    "两表都空返回 None。",
    "含大量重复值需稳定接入。",
    "一长一短，短表空后接长表剩余。"
  ],
  "pitfalls": [
    "忘记接剩余链表导致截断。",
    "未用哑节点导致处理头节点需要额外分支。"
  ],
  "prerequisites": [
    "链表遍历与尾插",
    "双指针",
    "哑节点技巧"
  ],
  "workedExample": [
    "l1=1→2→4,l2=1→3→4 → 1→1→2→3→4→4。",
    "l1 为空时直接返回 l2。"
  ],
  "lineByLine": [
    "dummy/tail 初始化，tail 跟踪结果尾。",
    "while l1 and l2 比较两表头。",
    "取较小者接 tail.next 并前移该表。",
    "tail=tail.next 推进尾指针。",
    "循环结束把非空剩余接到 tail.next。"
  ],
  "codeNotes": [
    "哑节点让头节点无需特判；末尾 tail.next = l1 or l2 一句接完剩余。"
  ],
  "followUps": [
    {
      "question": "如何递归实现？",
      "answer": "返回较小头节点，并令其 next 递归合并剩余两表。"
    },
    {
      "question": "如何合并 k 个有序链表？",
      "answer": "用优先队列（最小堆）每次取最小头，或两两合并（分治）降低复杂度。"
    }
  ],
  "followUpAnswers": [
    "返回较小头节点，并令其 next 递归合并剩余两表。",
    "用优先队列（最小堆）每次取最小头，或两两合并（分治）降低复杂度。"
  ],
  "kind": "code"
};
