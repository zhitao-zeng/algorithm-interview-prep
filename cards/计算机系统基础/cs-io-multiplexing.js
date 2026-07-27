export default {
  "id": "cs-io-multiplexing",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "IO 多路复用",
  "difficulty": "Medium",
  "prompt": "高并发网络服务如何用单线程处理成千上万连接？请讲清 select/poll/epoll、边缘与水平触发及 Reactor 模式？",
  "quickAnswer": "IO 多路复用让一个线程同时监视多个文件描述符，就绪后才处理。select/poll 每次全量扫描 fd 集合、开销随连接数线性增长；epoll 用内核事件表，仅返回就绪 fd，复杂度 O(1)。水平触发（LT）重复通知未处理事件，边缘触发（ET）只在状态变化时通知一次，要求非阻塞且一次读完。",
  "code": "from select import epoll\ndef serve(sock):\n    ep = epoll(); ep.register(sock.fileno(), EPOLLIN)\n    while True:\n        for fd, ev in ep.poll():        # 仅返回就绪 fd\n            if fd == sock.fileno():\n                conn, _ = sock.accept()\n                ep.register(conn.fileno(), EPOLLIN | EPOLLET)\n            else:\n                handle(fd)",
  "complexity": "O(就绪事件数)（epoll 轮询）/ O(连接数)（select/poll）",
  "beginnerSummary": "与其给每个连接开一个线程\"死等\"，不如雇一个\"前台\"统一盯着所有连接，谁有数据来了再叫人去处理，这就是 IO 多路复用。",
  "explanationFocus": "是什么：IO 多路复用是一种用一个或少量线程同时监控多个 IO 描述符、只在其中某些就绪时才进行读写的技术，是构建高并发网络服务的基石。",
  "approach": "核心思路：把\"等待多个 IO 就绪\"这件事交给内核，内核用事件机制批量告知就绪的描述符，应用再对非阻塞 fd 做读写，从而避免大量阻塞线程。",
  "derivation": [
    "为什么需要：每连接一线程在多万连接时线程上下文切换与内存开销不可接受，需要少量线程扛高并发。",
    "怎么实现：select/poll 把 fd 集合拷入内核轮询；epoll 在内核维护就绪红黑树与就绪链表，注册后等待即可。",
    "有什么代价：select/poll 每次调用需全量拷贝与遍历；ET 模式要求非阻塞一次读净，否则会丢事件。",
    "怎么评测：看每秒连接数、平均时延、CPU 占用与 C10K/C100K 下的可扩展性。"
  ],
  "edgeCases": [
    "ET 模式未一次读净剩余数据，后续再无事件通知，导致连接\"饿死\"。",
    "epoll 惊群：多个进程/线程同时被唤醒争抢同一连接。",
    "fd 关闭后仍在 epoll 中监控，触发无效事件或 EBADF。"
  ],
  "pitfalls": [
    "在 ET 下用阻塞 IO，读一半阻塞住整个事件循环。",
    "把 select 的 fd_set 大小（默认 1024）当成硬上限而没意识到需要重新编译或改用 epoll。"
  ],
  "prerequisites": [
    "阻塞/非阻塞 IO 与系统调用语义",
    "文件描述符与事件驱动编程模型"
  ],
  "workedExample": [
    "10 万空闲连接、仅 100 个活跃：select 仍要扫 10 万 fd，epoll 只返回 100 个就绪。",
    "LT 下可读事件未读完会再次上报；ET 下只读一次则剩余数据不再触发。"
  ],
  "lineByLine": [
    "ep = epoll()：创建 epoll 实例，内核维护监听树与就绪队列。",
    "ep.register(sock, EPOLLIN)：把监听 socket 加入关注可读事件。",
    "ep.poll()：阻塞直到有 fd 就绪，仅返回就绪项，避免全量扫描。",
    "EPOLLET：对连接采用边缘触发，状态跃迁才通知，需非阻塞一次读净。"
  ],
  "followUps": [
    {
      "question": "Reactor 与 Proactor 的区别？",
      "answer": "Reactor 是\"等就绪再同步读写\"（多路复用+非阻塞），Proactor 是\"内核完成 IO 后回调通知\"（异步 IO，如 io_uring/IOCP）。"
    },
    {
      "question": "epoll 的惊群如何缓解？",
      "answer": "使用 EPOLLEXCLUSIVE 标志或让仅一个 acceptor 监听、worker 用自身 epoll 且不共享监听 fd，配合 reuseport 分散。"
    }
  ],
  "followUpAnswers": [
    "Reactor 是\"等就绪再同步读写\"（多路复用+非阻塞），Proactor 是\"内核完成 IO 后回调通知\"（异步 IO，如 io_uring/IOCP）。",
    "使用 EPOLLEXCLUSIVE 标志或让仅一个 acceptor 监听、worker 用自身 epoll 且不共享监听 fd，配合 reuseport 分散。"
  ]
};
