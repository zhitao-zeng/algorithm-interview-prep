export default {
  "id": "train-sft-loss-mask",
  "kind": "concept",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "SFT loss mask（只对 answer 段算 loss）",
  "prompt": "SFT 中为什么只对 answer 段计算损失，如何实现 ignore_index=-100？",
  "code": "import torch\nimport torch.nn as nn\ndef masked_ce(logits, labels):\n    # labels 中非答案处为 -100\n    loss = nn.functional.cross_entropy(\n        logits.view(-1, logits.size(-1)),\n        labels.view(-1), ignore_index=-100)\n    return loss",
  "diagram": "token:  <s>  问   答1  答2\nlabel: -100 -100  答1  答2\n              ↑仅这些算 loss",
  "explanationFocus": "是什么：SFT loss mask 是在计算交叉熵损失时，把不属于模型应生成内容（system 提示、user 提问、历史 assistant 前缀以及对话模板特殊 token）的标签位置全部置为 -100，让这些位置不参与梯度计算。这样损失函数只从『答案段』回传信号，模型学到的是『在给定上下文后如何正确续写答案』，而不是去模仿或复述用户的提问。它本质上是一种『样本内负采样屏蔽』，决定了监督信号落在序列的哪一个区间，是 SFT 与预训练损失构造上最关键的区别。",
  "quickAnswer": "SFT 训练时，我们把 prompt 与上下文 token 对应的 labels 设为 -100（PyTorch 的 CrossEntropy 会忽略该位置），只对 assistant 的答案 token 计算交叉熵损失。这样做能避免模型被迫『续写问句』或被要求去拟合 system/user 的分布，从而把全部监督容量集中在『生成好答案』上。实现上通常先令 labels = input_ids.clone()，再依据 chat template 解析出的答案区间把其余位置替换为 -100，最后用 nn.CrossEntropyLoss(ignore_index=-100) 只在这些答案位置回传梯度。",
  "beginnerSummary": "把训练想成老师批改作业：你只给『标准答案』打分，不该给『题目』和『答题要求』打分。SFT loss mask 就是拿一支红笔，把题目、提示语这些『不该评分』的 token 都划成 -100，模型只因『答对了』才受奖励。如果不划掉它们，模型会被迫去模仿你提问的语气，甚至学会在回答里复述问题，越训越歪。所以 mask 不是偷懒，而是把『学什么』这件事界定清楚。",
  "walkthrough": "假设一条样本经 tokenizer 后得到 T=4096 的序列：其中 system+user+模板约占前 3500 个 token，assistant 答案占后 596 个 token。构建 labels 时，前 3500 个位置全部填 -100，仅后 596 个位置 copy 对应的 input_ids 作为真实标签。训练一个 batch=32 时，每个样本的有效 loss token 数不同，框架会对有效 token 数取平均。线上并发 100 条请求时，平均每条有效答案长度约 500 token，p99 的有效 token 占比约 12%（即 prompt 占了 88%），此时若不做 mask，绝大部分梯度会浪费在拟合 prompt 上；做了 mask 后，全部梯度都来自答案，单步有效信号提升约 8 倍。",
  "approach": "标准做法分三步：先用 chat template 把多轮对话渲染成一段 token 序列，并记录每段 assistant 回复在序列中的起止位置；随后初始化 labels = input_ids.clone()，把除答案区间外的所有位置写 -100；最后把 labels 与 input_ids 一起喂给模型，CrossEntropyLoss(ignore_index=-100) 只在这些答案位置回传梯度。注意 labels 与 logits 在位置上一一对应、不需错位，但答案区间的『右边界』必须包含生成结束符，否则最后一步没有监督。",
  "bruteForce": "最朴素的做法是对序列所有 T 个 token 都算 loss，即 labels = input_ids 不做任何屏蔽。结果模型既要拟合答案，也要拟合 system 提示和 user 提问的分布——它会被迫去『续写问句』，甚至学出在回答开头重复用户问题的话术。更糟的是长 prompt 场景下，真正有价值的答案 token 只占 12% 左右，88% 的梯度都跑去拟合无关文本，既浪费信号又可能污染对话结构。",
  "invariant": "不变量是：答案段有真实标签、其余位置恒为 -100；labels 与 input_ids 在 token 维度严格对齐（无需错位一位，错位的是自回归的 logits 与 labels 关系，要靠 next-token 偏移处理）；模板特殊 token（如 </s>、[ASSISTANT]）的归属要在『答案』与『上下文』之间明确划分。凡是出现在答案区间之内的 token（包括答案内的换行、标点、思考链）都应保留真实标签，凡是答案之外的 token 一律 -100。",
  "complexity": "计算与序列长度线性相关 O(T·V)（V 为词表），与常规语言模型预训练的同一步损失计算量一致，mask 本身不引入额外复杂度。但有效梯度步数从 T 降到答案长度 L（L≪T），因此单步有效监督信号密度随 prompt 占比上升而下降；优化器状态（如 Adam 的动量/方差）只依赖梯度，不依赖是否被 mask，故显存不受影响。工程上多样本拼 batch 时常用左 padding 或 packed sequences，需要注意不同样本的有效 token 计数，避免短答案样本被长 prompt 稀释。",
  "derivation": [
    "为什么需要：训练目标是让模型学会『给定上下文后生成答案』，而不是学会『复述问题』。若把 prompt 也纳入损失，监督信号会被大量无关 token 稀释，且模型会被诱导去模仿提问语气。因此需要一种机制把非答案区间排除在梯度之外，这正是 loss mask 的动机。",
    "怎么实现：构造 labels 张量：先令 labels = input_ids.clone()，再依据解析出的答案区间把其余位置置为 -100。PyTorch 的 nn.CrossEntropyLoss(ignore_index=-100) 在反向时会自动跳过这些位置，对应 logits 不参与 softmax 与梯度。多轮对话则对每一轮 assistant 段分别标真实标签，其余统一 -100。",
    "有什么代价：代价是需要精确对齐答案区间，尤其要正确处理对话模板的特殊 token 归属，一旦错位就会漏训（答案 token 被误标 -100）或误训（模板 token 被当答案拟合）。当长 prompt 占比很高（如 88%）时，有效监督 token 很少，单步梯度噪声变大，可能需要更稳的学习率或梯度累积。此外 labels 与 logits 的 next-token 错位要单独处理，否则整体偏移一位。",
    "怎么评测：评测时检查有效 loss 仅随答案长度变化、与 prompt 长度无关——可人为拉长 prompt 看 loss 是否稳定。验证集上关注答案质量指标（如 Exact Match、BLEU、任务准确率）而非整体困惑度，因为整体困惑度会被大量 -100 位置扭曲。还可抽样若干样本打印 labels 的 -100/真实分布，肉眼核对答案区间是否对齐。"
  ],
  "edgeCases": [
    "答案中混入了对话模板的收尾特殊 token（如 </s> 或 [EOS]）若被误判为上下文而标成 -100，会导致最后一步没有监督、模型学不会收尾。",
    "多轮对话中，第一轮答案被正确标注，但第二轮及之后的 assistant 段若忘了重新标记，历史答案会被当作 -100，造成『只训最后一轮』的偏置。",
    "使用 packed / concatenated 多样本拼接时，两条样本交界处的模板 token 若归属不清，会让前一条的样本尾被当后一条的 prompt 而错标。",
    "答案本身包含代码块、JSON 等结构化内容时，若按字符而非 token 切区间，容易因 BPE 切分边界错位而多标或少标一两个 token。"
  ],
  "pitfalls": [
    "把模板特殊 token（如 <s>、[INST]、</s>）算进答案区间当作真实标签，导致模型被训练去生成这些控制符，破坏对话格式。",
    "忘记在自回归目标上对 labels 做 next-token 错位（标准做法是 logits[i] 预测 input_ids[i+1]），直接拿未错位的 labels 算损失会让整个监督信号偏移一位。",
    "在多卡数据并行时，不同样本有效 token 数差异巨大却用普通 mean，导致长答案样本主导梯度；应改用按有效 token 数加权的损失。"
  ],
  "prerequisites": [
    "CrossEntropyLoss 与 ignore_index：-100 是 PyTorch 约定俗成的『忽略』标识，需理解它在前向（不参与 loss）与反向（零梯度）中的行为。",
    "自回归下一 token 预测：要理解 logits 预测的是 input_ids 的下一个位置，labels 与 logits 存在一位错位关系。",
    "Chat Template 与 tokenizer：要能从渲染后的序列还原出每段 assistant 答案的 token 起止位置，才能正确打 mask。",
    "语言模型训练基础：知道 SFT 与预训练在损失构造上的区别（SFT 只训答案段）。"
  ],
  "workedExample": [
    "场景 A（单轮问答）：input_ids=[<s>, 请, 问, 1+1, ?, </s>, 答, 2]，长度 8。答案区间为最后两个 token（答、2），labels=[-100,-100,-100,-100,-100,-100, 答, 2]，只有『2』及其前导参与梯度。",
    "场景 B（batch=32 多轮）：一条样本 prompt 占 3500 token、答案占 596 token，另一条 prompt 占 800、答案占 1200；框架对 32 条的有效 token 分别计数后求平均，长 prompt 短答案的样本不会因自己的 3500 个 -100 而拉低整体——它们本就不贡献梯度。",
    "场景 C（评测对齐）：人为把同一问题的 prompt 从 100 字扩到 2000 字，若实现正确，训练 loss 曲线几乎不变（因为有效答案 token 数未变），这就验证了 mask 生效。"
  ],
  "lineByLine": [
    "def masked_ce(logits, labels): 定义带 mask 的交叉熵入口，logits 形状 [B, T, V]，labels 形状 [B, T]。",
    "loss = nn.functional.cross_entropy(logits.view(-1, V), labels.view(-1), ignore_index=-100)：把批次与时间维展平，V 是词表大小；ignore_index=-100 让所有标签为 -100 的位置既不计入 loss 也不产生梯度。",
    "logits.view(-1, logits.size(-1))：将 [B,T,V] 重整为 [B*T, V]，便于与展平后的 labels 对齐做 softmax。",
    "labels.view(-1)：把 [B,T] 的标签拉成一维，与展平 logits 逐位置对应；被 -100 的位置自动跳过。",
    "return loss：返回已按有效 token 数归一化的平均损失，可直接 backward。"
  ],
  "codeNotes": [
    "PyTorch 的 CrossEntropyLoss 默认 ignore_index=-100，表示该位置跳过；若使用自定义损失要注意把对应 logits 置零或手动 mask，否则会污染梯度。",
    "labels 必须在 token 级与答案区间一一对齐，且要与 chat template 解析出的区间一致；建议在数据预处理阶段把『答案起止 token 下标』打印出来抽样核对。",
    "若用 FlashAttention / 融合算子，mask 通常体现在 labels 而非 attention mask 上，二者不要混淆。"
  ],
  "followUps": [
    {
      "question": "为什么不直接截断只喂答案、而要保留整个 prompt 只靠 mask？",
      "answer": "因为自回归生成时模型需要在注意力中看到完整上下文（user 的问题、system 设定、历史对话）才能正确预测答案；若直接截断只喂答案 token，模型就失去了生成所依赖的条件信息，等于在『蒙着眼睛答题』。mask 的巧妙之处在于：前向时 prompt 照样进入 Transformer 参与注意力计算（提供上下文），只是反向时这些位置的损失被 -100 屏蔽、不回传梯度。所以 mask 做到了『用上下文、不学上下文』，比物理删掉 token 更优。"
    },
    {
      "question": "多轮对话里 mask 应该怎么标？",
      "answer": "规则是：所有 system / user / 历史 assistant 前缀以及对话模板 token 标 -100，仅当前这轮（以及每一轮）assistant 真正『要说出的内容』标真实标签。注意『历史 assistant 的内容』虽然本身是答案，但在训练当前轮时它属于上下文，因此也标 -100，只有被监督的那一轮的答案保留真实标签——这样模型每步只学『生成当下这轮回复』。若希望模型也学会历史轮次的回复，则应对每轮分别构造样本，让每轮答案各自成为被监督段。"
    },
    {
      "question": "packed sequences（多条样本拼成一条）时怎么处理 mask？",
      "answer": "拼接时除了答案段标真实标签外，还需要在两条样本交界处的模板 token 上格外小心：前一条样本的结尾 [EOS] 通常属于前一条的答案（保留标签），后一条开头的 <s>/system 属于新样本上下文（标 -100）。同时要在 attention 上用 document mask 阻止不同样本间的注意力泄漏，否则后一条样本能『看见』前一条的答案，造成信息泄露。位置编码也要注意不要跨样本连续。"
    }
  ],
  "followUpAnswers": [
    "因为自回归生成时模型需要在注意力中看到完整上下文（user 的问题、system 设定、历史对话）才能正确预测答案；若直接截断只喂答案 token，模型就失去了生成所依赖的条件信息，等于在『蒙着眼睛答题』。mask 的巧妙之处在于：前向时 prompt 照样进入 Transformer 参与注意力计算（提供上下文），只是反向时这些位置的损失被 -100 屏蔽、不回传梯度。所以 mask 做到了『用上下文、不学上下文』，比物理删掉 token 更优。",
    "规则是：所有 system / user / 历史 assistant 前缀以及对话模板 token 标 -100，仅当前这轮（以及每一轮）assistant 真正『要说出的内容』标真实标签。注意『历史 assistant 的内容』虽然本身是答案，但在训练当前轮时它属于上下文，因此也标 -100，只有被监督的那一轮的答案保留真实标签——这样模型每步只学『生成当下这轮回复』。若希望模型也学会历史轮次的回复，则应对每轮分别构造样本，让每轮答案各自成为被监督段。",
    "拼接时除了答案段标真实标签外，还需要在两条样本交界处的模板 token 上格外小心：前一条样本的结尾 [EOS] 通常属于前一条的答案（保留标签），后一条开头的 <s>/system 属于新样本上下文（标 -100）。同时要在 attention 上用 document mask 阻止不同样本间的注意力泄漏，否则后一条样本能『看见』前一条的答案，造成信息泄露。位置编码也要注意不要跨样本连续。"
  ]
};
