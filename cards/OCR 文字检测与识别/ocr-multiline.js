export default {
  "id": "ocr-multiline",
  "category": "OCR 文字检测与识别",
  "difficulty": "Hard",
  "title": "多行合并与高 FP 陷阱",
  "prompt": "为什么在 OCR 后处理中应放弃全局降阈值与通用多行合并，它们会带来什么高 FP 风险？",
  "quickAnswer": "全局降阈值会整体抬高召回但成倍增加误检(FP)，通用多行合并规则在不同版式下易把无关文本块错误拼成一行；应采用局部 refinement 与窄条件 fallback 而非一刀切。",
  "code": "def safe_merge(lines, same_line_iou=0.6, max_v_gap=10):\n    \"\"\"窄条件多行合并：仅当水平重叠且垂直间隙极小才合并\"\"\"\n    merged, dropped = [], []\n    for ln in sorted(lines, key=lambda b: b.y):\n        if merged and overlap_x(merged[-1], ln) > same_line_iou \\\n           and abs(ln.y - merged[-1].y) <= max_v_gap:\n            merged[-1] = concat(merged[-1], ln)\n        else:\n            dropped.append(ln)          # 不匹配的单独保留，不强行合并\n    return merged, dropped\n",
  "complexity": "时间 O(N log N)，空间 O(N)",
  "beginnerSummary": "不要“为了多抓几个字就把网撒到全图”，那样会捞上一堆不是字的东西；也别用一套合并规则硬把不相干的文字拼成一行，会读出胡话。",
  "derivation": [
    "为什么需要：单纯降低检测阈值虽提升召回，却让背景纹理、装饰线被误检为文本，FP 暴涨。",
    "怎么实现：放弃全局阈值下调，改在疑似区域做局部 refinement；多行合并改为带水平重叠与垂直间隙的窄条件，避免通用合并。",
    "有什么代价：局部 refinement 增加计算分支，窄条件可能漏掉真正跨行但间隙大的标题，需要按场景调参。",
    "怎么评测：对比全局降阈值前后的 Precision/Recall 与 FP 数，确认窄条件在提升 F1 的同时不破坏其余样本。"
  ],
  "edgeCases": [
    "标题与正文垂直间隙大却被通用规则误合并",
    "背景花纹被低阈值误检为文本行",
    "表格单元格误拼成一行",
    "跨页/跨栏文本"
  ],
  "pitfalls": [
    "为救少数漏检全局降阈值拖垮整体精度",
    "用单一 IoU 阈值覆盖所有版式",
    "合并后文本顺序错乱"
  ],
  "prerequisites": [
    "检测后处理",
    "Precision/Recall 权衡",
    "版式分析基础"
  ],
  "workedExample": [
    "全局阈值从 0.3 降到 0.1，召回 +3% 但 FP 翻倍，整页出现大量假行。",
    "改用窄条件合并后，仅 1/54 图发生行为变化且为正向，其余输出不变，F1 由 0.6647 升至 0.7319。"
  ],
  "lineByLine": [
    "def safe_merge(lines, ...): 带窄条件的合并。",
    "sorted by b.y: 按垂直位置排序。",
    "overlap_x>same_line_iou and 间隙<=max_v_gap: 仅当强重叠且贴近才合并。",
    "else dropped.append: 不匹配者单独保留，避免错误拼接。"
  ],
  "followUps": [
    {
      "question": "局部 refinement 相比全局降阈值具体怎么做？",
      "answer": "仅对检测器低分但有上下文支撑的候选区域(如邻近高分行)重新用高精度模型或更大分辨率重判，而不是全图统一降阈。"
    },
    {
      "question": "如何验证合并策略改动是安全的？",
      "answer": "在固定验证集(如 54 图)上跑回归测试，确认除目标样本外其余输出逐像素/逐字符不变，仅目标图指标提升。"
    }
  ],
  "followUpAnswers": [
    "仅对检测器低分但有上下文支撑的候选区域(如邻近高分行)重新用高精度模型或更大分辨率重判，而不是全图统一降阈。",
    "在固定验证集(如 54 图)上跑回归测试，确认除目标样本外其余输出逐像素/逐字符不变，仅目标图指标提升。"
  ],
  "invariant": "merged 中相邻元素满足水平重叠>same_line_iou 且垂直间隙<=max_v_gap；未匹配元素全部进入 dropped 不被丢失。",
  "walkthrough": "4 行按 y 排序；行1与行2水平重叠0.7、间隙8≤10→合并；行3与行2间隙40>10→进 dropped；行4独立。最终 merged 含合并行与行4，dropped 含行3。",
  "kind": "code"
};
