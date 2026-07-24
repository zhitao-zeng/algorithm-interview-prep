export default {
  "kind": "concept",
  "id": "train-teacher-student",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "teacher/student 设计（大模型蒸馏小模型）",
  "prompt": "设计大模型蒸馏小模型时，teacher 与 student 应如何组织？",
  "quickAnswer": "student 可用不同架构但需匹配输出空间；可用离线软标签、在线联合或特征/中间层对齐多种蒸馏方式。",
  "approach": "先定 student 容量与架构，选响应级（模仿输出）或 token 级 KL 蒸馏，必要时对齐隐藏层/注意力；用教师生成数据训学生。",
  "explanationFocus": "是什么：teacher/student 设计指选定大模型作教师、设计更小 student（可异构），通过软标签、logit、或中间表征对齐把教师能力迁移到学生；架构可不同，但输出类别空间需一致。",
  "bruteForce": "直接拿教师输出硬标签当监督训学生，丢失暗知识；或 student 太小强行学大模型全部行为导致容量不足崩坏。",
  "derivation": [
    "为什么需要：部署要小模型，需在保能力前提下压缩，需系统设计师生结构。",
    "怎么实现：响应级（SFT 于教师生成）、token 级 KL（逐 token 对齐分布）、特征级（对齐隐藏态/注意力，如 TinyBERT）。",
    "有什么代价：容量差距过大学生吸收不了（capacity gap）；特征对齐需同结构；教师推理有成本。",
    "怎么评测：学生精度/延迟/体积 vs 教师，看压缩比与质量保留率（如 DistilBERT 保 97%/省 40%）。"
  ],
  "invariant": "student 容量要足够承接教师知识；输出空间须一致；可异构（建议二次核对 capacity gap 经验值）。",
  "walkthrough": "BERT(110M)→DistilBERT(66M)：三重损失（LM+KL软标签+隐藏态余弦），保留 97% GLUE、加速 60%。",
  "edgeCases": [
    "student 架构与 teacher 差异过大时特征对齐失效",
    "容量差距超经验阈值（如 >10×）学生难学",
    "教师错误被学生继承"
  ],
  "code": "def distill_step(student, teacher, batch, T=4.0):\n    with torch.no_grad():\n        t_logits = teacher(batch)\n    s_logits = student(batch)\n    return kd_loss(s_logits, t_logits, batch.labels, T)",
  "codeNotes": [
    "teacher 用 no_grad 仅提供目标",
    "kd_loss 复用温度 KL 公式"
  ],
  "complexity": "每步需教师一次前向，成本约为学生训练的两倍。",
  "followUps": [
    {
      "question": "student 必须和 teacher 同架构吗？",
      "answer": "不必；响应级蒸馏可异构，但特征级（对齐隐藏层）需结构兼容。"
    },
    {
      "question": "如何缓解容量差距？",
      "answer": "用更强教师生成更多数据、加特征对齐、或分步蒸馏（中模型作桥）。"
    }
  ],
  "followUpAnswers": [
    "不必；响应级蒸馏可异构，但特征级（对齐隐藏层）需结构兼容。",
    "用更强教师生成更多数据、加特征对齐、或分步蒸馏（中模型作桥）。"
  ],
  "pitfalls": [
    "忽视 capacity gap 让小模型硬学大模型",
    "教师偏差被完整继承"
  ],
  "beginnerSummary": "设计蒸馏像『名师带徒』：徒弟可以不同体型（架构），但考题得一样（输出空间）；可只学答案，也可连思路（中间层）一起学。",
  "prerequisites": [
    "知识蒸馏",
    "模型压缩",
    "容量与表征对齐"
  ],
  "workedExample": [
    "teacher=LLaMA-70B 生成 800K 推理链",
    "student=Qwen-14B 在这些链上 SFT（DeepSeek-R1 式蒸馏）"
  ],
  "lineByLine": [
    "with torch.no_grad(): 教师不更新",
    "t_logits 为软标签来源",
    "kd_loss 训练学生逼近教师"
  ],
  "diagram": "teacher(大)──软标签──▶ student(小)\n        └─可选:中间层对齐─┘"
};
