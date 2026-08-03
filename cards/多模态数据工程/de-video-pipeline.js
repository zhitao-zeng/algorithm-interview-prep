export default {
  "id": "de-video-pipeline",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "视频数据清洗与 pipeline",
  "prompt": "如何构建一个可扩展的视频多模态数据清洗 pipeline，从原始视频到可用的（视频帧, 文本）训练样本？",
  "quickAnswer": "典型 pipeline 为：下载→解码抽帧→镜头/场景切分→质量与合规过滤（模糊、黑屏、OCR 文本）→音频转写/ASR 对齐→生成帧-文本对→去重入库。关键是用流式、可断点续跑的算子把各阶段解耦，并用元数据贯穿全程便于回捞。",
  "approach": "把 pipeline 拆成独立算子（extract、segment、filter、transcribe、align、dedup），每个算子读上游产物写下游，用任务队列并行，失败可重试且幂等。",
  "explanationFocus": "是什么：视频数据 pipeline 是把原始视频转成结构化多模态训练样本（关键帧+对应文本/语音转写）的批处理系统，强调可扩展、可观测、可回放。",
  "bruteForce": "朴素做法：单机循环逐视频处理，出错从头再来，无法并行也不能断点续跑。",
  "invariant": "核心不变式：每个视频有唯一 job_id 贯穿所有阶段，任一阶段产物落盘后才标记完成，保证幂等可重入。",
  "walkthrough": "1M 视频，抽帧 1fps 平均 300 帧/视频；场景切分后约 1200 万片段；过滤掉模糊/黑屏 20%，剩 960 万片段；ASR 转写后对齐成（帧, 字幕）对，最终入库约 800 万对。整 pipeline 在 200 机上约 3 天。",
  "code": "def run_pipeline(video_id, stages):\n    state = load_state(video_id)\n    for stage in stages:\n        if state.done(stage):\n            continue\n        run_stage(stage, video_id)\n        state.mark(stage)\n    return collect_samples(video_id)",
  "complexity": "单视频 O(帧数×每帧处理)，整体随视频数与并行度近似线性扩展；瓶颈常在解码与 ASR 推理。",
  "beginnerSummary": "像工厂流水线：视频进门先拆成一张张照片，再切镜头、挑清楚能用的、配上字幕文字，最后装箱入库，哪道工序卡住就从那道重来。",
  "diagram": "video ─► decode ─► segment ─► filter ─► ASR ─► align ─► dedup ─► store\n            │          │          │         │        │        │\n          job_id 贯穿每一阶段(幂等/可续跑)",
  "derivation": [
    "为什么需要：原始视频杂乱、冗长且含大量无效帧，必须切分过滤才能成为可用训练样本。",
    "怎么实现：算子化解耦各阶段，元数据 job_id 贯穿，队列并行+断点续跑。",
    "有什么代价：解码与 ASR 算力开销大，存储帧与文本成本高，需对象存储与索引。",
    "怎么评测：抽样看片段清晰度、字幕对齐准确率，并测下游视频理解任务收益。"
  ],
  "edgeCases": [
    "损坏/半截视频解码失败需标记跳过不阻塞全局。",
    "静音视频无 ASR，需改用画面 OCR 或留空文本。",
    "极端长视频抽帧过多，需按时长上限截断。",
    "黑屏/彩条测试片需被过滤规则识别。"
  ],
  "pitfalls": [
    "帧率抽太高导致存储爆炸且冗余。",
    "ASR 与画面时间轴未对齐，文本错配帧。"
  ],
  "prerequisites": [
    "视频编解码与抽帧基础",
    "ASR/语音转写",
    "流式批处理与任务队列"
  ],
  "workedExample": [
    "视频 10 分钟 @1fps → 600 帧，场景切分得 8 段。",
    "过滤掉 2 段模糊 → 剩 6 段共 450 帧。",
    "ASR 给每段生成字幕，对齐成 6 个（帧序列, 文本）样本。"
  ],
  "lineByLine": [
    "def run_pipeline(video_id, stages): 按阶段顺序处理单个视频。",
    "state = load_state(video_id) 读取该视频已完成阶段。",
    "if state.done(stage): continue 已完成则跳过，实现断点续跑。",
    "run_stage 执行并处理，state.mark 落盘标记保证幂等。"
  ],
  "codeNotes": [
    "stage 顺序可配置，方便单独重跑某阶段（如只重做过滤）。"
  ],
  "followUps": [
    {
      "question": "抽帧率怎么定？",
      "answer": "按内容变化速度，静态场景低帧率、动作密集高帧率，或用镜头切换自适应抽帧。"
    },
    {
      "question": "如何保证帧与文本对齐？",
      "answer": "用 ASR 时间戳映射到最近关键帧，并以片段为单位而非单帧做对齐更稳。"
    }
  ],
  "followUpAnswers": [
    "按内容变化速度，静态场景低帧率、动作密集高帧率，或用镜头切换自适应抽帧。",
    "用 ASR 时间戳映射到最近关键帧，并以片段为单位而非单帧做对齐更稳。"
  ],
  "kind": "concept"
};
