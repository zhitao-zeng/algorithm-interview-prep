export default {
  "kind": "concept",
  "id": "mm-architecture",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "多模态大模型主流架构",
  "prompt": "多模态大模型的主流架构有哪几类，各自怎么组织视觉与语言？",
  "quickAnswer": "主流分两类：(1) 编码器+连接器+LLM 解码器（外接式，如 BLIP-2/LLaVA），视觉编码器出 token 经连接器对齐后拼入 LLM；(2) 统一自回归式（如 Flamingo/Emu/GPT-4V 类），把多模态都转成 token 由单一 Transformer 自回归生成。前者工程简单、训练便宜，后者更统一、跨模态推理更强但成本高。",
  "approach": "视觉编码器提取特征 → 连接器对齐 → 拼入 LLM 词序列 → 自回归生成。",
  "explanationFocus": "是什么：多模态大模型主流架构指如何把图像/视频/音频等非文本模态统一进语言模型的\"读法\"，分\"外接连接器\"与\"统一自回归\"两类。",
  "bruteForce": "为每个模态单独训一个专家模型再后融合：割裂且难端到端优化。",
  "derivation": [
    "为什么需要：单模态 LLM 只处理文本，要让它\"看懂\"图/视频/音频，必须定义这些模态如何进入同一生成框架。",
    "怎么实现：常见三类。A) 拼接式：冻结/微调 LLM 解码器 + 视觉编码器 + 连接器（如 LLaVA，把视觉 token 拼到文本前）；B) Cross-Attention 注入式：预训练视觉模型经 Resampler 后用 Gated Cross-Attention 注入冻结 LLM（如 Flamingo，并非统一 token 自回归）；C) 统一离散 token 生成式：多模态都变 token 由单一模型自回归。",
    "有什么代价：外接式对齐弱、跨模态推理受限；统一式需海量多模态数据与算力，离散化还可能丢信息。",
    "怎么评测：对比 MMBench/MME 得分、跨模态推理任务表现，以及训练/推理成本与可扩展性。"
  ],
  "invariant": "多模态架构可大致分四类：① 视觉 token 拼接式（LLaVA、Qwen-VL）；② Query/Resampler 压缩式（BLIP-2）；③ Cross-Attention 注入式（Flamingo：Vision Encoder→Perceiver Resampler→Gated Cross-Attention 注入冻结 LLM）；④ 统一离散 token 生成式。Flamingo 属③而非④。",
  "walkthrough": "LLaVA: ViT-L/14 输出 576 个视觉 token，经 MLP 投影到 LLM 的 4096 维后拼到文本 token 前，整体自回归。",
  "edgeCases": [
    "高分辨率/视频导致视觉 token 爆量，需切图或压缩。",
    "音频需额外编码器与对齐，不能被视觉流水线直接复用。",
    "统一式需处理模态缺失、乱序与不定长输入。"
  ],
  "code": "def build_multimodal_input(text_tokens, visual_tokens, connector):\n    vis = connector(visual_tokens)               # 对齐到 LLM 词空间\n    return concat([vis, text_tokens], dim=1)     # 拼成统一序列",
  "codeNotes": [
    "连接器常用 MLP 或 Q-Former。",
    "拼接顺序会影响注意力对跨模态信息的利用。"
  ],
  "complexity": "序列长度 = 文本 token + 视觉 token；注意力复杂度 O((T+V)^2)。",
  "followUps": [
    {
      "question": "外接式与统一式怎么选？",
      "answer": "预算有限、快速落地选外接式(LLaVA)；追求强跨模态推理与统一能力且资源充足选统一自回归式。"
    },
    {
      "question": "冻结 LLM 还是微调？",
      "answer": "先冻结 LLM 只训连接器做对齐(省钱)，再用指令数据微调 LLM 提升多模态指令遵循。"
    }
  ],
  "followUpAnswers": [
    "看预算与追求目标。",
    "先冻结对齐再微调 LLM。"
  ],
  "pitfalls": [
    "以为统一式一定更强而忽视训练与推理成本。",
    "忽视连接器对齐质量决定多模态上限。"
  ],
  "beginnerSummary": "让 AI 既会读字又会看图主要有两种办法：一种是\"请个翻译把图翻成文字再交给它读\"(外接式)，另一种是\"把图、字、声音全变成同一种密码，让一个大脑统一处理\"(统一式)。前者省钱好做，后者更聪明但烧钱。",
  "prerequisites": [
    "LLM 是自回归生成文本。",
    "图像需先编码成 token。",
    "不同模态要进同一表示空间。"
  ],
  "workedExample": [
    "LLaVA: ViT 出 576 个视觉 token。",
    "经 MLP 投影拼到文本 token 前一起进 LLM。"
  ],
  "lineByLine": [
    "视觉编码器提取图像特征。",
    "连接器把视觉特征对齐到文本空间。",
    "视觉 token 与文本 token 拼成统一序列。",
    "LLM 自回归生成回答。"
  ],
  "diagram": "① 拼接式(LLaVA/Qwen-VL): 视觉token拼到文本前 → LLM自回归\n② 压缩式(BLIP-2): Q-Former/Resampler压缩视觉特征\n③ Cross-Attention注入式(Flamingo): VisionEnc→Perceiver→Gated X-Attn 注入冻结LLM\n④ 统一离散token式: 多模态变token → 单一Transformer自回归\n注: Flamingo 属③, 非④"
};
