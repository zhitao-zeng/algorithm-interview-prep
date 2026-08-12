export default {
  "id": "rs-multi-modal",
  "kind": "concept",
  "category": "推荐系统",
  "title": "多模态推荐：图文视频特征融合",
  "difficulty": "Hard",
  "prompt": "多模态推荐如何把图像/文本/视频特征融合进排序模型，早期融合、晚期融合与跨模态注意力各有什么取舍，TikTok 这类场景又如何处理视觉特征与模态缺失？",
  "quickAnswer": "早期融合在输入层拼接各模态特征再进统一网络，交互强但模态异构难对齐；晚期融合先各模态独立打分再加权，灵活但错失交叉；跨模态注意力让一模态作为 query 去检索另一模态，对齐更好。TikTok 用 ViT/帧特征提视觉、BERT 提文本，靠对比学习做跨模态对齐，训练时模态丢弃(modality dropout)缓解推理期缺图缺文。",
  "code": "import numpy as np\n\ndef cross_modal_fuse(img_feat, text_feat, W_q, W_k, W_v):\n    # 图像作 query, 文本作 key/value 的跨模态注意力\n    q = W_q @ img_feat\n    k = W_k @ text_feat\n    v = W_v @ text_feat\n    a = np.exp(q @ k) / np.sum(np.exp(q @ k))   # 对齐权重\n    return a @ v                                # 文本对齐后的视觉增强表示\n\ndef modality_dropout(feats, p=0.1):\n    # 训练时随机丢弃某模态, 缓解推理期模态缺失\n    mask = (np.random.rand(len(feats)) > p).astype(float)\n    return [f * m for f, m in zip(feats, mask)]\n\ndef late_fusion(s_img, s_text, w=(0.6, 0.4)):\n    return w[0] * s_img + w[1] * s_text          # 各模态独立打分再加权",
  "complexity": "跨模态注意力: O(d²)；晚期融合: O(d)",
  "beginnerSummary": "就像看短视频既看画面又听文案，你大脑把\"画面里的美食\"和\"文案说的店名\"对上号才决定点赞；多模态推荐也是把图、文、视频对上号再综合判断。",
  "explanationFocus": "是什么：多模态推荐是把图像、文本、视频等异构内容特征融合进召回/排序的范式，通过早期拼接、晚期打分或跨模态注意力对齐，弥补 ID 特征冷启动与稀疏问题。",
  "approach": "用预训练骨干(ViT/BERT/视频编码器)抽各模态表示，早期拼接、晚期加权或跨模态注意力对齐后，与 ID 特征拼接进主模型；训练期模态丢弃增强鲁棒性。",
  "derivation": [
    "为什么需要：新物品无交互历史，ID 特征失效，内容多模态可提供冷启动信号。",
    "怎么实现：骨干抽特征→早期/晚期/注意力融合→接主排序网络。",
    "有什么代价：跨模态对齐难、模态缺失会塌缩，且多骨干推理延迟高。",
    "怎么评测：冷启动子集 Recall@K、线上 CTR/完播，对比纯 ID 模型。"
  ],
  "edgeCases": [
    "推理时图片审核失败导致视觉特征缺失，需靠 modality dropout 训练出的回退路径。",
    "视频长 but 只取首帧会漏掉关键内容，需多帧/片段聚合。",
    "文本与图像语义冲突(标题党)时跨模态对齐会混乱，需一致性判别。"
  ],
  "pitfalls": [
    "直接拼接异构模态不经对齐，量纲与语义不一致导致主导模态压过其它。",
    "训练从不丢模态，上线遇到缺图缺文直接性能崩，缺乏鲁棒性。"
  ],
  "prerequisites": [
    "多模态表征与预训练骨干(ViT/BERT)",
    "注意力与特征融合方法"
  ],
  "workedExample": [
    "TikTok 视频抽 8 帧经 ViT-L/14 得 8×768-d，池化为 768-d 视觉；标题经 BERT-base 得 768-d 文本；早期融合 concat→1536-d 接 DIN，冷启动 CTR +6%。",
    "模态丢弃 p=0.1 训练后，模拟\"缺图\"推理，NDCG@10 仅降 2.1%，而未做丢弃的基线降 11.7%。"
  ],
  "lineByLine": [
    "def cross_modal_fuse：以图像为 query 检索文本, 做跨模态对齐。",
    "a = softmax(q @ k)：得到文本各片段对图像的相关权重。",
    "return a @ v：按权重汇总文本, 输出图像对齐后的增强表示。",
    "def modality_dropout：随机置零某模态, 模拟并抗推理期缺失。"
  ],
  "followUps": [
    {
      "question": "早期融合和晚期融合怎么选？",
      "answer": "早期融合交互充分、适合模态强相关且都稳定存在的场景；晚期融合灵活、易做模态缺失回退，但错过早交叉。工业常混合：底层跨模态对齐+顶层打分融合。"
    },
    {
      "question": "TikTok 视觉特征怎么和 ID 特征对齐？",
      "answer": "常用对比学习(如 CLIP 式)把视觉编码与文本/行为表示拉到同空间，再映射到 ID embedding 维度拼接；也可用视觉特征初始化新物品 ID 向量做冷启动。"
    }
  ],
  "followUpAnswers": [
    "早期融合交互充分、适合模态强相关且都稳定存在的场景；晚期融合灵活、易做模态缺失回退，但错过早交叉。工业常混合：底层跨模态对齐+顶层打分融合。",
    "常用对比学习(如 CLIP 式)把视觉编码与文本/行为表示拉到同空间，再映射到 ID embedding 维度拼接；也可用视觉特征初始化新物品 ID 向量做冷启动。"
  ],
  "order": 17
};
