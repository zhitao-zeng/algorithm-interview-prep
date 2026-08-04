export default {
  "id": "gen-audio-video",
  "category": "多模态生成应用",
  "difficulty": "Hard",
  "title": "音频驱动视频 / Talking Head 与消融定版",
  "prompt": "做音频驱动 talking head 视频（如 LongCat 音频驱动视频）时，如何通过 v6–v16 的消融实验定版模型结构？",
  "quickAnswer": "以音频特征为条件驱动面部运动网络，逐版消融音频编码器、时序模块、姿态解耦与后处理（如超分/唇形强化），用唇形同步率、身份保持与视频质量指标在验证集上选 v6–v16 中最优组合定版。",
  "code": "import torch\nimport torch.nn as nn\n\nclass AudioToMotion(nn.Module):\n    def __init__(self, audio_dim: int, motion_dim: int, hidden: int = 256):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Linear(audio_dim, hidden), nn.ReLU(),\n            nn.Linear(hidden, motion_dim))\n\n    def forward(self, audio_feat, n_frames: int):\n        # 把音频特征上采样到帧率后驱动面部运动\n        feat = audio_feat.unsqueeze(1).repeat(1, n_frames, 1)\n        return self.net(feat)\n",
  "complexity": "前向 O(T·(audio_dim→motion_dim))、训练 O(epoch·N)；推理实时逐帧",
  "beginnerSummary": "音频驱动视频像对口型机器人：听声音算出嘴巴每帧怎么动，再贴回脸上；消融就是逐个关掉零件看哪个真的有用。",
  "derivation": [
    "为什么需要：Talking head 需让嘴型跟语音对齐且不丢身份，结构选择多，需要系统消融避免拍脑袋定版。",
    "怎么实现：把音频特征上采样到帧率驱动运动网络，逐版开关音频编码器/注意力/后处理，固定训练集与指标对比 v6–v16。",
    "有什么代价：每版都要重训与评测，算力开销大；版本间超参耦合，单独消融可能忽略交互效应。",
    "怎么评测：用唇形同步指标（如 SyncNet 置信/偏移）、ArcFace 身份保持、FID/情感一致性打分综合排序定版。"
  ],
  "edgeCases": [
    "静音段或停顿会让运动网络输出静止脸，需加眨眼/微表情兜底。",
    "高语调或笑声超出训练分布，嘴型会抽搐。",
    "长视频跨段身份漂移，需要锚点帧对齐。",
    "多语种/口音改变音素-嘴型映射，需补数据。"
  ],
  "pitfalls": [
    "只看唇形同步率定版，忽略身份保持，导致嘴对但人不像。",
    "消融时改了学习率等超参，无法归因到结构本身。"
  ],
  "prerequisites": [
    "音频特征（mel/wav2vec）与序列建模",
    "人脸关键点 / 渲染与身份特征",
    "消融实验与多指标权衡"
  ],
  "workedExample": [
    "v10 加入时序注意力后 SyncNet 偏移从 4.2 降到 2.1，但 FID 升 3 点，说明更同步但略糊。",
    "v16 在 v10 基础上加轻量超分与唇形强化，FID 回落后综合第一，定为上线版本。"
  ],
  "lineByLine": [
    "class AudioToMotion(nn.Module)：定义音频到面部运动的映射网络。",
    "self.net：两层线性把音频维映射到运动维，中间 ReLU。",
    "def forward：接收音频特征与目标帧数。",
    "feat=audio_feat.unsqueeze(1).repeat(1,n_frames,1)：把音频沿时间复制成逐帧条件。",
    "return self.net(feat)：输出每帧面部运动参数。"
  ],
  "followUps": [
    {
      "question": "音频特征该用 mel 还是 wav2vec？",
      "answer": "mel 轻量且与声学对齐好，适合实时；wav2vec 语义更鲁棒但对齐唇形需额外对齐层，v 系列常做两者消融。"
    },
    {
      "question": "如何防止长视频身份漂移？",
      "answer": "每隔若干秒用首帧 anchor 做身份特征回注或插值约束，并对 latent 做跨段一致性损失。"
    },
    {
      "question": "后处理超分为什么放最后消融？",
      "answer": "超分只改清晰度不改同步语义，放后处理可独立评估其对 FID 的贡献，避免干扰主结构判断。"
    }
  ],
  "followUpAnswers": [
    "mel 轻量且与声学对齐好，适合实时；wav2vec 语义更鲁棒但对齐唇形需额外对齐层，v 系列常做两者消融。",
    "每隔若干秒用首帧 anchor 做身份特征回注或插值约束，并对 latent 做跨段一致性损失。",
    "超分只改清晰度不改同步语义，放后处理可独立评估其对 FID 的贡献，避免干扰主结构判断。"
  ],
  "explanationFocus": "是什么：音频驱动视频（talking head）是以语音信号为条件生成与之口型、表情同步的人脸视频，LongCat 音频驱动视频即此类管线，通过多版消融选定最终结构。",
  "approach": "固定训练数据与评测指标，逐版开关音频编码器、时序注意力与后处理模块，用唇形同步率+身份保持+画质三指标在 v6–v16 中做 Pareto 比较定版。",
  "kind": "concept"
};
