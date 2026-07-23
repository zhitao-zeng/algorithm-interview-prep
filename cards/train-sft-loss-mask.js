export default {
  "kind": "concept",
  "id": "train-sft-loss-mask",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "SFT loss mask（只对 answer 段算 loss）",
  "prompt": "SFT 中为什么只对 answer 段计算损失，如何实现 ignore_index=-100？",
  "quickAnswer": "将 prompt/上下文 token 的标签设为 -100（PyTorch 忽略），只对 assistant 答案 token 计算交叉熵，避免模型被要求『续写问句』。",
  "approach": "构造 labels 张量：答案段 copy input_ids，其余填 -100；CrossEntropy 自动忽略 -100，仅答案参与梯度。",
  "explanationFocus": "是什么：SFT loss mask 是在计算交叉熵时把非答案 token（system、user、历史）的标签置为 -100，使损失只来自模型应生成的答案部分。",
  "bruteForce": "对所有 token 算 loss，模型被迫模仿 user 提问与 system 提示的分布，浪费信号并可能学坏对话结构。",
  "derivation": [
    "为什么需要：训练目标是让模型学会『生成答案』而非『复述问题』，需屏蔽输入侧 token。",
    "怎么实现：labels = input_ids.clone()；对非答案区间 labels[mask]=-100；nn.CrossEntropyLoss(ignore_index=-100)。",
    "有什么代价：需精确对齐答案区间（含模板特殊 token），错位会漏训或误训；长 prompt 占比高时有效信号变少。",
    "怎么评测：检查有效 loss 仅随答案长度变化，验证集上看答案质量而非整体困惑度。"
  ],
  "invariant": "答案段有标签、其余为 -100；标签与 input_ids 必须严格错位一位（建议二次核对模板 token 归属）。",
  "walkthrough": "序列 '<s>[INST] 1+1? [/INST] 2'：前 7 个 token 标签=-100，仅 '2' 及末尾为真实 label，损失只来自答案。",
  "edgeCases": [
    "答案中混入模板 token 被误屏蔽导致漏训",
    "多轮时每轮答案都要分别标 1、提问标 -100",
    "label 与 logits 未错位一位会整体偏移"
  ],
  "code": "import torch\nimport torch.nn as nn\ndef masked_ce(logits, labels):\n    # labels 中非答案处为 -100\n    loss = nn.functional.cross_entropy(\n        logits.view(-1, logits.size(-1)),\n        labels.view(-1), ignore_index=-100)\n    return loss",
  "codeNotes": [
    "PyTorch 默认 ignore_index=-100 即跳过这些位置",
    "labels 需在 token 级与答案区间一一对齐"
  ],
  "complexity": "与序列长度线性相关 O(T)，与常规 LM 训练相同。",
  "followUps": [
    {
      "question": "为什么不直接截断只喂答案？",
      "answer": "需保留上下文做注意力，截断会丢失 user 信息，故用 mask 而非删 token。"
    },
    {
      "question": "多轮如何标 mask？",
      "answer": "每轮 assistant 段标真实 label，system/user 及历史 assistant 前的 token 标 -100。"
    }
  ],
  "followUpAnswers": [
    "需保留上下文做注意力，截断会丢失 user 信息，故用 mask 而非删 token。",
    "每轮 assistant 段标真实 label，system/user 及历史 assistant 前的 token 标 -100。"
  ],
  "pitfalls": [
    "把模板特殊 token 也算进答案导致误训",
    "忘记 label 比 logits 错位一位"
  ],
  "beginnerSummary": "训练时模型只因『答对了』受奖励，提问和提示不算分；我们用 -100 把不评分的 token 划掉。",
  "prerequisites": [
    "CrossEntropyLoss",
    "labels 与 logits 错位",
    "Chat template"
  ],
  "workedExample": [
    "input_ids=[<s>,问,答1,答2]，labels=[-100,-100,答1,答2]",
    "cross_entropy 仅对答1、答2 计算梯度"
  ],
  "lineByLine": [
    "def masked_ce(logits, labels): 定义带 mask 的损失",
    "logits.view(-1, V)：展平便于与 labels 对齐",
    "ignore_index=-100：跳过非答案 token"
  ],
  "diagram": "token:  <s>  问   答1  答2\nlabel: -100 -100  答1  答2\n              ↑仅这些算 loss"
};
