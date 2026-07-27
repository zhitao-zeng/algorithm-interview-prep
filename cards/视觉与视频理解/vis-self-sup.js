export default {
  "id": "vis-self-sup",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "视觉自监督：SimCLR/MoCo/MAE 与表征学习",
  "difficulty": "Hard",
  "prompt": "对比学习（SimCLR/MoCo）与掩码重建（MAE）如何做视觉自监督？表征学习为何重要？",
  "quickAnswer": "对比学习对同一图的不同增强视图拉近距离、推远异图（SimCLR 靠大 batch、MoCo 靠动量编码器+队列维护负样本）；MAE 则随机遮掩大量 patch 让编码器-解码器重建像素。二者都无需标注即可学到可迁移的视觉表征，下游微调或线性探针表现接近有监督。",
  "code": "import torch\n\ndef infonce(z1, z2, temperature=0.1):\n    z = torch.cat([z1, z2], 0)\n    z = torch.nn.functional.normalize(z, dim=1)\n    sim = z @ z.T / temperature\n    labels = torch.arange(z.size(0))\n    labels = (labels + z1.size(0)) % z.size(0)\n    return torch.nn.functional.cross_entropy(sim, labels)",
  "complexity": "O(B^2) 对比, B=batch",
  "beginnerSummary": "没有标签也能学？自监督靠\"自己造题\"：要么让同一张图的两种变形被认为是同一样（对比），要么遮住一部分让模型猜出来（重建）。",
  "explanationFocus": "是什么：视觉自监督用数据自身构造监督信号（对比或重建），训练通用表征；SimCLR/MoCo 属对比学习，MAE 属掩码重建。",
  "approach": "对比学习最大化同图视图互信息、最小化异图；MoCo 用动量编码器与队列扩大负样本且保持一致；MAE 高遮掩率下只用可见 patch 编码、轻解码器重建，逼出结构表征。",
  "derivation": [
    "为什么需要：标注昂贵，且专用标签限制表征广度，自监督可借海量无标签数据。",
    "怎么实现：构造 pretext task（增强对比 / 掩码重建），用投影头对齐或像素还原。",
    "有什么代价：对比需大量负样本或 batch，MAE 高遮掩利于表征但预训练-微调不一致需调头。",
    "怎么评测：线性探针（冻结编码器训线性分类）、下游微调 mAP/精度、kNN 准确率。"
  ],
  "edgeCases": [
    "增强过弱导致任务太易、表征崩塌到常数。",
    "batch 过小负样本不足，对比损失失效。",
    "MAE 对遮挡率敏感，过低则学不到结构。"
  ],
  "pitfalls": [
    "以为投影头要保留到下游，实际评估时应去掉投影头。",
    "忽略增强策略（如缺失裁剪）会使对比学习退化为平凡解。"
  ],
  "prerequisites": [
    "编码器-投影器结构与表征空间",
    "InfoNCE 与交叉熵损失"
  ],
  "workedExample": [
    "SimCLR 对一张猫图做两种裁剪+色彩抖动，两视图编码后拉近。",
    "MAE 遮盖 75% patch，仅用 25% 可见 patch 编码后重建整图。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def infonce(...)：实现 InfoNCE 对比损失。",
    "z = cat([z1,z2]) 并 normalize：拼接两视图特征并归一化。",
    "sim = z @ z.T / T：计算两两余弦相似度除以温度。",
    "labels 重排：使 z1[i] 的正对为 z2[i]，其余为负对，再交叉熵。"
  ],
  "followUps": [
    {
      "question": "MoCo 的动量编码器解决了什么问题？",
      "answer": "它用缓慢更新的键编码器保持负样本队列表征一致，避免大 batch 显存压力，同时提供大量稳定负样本。"
    },
    {
      "question": "MAE 为何要非对称编解码？",
      "answer": "高遮掩率下仅对可见 patch 用重编码器、轻解码器重建，既降计算又迫使模型理解全局结构，而非依赖局部线索。"
    }
  ],
  "followUpAnswers": [
    "它用缓慢更新的键编码器保持负样本队列表征一致，避免大 batch 显存压力，同时提供大量稳定负样本。",
    "高遮掩率下仅对可见 patch 用重编码器、轻解码器重建，既降计算又迫使模型理解全局结构，而非依赖局部线索。"
  ],
  "order": 4
};
