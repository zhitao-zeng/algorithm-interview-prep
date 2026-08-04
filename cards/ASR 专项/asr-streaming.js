export default {
  "id": "asr-streaming",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "端侧流式 ASR 生命周期与解码",
  "prompt": "把端侧具身短指令流式 ASR 拆为音频生命周期、VAD、DDS、解码四层后，如何修正 drain/flush、pre-roll 与常驻 session 陷阱？",
  "quickAnswer": "把流式拆为音频生命周期、VAD、DDS、解码四层：VAD 管起止、DDS 增量解码、静音 force-flush 落空时回退 whole-buffer，并区分 drain/flush、补 pre-roll、常驻 session 用完复位。",
  "code": "def streaming_decode(frame, session, vad, dds, fallback_to_whole=True):\n    \"\"\"端侧流式 ASR：VAD 触发、DDS 动态分块解码，force-flush 落空则回退整缓冲。\"\"\"\n    if vad.is_speech(frame):\n        session.feed(frame)\n        return dds.step(session)\n    result = dds.force_flush(session)\n    if not result and fallback_to_whole:\n        return session.decode_whole_buffer()\n    return result",
  "complexity": "时间 O(f)（每帧）/ O(B)（解码，B 为缓冲），空间 O(B)",
  "beginnerSummary": "像边听边写：耳朵（VAD）判断在不在说话，手写（DDS）边听边写，话停了抖一下笔（flush），写不出就整段重读（fallback）。",
  "derivation": [
    "为什么需要：具身短指令要求低延迟流式响应，但 drain/flush 时机错、pre-roll 丢开头、常驻 session 状态污染都会导致空结果或截断。",
    "怎么实现：四层拆分——音频生命周期管资源、VAD 管起止、DDS 动态分块解码、解码层管 flush；force-flush 落空时回退 whole-buffer 解码。",
    "有什么代价：常驻 session 占用端侧内存；fallback 整缓冲增加尾延迟；pre-roll 缓冲增加首字延迟。",
    "怎么评测：在具身指令集测首字延迟与空结果率，force-flush 与 whole-buffer fallback 必须逐步回退，空结果恶化即触发回退。"
  ],
  "edgeCases": [
    "静音段误判为结束触发过早 flush，丢失尾字。",
    "pre-roll 缓冲不足，指令开头被截。",
    "常驻 session 跨轮未重置，上轮状态污染本轮。",
    "force-flush 返回空且 fallback 也空（极短/极噪），需兜底提示。"
  ],
  "pitfalls": [
    "把 drain 与 flush 混为一谈，drain 不清状态导致常驻 session 累积错误。",
    "一味 flush 追求低延迟，空结果率上升却未接 whole-buffer 回退。"
  ],
  "prerequisites": [
    "流式 ASR 与 VAD",
    "动态解码分块（DDS）",
    "端侧 session 生命周期管理"
  ],
  "workedExample": [
    "步骤1：VAD 检测到语音，feed 帧给常驻 session 并由 DDS 逐步出字。",
    "步骤2：VAD 判静音，调用 force_flush 输出尾段。",
    "步骤3：flush 为空则 decode_whole_buffer 回退，避免空结果。"
  ],
  "lineByLine": [
    "if vad.is_speech(frame): 用 VAD 判定当前帧是否语音。",
    "session.feed(frame); return dds.step(session) 语音帧喂入常驻 session 并增量解码。",
    "result = dds.force_flush(session) 静音时强制刷新剩余缓冲。",
    "if not result and fallback_to_whole: return session.decode_whole_buffer() flush 落空回退整缓冲。"
  ],
  "followUps": [
    {
      "question": "drain 和 flush 区别是什么？",
      "answer": "drain 是排空解码器内部状态并复位用于停流，flush 是在不停 session 情况下强制输出当前缓冲文本；混淆二者会让常驻 session 状态残留。"
    },
    {
      "question": "force-flush 空结果为什么要回退 whole-buffer？",
      "answer": "flush 可能因分块边界出错返回空，whole-buffer 用整段重解当作兜底，避免把用户指令判成空导致误操作。"
    }
  ],
  "followUpAnswers": [
    "drain 是排空解码器内部状态并复位用于停流，flush 是在不停 session 情况下强制输出当前缓冲文本；混淆二者会让常驻 session 状态残留。",
    "flush 可能因分块边界出错返回空，whole-buffer 用整段重解当作兜底，避免把用户指令判成空导致误操作。"
  ],
  "invariant": "对任意帧序列，若最终有语音内容，streaming_decode 在静音后必返回非空结果（要么 flush 成功，要么 whole-buffer 回退成功），不会静默丢指令。",
  "walkthrough": "连续语音帧 → 每帧 feed+step 增量出字；末帧后静音 → force_flush 得尾字；若 flush 空 → decode_whole_buffer 返回整句，保证非空。",
  "kind": "code"
};
