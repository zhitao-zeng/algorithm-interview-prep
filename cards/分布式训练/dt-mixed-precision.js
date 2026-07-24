export default {
  "id": "dt-mixed-precision",
  "kind": "concept",
  "category": "分布式训练",
  "title": "混合精度训练",
  "difficulty": "Medium",
  "prompt": "请讲讲混合精度训练中 bf16 与 fp16 如何选，fp8 训练（如 H100）怎么做，loss scaling、master weights 与数值稳定性有哪些坑？",
  "quickAnswer": "混合精度用 fp16/bf16 存激活与梯度、用 fp32 存主权重与某些归约以保稳定。bf16 指数位多、动态范围大，几乎不需 loss scaling；fp16 动态范围小，梯度易下溢需 dynamic loss scaling。H100 的 fp8(E4M3/E5M2) 进一步提速，但需仔细做缩放与累积到 fp32。master weights 保留 fp32 副本避免更新时的舍入误差。坑包括：softmax/exp 溢出、小梯度消失、归约精度不足。",
  "beginnerSummary": "数字在计算机里有不同精度的表示。用更省空间、更快的低精度（如半精度）来算大部分东西，但关键步骤（如累加梯度）仍用高精度，这样既快又不容易算错。bf16 比 fp16 更“稳”，fp8 更新但更娇气。",
  "explanationFocus": "是什么：混合精度训练是在保证收敛的前提下，用低精度（fp16/bf16/fp8）存储和 computes 大部分张量以提速省显存，同时保留 fp32 主权重（master weights）和关键归约来防止数值发散的工程方法。",
  "approach": "前向/反向用 fp16 或 bf16 计算激活与梯度；优化器维护 fp32 主权重，每步把梯度 cast 到 fp32 更新主权重，再 cast 回低精度供下一轮。fp16 需 dynamic loss scaling（先放大损失再回缩放梯度）防下溢；bf16 因指数位宽与 fp32 相同通常免 scaling。fp8 训练需对输入/权重做 tensor scaling 并让累加在 fp32 完成。",
  "code": "import torch\nfrom torch.cuda.amp import GradScaler\n\ndef train_step(model, x, y):\n    with torch.autocast('cuda', dtype=torch.bfloat16):\n        loss = model(x, y)\n    loss.backward()  # bf16 通常无需 scaler\n    return loss",
  "complexity": "算力约 2x（fp16 vs fp32 吞吐）；显存省约一半（激活/梯度半精度）",
  "derivation": [
    "为什么需要：fp32 训练慢且占显存，现代 Tensor Core 对 fp16/bf16/fp8 有数倍吞吐，混合精度可在几乎不损精度下大幅加速。",
    "怎么实现：autocast 自动选层精度；fp16 配 GradScaler 做 loss scaling；bf16 直接算；fp8 由 TransformerEngine 做 per-tensor scaling 并在 fp32 累加。",
    "有什么代价：低精度动态范围小，易出现梯度下溢(fp16)/溢出(bf16大值)、累加误差，需要 master weights 与精心 scaling。",
    "怎么评测：对比 fp32 baseline 的 loss 曲线、最终精度；监控梯度直方图是否出现 NaN/Inf，测吞吐提升倍数。"
  ],
  "edgeCases": [
    "fp16 下 loss 很小（如 1e-4）时梯度下溢为 0，必须靠 loss scaling 或改用 bf16。",
    "bf16 表示大 logits 时仍可能溢出 softmax，需在 softmax 前做减最大值稳定化。",
    "fp8 训练中 attention 的求和项若直接在 fp8 累加会严重丢精度，须强制 fp32 累加。"
  ],
  "pitfalls": [
    "盲目对 fp16 不做 loss scaling，导致梯度全 0、参数不更新。",
    "把所有算子都设为低精度（如 layernorm/softmax 也 fp16），引发数值不稳，应保留关键算子高精度。"
  ],
  "prerequisites": [
    "浮点表示（指数位/尾数位、动态范围、舍入误差）",
    "反向传播与梯度累加的基本流程"
  ],
  "workedExample": [
    "例：ResNet 用 fp16+GradScaler，初始 scale=2^16，连续 2000 步无 Inf 则翻倍、出现 Inf 则跳过并更新。bf16 训练 LLM 则可去掉 scaler，直接 autocast。",
    "例：H100 用 fp8，对 Linear 的激活(X)和权重(W)分别设 scaling factor，输出在 fp32 累加后再量化回 fp8，整体 matmul 吞吐约 2x fp16。"
  ],
  "lineByLine": [
    "`from torch.cuda.amp import GradScaler`：引入梯度缩放器（fp16 用）。",
    "`with torch.autocast('cuda', dtype=torch.bfloat16)`：该上下文内自动把合适算子降到 bf16。",
    "`loss = model(x, y)`：前向以 bf16 计算，省显存且走 Tensor Core。",
    "`loss.backward()`：bf16 梯度直接回传，通常无需 scaler；若是 fp16 需先 loss*scale 再 backward 并 unscaled。"
  ],
  "followUps": [
    {
      "question": "为什么 bf16 通常不需要 loss scaling 而 fp16 需要？",
      "answer": "bf16 有 8 位指数位，与 fp32 相同的动态范围，小梯度不会下溢；fp16 仅 5 位指数，最小正规数约 6e-5，许多梯度会下溢为 0，故需先放大损失再缩回。"
    },
    {
      "question": "master weights 解决了什么问题？",
      "answer": "若直接用 fp16 权重做更新，小学习率×梯度可能小于 fp16 可表示的最小步长，更新被舍入吞掉；保留 fp32 主权重可正确累积微小更新，再量化回低精度。"
    }
  ],
  "followUpAnswers": [
    "bf16 有 8 位指数位，与 fp32 相同的动态范围，小梯度不会下溢；fp16 仅 5 位指数，最小正规数约 6e-5，许多梯度会下溢为 0，故需先放大损失再缩回。",
    "若直接用 fp16 权重做更新，小学习率×梯度可能小于 fp16 可表示的最小步长，更新被舍入吞掉；保留 fp32 主权重可正确累积微小更新，再量化回低精度。"
  ]
};
