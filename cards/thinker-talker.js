export default {
  "kind": "concept",
  "id": "thinker-talker",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "Thinker-Talker 双塔结构",
  "prompt": "什么是 Thinker-Talker（思考者-说话者）结构？它解决了语音大模型什么痛点？",
  "quickAnswer": "Thinker 是“慢思考”模块，基于音频/文本输入做语义理解、规划与决策（输出高层语义表示）；Talker 是“快说”模块，以 Thinker 的表示为条件自回归生成语音 unit/波形。两者解耦，使“想清楚”与“说流畅”分开优化，支持低延迟流式双工。",
  "approach": "Thinker 是“慢思考”模块，基于音频/文本输入做语义理解、规划与决策；Talker 是“快说”模块，以 Thinker 的表示为条件自回归生成语音 unit/波形。两者解耦，支持低延迟流式双工。",
  "explanationFocus": "Thinker 负责语义/规划，Talker 负责语音合成；解耦快慢路径。",
  "bruteForce": "单塔直接输入到输出，思考与发声耦合，难做流式与打断。",
  "derivation": [
    "让同一个模型既深思又速说，训推都难且延迟高。",
    "拆成 Thinker（重、少调用）与 Talker（轻、快自回归）解耦复杂度。",
    "Talker 以 Thinker 隐状态为条件，可边想边说、易打断恢复。"
  ],
  "invariant": "Talker 的任何输出都必须以 Thinker 的高层表示为条件，保证语义一致。",
  "walkthrough": "以 GLM-4-Voice / Qwen-Audio 风格说明：Thinker 出 semantic embedding，Talker 出 acoustic units。",
  "edgeCases": [
    "流式：Talker 需在 Thinker 未出完整结论前就开始发声（chunk 级）。",
    "打断：用户插话时 Talker 需立即停，Thinker 重规划。",
    "多模态：Thinker 可融合文本/图像，Talker 只管语音。"
  ],
  "code": "# Python\ndef thinker_talker(prompt_tokens, thinker, talker):\n    thought = thinker(prompt_tokens)        # 慢思考: 语义/规划\n    speech_units = talker(thought)           # 快说: 自回归声学单元\n    return speech_units",
  "codeNotes": [
    "Thinker 常用大模型主干，Talker 用轻量自回归或流匹配。",
    "条件注入方式：cross-attn 或 concat 隐状态。"
  ],
  "complexity": "Thinker O(L_th·N²·d)（重，调用少）；Talker O(L_sp·n²·d′)（轻，逐帧），整体延迟主要看 Talker 首包时间。",
  "followUps": [
    {
      "question": "Thinker-Talker 和 普通 TTS 条件有何不同？",
      "answer": "TTS 通常以文本为条件；Thinker-Talker 的 Talker 以“模型自己的语义规划”为条件，可携带副语言与对话状态，更像“边想边说”。"
    },
    {
      "question": "为什么利于全双工？",
      "answer": "Thinker 持续接收并理解对方，Talker 持续输出；二者独立节奏，一方停顿/打断不影响另一方调度，天然支持双向同时。"
    }
  ],
  "followUpAnswers": [
    "Talker 用轻量 decoder 降低首包延迟。",
    "打断检测模块直接停 Talker、重置 Thinker 状态。"
  ],
  "pitfalls": [
    "Talker 脱离 Thinker 条件导致答非所问。",
    "Thinker 太重导致首包延迟高。"
  ],
  "beginnerSummary": "想象你边听边说：大脑里有一部分是“想说什么”（慢慢想、想得深），另一部分是“嘴巴怎么说”（快速发声）。Thinker-Talker 就是把这个拆开：Thinker 像“深思者”，负责理解对方、规划回答；Talker 像“说话者”，根据 Thinker 的想法快速把声音发出来。分开后，思考和发声可以并行，还能在对方插话时立刻停嘴重新想，非常适合实时对话。",
  "prerequisites": [
    "实时对话要“边听边说”。",
    "深度思考慢、发声要快。",
    "把“想”和“说”解耦能降低延迟。"
  ],
  "workedExample": [
    "Thinker 听完问题出语义向量；Talker 据此流式吐出“我觉…得…可以”。",
    "用户打断时，Talker 停，Thinker 立刻重新规划。"
  ],
  "lineByLine": [
    "Thinker 接收音频/文本，产出高层语义表示。",
    "该表示作为 Talker 的生成条件。",
    "Talker 自回归生成语音 unit 或波形。",
    "两者异步调度，支持流式与打断。"
  ],
  "diagram": "输入 ─▶ [Thinker 慢思考] ─▶ 语义向量 ─▶ [Talker 快说] ─▶ 语音\n            (重/少调用)              │条件        (轻/流式)\n                                     └──────────┘"
};
