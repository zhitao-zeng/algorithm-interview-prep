export default {
  "kind": "concept",
  "id": "train-curriculum",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "课程学习 / 数据课程（curriculum）",
  "prompt": "课程学习（按难度排布训练数据）在预训练/微调中有何作用？",
  "quickAnswer": "按从易到难或特定顺序排布数据（课程），可加速收敛、稳定训练、提升最终泛化，常用于微调阶段课程与多阶段预训练。",
  "approach": "定义难度度量（长度、困惑度、任务复杂度），先训简单样本再逐步加入困难样本；或按数据来源分阶段切换比例。",
  "explanationFocus": "是什么：课程学习（Curriculum Learning）仿人类『由易到难』，将训练样本按难度/顺序排布，先学简单再学困难，帮助优化逃离差解、加速并提升泛化；数据课程也指预训练按阶段调整数据配比。",
  "bruteForce": "完全随机混训所有难度，模型早期被困难样本梯度主导、收敛慢且易陷入局部差解，尤其小模型明显。",
  "derivation": [
    "为什么需要：随机顺序下困难样本噪声大，课程提供平滑学习信号、稳定早期训练。",
    "怎么实现：按困惑度/长度分桶排序，或用多阶段（先网页后代码/书）；微调可对指令按复杂度排课。",
    "有什么代价：难度度量本身需设计且可能不准；排课过激进可能偏科或遗忘易样本。",
    "怎么评测：对比课程 vs 随机的最终精度与收敛步数，看是否更快达标且不掉点。"
  ],
  "invariant": "课程需『真正由易到难』且不过度偏置；微调常用轻量课程（建议二次核对度量有效性）。",
  "walkthrough": "微调数学题：先训单选题再到多步证明，模型比随机混训提前 20% 步数达标且最终高 2 分。",
  "edgeCases": [
    "难度度量错误导致伪课程无效",
    "课程过陡使易样本欠拟合",
    "预训练课程若中断需续训一致"
  ],
  "code": "def curriculum_batches(dataset, difficulty_fn, buckets=5):\n    ds = sorted(dataset, key=difficulty_fn)  # 由易到难\n    size = len(ds) // buckets\n    return [ds[i*size:(i+1)*size] for i in range(buckets)]",
  "codeNotes": [
    "difficulty_fn 可为长度/困惑度/题深",
    "分阶段喂入，逐步提升难度"
  ],
  "complexity": "排序 O(N log N)，训练成本同常规模型。",
  "followUps": [
    {
      "question": "课程学习一定更好吗？",
      "answer": "不一定；度量不当或排课过激可能无效甚至有害，需实验验证。"
    },
    {
      "question": "预训练怎么用课程？",
      "answer": "常用多阶段配比（先广泛语料后高质量/代码），或在衰减 LR 同时逐步换难数据。"
    }
  ],
  "followUpAnswers": [
    "不一定；度量不当或排课过激可能无效甚至有害，需实验验证。",
    "常用多阶段配比（先广泛语料后高质量/代码），或在衰减 LR 同时逐步换难数据。"
  ],
  "pitfalls": [
    "难度度量与真实学习难度脱钩",
    "课程偏置使易样本欠拟合"
  ],
  "beginnerSummary": "课程学习像『先学加减再学微积分』：把简单题先喂给模型打底，再上难题，训练更稳更快。",
  "prerequisites": [
    "优化与收敛",
    "数据难度度量",
    "学习率调度"
  ],
  "workedExample": [
    "按句长分 5 桶，先短后长喂入",
    "对比随机混训，收敛步数减少"
  ],
  "lineByLine": [
    "sorted(..., key=difficulty_fn)：由易到难排序",
    "分桶便于分阶段训练",
    "逐桶提升难度"
  ],
  "diagram": "易 ──▶ 中 ──▶ 难  (课程顺序喂入)"
};
