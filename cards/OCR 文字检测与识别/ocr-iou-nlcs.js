export default {
  "id": "ocr-iou-nlcs",
  "category": "OCR 文字检测与识别",
  "difficulty": "Hard",
  "title": "端到端 OCR 评测（IoU / NLCS，Judge 联合约束）",
  "prompt": "端到端 OCR 如何同时用 IoU 与 NLCS 评测，并由 Judge 同时约束检测与识别才能保证公平？",
  "quickAnswer": "IoU 评测文本定位框重合度，NLCS 用最长公共子序列评测识别内容正确率；Judge 同时以定位与内容阈值双重约束，只有框与文字都对才计为正确，避免单看其一虚高。",
  "code": "def iou(box_a, box_b):\n    inter = area(intersect(box_a, box_b))\n    return inter / (area(box_a) + area(box_b) - inter)\n\ndef nlcs(pred, gt):\n    \"\"\"归一化最长公共子序列，按字符粒度\"\"\"\n    m, n = len(pred), len(gt)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            dp[i][j] = dp[i-1][j-1] + 1 if pred[i-1] == gt[j-1] else max(dp[i-1][j], dp[i][j-1])\n    return 2 * dp[m][n] / (m + n)\n\ndef judge_end2end(pred_box, pred_txt, gt_box, gt_txt, iou_t=0.5, nlcs_t=0.5):\n    return iou(pred_box, gt_box) >= iou_t and nlcs(pred_txt, gt_txt) >= nlcs_t\n",
  "complexity": "IoU 时间 O(1)；NLCS 时间 O(m·n)，空间 O(m·n)",
  "beginnerSummary": "评测既要看“框有没有框对位置”，也要看“字有没有读对”。Judge 像阅卷老师：位置和内容都达标才算这题对，偏科不算数。",
  "derivation": [
    "为什么需要：仅看检测 IoU 会放过读错字，仅看识别率会放过框错位，端到端必须同时约束两者。",
    "怎么实现：分别算预测框与真值框 IoU、预测文本与真值文本 NLCS，Judge 以两个阈值联合判定单条是否命中。",
    "有什么代价：NLCS 对字符级替换敏感但容忍少量插入；联合阈值选择影响严格度，需要按业务定标，否则跨模型难横向比较。",
    "怎么评测：汇总命中数算 Precision/Recall/Hmean，并对不同 IoU/NLCS 阈值做曲线分析稳定性。"
  ],
  "edgeCases": [
    "预测框与真值框部分重叠但 IoU 恰好低于阈值",
    "文本仅标点/空格差异导致 NLCS 略低",
    "一条真值被多个预测框覆盖",
    "大小写或全半角不一致"
  ],
  "pitfalls": [
    "用纯准确率忽略定位导致识别分虚高",
    "IoU 阈值与 NLCS 阈值不平衡使评测偏严或偏松",
    "多边形框直接当矩形算 IoU 失真"
  ],
  "prerequisites": [
    "IoU 计算",
    "动态规划(LCS)",
    "PR/Recall 指标"
  ],
  "workedExample": [
    "某条预测框 IoU=0.62 达标，但识别 'TikTok' 读成 'T1kTok'，NLCS=0.83 达标→判对。",
    "另一条 IoU=0.48 不达标即使 NLCS=1.0 也判错，避免框错位被识别率掩盖。"
  ],
  "lineByLine": [
    "def iou(box_a, box_b): 计算两框交并比。",
    "def nlcs(pred, gt): 用 DP 求最长公共子序列并归一化。",
    "dp[i][j] = ...: 字符相等则+1 否则取左/上最大值。",
    "def judge_end2end: 同时用 IoU 与 NLCS 阈值联合判定命中。"
  ],
  "followUps": [
    {
      "question": "为什么用 NLCS 而不是编辑距离(Levenshtein)？",
      "answer": "NLCS 容忍无关插入、更关注核心字符顺序正确，对 OCR 中常见的少量噪声字符更稳健；编辑距离对插入删除惩罚更敏感。"
    },
    {
      "question": "联合 Judge 的阈值如何标定？",
      "answer": "在验证集上扫描 IoU/NLCS 阈值组合，选使人工评判与自动评判一致性最高(Kappa)的一组，并固定下来做跨模型对比。"
    }
  ],
  "followUpAnswers": [
    "NLCS 容忍无关插入、更关注核心字符顺序正确，对 OCR 中常见的少量噪声字符更稳健；编辑距离对插入删除惩罚更敏感。",
    "在验证集上扫描 IoU/NLCS 阈值组合，选使人工评判与自动评判一致性最高(Kappa)的一组，并固定下来做跨模型对比。"
  ],
  "invariant": "dp[i][j] 始终等于 pred[:i] 与 gt[:j] 的最长公共子序列长度；judge 返回值仅当 IoU 与 NLCS 双达标才为真。",
  "walkthrough": "pred='TikTok', gt='T1kTok'：LCS='TkTok' 长5，(2*5)/(6+6)=0.83≥0.5 通过；pred_box 与 gt_box 交并比 0.62≥0.5；judge 返回 True。",
  "kind": "code"
};
