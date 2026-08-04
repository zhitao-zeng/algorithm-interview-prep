export default {
  "id": "slm-training-stages",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "语音模型续训阶段",
  "prompt": "语音大模型常见的续训（continual training）阶段有哪些？ASR、STS、TTS 各阶段分别让模型学到什么？",
  "quickAnswer": "典型三阶段：ASR 阶段学'听'（语音→文本），STS 阶段学'懂/想'（语音语义对齐与推理），TTS 阶段学'说'（文本/语义→语音）。逐阶段冻结与解冻，避免灾难性遗忘。",
  "code": "def train_stage(model, stage, loader, opt):\n    freeze = {'asr': model.decoder,        # 听：只训 encoder\n              'sts': model.encoder,        # 懂：只训 LLM 主干\n              'tts': model.encoder}[stage] # 说：训 decoder\n    for batch in loader:\n        loss = model(batch, freeze=freeze)\n        opt.step(loss)",
  "complexity": "时间随数据量线性，空间 O(params)",
  "beginnerSummary": "就像先练听力（ASR）、再练理解（STS）、最后练口语（TTS），三阶段逐步把模型培养成既能听又能说的人。",
  "derivation": [
    "为什么需要：单阶段同时学听说是多任务冲突，分阶段可稳定对齐模态、降低训练难度。",
    "怎么实现：先 ASR 对齐语音-文本，再 STS 做语义推理续训，最后 TTS 学语音生成，逐阶段解冻相关模块。",
    "有什么代价：阶段间需保存检查点、调学习率，顺序不当易灾难性遗忘，总训练时长更长。",
    "怎么评测：每阶段分别用 WER（ASR）、任务准确率（STS）、MOS/RTF（TTS）监控，端到端再测整体。"
  ],
  "edgeCases": [
    "ASR 数据不足导致 STS 阶段语义对齐差，需要数据配比平衡。",
    "TTS 阶段若解冻 encoder 可能破坏已学听觉表征，需谨慎选层。",
    "低资源语言缺少平行语料，需用自监督弥补。",
    "阶段切换时优化器状态需重置避免冲击。"
  ],
  "pitfalls": [
    "所有阶段全参数同学习率训练，导致前期能力被后期覆盖（遗忘）。",
    "用纯文本数据做 STS 而忽略语音对齐，模型退化为文本 LLM。"
  ],
  "prerequisites": [
    "多任务与迁移学习",
    "ASR / TTS 基础管线"
  ],
  "workedExample": [
    "阶段1用 10k 小时 ASR 数据微调 encoder，WER 从 8% 降到 4%。",
    "阶段3用 TTS 配对数据训 decoder，MOS 从 3.2 提升到 4.0。"
  ],
  "lineByLine": [
    "freeze = {...}[stage]：按阶段决定冻结哪部分模块。",
    "for batch in loader：遍历该阶段的数据批次。",
    "loss = model(batch, freeze=freeze)：前向计算时冻结指定模块。",
    "opt.step(loss)：仅对未冻结参数做反向更新。"
  ],
  "followUps": [
    {
      "question": "如何缓解阶段间的灾难性遗忘？",
      "answer": "采用参数高效微调（LoRA/adapter）、阶段间 replay 少量旧数据、或使用 EWC 等正则约束重要参数。"
    },
    {
      "question": "是否一定要三阶段，能否两阶段？",
      "answer": "可以合并，如把 ASR 与 STS 合并为'听+懂'联合训练，但分离更易定位问题与调参，实践中按数据与时间预算取舍。"
    }
  ],
  "followUpAnswers": [
    "采用参数高效微调（LoRA/adapter）、阶段间 replay 少量旧数据、或使用 EWC 等正则约束重要参数。",
    "可以合并，如把 ASR 与 STS 合并为'听+懂'联合训练，但分离更易定位问题与调参，实践中按数据与时间预算取舍。"
  ],
  "explanationFocus": "是什么：语音模型续训阶段指在一个基础模型上分阶段注入听、懂、说能力，典型为 ASR（听）、STS（语义理解与推理）、TTS（说）三阶段，逐段解冻相关模块。",
  "approach": "以'先对齐再生成'的顺序分阶段训练，每阶段只放开最相关的子模块并复用前阶段检查点，从而在稳定收敛的同时逐步获得完整语音对话能力。",
  "kind": "concept"
};
