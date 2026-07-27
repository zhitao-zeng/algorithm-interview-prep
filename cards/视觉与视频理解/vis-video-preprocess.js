export default {
  "id": "vis-video-preprocess",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "视频预处理与工程化：解码/抽帧/分辨率流水线",
  "difficulty": "Easy",
  "prompt": "视频理解推理流水线中，解码、抽帧、分辨率处理等预处理有哪些工程要点与陷阱？",
  "quickAnswer": "视频预处理常包括：硬件/软件解码（避免逐帧全解）、按策略抽帧（均匀/关键帧）、缩放与归一化、batch 拼装。要点是尽量用 GPU 解码与零拷贝、按模型接受窗口抽帧避免丢动作、保持长宽比与均值方差一致。陷阱：抽帧率与训练不一致、色彩空间（BGR/RGB）错、解码成为瓶颈。",
  "code": "import torch\n\ndef sample_frames(video_len, num_frames=8, strategy='uniform'):\n    if strategy == 'uniform':\n        idx = torch.linspace(0, video_len - 1, num_frames).long()\n    return idx",
  "complexity": "O(T) 抽帧扫描",
  "beginnerSummary": "视频不能直接塞给模型：得先解压、挑帧、缩放好。预处理流水线跑不顺，模型再强也卡在前面。",
  "explanationFocus": "是什么：视频预处理是把原始视频转成模型可用张量的工程步骤，含解码、抽帧、缩放归一与拼 batch；它决定吞吐与一致性。",
  "approach": "用硬解/快速解码头减少 CPU 瓶颈；按固定窗口均匀或关键帧抽帧；保持与训练一致的尺寸/色彩/均值方差；流水线并行解包与推理。",
  "derivation": [
    "为什么需要：原始视频体量大、格式杂，直接逐帧解码太慢且窗口不固定。",
    "怎么实现：异步解码+抽帧队列+张量预处理。",
    "有什么代价：抽帧丢信息、解码占 CPU、不一致导致分布偏移。",
    "怎么评测：端到端吞吐(QPS)、预处理耗时占比、精度一致性。"
  ],
  "edgeCases": [
    "短视频不足 num_frames 需重复/补帧。",
    "可变帧率导致均匀抽帧间隔不稳。",
    "HDR/畸变视频色彩空间处理错。"
  ],
  "pitfalls": [
    "训练用 RGB、推理用 BGR，导致精度骤降。",
    "抽帧率与训练不一致，动作类别分布偏移。"
  ],
  "prerequisites": [
    "视频编解码基础",
    "张量归一化与数据加载"
  ],
  "workedExample": [
    "一条 300 帧视频均匀抽 8 帧送入 SlowFast。",
    "用 NVDEC 硬解避免 CPU 成为推理瓶颈。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def sample_frames(video_len, num_frames, strategy)：抽帧索引生成。",
    "torch.linspace(0, video_len-1, num_frames).long()：均匀取等间隔索引。",
    "return idx：返回用于从解码帧序列中切出的帧下标。"
  ],
  "followUps": [
    {
      "question": "为什么解码常成视频推理瓶颈？",
      "answer": "高压缩视频解码是 CPU 密集且串行，若不用硬件解码/批处理，解码吞吐远低于 GPU 推理，成为端到端上限。"
    },
    {
      "question": "抽帧策略如何影响动作识别？",
      "answer": "均匀抽帧可能跳过瞬态动作，关键帧/光流辅助可保留运动；策略须与训练一致否则分布偏移。"
    }
  ],
  "followUpAnswers": [
    "高压缩视频解码是 CPU 密集且串行，若不用硬件解码/批处理，解码吞吐远低于 GPU 推理，成为端到端上限。",
    "均匀抽帧可能跳过瞬态动作，关键帧/光流辅助可保留运动；策略须与训练一致否则分布偏移。"
  ],
  "order": 14
};
