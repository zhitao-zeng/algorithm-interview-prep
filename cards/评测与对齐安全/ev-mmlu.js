export default {
  "id": "ev-mmlu",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "客观评测基准：MMLU/CMMLU/GSM8K/C-Eval",
  "difficulty": "Medium",
  "prompt": "MMLU、CMMLU、GSM8K、C-Eval 这类客观评测基准是如何设计的？选择题评测有哪些常见陷阱？",
  "quickAnswer": "它们是零样本/少样本下用多选或数学题衡量模型知识与推理能力的静态基准。MMLU/CMMLU/C-Eval 采用四选一（含少量多选）覆盖学科知识，GSM8K 为高小难度多步数学应用题、以最终答案精确匹配判分。常见陷阱包括 few-shot 示例引入顺序偏置、选项字母分布不均导致猜答准确率虚高、CoT 是否允许影响可比性，以及基准污染导致分数失真。",
  "complexity": "O(N) 每题独立评测",
  "beginnerSummary": "客观评测基准就像标准化考试卷：给出题目，模型作答，按标准答案自动判分，用来横向比较不同模型的能力强弱，无需人工评审。",
  "explanationFocus": "是什么：客观评测基准是一组带标准答案的静态题库（多为选择题或精确答案题），通过对固定试题的准确率来量化模型在知识广度和推理能力上的表现，优点是自动化、可复现、低成本。",
  "approach": "核心思路是把能力拆成可自动判分的任务：知识类用多选（MMLU/CMMLU/C-Eval），数学推理用精确匹配（GSM8K）。评测时控制 prompt 格式（zero/few-shot）、是否开 CoT、是否归一化选项，保证不同模型在同一协议下可比；最后报告整体与分学科准确率。",
  "code": "from typing import List\n\ndef accuracy(preds: List[str], golds: List[str]) -> float:\n    # 逐题精确匹配标准答案\n    correct = sum(p.strip().upper() == g.strip().upper() for p, g in zip(preds, golds))\n    return correct / len(golds) if golds else 0.0\n\ndef balanced_acc(preds, golds, labels):\n    # 按选项分布校正随机猜测基线\n    return {l: accuracy([p for p, g in zip(preds, golds) if g == l],\n                         [g for g in golds if g == l]) for l in labels}",
  "derivation": [
    "为什么需要：大模型能力难以用单一指标概括，需要标准化、可复现的考试式 Benchmark 来横向对比与追踪迭代收益。",
    "怎么实现：构建覆盖多学科/多难度的静态题库，统一 prompt 协议（zero/few-shot、是否 CoT），用精确匹配或规则解析模型输出抽取答案后判分。",
    "有什么代价：静态集易被训练数据污染导致分数失真；多选存在随机基线（25%）需校正；分布偏置与格式敏感会放大误差；难以覆盖真实开放任务。",
    "怎么评测：报告整体与各学科准确率，附随机基线、CoT 开关对比、少样本稳定性；结合污染检测（如 n-gram 重叠）与留出的私有集交叉验证。"
  ],
  "edgeCases": [
    "few-shot 示例的学科/语言与试题不一致，造成分布偏移与顺序偏置。",
    "选项字母分布不均（如正确答案偏 A），猜答率高于 25% 使分数虚高。",
    "模型输出不输出单个选项字母（如先解释后给答案），需要稳定解析器抽取。",
    "多选/含图表题（如 C-Eval 部分）需要多模态解析与答案归一。"
  ],
  "pitfalls": [
    "忽略基准污染：用训练语料检索到试题时分数不再可信，却仍当真实能力。",
    "混用协议（有的开 CoT 有的不开）后直接横向对比，得出误导结论。"
  ],
  "prerequisites": [
    "zero-shot / few-shot prompting 与思维链（CoT）基本概念。",
    "分类准确率、随机基线与统计显著性检验。"
  ],
  "workedExample": [
    "MMLU 57 个学科、约 1.5 万题四选一，零样本直接输出选项，报告宏平均准确率。",
    "GSM8K 8.5K 道数学应用题，允许 CoT，仅以末行 '# 答案' 后的数字精确匹配判分。"
  ],
  "lineByLine": [
    "from typing import List：引入类型标注，便于静态检查。",
    "def accuracy(...)：定义逐题精确匹配函数，统一大小写并 strip 空白。",
    "correct = sum(...)：统计预测与金标一致的题数。",
    "def balanced_acc(...)：按标签分组计算各选项子集准确率，校正分布偏置。"
  ],
  "followUps": [
    {
      "question": "如何检测并缓解 Benchmark 污染？",
      "answer": "用 n-gram/embedding 重叠检索训练语料中是否包含试题；采用留出私有集、加入干扰重排题、报告污染比例并剔除污染样本，必要时用动态生成题。"
    },
    {
      "question": "选择题评测时是否应该允许 CoT？",
      "answer": "需固定协议：若比较推理能力可统一开启 CoT，但会增加解析难度与方差；若评知识 recalling 可关闭。关键是所有被比模型同一设置，并报告开关两态。"
    },
    {
      "question": "为什么需要校正随机猜测基线？",
      "answer": "四选一随机基线 25%，若选项分布偏斜猜答率更高；报告『相对随机基线的提升』或『平衡准确率』可更公平反映真实增益。"
    }
  ],
  "followUpAnswers": [
    "用 n-gram/embedding 重叠检索训练语料中是否包含试题；采用留出私有集、加入干扰重排题、报告污染比例并剔除污染样本，必要时用动态生成题。",
    "需固定协议：若比较推理能力可统一开启 CoT，但会增加解析难度与方差；若评知识 recalling 可关闭。关键是所有被比模型同一设置，并报告开关两态。",
    "四选一随机基线 25%，若选项分布偏斜猜答率更高；报告『相对随机基线的提升』或『平衡准确率』可更公平反映真实增益。"
  ],
  "order": 1
};
