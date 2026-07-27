export default {
  "id": "cs-thread-pool",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "线程池与协程调度",
  "difficulty": "Medium",
  "prompt": "线程池为何能降低开销？work-stealing 如何提升负载均衡？协程相对线程切换开销小在哪？",
  "quickAnswer": "线程池预先创建固定 worker，任务入队后由空闲线程领取，避免频繁创建销毁线程的开销。work-stealing 让空闲线程从繁忙线程的队列尾部\"偷\"任务，提升多核负载均衡。协程是用户态轻量执行单元，切换只需保存少量寄存器而不陷入内核，且栈可动态增长，故远轻于线程。",
  "code": "from collections import deque\nclass ThreadPool:\n    def __init__(self, n):\n        self.q = deque(); self.workers = [start(self._run) for _ in range(n)]\n    def submit(self, f):\n        self.q.append(f)            # 入队\n    def _run(self):\n        while True:\n            f = self.q.popleft()    # 本队列领取\n            if not f: f = steal()   # work-stealing\n            f()",
  "complexity": "O(1) 入队/出队；调度 O(线程数) 窃取",
  "beginnerSummary": "不断新建线程就像每次来活都新招人再开除，太浪费；线程池是\"养一支固定团队\"循环接活，协程则是团队里更轻的\"待办便签\"。",
  "explanationFocus": "是什么：线程池是复用一组预先创建的工作线程来执行提交任务的机制；协程是用户态调度的轻量执行流，调度不依赖内核，切换成本远低于线程。",
  "approach": "核心思路：用任务队列解耦\"提交\"与\"执行\"，worker 循环取任务；多队列配合 work-stealing 平衡负载；用协程把大量并发流放在少量线程上以压榨 IO 与上下文切换成本。",
  "derivation": [
    "为什么需要：线程创建/销毁与上下文切换代价高，海量短任务下吞吐受限。",
    "怎么实现：维护任务队列与 worker 循环；work-stealing 用每线程双端队列，偷取者从别人队尾取。",
    "有什么代价：队列需无锁化以避免成为瓶颈；协程要求显式让出（async/await），阻塞调用会卡住线程。",
    "怎么评测：看任务排队延迟、CPU 利用率、尾延迟与在 IO 密集/计算密集负载下的吞吐。"
  ],
  "edgeCases": [
    "任务阻塞系统调用，占住 worker 导致队列积压（需另配 IO 线程）。",
    "work-stealing 下任务有亲和性需求（如绑 NUMA）时被偷走影响局部性。",
    "协程中误用同步阻塞 API，使整个事件循环停滞。"
  ],
  "pitfalls": [
    "线程池过大反而因竞争与切换降低吞吐。",
    "忘记处理任务异常，导致 worker 静默退出或任务丢失。"
  ],
  "prerequisites": [
    "进程/线程与上下文切换代价",
    "队列与并发数据结构"
  ],
  "workedExample": [
    "4 核机器设 4~8 个 worker，处理 10 万短 HTTP 请求远快于每请求一线程。",
    "某 worker 空闲时从繁忙 worker 的 deque 尾部偷一个长任务，避免空转。"
  ],
  "lineByLine": [
    "self.q = deque()：每个 worker 拥有本地双端任务队列。",
    "submit：把任务追加到提交者所在队列尾部。",
    "popleft()：worker 优先从自己队列头部取任务，局部性好。",
    "steal()：自己为空时从别处队尾偷，减少冲突、均衡负载。"
  ],
  "followUps": [
    {
      "question": "协程切换到底省了什么？",
      "answer": "省去内核态切换、TLB/页表切换与内核调度器开销，只保存用户态寄存器与栈指针，且栈可远小于线程栈。"
    },
    {
      "question": "什么时候不应使用协程？",
      "answer": "存在大量不可让出的 CPU 密集计算、或强依赖原生线程局部状态（TLS）且无法改写的库时，协程收益有限甚至有害。"
    }
  ],
  "followUpAnswers": [
    "省去内核态切换、TLB/页表切换与内核调度器开销，只保存用户态寄存器与栈指针，且栈可远小于线程栈。",
    "存在大量不可让出的 CPU 密集计算、或强依赖原生线程局部状态（TLS）且无法改写的库时，协程收益有限甚至有害。"
  ],
  "order": 5
};
