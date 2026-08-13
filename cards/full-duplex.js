export default {
  kind: 'concept',
  id: 'full-duplex',
  category: '语音大模型',
  difficulty: 'Hard',
  title: '全双工语音交互',
  prompt: '全双工语音对话与“支持打断的 ASR→LLM→TTS”有什么区别？Moshi 的多流建模怎样处理重叠说话？',
  quickAnswer: '支持打断不一定等于全双工。全双工要求系统在自己发声时仍持续建模用户输入，并能处理重叠、插话和附和。Moshi 的做法是把用户语音和系统语音建成两条并行 token 流，再用分层的文本、语义和声学 token 生成保持实时性；这是一个代表方案，不是所有系统唯一实现。',
  approach: '先区分能力定义，再讲实现：半双工按轮次切换；级联系统可以额外做 barge-in；原生全双工模型则持续维护用户流和系统流，并在同一时间轴上建模两边是否说话。',
  explanationFocus: '关键不是有没有 VAD，而是系统说话时是否仍在持续理解用户，以及能否学习真实的重叠对话动态。',
  bruteForce: '传统级联在“系统播放”阶段暂停理解，只用一个 VAD 触发停止播放；它能支持打断，却不一定理解重叠区间里用户说了什么。',
  derivation: [
    '为什么需要：真实对话包含附和、抢话、短暂停顿和双方同时发声，严格轮次切分会丢失这些互动。',
    '怎么实现：以 Moshi 为例，用户与系统各占一条并行音频 token 流，模型同时处理两条时间线，并用 Inner Monologue 的文本前缀提升语言质量。',
    '有什么代价：需要双声道或可分离的训练数据、稳定的回声消除和更复杂的状态管理；重叠语音评测也比单轮准确率难。',
    '怎么评测：除了首包延迟，还要测插话检测、停止播放时间、重叠区间内容保留、错误打断率和长对话状态恢复。',
  ],
  invariant: '系统播放期间，用户输入流不能被关闭；否则最多是支持打断的半双工。',
  walkthrough: '系统正在回答时，用户说“等等，改成明天”。全双工系统应停止旧答案，同时保留并理解“改成明天”，而不是只检测到有声音。',
  edgeCases: [
    '设备把扬声器回声当成用户语音，形成自我打断。',
    '用户只说“嗯”表示附和，不应总被判成抢话并终止回答。',
    '网络抖动使两条流时间戳错位，模型会把先后关系判断错误。',
  ],
  code: "def duplex_event(user_chunk, playback_ref, state):\n    clean_user = state.aec.remove_echo(user_chunk, playback_ref)\n    event = state.turn_detector.update(clean_user)\n    state.user_stream.append(clean_user)\n    if event == 'interrupt':\n        state.output.cancel_unplayed()\n    return state.dialogue_model.step(state.user_stream, state.output_stream)",
  codeNotes: [
    '这段草图强调回声消除、持续收听和取消未播放内容。',
    '原生多流模型与工程级联状态机的内部实现不同，但验收能力可以用同一组场景描述。',
  ],
  complexity: '成本取决于是否同时解码双流、音频 token 帧率和缓存长度。不能把流式缓存笼统写成常数空间；长对话仍需要窗口、压缩或状态淘汰。',
  followUps: [
    { question: '有 barge-in 就算全双工吗？', answer: '不一定。若系统只检测“有人说话”后停播，却没有持续建模重叠语音的内容，仍更接近可打断半双工。' },
    { question: 'Moshi 的 Inner Monologue 做什么？', answer: '它把时间对齐的文本 token 作为音频 token 的前缀或层级条件，在保持流式的同时提高语言内容质量。' },
  ],
  followUpAnswers: [
    '能力验收要覆盖持续收听、重叠理解和恢复，而不只测停止播放。',
    'Moshi 是多流实现样例，不能泛化为所有全双工系统的唯一架构。',
  ],
  pitfalls: [
    '把“能被 VAD 打断”直接等同于全双工。',
    '忽略扬声器回声，模型会听见自己并误触发。',
  ],
  beginnerSummary: '对讲机式系统一次只能一边说。支持打断的助手会在听见你插话后停下，但它不一定听懂重叠时你说了什么。真正的全双工更像电话：系统说话时仍一直听你，并能处理“嗯”“等等”“改一下”这些重叠互动。',
  prerequisites: [
    '流式系统：把音频分块处理，并持续维护缓存与会话状态。',
    'VAD 与端点检测：判断哪里有语音，但不等同于理解内容。',
    '回声消除：用播放参考信号减少设备听到自己的声音。',
  ],
  workedExample: [
    '示意：模型说“周五有雨”，用户重叠说“我问的是周六”；系统应停止旧音频并把“周六”带入新一轮。',
    '对照测试：只说“嗯”时继续回答；说“停”时立即停止；说“等等改成周六”时停止并正确重规划。',
  ],
  lineByLine: [
    '先用播放参考做回声消除。',
    '无论系统是否发声，都把用户块送进输入流。',
    '检测到真正的中断意图时取消尚未播放的输出。',
    '对话模型继续读取双流状态并生成新动作。',
  ],
  diagram: '用户语音流 ───────────────┐\n                            ├─▶ 双流对话模型 ─▶ 系统语音流\n系统已播放参考 ─▶ 回声消除 ─┘        ▲\n                       打断 / 附和 / 重叠状态',
  references: [
    { title: 'Moshi: a speech-text foundation model for real-time dialogue', url: 'https://arxiv.org/abs/2410.00037' },
  ],
};
