export default {
  "kind": "code",
  "id": "rnnt",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "RNN-T 前向递推",
  "prompt": "解释 RNN-T 的 t/u 二维格点与 blank、label 转移。",
  "quickAnswer": "encoder 推进时间 t，prediction 网络推进标签 u；blank 走 (t+1,u)，标签走 (t,u+1)。",
  "approach": "encoder 推进时间 t，prediction 网络推进标签 u；blank 走 (t+1,u)，标签走 (t,u+1)。",
  "explanationFocus": "RNN-T 前向递推：encoder 推进时间 t，prediction 网络推进标签 u；blank 走 (t+1,u)，标签走 (t,u+1)。",
  "bruteForce": "《RNN-T 前向递推》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。",
  "derivation": [
    "不同于 CTC 只依赖编码器，RNN-T 用预测网络引入语言模型信号，且 blank/label 双转移实现严格单调对齐。",
    "训练时用前向-后向算法对所有对齐路径求和（对应目标串的所有合法 (t,u) 路径）。",
    "流式推理时逐帧 join，天然支持实时。"
  ],
  "invariant": "每步保存的分数完整覆盖 RNN-T 前向递推：encoder 推进时间 t，prediction 网络推进标签 u；blank 走 (t+1,u)，标签走 (t,u+1)。 下所有合法历史，而不会重复或遗漏对齐路径。",
  "walkthrough": "演练《RNN-T 前向递推》时写出两三帧的 token、blank 与前缀/状态转移。",
  "edgeCases": [
    "空目标（U=0）：只能一路走 blank 到结束。",
    "单帧单标签：一条 blank→label→blank 的小路径。",
    "帧数远多于标签：大量 blank 吸收对齐余量。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef rnnt_forward(logp_blank, logp_label):\n    logp_blank, logp_label = np.asarray(logp_blank,float), np.asarray(logp_label,float)\n    T, up1 = logp_blank.shape\n    if logp_label.shape != (T, up1-1): raise ValueError(\"inconsistent RNNT shapes\")\n    alpha = np.full((T+1, up1), -np.inf)\n    alpha[0,0] = 0.0\n    for t in range(T+1):\n        for u in range(up1):\n            if not np.isfinite(alpha[t,u]): continue\n            if t < T:\n                alpha[t+1,u] = np.logaddexp(alpha[t+1,u], alpha[t,u]+logp_blank[t,u])\n            if t < T and u < up1-1:\n                alpha[t,u+1] = np.logaddexp(alpha[t,u+1], alpha[t,u]+logp_label[t,u])\n    return float(alpha[T, up1-1]), alpha",
  "codeNotes": [
    "概率累积应在 log 域使用 log-sum-exp。",
    "流式场景要明确何时提交稳定前缀和截断缓存。"
  ],
  "complexity": "训练前向-后向 O(T·U·V)；推理贪心 O(T·U)。",
  "followUps": [
    {
      "question": "为什么 label 转移不推进 t？",
      "answer": "RNN-T 允许同一声学帧输出多个标签，prediction 网络沿 u 轴前进；blank 才表示消费当前帧。"
    },
    {
      "question": "如何降低 O(TU) 空间？",
      "answer": "若只求总分可按 u 或 t 滚动保存一行；若要回溯对齐则需保存父指针或完整格点。"
    }
  ],
  "followUpAnswers": [
    "在 beam 扩展分数中加入语言模型权重和长度奖励。",
    "减小 chunk 和右上下文，并采用稳定前缀策略。"
  ],
  "pitfalls": [
    "混淆 blank 与 label 两种转移：blank 只前进时间、不输出；label 只输出、不前进时间。",
    "在 join 前没正确拼接 f_t 与 g_u，导致分布错位。"
  ],
  "beginnerSummary": "RNN-T（RNN Transducer）允许声学帧数与输出标签数不对齐，且支持流式。它用一个「联合网络 join」把编码器（acoustic）与预测网络（label 历史）融合，在每个 (t,u) 状态输出：要么输出一个 label（u+1，时间停在原帧），要么输出 blank（t+1，帧前进、label 不变）。整条对齐路径是空白与标签交织的序列。",
  "prerequisites": [
    "编码器 f_t 处理第 t 个声学帧；预测网络 g_u 处理已输出的前 u 个 label。",
    "join(f_t, g_u) 输出对「所有 label + 1 个 blank」的 logits。",
    "转移：blank → 时间前进 t+1；label → 输出该 label 且 u+1（时间不动）。"
  ],
  "workedExample": [
    "输入帧 t，目标位置 u：join 得分布。若选 blank，前进到下一帧 t+1；若选某 label（如 \"C\"），输出 \"C\"，u 增 1，仍停在当前帧准备接下一个 label。",
    "完整路径形如 ␣ C ␣ A ␣ T ␣，最终合并去 blank 得 \"CAT\"。"
  ],
  "lineByLine": [
    "编码器逐帧得 f_1..f_T；预测网络从起始标签得 g_0..g_U。",
    "对每个 (t,u)，y = join(f_t, g_u) 得到 label+blank 的 logits。",
    "选 blank：转移到 (t+1, u)；选 label k：输出 k，转移到 (t, u+1)。",
    "到达 (T, U)（全部帧用完且全部标签输出）结束。"
  ],
  "diagram": "输入帧 t, 目标位置 u → 联合网络\n  f_t = encoder 帧特征\n  g_u = predictor 上一输出\n  y = join(f_t, g_u)\n  blank → 前进到下一帧 t+1\n  label → 输出该 label, u+1"
};
