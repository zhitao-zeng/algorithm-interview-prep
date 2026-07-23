export default {
  "kind": "concept",
  "id": "sys-lock-atomic",
  "category": "计算机系统基础",
  "difficulty": "Hard",
  "title": "Mutex、Spinlock、Atomic 和 CAS 分别适合什么场景？",
  "prompt": "对比互斥锁、自旋锁、原子操作和 CAS 的适用场景与代价，并解释 ABA 问题与伪共享。",
  "quickAnswer": "Mutex（互斥锁）适合临界区稍长、不希望空耗 CPU 的场景，抢不到就睡眠让出 CPU；Spinlock（自旋锁）适合临界区极短、持锁时间短于一次上下文切换开销的场景，抢不到就忙等（空转），多核下常用；Atomic（原子操作）适合单一变量的简单读-改-写，无锁、由 CPU 指令保证原子性；CAS（Compare-And-Swap）是无锁算法的基础原语，用于实现原子更新，但存在 ABA 问题与循环开销。",
  "approach": "按“是否睡眠 / 是否忙等 / 保护粒度 / 典型开销”对比；再讲 CAS 的 ABA（值从 A→B→A，CAS 误以为没变）与缓解（带版本号/标签指针）；最后讲 False Sharing（多核各自改不同变量却因同缓存行而互相失效）及其对策（对齐/填充）。",
  "explanationFocus": "核心权衡：临界区短→自旋更划算（睡眠的上下文切换比忙等贵）；临界区不确定或较长→睡眠锁更省 CPU。Atomic/CAS 把竞争从“锁”降到“单指令/单字”，但仍要小心 ABA 与缓存行。",
  "bruteForce": "一律用 Mutex，或一律忙等；不区分临界区长度，导致要么 CPU 空转要么上下文切换过多。",
  "derivation": [
    "Mutex：抢不到就入队睡眠，唤醒需上下文切换，适合中长临界区。",
    "Spinlock：抢不到忙等，节省切换但烧 CPU，适合极短临界区与多核（单核下忙等无意义，会饿死持锁者）。",
    "Atomic：CPU 提供原子 RMW 指令（如 x86 LOCK XADD），无锁、最低开销，适合计数器/标志位。",
    "CAS：loop { old=read(); if CAS(addr,old,new) break; }，是无锁栈/队列的基础；失败重试有活锁/饥饿风险。",
    "ABA：CAS 只比较值，若中间 A→B→A 则误判无变化；用版本号/带标签指针解决。",
    "False Sharing：两个核改各自变量却落在同一缓存行，互相 invalidate，性能骤降；用缓存行对齐/填充解决。"
  ],
  "invariant": "锁的选择由“临界区长度 × 是否多核 × 能否容忍 CPU 空转”决定；CAS 需额外机制防 ABA，原子操作不替代对缓存行的关注。",
  "walkthrough": "1) 估算临界区持锁时间。2) 极短且多核→Spinlock 或 Atomic/CAS。3) 中长或不确定→Mutex。4) 单一变量计数/标志→Atomic。5) 无锁结构→CAS + 版本号防 ABA。6) 多核高频写→检查是否 False Sharing，做缓存行对齐。",
  "edgeCases": [
    "单核 CPU 用 Spinlock：忙等会占满 CPU 且饿死持锁线程，应避免。",
    "CAS 循环在高度竞争下重试过多，退化为类锁甚至更慢。",
    "ABA：无锁栈 pop 时若中间节点被弹出又压回，CAS 误判成功导致丢节点。",
    "False Sharing：看似独立的计数器放同一缓存行，多核写导致频繁失效。"
  ],
  "code": "import threading\n\n# Mutex: 临界区较长/不希望空转\nlock = threading.Lock()\ndef with_mutex():\n    with lock:\n        # 临界区(可被调度走, 不烧 CPU)\n        pass\n\n# CAS 思路(Python 受 GIL 保护, 仅示意语义):\n#   loop:\n#     old = read(addr)\n#     if CAS(addr, old, new): break     # 原子: 相等才写\n# Spinlock 示意(真实场景在 C/C++/Rust 多核):\n#   while flag.test_and_set():           # 忙等\n#     pass",
  "codeNotes": [
    "CPython 因 GIL，普通赋值不是真原子；生产要用 threading.Lock 或原子库（C 扩展/atomics）。",
    "Spinlock 在 Python 层意义有限（受 GIL），真实价值在 C/C++/Rust 多核内核或无锁库里。"
  ],
  "complexity": "Mutex 睡眠：上下文切换 O(μs)；Spinlock 忙等：O(临界区)但烧 CPU；Atomic/CAS：单/少量指令，O(1) 但高度竞争下重试成本上升。",
  "followUps": [
    {
      "question": "自旋锁为什么适合短临界区？",
      "answer": "临界区极短、持锁时间小于一次上下文切换开销时，忙等比睡眠+唤醒更便宜；且多核下持锁者能很快释放。"
    },
    {
      "question": "CAS 的 ABA 问题是什么？",
      "answer": "CAS 只比较值：若变量从 A 被改成 B 又改回 A，CAS 误以为没变而成功提交，可能基于过期中间状态。缓解：加版本号或带标签指针。"
    },
    {
      "question": "什么是 False Sharing？",
      "answer": "多个核各自修改不同变量，但这些变量落在同一 CPU 缓存行，写操作相互 invalidate 对方缓存行，造成无谓的缓存一致性流量，吞吐下降。缓解：缓存行对齐/填充。"
    },
    {
      "question": "为什么多线程增加后性能反而下降？",
      "answer": "临界区变长或竞争加剧时，上下文切换、缓存/调度开销超过并行收益；还可能陷入锁竞争、伪共享或频繁 cache 失效。"
    }
  ],
  "followUpAnswers": [
    "临界区极短+多核时，忙等比睡眠+唤醒便宜。",
    "值 A→B→A 被误判无变化；加版本号/带标签指针缓解。",
    "不同变量挤同一缓存行互相 invalidate；对齐/填充缓解。",
    "切换/伪共享/锁竞争开销超过并行收益。"
  ],
  "pitfalls": [
    "单核上用自旋锁，忙等饿死持锁者。",
    "把 CAS 当万能无锁，忽略 ABA 与重试风暴。",
    "忽视 False Sharing，多核计数器莫名变慢。",
    "临界区长却用自旋锁，CPU 空转浪费。"
  ],
  "beginnerSummary": "Mutex=抢不到就睡觉（省 CPU，适合稍长的临界区）；Spinlock=抢不到就空转（适合极短临界区、多核）；Atomic=一条 CPU 指令改一个变量（计数器/标志）；CAS=无锁算法的基石，但要防 ABA（值被改回原样）和伪共享（不同变量挤在同一缓存行互相拖累）。",
  "prerequisites": [
    "进程/线程与上下文切换",
    "CPU 缓存与缓存一致性基础",
    "并发竞态条件"
  ],
  "workedExample": [
    "无锁栈用 CAS 实现 push/pop；若 pop 时节点 A 被另一线程弹出又压回（仍是 A），CAS 误判成功，导致栈结构错乱——这就是 ABA，需版本号。",
    "两个线程各改自己的计数器 c1、c2，但 c1/c2 在同一缓存行，每核写都让对方行失效，吞吐远低于预期——False Sharing，用对齐/填充解决。"
  ],
  "lineByLine": [
    "估算临界区长度。",
    "极短+多核→自旋/原子。",
    "中长→互斥锁。",
    "单变量→原子操作。",
    "无锁结构→CAS+版本号。",
    "多核高频写→查伪共享。"
  ],
  "diagram": "Mutex      : 睡眠锁, 临界区中长, 不烧 CPU\nSpinlock   : 忙等锁, 临界区极短+多核\nAtomic     : 单变量 RMW, 无锁, 最低开销\nCAS        : 无锁原语, 防 ABA(版本号), 警惕伪共享"
};
