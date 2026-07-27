export default {
  "id": "recd-generative-rec",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "生成式推荐：TIGER 与 LLM-as-Recommender",
  "difficulty": "Hard",
  "prompt": "什么是生成式推荐（如 TIGER）？它用 item 语义 ID 替代传统 ID embedding 的思路是什么，和传统召排有何不同？",
  "quickAnswer": "生成式推荐把推荐看作\"生成下一个 item\"的序列生成问题：TIGER 用 RQ-VAE 把 item 编码成离散语义 ID 序列，再用 Transformer 自回归生成。相比传统 ID embedding，它天然泛化到冷启动、可做零样本推荐，但推理成本与语义 ID 质量是关键瓶颈。",
  "code": "import torch\n\ndef semantic_id(item_feat, rqvae):\n    # RQ-VAE：残差量化得到多级 code 作为 item 语义 ID\n    z = rqvae.encoder(item_feat)\n    codes = []\n    for q in rqvae.quantizers:\n        z, code = q(z)        # 每级最近码本向量 + 离散 code\n        codes.append(code)\n    return codes              # 如 [12, 4, 7] 即 item 的语义 ID\n\n# 自回归：P(id_t | id_<t, user_seq)\n",
  "complexity": "O(L·K·D) 生成 (L 序列长)",
  "beginnerSummary": "传统推荐给每个视频编个号码，新视频没号码就懵了。生成式推荐给视频起一串\"语义编号\"，模型像写作文一样续写出下一个视频的编号。",
  "explanationFocus": "是什么：生成式推荐将推荐建模为自回归生成任务，用离散语义 ID 表示 item，由序列模型直接生成用户下一个可能感兴趣的 item ID 序列。",
  "approach": "先用 RQ-VAE 把 item 内容特征量化成多级语义 ID；再把用户行为序列当作 token 序列，训练 Transformer 预测下一组语义 ID；推理时 beam search 解码出候选 item，可用 LLM 注入语义推理。",
  "derivation": [
    "为什么需要：传统 ID embedding 无法处理零曝光新物品，且召排分离带来信息损失。",
    "怎么实现：RQ-VAE 量化得语义 ID；序列模型自回归生成；LLM 用自然语言偏好做零样本推荐。",
    "有什么代价：语义 ID 量化有损、推理慢、beam search 成本高，且依赖内容特征质量。",
    "怎么评测：Recall@K/NDCG 同传统，外加冷启 Recall 与生成多样性。"
  ],
  "edgeCases": [
    "语义 ID 碰撞（不同物品同 code）导致混淆。",
    "长尾 item 量化码本覆盖不足。",
    "LLM 推理延迟高需蒸馏或缓存。"
  ],
  "pitfalls": [
    "把语义 ID 当普通 token 忽视层级结构。",
    "仅用标题文本，忽略多模态导致 ID 语义不准。"
  ],
  "prerequisites": [
    "RQ-VAE / 向量量化(VQ)",
    "自回归语言模型(Transformer)"
  ],
  "workedExample": [
    "某美食视频经 RQ-VAE 得到语义 ID [3,9,2]；用户历史序列 token 化为 [5,1,.., 3,9,2]。",
    "模型自回归续写出 [3,9,5]，解码回码本得到同簇\"烘焙\"视频，实现零曝光新品被推荐。"
  ],
  "lineByLine": [
    "def semantic_id：把 item 特征转成语义 ID。",
    "z = encoder：编码内容特征到连续向量。",
    "for q in quantizers：逐级残差量化，得到多级离散 code。",
    "return codes：返回如 [12,4,7] 的层级语义 ID 供生成模型使用。"
  ],
  "followUps": [
    {
      "question": "语义 ID 和传统 item ID 最大的区别？",
      "answer": "传统 ID 是随机独热、无语义且不可泛化；语义 ID 由内容量化得到，相似物品共享前缀 code，天然支持冷启动与层次化召回。"
    },
    {
      "question": "生成式推荐能完全替代召排吗？",
      "answer": "短期内难替代：生成式推理成本高、候选规模受限，更常见是作为召回补充或重排，与传统双塔/粗排级联。"
    }
  ],
  "followUpAnswers": [
    "传统 ID 是随机独热、无语义且不可泛化；语义 ID 由内容量化得到，相似物品共享前缀 code，天然支持冷启动与层次化召回。",
    "短期内难替代：生成式推理成本高、候选规模受限，更常见是作为召回补充或重排，与传统双塔/粗排级联。"
  ]
};
