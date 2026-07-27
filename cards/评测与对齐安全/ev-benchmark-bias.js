export default {
  "id": "ev-benchmark-bias",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "评测偏置与数据泄漏",
  "difficulty": "Medium",
  "prompt": "什么是 benchmark contamination 和评测集过拟合？如何发现并缓解评测偏置与数据泄漏？",
  "quickAnswer": "Benchmark contamination 指训练数据意外包含评测题，使分数虚高且不可信；评测集过拟合是反复拿同一测试集调参导致泛化误判。偏置还包括文化/语言倾斜、题目分布不均。发现靠 n-gram/embedding 检索重叠、留私有集、对抗重排；缓解靠动态题、去重、污染报告与多基准交叉验证。",
  "complexity": "O(D·N) 检索重叠",
  "beginnerSummary": "数据泄漏就像考试前泄题：模型『背过答案』所以考分高，但这不代表真懂。评测偏置则是考题本身不公平或太单一。",
  "explanationFocus": "是什么：评测偏置与数据泄漏指评测结果因训练数据包含试题（contamination）或反复在同测试集上调优（过拟合）而失真，以及题库在语言/文化/分布上不均衡导致的系统性偏差。",
  "approach": "检测 contamination 用训练语料与试题的 n-gram/embedding 重叠检索与会员题重测；缓解用留出私有集、动态生成题、去重。对过拟合用时间切分/多基准正交验证；对偏置做分层报告与多语种/多文化补充，避免单一榜决定论。",
  "code": "def contamination_rate(corpus, test_items, n=5):\n    # 统计测试项被语料 n-gram 覆盖的比例\n    covered = 0\n    for item in test_items:\n        grams = set(item[i:i+n] for i in range(len(item)-n+1))\n        if grams & corpus:\n            covered += 1\n    return covered / len(test_items)",
  "derivation": [
    "为什么需要：泄漏与偏置让排行榜失去公信，误导选型与研发方向。",
    "怎么实现：构建语料-试题重叠检测、会员题/重排题复测、时间外推验证与分层偏差分析。",
    "有什么代价：彻底去重成本高；动态题可能被逆向泄露；多基准增加评测负担。",
    "怎么评测：报告污染比例、留集表现差（泄漏信号）、跨基准一致性作为健康度指标。"
  ],
  "edgeCases": [
    "题目经翻译/改写后仍能语义匹配训练语料。",
    "同一知识点不同表述反复出现造成隐性过拟合。",
    "英文榜强但低资源语言崩，掩盖偏置。",
    "评测集被公开后间接进入后续训练。"
  ],
  "pitfalls": [
    "用公开榜反复调参却宣称泛化能力。",
    "只看总分忽略分项偏置，选错模型。"
  ],
  "prerequisites": [
    "n-gram/embedding 相似度检索。",
    "训练/测试分布独立与泛化概念。"
  ],
  "workedExample": [
    "GPT-4 发布时多家做污染分析，用会员题复测以区分真实能力。",
    "某模型在公开 MMLU 微调后分数飙升，但留出私有题掉 10 点，暴露泄漏。"
  ],
  "lineByLine": [
    "def contamination_rate(...)：定义污染率检测函数。",
    "grams = set(...)：对试题取 n-gram 集合。",
    "if grams & corpus：语料命中任意 n-gram 即视为覆盖。",
    "return covered/len：返回被覆盖试题占比即污染率。"
  ],
  "followUps": [
    {
      "question": "如何区分『真能力提升』与『泄漏导致的虚高』？",
      "answer": "用留出私有集、会员题/重排题复测、以及时间外推（训练截止后的新题）；若公开集高而留集低、或新题掉点明显，则虚高由泄漏造成。"
    },
    {
      "question": "评测集过拟合和训练过拟合有何不同？",
      "answer": "训练过拟合是模型记训练样本；评测集过拟合是开发者反复拿测试集调超参/选模型，等效把测试信息泄露进决策，导致线下估计乐观、线上泛化差。"
    }
  ],
  "followUpAnswers": [
    "用留出私有集、会员题/重排题复测、以及时间外推（训练截止后的新题）；若公开集高而留集低、或新题掉点明显，则虚高由泄漏造成。",
    "训练过拟合是模型记训练样本；评测集过拟合是开发者反复拿测试集调超参/选模型，等效把测试信息泄露进决策，导致线下估计乐观、线上泛化差。"
  ]
};
