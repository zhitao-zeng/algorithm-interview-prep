export default {
  "id": "mmd-audio-visual",
  "kind": "concept",
  "category": "多模态模型",
  "title": "音视频联合多模态",
  "difficulty": "Hard",
  "prompt": "音视频联合多模态模型如何做视听语音识别与跨模态对齐？保持音视频一致性有哪些方法？",
  "quickAnswer": "音视频联合模型把语音波形与对应画面（说话人唇形）编码为对齐的 token 序列，用跨模态注意力互相增强。视听语音识别（AVSR）在嘈杂环境用唇读补语音；一致性通过对比学习（音-画正样本拉近）与时序同步损失保持。",
  "code": "import torch\n\ndef av_contrastive(audio_feat, video_feat, temperature=0.1):\n    a = torch.nn.functional.normalize(audio_feat, dim=-1)\n    v = torch.nn.functional.normalize(video_feat, dim=-1)\n    logits = (a @ v.t()) / temperature\n    labels = torch.arange(a.size(0))          # 对角线=同片段正样本\n    return torch.nn.functional.cross_entropy(logits, labels)",
  "complexity": "O(N²)",
  "beginnerSummary": "人说话时声音和嘴型是配套的。音视频联合模型同时“听声音”和“看口型”，在吵闹环境下即使听不清，也能通过看嘴唇把字猜对，并且让声音和画面对齐不跑偏。",
  "explanationFocus": "是什么：音视频联合多模态指同时建模语音/声音与视觉信号（如说话人唇形、场景画面），用于视听语音识别、音视频检索与跨模态生成，并通过对齐机制保持两模态语义一致。",
  "approach": "音频用 Whisper/HuBERT 式编码器、视频用唇部/人脸或场景编码器，二者经跨模态注意力融合；AVSR 用视觉补语音缺失；一致性用对比损失（同片段正负样本）与时序同步（互相关峰）约束，必要时加音视频扩散生成。",
  "derivation": [
    "为什么需要：纯语音在噪声/多人场景下失效，视觉提供互补线索；多模态需一致避免“画音不符”。",
    "怎么实现：双编码器+跨模态注意力，对比/同步损失对齐，AVSR 以视觉为辅助解码条件。",
    "有什么代价：需严格时间同步标注，唇部质量受遮挡/角度影响，训练数据稀缺。",
    "怎么评测：AVSR 词错率（WER）、音视频检索 R@K、同步一致性指标。"
  ],
  "edgeCases": [
    "说话人侧脸/遮挡，唇读信号弱。",
    "背景音乐与语音混淆，音频编码器误判。",
    "多人同时说话，声源与画面不匹配。",
    "音画轻微不同步，对比损失误罚。"
  ],
  "pitfalls": [
    "只做特征拼接不做跨模态注意力，未真正融合。",
    "用非同步数据做对比学习，学到错误对齐。"
  ],
  "prerequisites": [
    "语音表征（Whisper/HuBERT）",
    "跨模态对比学习与对齐"
  ],
  "workedExample": [
    "AVSR：噪声环境下模型结合唇形与含噪语音，WER 显著低于纯音频 ASR。",
    "音视频检索：用对比损失让“狗叫”声音与狗的画面向量靠近，支持跨模态搜索。"
  ],
  "lineByLine": [
    "av_contrastive 把音频与视频特征归一化后做点积，同片段（对角线）为正样本。",
    "cross_entropy 拉正样本近、负样本远，实现音画语义对齐、保持一致性。"
  ],
  "followUps": [
    {
      "question": "AVSR 在干净环境下还有用吗？",
      "answer": "安静时纯音频已足够，AVSR 增益有限甚至会因视觉噪声略降；因此常做门控融合，按信噪比动态加权视觉贡献。"
    },
    {
      "question": "如何获得大规模音视频对齐数据？",
      "answer": "利用影视台词时间戳、YouTube 自带字幕与语音对齐、或自监督（音画同时出现的片段天然正样本）降低标注成本。"
    }
  ],
  "followUpAnswers": [
    "安静时纯音频已足够，AVSR 增益有限甚至会因视觉噪声略降；因此常做门控融合，按信噪比动态加权视觉贡献。",
    "利用影视台词时间戳、YouTube 自带字幕与语音对齐、或自监督（音画同时出现的片段天然正样本）降低标注成本。"
  ]
};
