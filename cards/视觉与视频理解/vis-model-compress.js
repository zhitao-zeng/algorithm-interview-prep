export default {
  "id": "vis-model-compress",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "视觉模型压缩：蒸馏/剪枝/量化及陷阱",
  "difficulty": "Medium",
  "prompt": "知识蒸馏、剪枝、量化在 CV 模型压缩中如何应用？各有什么常见陷阱？",
  "quickAnswer": "蒸馏让小模型（学生）模仿大模型（教师）的输出分布或中间特征；剪枝移除冗余通道/权重并微调；量化把 FP32 降到 INT8/低比特加速推理。陷阱包括：蒸馏忽视中间层对齐导致收益低；剪枝后需重训否则精度崩；量化对激活分布敏感、需校准且对小模型更易掉点。",
  "code": "import torch\n\ndef distill_loss(student_logits, teacher_logits, T=4.0):\n    ps = torch.nn.functional.log_softmax(student_logits / T, dim=-1)\n    pt = torch.nn.functional.softmax(teacher_logits / T, dim=-1)\n    return torch.nn.functional.kl_div(ps, pt, reduction='batchmean') * T * T",
  "complexity": "O(N·C) 软标签",
  "beginnerSummary": "大模型太重跑不动？压缩三板斧：让小学徒学大师（蒸馏）、砍掉没用的连接（剪枝）、用更省的数表示（量化）。",
  "explanationFocus": "是什么：模型压缩用蒸馏/剪枝/量化减小 CV 模型体积与延迟；蒸馏传知识、剪枝减结构、量化降精度换速度。",
  "approach": "蒸馏以 KL 对齐软标签/特征；剪枝按重要性（范数/梯度）去通道再微调；量化做 PTQ（校准）或 QAT（训练时量化）映射到低比特。",
  "derivation": [
    "为什么需要：边缘/实时部署受算力内存限制，需小而快。",
    "怎么实现：上述三类技术单独或组合（如剪枝+量化）。",
    "有什么代价：压缩常损精度，需权衡；量化对异常值敏感。",
    "怎么评测：精度保持率、参数量、延迟、吞吐、内存。"
  ],
  "edgeCases": [
    "激活存在离群值使 INT8 量化范围失真。",
    "过度剪枝破坏残差连接导致不可恢复掉点。",
    "教师本身不准时蒸馏传播错误。"
  ],
  "pitfalls": [
    "剪枝后不重训直接部署致精度崩。",
    "误以为 PTQ 万能，忽略小模型需 QAT。"
  ],
  "prerequisites": [
    "CNN/Transformer 结构",
    "训练与微调流程"
  ],
  "workedExample": [
    "用 ResNet152 教师蒸馏出 ResNet18 学生，精度接近教师。",
    "通道剪枝去掉 30% 通道后微调，INT8 量化提速 2-3x。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def distill_loss(...)：蒸馏损失（软标签 KL）。",
    "log_softmax(s/T)：学生按温度软化。",
    "softmax(t/T)：教师软化目标。",
    "kl_div(...)*T*T：KL 散度并按 T^2 缩放梯度，平衡软目标权重。"
  ],
  "followUps": [
    {
      "question": "为什么蒸馏常用温度 T？",
      "answer": "高温使 softmax 更平滑，凸显教师对类别间关系的暗知识（如猫与狗比猫与车更近），引导学生学到类间结构。"
    },
    {
      "question": "QAT 与 PTQ 怎么选？",
      "answer": "PTQ 快无需训练但受校准影响；QAT 在训练中模拟量化、精度更好但成本高，小模型或硬任务优先 QAT。"
    }
  ],
  "followUpAnswers": [
    "高温使 softmax 更平滑，凸显教师对类别间关系的暗知识（如猫与狗比猫与车更近），引导学生学到类间结构。",
    "PTQ 快无需训练但受校准影响；QAT 在训练中模拟量化、精度更好但成本高，小模型或硬任务优先 QAT。"
  ]
};
