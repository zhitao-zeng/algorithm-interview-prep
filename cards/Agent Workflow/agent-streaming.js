export default {
  "kind": "concept",
  "id": "agent-streaming",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "流式输出与用户体验",
  "prompt": "Agent 的流式输出与用户体验该如何设计？",
  "quickAnswer": "Agent 多步执行慢，需以流式(SSE/WebSocket)逐步回传：先即时显示\"思考中/正在调用X工具\"，再增量吐字、工具状态可视化，最终给完整答案与引用。这把\"等待\"变成\"可见的进展\"，显著降低感知延迟与焦虑；同时要能中途打断与取消。",
  "approach": "即时占位→增量 token→工具状态→可打断取消。",
  "explanationFocus": "是什么：流式输出让 Agent 在执行与生成过程中实时增量地把进展(思考、工具调用、token)推送给用户，提升可感知体验。",
  "bruteForce": "等全部跑完再一次性返回：用户面对空白页数秒到数十秒，易以为卡死。",
  "derivation": [
    "为什么需要：Agent 多轮延迟高，无反馈用户会流失或重复提交。",
    "怎么实现：服务端用 SSE/WebSocket 推送事件(thought/tool_call/token/done)；前端渲染进度；提供停止按钮触发取消。",
    "有什么代价：前后端状态同步复杂；增量渲染需防抖动；取消需清理在途工具调用。",
    "怎么评测：看感知延迟、中断成功率、用户满意度。"
  ],
  "invariant": "推送给用户的中间状态必须真实反映后端进度，不能伪造\"假思考\"。",
  "walkthrough": "问答 Agent：0.1s 出\"检索中\"→0.8s 出\"已查 3 篇\"→逐字吐答案→2s 完成。用户全程可见进展。",
  "edgeCases": [
    "用户中途取消：需中止在途调用。",
    "工具慢：需阶段性占位不空白。",
    "增量渲染闪烁：需合并节流。"
  ],
  "code": "async def stream(agent, q, ws):\n    await ws.send(\"status: thinking\")\n    for ev in agent.run_stream(q):           # 逐步产出事件\n        await ws.send(serialize(ev))         # 增量推送\n        if ws.cancelled:\n            agent.cancel(); break            # 支持打断",
  "codeNotes": [
    "状态事件先于内容推送。",
    "取消要清理在途工具。"
  ],
  "complexity": "流式本身几乎零额外成本，主要是连接与渲染开销。",
  "followUps": [
    {
      "question": "流式会影响正确性吗？",
      "answer": "不影响，只是传输方式；但需保证最终态与中间事件一致，避免\"先说后改\"。"
    },
    {
      "question": "如何支持中途打断？",
      "answer": "前端发取消信号，后端在事件循环检查并终止在途模型/工具调用，释放资源。"
    }
  ],
  "followUpAnswers": [
    "仅传输方式，不改逻辑。",
    "取消信号+终止在途调用。"
  ],
  "pitfalls": [
    "伪造进度欺骗用户。",
    "取消不清理在途调用致资源泄漏。"
  ],
  "beginnerSummary": "流式像外卖跟踪：下单后立刻显示\"商家接单→骑手取餐→配送中\"，你不用干等，知道到哪了；想取消也能马上点。空白等待最让人焦虑。",
  "prerequisites": [
    "有流式通道(SSE/WS)。",
    "Agent 能产出阶段事件。",
    "前端能增量渲染。"
  ],
  "workedExample": [
    "先推\"检索中\"再吐答案。",
    "取消按钮终止在途调用。"
  ],
  "lineByLine": [
    "先发状态占位。",
    "逐步推送事件流。",
    "前端增量渲染。",
    "收到取消则中止。"
  ],
  "diagram": "Agent --events--> WS --> UI(progress)"
};
