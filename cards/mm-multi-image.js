export default {
  "kind": "concept",
  "id": "mm-multi-image",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "多图与多轮多模态对话",
  "prompt": "模型怎么支持一次性看多张图、并在多轮对话里持续引用它们？",
  "quickAnswer": "多图时把每张图各自编码成视觉 token，用特殊标记(如 <img0>/<img1>)和位置编码区分，拼接进同一序列；多轮对话则把历史图文消息按对话模板累积(含之前图像 token 与回答)，模型靠注意力跨轮引用。挑战是序列随图数与轮数线性增长、跨图/跨轮指代易混，需要清晰的位置与角色标记。",
  "approach": "逐图编码 → 带标记/位置区分 → 拼入对话历史 → 注意力跨图跨轮引用。",
  "explanationFocus": "是什么：多图多轮对话支持是让模型同时消费多张图像并在连续问答中引用它们，靠图像标记、位置编码与对话历史拼接实现。",
  "bruteForce": "每轮只重发单图：丢跨图比较、上下文断裂。",
  "derivation": [
    "为什么需要：真实场景常需对比多图、连续追问，单图单轮无法满足。",
    "怎么实现：每张图经同一编码器得 token，插入 <image> 占位与序号；按多轮模板把用户/助手消息(含图 token)顺序拼成序列；用位置/模态标记避免混淆。",
    "有什么代价：图数×轮数使序列极长、KV 暴涨；跨图指代与\"第几张\"易错；长历史需截断。",
    "怎么评测：多图推理/比较基准、多轮一致性、指代准确率。"
  ],
  "invariant": "相同多图多轮输入得到稳定且能正确指代各图的输出。",
  "walkthrough": "3 张图各 256 token + 2 轮文本，总序列约 3×256 + 文本，注意力跨全部 token。",
  "edgeCases": [
    "指代\"左边那张\"需空间/序号对齐。",
    "历史过长需摘要/截断。",
    "图顺序变化应改变答案。"
  ],
  "code": "def multi_image_dialog(images, history, encoder, sep='<image>'):\n    img_toks = [encoder(im) for im in images]\n    seq = []\n    for turn in history:\n        if turn.has_image:\n            seq.append(sep + img_toks[turn.img_id])\n        seq.append(turn.text_tokens)\n    return concat(seq, dim=1)",
  "codeNotes": [
    "用占位符绑定图像序号。",
    "历史累积但需控长度。"
  ],
  "complexity": "O((Σ图token + 文本)^2) 注意力，随图数与轮数增长。",
  "followUps": [
    {
      "question": "多图怎么避免混淆？",
      "answer": "给每张图唯一标记与位置/模态编码，并在指令里显式指明\"图1/图2\"，训练数据覆盖多图指代。"
    },
    {
      "question": "多轮历史太长怎么办？",
      "answer": "对早期轮次做摘要或丢弃图像 token 仅留文本摘要，平衡上下文与长度。"
    }
  ],
  "followUpAnswers": [
    "唯一标记+显式指代训练。",
    "摘要/截断早期轮次。"
  ],
  "pitfalls": [
    "图像标记混乱致跨图指错。",
    "无脑累积历史致序列爆炸。"
  ],
  "beginnerSummary": "多图多轮就像把几张照片摊在桌上连续讨论。每张照片贴个编号(图1/图2)，对话时你说\"图2里那只猫\"，模型靠编号和位置记住哪张是哪张。照片和对话越多，桌上东西越多越占地方(算力)，所以太久的对话要适当收尾。",
  "prerequisites": [
    "单图可独立编码。",
    "对话需历史拼接。",
    "跨图指代需明确标记。"
  ],
  "workedExample": [
    "3 图各 256 token 带序号。",
    "两轮对话共享图像 token。"
  ],
  "lineByLine": [
    "逐图编码带序号标记。",
    "按模板拼接对话历史。",
    "位置/模态编码区分图与轮。",
    "注意力跨图跨轮引用。"
  ],
  "diagram": "图1─▶tok1  图2─▶tok2\n   └─▶ 对话模板(含<img1><img2>+文本) ─▶ LLM"
};
