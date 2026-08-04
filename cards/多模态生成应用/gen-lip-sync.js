export default {
  "id": "gen-lip-sync",
  "category": "多模态生成应用",
  "difficulty": "Hard",
  "title": "唇形同步与 Audio Guidance 的工程取舍",
  "prompt": "做唇形同步时，CFG、蒸馏与 INT8 量化各有什么取舍，短句分段与响度归一又该怎么配？",
  "quickAnswer": "CFG 提升嘴型对齐但翻倍算力，蒸馏可少步推理但伤细节，INT8 省显存却引入轻微不同步；工程上先用 clean vocal、归一化到 −20 LUFS、按 50 steps 配短句分段，单卡约 23 min/段、CP4 约 6–8 min/段。",
  "code": "import torch\nimport pyloudnorm as pyln\nimport torch.nn.functional as F\n\ndef normalize_loudness(wav, sr: int, target_lufs: float = -20.0):\n    meter = pyln.Meter(sr)\n    loudness = meter.integrated_loudness(wav)\n    return pyln.normalize.loudness(wav, loudness, target_lufs)\n\ndef cfg_step(model, latents, audio_cond, t, cfg_scale: float = 2.0):\n    uncond = model(latents, t, audio_cond=None)\n    cond = model(latents, t, audio_cond=audio_cond)\n    return uncond + cfg_scale * (cond - uncond)\n",
  "complexity": "CFG 推理 O(2·steps)、蒸馏 O(steps/K)、INT8 省约 2–4× 显存；单段耗时 O(minutes)",
  "beginnerSummary": "唇形同步像给配音演员对口型：CFG 让嘴更准但更慢，蒸馏是速成版略糙，INT8 是压缩包更省地方；先修音再定响度最稳。",
  "derivation": [
    "为什么需要：原始音频含混响/噪声会让嘴型抖，需要 clean vocal 与统一响度；同时要在质量与速度间取舍上线。",
    "怎么实现：音频先去噪并 LUFS 归一化到 −20，按短句切段用 50 steps 生成；CFG 控条件强度，蒸馏减步，INT8 压模型。",
    "有什么代价：CFG 双倍前向；蒸馏损高频唇齿细节；INT8 在边界帧偶有不同步，需要后校验。",
    "怎么评测：用 SyncNet 偏移与置信、人工唇形评分，并统计单段耗时与显存，确认 CP4 提速不破质量线。"
  ],
  "edgeCases": [
    "气声/耳语缺少浊音，模型易低估嘴张度。",
    "强背景乐未剥离，LUFS 归一后语音被压，嘴型偏弱。",
    "超长句分段切在词中导致段间嘴型跳变。",
    "INT8 在首帧 warmup 不准，需丢弃前几帧。"
  ],
  "pitfalls": [
    "直接拿原始录音跑同步，噪声让嘴型抽搐还不报错。",
    "为提速把 CFG 和蒸馏一起开，细节崩坏且难归因。"
  ],
  "prerequisites": [
    "音频预处理与响度（LUFS）标准",
    "Classifier-Free Guidance 与模型量化",
    "唇形同步评测（SyncNet）"
  ],
  "workedExample": [
    "一段 30s 旁白先分离人声、归一化到 −20 LUFS，按标点切 3 段各 50 steps，单卡共约 23×3 min。",
    "同段在 CP4 集群上跑约 6–8 min/段，SyncNet 偏移仍 <2 帧，确认量化未破同步线。"
  ],
  "lineByLine": [
    "import pyloudnorm as pyln：引入响度计量与归一工具。",
    "def normalize_loudness：把音频规整到目标 LUFS。",
    "meter.integrated_loudness(wav)：测当前整体响度。",
    "pyln.normalize.loudness：按差值把响度拉到 −20 LUFS。",
    "def cfg_step：实现条件/无条件引导融合。",
    "uncond=model(...,audio_cond=None)：算无条件分支。",
    "cond=model(...,audio_cond)：算带音频条件分支。",
    "return uncond+cfg_scale*(cond−uncond)：按 scale 强化嘴型对齐。"
  ],
  "followUps": [
    {
      "question": "为什么定 −20 LUFS 而不是更响？",
      "answer": "−20 是语音内容常用播客/配音基准，过高会削波、过低模型感知弱，能稳定唇形幅度且不破音。"
    },
    {
      "question": "CP4 提速度的原理是什么？",
      "answer": "CP4 通常指 4 卡/4 路并行或专门推理优化，把分段并行化，单段从 23 min 降到 6–8 min，需保证段间一致。"
    },
    {
      "question": "蒸馏和 INT8 能叠加吗？",
      "answer": "可以叠加进一步提速，但要先分别验证质量底线，叠加后重点查边界帧不同步与齿音丢失。"
    }
  ],
  "followUpAnswers": [
    "−20 是语音内容常用播客/配音基准，过高会削波、过低模型感知弱，能稳定唇形幅度且不破音。",
    "CP4 通常指 4 卡/4 路并行或专门推理优化，把分段并行化，单段从 23 min 降到 6–8 min，需保证段间一致。",
    "可以叠加进一步提速，但要先分别验证质量底线，叠加后重点查边界帧不同步与齿音丢失。"
  ],
  "explanationFocus": "是什么：唇形同步（lip sync）是让生成人脸的口型与输入语音逐帧对齐，audio guidance 指用 CFG、蒸馏、量化等手段在质量—推理速度—显存三角中做工程取舍。",
  "approach": "先 clean vocal 并 LUFS 归一化，短句分段后以 50 steps + CFG 保对齐，按需引入蒸馏减步、INT8 省显存，并用 SyncNet 偏移守住同步底线。",
  "kind": "concept"
};
