export default {
  "kind": "code",
  "id": "ctc-greedy",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "CTC Greedy Decode",
  "prompt": "把逐帧 argmax token 解码为文本。",
  "quickAnswer": "先合并连续重复 token，再删除 blank；顺序不能颠倒。",
  "approach": "先合并连续重复 token，再删除 blank；顺序不能颠倒。",
  "explanationFocus": "CTC Greedy Decode：先合并连续重复 token，再删除 blank；顺序不能颠倒。",
  "bruteForce": "《CTC Greedy Decode》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。",
  "derivation": [
    "没有 CTC 时，RNN 每帧输出必须和标签严格等长对齐，训练困难。",
    "blank + 合并规则让「同一个标签可跨多帧、且允许重复标签间用 blank 隔开」成为可能。",
    "Greedy 只取每帧最大，速度快但没利用标签间的转移概率，精度不如 beam。"
  ],
  "invariant": "每步保存的分数完整覆盖 CTC Greedy Decode：先合并连续重复 token，再删除 blank；顺序不能颠倒。 下所有合法历史，而不会重复或遗漏对齐路径。",
  "walkthrough": "演练《CTC Greedy Decode》时写出两三帧的 token、blank 与前缀/状态转移。",
  "edgeCases": [
    "全 blank 帧：结果为空字符串。",
    "标签间需要重复字母（如 \"CC\"）：用 blank 隔开，如 C ␣ C，合并后保留两个 C。",
    "单帧：直接取 argmax 后去 blank。"
  ],
  "code": "# Python\ndef ctc_greedy(tokens, blank):\n    output, previous = [], None\n    for token in tokens:\n        if token != previous and token != blank:\n            output.append(token)\n        previous = token\n    return output",
  "codeNotes": [
    "概率累积应在 log 域使用 log-sum-exp。",
    "流式场景要明确何时提交稳定前缀和截断缓存。"
  ],
  "complexity": "时间 O(T)（T 为帧数，逐帧 argmax + 一遍合并），空间 O(T)。",
  "followUps": [
    {
      "question": "为什么先合并再删 blank？",
      "answer": "CTC 规则只合并相邻重复；[a,blank,a] 中 blank 打断相邻关系，先删 blank 会错误变成一个 a。"
    },
    {
      "question": "贪心一定是最优吗？",
      "answer": "不一定；它逐帧取局部最大，可能遗漏多条稍低概率但联合概率更高的路径，beam search 可缓解。"
    }
  ],
  "followUpAnswers": [
    "在 beam 扩展分数中加入语言模型权重和长度奖励。",
    "减小 chunk 和右上下文，并采用稳定前缀策略。"
  ],
  "pitfalls": [
    "合并重复时把不相邻的相同标签也合并（只有「连续相同」才合并）。",
    "忘记最后删除 blank，导致结果里残留 ␣。"
  ],
  "beginnerSummary": "CTC（Connectionist Temporal Classification）解决「声学模型输出帧数 ≫ 标签数」的对齐问题。它引入一个特殊的空白符 blank（␣），允许模型在任意帧输出 blank 或任意标签，最后通过「合并连续重复标签 + 删除 blank」得到最终文本。Greedy 解码最简单：每一帧取概率最大的 token（argmax），再合并重复、去 blank。",
  "prerequisites": [
    "声学特征按时间切成很多帧，但对应的文字标签少得多，无法逐帧一一对应。",
    "blank（␣）代表「此帧不输出字符」，用来吸收静音/重复与对齐余量。",
    "解码规则：先合并相邻重复的非 blank 标签，再删掉所有 blank，得到最终序列。"
  ],
  "workedExample": [
    "每帧 argmax：C C A T ␣ ␣ → 合并重复 CCAT␣␣ → CAT␣ → 删 blank → \"CAT\"。",
    "若某段输出 A A B ␣ → 合并 A B ␣ → AB␣ → \"AB\"（连续相同才合并，A 只合并一次）。"
  ],
  "lineByLine": [
    "对每一帧 t 取 argmax 得到 token_t。",
    "顺序收集 token，若当前 token 与前一个相同且非 blank，跳过（合并重复）。",
    "若当前 token 是 blank，跳过（留待最后删除）。",
    "拼接剩余 token 得到解码结果。"
  ],
  "diagram": "标注序列(含 blank ␣):\n  每帧 logit 取 argmax:\n  帧: C  C  A  T  ␣  ␣\n  → 合并重复: CCAT␣␣ → CAT␣\n  → 去 blank: \"CAT\""
};
