export default {
  "id": "as-ctc-align",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "CTC 对齐与强制对齐",
  "prompt": "CTC 的前向后向算法是如何在“允许 blank 与重复”的条件下，把音频帧序列对齐到标注文本的？",
  "quickAnswer": "CTC 在标签序列中插入 blank 并允许重复，把任意 T 帧映射到长度≤T 的标签路径；前向-后向算法递推每条路径概率，求和得到标注似然，并可反推每帧最可能标签，实现强制对齐。",
  "approach": "先扩展标签为 l'=blank+label+blank+...；前向 α 从 t=1 递推到 T，后向 β 从 T 递推回 1；某帧某标签的占用概率 ∝ α·β，归一化后取 argmax 即得每帧标签，从而强制对齐到音素/字。",
  "explanationFocus": "是什么：CTC 对齐指在不依赖逐帧标注的情况下，用前向-后向动态规划把音频帧与文本建立多对一映射；强制对齐（forced alignment）是利用训练好的 CTC 为无标注音频生成帧级标签。",
  "bruteForce": "朴素做法人工逐帧标注音素，成本极高且无法扩展；或直接贪心取每帧 argmax，但忽略 blank/重复导致错位。",
  "invariant": "所有合法路径在任意时刻 t 的前缀必须与目标标签的前缀一致（单调、不跳字符），且 blank 可出现在任意两标签之间或标签重复处。",
  "walkthrough": "扩展标签加 blank → 初始化 α[1]（首帧只能 blank 或首标签）→ 递推 α[t] 用跳过/重复/前进三规则 → 同样算 β → 每个 (t,k) 的占用 p∝α[t,k]β[t,k] → 按帧取 argmax 得对齐。",
  "complexity": "前向-后向为 O(T·|l'|) 的动态规划，远小于枚举全部路径的指数级；强制对齐推理为单次前向加后处理，线性开销。",
  "beginnerSummary": "CTC 对齐像一个“自动对齐器”：它允许某些帧是空白、某些帧重复，用动态规划找出音频每帧最可能对应的字，省去人工逐帧标注。",
  "diagram": "T (time) -->\n| blank  t1 - t4\n| c      t2\n| a      t3\n| t      t4\ntargets: c a t",
  "code": "import numpy as np\n\ndef ctc_forward(logyc, targets):\n    # 前向概率 DP\n    dp = np.zeros((len(targets), logyc.shape[0]))\n    return dp",
  "derivation": [
    "为什么需要：语音帧数 T 远大于字符数，且无法逐帧标注，需要一种可微的自动对齐方式训练声学模型。",
    "怎么实现：在标签间插入 blank 允许重复，用前向 α 与后向 β 递推路径概率，总似然为所有合法路径之和，对 logits 取负似然即可训练。",
    "有什么代价：CTC 假设帧间条件独立，丢失了语言模型信息；blank 机制使对齐稀疏、需后处理去重。",
    "怎么评测：用强制对齐的帧级准确率与边界误差评估，或在 ASR 任务看 CTC 的 WER 与收敛速度。"
  ],
  "edgeCases": [
    "连续相同字符：如“你好”中重复音需 blank 隔开，否则无法区分。",
    "全 blank 路径：标注为空时退化为全 blank。",
    "T 远小于标签数：无法容纳所有字符，对齐失败。",
    "数值下溢：概率连乘需用 log 域递推。"
  ],
  "pitfalls": [
    "忽略 blank 索引导致标签扩展错位，整个 DP 维度错。",
    "直接用每帧 argmax 当对齐，忘记合并重复与删 blank，结果偏移严重。"
  ],
  "prerequisites": [
    "动态规划与前向-后向算法",
    "条件独立假设与对数域运算"
  ],
  "workedExample": [
    "标签 “cat” 扩展为 “- c a t -”，T=4 时一条合法路径为 blank,c,a,t，另一条为 c,blank,a,t。",
    "用训练好 CTC 对 1 小时音频做强制对齐，得到每字起止时间用于切词。"
  ],
  "lineByLine": [
    "logyc：T×V 的 CTC 输出对数概率，V 含 blank 与所有标签。",
    "targets：扩展后的标签序列（含 blank 占位）。",
    "dp：前向概率矩阵，行数为扩展标签数、列数为时间。",
    "return dp：返回 DP 表供后续归一化求占用概率。"
  ],
  "codeNotes": [
    "实际实现应在 log 域用 logsumexp 避免下溢，并加 skip/重复/前进三条转移规则。"
  ],
  "followUps": [
    {
      "question": "CTC 与 RNN-T 的对齐有何不同？",
      "answer": "CTC 条件独立、无语言模型；RNN-T 用预测网络引入自回归依赖，对齐同时建模语言上下文。"
    },
    {
      "question": "如何用 CTC 做时间戳？",
      "answer": "对每个字符取其在最优对齐中首次/末次出现的帧索引，乘帧移得到起止时间。"
    }
  ],
  "followUpAnswers": [
    "CTC 条件独立、无语言模型；RNN-T 用预测网络引入自回归依赖，对齐同时建模语言上下文。",
    "对每个字符取其在最优对齐中首次/末次出现的帧索引，乘帧移得到起止时间。"
  ],
  "kind": "code"
};
