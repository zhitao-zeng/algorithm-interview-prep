export default {
  "kind": "concept",
  "id": "perf-streaming",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "流式输出（streaming）如何评测",
  "prompt": "大模型流式(SSE/逐 token)输出时，应该如何评测其性能？",
  "quickAnswer": "流式评测要在客户端解析每个 chunk 的时间戳，分别计算 TTFT(首 chunk)、TPOT(相邻 chunk 间隔)、完整端到端时长与总 token 数。关键是按 token 而非请求粒度计时，并区分网络抖动与生成间隔。",
  "approach": "客户端对 SSE 流逐事件打点，统计首包、间隔分布与完成时间，剔除网络重传干扰。",
  "explanationFocus": "是什么：流式评测是对逐 token 返回的流在客户端逐 chunk 打点，测 TTFT/TPOT/总时长，而不是只看请求完成时间。",
  "bruteForce": "只记请求起止时间：把网络传输与逐 token 生成混在一起，看不出首响与流畅度。",
  "derivation": [
    "为什么需要：流式体验由\"多久出第一个字\"和\"出字顺不顺\"决定，需 token 级指标。",
    "怎么实现：用支持 stream 的客户端(async httpx)读 SSE，每收到 data 事件记时。",
    "有什么代价：需处理 SSE 解析、心跳/重传、客户端时钟；token 与字符粒度要统一。",
    "怎么评测：在固定输出长度下统计 TTFT p95 与 TPOT p95，并校验最终完整性。"
  ],
  "invariant": "端到端 ≈ TTFT + Σ(间隔)；流式总 token 应与非流式一致，仅时间分布不同。",
  "walkthrough": "流式输出 200 token，TTFT=180ms，TPOT=18ms，端到端≈3.78s，与非流式 token 数一致。",
  "edgeCases": [
    "SSE 心跳包干扰首包判定。",
    "客户端缓冲批量 flush 使间隔失真。",
    "中途断流需重连重计。"
  ],
  "code": "# Python\ndef stream_metrics(chunks):                  # chunks: [(t, tok)]\n    ttft = chunks[0][0] - chunks[0][1] and chunks[0][0]\n    gaps = [chunks[i][0]-chunks[i-1][0] for i in range(1,len(chunks))]\n    return chunks[0][0], sum(gaps)/len(gaps), chunks[-1][0]",
  "codeNotes": [
    "要正确解析 SSE data 事件。",
    "统一 token 与字符粒度。"
  ],
  "complexity": "O(token 数) 逐事件。",
  "followUps": [
    {
      "question": "流式会拖慢总吞吐吗？",
      "answer": "通常不会，生成本身不变；但逐 chunk 网络开销与客户端处理略增，影响可忽略。"
    },
    {
      "question": "如何区分网络抖动和生成慢？",
      "answer": "对比服务端生成间隔日志与客户端接收间隔，差值即网络/缓冲抖动。"
    }
  ],
  "followUpAnswers": [
    "流式基本不降吞吐。",
    "对比服务端日志区分抖动。"
  ],
  "pitfalls": [
    "把网络抖动算进 TPOT。",
    "用请求级计时漏掉首响指标。"
  ],
  "beginnerSummary": "听歌：流式像在线听歌，你要测\"多久出第一个音符\"(TTFT)和\"每个音符间隔稳不稳\"(TPOT)，而不是等整首歌下完再算总时间。逐拍打点才听得出生不生动。",
  "prerequisites": [
    "SSE/分块传输。",
    "TTFT/TPOT 概念。",
    "异步客户端。"
  ],
  "workedExample": [
    "流式 TTFT=180ms, TPOT=18ms, 200 token。",
    "对比服务端日志剔除网络抖动。"
  ],
  "lineByLine": [
    "建立流式连接。",
    "每收到 chunk 记时间戳。",
    "算 TTFT 与间隔分布。",
    "校验最终完整性。"
  ],
  "diagram": "请求 → SSE流: [t0 c1][t1 c2]...[tn cN]\n          TTFT=t0   TPOT=ti-t{i-1}"
};
