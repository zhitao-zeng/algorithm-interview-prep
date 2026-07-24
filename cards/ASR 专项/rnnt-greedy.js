export default {
  "kind": "code",
  "id": "rnnt-greedy",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "RNN-T Greedy Decode",
  "prompt": "实现 RNN-T 的时间同步贪心解码。",
  "quickAnswer": "每个 encoder 帧反复取 joint 网络最大 token；若是 blank 则前进到下一帧，否则输出 token 并更新 prediction state。",
  "approach": "每个 encoder 帧反复取 joint 网络最大 token；若是 blank 则前进到下一帧，否则输出 token 并更新 prediction state。",
  "explanationFocus": "RNN-T Greedy Decode：每个 encoder 帧反复取 joint 网络最大 token；若是 blank 则前进到下一帧，否则输出 token 并更新 prediction state。",
  "bruteForce": "《RNN-T Greedy Decode》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。",
  "derivation": [
    "贪心沿「每步最大概率」的对齐路径前进，省去 beam 的搜索开销。",
    "用 max_symbols_per_frame 限制每帧标签数，避免单帧死循环输出（必须 positive）。",
    "精度低于 beam，但延迟极低，适合流式场景。"
  ],
  "invariant": "在同一时间帧内，只有预测到 blank 才能推进 t；输出标签必须更新 prediction state。",
  "walkthrough": "若 t=0 依次输出 “你”“好” 后遇到 blank，才进入 t=1。",
  "edgeCases": [
    "所有帧都输出 blank：结果为空。",
    "某帧连续输出多 label：受 max_symbols_per_frame 限制后前进。",
    "帧数用尽仍有未输出 label：自然结束（标签已输出完）。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef rnnt_greedy(encoder,predictor_start,joint,predictor_step,blank,max_symbols_per_frame=5):\n    if max_symbols_per_frame<=0: raise ValueError(\"max_symbols_per_frame must be positive\")\n    state=predictor_start(); out=[]\n    for frame in encoder:\n        for _ in range(max_symbols_per_frame):\n            token=int(np.asarray(joint(frame,state)).argmax())\n            if token==blank: break\n            out.append(token); state=predictor_step(token,state)\n    return out",
  "codeNotes": [
    "实际实现通常使用 logit argmax，不必先 softmax。",
    "max_symbols_per_frame 是延迟与死循环保护。"
  ],
  "complexity": "时间 O(T·S)（T 帧，S 为平均每帧符号数），空间 O(T+U)。",
  "followUps": [
    {
      "question": "与 CTC greedy 最大差别？",
      "answer": "RNN-T 非 blank 不推进时间且依赖 prediction 网络，可一帧输出多个 token；CTC 每帧独立取一个。"
    },
    {
      "question": "如何提高准确率？",
      "answer": "使用 RNN-T beam search、语言模型融合或更强的 encoder/predictor。"
    }
  ],
  "followUpAnswers": [
    "RNN-T 的非 blank 不推进时间且依赖 prediction 网络；CTC 每帧只选一个独立 token。",
    "用 beam search、语言模型融合或更强的 encoder/predictor。"
  ],
  "pitfalls": [
    "没限制每帧最大符号数，单帧持续输出 label 造成死循环。",
    "把 blank 误当成普通 label 输出到结果里。"
  ],
  "beginnerSummary": "RNN-T 的贪心解码：从第 0 帧、空标签历史出发，反复调用 join 网络。若当前帧输出是 blank，就前进到下一帧（不输出文字）；若输出某个 label，就把它接到结果并移动 label 指针（时间停在原帧）。直到所有帧处理完，得到完整输出序列。是最简单、最快的 RNN-T 解码方式。",
  "prerequisites": [
    "维护当前帧索引 t 与当前已输出 label 数 u。",
    "join(f_t, g_u) 的 argmax 决定动作：blank → t+1；label k → 输出 k 且 u+1。",
    "为防止单帧无限输出 label，通常限制每帧最大符号数（max_symbols_per_frame，必须 positive）。"
  ],
  "workedExample": [
    "逐帧：帧1 argmax=blank → 前进帧2；帧2 argmax=\"C\" → 输出 C，u+1，仍停帧2；帧2 再 argmax=blank → 前进帧3…… 最终得 \"CAT\"。",
    "当某帧连续输出多个 label 后遇 blank 才前进，符合 RNN-T 对齐。"
  ],
  "lineByLine": [
    "t=0, u=0, 结果=[]。",
    "while t < T：y = join(f_t, g_u)，取 argmax。",
    "若 blank：t += 1。",
    "否则：结果.append(label)，u += 1，更新预测网络 g_u；若已达本帧符号上限则强制前进。",
    "返回结果序列。"
  ],
  "diagram": "每帧取 join 输出最大:\n  若 blank → t+1 (不输出)\n  若 label → 输出该 label, u+1\n直到 t 走完所有帧\n沿最可能路径贪心解码"
};
