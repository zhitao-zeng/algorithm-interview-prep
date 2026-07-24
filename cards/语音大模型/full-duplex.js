export default {
  "kind": "concept",
  "id": "full-duplex",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "全双工语音交互",
  "prompt": "什么是“全双工”语音对话？Moshi / MiniCPM-o 这类系统是怎么做到边听边说的？",
  "quickAnswer": "全双工指模型同时收听与发声（双向并行），不像半双工（对讲机）必须交替。实现要点：把“听流”与“说流”都建模为时间对齐的 token 流，用单一 Transformer 同时预测“对方下一音频 token”和“自己下一音频 token”，并以时间步对齐+打断检测实现自然插话。",
  "approach": "全双工指模型同时收听与发声（双向并行）。实现要点：把“听流”与“说流”都建模为时间对齐的 token 流，用单一模型同时预测双方的下一音频 token，并以时间步对齐+打断检测实现自然插话。",
  "explanationFocus": "全双工=同时听与说；核心是双流 token + 时间对齐 + 打断。",
  "bruteForce": "半双工（ASR→LLM→TTS 串联）必须等说完才能听，无法自然打断。",
  "derivation": [
    "传统级联 ASR→LLM→TTS 是半双工，轮次严格交替。",
    "Moshi 把“用户音频”和“模型音频”都变成 token 流，同一模型同时预测两者。",
    "时间对齐 + 实时打断检测让插话自然，接近真人对话。"
  ],
  "invariant": "任一时刻模型都在维护“听状态”与“说状态”两条并行时间线。",
  "walkthrough": "以 Moshi 的“内心独白”(inner monologue)为例：模型还预测文本 token 辅助语音 token 生成与对齐。",
  "edgeCases": [
    "双方同时说话：需优先级/能量判停一方。",
    "长静音：要判断是思考停顿还是结束。",
    "网络/解码延迟：时间对齐需容忍抖动。"
  ],
  "code": "# Python\ndef full_duplex_step(stream, model, state):\n    listen = model.listen_step(stream.audio, state.listen)   # 持续听\n    if model.barge_in(stream.audio, state):                 # 检测到插话\n        state.speak = model.stop_speaking(state.speak)\n    speak = model.speak_step(state.speak, listen)           # 持续说\n    return listen, speak",
  "codeNotes": [
    "常把文本 token 作为“内心独白”与语音 token 对齐训练。",
    "打断检测可用能量/VAD + 语义完成度。"
  ],
  "complexity": "双流自回归 O((T_u+T_m)·N²·d)，因并行时间线，相比半双工轮次等待显著降低交互延迟。",
  "followUps": [
    {
      "question": "全双工和半双工本质区别？",
      "answer": "半双工严格分时（你说我听、我说你听），全双工双向并行（边听边说），更接近人际对话，需要同时建模两条音频时间线。"
    },
    {
      "question": "MiniCPM-o 怎么处理多模态？",
      "answer": "它在统一框架里同时处理语音、视觉与文本，实时接收用户音视频并实时回应，同样依赖双流/多流时间对齐与低延迟解码。"
    }
  ],
  "followUpAnswers": [
    "用 VAD+语义完成度判断何时打断。",
    "用单一模型联合预测用户/自身音频 token。"
  ],
  "pitfalls": [
    "误把半双工当全双工，体验像对讲机。",
    "打断检测过灵敏导致频繁自停。"
  ],
  "beginnerSummary": "对讲机是“半双工”：你按住说话时听不到对方。真人对话是“全双工”：一边听一边说，还能随时插话。Moshi 这类系统把“对方的语音”和“自己的语音”都变成一串 token，让同一个模型同时预测这两串 token 的下一个，就像左右手同时写两个字。再配上“打断检测”，你一插话它就停，从而实现自然的实时对话。",
  "prerequisites": [
    "半双工=轮流说；全双工=同时说听。",
    "音频可离散成 token 流。",
    "对话需要低延迟与可打断。"
  ],
  "workedExample": [
    "你说到一半改口，系统检测到插话→停掉自己的声音→听你说完再答。",
    "Moshi 同时输出“听 token”和“说 token”，时间步对齐。"
  ],
  "lineByLine": [
    "把用户音频与模型音频分别建模为 token 流。",
    "单一模型并行预测两条流的下一 token。",
    "维护听/说两个时间状态。",
    "打断检测触发停止说、继续听并重规划。"
  ],
  "diagram": "用户音频 ─┐\n            ├─▶ 统一模型 ─▶ 预测[听token|说token]\n模型音频 ─┘        │\n         打断检测◀───┘ (插话时停\"说\",续\"听\")"
};
