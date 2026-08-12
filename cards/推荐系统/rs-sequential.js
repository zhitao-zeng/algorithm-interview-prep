export default {
  "id": "rs-sequential",
  "kind": "concept",
  "category": "推荐系统",
  "title": "序列推荐：行为序列建模与自注意力",
  "difficulty": "Hard",
  "prompt": "序列推荐如何把用户的行为序列当作\"句子\"来建模？Transformer/SASRec 用自注意力捕捉了什么，与 Markov 链或 GRU 相比有什么优势？",
  "quickAnswer": "序列推荐把用户历史行为(点击/购买)按时间排成序列，用序列模型预测下一个物品。SASRec 用自注意力直接建模任意位置依赖，比只记一步转移的 MC 和易遗忘的 GRU 更能捕捉长程兴趣。",
  "code": "import numpy as np\n\ndef self_attention(Q, K, V, mask=None):\n    d = Q.shape[-1]\n    scores = (Q @ K.T) / np.sqrt(d)      # 缩放点积\n    if mask is not None:\n        scores = np.where(mask, -1e9, scores)  # causal mask 防泄露\n    attn = softmax(scores, axis=-1)\n    return attn @ V\n\ndef softmax(x, axis=-1):\n    e = np.exp(x - x.max(axis=axis, keepdims=True))\n    return e / e.sum(axis=axis, keepdims=True)",
  "complexity": "自注意力 O(L²·d)；GRU O(L·d²)",
  "beginnerSummary": "把你的浏览历史当成一句话，SASRec 像读句子的模型，能联系\"前面看过手机壳、后面看充电线\"推断你接下来想买充电器。",
  "explanationFocus": "是什么：序列推荐把用户的行为历史视为有序序列，目标是预测下一个/下一批感兴趣的物品；SASRec 等用 Transformer 自注意力在序列上建模用户动态兴趣。",
  "approach": "物品转 embedding 加位置编码后送 Transformer；自注意力让每个位置聚合全序列信息，预测下一物品用 masked 语言建模式损失；相对 MC 看单步转移、GRU 记隐状态，自注意力可捕捉长程且并行。",
  "derivation": [
    "为什么需要：用户兴趣随时序演化，静态画像不足以表达当下意图。",
    "怎么实现：行为序列→embedding+位置编码→自注意力编码→取末位向量与物品向量点积排序。",
    "有什么代价：长序列 O(L²) 计算大，需截断/分段；冷序列样本少。",
    "怎么评测：用留最后一项的 Recall@K/MRR，对比 MC/GRU 基线。"
  ],
  "edgeCases": [
    "序列过长需截断或分段，截断丢早期兴趣。",
    "新物品无 embedding 需内容特征兜底(冷启动)。",
    "序列中误点击/刷量噪声需清洗或降权。"
  ],
  "pitfalls": [
    "用未来信息做预测(数据泄露)→必须 causal mask。",
    "直接套用 NLP 位置编码忽略物品幂律分布，效果不如学习型位置。"
  ],
  "prerequisites": [
    "Transformer 与自注意力",
    "Embedding 序列建模"
  ],
  "workedExample": [
    "序列 [手机壳, 钢化膜, 充电线]，SASRec 编码后预测下一物品\"充电器\"概率 0.31 居首；对比 MC 只看上一项转移仅 0.12。",
    "序列长 L=50, d=64，自注意力 50²*64≈16万次运算；GRU 约 50*64²≈20万，但自注意力可并行且长程更准。"
  ],
  "lineByLine": [
    "def self_attention：QKV 计算注意力权重，聚合序列信息。",
    "scores = (Q @ K.T) / sqrt(d)：缩放点积注意力，防数值过大。",
    "scores = where(mask, -1e9, scores)：causal mask 屏蔽未来，防数据泄露。",
    "return attn @ V：按注意力权重加权得到上下文表示。"
  ],
  "followUps": [
    {
      "question": "SASRec 和 GRU4Rec 怎么选？",
      "answer": "序列长、算力足、要捕捉长程依赖时选 SASRec(并行且长程好)；序列短或线上延迟极严时 GRU4Rec 更轻；两者都优于只记单步的 MC。"
    },
    {
      "question": "causal mask 忘了会怎样？",
      "answer": "模型在预测第 t 个物品时会\"偷看\"第 t 之后的行为，训练指标虚高但上线崩溃，因为这是用未来信息预测过去的典型数据泄露。"
    }
  ],
  "followUpAnswers": [
    "序列长、算力足、要捕捉长程依赖时选 SASRec(并行且长程好)；序列短或线上延迟极严时 GRU4Rec 更轻；两者都优于只记单步的 MC。",
    "模型在预测第 t 个物品时会\"偷看\"第 t 之后的行为，训练指标虚高但上线崩溃，因为这是用未来信息预测过去的典型数据泄露。"
  ],
  "order": 5
};
