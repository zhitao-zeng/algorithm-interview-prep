export default {
  "id": "rs-two-tower",
  "kind": "concept",
  "category": "推荐系统",
  "title": "双塔召回(DSSM)：解耦的用户/物品塔与点积打分",
  "difficulty": "Medium",
  "prompt": "双塔模型(DSSM)如何做召回？为什么要把 user 塔和 item 塔解耦、各自编码后用点积打分，并配合 ANN 检索与负采样？",
  "quickAnswer": "双塔用两个独立编码器分别把 user 和 item 映射到低维向量，在线打分为向量内积/余弦。解耦使 item 塔可离线批量预计算并建 ANN 索引，召回时只算 user 向量再近邻检索，毫秒级从百万候选取千级。",
  "code": "import torch\nimport torch.nn as nn\n\ndef two_tower_score(user_feat, item_feat, user_tower, item_tower):\n    # 两塔各自编码，内积为匹配分\n    u = user_tower(user_feat)\n    v = item_tower(item_feat)\n    return torch.dot(u, v)\n\ndef info_nce_loss(pos, negs, temperature=0.1):\n    # 正样本内积最大化，负样本最小化\n    scores = [pos] + negs\n    logits = torch.stack(scores) / temperature\n    labels = torch.zeros(1, dtype=torch.long)\n    return nn.CrossEntropyLoss()(logits.unsqueeze(0), labels)",
  "complexity": "训练 O(B·k)；召回 O(user塔推理 + ANN 检索) 亚毫秒级",
  "beginnerSummary": "想象给每个用户和每个视频各做一张\"兴趣名片\"，名片越像越该推荐；双塔就是分别印名片，最后比一比谁最像。",
  "explanationFocus": "是什么：双塔(双塔召回/DSSM)是一种把用户侧与物品侧特征分别送入两个独立神经网络编码为向量、以向量相似度作为匹配分的召回模型，训练与 serving 解耦。",
  "approach": "user/item 塔各为 DNN 输出 d 维向量；损失用采样 softmax/对比学习(正样本内积最大化、负样本最小化)；线上 item 向量离线算好建索引，用户向量实时算后 ANN 取 TopK。",
  "derivation": [
    "为什么需要：精排无法对百万级候选逐条打分，需先在召回层快速缩小到千级。",
    "怎么实现：两侧塔各编码得向量，内积为匹配分；用 in-batch 负采样或曝光未点击作负例，对比损失训练。",
    "有什么代价：两侧向量在最后一层才交互，表达力弱于单塔；负采样质量直接影响召回效果。",
    "怎么评测：召回层用 Recall@K/命中率；端到端看下游精排 CTR；注意负样本构造带来的指标偏差。"
  ],
  "edgeCases": [
    "用户侧实时特征(上下文)与物品侧静态特征需分桶处理，避免 item 塔依赖实时信号。",
    "item 塔离线建库后新物品未及时入索引→需增量更新或兜底热门。",
    "batch 内负采样在大 batch 下正样本被稀释，需用 x-small 或混合 hard 负例。"
  ],
  "pitfalls": [
    "负采样只用随机负例，模型学不到难负例，召回精度差→加曝光未点击作为 hard 负。",
    "两塔最后才交互导致无法建模精细交叉特征，复杂交叉交给精排。"
  ],
  "prerequisites": [
    "Embedding 与表示学习",
    "对比学习/采样 softmax"
  ],
  "workedExample": [
    "item 向量维度 d=64，候库 1000 万；user 塔推理约 3ms，HNSW 检索 Top1000 约 5ms，端到端召回 <10ms。",
    "in-batch 负采样 batch=512，正样本内积 0.82、随机负例均值 0.11，对比损失拉近正例、推远负例。"
  ],
  "lineByLine": [
    "def two_tower_score：两侧塔各输出 d 维向量后做内积得匹配分。",
    "u = user_tower(user_feat)：用户塔编码，可含实时上下文特征。",
    "v = item_tower(item_feat)：物品塔编码，通常离线预计算建索引。",
    "def info_nce_loss：温度缩放对比损失，正样本最大化、负样本最小化。"
  ],
  "followUps": [
    {
      "question": "双塔为什么不能两端特征在早期交互？",
      "answer": "早期交互会让 item 塔依赖用户特征，无法离线批量预计算，失去\"解耦→ANN 检索\"的速度优势；这是为serving效率做的表达力妥协。"
    },
    {
      "question": "负采样怎么选才有效？",
      "answer": "混合随机负例(易)与曝光未点击/hard 负例(难)效果最好；纯随机学不到难区分边界，纯 hard 易过拟合，常用 in-batch + 全局采样结合。"
    }
  ],
  "followUpAnswers": [
    "早期交互会让 item 塔依赖用户特征，无法离线批量预计算，失去\"解耦→ANN 检索\"的速度优势；这是为serving效率做的表达力妥协。",
    "混合随机负例(易)与曝光未点击/hard 负例(难)效果最好；纯随机学不到难区分边界，纯 hard 易过拟合，常用 in-batch + 全局采样结合。"
  ],
  "order": 2
};
