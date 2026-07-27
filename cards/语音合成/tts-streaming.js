export default {
  "id": "tts-streaming",
  "kind": "concept",
  "category": "语音合成",
  "title": "流式 TTS：chunk 级合成与首包延迟",
  "difficulty": "Medium",
  "prompt": "请说明流式 TTS 的工作原理，如何做 chunk 级合成、降低首包延迟，以及与 ASR 的全双工联动？",
  "quickAnswer": "流式 TTS 把长文本切分为 chunk（句子/短语级）逐块合成并边合成边播放，首包延迟取决于前端分块与前几帧生成耗时而非整句。常用前缀/增量解码、上下文窗口、以及声码器流式上采样实现低延时。与 ASR 全双工联动时，用打断检测（VAD/端点）在用户插话时立即停止当前播放并切换状态，形成双向实时对话。",
  "explanationFocus": "是什么：流式 TTS（streaming TTS）指模型不必等整句文本到齐、也不等整句合成完，而是边接收文本边分块合成、边把已生成的音频推给播放器。它与‘整句合成后播放’相对，目标是把首包延迟（Time-to-First-Audio，TTFA）和端到端时延压到可对话级别（通常 < 300ms）。",
  "approach": "核心思路是‘分块 + 增量 + 即时播放’：前端按语义边界（标点/句子）切 chunk，声学模型对每个 chunk 做带左/右上下文的局部合成，声码器以流式窗口上采样输出波形帧；同时维护播放缓冲与打断信号，一旦收到 ASR 的打断事件就清空缓冲并停止生成，实现全双工。",
  "code": "import queue\n\ndef streaming_synthesize(text_stream, tts_model, chunker):\n    audio_q = queue.Queue()\n    for chunk in chunker.iter(text_stream):         # 按标点切分 chunk\n        mel = tts_model.acoustic(chunk, context=chunker.context)\n        for wav in tts_model.vocoder.stream(mel):    # 流式声码器逐段产出\n            audio_q.put(wav)                         # 边合成边播放\n    return audio_q\n\ndef on_user_interrupt(audio_q, gen_task):\n    gen_task.cancel()                                # 打断：停止生成\n    while not audio_q.empty():\n        audio_q.get()                                # 清空缓冲，立即让出话权",
  "complexity": "O(C) 个 chunk 各自 O(T_c)；首包延迟 ~ O(T_first_chunk)，与句长解耦",
  "beginnerSummary": "普通 TTS 要等整句话说完才出声，对话时显得迟钝。流式 TTS 像边想边说：来一小段就先念出来，别人一插话就立刻闭嘴，从而做到像真人一样实时对话。",
  "derivation": [
    "为什么需要：对话/导航/实时播报场景要求低延迟与可打断，整句合成延迟不可接受。",
    "怎么实现：文本按语义边界分 chunk；声学模型支持增量/前缀解码并在 chunk 边界做上下文拼接；声码器以滑动窗口流式上采样；播放与生成用队列解耦，配合 VAD 打断。",
    "有什么代价：chunk 边界易出现韵律断点、音色/能量不连续；右上下文缺失会让结尾帧质量下降；并发与缓冲管理复杂，需防卡顿与爆音。",
    "怎么评测：首包延迟 TTFA、端到端时延、打断响应时间、以及边界自然度 MOS。"
  ],
  "edgeCases": [
    "chunk 在词中间切断：需基于词/子句边界而非定长切分。",
    "用户极快连续打断：需幂等取消与状态机防止竞态。",
    "网络抖动导致 chunk 乱序：需重排或背压。",
    "末 chunk 缺少右上下文：可用轻量预测尾音避免突兀截断。"
  ],
  "pitfalls": [
    "为降延迟把 chunk 切太碎，破坏韵律短语导致‘一字一顿’。",
    "忽略播放缓冲与生成的速率匹配，造成欠载（卡顿）或过载（延迟累积）。"
  ],
  "prerequisites": [
    "TTS 声学模型与声码器基础",
    "流式系统与队列/背压概念",
    "VAD 与端点检测（用于打断）"
  ],
  "workedExample": [
    "输入长文本流‘请…帮我查一下…今天的天气’，按‘请/帮我查一下/今天的天气’分三 chunk，第一 chunk 合成后即播放，用户中途说‘不用了’触发打断清空缓冲。",
    "声码器维护 200ms 滑动窗口，每收到一段 mel 就输出对应波形帧，播放器从队列取帧，TTFA 仅取决于首 chunk 处理时间。"
  ],
  "lineByLine": [
    "streaming_synthesize：用 chunker 把文本流切成语义 chunk，避免破坏韵律。",
    "acoustic：对单 chunk 做带上下文的局部合成得到 mel。",
    "vocoder.stream：流式声码器逐段产出波形并放入 audio_q，实现边合成边播放。",
    "on_user_interrupt：取消生成任务并清空队列，立即释放话权以响应打断。"
  ],
  "followUps": [
    {
      "question": "流式 TTS 如何在 chunk 边界保持韵律连贯？",
      "answer": "常用做法是为每个 chunk 引入左/右上下文窗口（前后若干词）参与合成，或用语义边界感知的分块；声码器用重叠-相加的流式窗口抹平边界，并在句末显式预测尾音拖尾。"
    },
    {
      "question": "全双工对话中 TTS 与 ASR 如何协调状态？",
      "answer": "用对话状态机管理‘听/想/说/打断’：ASR 检测到用户语音活动（VAD+端点）即发打断事件，TTS 侧停止生成并清空播放缓冲，ASR 进入识别态，识别完成后触发下一轮合成，形成双向实时环路。"
    }
  ],
  "followUpAnswers": [
    "常用做法是为每个 chunk 引入左/右上下文窗口（前后若干词）参与合成，或用语义边界感知的分块；声码器用重叠-相加的流式窗口抹平边界，并在句末显式预测尾音拖尾。",
    "用对话状态机管理‘听/想/说/打断’：ASR 检测到用户语音活动（VAD+端点）即发打断事件，TTS 侧停止生成并清空播放缓冲，ASR 进入识别态，识别完成后触发下一轮合成，形成双向实时环路。"
  ]
};
