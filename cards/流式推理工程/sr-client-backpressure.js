export default {
  "id": "sr-client-backpressure",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "客户端背压",
  "prompt": "大模型逐 token 推送速度可能超过客户端渲染或消费速度，该如何在客户端实现背压（backpressure），既不错过 token 也不让内存无限增长？",
  "quickAnswer": "用带缓冲上限的队列 + 消费协程：生产者（网络接收）写入有界队列，消费者（渲染）按自身节奏取；队列满时暂停读取流，从而反向压服务端。",
  "approach": "在客户端把“收”和“用”解耦：网络层收到 token 投入有界缓冲，UI/逻辑层异步消费；缓冲达阈值即暂停 socket 读取或通知服务端降速，避免无限堆积。",
  "explanationFocus": "是什么：客户端背压是当模型推送速度超过消费速度时，客户端用有界缓冲与暂停读取，反向抑制上游发送，防止内存膨胀与卡顿。",
  "bruteForce": "朴素做法：收到 token 就无脑 push 进无限数组并同步重渲染，网络快时数组与 DOM 无限增长，最终主线程卡死或 OOM。",
  "invariant": "无论背压多强，已确认的 token 不能丢失或重复；暂停读取只是暂缓拉取，重连后须从断点续传。",
  "walkthrough": "1) 建 N 容量的有界队列；2) 网络 onData 写入队列，满则暂停 source.read；3) UI 用 requestAnimationFrame 按帧取若干 token 渲染；4) 队列降到低水位恢复读取；5) 断线用偏移续传。",
  "complexity": "空间复杂度由 O(无限) 变为 O(N)（缓冲上限）；时间上消费按渲染帧率恒定，系统稳定。代价是首字到屏延迟略增（受缓冲水位影响）。",
  "beginnerSummary": "模型吐字比屏幕显示快时，先把字放进一个“有限容量的篮子”，篮子满了就先别收，等屏幕消化了再继续收，既不丢字也不爆内存。",
  "diagram": "Net -->[有界队列 N]-->(消费/渲染)\n       满|暂停读取  低水位|恢复\n       内存恒定 O(N)",
  "code": "class BackpressureSink:\n    def __init__(self, n=1024):\n        self.q = collections.deque(maxlen=n)\n    def on_token(self, tok):\n        if len(self.q) >= self.q.maxlen:\n            self.pause_source()      # 反向抑制\n        self.q.append(tok)\n    def consume(self):\n        while self.q:\n            render(self.q.popleft())\n        self.resume_source()",
  "derivation": [
    "为什么需要：推送速率常高于渲染或解析速率，无缓冲控制会导致客户端内存与 DOM 无限增长、主线程卡死。",
    "怎么实现：用有界队列解耦收与用，满则暂停 source 读取或通知降速，消费到低水位再恢复，断线按偏移续传。",
    "有什么代价：缓冲引入轻微到屏延迟；暂停读取需服务端支持（否则只是客户端不读但 TCP 仍在缓冲，治标不治本）。",
    "怎么评测：压测下观察客户端内存曲线是否封顶、帧率是否稳定、断点续传后 token 是否连续无重。"
  ],
  "edgeCases": [
    "服务端不支持暂停：仅客户端不读，TCP 接收缓冲仍会涨，需服务端配合流控或客户端丢弃非关键中间态。",
    "渲染极慢（大段 markdown）：单 token 渲染成本高，应按块而非单字消费。",
    "断线续传：重连后队列需与已确认偏移对齐，避免重复渲染。",
    "突发限速解除：需平滑恢复读取，避免瞬间灌满。"
  ],
  "pitfalls": [
    "用无限队列假装背压：只是把 OOM 推迟，并未真正解耦收/用速率。",
    "暂停读取却不通知服务端：服务端继续推送会填满中间网络缓冲，客户端内存问题转嫁为网关压力。"
  ],
  "prerequisites": [
    "理解流控与背压基本概念（生产者/消费者）",
    "熟悉浏览器事件循环与 requestAnimationFrame"
  ],
  "workedExample": [
    "示例A：模型 200 token/s，渲染 60 token/s，有界队列 N=1024 使内存封顶，约 7s 蓄满后暂停读取反向抑制。",
    "示例B：把按单 token 渲染改为每帧取 8 个，帧率从掉到 20fps 恢复到稳定 60fps。"
  ],
  "lineByLine": [
    "BackpressureSink：用 maxlen 有界 deque 天然限制容量，超界即触发暂停。",
    "on_token：满则 pause_source，实现反向抑制上游。",
    "consume：渲染后恢复读取，形成水位的涨落闭环。"
  ],
  "codeNotes": [
    "真实前端多用 ReadableStream/async iterator 的 pull 语义实现背压，示例用类演示思想。"
  ],
  "followUps": [
    {
      "question": "HTTP/2 有没有内置背压？",
      "answer": "有流级流控窗口，但只在字节层面；应用层 token 背压仍需客户端有界队列加暂停读取来真正限内存。"
    },
    {
      "question": "服务端如何配合？",
      "answer": "服务端监听客户端暂停信号（如 WebSocket 流量控制或 SSE 读取取消），停止 flush 新 token，做到端到端背压。"
    }
  ],
  "followUpAnswers": [
    "有流级流控窗口，但只在字节层面；应用层 token 背压仍需客户端有界队列加暂停读取来真正限内存。",
    "服务端监听客户端暂停信号（如 WebSocket 流量控制或 SSE 读取取消），停止 flush 新 token，做到端到端背压。"
  ],
  "kind": "concept"
};
