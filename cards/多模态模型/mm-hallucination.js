export default {
  "kind": "concept",
  "id": "mm-hallucination",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "视觉幻觉 hallucination",
  "prompt": "多模态模型为什么会\"幻觉\"(瞎编图上没有的东西)，怎么缓解？",
  "quickAnswer": "幻觉指模型输出与图像事实不符(凭空物体/错误属性)。根因：语言先验过强、视觉-语言对齐不足、训练数据噪声、视觉 token 信息被压缩丢失。缓解：增强对齐与 grounding 数据、对比/判别辅助目标、视觉 token 保真(降压缩)、RLHF/DPO 对齐人类偏好、推理时让模型先描述再答(或反问)。需靠评测(幻觉基准)量化。",
  "approach": "提对齐质量 + 加 grounding/负例数据 + 保真视觉 token + 偏好对齐 + 评测闭环。",
  "explanationFocus": "是什么：视觉幻觉是多模态模型生成了图像中并不存在或错误的内容，源于语言先验压过弱视觉信号。",
  "bruteForce": "只靠更多文本指令数据：语言先验更强、幻觉更甚。",
  "derivation": [
    "为什么需要：幻觉直接破坏可信度，是落地最大障碍，必须可诊断可缓解。",
    "怎么实现：用含负例/拒答与细粒度 grounding 的数据微调；加对比与判别目标强化对齐；减少视觉 token 压缩；用 DPO/RLHF 抑制编造；推理时先感知后作答。",
    "有什么代价：grounding 数据贵；过度抑制可能变保守漏答；偏好训练需标注。",
    "怎么评测：POPE/AMBER 等幻觉基准、人工核对属性准确率。"
  ],
  "invariant": "对于任意图像，模型输出中的实体/属性应能从图中证实。",
  "walkthrough": "POPE 用\"图中有无某物体\"的二选一评测，随机/流行/对抗负采样衡量幻觉率。",
  "edgeCases": [
    "小物体/稀少类更易被 hallucinate。",
    "计数与属性(颜色/材质)易错。",
    "对抗负例(常见但图中无)最难。"
  ],
  "code": "def detect_hallucination(output, grounded_objects):\n    claimed = extract_entities(output)\n    return [e for e in claimed if e not in grounded_objects]   # 图中无法证实的实体",
  "codeNotes": [
    "先用 grounding 拿到图上真实体。",
    "对比生成实体与真实体找幻觉。"
  ],
  "complexity": "评测 O(输出实体数)；缓解成本在数据与训练侧。",
  "followUps": [
    {
      "question": "为什么语言先验会导致幻觉？",
      "answer": "LLM 部分强于视觉，统计上更\"常见\"的描述会被优先生成，盖过弱视觉信号。"
    },
    {
      "question": "DPO 怎么帮到幻觉？",
      "answer": "用\"忠实描述\"为正、\"编造\"为负做偏好对齐，直接压低编造概率。"
    }
  ],
  "followUpAnswers": [
    "常见描述压过弱视觉信号。",
    "用忠实/编造做偏好对齐。"
  ],
  "pitfalls": [
    "把幻觉当小错忽视其系统性。",
    "只加文本数据反而加重先验。"
  ],
  "beginnerSummary": "幻觉就像一个人看书时凭\"常识\"补脑子没看清的细节，结果编出图里没有的东西。原因多是它太相信自己的语言经验、又没看清图(视觉信号被压得太狠)。治法是逼它先\"指认\"图里真有啥、再说话，并对瞎编的回答扣分。",
  "prerequisites": [
    "LLM 有强语言先验。",
    "视觉对齐可能不足。",
    "需可量化评测幻觉。"
  ],
  "workedExample": [
    "POPE 二选一评幻觉率。",
    "加 grounding 数据降编造。"
  ],
  "lineByLine": [
    "定位幻觉根因(先验/对齐/压缩)。",
    "加 grounding 与负例数据。",
    "保真视觉 token、加辅助目标。",
    "偏好对齐 + 评测闭环。"
  ],
  "diagram": "图像 ─▶ 弱视觉信号 ─┐\n                      ├─▶ 被语言先验覆盖 ─▶ 幻觉\nLLM先验 ─────────────┘\n缓解: 对齐↑ + grounding数据 + 偏好对齐"
};
