export default {
  "id": "sr-kv-evict-stream",
  "category": "流式推理工程",
  "difficulty": "Hard",
  "title": "流式 KV 淘汰",
  "prompt": "在长会话流式推理中，KV Cache 持续增长会撑爆显存，该用什么策略在流式过程中淘汰或压缩 KV 而不明显损害生成质量？",
  "quickAnswer": "常用三类：按窗口保留最近 N 个 token（滑动窗口）、按注意力分数淘汰低贡献 KV（如 H2O/StreamingLLM）、以及量化或驱逐并缓存重要时步。流式中应边生成边评估并异步回收。",
  "approach": "在每层维护 KV 池，按“重要性分数或时间窗口”判定可驱逐项；保留 sink（起始若干 token）与近期窗口，结合预算上限在 decode 步之间异步回收最不重要 KV。",
  "explanationFocus": "是什么：流式 KV 淘汰是在逐 token 生成过程中，依据窗口或重要性主动丢弃或压缩旧 KV，使显存占用有界，从而支撑超长会话。",
  "bruteForce": "朴素做法：不淘汰，所有历史 KV 全部保留，会话越长显存线性增长，最终 OOM 或被迫截断上下文，丢失早期信息。",
  "invariant": "被保留的 KV 集合必须始终包含“全局重要锚点”（如 StreamingLLM 的 sink token），否则长程依赖会被切断导致生成崩坏。",
  "walkthrough": "1) 设 KV 预算 B；2) 每步记录各 KV 的累积注意力分数；3) 超出 B 时，保留 sink + 近期窗口 + Top-k 重要分；4) 异步释放其余 KV 显存；5) decode 继续，注意分数随步更新。",
  "complexity": "淘汰判定 O(序列长×层)，可用近似统计降为摊销 O(1)；收益是把显存由 O(序列长) 变为 O(B)，支持近无限长度。",
  "beginnerSummary": "对话越长，记的“中间草稿”越多会爆显存。办法是边聊边扔掉最不重要的旧内容，但留几个“关键锚点”和最近几句话，保住主线不乱。",
  "diagram": "KV 池 [sink][...old low-score...][recent window]\n       保留 ^^^^^^        驱逐 ^^^^^^^^^^^^     保留 ^^^^^^^^^^",
  "code": "def evict_kv(kv, scores, budget, sink=4):\n    keep = list(range(sink)) + topk(scores[sink:], budget - sink)\n    return [kv[i] for i in sorted(keep)]\n\ndef step(model, kv, tok):\n    kv = evict_kv(kv, model.attn_scores(kv), BUDGET)\n    return model.decode(kv, tok)",
  "derivation": [
    "为什么需要：流式长会话 KV 线性增长会 OOM，必须让显存占用有界才能持续服务。",
    "怎么实现：维护预算 B，按分数或窗口标记可驱逐 KV，保留 sink 与近期窗口，decode 间隙异步回收最不重要项。",
    "有什么代价：错误驱逐会削弱长程依赖与事实一致性；统计分数有开销，需近似与异步化避免拖慢 TPOT。",
    "怎么评测：在长文档 QA/长对话上对比有无淘汰的困惑度与事实准确率，确认预算内质量损失可接受且显存确实封顶。"
  ],
  "edgeCases": [
    "关键事实在很早期的 token：纯滑动窗口会丢，需要 sink 或重要性保护。",
    "分数估计滞后：刚写入的 KV 分数偏低易被误删，需 warm-up 或延迟评估。",
    "多轮工具调用结果：中间 JSON 可能至关重要，不能按普通低分淘汰。",
    "预算 B 过小：质量骤降，需按任务设下限。"
  ],
  "pitfalls": [
    "只看近期窗口丢 sink：会切断长程依赖，生成后期逻辑前后矛盾。",
    "同步淘汰阻塞 decode：在主路径做全量排序会抬高 TPOT，应异步或近似。"
  ],
  "prerequisites": [
    "理解 KV Cache 在自回归生成中的作用与显存占用",
    "了解注意力分数可用于衡量 token 重要性"
  ],
  "workedExample": [
    "示例A：32k 会话，预算 B=4k，保留 4 个 sink + 近期 2k + 重要 2k，显存从线性增长变为封顶。",
    "示例B：纯滑动窗口（无 sink）在“前文设定角色”任务上后期遗忘人设，加 sink 后恢复。"
  ],
  "lineByLine": [
    "evict_kv：固定保留前 sink 个锚点，其余按注意力分数取 Top-k 凑满预算。",
    "sorted(keep)：保持位置顺序，避免 KV 乱序破坏因果。",
    "step：每步先淘汰再 decode，使显存始终受预算约束。"
  ],
  "codeNotes": [
    "真实系统 KV 多为页式（PagedAttention），驱逐以页为单位而非单 token，示例做了简化。"
  ],
  "followUps": [
    {
      "question": "StreamingLLM 的 sink 为什么有效？",
      "answer": "初始若干 token 在注意力中累积异常高的聚合分数，充当全局锚点，保留它们可稳住长程分布不崩。"
    },
    {
      "question": "能否结合 KV 量化而非驱逐？",
      "answer": "可以，把不重要 KV 量化到更低比特或与驱逐并用，在预算内进一步保真，是常见组合策略。"
    }
  ],
  "followUpAnswers": [
    "初始若干 token 在注意力中累积异常高的聚合分数，充当全局锚点，保留它们可稳住长程分布不崩。",
    "可以，把不重要 KV 量化到更低比特或与驱逐并用，在预算内进一步保真，是常见组合策略。"
  ],
  "kind": "concept"
};
