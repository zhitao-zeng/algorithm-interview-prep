export default {
  "id": "slm-streaming-duplex",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "流式全双工语音交互",
  "prompt": "什么是流式全双工语音交互架构？相比半双工轮次式对话它要解决哪些核心问题？",
  "quickAnswer": "全双工指模型可同时收听与发声、随时打断；流式指音频分块低延迟处理。核心是用流式 encoder、增量 KV-cache 与打断检测（barge-in）让用户可在模型说话时插话。",
  "code": "from collections import deque\n\ndef duplex_step(stream, state, enc, llm, dec, vad):\n    chunk = stream.read(0.2)          # 200ms 音频块\n    if vad(chunk):                    # 检测到用户插话\n        state.playing.stop()          # 打断当前播报\n        state.buffer = deque()\n    feat = enc(chunk, state.cache)    # 流式增量编码\n    tok = llm.generate(feat, state.kv)# 增量自回归\n    return dec.decode(tok)            # 边生成边播放",
  "complexity": "时间 O(B*d) 每块，空间 O(cache) 流式常数级",
  "beginnerSummary": "半双工像对讲机按完说、说完听；全双工像真人打电话，你随时能插嘴，对方也会立刻闭嘴听你说。",
  "derivation": [
    "为什么需要：轮次式语音助手延迟高、不能打断，体验不自然，全双工才能像人与人对话。",
    "怎么实现：音频按 100~300ms 分块，encoder 与 LLM 用增量 KV-cache 流式处理，并加 VAD/barge-in 检测用户打断。",
    "有什么代价：并行收发需状态管理与回声消除，打断会导致未播完文本浪费，流式对小模型实时性要求高。",
    "怎么评测：用首包延迟、打断响应时间、对话回合成功率与用户主观自然度评分。"
  ],
  "edgeCases": [
    "用户咳嗽或环境噪声误触发打断，需要 VAD 阈值与去抖。",
    "模型正在播放时用户只说半句，需要缓冲与句尾判断再决策。",
    "双向同讲（双方同时说）需回声消除与优先级策略。",
    "网络抖动导致音频块乱序需重排与缓存。"
  ],
  "pitfalls": [
    "忽略回声消除，模型把自身播放声当作用户输入造成自激。",
    "流式分块过大导致首包延迟超标，过小则 encoder 上下文不足。"
  ],
  "prerequisites": [
    "流式推理与 KV-cache 机制",
    "VAD 与语音端点检测"
  ],
  "workedExample": [
    "用户问天气，模型播报中用户说'不用了' → barge-in 停止播放并清空缓冲。",
    "200ms 分块 + 增量 KV-cache 使首包延迟控制在 400ms 内。"
  ],
  "lineByLine": [
    "chunk = stream.read(0.2)：每次读取 200ms 音频块模拟流式输入。",
    "if vad(chunk)：检测到用户新语音则判定为打断。",
    "state.playing.stop()：立即停止当前正在播放的语音。",
    "feat = enc(chunk, state.cache)：用缓存做增量编码而非整段重算。"
  ],
  "followUps": [
    {
      "question": "如何处理回声消除？",
      "answer": "在输入端用播放参考信号做线性回声消除（AEC）并配合 WebRTC 类模块，必要时在特征层做掩码避免自声进入 LLM。"
    },
    {
      "question": "全双工下如何保证语义不被打断破坏？",
      "answer": "维护对话状态机，打断时保留已确认意图、丢弃未播完内容，并用短上下文重跑理解，必要时向用户确认。"
    }
  ],
  "followUpAnswers": [
    "在输入端用播放参考信号做线性回声消除（AEC）并配合 WebRTC 类模块，必要时在特征层做掩码避免自声进入 LLM。",
    "维护对话状态机，打断时保留已确认意图、丢弃未播完内容，并用短上下文重跑理解，必要时向用户确认。"
  ],
  "explanationFocus": "是什么：流式全双工语音交互指系统以低延迟分块处理音频，且能在播放自身语音的同时监听并响应用户插话，实现像真人通话一样的双向自然对话。",
  "approach": "以流式分块 + 增量 KV-cache 保障低延迟，以 VAD/barge-in 检测打断并即时切换收发状态，从而兼顾'边听边说'与'随时打断'。",
  "kind": "concept"
};
