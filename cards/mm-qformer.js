export default {
  "kind": "concept",
  "id": "mm-qformer",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "Q-Former 跨模态连接器",
  "prompt": "Q-Former 这类跨模态连接器在多模态模型里解决什么问题？",
  "quickAnswer": "Q-Former(BLIP-2)用一组可学习的查询 token 通过交叉注意力从视觉编码器输出中\"提炼\"出固定数、与文本对齐的视觉表示，把冗长且不对齐的视觉 token 压缩成少量高质量 token 再喂 LLM。它解决了视觉 token 过长、与文本空间不对齐两大痛点，是经典的连接器设计。",
  "approach": "固定查询 token → 交叉注意力读视觉特征 → 自注意力+文本交互 → 压缩对齐的视觉 token → LLM。",
  "explanationFocus": "是什么：Q-Former 是一种跨模态连接器，用可学习的查询向量从图像特征中\"提问式\"抽取少量、与文本对齐的视觉 token，桥接视觉编码器与 LLM。",
  "bruteForce": "把全部 ViT token 直接塞 LLM：太长且未对齐、浪费 KV。",
  "derivation": [
    "为什么需要：ViT 输出 token 多且与 LLM 词空间不同构，直接拼接既贵又难训。",
    "怎么实现：N 个 learnable query 经多层，每层对视觉特征做交叉注意力、对彼此做自注意力，并可接文本做对比/生成预训练；输出 N 个对齐 token。",
    "有什么代价：查询数 N 固定，过小丢信息、过大失压缩意义；多阶段预训练工程复杂。",
    "怎么评测：下游 VQA/图文生成、视觉 token 数 vs 效果的权衡、LLM 微调难度。"
  ],
  "invariant": "无论原图视觉 token 多少，Q-Former 输出固定 N 个与文本对齐的查询 token。",
  "walkthrough": "ViT 出 257 token → Q-Former 用 32 个 query 交叉注意力压缩为 32 个对齐 token → 投影进 7B LLM。",
  "edgeCases": [
    "查询数过少丢细粒度信息。",
    "高分辨率原图信息密度高，需更多 query。",
    "纯视觉预训练与后续 LLM 对齐需两段训练。"
  ],
  "code": "def qformer(queries, visual_feat, text_feat=None):\n    x = queries\n    for layer in q_layers:\n        x = self_attn(x)                          # 查询间交互\n        x = cross_attn(x, visual_feat)            # 从视觉提炼\n        if text_feat is not None:\n            x = cross_attn(x, text_feat)          # 与文本对齐\n    return x                                      # (B, N_query, d)",
  "codeNotes": [
    "query 数 N 是核心超参。",
    "交叉注意力是\"提炼\"关键。"
  ],
  "complexity": "O(N·V) 每层的跨注意力；N 远小于 V 故大幅压缩。",
  "followUps": [
    {
      "question": "Q-Former 和简单 MLP 连接器差在哪？",
      "answer": "MLP 只做维度投影不压缩 token 数；Q-Former 用注意力把可变长视觉特征压成固定少量对齐 token。"
    },
    {
      "question": "查询 token 数怎么定？",
      "answer": "在效果与长度间权衡，常 32~64；细粒度/高分辨率任务可加大。"
    }
  ],
  "followUpAnswers": [
    "Q-Former 会压缩 token 数。",
    "按效果与长度权衡，常 32~64。"
  ],
  "pitfalls": [
    "把连接器当成纯投影，忽视其压缩作用。",
    "查询过少导致细粒度信息丢失。"
  ],
  "beginnerSummary": "Q-Former 像让几个\"记者\"(查询 token)去采访一大堆\"现场照片\"(视觉 token)，每人只问出最关键的一句总结，最后把这几句精炼报道交给写稿的 LLM。这样既简短又和文字口径一致，省时又清楚。",
  "prerequisites": [
    "视觉 token 长且与文本不同空间。",
    "注意力可跨模态提取信息。",
    "需固定长度以稳定喂 LLM。"
  ],
  "workedExample": [
    "ViT 出 257 token。",
    "32 个 query 压成 32 个对齐 token。"
  ],
  "lineByLine": [
    "初始化可学习查询 token。",
    "查询间自注意力交互。",
    "对视觉特征做交叉注意力提炼。",
    "可选与文本交叉对齐，输出压缩 token。"
  ],
  "diagram": "ViT tokens(多) ─▶ 交叉注意力 ← 查询(少,N)\n                        │\n                    自注意力(查询间)\n                        │\n                   N 个对齐 token ─▶ LLM"
};
