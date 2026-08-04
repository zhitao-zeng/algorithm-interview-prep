export default {
  "id": "asr-lid",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "语种识别 LID 的梯度干扰隔离",
  "prompt": "在 ChinaVoices LID 仅 67.57% 的多任务学习中，LID 梯度干扰为何导致 ASR 负收益，应如何隔离？",
  "quickAnswer": "ChinaVoices 中 LID 仅 67.57%，弱监督头与 ASR 共享编码器时梯度冲突拖累 ASR；用 PCGrad 式投影把 LID 梯度投影到 ASR 梯度正交方向以隔离干扰。",
  "code": "def project_conflict(grad_asr: list, grad_lid: list) -> list:\n    \"\"\"当 ASR 与 LID 梯度冲突时，把 LID 梯度投影到 ASR 梯度正交方向以隔离干扰。\"\"\"\n    dot = sum(a * b for a, b in zip(grad_asr, grad_lid))\n    norm2 = sum(b * b for b in grad_lid) or 1e-8\n    if dot >= 0:\n        return grad_lid\n    return [b - dot / norm2 * a for a, b in zip(grad_asr, grad_lid)]",
  "complexity": "时间 O(d)（d 为参数维度），空间 O(d)",
  "beginnerSummary": "两个人同时拽一根绳子往不同方向，ASR 会被 LID 带偏；把 LID 那股“反向力”拆掉，只保留不打架的部分。",
  "derivation": [
    "为什么需要：ChinaVoices 中 LID 仅 67.57%，弱监督 LID 头与 ASR 共享编码器，反向传播时梯度冲突拖累 ASR，造成负收益。",
    "怎么实现：用 PCGrad 式投影，当两任务梯度内积为负（冲突）时，把 LID 梯度投影到 ASR 梯度的正交补空间，去除对抗分量。",
    "有什么代价：每步需算梯度内积与投影，增加 O(d) 计算与额外前向/反向；投影可能削弱 LID 自身学习。",
    "怎么评测：对比共享训练前后 ASR CER 与 LID 准确率，隔离后 ASR 不再退化且 LID 仍有正向（即便 67.57% 基线）。"
  ],
  "edgeCases": [
    "梯度内积接近 0 时投影不稳定，需数值稳定项。",
    "LID 头与 ASR 共享层极少时投影收益有限，应改路由而非投影。",
    "多任务多于两个时成对投影组合数爆炸，需顺序或平均策略。",
    "LID 标签本身噪声大（67.57%），弱信号被投影放大会误导。"
  ],
  "pitfalls": [
    "默认多任务直接相加损失，忽视梯度冲突，ASR 被弱 LID 带偏。",
    "把 LID 准确率 67.57% 当成可用，未意识到其梯度对 ASR 有害。"
  ],
  "prerequisites": [
    "多任务学习与共享编码器",
    "梯度冲突与 PCGrad",
    "语种识别（LID）任务"
  ],
  "workedExample": [
    "步骤1：取 ASR 与 LID 在共享编码器上的梯度 grad_asr、grad_lid。",
    "步骤2：算内积，若为负则对 grad_lid 做正交投影。",
    "步骤3：用投影后梯度更新，验证 ASR CER 不再因 LID 任务上升。"
  ],
  "lineByLine": [
    "dot = sum(a*b for ...) 计算 ASR 与 LID 梯度内积，判断冲突方向。",
    "norm2 = sum(b*b ...) or 1e-8 求 LID 梯度模平方，加极小值防除零。",
    "if dot >= 0: return grad_lid 不冲突时原样保留 LID 梯度。",
    "return [b - dot/norm2*a ...] 冲突时减去沿 ASR 方向的分量，仅留正交部分。"
  ],
  "followUps": [
    {
      "question": "除了 PCGrad 投影还有别的隔离法？",
      "answer": "可用任务特定 adapter 减少共享、梯度 surgery（如 Conflict-Averse）、或把 LID 拆为独立辅助头仅在推理用，不反向进编码器。"
    },
    {
      "question": "LID 只有 67.57% 还有必要做多任务吗？",
      "answer": "若 LID 仅用于路由可后处理独立训练；若强塞进共享损失且梯度冲突，反而伤 ASR，应先隔离或降权。"
    }
  ],
  "followUpAnswers": [
    "可用任务特定 adapter 减少共享、梯度 surgery（如 Conflict-Averse）、或把 LID 拆为独立辅助头仅在推理用，不反向进编码器。",
    "若 LID 仅用于路由可后处理独立训练；若强塞进共享损失且梯度冲突，反而伤 ASR，应先隔离或降权。"
  ],
  "invariant": "project_conflict 输出的 LID 梯度与 grad_asr 的内积恒非负（去冲突），且不改变 grad_asr 本身。",
  "walkthrough": "grad_asr=[1,0], grad_lid=[-1,1] 内积=-1<0 → 投影为 [-1,1]-(-1)/1*[1,0]=[0,1]，与 grad_asr 正交；若 grad_lid=[1,1] 内积=1≥0 → 原样返回。",
  "kind": "code"
};
