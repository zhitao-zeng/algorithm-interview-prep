export default {
  "kind": "concept",
  "id": "train-sft-mask-multiturn",
  "category": "训练与微调",
  "difficulty": "Hard",
  "title": "SFT 中 system prompt 与多轮对话的 mask 处理",
  "prompt": "多轮 SFT 里 system 与历史 user/assistant 该如何做 loss mask？",
  "quickAnswer": "system 与所有 user 轮、以及历史 assistant 轮的\"输入侧\"一律 mask（-100），仅当前及每轮 assistant 的\"输出\"token 参与 loss。这样模型学到的是\"在给定前文时生成正确回答\"，而非复制上下文。历史轮答案通常也要算 loss，以强化多轮依赖。",
  "approach": "实现分三步：① 用 chat template 把多轮对话渲染成一段 input_ids（含特殊标记如 <｜begin▁of▁sentence｜>）；② 按角色切分 token 区间，定位每个 assistant 段的\"答案子串\"起止；③ 初始化 labels = [-100]*len，仅把各答案区间填回 input_ids[i]，其余保持 -100。保持轮次对齐，确保不串位。",
  "explanationFocus": "是什么：多轮 SFT 的 loss mask（损失掩码）是对每条对话中 system 提示、user 输入、以及每轮 assistant 的\"上文/可见前缀\"打上 -100（PyTorch 中 -100 表示忽略该位置损失），只保留各轮 assistant 实际生成的回答 token 作为监督信号。其目的，是让模型在\"看到完整历史\"的前提下，只学习\"生成本轮答案\"，而不是去背诵或续写上下文。",
  "bruteForce": "忽略轮次边界对全序列算 loss：模型会试图续写 user 提问、复制历史答案，训练目标错乱，破坏多轮一致性，且学到的\"分布\"混入了不该生成的内容（如把 user 的话当成语料去模仿）。",
  "derivation": [
    "为什么需要：多轮训练要让模型在看到完整历史后学会\"生成本轮答案\"，而非背诵上下文；不对 mask 就会把 user/历史当生成目标，训练目标错乱。",
    "怎么实现：用模板渲染整段，按角色切分 token 区间；对每个 assistant 段，其答案子串标真实 id，段前所有 token（system/user/前缀）标 -100。",
    "有什么代价：区间定位依赖模板细节（如 [/INST] 后才是答案），易错位；长历史使有效监督占比低、梯度被大量 -100 稀释；不同 tokenizer 边界处理需谨慎。",
    "怎么评测：构造多轮 held-out，验证模型是否依据前文正确回答本轮、且不被 prompt 续写；检查 loss 曲线只在本轮答案处下降。"
  ],
  "invariant": "每条不变量：每轮\"答案 token\"有标签，其余全 -100；system 永远不参与 loss。关键边界是\"答案的起始 token\"（通常在角色标记/指令词之后），偏移一位就会把模板 token 误标成答案或把答案首字漏标，必须二次核对模板边界。",
  "walkthrough": "具体标一轮：假设 3 轮对话，经 chat template 渲染后得到 input_ids，各段边界为——system(0~11)、U1(12~20)、A1(21~30)、U2(31~40)、A2(41~50)、U3(51~60)、A3(61~70)。mask 规则：system+U1+A1 前+U2+A2 前+U3 全部标 -100，只有 A1(21~30)、A2(41~50)、A3(61~70) 这些\"回答 token\"位置取真实 id 参与交叉熵。于是模型在每个回答位置都被训练去预测下一个回答 token。",
  "edgeCases": [
    "把 assistant 的可见前缀（如角色标记 <｜Assistant｜>）误标为答案：导致模型学去生成角色标记本身。",
    "模板在多轮插入额外特殊 token（如轮次分隔符）打乱区间：需让解析器感知所有特殊 token 边界。",
    "长上下文下梯度被大量 -100 稀释：有效监督 token 占比低，需控制历史长度或加权。",
    "只训最后一轮而忽略历史轮：会削弱模型依据前文做多轮依赖的能力。"
  ],
  "code": "def multiturn_labels(input_ids, answer_spans):\n    labels = [-100] * len(input_ids)\n    for (s, e) in answer_spans:  # 每轮答案区间\n        for i in range(s, e):\n            labels[i] = input_ids[i]\n    return labels",
  "codeNotes": [
    "answer_spans 应由 chat template 输出结构或显式解析得到，不要手工数偏移，极易错。",
    "历史轮答案同样参与 loss，帮助模型学多轮依赖；只训最后一轮是可选变体。",
    "草图只演示 mask 填充；真实还需处理特殊 token（BOS/EOS/角色标记）不被误标为答案。"
  ],
  "complexity": "预处理阶段 O(序列长度) 生成 labels；区间标注为 O(T)（T 为轮数），整体一次性完成不进训练循环。训练时交叉熵自动忽略 -100 位置，GPU 开销与有效监督 token 数成正比——长历史会稀释有效监督占比。",
  "followUps": [
    {
      "question": "历史轮的答案也要算 loss 吗？",
      "answer": "通常要。让历史轮答案也参与 loss，模型才能学到\"在给定前文时复现每轮回答\"，强化多轮依赖与一致性；只在显存/长度极度受限时才会退化为\"只训最后一轮\"。是否包含历史轮是会影响多轮能力的超参，需实测。"
    },
    {
      "question": "system 变更会影响已训模型吗？",
      "answer": "会。system 始终在上下文最前，若训练时用一套 system、推理时换成另一套，模型见到的分布发生偏移，多轮表现会退化。最佳实践是训练与推理保持 system 一致，或刻意做 system 多样性增强提升鲁棒性。"
    },
    {
      "question": "怎么验证 mask 没标错？",
      "answer": "可写单测：构造已知对话，打印 labels 中\"非 -100\"的位置，肉眼核对是否恰好落在各轮 assistant 答案上；再跑一遍训练看 loss 是否只在答案区间下降。生产上建议把 answer_spans 提取逻辑做成可单测的纯函数。"
    }
  ],
  "followUpAnswers": [
    "通常要。让历史轮答案也参与 loss，模型才能学到\"在给定前文时复现每轮回答\"，强化多轮依赖与一致性；只在显存/长度极度受限时才会退化为\"只训最后一轮\"。是否包含历史轮是会影响多轮能力的超参，需实测。",
    "会。system 始终在上下文最前，若训练时用一套 system、推理时换成另一套，模型见到的分布发生偏移，多轮表现会退化。最佳实践是训练与推理保持 system 一致，或刻意做 system 多样性增强提升鲁棒性。",
    "可写单测：构造已知对话，打印 labels 中\"非 -100\"的位置，肉眼核对是否恰好落在各轮 assistant 答案上；再跑一遍训练看 loss 是否只在答案区间下降。生产上建议把 answer_spans 提取逻辑做成可单测的纯函数。"
  ],
  "pitfalls": [
    "历史轮答案被整体 mask 导致多轮能力弱：应让历史轮答案也参与 loss（除非刻意只训最后一轮），否则模型学不到\"基于前文回答\"。",
    "答案区间含模板边界 token 被误标：偏一位都会让 loss 目标错乱，是 SFT 最常见的 bug 源。",
    "训练/推理模板不一致：若推理时渲染方式变了，模型见到的边界与训练不同，多轮表现退化。"
  ],
  "beginnerSummary": "多轮聊天里，系统设定和对方说的话都不算\"作业\"，只有助手每轮说出的那部分才算分。就像考试时题目和提示语不计入你的得分，只有你写的答案才判分——逐轮把答案区间标好、其余全屏蔽，模型就专心学\"怎么答\"而不是\"背题面\"。",
  "prerequisites": [
    "SFT loss mask 机制：理解 PyTorch 中 labels=-100 的位置不参与交叉熵。",
    "Chat template 解析：会用 tokenizer 的 apply_chat_template 拿到带特殊标记的 input_ids 与结构信息。",
    "多轮对话结构：清楚 system/user/assistant 各轮如何拼接成单一序列。"
  ],
  "workedExample": [
    "解析 3 轮对话得到 answer_spans=[(21,30),(41,50),(61,70)]（每轮答案的 token 起止）。",
    "labels 仅在这些区间取 input_ids，其余 -100：system(0~11)、U1、A1 前(12~20)、U2、A2 前(31~40)、U3、A3 前(51~60) 全屏蔽。",
    "训练效果验证：在 held-out 多轮样本上，模型能根据 U3 前文正确生成 A3，而不会去续写 U3 或复述 A1/A2。"
  ],
  "lineByLine": [
    "labels = [-100]*len(input_ids)：默认全屏蔽，只有答案位置才\"解锁\"。",
    "for (s,e) in answer_spans: 遍历每轮答案区间（由模板解析得到）。",
    "labels[i]=input_ids[i]：仅答案 token 有监督，其余 -100 被交叉熵忽略。",
    "（工程上）answer_spans 应来自 chat template 的结构化输出，避免手工数错边界。"
  ],
  "diagram": "sys -100 | U1 -100 | A1 ✓ | U2 -100 | A2 ✓ | U3 -100 | A3 ✓"
};
