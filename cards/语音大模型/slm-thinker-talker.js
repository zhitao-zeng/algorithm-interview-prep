export default {
  "id": "slm-thinker-talker",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "Thinker-Talker 双模型架构",
  "prompt": "Thinker-Talker（思考-表达分离）架构的核心思想是什么？相比单模型它有什么优势？",
  "quickAnswer": "Thinker 专注高层语义推理产出语义 token/plan，Talker 专注把这些语义流畅地转成语音。两者解耦后推理与发音可独立优化、并发执行，降低延迟并提升自然度（如 Mini-Omni2、GLM-4-Voice 思路）。",
  "code": "def thinker_talker(user_tok, thinker, talker, state):\n    plan = thinker.forward(user_tok, state.kv)  # 1. 思考：语义规划\n    state.semantic = plan.tokens                # 2. 共享语义表征\n    for s in talker.stream(state.semantic):     # 3. 表达：逐段合成\n        yield s                                 # 4. 边思考边说话",
  "complexity": "时间 O(N_think + N_talk)，空间 O(kv_think + kv_talk)",
  "beginnerSummary": "Thinker 像大脑想'该说什么'，Talker 像嘴巴负责'怎么说得好听'，两者分开后想和说可以同时进行，不用想完整句才开口。",
  "derivation": [
    "为什么需要：单模型既要推理又要管声学细节，目标冲突且难以并行，导致延迟高、表达不自然。",
    "怎么实现：拆成 Thinker（自回归语义规划）与 Talker（流式声学合成），Thinker 产出语义 token，Talker 消费并并发发声。",
    "有什么代价：双模型参数量与显存翻倍，需设计两者接口与同步；Talker 依赖 Thinker 输出，错误会传导。",
    "怎么评测：分别测 Thinker 任务准确率与 Talker 的 MOS/实时率 RTF，再测端到端延迟与打断恢复。"
  ],
  "edgeCases": [
    "Thinker 输出语义 token 为空（无内容）时 Talker 需生成静音或礼貌填充。",
    "两者节奏不一致导致 Talker 等待，需要预取与流式对齐。",
    "Thinker 中途改主意（修正语义）需 Talker 支持回退或重说。",
    "低资源设备无法同时驻留双模型需量化或卸载。"
  ],
  "pitfalls": [
    "让 Talker 直接吃 LLM 原始 logits 而非语义 token，接口耦合导致无法独立训练。",
    "忽视双模型同步，Talker 等不到语义而空转浪费算力。"
  ],
  "prerequisites": [
    "自回归生成与流式合成",
    "模型解耦与模块接口设计"
  ],
  "workedExample": [
    "用户问'讲个笑话'，Thinker 先产出笑话文本语义 token，Talker 边接收边用不同语调合成。",
    "Thinker 输出 10 个语义 token 后 Talker 已播完前 4 个，实现思考与表达并行。"
  ],
  "lineByLine": [
    "plan = thinker.forward(user_tok, state.kv)：Thinker 做语义推理得到规划。",
    "state.semantic = plan.tokens：把语义 token 存入共享状态供 Talker 使用。",
    "for s in talker.stream(...)：Talker 以流式方式逐段合成语音。",
    "yield s：边生成边外抛音频，实现边想边说。"
  ],
  "followUps": [
    {
      "question": "Thinker 与 Talker 如何训练？",
      "answer": "常先独立预训练（Thinker 用文本/语义语料，Talker 用语音合成），再用对齐数据做联合微调，必要时加适配器弥合表征 gap。"
    },
    {
      "question": "与单模型 speech LLM 比，延迟真的更低吗？",
      "answer": "Talker 可在 Thinker 出首个语义 token 后即开始合成，首包延迟显著降低，但双模型推理并行带来更高峰值算力，需看是否 batch 友好。"
    }
  ],
  "followUpAnswers": [
    "常先独立预训练（Thinker 用文本/语义语料，Talker 用语音合成），再用对齐数据做联合微调，必要时加适配器弥合表征 gap。",
    "Talker 可在 Thinker 出首个语义 token 后即开始合成，首包延迟显著降低，但双模型推理并行带来更高峰值算力，需看是否 batch 友好。"
  ],
  "explanationFocus": "是什么：Thinker-Talker 架构把语音模型拆成负责高层语义推理的 Thinker 与负责声学表达的 Talker 两个模型，语义与发音解耦、可并发执行。",
  "approach": "让 Thinker 先产出紧凑的语义 token/规划，Talker 流式消费并合成语音，从而实现'边思考边说话'，降低首包延迟并分别优化理解与表达。",
  "kind": "concept"
};
