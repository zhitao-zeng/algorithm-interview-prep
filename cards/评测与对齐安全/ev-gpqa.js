export default {
  "id": "ev-gpqa",
  "category": "评测与对齐安全",
  "difficulty": "Hard",
  "title": "GPQA 研究生级评测",
  "prompt": "GPQA 作为研究生级、谷歌都无法搜到答案的评测，应该如何正确解读它的分数？",
  "quickAnswer": "GPQA 是高难度自然科学问答集，题目由领域专家编写且刻意\"防搜索\"，分数低不代表模型无用，而高分说明模型具备接近专家的多步科学推理能力；解读时必须报告子集、置信区间与人工复核方式。",
  "approach": "从\"题目来源、抗搜索设计、难度分布、解读陷阱\"入手，强调 GPQA 衡量的是研究生级推理而非通用知识，并用 Diamond 子集做可复现对比。",
  "explanationFocus": "是什么：GPQA 是研究生级、谷歌-proof 的问答基准，包含生物、物理、化学约 448 道高难度选择题，专为测试模型在无法靠检索时的深层科学推理而设计。",
  "bruteForce": "朴素做法是把所有 GPQA 题目塞进搜索引擎或知识库检索答案再回填，但 GPQA 题目经过\"抗搜索\"改写，直接检索几乎无效，反而测的是检索而非推理。",
  "invariant": "分数必须配对说明所用子集（Main/Diamond）与解码设置，否则不同论文的 GPQA 数字不可直接比较。",
  "walkthrough": "先选定 GPQA-Diamond 子集；用专家级 CoT 提示调用模型；对每题抽取最终选项；统计准确率并给出 bootstrap 置信区间；最后与领域博士的基线对照。",
  "complexity": "以高成本推理调用为主：每题常需长 CoT，单次评测约数百次调用，且常配合多次采样取共识，开销随采样数线性增长。",
  "beginnerSummary": "GPQA 是一堆连谷歌都难搜到答案的\"博士级\"科学题，专门考模型是不是真会推理；分数低很正常，关键看它和高手差距多大。",
  "diagram": "+----------+   anti-search   +-------------+\n| experts  |  ------------>  | GPQA items  |\n+----------+                +-------------+\n      |                           |\n      v                           v\n PhD baseline               model CoT eval\n      |                           |\n      +---------- compare --------+",
  "code": "def eval_gpqa(model, items, k=4):\n    hits = 0\n    for it in items:\n        votes = [model.cot(it) for _ in range(k)]\n        if majority(votes) == it.gold:\n            hits += 1\n    return hits / len(items)",
  "derivation": [
    "为什么需要：现有基准题目可被搜索引擎轻松解答，无法检验模型在\"无外援\"下的真实科学推理深度。",
    "怎么实现：由领域 PhD 编写并互审题目，刻意去除可检索线索，形成 Main 与 Diamond 子集供不同成本评测。",
    "有什么代价：题目量小导致方差大，需多次采样与 bootstrap；标注昂贵，且对解码温度和提示极敏感。",
    "怎么评测：报告子集准确率、与博士基线的差距及置信区间，避免用单次采样数字下结论。"
  ],
  "edgeCases": [
    "Diamond 子集仅约 198 题，单次评测方差大，需用 bootstrap 报告区间。",
    "题目含专业符号，纯文本评测可能误读上下标导致错判。",
    "多次采样取多数投票会显著抬高分数，须注明采样数 k。",
    "非英语题目翻译可能改变科学语义，影响公平性。"
  ],
  "pitfalls": [
    "把 GPQA 低分等同于\"模型很差\"是误读，它本就远超通用助手难度。",
    "跨论文比较时忽略子集与采样数差异，会得出虚假的\"进步\"。"
  ],
  "prerequisites": [
    "理解多项选择题评测与准确率指标的基本含义。",
    "了解 bootstrap 重采样估计置信区间的思路。"
  ],
  "workedExample": [
    "场景一：模型在 GPQA-Diamond 单次采样得 38%，博士基线约 65%，说明仍有明显差距但已超随机。",
    "场景二：k=8 多数投票后升至 46%，说明自一致性可补强推理，但须如实报告 k。"
  ],
  "lineByLine": [
    "def eval_gpqa(model, items, k=4): 定义评测函数，k 为每题采样次数。",
    "votes = [model.cot(it) for _ in range(k)] 对单题做 k 次思维链采样。",
    "if majority(votes) == it.gold: 取多数票与标准答案比较。",
    "hits += 1 命中则计数。",
    "return hits / len(items) 返回子集准确率。"
  ],
  "codeNotes": [
    "majority() 实现自一致性投票，是提升 GPQA 这类难题准确率常用的轻量策略。"
  ],
  "followUps": [
    {
      "question": "为什么 GPQA 要设计成\"谷歌搜不到答案\"？",
      "answer": "目的是排除检索捷径，逼迫模型依靠内部化的科学推理而非外部知识库来解题，从而更真实衡量推理能力。"
    },
    {
      "question": "GPQA 分数和 MMLU-Pro 分数能否直接比高低？",
      "answer": "不能，二者难度来源不同：GPQA 强调无外援深度推理且题量小方差大，MMLU-Pro 强调广学科推理，应分别解读。"
    }
  ],
  "followUpAnswers": [
    "目的是排除检索捷径，逼迫模型依靠内部化的科学推理而非外部知识库来解题，从而更真实衡量推理能力。",
    "不能，二者难度来源不同：GPQA 强调无外援深度推理且题量小方差大，MMLU-Pro 强调广学科推理，应分别解读。"
  ],
  "kind": "concept"
};
