export default {
  "id": "recd-coldstart-adv",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "用户&物品冷启动进阶：元学习与实时特征",
  "difficulty": "Hard",
  "prompt": "对于新用户和新物品（冷启动），除了默认兜底策略，有哪些进阶方法可以利用元学习与实时特征来快速建模兴趣？",
  "quickAnswer": "物品冷启动可用内容/多模态特征与实时点击信号做快速embedding；用户冷启动可用元学习(MAML)从少量行为快速适配，或用跨域/社交关系泛化兴趣。关键是把\"冷\"转化为\"有内容语义与实时反馈\"的热。",
  "code": "import torch\n\ndef meta_adapt(model, support_x, support_y, lr=0.01):\n    # MAML 风格：在少量支持集上走一步内循环，得到个性化参数\n    params = [p.clone().requires_grad_(True) for p in model.parameters()]\n    for _ in range(5):\n        loss = model.loss(support_x, support_y, params)\n        grads = torch.autograd.grad(loss, params)\n        params = [p - lr * g for p, g in zip(params, grads)]\n    return params  # 冷用户快速适配后的参数",
  "complexity": "O(K·|θ|) 内循环 (K 步)",
  "beginnerSummary": "新用户没历史、新视频没播放，系统一开始不知道推什么。冷启动就是用内容本身的信息和最初几次反馈来\"猜\"兴趣。",
  "explanationFocus": "是什么：冷启动进阶指在不依赖长期行为日志的前提下，借助内容语义、元学习快速适配、跨域迁移与实时反馈信号，为全新用户/物品建立有效表征的技术集合。",
  "approach": "物品侧用多模态/文本特征生成 item embedding 并接实时点击更新；用户侧用 MAML 在少量支持集上内循环适配，或用兴趣泛化（群体先验+会话内序列）建模；再配合探索流量快速积累信号。",
  "derivation": [
    "为什么需要：纯 ID embedding 对零曝光物品/新用户无效，ID 稀疏导致无法泛化。",
    "怎么实现：内容特征预训练 item 语义向量；MAML 学\"易适配\"初始化；会话内实时序列建模新用户即时兴趣。",
    "有什么代价：内容特征与行为分布有 gap，元学习训练不稳定、内循环耗算力。",
    "怎么评测：冷启子集上的 CTR/完播，以及冷用户次日留存、新物品曝光渗透率。"
  ],
  "edgeCases": [
    "全新用户零行为，只能靠设备/上下文与内容热度兜底。",
    "新物品内容特征缺失（无封面/标题）需多模态补全。",
    "实时反馈噪声大（误触）需去噪与置信过滤。"
  ],
  "pitfalls": [
    "直接用全局热门填充，长期伤害个性化与多样性。",
    "元学习过拟合到\"易适配\"的少数任务，真实冷用户表现差。"
  ],
  "prerequisites": [
    "Embedding 与序列建模（DIN/Transformer）",
    "元学习(MAML)与迁移学习基础"
  ],
  "workedExample": [
    "新用户仅看了 3 个宠物视频；用会话序列 Transformer 立刻得到\"宠物\"兴趣向量，首屏偏向萌宠内容。",
    "新视频无播放：用封面+标题多模态 embedding 进入相似萌宠簇召回，并给 1% 探索流量，2 小时内积累点击后转入正常排序。"
  ],
  "lineByLine": [
    "def meta_adapt：输入模型与支持集，输出适配后参数。",
    "params = clone：复制原参数用于内循环，不动全局模型。",
    "for _ in range(5)：在支持集上做 5 步梯度下降模拟\"快速学习\"。",
    "return params：得到针对该冷用户的个性化参数，仅用极少样本。"
  ],
  "followUps": [
    {
      "question": "物品冷启动和内容推荐有什么区别？",
      "answer": "物品冷启动聚焦\"无行为新物品如何获得曝光\"，侧重实时特征与探索；内容推荐是更广义的用内容语义做召回排序，二者在语义 embedding 上重合但目标不同。"
    },
    {
      "question": "实时特征在冷启动里起什么作用？",
      "answer": "冷启动初期行为极少，实时点击/停留信号能在分钟级更新临时 embedding，把\"冷\"快速变\"温\"，是冷启转正的核心闭环。"
    }
  ],
  "followUpAnswers": [
    "物品冷启动聚焦\"无行为新物品如何获得曝光\"，侧重实时特征与探索；内容推荐是更广义的用内容语义做召回排序，二者在语义 embedding 上重合但目标不同。",
    "冷启动初期行为极少，实时点击/停留信号能在分钟级更新临时 embedding，把\"冷\"快速变\"温\"，是冷启转正的核心闭环。"
  ]
};
