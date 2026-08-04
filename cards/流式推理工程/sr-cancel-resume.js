export default {
  "id": "sr-cancel-resume",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "取消与续传",
  "prompt": "用户在流式生成中途取消（或网络断开），系统应如何干净地取消计算、释放 KV，并在用户重连时从已生成位置无损续传？",
  "quickAnswer": "取消时发取消信号让生成协程退出并异步释放该请求 KV；续传时以“已确认 token 序号”为偏移，服务端从该位置重放剩余生成（命中 prefix KV 缓存可免重算 prompt）。",
  "approach": "给每个流式会话一个 sessionId 与单调递增 offset；客户端取消即关闭流并通知服务端停止；重连携带 sessionId+offset，服务端校验后用 prefix cache 复用已算 KV，从 offset 续推。",
  "explanationFocus": "是什么：流式取消与续传是支持用户中途停止生成并可在重连后从已收到位置继续，而不重算已产出部分、也不重复下发已收 token 的能力。",
  "bruteForce": "朴素做法：取消就直接断连接，但服务端生成协程仍在跑、KV 泄漏；重连只能从头重新生成整段，既浪费算力又让用户看到重复内容。",
  "invariant": "续传后下发的 token 序列必须与“若不取消、一次性生成”的结果在 offset 之后完全一致（相同随机种子或温度下），保证语义连续。",
  "walkthrough": "1) 客户端取消→发 DELETE/cancel 并关流；2) 服务端置 cancelled 标志，生成循环检测后退出并释放 KV；3) 用户重连带 sessionId+offset；4) 服务端命中 prefix KV 从 offset 续 decode；5) 增量事件带绝对序号避免重复。",
  "complexity": "取消释放使显存由“泄漏”变“即时回收”；续传借 prefix cache 把重算降到 O(剩余长度)，几乎零重复成本；代价是需会话状态与序号簿记。",
  "beginnerSummary": "用户中途喊停，系统就真的停并清干净内存；要是又回来，就凭“上次到第几个字”接着写，不重头来过、也不把已看的字再发一遍。",
  "diagram": "取消: Client ==cancel==> Server: 停生成+释放KV\n续传: Client <sessionId,offset> ==> 命中prefixKV ==> 从offset续推",
  "code": "def resume(session_id, offset):\n    sess = sessions[session_id]\n    kv = load_prefix_kv(sess, offset)        # 复用已算KV\n    for tok in model.decode_from(kv, offset):\n        if sess.cancelled: break\n        yield {'seq': offset + tok.i, 'text': tok.text}\n\ndef cancel(session_id):\n    sessions[session_id].cancelled = True     # 生成循环检测退出",
  "derivation": [
    "为什么需要：用户常中途取消或网络抖动断连，若不处理会算力浪费、KV 泄漏、重连重复，体验与成本都差。",
    "怎么实现：会话带 sessionId+offset，取消发信号让协程退出并释放 KV；重连携偏移，服务端用 prefix cache 复用已算 KV 从 offset 续 decode。",
    "有什么代价：需维护会话状态与序号簿记，prefix cache 占用额外显存；并发续传需做幂等与并发控制防双推。",
    "怎么评测：模拟取消-重连，校验续传结果与一次性生成在 offset 后逐 token 一致、KV 在取消后立即释放、无重复下发。"
  ],
  "edgeCases": [
    "重连时会话已过期（KV 被淘汰）：需重新 prefill 或提示“会话失效请重开”。",
    "取消信号丢失：依赖流关闭事件兜底检测，避免协程空转。",
    "同一会话并发重连：需加锁或单活跃流约束，防双推重复。",
    "温度大于 0 的随机性：续传若重新采样会与原始序列不同，需固定种子或基于已存随机状态续采。"
  ],
  "pitfalls": [
    "取消不释放 KV：大量中断请求累积使显存泄漏，最终拖垮整卡。",
    "续传重置随机种子：导致 offset 之后内容与原始生成不一致，出现“剧情突变”。"
  ],
  "prerequisites": [
    "理解 KV Cache 与 prefix caching 复用机制",
    "了解流式会话状态与幂等重连设计"
  ],
  "workedExample": [
    "示例A：用户在第 200 token 取消，服务端释放该会话 KV，显存立即回落，避免泄漏。",
    "示例B：重连带 offset=200，命中 prefix KV 从 200 续推，剩余 800 token 无需重算 prompt，几乎零额外 prefill。"
  ],
  "lineByLine": [
    "resume：以 session_id 取会话，load_prefix_kv 复用已算 KV 省去重算。",
    "decode_from(kv, offset)：从偏移续 decode，事件带绝对 seq 防重复。",
    "cancel：仅置标志，真正的退出由生成循环检测，保证释放时机安全。"
  ],
  "codeNotes": [
    "真实系统取消常通过关闭底层流触发服务端读错误来中断，示例显式用 cancelled 标志更可控。"
  ],
  "followUps": [
    {
      "question": "续传如何保证和原生成一致？",
      "answer": "在固定温度或种子或持久化随机状态的前提下，从相同 KV 与 offset 续采，结果与一次性生成在 offset 后逐 token 相同。"
    },
    {
      "question": "prefix KV 被淘汰了还能续吗？",
      "answer": "不能无损复用，需重新 prefill 该前缀（有短暂开销）或返回会话失效让用户重开，按策略选择。"
    }
  ],
  "followUpAnswers": [
    "在固定温度或种子或持久化随机状态的前提下，从相同 KV 与 offset 续采，结果与一次性生成在 offset 后逐 token 相同。",
    "不能无损复用，需重新 prefill 该前缀（有短暂开销）或返回会话失效让用户重开，按策略选择。"
  ],
  "kind": "concept"
};
