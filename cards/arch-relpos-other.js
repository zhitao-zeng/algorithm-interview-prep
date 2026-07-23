export default {
  "kind": "concept",
  "id": "arch-relpos-other",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "其他相对位置编码方案（T5 bias、ALiBi）",
  "prompt": "除了 RoPE，T5 的相对位置偏置和 ALiBi 是怎么做相对位置编码的？",
  "quickAnswer": "T5 把相对位置分 bucket 学偏置加到 logits；ALiBi 用随距离线性递减的预设偏置，无需位置嵌入且易外推。",
  "approach": "对比两类加性相对方案：T5 的可学习 bucket 偏置 vs ALiBi 的固定斜率偏置。",
  "explanationFocus": "是什么：T5 的相对位置编码把相对距离 |i−j| 分桶（近距细、远距粗），每桶学一个偏置加到注意力分数；ALiBi 则不加任何位置嵌入，直接在分数上加 m·(i−j) 的线性惩罚（m 为每头预设斜率），距离越远分越低。",
  "bruteForce": "可学习绝对位置向量简单但无相对距离建模、不能外推。",
  "derivation": [
    "为什么需要：要让分数直接依赖相对距离，并尽量支持长序列外推。",
    "怎么实现：T5→score+=bias[bucket(|i−j|)]；ALiBi→score+=m·(i−j)。",
    "有什么代价：T5 需学偏置表且外推靠 bucket 设计；ALiBi 无绝对位置、丢弃绝对顺序线索但外推极佳。",
    "怎么评测：长上下文困惑度；ALiBi 训练短推长表现好，T5 在编码任务强。"
  ],
  "invariant": "不变量：二者都让『分数仅依赖相对距离』；ALiBi 偏置线性无周期故天然外推，T5 偏置可学但受 bucket 范围限制。",
  "walkthrough": "T5 bucket：距离 0–7 每格一桶、更远处对数合并；ALiBi：8 头斜率如 1/2,1/4,... 使不同头关注不同距离范围。",
  "edgeCases": [
    "ALiBi 无绝对位置，纯靠相对偏置，个别任务需补绝对线索。",
    "T5 bucket 边界是超参，影响长距建模。",
    "二者均为加性，可与 RoPE 思路对照（RoPE 为乘性）。"
  ],
  "code": "def t5_bias(rel_dist, buckets, bucket_bias):\n    # rel_dist=|i-j|, 映射到 bucket 索引\n    if rel_dist < len(buckets):\n        b = rel_dist\n    else:\n        b = buckets[rel_dist]      # 远处对数合并\n    return bucket_bias[b]",
  "codeNotes": [
    "T5 实际用对数桶：近距每距一桶、远距合并。",
    "bias 加到 softmax 前的分数。"
  ],
  "complexity": "均 O(N²) 偏置项（可缓存）；不增加注意力 O(N²d) 主复杂度。ALiBi 偏置无参数，T5 偏置参数量 O(buckets)。",
  "followUps": [
    {
      "question": "T5 bias 和 ALiBi 谁更易外推？",
      "answer": "ALiBi 更易，因偏置线性无限延伸；T5 需设计 bucket 上限与外延策略。"
    },
    {
      "question": "为何 ALiBi 多头用不同斜率？",
      "answer": "不同斜率让各头关注不同距离尺度，类似多分辨率的距离先验。"
    }
  ],
  "followUpAnswers": [
    "ALiBi 更易，因偏置线性无限延伸；T5 需设计 bucket 上限与外延策略。",
    "不同斜率让各头关注不同距离尺度，类似多分辨率的距离先验。"
  ],
  "pitfalls": [
    "以为 T5 bias 含绝对位置——它只建模相对距离。",
    "把 ALiBi 的斜率当成可学习——原始 ALiBi 斜率为预设几何序列。"
  ],
  "beginnerSummary": "T5 像给不同距离准备一叠『距离贴纸』（近的细、远的粗）贴到分数上；ALiBi 像一条固定规则：离得越远自动扣分，简单且能无限延伸。",
  "prerequisites": [
    "相对位置编码",
    "RoPE 原理",
    "注意力偏置"
  ],
  "workedExample": [
    "T5：距离 3 → bucket 3 的偏置。",
    "ALiBi：score += slope·(i−j)，越远越负。"
  ],
  "lineByLine": [
    "近距每距一桶、远距对数合并。",
    "bucket_bias[b] 查得可学偏置。",
    "偏置加到 softmax 前分数。"
  ],
  "diagram": "T5:   score += learned_bias[bucket(|i-j|)]\nALiBi:score += m * (i - j)   (m 预设, 线性)"
};
