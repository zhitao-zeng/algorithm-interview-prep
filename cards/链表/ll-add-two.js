export default {
  "id": "ll-add-two",
  "category": "链表",
  "difficulty": "Medium",
  "title": "两数相加（链表）",
  "prompt": "给定两个非空链表，数字按逆序存储（每位一个节点），返回它们之和的新链表。例如，l1=2→4→3（即 342），l2=5→6→4（即 465），和为 807，输出 7→0→8？",
  "quickAnswer": "同步遍历两表，逐位相加并保留进位，最后若有进位补一个节点；时间 O(max(n,m))，空间 O(max(n,m))。",
  "approach": "用哑节点，carry 记录进位，每节点值 (a+b+carry)%10，carry=(a+b+carry)//10。",
  "explanationFocus": "是什么：两个逆序链表表示非负整数，逐位相加并向上一位进位；因逆序存储，表头即个位，正好从左到右按位相加，末尾剩余进位补节点。",
  "bruteForce": "两表遍历成整数相加再按位拆回链表（可能溢出大数）。",
  "invariant": "carry 表示进入当前位的进位；处理完两表与 carry 后，结果链表与输入在数值上一致。",
  "walkthrough": "l1=2→4→3,l2=5→6→4。个位 2+5=7 carry0；十位 4+6=10→写0 carry1；百位 3+4+1=8 carry0；结果 7→0→8。",
  "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef addTwoNumbers(l1, l2):\n    dummy = ListNode(0)\n    cur = dummy\n    carry = 0\n    while l1 or l2 or carry:\n        a = l1.val if l1 else 0\n        b = l2.val if l2 else 0\n        s = a + b + carry\n        carry = s // 10\n        cur.next = ListNode(s % 10)\n        cur = cur.next\n        if l1: l1 = l1.next\n        if l2: l2 = l2.next\n    return dummy.next",
  "complexity": "时间 O(max(n,m))，空间 O(max(n,m)+1)。",
  "beginnerSummary": "像小学竖式加法，从个位开始一位位加，满十向前进一，最后若还有进位就在最前面补一位。",
  "diagram": "  l1: 2->4->3  (342)\n+ l2: 5->6->4  (465)\n=    7->0->8  (807)",
  "derivation": [
    "为什么需要：逆序存储正好对应从低位加起，避免反转。",
    "怎么实现：哑节点尾插，carry 进位，循环含 carry。",
    "有什么代价：新建结果链表 O(max(n,m))。",
    "怎么评测：等长无进位、有进位、长度不等、结果多一位。"
  ],
  "edgeCases": [
    "两表长度不等，短表高位补 0。",
    "末位相加产生新进位（如 5+5→0 carry1 再补 1）。",
    "含全 9 导致连续进位。",
    "单个节点相加。"
  ],
  "pitfalls": [
    "循环条件漏掉 carry，导致最高位进位丢失。",
    "未对空表头取值导致 None.val 报错，需先判空取 0。"
  ],
  "prerequisites": [
    "链表遍历与尾插",
    "进位加法",
    "哑节点"
  ],
  "workedExample": [
    "342+465=807 → 7→0→8。",
    "5+5=10 → 0→1（carry 补节点）。"
  ],
  "lineByLine": [
    "dummy/cur 初始化，carry=0。",
    "循环条件含 l1 or l2 or carry 防止漏进位。",
    "a/b 取当前值，空则补 0。",
    "s=a+b+carry，carry=s//10，节点存 s%10。",
    "cur 前移，l1/l2 非空则前移。"
  ],
  "codeNotes": [
    "循环必须包含 carry，否则最高位进位被丢弃；空表头用 0 代替。"
  ],
  "followUps": [
    {
      "question": "若数字是正序存储怎么改？",
      "answer": "先反转两链表再相加，结果再反转；或递归从尾部处理（需先求长度对齐）。"
    },
    {
      "question": "如何支持负数？",
      "answer": "用符号位节点或先把绝对值相加，再根据符号决定结果符号。"
    }
  ],
  "followUpAnswers": [
    "先反转两链表再相加，结果再反转；或递归从尾部处理（需先求长度对齐）。",
    "用符号位节点或先把绝对值相加，再根据符号决定结果符号。"
  ],
  "kind": "code"
};
