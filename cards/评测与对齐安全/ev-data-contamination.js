export default {
  "id": "ev-data-contamination",
  "category": "评测与对齐安全",
  "difficulty": "Hard",
  "title": "数据污染检测",
  "prompt": "如何检测预训练或评测数据是否被测试集污染，从而保证评测分数可信？",
  "quickAnswer": "数据污染检测常用 n-gram 重叠、Canary 标记字符串、成员推断与困惑度异常四类方法：先量化训练数据与测试集的文本重合，再用受控实验（如打乱选项或加标记）观察分数突变，从而判断并估计污染程度。",
  "approach": "从\"重叠度量、受控实验、成员推断、困惑度信号\"四条路线说明：先算训练集与测试集的 n-gram/embedding 重合，再用 Canary 与ablatoion 实验定位影响，最后用困惑度与成员推断量化泄露。",
  "explanationFocus": "是什么：数据污染指评测样本或其近似版本出现在训练数据中，使分数虚高；数据污染检测就是用量化与受控实验判断并估计这种泄露程度，保障评测可信。",
  "bruteForce": "最朴素的做法是相信\"评测集公开但模型没看过\"，但现代大模型训练语料多来自网络爬取，公开榜单极易被无意纳入，不检测就默认干净是危险的。",
  "invariant": "污染判定必须基于可复现的重叠度量或受控实验，而非主观怀疑；同一度量在不同随机种子下结论应一致。",
  "walkthrough": "先对训练语料做去重与索引；用 n-gram/MinHash 计算与测试集重叠率；插入 Canary 字符串观察模型是否复述；做选项打乱与样例丢弃的 ablation 看分数跌落；最后用困惑度与成员推断估计泄露强度。",
  "complexity": "以大规模语料检索与受控重训为主：MinHash 索引需扫描数十 TB 文本，消融实验常需多次重训小模型，成本随语料规模线性增长。",
  "beginnerSummary": "数据污染就是\"考试题提前泄进复习资料\"，检测就是查训练和考题重合多少，再做些\"把选项打乱看分数掉多少\"的实验来证实。",
  "diagram": "train corpus --> index (MinHash)\ntest set     --> overlap ratio\n      |\n   canary probe + ablation\n      |\n   contamination estimate",
  "code": "def ngram_overlap(train_texts, test_texts, n=13):\n    train_set = build_ngrams(train_texts, n)\n    hits = 0\n    for t in test_texts:\n        if any(gram in train_set for gram in ngrams(t, n)):\n            hits += 1\n    return hits / len(test_texts)",
  "derivation": [
    "为什么需要：若测试题出现在训练数据里，分数会虚高且不反映泛化，必须量化污染才能可信解读榜单。",
    "怎么实现：用 n-gram/MinHash 度量训练与测试文本重叠，并插入 Canary 标记、做选项打乱等受控实验定位影响。",
    "有什么代价：全量语料检索与去重算力巨大；受控重训昂贵；近似重叠可能误报需人工确认。",
    "怎么评测：报告重叠率、Canary 复述率与 ablation 分数跌落幅度，综合估计污染程度并标注结论。"
  ],
  "edgeCases": [
    "测试题经同义改写后 n-gram 不重叠，但语义仍泄露，需 embedding 级检测。",
    "训练语料未留存时无法做直接重叠，只能靠困惑度间接推断。",
    "短题目本身 n-gram 命中属正常，需设阈值避免误报。",
    "Canary 字符串若被分词打碎，探针可能漏检。"
  ],
  "pitfalls": [
    "仅凭公开榜单就默认无污染，忽视网络爬取语料的泄露风险。",
    "只用单一 n-gram 阈值，忽略语义级与改写级污染。"
  ],
  "prerequisites": [
    "理解 n-gram、MinHash 等文本去重与重叠度量方法。",
    "了解成员推断与困惑度作为泄露信号的基本直觉。"
  ],
  "workedExample": [
    "场景一：13-gram 重叠率 8%，选项打乱后分数跌 11 分，提示存在明显污染。",
    "场景二：插入 Canary 串后模型原样复述 3 次，证实训练语料含该评测站内容。"
  ],
  "lineByLine": [
    "def ngram_overlap(train_texts, test_texts, n=13): 计算测试集被训练覆盖的比例。",
    "train_set = build_ngrams(train_texts, n) 把训练文本转成 n-gram 集合。",
    "for t in test_texts: 遍历每条测试样本。",
    "if any(gram in train_set ...): 任一元 n-gram 命中即判重叠。",
    "hits += 1 累计被污染的测试题。",
    "return hits / len(test_texts) 返回污染率。"
  ],
  "codeNotes": [
    "n=13 是常见经验值，太短易误报、太长易漏报，需按题目长度调参。"
  ],
  "followUps": [
    {
      "question": "除了 n-gram 重叠，还有什么信号提示污染？",
      "answer": "可用 Canary 标记复述、选项打乱后分数骤降的 ablation、以及测试题困惑度异常偏低等信号交叉验证污染。"
    },
    {
      "question": "训练语料已删除无法检索时怎么办？",
      "answer": "只能间接推断：用困惑度异常、成员推断探针与受控重训对比，虽不如直接重叠精确但仍能估计泄露强度。"
    }
  ],
  "followUpAnswers": [
    "可用 Canary 标记复述、选项打乱后分数骤降的 ablation、以及测试题困惑度异常偏低等信号交叉验证污染。",
    "只能间接推断：用困惑度异常、成员推断探针与受控重训对比，虽不如直接重叠精确但仍能估计泄露强度。"
  ],
  "kind": "concept"
};
