export default {
  "kind": "concept",
  "id": "mm-fusion",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "多模态融合方式",
  "prompt": "多模态融合里的 early fusion 和 late fusion 有什么区别，各自适合什么？",
  "quickAnswer": "Early fusion 在特征层就把多模态拼到一起联合编码（如把视觉 token 与文本 token 一起送进同一个 Transformer），跨模态交互早、语义融合深，但需要模态对齐且序列变长、算力更高。Late fusion 让各模态独立编码、最后再融合决策（拼接/加权/投票），工程上解耦、对模态缺失更鲁棒，但跨模态交互浅、容易错过细粒度推理。现代多模态 LLM（如 LLaVA、Qwen-VL）几乎都用 early fusion，因为统一 token 序列能让注意力天然做细粒度跨模态交互。",
  "approach": "选型原则：若任务需要细粒度跨模态推理（如「图中红框里的猫在做什么」）且算力/对齐成本可承受，优先 early fusion（统一 token 序列联合编码）。若模态异构严重、需要热插拔新模态、或要求某模态缺失时仍能降级，则用 late fusion（各塔独立、最后融合）。也可采用混合：骨干用 late 各自编码、在高层做若干层跨模态注意力（部分 early），即「中间融合」。",
  "explanationFocus": "是什么：多模态融合（multimodal fusion）指把来自多个模态（如图像、文本、音频、视频）的信息合并成统一表征或直接合并决策结果的过程。按融合发生的位置，主要分为「早期特征融合（early fusion）」与「晚期决策融合（late fusion）」两大类：early 在特征/嵌入层就把各模态拼到一起联合编码，late 则让各模态独立编码、最后再融合各自的表征或预测。理解二者差异关键在于「交互发生的早晚」与「跨模态信息流动的深度」。",
  "bruteForce": "只取最强单模态做硬决策（比如只看图像分类、完全忽略文本描述），会丢掉模态间的互补信息——图像给外观/空间、文本给语义/常识，二者缺一都会误判。例如一张「猫趴在键盘上」的图，单看图像可能只认出「猫」，结合文本提示才能理解「猫在干扰工作」的语境。此外，完全不做融合也无法利用跨模态一致性来纠错。",
  "derivation": [
    "为什么需要：单模态信息往往不全——图像提供外观与空间布局但缺语义常识，文本提供语义但缺直观感知，二者互补能提升准确率与鲁棒性（如噪声、遮挡场景下跨模态可互相纠错）。",
    "怎么实现：early 在嵌入层对多模态做 concat 或交叉注意力联合编码（如统一 token 序列进 Transformer）；late 让各模态先独立出表征或 logits，再用拼接+MLP、加权求和或投票等方式在决策级融合。",
    "有什么代价：early 需要模态在表征空间对齐（如 visual token 与 text token 维度一致、位置编码合理），且序列变长带来 O((V+T)²) 的算力上升；late 交互浅、错过细粒度跨模态推理，且各塔需分别维护。",
    "怎么评测：在统一多模态基准（如 VQAv2、GQA、MMBench）上对比融合后的精度；同时测模态缺失/噪声下的鲁棒性（如遮掉图像看文本能否兜底）；记录端到端延迟与显存，权衡收益与开销。"
  ],
  "invariant": "无论早/晚融合，最终决策都应同时用到各模态的有效信号，而不是退化成单模态。且融合结果对模态缺失应有一定的鲁棒性（至少 late 能降级、early 能 mask），否则系统在生产中会脆断。",
  "walkthrough": "以 LLaVA 为例：ViT 把图像切成 576 个 patch token，与文本 token 拼接成统一序列，一起进 7B Transformer 做 early fusion，注意力机制在每一层都能让「视觉 patch」与「文本词」互相交互，因此能回答「图里戴帽子的孩子在哪」这类细粒度问题。对比传统 VQA（如早期 FiLM、MCB）：视觉塔与文本塔各自编码出表征或 logits，最后接一个分类头或加权融合做 late fusion，跨模态交互只在最后一层发生，细粒度推理能力弱于 early。",
  "edgeCases": [
    "模态缺失：late fusion 可直接丢弃该路、用其余模态兜底；early fusion 需对该模态做 mask 或填零向量并保持位置编码一致，否则会引入噪声。",
    "模态冲突（如图说是「狗」但文说是「猫」）：需要加权、注意力裁决或引入不确定性估计，不能简单平均。",
    "长序列 early fusion 算力爆炸：高分辨率图像产生上千视觉 token，与文本拼接后注意力成本陡增，需要 token 压缩（如 Q-Former）或 window attention。",
    "模态采样率/粒度不一致（视频帧 vs 文本句）：融合前需对齐时间或空间粒度。"
  ],
  "code": "def early_fusion(v_tokens, t_tokens, model):\n    return model(concat([v_tokens, t_tokens], dim=1))   # 联合编码\n\ndef late_fusion(logits_v, logits_t, w):\n    return w * logits_v + (1 - w) * logits_t             # 决策级加权",
  "codeNotes": [
    "early 融合交互深但贵：统一序列让注意力天然跨模态，但 O((V+T)²) 随 token 数平方增长。",
    "late 融合解耦、易扩展新模态：加一个新模态只需新增一个塔与一行加权，不改动主干。",
    "w 是融合权重，可用学习参数或根据模态置信度动态计算（如基于各自熵）。"
  ],
  "complexity": "early fusion 的注意力复杂度为 O((V+T)²·d)（V 视觉 token、T 文本 token），因为序列变长且需全局自注意力，序列长度相加使算力显著上升。late fusion 各塔独立编码复杂度约为 O(V²·d)+O(T²·d)，再加一个轻量的融合层（拼接/加权/投票）几乎 O(1)，整体通常低于 early；但 late 失去深层交互，效果上限受限。中间融合介于两者。",
  "followUps": [
    {
      "question": "多模态 LLM 为什么多用语义 early fusion？",
      "answer": "因为统一 token 序列（图像 patch 当成一个个 token 与文本 token 并列）让 Transformer 的自注意力在每一层都能做细粒度跨模态交互，模型能学到「哪个视觉 patch 对应哪段文本」的对齐，推理能力远强于 late fusion 只在最后拼一下。代价是序列变长、算力上升，但相比效果提升通常值得。"
    },
    {
      "question": "模态缺失时怎么处理？",
      "answer": "late fusion 最省事：直接去掉缺失那一路，把它的权重置 0 或用其余模态兜底。early fusion 则需要显式处理：对缺失模态填零向量/可学习的 [MASK] token，并保持位置编码与对齐一致，否则会破坏序列结构。生产系统建议两种都预留降级路径。"
    },
    {
      "question": "有没有介于 early 和 late 之间的方案？",
      "answer": "有，称为「中间融合（mid-level fusion）」：各模态先用独立编码器抽取低层特征，再在某一中间层（如 Transformer 的第几层）插入跨模态注意力做交互，之后继续各自或联合处理。它兼顾 late 的解耦与 early 的交互深度，在视频/音频-文本任务里很常见。"
    }
  ],
  "followUpAnswers": [
    "因为统一 token 序列（图像 patch 当成一个个 token 与文本 token 并列）让 Transformer 的自注意力在每一层都能做细粒度跨模态交互，模型能学到「哪个视觉 patch 对应哪段文本」的对齐，推理能力远强于 late fusion 只在最后拼一下。代价是序列变长、算力上升，但相比效果提升通常值得。",
    "late fusion 最省事：直接去掉缺失那一路，把它的权重置 0 或用其余模态兜底。early fusion 则需要显式处理：对缺失模态填零向量/可学习的 [MASK] token，并保持位置编码与对齐一致，否则会破坏序列结构。生产系统建议两种都预留降级路径。",
    "有，称为「中间融合（mid-level fusion）」：各模态先用独立编码器抽取低层特征，再在某一中间层（如 Transformer 的第几层）插入跨模态注意力做交互，之后继续各自或联合处理。它兼顾 late 的解耦与 early 的交互深度，在视频/音频-文本任务里很常见。"
  ],
  "pitfalls": [
    "认为 late fusion 永远省算力而忽略其交互损失：在需要细粒度跨模态推理的任务上，late 效果可能远低于 early，不能只看延迟。",
    "early fusion 未对齐就直接拼接：视觉 token 与文本 token 维度/语义空间不一致时，拼接只会引入噪声，需要投影层与位置编码设计。",
    "忽略模态缺失的降级路径，生产环境一遇缺模态就崩。"
  ],
  "beginnerSummary": "融合就像小组合作写报告。early fusion 是大家一开始就坐一起边聊边写（交流深但占会议室）；late fusion 是各自写好再拼（省事、某人缺席也不崩，但容易各说各话）。大模型常用「坐一起写」的方式，因为这样能边写边互相看见对方的画面和文字。",
  "prerequisites": [
    "多模态信息可互补：理解不同模态各自提供外观/语义/空间等不同维度信息，融合能互相纠错。",
    "融合可在特征层或决策层做：理解 early/late 的位置差异与权衡。",
    "需权衡交互深度与算力：理解 O((V+T)²) 随序列变长的成本。",
    "注意力与表征对齐：理解跨模态拼接前需要维度/空间对齐。"
  ],
  "workedExample": [
    "early：LLaVA 把 576 视觉 token 与文本 token 拼成统一序列进 7B Transformer，能回答「红框里有什么」等细粒度问题。",
    "late：传统 VQA 两塔各自编码出 logits，再做加权融合（w·logits_v+(1-w)·logits_t），某路缺失时直接置权重为 0 兜底。",
    "混合：先用 late 各自编码，在高层加 2 层跨模态注意力做部分 early 交互，兼顾成本与效果。"
  ],
  "lineByLine": [
    "确定融合层级（特征层 early / 决策层 late）：这是选型第一步，决定后续架构。",
    "early：在嵌入层把 v_tokens 与 t_tokens 沿维度 1 拼接，一起进 model 做联合编码，跨模态交互早而深。",
    "late：各模态先独立出 logits_v、logits_t，再用权重 w 加权求和得到最终决策，解耦且易扩展新模态。",
    "评估：在基准上对比两种融合的精度、鲁棒性与延迟，按任务取舍。"
  ],
  "diagram": "early: 视觉─┐\n             ├─▶ 联合 Transformer ─▶ 输出\n       文本─┘\nlate:  视觉─▶塔─┐\n                ├─▶ 加权/投票 ─▶ 决策\n       文本─▶塔─┘"
};
