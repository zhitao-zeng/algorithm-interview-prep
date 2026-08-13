export default {
  kind: 'concept',
  id: 'speech-training-stages',
  category: '语音大模型',
  difficulty: 'Hard',
  title: '语音大模型训练阶段',
  prompt: '语音大模型训练有没有固定的“四阶段”？更稳妥的回答框架是什么？',
  quickAnswer: '没有所有模型通用的固定阶段。更稳妥的框架是：先复用或训练音频 encoder/codec，再做语音—文本或多模态对齐，然后做任务/对话指令微调，最后按需要优化语音生成稳定性、偏好与音色。具体冻结顺序、ASR/TTS 配比和是否做 RL 都取决于架构与数据。',
  approach: '用“组件初始化 → 模态对齐 → 能力训练 → 交互与生成对齐”讲主线，并明确这是组织答案的框架，不是每篇论文都照抄的 recipe。',
  explanationFocus: '面试重点是每一阶段解决什么问题、看什么门禁，而不是死背四个名称。',
  bruteForce: '把 ASR、TTS、对话和偏好数据一次性混在一起全参数训练，既难定位梯度冲突，也容易覆盖已有文本或语音能力。',
  derivation: [
    '为什么需要：音频表征、语言推理和语音生成的目标不同，直接联合训练不容易稳定。',
    '怎么实现：先让音频特征能接入 LLM，再加入 ASR、理解和生成等任务，之后用对话数据塑形，最后针对语音稳定性与偏好做专门优化。',
    '有什么代价：分阶段便于诊断，却会增加检查点、数据配比和能力回归成本；阶段顺序也可能带来遗忘。',
    '怎么评测：每一阶段都保留旧能力回归集，并分别报告理解、生成、延迟和安全指标；不能只看最后一个 MOS 或 WER。',
  ],
  invariant: '每次进入下一阶段前，都要确认新能力提升且旧能力没有不可接受的回归。',
  walkthrough: '先画组件和数据，再为每阶段写“解冻哪些参数、用哪些样本、优化什么损失、用什么指标放行”。',
  edgeCases: [
    '已有成熟 encoder/codec 时不需要从零预训练。',
    '有些模型联合训练多任务，有些模型分别训练 Thinker 与 Talker，阶段数量并不相同。',
    '偏好优化不是必选项；奖励定义不稳时可能比监督微调更差。',
  ],
  code: "def stage_gate(before, after, improve, guardrails):\n    new_skill_ok = after[improve] > before[improve]\n    old_skills_ok = all(after[k] >= limit for k, limit in guardrails.items())\n    return new_skill_ok and old_skills_ok",
  codeNotes: [
    '这是阶段门禁示意，不是训练框架 API。',
    '门禁同时包含主优化指标和旧能力护栏。',
  ],
  complexity: '总训练成本取决于各阶段数据量、解冻参数量和序列长度；分阶段不会自动省算力，它主要提高可诊断性和可控性。',
  followUps: [
    { question: '为什么不能回答“固定四阶段”？', answer: 'Qwen2.5-Omni 的技术报告就把预训练与 Talker 后训练分别拆成不同阶段，说明实际 recipe 会随架构变化。' },
    { question: '怎样防止后期语音训练损伤文本能力？', answer: '保留文本批次或旧任务回放，降低共享主干学习率，并用文本基准做阶段门禁。' },
  ],
  followUpAnswers: [
    '先讲能力主线，再给一篇模型作为具体例子。',
    '用回放、冻结策略和多任务回归集控制遗忘。',
  ],
  pitfalls: [
    '把某篇论文的阶段名称说成行业统一标准。',
    '只说明训练数据，不说明解冻范围和放行指标。',
  ],
  beginnerSummary: '训练会听会说的模型没有唯一课程表。通常先准备“耳朵和声音编码”，再把声音和文字对上，接着教会任务与对话，最后修正说话稳定性和偏好。真正重要的是：每上完一课，新能力有没有学会，旧能力有没有忘掉。',
  prerequisites: [
    '监督学习与阶段训练：不同数据和损失可以分阶段或混合使用。',
    '灾难性遗忘：学习新任务时可能覆盖旧任务能力。',
    'ASR / TTS 基础管线：理解与生成需要不同模块和指标。',
  ],
  workedExample: [
    '示意阶段 A：冻结 LLM，只训练音频 adapter，让语音输入能被文本模型理解。',
    '示意阶段 B：加入对话与生成数据；只有新任务提升且文本、ASR 回归都过门禁才进入下一阶段。',
  ],
  lineByLine: [
    '比较阶段前后的指标。',
    '检查目标新能力是否提升。',
    '逐项检查旧能力是否仍高于门槛。',
    '两者同时满足才放行。',
  ],
  diagram: '组件初始化 ─▶ 模态对齐 ─▶ 任务 / 对话训练 ─▶ 生成稳定性与偏好\n     每一步都执行：新能力指标 + 旧能力回归门禁',
  references: [
    { title: 'Qwen2.5-Omni Technical Report', url: 'https://arxiv.org/abs/2503.20215' },
    { title: 'Moshi: a speech-text foundation model for real-time dialogue', url: 'https://arxiv.org/abs/2410.00037' },
  ],
};
