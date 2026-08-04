export default {
  "id": "ocr-det-rec-decouple",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "检测与识别解耦及 GT-crop Oracle 定位瓶颈",
  "prompt": "在 OCR 系统优化中，如何用 GT-crop Oracle 实验区分检测与识别的瓶颈，避免无效升级 recognizer？",
  "quickAnswer": "用真值框(GT)裁剪图像直接喂给识别器，得到识别性能上限；用检测器输出框裁剪识别后对比差距，差距即检测引入的错误，从而优先优化瓶颈所在模块。",
  "code": "def gt_crop_oracle_evaluate(det_boxes, gt_boxes, images, recognizer):\n    \"\"\"用 GT 框 vs 检测框分别裁剪送识别器，量化瓶颈来源\"\"\"\n    n = len(images)\n    det_correct = gt_correct = 0\n    for img, db, gb in zip(images, det_boxes, gt_boxes):\n        det_correct += int(recognizer.predict(crop(img, db)) == img.truth)\n        gt_correct  += int(recognizer.predict(crop(img, gb)) == img.truth)\n    return {\"det_f1\": det_correct / n, \"gt_oracle_f1\": gt_correct / n}\n",
  "complexity": "时间 O(N·T)，空间 O(1)（T 为单图识别耗时）",
  "beginnerSummary": "就像先用“标准答案的位置”把字切出来让识字的同学读，看他最多能读对多少；如果标准位置下也读不对，是识字能力问题，否则是切位置的人框歪了。",
  "derivation": [
    "为什么需要：端到端 OCR 变慢变错时，难以判断是检测框不准还是识别器太弱，盲目升级识别器可能无效。",
    "怎么实现：用真值框(ground-truth)裁剪图像作为 oracle 输入，绕过检测器直接评估识别器上限，再与检测器框裁剪结果对比。",
    "有什么代价：需要高质量标注真值框，且 oracle 只给出理论上限，不反映检测器真实分布下的长尾错误。",
    "怎么评测：对比 det_f1 与 gt_oracle_f1 的差距，差距大说明瓶颈在检测，差距小说明瓶颈在识别。"
  ],
  "edgeCases": [
    "检测器漏检导致 det_boxes 为空",
    "GT 框与图像分辨率缩放不一致",
    "弯曲文本 GT 为多边形而检测输出为矩形",
    "真值标注本身存在错误"
  ],
  "pitfalls": [
    "把 GT-crop 上限当成识别器线上可达性能",
    "仅用准确率忽略检测框错位带来的字符割裂"
  ],
  "prerequisites": [
    "文本检测基础",
    "文本识别基础",
    "端到端评测指标"
  ],
  "workedExample": [
    "取 1000 张验证集，用 GT 多边形裁剪送 CRNN，得到 gt_oracle_f1=0.95。",
    "同一批图用 DBNet 输出框裁剪送同一 CRNN，得到 det_f1=0.82，差值 0.13 即检测瓶颈。"
  ],
  "lineByLine": [
    "def gt_crop_oracle_evaluate(...): 定义对比评估函数。",
    "for img, db, gb in zip(...): 逐图配对检测框与真值框。",
    "recognizer.predict(crop(img, db)): 用检测框裁剪并识别，统计正确数。",
    "return 返回检测框与 GT-crop 两种 F1，便于横向对比。"
  ],
  "followUps": [
    {
      "question": "如果 gt_oracle_f1 也很低但检测框 IoU 很高，可能是什么问题？",
      "answer": "说明识别器本身能力不足或存在领域分布偏移（如字体/语言域不同），此时才应升级 recognizer 或做领域微调。"
    },
    {
      "question": "GT-crop Oracle 能否用于训练阶段？",
      "answer": "可作为课程学习或难例挖掘的参考——用检测框与 GT 框差异大的样本优先送识别器做对齐训练，但需注意分布偏差。"
    },
    {
      "question": "弯曲文本下矩形检测框裁剪会引入背景噪声，如何改进对比？",
      "answer": "用 GT 多边形掩膜裁剪(polygon mask crop)与检测多边形输出对齐，保证裁剪区域语义一致后再对比。"
    }
  ],
  "followUpAnswers": [
    "说明识别器本身能力不足或存在领域分布偏移（如字体/语言域不同），此时才应升级 recognizer 或做领域微调。",
    "可作为课程学习或难例挖掘的参考——用检测框与 GT 框差异大的样本优先送识别器做对齐训练，但需注意分布偏差。",
    "用 GT 多边形掩膜裁剪(polygon mask crop)与检测多边形输出对齐，保证裁剪区域语义一致后再对比。"
  ],
  "invariant": "每轮迭代后 det_correct 与 gt_correct 分别代表前 i 张图用检测框与真值框裁剪识别的正确累计数。",
  "walkthrough": "设 3 张图真值全对：第1张检测框歪→det错 gt对；第2张都对；第3张检测框缺半字→det错 gt对。累计 det_correct=1, gt_correct=3，n=3 → det_f1=0.33, gt_oracle_f1=1.0，差距大→瓶颈在检测。",
  "kind": "code"
};
