export default {
  "id": "vis-video-backbone",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "视频骨干：SlowFast/I3D/Timesformer/VideoMAE",
  "difficulty": "Hard",
  "prompt": "视频理解骨干网络（I3D、SlowFast、Timesformer、VideoMAE）如何建模时空？",
  "quickAnswer": "I3D 把 2D 卷积扩展为 3D 卷积直接处理时空体；SlowFast 用快慢双路径分别抓语义与运动；Timesformer 用时空分离自注意力降低复杂度；VideoMAE 把图像 MAE 推广到视频，靠高遮掩时序重建做自监督。核心权衡是时空耦合度、计算量与长程依赖。",
  "code": "import torch\n\ndef tubelet_embed(clip, patch=16):\n    # clip: [T,C,H,W] -> tubelet tokens [N, dim]\n    t = clip.unfold(0, patch, patch)\n    return t.reshape(t.size(0), -1)",
  "complexity": "O(T·H·W) 至 O(T·(H·W)^2)",
  "beginnerSummary": "视频比图片多了一个\"时间\"维度。怎么让模型既看懂一帧、又看懂动作，是视频骨干的核心问题。",
  "explanationFocus": "是什么：视频骨干是处理帧序列的网络，需在空间语义与时间动态间权衡；I3D/SlowFast 偏卷积，Timesformer/VideoMAE 偏注意力。",
  "approach": "I3D Inflated 2D 卷积为 3D；SlowFast 双帧率路径融合；Timesformer 用分块时空注意力（divided attention）降复杂度；VideoMAE 以高时序遮掩做重建预训练。",
  "derivation": [
    "为什么需要：单帧分类无法捕捉动作，需建模帧间变化与长程时序。",
    "怎么实现：要么 3D 卷积/双流，要么时空注意力，要么自监督重建。",
    "有什么代价：3D 卷积参数与计算随 T 立方增长；纯注意力对长视频显存爆炸。",
    "怎么评测：Kinetics/Something-Something 上 Top-1/Top-5 分类精度与 FLOPs。"
  ],
  "edgeCases": [
    "静态镜头（镜头固定）让时序建模几乎无信号。",
    "长视频高分辨率下注意力显存溢出。",
    "动作依赖跨大时间窗，短 clip 截断丢失因果。"
  ],
  "pitfalls": [
    "把视频骨干当独立帧处理会丢失运动信息。",
    "忽视帧采样率，导致动作被抽帧\"跳过\"。"
  ],
  "prerequisites": [
    "2D CNN 与注意力机制",
    "光流与运动表征基础"
  ],
  "workedExample": [
    "I3D 把 ResNet 卷积核从 3x3 扩为 3x3x3，逐段处理 16 帧。",
    "Timesformer 先帧内注意力再帧间注意力，避免在 T×H×W 上全连接。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def tubelet_embed(clip, patch)：把视频切成时空块（tubelet）。",
    "clip.unfold(0, patch, patch)：在时间维滑窗取连续 patch 帧块。",
    "reshape(...)：展平为 token 序列供 Transformer 使用。"
  ],
  "followUps": [
    {
      "question": "Timesformer 的 divided attention 为何高效？",
      "answer": "它将时空注意力拆成先帧内、再帧间两步，把复杂度从 (T·HW)^2 降到约 T·(HW)^2+HW·T^2，更适合长视频。"
    },
    {
      "question": "VideoMAE 的高时序遮掩有什么意义？",
      "answer": "视频相邻帧高度冗余，高遮掩率迫模型重建缺失帧，学到真正的时序结构而非复制邻近帧。"
    }
  ],
  "followUpAnswers": [
    "它将时空注意力拆成先帧内、再帧间两步，把复杂度从 (T·HW)^2 降到约 T·(HW)^2+HW·T^2，更适合长视频。",
    "视频相邻帧高度冗余，高遮掩率迫模型重建缺失帧，学到真正的时序结构而非复制邻近帧。"
  ]
};
