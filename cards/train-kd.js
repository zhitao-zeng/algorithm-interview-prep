export default {
  "kind": "concept",
  "id": "train-kd",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "知识蒸馏 KD（软标签、温度 T、KL 散度）",
  "prompt": "知识蒸馏如何用温度 T 与 KL 散度训练学生模型？",
  "quickAnswer": "用温度 T 软化 teacher 与 student 的 softmax，再以 T²·KL(teacher_T ‖ student_T) 为损失，让学生模仿老师的概率分布。",
  "approach": "对 logits 除以 T 得软分布 p_T；蒸馏损失 L=T²·KL(p_T^teacher ‖ p_T^student)，常与硬标签交叉熵加权结合。",
  "explanationFocus": "是什么：知识蒸馏(KD)让小模型(学生)模仿大模型(教师)的输出分布而非仅硬标签；温度 T 软化 softmax 暴露类间相似结构（暗知识），用 KL 散度度量两分布差距并乘 T² 补偿梯度幅度。",
  "bruteForce": "只用硬标签训学生，丢掉教师输出的类间相似性信息（如『猫≈虎』），小模型精度明显低于蒸馏版。",
  "derivation": [
    "为什么需要：硬标签信息量低，教师软标签含『暗知识』（各类相对概率），可大幅提升学生精度。",
    "怎么实现：p_T(z)=softmax(z/T)；L_KD=T²·KL(p_T^t ‖ p_T^s)；总损失 α·L_CE+(1-α)·L_KD。",
    "有什么代价：需教师在线推理或离线生成软标签，增加算力；T 与 α 需调；容量差距过大学生学不下。",
    "怎么评测：在相同数据上比学生蒸馏 vs 硬标签训练的精度，看是否接近教师、超越从头训。"
  ],
  "invariant": "软损失乘 T² 补偿梯度；T 典型 2-20；KL 方向为 teacher→student（建议二次核对 KL 顺序与 T² 因子）。",
  "walkthrough": "T=4, α=0.3：对师生 logits/4 取 softmax，L=T²·KL(teacher‖student)+0.3·CE(硬标签)，学生精度从 72% 升至 78%。",
  "edgeCases": [
    "T 过大分布趋均匀、信号变弱",
    "KL 方向写反(学生‖教师)亦可但语义不同，常取 teacher 为基准",
    "学生过小『容量差距』导致学不动"
  ],
  "code": "import torch.nn.functional as F\ndef kd_loss(s_logits, t_logits, labels, T=4.0, alpha=0.3):\n    hard = F.cross_entropy(s_logits, labels)\n    s = F.log_softmax(s_logits / T, dim=-1)\n    t = F.softmax(t_logits / T, dim=-1)\n    soft = F.kl_div(s, t, reduction='batchmean') * (T ** 2)\n    return alpha * hard + (1 - alpha) * soft",
  "codeNotes": [
    "student 用 log_softmax、teacher 用 softmax 配 kl_div",
    "T**2 修复因除以 T 缩小的梯度"
  ],
  "complexity": "与一次前向+softmax 同量级，额外需教师推理。",
  "followUps": [
    {
      "question": "温度 T 起什么作用？",
      "answer": "T>1 平滑分布、凸显次优类的相对概率（暗知识）；T→∞ 趋均匀，T=1 即普通软标签。"
    },
    {
      "question": "T² 因子为何必须？",
      "answer": "softmax(z/T) 梯度约缩为 1/T²，乘 T² 使蒸馏梯度幅度与温度无关、训练稳定。"
    }
  ],
  "followUpAnswers": [
    "T>1 平滑分布、凸显次优类的相对概率（暗知识）；T→∞ 趋均匀，T=1 即普通软标签。",
    "softmax(z/T) 梯度约缩为 1/T²，乘 T² 使蒸馏梯度幅度与温度无关、训练稳定。"
  ],
  "pitfalls": [
    "KL 两分布顺序写错导致梯度方向异常",
    "漏乘 T² 使高温时梯度过小学不动"
  ],
  "beginnerSummary": "蒸馏让小模型不光看『标准答案』，还学大模型的『把握分布』；温度 T 把大模型的信心调温和，KL 散度衡量学生离老师差多远。",
  "prerequisites": [
    "Softmax 与温度",
    "KL 散度",
    "交叉熵"
  ],
  "workedExample": [
    "teacher_logits=[5,1,0]，T=4 得软分布≈[0.39,0.33,0.28]",
    "student 同温度 softmax，kl_div×16 作软损失"
  ],
  "lineByLine": [
    "hard = CE(s_logits, labels)：硬标签项",
    "s/t 为温度软化分布",
    "soft 乘 T² 补偿梯度，加权求和"
  ],
  "diagram": "teacher ─softmax/T─▶ 软标签\n                   │ KL×T²\nstudent─softmax/T─▶ 软预测"
};
