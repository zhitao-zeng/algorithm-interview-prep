export default {
  "id": "cs-lock-free",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "锁与无锁编程",
  "difficulty": "Hard",
  "prompt": "多线程竞争共享数据时，互斥锁、自旋锁与无锁（CAS）各自的适用场景？无锁队列如何实现，又为何会有 ABA 问题？",
  "quickAnswer": "互斥锁在拿不到时让线程睡眠，适合临界区长；自旋锁忙等，适合临界区极短且多核场景。无锁用 CAS 原子指令实现，避免死锁与上下文切换，但需处理 ABA（值被改回原值导致 CAS 误判）。无锁队列常用 CAS 推进头/尾指针，并可用版本号或 Hazard Pointer 解决 ABA 与回收。",
  "code": "import threading\ndef push(stack, node):\n    while True:\n        head = stack.head\n        node.next = head\n        if stack.compare_and_swap(\"head\", head, node):  # CAS\n            return  # 成功则入栈，否则重试",
  "complexity": "O(1) 期望（无锁 CAS 重试次数取决于竞争强度）",
  "beginnerSummary": "多个人同时要改同一份数据，锁就像\"排队叫号\"；无锁则像\"不断尝试占坑\"，抢不到就重来，靠硬件原子指令保证不冲突。",
  "explanationFocus": "是什么：锁与无锁是两种并发控制策略——锁通过互斥保证临界区串行，无锁（lock-free）借助 CAS 等原子指令让线程在竞争时重试而非阻塞，保证系统整体前进。",
  "approach": "核心思路：先判断临界区长短选锁类型；需要极致吞吐时改用 CAS 循环实现无锁结构，并用版本号/标记位规避 ABA，用安全回收机制释放旧节点。",
  "derivation": [
    "为什么需要：粗粒度锁带来阻塞、优先级反转与死锁风险，高并发下成为瓶颈。",
    "怎么实现：无锁用 compare-and-swap 原子地\"读-改-写\"，失败则重试；队列/栈用 CAS 推进头尾指针。",
    "有什么代价：CAS 重试在强竞争下退化为忙等；ABA 与内存回收（use-after-free）难以正确处理。",
    "怎么评测：比吞吐、尾延迟、是否无死锁/活锁，以及在多核争用下的可扩展性。"
  ],
  "edgeCases": [
    "ABA：节点 A→B→A，CAS 看到值仍是 A 误以为无变化，实际中间已被改动。",
    "内存回收：无锁结构中旧节点可能被其他线程引用，不能随意 free。",
    "弱内存模型下缺少内存屏障，CAS 之外的读写可能重排。"
  ],
  "pitfalls": [
    "把 CAS 循环写成死循环，强竞争下 CPU 空转且可能活锁。",
    "以为无锁就一定快，忽视了缓存行乒乓（false sharing）与回收开销。"
  ],
  "prerequisites": [
    "原子操作与内存序（memory ordering）",
    "缓存一致性与缓存行（cache line）"
  ],
  "workedExample": [
    "Treiber 栈：CAS 更新 head，push/pop 均 O(1) 且无锁。",
    "无锁队列 Michael-Scott：分别用 CAS 推进 head（出队）与 tail（入队）。"
  ],
  "lineByLine": [
    "head = stack.head：先读当前栈顶（本地快照）。",
    "node.next = head：把新节点指向旧栈顶，准备链接。",
    "compare_and_swap：原子比较 head 是否仍为 head，是则改为 node。",
    "if 成功 return：失败说明被别的线程改了，循环重试。"
  ],
  "followUps": [
    {
      "question": "如何彻底解决 ABA？",
      "answer": "给指针附带版本号/标记位（如带标签指针），每次修改版本自增，CAS 同时比较值与版本；或用语义指针（Hazard Pointer）安全回收。"
    },
    {
      "question": "自旋锁和互斥锁怎么选？",
      "answer": "临界区极短且多核、不希望睡眠切换时用自旋锁；临界区可能较长或会睡眠时用互斥锁，避免浪费 CPU。"
    }
  ],
  "followUpAnswers": [
    "给指针附带版本号/标记位（如带标签指针），每次修改版本自增，CAS 同时比较值与版本；或用语义指针（Hazard Pointer）安全回收。",
    "临界区极短且多核、不希望睡眠切换时用自旋锁；临界区可能较长或会睡眠时用互斥锁，避免浪费 CPU。"
  ],
  "order": 4
};
