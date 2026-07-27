export default {
  "id": "gen-ip-adapter",
  "kind": "concept",
  "category": "生成式模型",
  "title": "IP-Adapter / 图像条件注入",
  "difficulty": "Medium",
  "prompt": "IP-Adapter / 图像条件注入是如何把参考图的风格或身份注入生成的？其 cross-attn 机制是怎样的？",
  "quickAnswer": "IP-Adapter 用一个独立的小图像编码器（如 CLIP image encoder）把参考图编码成若干 image tokens，并在 U-Net 的自注意力后插入额外的 cross-attention 层，让 denoising 特征去“关注”参考图 tokens，从而注入外观/身份/风格。文本仍走原 cross-attn，图像走并行分支，解耦且可插拔。",
  "code": "class IPAdapter(nn.Module):\n    def __init__(self, d):\n        self.img_proj = nn.Linear(768, d)     # 参考图 token 投影\n        self.cross = nn.MultiheadAttention(d, 8)\n    def forward(self, x, img_tokens):\n        k = v = self.img_proj(img_tokens)     # 图像作 K/V\n        return x + self.cross(x, k, v)[0]",
  "complexity": "O(N·M·d)，M 为图像 token 数",
  "beginnerSummary": "给模型看一张“参考照片”，它通过额外的注意力通道记住这张图的模样/气质，再把这种风格或长相融进新生成的图像里。",
  "explanationFocus": "是什么：IP-Adapter 是一类通过额外 cross-attention 把参考图像特征作为条件注入扩散模型、实现身份/风格保持的可插拔适配器。",
  "approach": "冻结主网，新增图像交叉注意力层：参考图经 CLIP 编码为 tokens，作为 K/V，与去噪特征 Q 做注意力，使生成逐步对齐参考外观；可设图像/文本权重平衡。",
  "derivation": [
    "为什么需要：文本难描述具体长相/品牌，需要图像级条件。",
    "怎么实现：插独立 cross-attn 分支，参考图 token 作 K/V 引导。",
    "有什么代价：参考图与文本冲突需权重调节；强注入会牺牲多样性。",
    "怎么评测：用身份相似度（如 face embedding）与风格 CLIP 相似度。"
  ],
  "edgeCases": [
    "图像权重过高会“复制”参考图而非生成新构图。",
    "多参考图可拼接 tokens 表达多身份/多风格。",
    "与 ControlNet 可叠加（结构+外观双重控制）。"
  ],
  "pitfalls": [
    "误把图像编码进文本 cross-attn——应走独立分支防干扰。",
    "忽略参考图分辨率与 CLIP 域差异导致注入弱。"
  ],
  "prerequisites": [
    "Cross-Attention",
    "CLIP 图像编码",
    "扩散条件注入"
  ],
  "workedExample": [
    "取一张人像，CLIP 编码为 4–16 个 image tokens。",
    "在 SD U-Net 各层插入图像 cross-attn，K/V 来自这些 tokens。",
    "给文本“在月球上”，生成同人不同场景的图。"
  ],
  "lineByLine": [
    "img_proj 把 CLIP 图像特征投影到扩散隐藏维。",
    "cross 中以去噪特征为 Q、图像 token 为 K/V。",
    "输出残差加回，使特征持续吸收参考外观。"
  ],
  "followUps": [
    {
      "question": "IP-Adapter 与 textual inversion 区别？",
      "answer": "textual inversion 学文本 embedding，容量小；IP-Adapter 用图像 tokens 经 cross-attn，表达力强且免训练新词。"
    },
    {
      "question": "能和多图融合吗？",
      "answer": "可把多张参考图 tokens 拼接作为 K/V，实现多身份/风格混合。"
    },
    {
      "question": "为何不微调主网？",
      "answer": "插拔式适配器保留原模型、参数少、可与其他控制器叠加。"
    }
  ],
  "followUpAnswers": [
    "textual inversion 学文本 embedding，容量小；IP-Adapter 用图像 tokens 经 cross-attn，表达力强且免训练新词。",
    "可把多张参考图 tokens 拼接作为 K/V，实现多身份/风格混合。",
    "插拔式适配器保留原模型、参数少、可与其他控制器叠加。"
  ]
};
