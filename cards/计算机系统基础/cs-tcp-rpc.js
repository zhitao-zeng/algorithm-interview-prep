export default {
  "id": "cs-tcp-rpc",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "TCP/RPC 与网络传输",
  "difficulty": "Medium",
  "prompt": "一次 RPC 调用在网络层经历了什么？请讲清 TCP 三次握手、拥塞控制、序列化与寻址？",
  "quickAnswer": "RPC 先通过 DNS/服务发现得到对端地址，TCP 三次握手建立连接，随后把方法名与参数序列化（如 Protobuf）成字节流发送。TCP 用慢启动、拥塞避免、快重传/快恢复来防止网络过载，并靠滑动窗口做流量控制。服务端反序列化执行后回传结果。",
  "code": "def rpc_call(stub, addr, req):\n    sock = connect(addr)            # 三次握手\n    payload = serialize(req)        # Protobuf/Thrift\n    sock.send(payload)\n    resp = sock.recv()              # 可靠按序交付\n    return deserialize(resp)",
  "complexity": "握手 O(1) 往返；吞吐受拥塞窗口增长曲线约束",
  "beginnerSummary": "RPC 就像打电话：先拨号接通（握手），把要说的话编码成语音（序列化）传过去，对方听懂回话，全程保证不丢不乱序。",
  "explanationFocus": "是什么：RPC（远程过程调用）让程序像调用本地函数一样调用远端服务；TCP 提供面向连接、可靠、按序的字节流传输，二者配合构成分布式系统的基础通信。",
  "approach": "核心思路：用服务发现完成寻址，TCP 握手建连并用拥塞/流量控制保障稳定传输，序列化框架把结构化参数编码为跨语言字节流，stub 屏蔽网络细节。",
  "derivation": [
    "为什么需要：单机算力有限，需把调用跨机器分发，又要隐藏网络复杂性。",
    "怎么实现：地址解析+建连+序列化+传输+反序列化+结果返回，常用 Protobuf/Thrift。",
    "有什么代价：序列化有 CPU 与体积开销；握手与丢包重传引入延迟；连接保活消耗资源。",
    "怎么评测：看 RTT、QPS、长尾延迟、序列化大小与在丢包网络下的稳定性。"
  ],
  "edgeCases": [
    "TCP 队头阻塞：一个包丢失拖慢同连接后续所有请求，HTTP/2 多路复用仍受其困。",
    "TIME_WAIT 堆积占满端口，导致无法新建连接。",
    "序列化版本不兼容，旧客户端读新字段失败。"
  ],
  "pitfalls": [
    "在无连接/短连接场景下反复握手，浪费 RTT。",
    "忽略粘包：TCP 是字节流，必须靠长度前缀或分隔符正确切分消息。"
  ],
  "prerequisites": [
    "TCP 可靠传输与滑动窗口",
    "序列化协议（JSON/Protobuf）"
  ],
  "workedExample": [
    "客户端调用 user.get(123)：stub 序列化为 Protobuf，服务端反序列化查库返回。",
    "网络丢包时 TCP 快重传补发，应用层无感知，仅延迟略增。"
  ],
  "lineByLine": [
    "connect(addr)：触发三次握手，确立双向序号与窗口。",
    "serialize(req)：把结构化请求编码为语言无关的字节流。",
    "sock.send：交由 TCP 分段、编号并按拥塞窗口发送。",
    "deserialize(resp)：服务端执行后回传，客户端解码为对象。"
  ],
  "followUps": [
    {
      "question": "为什么需要四次挥手而不是三次？",
      "answer": "因为 TCP 全双工，关闭需双方各自 FIN/ACK：一方发 FIN 表示不再发，另一方可能还有数据要发，故 ACK 与 FIN 分开，共四次。"
    },
    {
      "question": "拥塞控制慢启动为何是指数增长？",
      "answer": "每收到一个 ACK 就增加一个 MSS 的窗口，一个 RTT 内窗口翻倍，目的是快速探测可用带宽，直到阈值后转线性避免过载。"
    }
  ],
  "followUpAnswers": [
    "因为 TCP 全双工，关闭需双方各自 FIN/ACK：一方发 FIN 表示不再发，另一方可能还有数据要发，故 ACK 与 FIN 分开，共四次。",
    "每收到一个 ACK 就增加一个 MSS 的窗口，一个 RTT 内窗口翻倍，目的是快速探测可用带宽，直到阈值后转线性避免过载。"
  ]
};
