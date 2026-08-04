export default {
  "id": "asr-pseudo-label",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "带噪标签学习与伪标签质量闭环",
  "prompt": "在西语 10k 抽样中发现 8.2% 真实标签噪声时，如何用 Qwen3-ASR 重标注构建可验证的带噪学习闭环？",
  "quickAnswer": "在西语 10k 抽样发现 8.2% 标签噪声时，用 Qwen3-ASR 重标注并以置信度、原标注一致性与回灌训练控制伪标签质量，把“换标签”转为可验证的带噪学习闭环。",
  "code": "def relabel_decision(orig: str, pred: str, conf: float, threshold: float = 0.9) -> str:\n    \"\"\"以置信度与原标注一致性控制伪标签质量：高置信且一致则保留，否则回灌重训。\"\"\"\n    if conf >= threshold and pred == orig:\n        return orig\n    return pred if conf >= threshold else orig",
  "complexity": "时间 O(1)（单条）/ O(N)（全量重标），空间 O(1)",
  "beginnerSummary": "老师改卷也会看走眼，我们让更靠谱的“学霸模型”复查，只采纳它很有把握且和原答案一致的部分。",
  "derivation": [
    "为什么需要：西语 10k 抽样人工核对发现 8.2% 真实标签噪声，脏标签直接训练会污染模型，需可验证的清洗闭环。",
    "怎么实现：用 Qwen3-ASR 对数据重标注，结合置信度、与原标注一致性决定是否采纳新标签，并把采纳样本回灌训练，形成“重标→筛选→训练”闭环。",
    "有什么代价：重标注与置信度计算增加算力；若 Qwen3-ASR 自身在某些域有偏，会被放大进伪标签。",
    "怎么评测：人工抽查子系统验证伪标签准确率，并以独立验证集 CER 是否稳定下降判定闭环有效。"
  ],
  "edgeCases": [
    "Qwen3-ASR 与原有标注都不对的样本（双错），筛选逻辑无法纠正，需人工兜底。",
    "低资源口音下置信度虚高，误把错标签当高置信采纳。",
    "原标注一致但两者都错（系统性标注错误），回灌会固化错误。",
    "全量重标 10k 成本，需分批回灌避免训练抖动。"
  ],
  "pitfalls": [
    "阈值设过高导致几乎不换标签，清洗无效；设过低则引入新噪声。",
    "把“换标签比例”当目标，忽视独立验证集 CER，可能越洗越差。"
  ],
  "prerequisites": [
    "伪标签（pseudo-labeling）与自训练",
    "模型置信度校准",
    "带噪学习基础"
  ],
  "workedExample": [
    "步骤1：用 Qwen3-ASR 对西语 10k 重标，记录每条置信度与与原标签是否一致。",
    "步骤2：conf≥0.9 且与原标签一致保留，conf≥0.9 但不一致采纳新标签，其余保留原标签。",
    "步骤3：把采纳新标签的样本回灌训练，独立验证集 CER 持续下降即闭环有效。"
  ],
  "lineByLine": [
    "def relabel_decision(orig, pred, conf, threshold=0.9): 定义重标决策，输入原标签、预测、置信度与阈值。",
    "if conf >= threshold and pred == orig: 高置信且与原标注一致，原标签可信。",
    "return orig 一致情形直接保留原标签，避免无谓改写。",
    "return pred if conf >= threshold else orig 高置信采纳新标签，否则保留原标签以控噪。"
  ],
  "followUps": [
    {
      "question": "8.2% 噪声是怎么估计出来的？",
      "answer": "在 10k 西语抽样上做人工核对，统计与原标注不符且经复听确认错误的比例，得到 8.2% 作为噪声上界估计。"
    },
    {
      "question": "置信度从哪里来？",
      "answer": "来自 Qwen3-ASR 解码时的 token 级对数概率归一化或内部置信模块，需先做校准再用于阈值筛选。"
    }
  ],
  "followUpAnswers": [
    "在 10k 西语抽样上做人工核对，统计与原标注不符且经复听确认错误的比例，得到 8.2% 作为噪声上界估计。",
    "来自 Qwen3-ASR 解码时的 token 级对数概率归一化或内部置信模块，需先做校准再用于阈值筛选。"
  ],
  "invariant": "relabel_decision 对任意输入恒返回 orig 或 pred 之一，不会产出第三值；高置信一致时必返回 orig。",
  "walkthrough": "输入 orig='hola', pred='hola', conf=0.95 → 命中高置信一致分支返回 'hola'；若 pred='ola'、conf=0.92 → 采纳 'ola'；若 conf=0.6 → 保留 'hola'。",
  "kind": "code"
};
