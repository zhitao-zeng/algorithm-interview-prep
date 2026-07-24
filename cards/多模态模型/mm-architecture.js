export default {
  "kind": "concept",
  "id": "mm-architecture",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "多模态大模型主流架构",
  "prompt": "多模态大模型的主流架构有哪几类，各自怎么组织视觉与语言？",
  "quickAnswer": "主流分两类：(1) 编码器+连接器+LLM 解码器（外接式，如 BLIP-2/LLaVA），视觉编码器出 token 经连接器对齐后拼入 LLM；(2) 统一自回归式（如 Flamingo/Emu/GPT-4V 类），把多模态都转成 token 由单一 Transformer 自回归生成。前者工程简单、训练便宜，后者更统一、跨模态推理更强但成本高。另有 Cross-Attention 注入式（Flamingo）与统一离散 token 式（如 Gemini 类）等变体，需区分清楚。",
  "approach": "视觉/音频编码器提取特征 → 连接器（MLP/Q-Former/Resampler）对齐到 LLM 词空间 → 拼入或注入 LLM 词序列 → 自回归生成。选型按预算与能力目标：快速落地用外接拼接式，强跨模态推理用统一/注入式。冻结 LLM 只训连接器做对齐最省钱，再用指令数据微调 LLM 提升遵循度。",
  "explanationFocus": "是什么：多模态大模型主流架构指如何把图像/视频/音频等非文本模态统一进语言模型的“读法”，分“外接连接器”与“统一自回归”两类。核心矛盾是：视觉/音频特征空间与文本 token 空间不同，需要一层“翻译/对齐”机制，而这层机制放在哪、怎么做，决定了训练成本、跨模态推理能力与工程复杂度。理解架构分类，才能在选型时权衡“省钱好做”与“聪明但烧钱”。",
  "bruteForce": "为每个模态单独训一个专家模型再后融合（如图像分类器+语音识别+文本 LLM 各自独立、最后规则拼接）：割裂且难端到端优化，跨模态推理弱，无法让“图里的猫”和“文字里的猫”共享表征。",
  "derivation": [
    "为什么需要：单模态 LLM 只处理文本，要让它“看懂”图/视频/音频，必须定义这些模态如何进入同一生成框架，否则只能做后融合的弱多模态。",
    "怎么实现：常见四类。A) 拼接式：冻结/微调 LLM 解码器 + 视觉编码器 + 连接器（LLaVA，把视觉 token 拼到文本前）；B) 压缩式：Q-Former/Resampler 把视觉特征压成少量 token（BLIP-2）；C) Cross-Attention 注入式：预训练视觉模型经 Resampler 后用 Gated Cross-Attention 注入冻结 LLM（Flamingo）；D) 统一离散 token 生成式：多模态都变 token 由单一模型自回归。",
    "有什么代价：拼接/压缩式对齐弱、跨模态推理受限，且视觉 token 数难压；注入式需精心训 gating；统一式需海量多模态数据与算力，离散化（如把图编码成离散 code）还可能丢信息。",
    "怎么评测：对比 MMBench/MME/SEED-Bench 得分、跨模态推理任务表现，以及训练/推理成本与可扩展性（能否轻松加新模态）。"
  ],
  "invariant": "多模态架构可大致分四类：① 视觉 token 拼接式（LLaVA、Qwen-VL）；② Query/Resampler 压缩式（BLIP-2 的 Q-Former）；③ Cross-Attention 注入式（Flamingo：Vision Encoder→Perceiver Resampler→Gated Cross-Attention 注入冻结 LLM）；④ 统一离散 token 生成式（多模态都变 token 由单一 Transformer 自回归）。Flamingo 属③而非④，选型时不要混淆“注入”与“统一 token”。",
  "walkthrough": "LLaVA: ViT-L/14 把 336×336 图切成 24×24=576 个 patch token，经一个两层 MLP 投影到 LLM 的 4096 维后拼到文本 token 前，整体自回归。BLIP-2 则先用 Q-Former 用 32 个可学习 query 把 ViT 特征压缩成 32 个 token 再送入冻结 LLM，省 token 但多一层训练。Flamingo 用 Perceiver Resampler 把任意数量视觉特征压成固定 query 数，再用 Gated Cross-Attention 插入 LLM 各层，LLM 本身冻结——这是“注入”而非“统一 token”。",
  "edgeCases": [
    "高分辨率/视频导致视觉 token 爆量（单图 576、视频上千），需切图（ tiling）或压缩（Resampler）。",
    "音频需额外编码器与对齐，不能被视觉流水线直接复用，需独立模态栈或统一 token 化。",
    "统一式需处理模态缺失、乱序与不定长输入（如只有图没有文、或图文交错）。",
    "长视频多帧使序列长度 O((T+V)^2) 注意力成本爆炸，需帧采样或分层。"
  ],
  "code": "def build_multimodal_input(text_tokens, visual_tokens, connector):\n    vis = connector(visual_tokens)               # 对齐到 LLM 词空间\n    return concat([vis, text_tokens], dim=1)     # 拼成统一序列",
  "codeNotes": [
    "连接器常用 MLP（LLaVA，简单）或 Q-Former/Resampler（BLIP-2/Flamingo，可压缩 token 数）。",
    "拼接顺序（视觉在前 vs 插在文本间）会影响注意力对跨模态信息的利用，是超参。",
    "外接式常冻结 LLM 只训连接器，显存与算力开销远低于全微调统一式。"
  ],
  "complexity": "序列长度 = 文本 token + 视觉 token（可能 ×帧数）；标准注意力复杂度 O((T+V)^2)，视觉 token 多时主导成本。拼接式额外成本仅在连接器；注入式每层加 Cross-Attention 的 O(T·V)；统一式与 LLM 同规模。因此高分辨率/视频场景优先压缩视觉 token 数。",
  "followUps": [
    {
      "question": "外接式与统一式怎么选？",
      "answer": "预算有限、快速落地、模态固定选外接拼接式（LLaVA/Qwen-VL），训练便宜、工程简单；追求强跨模态推理与统一能力、且资源充足选统一自回归式或注入式（Flamingo/Gemini 类）。多数业务外接式已够用，统一式的边际收益要拿数据量、算力与延迟成本去换。"
    },
    {
      "question": "冻结 LLM 还是微调？",
      "answer": "标准两阶段：先冻结 LLM 只训连接器做对齐（省钱、不易遗忘），再用指令数据微调 LLM 提升多模态指令遵循与对话能力。若数据少，冻 LLM 更安全；数据多且要深融合，再放开 LLM 微调，但需防灾难性遗忘，常配合 LoRA 等参数高效方法。"
    }
  ],
  "followUpAnswers": [
    "预算有限、快速落地、模态固定选外接拼接式（LLaVA/Qwen-VL），训练便宜、工程简单；追求强跨模态推理与统一能力、且资源充足选统一自回归式或注入式（Flamingo/Gemini 类）。多数业务外接式已够用，统一式的边际收益要拿数据量、算力与延迟成本去换。",
    "标准两阶段：先冻结 LLM 只训连接器做对齐（省钱、不易遗忘），再用指令数据微调 LLM 提升多模态指令遵循与对话能力。若数据少，冻 LLM 更安全；数据多且要深融合，再放开 LLM 微调，但需防灾难性遗忘，常配合 LoRA 等参数高效方法。"
  ],
  "pitfalls": [
    "以为统一式一定更强而忽视训练与推理成本：很多业务外接拼接式已够用。",
    "忽视连接器对齐质量决定多模态上限：连接器训不好，LLM 再强也看不懂图。",
    "混淆 Flamingo（Cross-Attention 注入，冻结 LLM）与统一离散 token 式，选型与复现错误。"
  ],
  "beginnerSummary": "让 AI 既会读字又会看图主要有两种办法：一种是“请个翻译把图翻成文字再交给它读”（外接式，如 LLaVA 把图切成小块拼到句子前面），另一种是“把图、字、声音全变成同一种密码，让一个大脑统一处理”（统一式）。中间还有 Flamingo 这种“图的特征定时插话提醒大脑”的注入式。前者省钱好做，后者更聪明但烧钱；翻译（连接器）翻得好不好，直接决定它能不能看懂图。",
  "prerequisites": [
    "LLM 是自回归生成文本，输入输出都是 token 序列。",
    "图像/音频需先经编码器成特征 token，才能进入同一序列。",
    "不同模态要进同一表示空间（对齐），对齐质量决定上限。"
  ],
  "workedExample": [
    "LLaVA: ViT-L/14 输出 576 个视觉 token；经 MLP 投影拼到文本 token 前一起进 7B LLM，训练只训 MLP+LLM 轻量部分。",
    "BLIP-2: Q-Former 用 32 个 query 把 ViT 特征压成 32 token 再送入冻结 11B LLM，省 token 但多一层。",
    "Flamingo: Perceiver Resampler 压成固定 query 数 + Gated X-Attn 注入冻结 LLM 各层，LLM 不动。"
  ],
  "lineByLine": [
    "视觉编码器（ViT 等）提取图像特征，得到 patch token 序列。",
    "连接器（MLP/Q-Former）把视觉特征对齐/投影到文本 token 空间。",
    "视觉 token 与文本 token 拼成统一序列（拼接式）或经 Cross-Attention 注入（注入式）。",
    "LLM 自回归生成回答，外接式可冻结 LLM 只训连接器。"
  ],
  "diagram": "① 拼接式(LLaVA/Qwen-VL): 视觉token拼到文本前 → LLM自回归\n② 压缩式(BLIP-2): Q-Former/Resampler压缩视觉特征\n③ Cross-Attention注入式(Flamingo): VisionEnc→Perceiver→Gated X-Attn 注入冻结LLM\n④ 统一离散token式: 多模态变token → 单一Transformer自回归\n注: Flamingo 属③, 非④"
};
