export default {
  "id": "ll-intersection",
  "category": "链表",
  "difficulty": "Easy",
  "title": "相交链表",
  "prompt": "给定两个单链表 headA、headB，返回它们相交的起始节点；若不相交返回 None。例如，A: 4→1→8→4→5，B: 5→6→1→8→4→5，相交于节点 8？",
  "quickAnswer": "双指针法：pA、pB 各走自己链表，到尾则换到另一链表头，二者必在相交点或 None 相遇；时间 O(n+m)，空间 O(1)。",
  "approach": "两指针走过 A+B 总长，消除长度差，在交点或末尾同时到达。",
  "explanationFocus": "是什么：让两个指针分别遍历 A 再接 B、遍历 B 再接 A，因走过的总长度相同（lenA+lenB），若有交点必在同一时刻到达交点；无交点则同时到达 None。",
  "bruteForce": "用哈希集合存 A 的所有节点，再遍历 B 找第一个重复节点。",
  "invariant": "pA 与 pB 走过的总步数始终相等；当二者指向同一节点（或同为 None）时停止，此时即为交点或确认不相交。",
  "walkthrough": "A=4→1→8→4→5（len5），B=5→6→1→8→4→5（len6）。pA 走完 A 接 B 头，pB 走完 B 接 A 头；长度差被抵消，二者在节点 8 相遇。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef getIntersectionNode(headA, headB):\n    pA, pB = headA, headB\n    while pA is not pB:\n        pA = pA.next if pA else headB\n        pB = pB.next if pB else headA\n    return pA",
  "complexity": "时间 O(n+m)，空间 O(1)。",
  "beginnerSummary": "像两人分别走两条不同长度的路，走到尽头就接着走对方的路，最终会同时走到交汇口（或一起走到终点）。",
  "diagram": "A: 4->1->8->4->5\nB: 5->6->1->8->4->5\n        ^相交(8)\npA,pB 换路后同达 8",
  "derivation": [
    "为什么需要：长度不同无法直接同步比较。",
    "怎么实现：走完自己换对方头，消除长度差。",
    "有什么代价：O(1) 空间，最多各走两遍。",
    "怎么评测：相交在中段、相交于尾、不相交、一空。"
  ],
  "edgeCases": [
    "不相交返回 None。",
    "相交点恰为尾节点。",
    "其中一个为空链表。",
    "两表完全相同（交点为头）。"
  ],
  "pitfalls": [
    "用 val 相等判断而非 is 身份，误把值相同当相交。",
    "循环条件写成 pA!=pB 但内部未正确处理 None 切换导致死循环。"
  ],
  "prerequisites": [
    "链表遍历",
    "指针身份（is）比较",
    "长度差抵消思想"
  ],
  "workedExample": [
    "A=4→1→8→...,B=5→6→1→8→... 双指针换路后在 8 相遇。",
    "不相交时两指针同时到达 None，返回 None。"
  ],
  "lineByLine": [
    "pA,pB 分别从头出发。",
    "while pA is not pB 继续。",
    "pA 到尾则跳到 headB，否则前移。",
    "pB 同样到尾跳 headA。",
    "相交时二者同为交点节点，返回 pA（即交点或 None）。"
  ],
  "codeNotes": [
    "用 is 比较节点身份而非值；循环出口 pA==pB 既可是交点也可是 None。"
  ],
  "followUps": [
    {
      "question": "若允许用额外空间怎么做？",
      "answer": "把 A 所有节点存入集合，遍历 B 第一个在集合中的节点即交点。"
    },
    {
      "question": "如何先算长度再对齐？",
      "answer": "分别求两表长度，让长表先走差值步，再同步前进找交点。"
    }
  ],
  "followUpAnswers": [
    "把 A 所有节点存入集合，遍历 B 第一个在集合中的节点即交点。",
    "分别求两表长度，让长表先走差值步，再同步前进找交点。"
  ],
  "kind": "code"
};
