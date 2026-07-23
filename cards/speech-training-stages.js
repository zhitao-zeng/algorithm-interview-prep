export default {
  "kind": "concept",
  "id": "speech-training-stages",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "语音大模型训练阶段",
  "prompt": "一个语音大模型通常分哪几个训练阶段？各阶段目标与数据是什么？",
  "quickAnswer": "典型四阶段：(1) Encoder/Codec 预训练（自监督声学表征或 RVQ codec）；(2) 多任务监督预训练（ASR/ST/TTS/QA 等混合，带文本对齐）；(3) 指令微调 SFT（对话/多轮）；(4) 偏好/RL 后训练（RLHF/DPO 提升自然度、正确率、安全性）。",
  "approach": "典型四阶段：(1) Codec 预训练；(2) 多任务监督预训练；(3) 指令微调 SFT；(4) 偏好/RL 后训练（RLHF/DPO）。",
  "explanationFocus": "预训练表征→多任务对齐→SFT→RL 后训练，逐阶段提能力与对齐。",
  "bruteForce": "直接端到端从零训对话，数据稀疏、难收敛、易幻觉。",
  "derivation": [
    "先有强声学表征/codec，下游才好接 LLM。",
    "多任务监督让模型学会“听-想-说”的基础能力。",
    "SFT 塑形对话风格，RL 对齐人类偏好与质量。"
  ],
  "invariant": "越往后阶段越关注“对齐与质量”，越往前越关注“表征与能力”。",
  "walkthrough": "画阶梯：Codec预训练 → ASR/多任务 → SFT → RLHF/DPO。",
  "edgeCases": [
    "阶段间灾难性遗忘：需保留部分前阶段数据回放。",
    "RL 阶段奖励模型偏差：需多维度奖励。",
    "数据规模不均：多任务需平衡采样。"
  ],
  "code": "# Python\ndef speech_llm_train(model, stage, data):\n    if stage == 'codec_pretrain':\n        return train_codec(model.codec, data.audio)   # 自监督声学codec\n    if stage == 'multitask':\n        return sft(model, data.mix_tasks)             # ASR/ST/TTS/QA\n    if stage == 'sft':\n        return sft(model, data.dialog)                # 对话指令\n    if stage == 'rl':\n        return rlhf(model, reward=data.pref_reward)    # 偏好后训练",
  "codeNotes": [
    "Codec 与 LLM 常分阶段解冻，先训瓶颈再端到端。",
    "RL 阶段常用 ASR 正确性+自然度+安全多奖励。"
  ],
  "complexity": "各阶段独立；RL 阶段单位有效样本成本高（需在线生成、奖励模型推理 O(B·N²·d) 与旧策略采样），但完整训练链路里大规模预训练通常消耗更多总算力，不能说 RL 一定最贵。",
  "followUps": [
    {
      "question": "为什么先训 codec 再训对话？",
      "answer": "codec/表征是离散化的基础，先把声音压成稳定 token，下游 LLM 才能在一致空间里学习听与说，否则表示漂移难训。"
    },
    {
      "question": "RL 后训练在语音里奖励什么？",
      "answer": "除文本正确性外，还奖励 ASR 词错率、语音自然度/音色一致性、停顿合理性与安全性，常用多奖励加权。"
    }
  ],
  "followUpAnswers": [
    "用回放缓冲防止遗忘前期能力。",
    "奖励模型结合 ASR 指标与主观打分。"
  ],
  "pitfalls": [
    "跳过表征预训练直接 SFT，收敛差。",
    "RL 只优化单一奖励导致偏科。"
  ],
  "beginnerSummary": "训练一个会听会说的语音大模型像盖楼，分四层：第一层先把声音压缩成稳定 token（codec 预训练）；第二层用大量“听写/翻译/问答”任务让它学会基本功（多任务监督）；第三层用对话例子教它怎么像人一样聊天（SFT 指令微调）；第四层用人类偏好打分让它说得更对、更自然、更安全（RL 后训练）。一层层叠加，能力越来越强。",
  "prerequisites": [
    "声音要先变成可训练 token。",
    "监督学习打基础，RL 做对齐。",
    "阶段训练避免从零直接训对话。"
  ],
  "workedExample": [
    "阶段1：海量无标音频训 codec。",
    "阶段2：ASR+翻译混合数据。阶段3：多轮对话。阶段4：用偏好数据 RLHF。"
  ],
  "lineByLine": [
    "Codec 预训练：自监督得到声学离散表示。",
    "多任务监督：ASR/ST/TTS/QA 混合对齐。",
    "SFT：对话指令塑形交互风格。",
    "RL 后训练：以偏好奖励提升质量与安全。"
  ],
  "diagram": "L1 Codec预训练 ─▶ L2 多任务监督 ─▶ L3 SFT ─▶ L4 RLHF/DPO\n (声学token)      (听想说基础)      (对话风格)   (偏好对齐)"
};
