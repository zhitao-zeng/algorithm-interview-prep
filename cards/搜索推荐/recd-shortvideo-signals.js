export default {
  "id": "recd-shortvideo-signals",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "短视频特有信号：完播、停留时长与负反馈",
  "difficulty": "Medium",
  "prompt": "短视频推荐相比长视频/图文，有哪些特有信号（完播率、停留时长、滑走、负反馈）？如何把这些信号建模进排序目标？",
  "quickAnswer": "短视频核心信号是完播率、有效播放、停留时长、滑走(快速划过)与显式负反馈(不感兴趣/举报)。这些连续/隐式信号比点击更反映真实满意度，常作为多目标或权重项进入 loss，并对滑走做强负例惩罚。",
  "code": "def short_video_label(play_duration, video_len, dwell, swiped):\n    # 构造短视频监督信号\n    finish_rate = play_duration / max(video_len, 1)\n    if swiped and dwell < 2:\n        return -1.0            # 强负例：秒划\n    if finish_rate >= 0.9:\n        return 1.0             # 完播正例\n    return finish_rate - 0.3   # 部分观看给中间分\n\ndef sample_weight(label):\n    return 2.0 if label == -1.0 else 1.0  # 负反馈加权",
  "complexity": "O(1) per impression",
  "beginnerSummary": "短视频用户手指一划就走。点不点反而没那么重要，更关键的是\"看没看完\"\"看了几秒就划走\"，这些才是短视频独有的真实态度。",
  "explanationFocus": "是什么：短视频特有信号指完播率、有效播放、停留时长、快速滑走与显式负反馈等，比点击更能刻画用户在极短交互中的真实满意度。",
  "approach": "把完播率与停留时长作为回归/分类目标；把\"秒划\"与\"不感兴趣\"作为强负例并加权；滑走序列建模为负向序列特征；与点击、互动一起进入多目标融合。",
  "derivation": [
    "为什么需要：短视频决策成本低，点击噪声大，完播/滑走更能区分好内容。",
    "怎么实现：定义 finish_rate 回归目标；秒划打 -1 强负例；负反馈进 loss 加权。",
    "有什么代价：时长目标分布长尾、阈值敏感，误判滑走为不喜会伤探索。",
    "怎么评测：完播率、人均时长、负反馈率与次留。"
  ],
  "edgeCases": [
    "超短视频(5秒)完播率意义不同需归一化。",
    "误触滑走需结合回看判定。",
    "负反馈(举报)极稀疏需单独处理。"
  ],
  "pitfalls": [
    "只用点击忽略滑走，推高\"前3秒吸睛\"低质内容。",
    "完播率绝对阈值不分视频长度。"
  ],
  "prerequisites": [
    "多目标排序基础",
    "隐式负反馈与样本加权"
  ],
  "workedExample": [
    "视频 A：用户看了 2 秒划走(总 30s) → label=-1 强负例。",
    "视频 B：用户看完并停留评论 → finish_rate=1, label=1；模型学到 B 优于 A，尽管两者都\"点击\"了。"
  ],
  "lineByLine": [
    "def short_video_label：综合多种行为给出监督标签。",
    "finish_rate = play/video_len：完播率。",
    "if swiped and dwell<2: return -1：秒划判定强负例。",
    "def sample_weight：对强负例给 2 倍权重强化惩罚。"
  ],
  "followUps": [
    {
      "question": "完播率在不同长度视频间怎么可比？",
      "answer": "用相对完播率(播放/时长)或分桶归一化，也可改用时长占用户总消费比，避免长视频天然吃亏。"
    },
    {
      "question": "滑走和\"不感兴趣\"负反馈有何区别？",
      "answer": "滑走是隐式弱负反馈(可能误触)，\"不感兴趣/举报\"是显式强负反馈，后者权重更高且直接降权相似内容。"
    }
  ],
  "followUpAnswers": [
    "用相对完播率(播放/时长)或分桶归一化，也可改用时长占用户总消费比，避免长视频天然吃亏。",
    "滑走是隐式弱负反馈(可能误触)，\"不感兴趣/举报\"是显式强负反馈，后者权重更高且直接降权相似内容。"
  ]
};
