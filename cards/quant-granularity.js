export default {
  "kind": "concept",
  "id": "quant-granularity",
  "category": "量化推理",
  "difficulty": "Easy",
  "title": "量化粒度 per-tensor/channel/group",
  "prompt": "量化的粒度 per-tensor、per-channel、per-group 分别是什么？",
  "quickAnswer": "per-tensor 整张量共用一个 scale(最简单但易被 outlier 带偏)；per-channel 每个输出通道独立 scale(权重常用，抗通道间差异)；per-group 把每通道再切成小组各自 scale(INT4 常用，兼顾精度与开销)。粒度越细越耐 outlier，但存储 scale 与 kernel 复杂度越高。",
  "approach": "权重 INT8 用 per-channel，INT4 用 per-group。",
  "explanationFocus": "是什么：量化粒度指\"多少个元素共享同一个缩放因子\"，从整张量到通道到小组逐级变细。",
  "bruteForce": "整模型一个全局 scale，outlier 一出现全崩。",
  "derivation": [
    "为什么需要：张量内不同通道/区段动态范围差异大，单一 scale 会把小范围部分量化得极粗。",
    "怎么实现：per-tensor 一个 s；per-channel 按输出维各一个 s；per-group 如每 128 元素一组各一个 s。",
    "有什么代价：细粒度需为每个 scale 存元数据并查表，kernel 取 s 有开销，scale 数量随粒度指数增。",
    "怎么评测：同比特下比较不同粒度的精度与推理时延，找性价比拐点。"
  ],
  "invariant": "粒度越细精度↑、scale 存储与查表开销↑。",
  "walkthrough": "INT4 用 group=128 时 7B 困惑度明显优于 per-tensor，scale 仅增约 1% 存储。",
  "edgeCases": [
    "group 太小 scale 开销反噬速度。",
    "per-channel 对激活需 per-token 配合。",
    "硬件对 group 大小有对齐要求。"
  ],
  "code": "# Python\ndef quant_groups(w, bits=4, g=128):\n    out, scales = [], []\n    for i in range(0, w.numel(), g):\n        blk = w.flatten()[i:i+g]\n        s = blk.abs().max() / (2**(bits-1)-1)\n        out.append((blk / s).round().clamp(-(2**(bits-1)), 2**(bits-1)-1))\n        scales.append(s)\n    return out, scales                            # 每组独立 scale",
  "codeNotes": [
    "group 大小常取 64/128 以对齐硬件。",
    "per-channel 是 g=整个通道的特例。"
  ],
  "complexity": "O(元素) 量化；scale 数 ∝ 元素/group，查表 O(元素)。",
  "followUps": [
    {
      "question": "per-group 为什么常用于 INT4？",
      "answer": "INT4 码点太少，整通道共享 scale 误差大，分组后局部范围小、精度显著提升，且开销可控。"
    },
    {
      "question": "group 大小怎么选？",
      "answer": "在精度与 scale 存储/查表开销间权衡，64/128 是常见甜点，需结合 kernel 对齐。"
    }
  ],
  "followUpAnswers": [
    "INT4 几乎必用 group。",
    "group=128 常见甜点。"
  ],
  "pitfalls": [
    "全用 per-tensor 导致 outlier 崩。",
    "group 过小拖慢 kernel。"
  ],
  "beginnerSummary": "全班用同一把尺(per-tensor)量高矮会有人量不准；给每个小组发一把尺(per-group)就更贴合。尺越细越准，但发太多尺本身也麻烦——所以要在\"准\"和\"麻烦\"间找平衡。",
  "prerequisites": [
    "scale 决定量化精度。",
    "张量内动态范围不均。",
    "INT4 码点极少。"
  ],
  "workedExample": [
    "per-tensor: 1 个 s 管整矩阵。",
    "per-group g=128: 每 128 元素 1 个 s。"
  ],
  "lineByLine": [
    "决定共享 scale 的元素范围。",
    "在该范围求 max 得 scale。",
    "元素除 scale 取整。",
    "存量化值+各 scale。"
  ],
  "diagram": "per-tensor: [===== 1 scale =====]\nper-channel:[s][s][s]... (每通道)\nper-group:  [s][s] 每128元素"
};
