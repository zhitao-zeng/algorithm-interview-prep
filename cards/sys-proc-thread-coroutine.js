export default {
  "kind": "concept",
  "id": "sys-proc-thread-coroutine",
  "category": "计算机系统基础",
  "difficulty": "Medium",
  "title": "进程、线程和协程有什么区别？Python GIL 对多线程有什么影响？",
  "prompt": "从资源隔离、切换成本、并发模型三个角度对比进程、线程、协程；并解释 CPython GIL 为什么让“多线程 CPU 密集”提速有限，而“多线程 I/O 密集”仍有效。",
  "quickAnswer": "进程拥有独立地址空间、隔离最强但切换/通信开销大；线程共享进程地址空间、切换轻量但需锁保护共享状态；协程在单线程内用户态协作式调度，切换极轻、但任一点阻塞会卡住整个线程。CPython 的 GIL 让同一进程内任意时刻只有一个线程执行 Python 字节码，所以多线程 CPU 密集无法真正并行（只能并发），而 I/O 阻塞时会释放 GIL，故多线程 I/O 密集仍有效。",
  "approach": "按“隔离性 / 调度方 / 切换成本 / 并行能力 / 典型用途”建表对比；再单独讲 GIL：它是保护 CPython 内部对象（引用计数等）的一把全局锁，导致多线程 CPU 密集受限于单核；破法是多进程（multiprocessing）或把密集计算放到释放 GIL 的 C 扩展 / NumPy / PyTorch。",
  "explanationFocus": "关键不是“线程比进程快”这种笼统说法，而是：隔离 vs 共享、内核调度 vs 用户态调度、以及 GIL 只锁“Python 字节码”不锁“系统调用与释放 GIL 的 C 代码”。",
  "bruteForce": "凭直觉说“协程最快、进程最慢”，忽略场景；或认为“Python 多线程没用”，忽略了 I/O 场景。",
  "derivation": [
    "进程：OS 级隔离，地址空间独立，崩溃不波及其他进程，但 IPC 与上下文切换成本高。",
    "线程：同一进程内共享内存，切换只需保存寄存器/栈，成本低，但共享状态需互斥。",
    "协程：单线程内用户态调度，切换几乎零成本，但协作式——遇到阻塞调用会阻塞整个线程。",
    "GIL：CPython 用一把锁保护解释器内部状态，使多线程 CPU 密集只能时间片并发，无法多核并行。",
    "I/O 阻塞会释放 GIL（或进入阻塞系统调用时让出），因此多线程在 I/O 密集下仍具并发收益。"
  ],
  "invariant": "GIL 限制的是“同一进程内 Python 字节码的并行执行”，不限制 I/O 并发，也不限制已释放 GIL 的 C 扩展并行。",
  "walkthrough": "1) 明确并发目标（CPU 密集 or I/O 密集）。2) CPU 密集→多进程或向量化/释放 GIL 的库。3) I/O 密集→多线程或 asyncio 协程都行。4) 高并发网络→协程（asyncio）用单线程承载大量连接。5) 共享状态→线程需锁，协程因单线程通常免锁但要避免 await 间的竞态。",
  "edgeCases": [
    "CPU 密集用多线程：因 GIL 几乎不提速，甚至因切换更慢。",
    "协程里调了阻塞的同步 I/O：会卡住整个事件循环。",
    "误以为 multiprocessing 无开销：进程间内存不共享，传大对象靠 pickle/IPC，开销大。",
    "NumPy/PyTorch 算子内部释放 GIL，所以多线程调它们可并行——与纯 Python 不同。"
  ],
  "code": "import threading, multiprocessing, asyncio, time\n\n# I/O 密集: 多线程仍有效(GIL 在阻塞时释放)\ndef io_task():\n    time.sleep(1)            # 模拟网络/磁盘 I/O, 释放 GIL\n\n# CPU 密集: 多线程受 GIL 限制, 多进程才能真正并行\ndef cpu_task():\n    sum(i * i for i in range(10_000_000))   # 纯 Python, 占 GIL\n\n# 协程: 单线程内并发大量 I/O\nasync def async_io():\n    await asyncio.sleep(1)\n\n# C 扩展释放 GIL: numpy 多线程可并行\nimport numpy as np\ndef np_task():\n    a = np.random.rand(4000, 4000)\n    np.dot(a, a)             # 内部释放 GIL, 多线程可多核",
  "codeNotes": [
    "time.sleep / 网络 I/O 会释放 GIL，所以多线程 I/O 密集仍受益。",
    "纯 Python 循环占 GIL，多线程 CPU 密集无法并行；numpy 算子在 C 层释放 GIL 则可。"
  ],
  "complexity": "进程/线程切换为内核态 O(上下文)；协程切换为用户态 O(极轻)。并行加速取决于是否越过 GIL 与是否真多核。",
  "followUps": [
    {
      "question": "Python 多线程为什么仍适合 I/O？",
      "answer": "网络/磁盘 I/O 或 time.sleep 会释放 GIL，多线程可重叠等待，获得并发收益；GIL 只锁 Python 字节码，不锁阻塞系统调用。"
    },
    {
      "question": "CPU 密集任务怎么办？",
      "answer": "改用多进程（multiprocessing）或把计算放到释放 GIL 的库（NumPy/PyTorch/C 扩展）；纯 Python 循环受 GIL 限制无法多核并行。"
    },
    {
      "question": "NumPy、PyTorch 为什么能绕开部分 GIL？",
      "answer": "它们把密集循环放到 C 层并在计算期间释放 GIL，多线程调用时各线程能跑在不同核上，不受 GIL 限制。"
    },
    {
      "question": "C++ Extension 什么时候应该释放 GIL？",
      "answer": "在扩展里做长时间计算时应释放 GIL（Py_BEGIN_ALLOW_THREADS），否则会阻塞整个解释器、拖垮其他线程。"
    }
  ],
  "followUpAnswers": [
    "I/O 阻塞释放 GIL，多线程可重叠等待，仍获并发收益。",
    "多进程或释放 GIL 的库（NumPy/PyTorch/C 扩展）。",
    "密集循环在 C 层并释放 GIL，多线程可多核并行。",
    "长时间计算时释放 GIL，否则阻塞整个解释器。"
  ],
  "pitfalls": [
    "认为“Python 多线程完全没用”——I/O 密集场景仍有价值。",
    "CPU 密集用多线程期待加速——GIL 下基本无效。",
    "协程里混用阻塞同步调用，卡死事件循环。",
    "忽略多进程的内存/IPC 开销，盲目切换。"
  ],
  "beginnerSummary": "进程=独立内存、最稳但最重；线程=共享内存、轻量但要加锁；协程=单线程内自己切换、最轻但怕阻塞。Python 的 GIL 让多线程做“算数”不能多核并行，但做“等 I/O”仍然有效。",
  "prerequisites": [
    "操作系统基本概念（内核态/用户态）",
    "并发与并行区别",
    "Python 解释器基础"
  ],
  "workedExample": [
    "场景：同时下载 10 个网页。用 threading 起 10 个线程，每个在 requests.get 处释放 GIL，总耗时≈最慢一个，远小于串行。",
    "场景：对 1 亿个数求和。用 threading 多线程几乎不提速（GIL）；改用 multiprocessing 4 进程≈快 4 倍。"
  ],
  "lineByLine": [
    "区分目标：CPU 密集 vs I/O 密集。",
    "CPU 密集→多进程/向量化。",
    "I/O 密集→多线程或 asyncio。",
    "高并发连接→协程。",
    "共享状态→线程加锁，协程注意 await 间竞态。"
  ],
  "diagram": "隔离性:  进程(独立地址空间) > 线程(共享内存) > 协程(单线程)\n调度方:  进程/线程=内核态    协程=用户态(协作)\nGIL:     CPU密集 线程≈串行    I/O密集 线程仍并发    C扩展可释放GIL"
};
