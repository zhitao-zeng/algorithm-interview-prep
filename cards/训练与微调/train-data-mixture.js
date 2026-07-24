export default {
  "kind": "concept",
  "id": "train-data-mixture",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "预训练数据配比与质量过滤",
  "prompt": "预训练语料中网页、书籍、代码等数据应如何配比并做质量过滤？",
  "quickAnswer": "常用网页(CommonCrawl)为主、搭配书籍/代码/学术等多源配比，并以分类器打分、去噪、语言/毒性过滤提升质量。",
  "approach": "先按数据源定比例（如网页~60-70%、书籍~15%、代码~10-15%），再用质量分类器与启发式规则剔除低质文本。",
  "explanationFocus": "是什么：预训练数据配比指在混合语料中给各来源（网页、书籍、代码、对话、学术）分配权重；质量过滤是用规则或模型剔除噪声、重复、低信息量文本，直接决定模型能力上限。",
  "bruteForce": "直接把原始 CommonCrawl 全量喂入，含大量 spam、机器翻译、重复页，训练损失与下游质量都差，且浪费算力。",
  "derivation": [
    "为什么需要：不同来源覆盖不同能力（代码提升推理、书籍提升长文连贯），且原始网页噪声极大需清洗。",
    "怎么实现：人工设定配比（参考 The Pile / RedPajama），用 fastText 语言识别、质量分类器（如 GPT-3 评分回训）、去噪规则过滤。",
    "有什么代价：配比与过滤阈值是强超参，调错会偏科；高质量来源（书籍）有限，过度依赖会数据耗尽。",
    "怎么评测：在下游基准（MMLU、HumanEval）与困惑度上做消融，观察配比变化带来的能力涨跌。"
  ],
  "invariant": "质量优先于数量；配比要覆盖目标能力维度，避免单一来源主导（建议二次核对各模型公开配比）。",
  "walkthrough": "LLaMA 系列：网页(CommonCrawl 去重后)约 80%+，加 C4、GitHub、书籍、Wikipedia、arXiv 等；代码占比约 10-15% 以保代码能力。",
  "edgeCases": [
    "低资源语言数据稀少，配比需上采样否则能力崩塌",
    "代码占比过高可能削弱自然语言流畅度",
    "过滤阈值过严导致高质量数据不足、语料枯竭"
  ],
  "code": "def quality_filter(text, scorer, threshold=0.5):\n    # 用训练好的质量分类器过滤低质文本\n    if scorer is None:\n        return len(text) > 50 and not is_spam(text)\n    return scorer(text) >= threshold",
  "codeNotes": [
    "scorer 常用『用高质量数据训练二分类器』或调用强模型打分蒸馏",
    "阈值需配合配比在验证集上联合调参"
  ],
  "complexity": "批量过滤为 O(语料量 × 单条打分)，可用多进程流式处理。",
  "followUps": [
    {
      "question": "为什么不直接用全部网页数据？",
      "answer": "原始 CommonCrawl 含大量 SEO 垃圾、机器翻译、重复与低信息页，会拉高损失并污染能力，需去噪与质量打分。"
    },
    {
      "question": "配比能否自动学习？",
      "answer": "可基于下游任务做 DoReMi 式数据重加权，用小模型代理搜索最优配比后再迁移到大模型。"
    }
  ],
  "followUpAnswers": [
    "原始 CommonCrawl 含大量 SEO 垃圾、机器翻译、重复与低信息页，会拉高损失并污染能力，需去噪与质量打分。",
    "可基于下游任务做 DoReMi 式数据重加权，用小模型代理搜索最优配比后再迁移到大模型。"
  ],
  "pitfalls": [
    "用强模型打分过滤会引入模型自身偏见",
    "过度依赖网页会导致书籍/代码等稀缺高质量源被稀释"
  ],
  "beginnerSummary": "给大模型『喂书』不能只逮网页全塞进去，要像配营养餐：网页多但杂、书籍精、代码补逻辑，并先挑掉馊掉的内容。",
  "prerequisites": [
    "语料来源知识",
    "文本分类器",
    "困惑度/下游评测"
  ],
  "workedExample": [
    "设定配比：网页 65%、书籍 15%、代码 12%、学术 8%",
    "对每条文本跑质量分类器，score<0.5 丢弃，最终保留约 1.4T token"
  ],
  "lineByLine": [
    "def quality_filter(text, scorer, threshold=0.5): 定义过滤接口",
    "无 scorer 时退化为长度+spam 启发式规则",
    "return scorer(text) >= threshold：用模型分数做硬阈值过滤"
  ],
  "diagram": "原始语料\n ┌────┬────┬────┐\n │网页│书籍│代码│\n └─┬──┴─┬──┴─┬─┘\n 去噪→打分→配比混合→训练"
};
