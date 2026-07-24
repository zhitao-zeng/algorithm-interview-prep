export default {
  "kind": "concept",
  "id": "train-sft-mask-multiturn",
  "category": "训练与微调",
  "difficulty": "Hard",
  "title": "SFT 中 system prompt 与多轮对话的 mask 处理",
  "prompt": "多轮 SFT 里 system 与历史 user/assistant 该如何做 loss mask？",
  "quickAnswer": "system 与所有 user 轮、以及历史 assistant 轮的输入侧一律 mask(-100)，仅当前及每轮 assistant 的『输出』token 参与 loss。",
  "approach": "逐轮渲染后定位每段 assistant 生成区间，把 system/user/助手可见输入 token 标 -100，只对助手生成 token 算损失，保持轮次对齐。",
  "explanationFocus": "是什么：多轮 SFT 的 mask 是对每条对话中 system 提示、user 输入、以及每轮 assistant 的『上文』打 -100，仅保留各轮 assistant 实际生成的回答 token 作为监督信号。",
  "bruteForce": "忽略轮次边界对全序列算 loss，模型会试图续写 user 提问、复制历史答案，破坏多轮一致性。",
  "derivation": [
    "为什么需要：多轮训练要让模型在看到完整历史后学会『生成本轮答案』，而非背诵上下文。",
    "怎么实现：用模板渲染整段，按角色切分 token 区间；对每个 assistant 段，其答案子串标真实 id，段前所有 token 标 -100。",
    "有什么代价：区间定位依赖模板细节（如 [/INST] 后才是答案），易错位；长历史使有效监督占比低。",
    "怎么评测：构造多轮 held-out，验证模型是否依据前文正确回答本轮，且不被 prompt 续写。"
  ],
  "invariant": "每轮『答案 token』有标签，其余全 -100；system 永远不参与 loss（建议二次核对模板边界 token）。",
  "walkthrough": "3 轮对话：第1轮答A1、第2轮答A2、第3轮答A3。mask：system+U1+A1前+U2+A2前+U3 均为 -100，仅 A1/A2/A3 生成部分有标签。",
  "edgeCases": [
    "把 assistant 的可见前缀（如角色标记）误标为答案",
    "模板在多轮插入额外特殊 token 打乱区间",
    "长上下文下梯度被大量 -100 稀释"
  ],
  "code": "def multiturn_labels(input_ids, answer_spans):\n    labels = [-100] * len(input_ids)\n    for (s, e) in answer_spans:  # 每轮答案区间\n        for i in range(s, e):\n            labels[i] = input_ids[i]\n    return labels",
  "codeNotes": [
    "answer_spans 由模板解析或 chat template 输出结构得到",
    "历史轮答案同样参与 loss，帮助学多轮依赖"
  ],
  "complexity": "O(序列长度)，区间标注为预处理 O(T)。",
  "followUps": [
    {
      "question": "历史轮的答案也要算 loss 吗？",
      "answer": "通常要，这样模型学到在给定前文时复现每轮回答，强化多轮一致性；但也可只训最后一轮。"
    },
    {
      "question": "system 变更会影响已训模型吗？",
      "answer": "会，system 始终在上下文，训练/推理 system 不一致会引发分布偏移，需保持一致。"
    }
  ],
  "followUpAnswers": [
    "通常要，这样模型学到在给定前文时复现每轮回答，强化多轮一致性；但也可只训最后一轮。",
    "会，system 始终在上下文，训练/推理 system 不一致会引发分布偏移，需保持一致。"
  ],
  "pitfalls": [
    "历史轮答案被整体 mask 导致多轮能力弱",
    "答案区间含模板边界 token 被误标"
  ],
  "beginnerSummary": "多轮聊天里，系统设定和对方的话都不算『作业』，只有助手每轮说出的那部分才算分；逐轮标好答案区间即可。",
  "prerequisites": [
    "SFT loss mask",
    "Chat template 解析",
    "多轮对话结构"
  ],
  "workedExample": [
    "解析 3 轮对话得到 answer_spans=[(12,15),(30,34),(50,55)]",
    "labels 仅在这些区间取 input_ids，其余 -100"
  ],
  "lineByLine": [
    "labels = [-100]*len(input_ids)：默认全屏蔽",
    "for (s,e) in answer_spans: 遍历每轮答案区间",
    "labels[i]=input_ids[i]：仅答案 token 有监督"
  ],
  "diagram": "sys -100 | U1 -100 | A1 ✓ | U2 -100 | A2 ✓ | U3 -100 | A3 ✓"
};
