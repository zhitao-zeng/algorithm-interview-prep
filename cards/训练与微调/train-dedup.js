export default {
  "kind": "concept",
  "id": "train-dedup",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "去重（精确/语义）对预训练的影响",
  "prompt": "预训练中的精确去重与语义去重分别怎么做，对训练有何影响？",
  "quickAnswer": "精确去重用哈希（如 MinHash/后缀数组）删重复文档；语义去重用 embedding 聚簇删近重复；可显著降低记忆与过拟合。",
  "approach": "先以文档/段落级哈希做精确去重，再用句子 embedding 近邻聚类消除语义近似重复，减少数据泄漏与基准污染。",
  "explanationFocus": "是什么：去重是在预训练前移除完全重复（精确去重，如相同文档哈希）与近似重复（语义去重，如 paraphrase、模板生成）的样本，避免模型记忆与基准污染。",
  "bruteForce": "不做去重直接训练，同一网页被抓多次会反复出现，模型过拟合这些样本、记住隐私/基准答案，且浪费算力。",
  "derivation": [
    "为什么需要：CommonCrawl 中同一内容常出现数十次，重复样本抬高有效 epoch 数并导致数据泄漏。",
    "怎么实现：精确去重用 SHA-256/MinHash+LSH 按文档或 50-token 窗口分块；语义去重用 SBERT embedding 做近邻聚簇。",
    "有什么代价：MinHash 需扫描全语料建索引，内存与 I/O 大；语义去重需 embedding 推理，成本高且阈值敏感。",
    "怎么评测：统计唯一文档比例、在保留基准上测污染率（如 C4 去重后基准得分变化），观察记忆化指标下降。"
  ],
  "invariant": "先精确后语义、由便宜到贵；去重是预训练标准前置步骤，不可跳过（建议二次核对具体阈值）。",
  "walkthrough": "C4 流程：对 50-token 滑动窗口算哈希，文档内 90% 窗口与已见重复则丢弃；可减少数倍重复量，困惑度下降。",
  "edgeCases": [
    "合法重复（如许可证、常引用段落）也可能被误删",
    "语义去重阈值过严会删掉有用的近义多样表述",
    "多语言下哈希与 embedding 需按语言分别处理"
  ],
  "code": "import hashlib\ndef exact_dedup(docs):\n    seen = set()\n    out = []\n    for d in docs:\n        h = hashlib.sha256(d.encode()).hexdigest()\n        if h not in seen:\n            seen.add(h); out.append(d)\n    return out",
  "codeNotes": [
    "生产常用 MinHash+LSH 做近似级精确去重以省内存",
    "窗口级（而非整文档）去重对网页更有效"
  ],
  "complexity": "精确去重 O(语料量)；MinHash 近似为亚线性，语义去重加 O(N·嵌入维度)。",
  "followUps": [
    {
      "question": "去重会影响下游基准公平性吗？",
      "answer": "会；若测试集与训练集重复，模型『背答案』虚高，去重正是为降低这种污染。"
    },
    {
      "question": "语义去重和精确去重怎么选？",
      "answer": "先用便宜的精确去重清重复，再用语义去重清 paraphrase/模板近重复，二者互补。"
    }
  ],
  "followUpAnswers": [
    "会；若测试集与训练集重复，模型『背答案』虚高，去重正是为降低这种污染。",
    "先用便宜的精确去重清重复，再用语义去重清 paraphrase/模板近重复，二者互补。"
  ],
  "pitfalls": [
    "过度去重可能误删合法复用文本（许可、引用）",
    "仅靠哈希忽略近义重复，污染仍在"
  ],
  "beginnerSummary": "训练前先把『抄来的相同文章』和『换汤不换药的近似文章』清掉，否则模型只是背答案、还容易泄露测试题。",
  "prerequisites": [
    "哈希与 MinHash",
    "文本 embedding",
    "数据泄漏概念"
  ],
  "workedExample": [
    "对 1M 文档算 SHA-256，发现 12% 完全重复并删除",
    "再用 embedding 近邻聚类删掉 5% 语义近似文档"
  ],
  "lineByLine": [
    "seen = set()：记录已见文档哈希",
    "h = hashlib.sha256(d.encode()).hexdigest()：整文档指纹",
    "若未见则保留，实现精确去重"
  ],
  "diagram": "语料 → [哈希去重] → 唯一集 → [embedding 近邻] → 近重复簇合并"
};
